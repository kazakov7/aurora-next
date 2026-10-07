import React from 'react';
import Link from 'next/link';
import { Destination } from '../../../types/destination/destination';
import { getImageUrl } from '../../../config';

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

const fallbackImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDq5qK3uF0YJGJlcCLOwnpQvZUhOCALzwZqSAFo6-SSvb347qMAkWK4W1JADv4TSJgm65R-YnDrbFdeVZMkk4i9gJIUM4F0FEqty6QVLCxpQupfCce1V85tmobIKxKNvMpDocjkmIpU3soZTWbQNhz70s1HOVP-J6SCTfftc_HxGJx7QYw8H9v_2H70pCUGZ53FY9BVvv_8tfVBQeEYJym19xzN1QpZfX8ajN5pEVj42atuqAxSveuP',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD5-zmZOSxZO4XypsSQM9W33Ch76qUiRuzM5OKRka5JCueFY-hxLW8e5eVAWAydxepKJvrEXts1uFLTi0BJnKj5AJCS9Sk1i_OLPEgkbAbJCYsWa3NC0OxUH0ZRwXowoAagMxssQZ2aRx68de4ZBvbQR_YLQNB-RB0p0ckqNd9NhD4bksdGHGMsIt8oIqkIaMth-Frl7zWzClg-njrfspzVtdsDIFH3ulTpM4EMb2kBXUQZAWpwMDNM',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDcedc2yHogh_22zR2392_kMhG2bDT8LZ6qEvGKdgB9feAPduUHei4KopK54kN2bvDSgnKE2J0jKuEJOw5M4uXmsJ4vNLXn7XrsZw_9vTk2YG6XJ-zh5JPV8RKqaEyPjikTjiUt1aBCmEuv4xRWh2wfVfZQuCCFHxRjQypDUIsmBMl0DsDmPSmL99J_0a4BN6qvFDUfUvEZUON21VU1JZTcX4oWDtjoegOLbEiy3LkkmaZSCN2x6rnv',
];

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
					const fallback = fallbackImages[idx % fallbackImages.length];
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
