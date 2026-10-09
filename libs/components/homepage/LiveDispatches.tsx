import React from 'react';
import { useRouter } from 'next/router';
import { Destination } from '../../types/destination/destination';
import { getImageUrl } from '../../config';
import { ApolloError } from '@apollo/client';

interface LiveDispatchesProps {
	destinations: Destination[];
	loading?: boolean;
	error?: ApolloError;
}

const destinationCardSizes = ['small', 'medium', 'featured', 'medium', 'small'];

const formatViewCount = (views: number) => {
	if (views < 1000) return views.toLocaleString();
	return `${(views / 1000).toFixed(views % 1000 === 0 ? 0 : 1)}k`;
};

const LiveDispatches = ({ destinations, loading, error }: LiveDispatchesProps) => {
	const router = useRouter();

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
					<span className="section-tag">Live Dispatches</span>
					<h2 className="section-title">Where Travelers Are Going</h2>
					<p className="section-subtitle">Discover the destinations attracting AURORA travelers right now.</p>
				</div>

				<div className="travelers-destination-grid">
					{loading ? <p className="destinations-empty-state">Loading destinations…</p> : null}
					{!loading && error ? <p className="destinations-empty-state">Popular destinations are unavailable right now.</p> : null}
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
									{cardSize === 'featured' ? <span className="top-pick-label">Top Pick</span> : null}
									<h3>{destination.destinationName}</h3>
									<p>
										{destination.destinationCountry} · {formatViewCount(destination.destinationViews)} views
									</p>
								</div>
							</button>
						);
					})}
					{!loading && !error && destinations.length === 0 && <p className="destinations-empty-state">No ranked destinations available yet.</p>}
				</div>
			</div>
		</section>
	);
};

export default LiveDispatches;
