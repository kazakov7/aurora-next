import React from 'react';
import { useI18n } from '../../i18n';

export interface CategoryPillItem {
	key: string;
	categoryValue?: string; // BoardArticleCategory or undefined
}

export const COMMUNITY_CATEGORIES: CategoryPillItem[] = [
	{ key: 'all', categoryValue: undefined },
	{ key: 'itineraries', categoryValue: 'TOUR' },
	{ key: 'hotel-reviews', categoryValue: 'HOTEL' },
	{ key: 'photography', categoryValue: 'DESTINATION' },
	{ key: 'expeditions', categoryValue: 'GUIDE' },
	{ key: 'insights', categoryValue: 'NEWS' },
];

interface CommunityFilterProps {
	selectedCategoryKey: string;
	onCategoryChange: (catKey: string, categoryValue?: string) => void;
}

const CommunityFilter: React.FC<CommunityFilterProps> = ({
	selectedCategoryKey,
	onCategoryChange,
}) => {
	const { t, tEnum } = useI18n();
	return (
		<nav aria-label={t('community.filter.communityCategories')} className="community-categories-nav">
			<div className="pills-scroll-wrapper">
				{COMMUNITY_CATEGORIES.map((cat) => {
					const isActive = selectedCategoryKey === cat.key;
					return (
						<button
							key={cat.key}
							type="button"
							className={`category-pill ${isActive ? 'active' : ''}`}
							onClick={() => onCategoryChange(cat.key, cat.categoryValue)}
						>
							{cat.categoryValue ? tEnum('articleCategory', cat.categoryValue) : t('community.filter.allStories')}
						</button>
					);
				})}
			</div>
		</nav>
	);
};

export default CommunityFilter;
