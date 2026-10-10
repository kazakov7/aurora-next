import React from 'react';
import Link from 'next/link';
import { Destination } from '../../../types/destination/destination';
import { DEFAULT_DESTINATION_IMAGE, getImageUrl } from '../../../config';

interface DestinationContinueExploringProps {
	destinations: Destination[];
}

const countryFlags: Record<string, string> = {
	Japan: '🇯🇵',
	'South Korea': '🇰🇷',
	Switzerland: '🇨🇭',
	Germany: '🇩🇪',
	Italy: '🇮🇹',
	France: '🇫🇷',
	Spain: '🇪🇸',
	Norway: '🇳🇴',
	Thailand: '🇹🇭',
	Vietnam: '🇻🇳',
};

const DestinationContinueExploring = ({ destinations }: DestinationContinueExploringProps) => {
	if (!destinations || destinations.length === 0) return null;

	const displayList = destinations.slice(0, 3);

	return (
		<section className="destination-continue-exploring-section">
			<div className="section-header-box">
				<h2 className="continue-heading">Continue Exploring</h2>
				<p className="continue-subheading">
					Iconic curated destinations across East Asia &amp; beyond.
				</p>
			</div>

			<div className="continue-cards-grid">
				{displayList.map((dest, idx) => {
					const fallback = DEFAULT_DESTINATION_IMAGE;
					const imgUrl = getImageUrl(dest.destinationImages?.[0], fallback);
					const flag = countryFlags[dest.destinationCountry] || '🌐';

					return (
						<article key={dest._id || idx} className="continue-card-item">
							<Link href={`/destination/detail?id=${dest._id}`} className="card-link-wrapper">
								<div className="image-container">
									<img
										src={imgUrl}
										alt={dest.destinationName}
										className="country-img"
										onError={(e: any) => {
											e.target.src = fallback;
										}}
									/>
									<div className="image-scrim"></div>
									<div className="country-title-overlay">
										<span>{dest.destinationName}</span>
										<span role="img" aria-label={dest.destinationCountry} className="flag-icon">
											{flag}
										</span>
									</div>
								</div>

								<div className="card-info-box">
									<p className="card-desc-text">
										{dest.destinationDesc ||
											`Tradition meets visionary architecture across iconic landscapes in ${dest.destinationName}.`}
									</p>
									<div className="explore-cta-row">
										<span>Explore {dest.destinationName}</span>
										<span className="material-symbols-outlined icon-arrow">arrow_forward</span>
									</div>
								</div>
							</Link>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default DestinationContinueExploring;
