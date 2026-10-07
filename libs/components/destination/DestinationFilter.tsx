import React from 'react';

interface DestinationFilterProps {
	selectedContinent: string;
	onSelectContinent: (continent: string) => void;
	selectedSort: string;
	onSelectSort: (sort: string) => void;
	totalCount: number;
}

const continents = [
	{ label: 'All', value: 'all' },
	{ label: 'Asia', value: 'asia' },
	{ label: 'Europe', value: 'europe' },
	{ label: 'Africa', value: 'africa' },
	{ label: 'North America', value: 'north-america' },
	{ label: 'South America', value: 'south-america' },
	{ label: 'Oceania', value: 'oceania' },
];

const DestinationFilter = ({
	selectedContinent,
	onSelectContinent,
	selectedSort,
	onSelectSort,
	totalCount,
}: DestinationFilterProps) => {
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
							{item.label}
						</button>
					))}
				</div>

				<div className="atlas-indicator">
					<span className="material-symbols-outlined">public</span>
					<span>Worldwide Atlas</span>
				</div>
			</section>

			{/* SECTION TITLE & STATS */}
			<section className="section-title-stats-bar">
				<div className="stats-left">
					<div className="title-count-row">
						<h2 className="section-heading">Discover Destinations</h2>
						<span className="territories-badge">{totalCount} territories curated</span>
					</div>
					<p className="section-subtext">
						Curated gateways to the world&apos;s most evocative landscapes.
					</p>
				</div>

				<div className="sort-dropdown-box">
					<span className="sort-label">Sort:</span>
					<div className="sort-select-wrapper">
						<select
							className="sort-select"
							value={selectedSort}
							onChange={(e) => onSelectSort(e.target.value)}
						>
							<option value="views">Curated Index</option>
							<option value="likes">Most Popular</option>
							<option value="rating">Top Rated</option>
							<option value="newest">Newest Added</option>
						</select>
						<span className="material-symbols-outlined sort-arrow">expand_more</span>
					</div>
				</div>
			</section>
		</div>
	);
};

export default DestinationFilter;
