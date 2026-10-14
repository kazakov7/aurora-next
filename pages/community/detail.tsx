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
import { GET_BOARD_ARTICLE, GET_PROPERTY_HOST } from '../../apollo/user/query';
import { LIKE_TARGET_ARTICLE, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useI18n } from '../../libs/i18n';
import LoadingSpinner from '../../libs/components/common/LoadingSpinner';

/** Article category -> community filter key; labels come from enums.articleCategory.* **/
const categoryFilterKeys: Record<string, string> = {
	TOUR: 'itineraries',
	HOTEL: 'hotel-reviews',
	DESTINATION: 'photography',
	GUIDE: 'expeditions',
	NEWS: 'insights',
};

const CommunityDetailPage: NextPage = () => {
	const { t, tError, tEnum } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [articleId, setArticleId] = useState<string>('');

	const [article, setArticle] = useState<BoardArticle | null>(null);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [isFollowing, setIsFollowing] = useState<boolean>(false);
	const [likeCount, setLikeCount] = useState<number>(0);
	const [commentsCount, setCommentsCount] = useState<number>(0);

	/** ROUTE PARAMS **/
	useEffect(() => {
		if (router.isReady) {
			const id = typeof router.query.id === 'string' ? router.query.id : '';
			if (id !== articleId) {
				setArticle(null);
				setArticleId(id);
			}
		}
	}, [router.isReady, router.query.id, articleId]);

	/** 1. PRIMARY QUERY: GET_BOARD_ARTICLE **/
	const { data, loading, error, refetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { articleId: articleId },
		skip: !articleId,
	});

	/** 2. AUTHOR FOLLOW STATE: article memberData does not carry meFollowed **/
	const authorId = article?.memberData?._id || '';
	const { data: authorData, refetch: refetchAuthor } = useQuery(GET_PROPERTY_HOST, {
		fetchPolicy: 'network-only',
		variables: { input: authorId },
		skip: !authorId || !user?._id,
	});

	useEffect(() => {
		setIsFollowing(!!authorData?.getMember?.meFollowed?.[0]?.myFollowing);
	}, [authorData]);

	/** 3. MUTATIONS **/
	const [likeTargetArticle] = useMutation(LIKE_TARGET_ARTICLE);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

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
			sweetMixinErrorAlert(t('community.detail.loginToLike'));
			return;
		}
		if (!article?._id) return;

		try {
			const nextLiked = !isLiked;
			setIsLiked(nextLiked);
			setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

			await likeTargetArticle({
				variables: { input: article._id },
			});
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'community.likeFailed'));
			refetch();
		}
	};

	const handleFollow = async () => {
		if (!user?._id) {
			sweetMixinErrorAlert(t('community.detail.loginToFollow'));
			return;
		}
		if (!article?.memberData?._id) return;
		if (user._id === article.memberData._id) {
			sweetMixinErrorAlert(t('common.cannotFollowYourself'));
			return;
		}

		try {
			if (!isFollowing) {
				await subscribe({ variables: { input: article.memberData._id } });
			} else {
				await unsubscribe({ variables: { input: article.memberData._id } });
			}
			await refetchAuthor();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'common.followUpdateFailed'));
		}
	};

	const handleScrollToComments = () => {
		const el = document.getElementById('comments-section');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const catInfo =
		article?.articleCategory && categoryFilterKeys[article.articleCategory]
			? { label: tEnum('articleCategory', article.articleCategory), key: categoryFilterKeys[article.articleCategory] }
			: { label: t('common.uncategorized'), key: '' };

	return (
		<div className="community-detail-page-wrapper">
			<Head>
				<title>
					{article?.articleTitle
						? t('community.detail.metaTitle', { articleTitle: article.articleTitle })
						: t('community.detail.metaTitleFallback')}
				</title>
				<meta
					name="description"
					content={
						article?.articleContent?.slice(0, 160) ||
						t('community.detail.metaDescription')
					}
				/>
			</Head>

			<main className="community-detail-main">
				{loading && !article ? (
					<div className="listing-loader-wrapper">
						<LoadingSpinner size="lg" label={t('community.detail.loadingDispatch')} />
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
							likeCount={likeCount}
							commentsCount={commentsCount}
							isFollowing={isFollowing}
							onFollow={handleFollow}
							showFollowButton={user?._id !== article?.memberData?._id}
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
						<h2>{error ? t('community.detail.unableToLoadDispatch') : t('community.detail.dispatchNotFound')}</h2>
						<p>
							{error
								? error.message
								: t('community.detail.chooseDispatch')}
						</p>
						<button
							type="button"
							className="back-btn"
							onClick={() => router.push('/community')}
						>
							{t('community.detail.backToCommunity')}
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default withLayoutBasic(CommunityDetailPage);
