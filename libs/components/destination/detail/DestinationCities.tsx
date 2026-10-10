import React from 'react';
import Link from 'next/link';
import { Destination } from '../../../types/destination/destination';
import { DEFAULT_DESTINATION_IMAGE, getImageUrl } from '../../../config';
import { useI18n } from '../../../i18n';

interface DestinationCitiesProps {
	destination: Destination;
	cities: Destination[];
}

const DestinationCities = ({ destination, cities }: DestinationCitiesProps) => {
	const { t } = useI18n();
	if (!cities || cities.length === 0) return null;

	return (
		<section className="destination-cities-section" id="cities">
			<div className="cities-header-row">
				<h2 className="cities-main-heading">{t('destinations.cities.explore', { destinationCountry: destination.destinationCountry })}</h2>
				<p className="cities-subheading">{t('destinations.cities.subtitle')}</p>
			</div>

			<div className="cities-cards-grid">
				{cities.map((city, idx) => {
					const fallback = DEFAULT_DESTINATION_IMAGE;
					const imgUrl = getImageUrl(city.destinationImages?.[0], fallback);

					return (
						<article key={city._id || idx} className="city-spotlight-card">
							<Link href={`/destination/detail?id=${city._id}`} className="card-link-wrapper">
								<div className="city-image-container">
									<img
										src={imgUrl}
										alt={city.destinationName}
										className="city-img"
										onError={(e: any) => {
											e.target.src = fallback;
										}}
									/>
									<div className="city-image-scrim"></div>
									<div className="city-name-overlay">{city.destinationName}</div>
								</div>

								<div className="city-info-body">
									<p className="city-desc-text">
										{city.destinationDesc ||
											t('destinations.cities.fallbackDescription', { destinationName: city.destinationName })}
									</p>
									<div className="explore-cta-link">
										<span>{t('destinations.cities.exploreDestination', { destinationName: city.destinationName })}</span>
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

export default DestinationCities;
