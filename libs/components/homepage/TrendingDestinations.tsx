import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Destination } from '../../types/destination/destination';
import { getImageUrl } from '../../config';

interface TrendingDestinationsProps {
	destinations: Destination[];
	loading?: boolean;
}

const cardClasses = [
	'col-span-7 kyoto-card',
	'col-span-5 amalfi-card',
	'col-span-4 reykjanes-card',
	'col-span-8 zermatt-card',
];

const TrendingDestinations = ({ destinations, loading }: TrendingDestinationsProps) => {
	const router = useRouter();

	const navigateToDestination = (destinationId: string) => {
		router.push({ pathname: '/destination/detail', query: { id: destinationId } });
	};

	return (
		<section className="trending-destinations-section">
			<div className="section-container">
				<div className="section-header">
					<div>
						<span className="section-tag">Curation Grid</span>
						<h2 className="section-title">Trending Destinations</h2>
					</div>
					<Link href="/destination" className="section-link">
						<span>Explore all destinations</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>

				<div className="bento-grid">
					{destinations.map((destination, index) => {
						const imageUrl = getImageUrl(destination.destinationImages?.[0]);
						const isCompactCard = index === 2;
						const isWideCard = index === 3;

						return (
							<div
								key={destination._id}
								className={`bento-card ${cardClasses[index] ?? 'col-span-6'} cursor-pointer`}
								onClick={() => navigateToDestination(destination._id)}
							>
								<div className="card-bg" style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined} />
								<div className={isWideCard ? 'card-gradient-right' : 'card-gradient'} />
								<div className="card-content">
									{destination.destinationCountry ? (
										<span className={isCompactCard ? 'card-tag' : 'card-badge'}>{destination.destinationCountry}</span>
									) : null}
									<h3 className={isCompactCard ? 'card-heading-sm' : 'card-heading'}>{destination.destinationName}</h3>
									{destination.destinationDesc ? <p className="card-desc">{destination.destinationDesc}</p> : null}
									{index === 0 ? (
										<div className="card-stats">
											<span>{destination.destinationProperties} Private Stays</span>
											<span className="dot" />
											<span>{destination.destinationTours} Guided Tours</span>
										</div>
									) : null}
									{index === 1 ? <div className="card-stats"><span>{destination.destinationProperties} Properties</span></div> : null}
									{isWideCard ? (
										<div className="card-actions">
											<span className="highlight-text">{destination.destinationProperties} Properties</span>
											<span className="view-collection-link"><span>View Collection</span><span className="material-symbols-outlined">chevron_right</span></span>
										</div>
									) : null}
								</div>
							</div>
						);
					})}
					{!loading && destinations.length === 0 ? <p className="bento-empty-state">No destinations available yet.</p> : null}
				</div>
			</div>
		</section>
	);
};

export default TrendingDestinations;
