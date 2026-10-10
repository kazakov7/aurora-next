import React from 'react';
import { useRouter } from 'next/router';
import { Destination } from '../../types/destination/destination';
import { getImageUrl } from '../../config';
import { ApolloError } from '@apollo/client';
import { useI18n } from '../../i18n';

interface LiveDispatchesProps {
	destinations: Destination[];
	loading?: boolean;
	error?: ApolloError;
}

const destinationCardSizes = ['small', 'medium', 'featured', 'medium', 'small'];

const LiveDispatches = ({ destinations, loading, error }: LiveDispatchesProps) => {
	const router = useRouter();
	const { t, formatNumber } = useI18n();

	/** HANDLERS **/
	const navigateToDestination = (destinationId: string) => {
		router.push({
			pathname: '/destination/detail',
			query: { id: destinationId },
		});
	};

	return (
		<section className="live-dispatches-section">
			<div className="section-container">
				<div className="section-header">
					<span className="section-tag">{t('home.dispatches.eyebrow')}</span>
					<h2 className="section-title">{t('home.dispatches.title')}</h2>
					<p className="section-subtitle">{t('home.dispatches.description')}</p>
				</div>

				<div className="travelers-destination-grid">
					{loading ? <p className="destinations-empty-state">{t('home.dispatches.loading')}</p> : null}
					{!loading && error ? <p className="destinations-empty-state">{t('home.dispatches.unavailable')}</p> : null}
					{destinations.map((destination, index) => {
						const imageUrl = getImageUrl(destination.destinationImages?.[0]);
						const cardSize = destinationCardSizes[index] ?? 'small';

						return (
							<button
								key={destination._id}
								type="button"
								className={`traveler-destination-card ${cardSize}`}
								onClick={() => navigateToDestination(destination._id)}
							>
								{imageUrl ? <img src={imageUrl} alt={destination.destinationName} /> : null}
								<div className="destination-scrim" />
								<div className="destination-info">
									{cardSize === 'featured' ? <span className="top-pick-label">{t('home.dispatches.topPick')}</span> : null}
									<h3>{destination.destinationName}</h3>
									<p>
										{destination.destinationCountry} · {t('home.dispatches.views', { count: destination.destinationViews ?? 0, formatted: formatNumber(destination.destinationViews ?? 0, { notation: 'compact', maximumFractionDigits: 1 }) })}
									</p>
								</div>
							</button>
						);
					})}
					{!loading && !error && destinations.length === 0 && <p className="destinations-empty-state">{t('home.dispatches.empty')}</p>}
				</div>
			</div>
		</section>
	);
};

export default LiveDispatches;
