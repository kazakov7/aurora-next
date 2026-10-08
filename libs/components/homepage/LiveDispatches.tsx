import React from 'react';
import { useRouter } from 'next/router';
import { Destination } from '../../types/destination/destination';
import { getImageUrl } from '../../config';

interface LiveDispatchesProps {
	destinations: Destination[];
	loading?: boolean;
}

const destinationCardSizes = ['small', 'medium', 'featured', 'medium', 'small'];

const formatViewCount = (views: number) => {
	if (views < 1000) return views.toLocaleString();
	return `${(views / 1000).toFixed(views % 1000 === 0 ? 0 : 1)}k`;
};

const LiveDispatches = ({ destinations: destinationList, loading }: LiveDispatchesProps) => {
	const router = useRouter();
	const destinations =
		destinationList.length === 5
			? [destinationList[1], destinationList[2], destinationList[0], destinationList[3], destinationList[4]]
			: destinationList;

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
					<span className="section-tag">Where Travelers Are Going</span>
					<h2 className="section-title">Where Travelers Are Going</h2>
					<p className="section-subtitle">Discover the destinations attracting AURA travelers right now.</p>
				</div>

				<div className="travelers-destination-grid">
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
					{!loading && destinationList.length === 0 && <p className="destinations-empty-state">No destinations available yet.</p>}
				</div>
			</div>
		</section>
	);
};

export default LiveDispatches;
