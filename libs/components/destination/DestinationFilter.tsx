import React from 'react';
import { useI18n } from '../../i18n';

interface DestinationFilterProps {
	selectedContinent: string;
	onSelectContinent: (continent: string) => void;
	selectedSort: string;
	onSelectSort: (sort: string) => void;
	totalCount: number;
}

const continents = [
	{ labelKey: 'destinations.filter.region.all', value: 'all' },
	{ labelKey: 'destinations.filter.region.asia', value: 'asia' },
	{ labelKey: 'destinations.filter.region.europe', value: 'europe' },
	{ labelKey: 'destinations.filter.region.africa', value: 'africa' },
	{ labelKey: 'destinations.filter.region.northAmerica', value: 'north-america' },
	{ labelKey: 'destinations.filter.region.southAmerica', value: 'south-america' },
	{ labelKey: 'destinations.filter.region.oceania', value: 'oceania' },
];

const DestinationFilter = ({
	selectedContinent,
	onSelectContinent,
	selectedSort,
	onSelectSort,
	totalCount,
}: DestinationFilterProps) => {
	const { t } = useI18n();
	return (
		<div className="destination-filter-wrapper">
			{/* CONTINENT FILTER BAR */}
			<section className="continent-filter-bar">
				<div className="continent-buttons-group">
					{continents.map((item) => (
						<button
							key={item.value}
							type="button"
							className={`continent-btn ${selectedContinent === item.value ? 'active' : ''}`}
							onClick={() => onSelectContinent(item.value)}
						>
							{t(item.labelKey)}
						</button>
					))}
				</div>

				<div className="atlas-indicator">
					<span className="material-symbols-outlined">public</span>
					<span>{t('destinations.filter.worldwideAtlas')}</span>
				</div>
			</section>

			{/* SECTION TITLE & STATS */}
			<section className="section-title-stats-bar">
				<div className="stats-left">
					<div className="title-count-row">
						<h2 className="section-heading">{t('destinations.filter.discoverDestinations')}</h2>
						<span className="territories-badge">{t('destinations.filter.territoriesCurated', { totalCount })}</span>
					</div>
					<p className="section-subtext">
						{t('destinations.filter.intro')}
					</p>
				</div>

				<div className="sort-dropdown-box">
					<span className="sort-label">{t('destinations.filter.sort')}</span>
					<div className="sort-select-wrapper">
						<select
							className="sort-select"
							value={selectedSort}
							onChange={(e) => onSelectSort(e.target.value)}
						>
							<option value="views">{t('destinations.filter.curatedIndex')}</option>
							<option value="likes">{t('destinations.filter.mostPopular')}</option>
							<option value="rating">{t('common.topRated')}</option>
							<option value="newest">{t('destinations.filter.newestAdded')}</option>
						</select>
						<span className="material-symbols-outlined sort-arrow">expand_more</span>
					</div>
				</div>
			</section>
		</div>
	);
};

export default DestinationFilter;
