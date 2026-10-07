import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../../apollo/user/query';
import { BoardArticle } from '../../../types/board-article/board-article';
import { Direction } from '../../../enums/common.enum';
import { getImageUrl } from '../../../config';

interface CommunityDetailRelatedProps {
	currentArticleId: string;
}

const defaultRelatedCards = [
	{
		_id: 'rel-1',
		articleTitle: 'Solitude at 3,000m: High Alpine Cabins of Zermatt',
		articleCategory: 'GUIDE',
		articleContent:
			'Beyond luxury chalets in the valley lies an uncompromising network of stone and larch bivouacs under the Matterhorn.',
		articleImage:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuADo1CYqwrOHXZAhkRKwWeVz9x54ZwejELkoNi8aVEN2FAnJ89hVmBGc_q0YY0RVG4TDLjJvTy-LTp2BA4w4U3vY8PWCVFZv5P5T0awaNlO0zDNCvFTv4Z-EKTc_ACjU91vS9PbCYhlaSFc7Dj87lIF1iMno9ZJDkTGzZ8lCmCabZQXvkCIZgOIEw5kTCZ9ChO4tOfX6-1IpEUEMgfyJib78gbS6fsrdz_eW-E8fZf_zn8RcQVI4Eyv',
		articleViews: 840,
		articleLikes: 142,
		articleComments: 38,
		memberData: {
			memberNick: 'Elena Rostova',
			memberFullName: 'Elena Rostova',
		},
	},
	{
		_id: 'rel-2',
		articleTitle: 'A Quiet Morning in Gion, Kyoto: Beyond the Bamboo Forest',
		articleCategory: 'NEWS',
		articleContent:
			'Arrive at Kennin-ji at 6:15 AM before the wooden lattices unlatch. The scent of damp hinoki cypress and raked gravel.',
		articleImage:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuD8mVEa3zfKk7bSn7chGIh3ICCDqr2VvZTW1rPHENb18_krk9kCYZ30ErqYYNnlg41pQu52u-G3MFzdFeMloGCMhRruIg-vqaSuacxbGY_C-HkeJ87trvrJed62iVoR1ppmTXFGZ53LAIPj9BqC5X43N2Y_B811v3kGmQb1NFKfgLf6jRjZbutDEX4xDhdWfLpDhwasQ1Ab5Uu0hTY0vfy2w-OHBL6x04m5jm1gCKT3nmHlsJ5AWCn5',
		articleViews: 1200,
		articleLikes: 219,
		articleComments: 54,
		memberData: {
			memberNick: 'Marcus Chen',
			memberFullName: 'Marcus Chen',
		},
	},
	{
		_id: 'rel-3',
		articleTitle: "Sailing the Lesser Cyclades: Where the Ferry Doesn't Stop",
		articleCategory: 'TOUR',
		articleContent:
			'Navigating shallow anchorages between Iraklia and Schinoussa. Discovering hidden sea caves accessible only by zodiac.',
		articleImage:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCrNgO__HUlLUc7M_gAFUEE_BHx-4Z1kpeAAxyh_zNcC47kEixtXj9M9gbdUHdv0rXoTnDigf14JrbWgTT19tjo2T7-KZSxHatbSPHodHYqlbWQ9lKaB_u7lyvsw5P7lzm-tQr5v1Gvczd2an5G_1qDl4lh3TBIFe-mOYpmRtuksNDZczKI781YAIQszMGvfHFEGQQzxqW3pY89RmNfRBRLJLPYuz4kH05rtHOK3KL-2ST--7oWveM8',
		articleViews: 950,
		articleLikes: 188,
		articleComments: 29,
		memberData: {
			memberNick: 'Liam O’Connor',
			memberFullName: 'Liam O’Connor',
		},
	},
];

const categoryLabelMap: Record<string, string> = {
	TOUR: 'Itineraries',
	HOTEL: 'Hotel Reviews',
	DESTINATION: 'Photography',
	GUIDE: 'Expedition Log',
	NEWS: 'Local Insights',
};

const CommunityDetailRelated: React.FC<CommunityDetailRelatedProps> = ({ currentArticleId }) => {
	const { data } = useQuery(GET_BOARD_ARTICLES, {
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'articleViews',
				direction: Direction.DESC,
				search: {},
			},
		},
	});

	const backendList: BoardArticle[] = (data?.getBoardArticles?.list || []).filter(
		(a: BoardArticle) => a._id !== currentArticleId
	);

	const displayList: any[] =
		backendList.length > 0
			? backendList.slice(0, 3)
			: defaultRelatedCards;

	return (
		<section className="community-detail-related-section">
			<div className="related-inner-container">
				{/* Section Header */}
				<div className="section-header-row">
					<div>
						<h2 className="section-title">You Might Also Like</h2>
						<p className="section-subtitle">More stories to inspire your next adventure.</p>
					</div>
					<Link href="/community" className="explore-community-link">
						<span>Explore Community</span>
						<span className="material-symbols-outlined icon">arrow_forward</span>
					</Link>
				</div>

				{/* 3-Column Grid */}
				<div className="related-cards-grid">
					{displayList.map((item) => {
						const authorName =
							item.memberData?.memberFullName || item.memberData?.memberNick || 'Explorer';
						const catLabel =
							categoryLabelMap[item.articleCategory] || item.articleCategory || 'Story';
						const imgSrc = getImageUrl(
							item.articleImage,
							'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
						);

						return (
							<article key={item._id} className="related-card-item">
								<Link href={`/community/detail?id=${item._id}`} className="card-image-wrap">
									<img
										className="card-cover-img"
										src={imgSrc}
										alt={item.articleTitle}
									/>
								</Link>

								<div className="card-content-wrap">
									<div className="text-body-group">
										<span className="cat-pill">{catLabel}</span>
										<Link href={`/community/detail?id=${item._id}`} className="title-link">
											<h3 className="card-title">{item.articleTitle}</h3>
										</Link>
										<p className="card-excerpt">{item.articleContent}</p>
									</div>

									<div className="card-footer-meta">
										<span className="author-meta">{authorName} · 5 min read</span>
										<div className="stats-meta">
											<span className="stat">
												<span className="material-symbols-outlined icon">favorite</span>{' '}
												{item.articleLikes || 0}
											</span>
											<span className="stat">
												<span className="material-symbols-outlined icon">chat_bubble</span>{' '}
												{item.articleComments || 0}
											</span>
										</div>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default CommunityDetailRelated;
