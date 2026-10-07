import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { Direction, Message } from '../../enums/common.enum';
import { T } from '../../types/common';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import moment from 'moment';

interface LiveDispatchesProps {
	initialInput?: BoardArticlesInquiry;
}

const defaultDispatches = [
	{
		_id: 'default-dispatch-1',
		articleTitle: 'Villa Il Palmerino Experience',
		articleCategory: 'STAY',
		articleContent: 'Historic 15th-century Tuscan estate surrounded by rolling olive groves and quiet hills.',
		authorName: 'Traveler from Zurich',
		badge: 'Departing Soon',
		badgeType: 'secondary',
		createdAt: new Date().toISOString(),
	},
	{
		_id: 'default-dispatch-2',
		articleTitle: 'Svart Glacier Lodge Polar Expedition',
		articleCategory: 'EXPEDITION',
		articleContent: 'Zero-emission circular retreat floating above pristine fjord waters and glacial bays.',
		authorName: 'Traveler from Tokyo',
		badge: 'Just Booked',
		badgeType: 'primary',
		createdAt: new Date().toISOString(),
	},
	{
		_id: 'default-dispatch-3',
		articleTitle: 'Riad Yasmine Secret Courtyard',
		articleCategory: 'SANCTUARY',
		articleContent: 'Secluded palm courtyard with emerald tiled pool within historic Medina walls.',
		authorName: 'Traveler from London',
		badge: 'Confirmed',
		badgeType: 'secondary',
		createdAt: new Date().toISOString(),
	},
	{
		_id: 'default-dispatch-4',
		articleTitle: 'Post Ranch Inn Coastline Haven',
		articleCategory: 'RETREAT',
		articleContent: 'Redwood cliffhouse perched 1,200 feet over the roaring Pacific coastline.',
		authorName: 'Traveler from New York',
		badge: 'Departing Soon',
		badgeType: 'secondary',
		createdAt: new Date().toISOString(),
	},
];

const LiveDispatches = ({ initialInput }: LiveDispatchesProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [articles, setArticles] = useState<BoardArticle[]>([]);

	const queryInput: BoardArticlesInquiry = initialInput || {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	};

	/** APOLLO REQUESTS **/
	const [likeTargetArticle] = useMutation(LIKE_TARGET_ARTICLE);
	const { data, refetch: refetchArticles } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const list = data?.getBoardArticles?.list;
		if (list && list.length > 0) {
			setArticles(list);
		}
	}, [data]);

	/** HANDLERS **/
	const likeArticleHandler = async (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetArticle({
				variables: { input: articleId },
			});
			await refetchArticles({ input: queryInput });
			await sweetTopSmallSuccessAlert('Dispatch liked!', 800);
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const pushDetailHandler = (item: BoardArticle | any) => {
		if (item._id && !item._id.startsWith('default-')) {
			router.push({
				pathname: '/community/detail',
				query: { id: item._id },
			});
		} else {
			router.push('/community');
		}
	};

	const displayList = Array.from({ length: 4 }).map((_, index) => {
		if (articles[index]) return articles[index];
		return defaultDispatches[index];
	});

	return (
		<section className="live-dispatches-section">
			<div className="section-container">
				{/* Section Header */}
				<div className="section-header">
					<div>
						<div className="live-indicator-row">
							<span className="live-pulse-container">
								<span className="live-pulse-ping"></span>
								<span className="live-pulse-dot"></span>
							</span>
							<span className="section-tag">Live Dispatch</span>
						</div>
						<h2 className="section-title">Where Travelers Are Going</h2>
						<p className="section-subtitle">
							Real journeys currently underway and recently confirmed across the collective.
						</p>
					</div>
				</div>

				{/* Cards Grid */}
				<div className="dispatches-grid">
					{displayList.map((item: any, idx: number) => {
						const isLiked = item?.meLiked && item?.meLiked[0]?.myFavorite;
						const author =
							item?.memberData?.memberFullName ||
							item?.memberData?.memberNick ||
							item?.authorName ||
							'Verified Explorer';
						const timeAgo = item?.createdAt ? moment(item.createdAt).fromNow() : 'Recently confirmed';
						const category = item?.articleCategory || 'JOURNEY';

						return (
							<div
								key={item._id || idx}
								className="dispatch-card cursor-pointer"
								onClick={() => pushDetailHandler(item)}
							>
								<div className="dispatch-top">
									<div className="meta-row">
										<span className="location-pill">{category}</span>
										<span className={`status-pill ${idx % 2 === 0 ? 'secondary' : 'primary'}`}>
											{item.badge || 'Confirmed'}
										</span>
									</div>
									<h3 className="dispatch-title">{item.articleTitle}</h3>
									<p className="dispatch-desc">{item.articleContent}</p>
								</div>

								<div className="dispatch-bottom">
									<span className="traveler-origin">{author}</span>
									<span className="nights-count">{timeAgo}</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default LiveDispatches;
