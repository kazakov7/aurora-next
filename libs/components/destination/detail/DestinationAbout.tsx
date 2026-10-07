import React from 'react';
import { Destination } from '../../../types/destination/destination';

interface DestinationAboutProps {
	destination: Destination;
}

const countryLanguages: Record<string, { lang: string; note: string }> = {
	'South Korea': {
		lang: 'Korean (Hangul)',
		note: 'English widely spoken in luxury hotels and transit hubs',
	},
	Japan: {
		lang: 'Japanese',
		note: 'English signage ubiquitous across rail networks & resorts',
	},
	Switzerland: {
		lang: 'German, French, Italian',
		note: 'English fluently spoken throughout hospitality sanctuaries',
	},
	Germany: {
		lang: 'German',
		note: 'High English proficiency in cosmopolitan metropolitan centers',
	},
};

const DestinationAbout = ({ destination }: DestinationAboutProps) => {
	const langInfo = countryLanguages[destination.destinationCountry] || {
		lang: 'National Language',
		note: 'English spoken in luxury hotels and international hubs',
	};

	return (
		<section className="destination-about-section">
			<div className="about-grid-layout">
				{/* Left Editorial Column */}
				<div className="editorial-col">
					<span className="editorial-eyebrow">Culture &amp; Heritage</span>
					<h2 className="editorial-heading">Experience {destination.destinationName}</h2>
					<p className="editorial-paragraph">
						{destination.destinationDesc ||
							`From the historic temples and royal heritage to the vibrant coastal seafood markets and serene landscapes of ${destination.destinationName}. Every corner seamlessly weaves dynastic architecture, pioneering gastronomy, high-speed rail connectivity, and tranquil retreats into an unforgettable journey.`}
					</p>

					<div className="editorial-chips-row">
						<div className="feature-pill">
							<span className="material-symbols-outlined icon-feature">train</span>
							<span className="feature-text">High-Speed Rail Connected</span>
						</div>
						<div className="feature-pill">
							<span className="material-symbols-outlined icon-feature">restaurant</span>
							<span className="feature-text">Culinary Capital</span>
						</div>
						<div className="feature-pill">
							<span className="material-symbols-outlined icon-feature">verified_user</span>
							<span className="feature-text">World-Class Safety Index</span>
						</div>
					</div>
				</div>

				{/* Right Quick Info Cards */}
				<div className="quick-info-col">
					{/* Card 1: Capital / Focus City */}
					<div className="quick-info-card">
						<div className="icon-badge badge-primary">
							<span className="material-symbols-outlined">location_city</span>
						</div>
						<div className="card-info-content">
							<div className="card-kicker">Center</div>
							<h3 className="card-heading">{destination.destinationName}</h3>
							<p className="card-desc">
								Metropolitan heart of architecture, culture &amp; scenic landscapes
							</p>
						</div>
					</div>

					{/* Card 2: Region */}
					<div className="quick-info-card">
						<div className="icon-badge badge-secondary">
							<span className="material-symbols-outlined">public</span>
						</div>
						<div className="card-info-content">
							<div className="card-kicker">Country &amp; Region</div>
							<h3 className="card-heading">{destination.destinationCountry}</h3>
							<p className="card-desc">
								Curated global sanctuary with discreet hospitality standards
							</p>
						</div>
					</div>

					{/* Card 3: Language */}
					<div className="quick-info-card">
						<div className="icon-badge badge-surface">
							<span className="material-symbols-outlined">translate</span>
						</div>
						<div className="card-info-content">
							<div className="card-kicker">Language</div>
							<h3 className="card-heading">{langInfo.lang}</h3>
							<p className="card-desc">{langInfo.note}</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DestinationAbout;
