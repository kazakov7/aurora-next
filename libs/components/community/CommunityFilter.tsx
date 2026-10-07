import React from 'react';

export interface CategoryPillItem {
	key: string;
	label: string;
	categoryValue?: string; // BoardArticleCategory or undefined
}

export const COMMUNITY_CATEGORIES: CategoryPillItem[] = [
	{ key: 'all', label: 'All Stories', categoryValue: undefined },
	{ key: 'itineraries', label: 'Itineraries', categoryValue: 'TOUR' },
	{ key: 'hotel-reviews', label: 'Hotel Reviews', categoryValue: 'HOTEL' },
	{ key: 'photography', label: 'Photography', categoryValue: 'DESTINATION' },
	{ key: 'expeditions', label: 'Expedition Logs', categoryValue: 'GUIDE' },
	{ key: 'insights', label: 'Local Insights', categoryValue: 'NEWS' },
];

interface CommunityFilterProps {
	selectedCategoryKey: string;
	onCategoryChange: (catKey: string, categoryValue?: string) => void;
}

const CommunityFilter: React.FC<CommunityFilterProps> = ({
	selectedCategoryKey,
	onCategoryChange,
}) => {
	return (
		<nav aria-label="Community Categories" className="community-categories-nav">
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
							{cat.label}
						</button>
					);
				})}
			</div>
		</nav>
	);
};

export default CommunityFilter;
