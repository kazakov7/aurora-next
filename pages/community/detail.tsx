import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CommunityDetailBreadcrumb from '../../libs/components/community/detail/CommunityDetailBreadcrumb';
import CommunityDetailHeader from '../../libs/components/community/detail/CommunityDetailHeader';
import CommunityDetailMedia from '../../libs/components/community/detail/CommunityDetailMedia';
import CommunityDetailBody from '../../libs/components/community/detail/CommunityDetailBody';
import CommunityDetailEngagementBar from '../../libs/components/community/detail/CommunityDetailEngagementBar';
import CommunityDetailComments from '../../libs/components/community/detail/CommunityDetailComments';
import CommunityDetailRelated from '../../libs/components/community/detail/CommunityDetailRelated';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Direction } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

const categoryLabelMap: Record<string, { label: string; key: string }> = {
	TOUR: { label: 'Itineraries', key: 'itineraries' },
	HOTEL: { label: 'Hotel Reviews', key: 'hotel-reviews' },
	DESTINATION: { label: 'Photography', key: 'photography' },
	GUIDE: { label: 'Travel Tips', key: 'expeditions' },
	NEWS: { label: 'Local Insights', key: 'insights' },
};

const CommunityDetailPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [articleId, setArticleId] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			return params.get('id') || '';
		}
		return '';
	});

	const [article, setArticle] = useState<BoardArticle | null>(null);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [likeCount, setLikeCount] = useState<number>(0);
	const [commentsCount, setCommentsCount] = useState<number>(0);

	/** ROUTE PARAMS **/
	useEffect(() => {
		if (router.isReady) {
			const id = router.query.id as string;
			if (id && id !== articleId) {
				setArticleId(id);
			}
		}
	}, [router.isReady, router.query.id, articleId]);

	/** INITIAL SEED / FALLBACK IF DIRECT VISIT TO /community/detail **/
	const { data: initialListData } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-first',
		variables: {
			input: {
				page: 1,
				limit: 1,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {},
			},
		},
		skip: !!articleId,
	});

	useEffect(() => {
		if (!articleId && initialListData?.getBoardArticles?.list?.[0]?._id) {
			setArticleId(initialListData.getBoardArticles.list[0]._id);
		}
	}, [articleId, initialListData]);

	/** 1. PRIMARY QUERY: GET_BOARD_ARTICLE **/
	const { data, loading, refetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { articleId: articleId },
		skip: !articleId,
	});

	/** 2. MUTATION: LIKE_TARGET_ARTICLE **/
	const [likeTargetArticle] = useMutation(LIKE_TARGET_ARTICLE);

	useEffect(() => {
		if (data?.getBoardArticle) {
			const art: BoardArticle = data.getBoardArticle;
			setArticle(art);
			setLikeCount(art.articleLikes || 0);
			setCommentsCount(art.articleComments || 0);
			const meLiked = art.meLiked && art.meLiked.length > 0 ? art.meLiked[0].myFavorite : false;
			setIsLiked(!!meLiked);
		}
	}, [data]);

	/** HANDLERS **/
	const handleLike = async () => {
		if (!user?._id) {
			sweetMixinErrorAlert('Please login first to like this article!');
			return;
		}
		if (!article?._id) return;

		try {
			const nextLiked = !isLiked;
			setIsLiked(nextLiked);
			setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

			const res = await likeTargetArticle({
				variables: { input: article._id },
			});

			if (res?.data?.likeTargetArticle?.articleLikes !== undefined) {
				setLikeCount(res.data.likeTargetArticle.articleLikes);
			}

			sweetTopSmallSuccessAlert(nextLiked ? 'Liked story!' : 'Unliked story');
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Error occurred while liking');
			refetch();
		}
	};

	const handleScrollToComments = () => {
		const el = document.getElementById('comments-section');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const catInfo =
		article?.articleCategory && categoryLabelMap[article.articleCategory]
			? categoryLabelMap[article.articleCategory]
			: { label: 'Travel Tips', key: 'expeditions' };

	return (
		<div className="community-detail-page-wrapper">
			<Head>
				<title>
					{article?.articleTitle
						? `${article.articleTitle} — AURA Travel Community`
						: 'Community Story — AURA Travel'}
				</title>
				<meta
					name="description"
					content={
						article?.articleContent?.slice(0, 160) ||
						'Read full traveler dispatches and expeditions on AURA.'
					}
				/>
			</Head>

			<main className="community-detail-main">
				{loading && !article ? (
					<div className="community-detail-loading-box">
						<div className="loading-spinner" />
						<p>Loading dispatch...</p>
					</div>
				) : article ? (
					<div className="community-detail-content-flow">
						{/* Breadcrumb */}
						<CommunityDetailBreadcrumb
							categoryLabel={catInfo.label}
							categoryKey={catInfo.key}
							title={article.articleTitle}
						/>

						{/* Header */}
						<CommunityDetailHeader
							article={article}
							categoryLabel={catInfo.label}
							isLiked={isLiked}
							likeCount={likeCount}
							commentsCount={commentsCount}
							onLike={handleLike}
						/>

						{/* Cover Media */}
						<CommunityDetailMedia
							image={article.articleImage}
							title={article.articleTitle}
						/>

						{/* Body */}
						<CommunityDetailBody article={article} />

						{/* Engagement Bar */}
						<CommunityDetailEngagementBar
							isLiked={isLiked}
							likeCount={likeCount}
							commentsCount={commentsCount}
							onLike={handleLike}
							onScrollToComments={handleScrollToComments}
						/>

						{/* Comments */}
						<CommunityDetailComments
							articleId={article._id}
							onCommentsCountChange={(c) => setCommentsCount(c)}
						/>

						{/* Related Articles ("You Might Also Like") */}
						<CommunityDetailRelated currentArticleId={article._id} />
					</div>
				) : (
					<div className="community-detail-not-found">
						<span className="material-symbols-outlined icon">article</span>
						<h2>Dispatch Not Found</h2>
						<p>The requested community dispatch could not be retrieved.</p>
						<button
							type="button"
							className="back-btn"
							onClick={() => router.push('/community')}
						>
							Back to Community
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default withLayoutBasic(CommunityDetailPage);
