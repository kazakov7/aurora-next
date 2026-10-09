import React from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { DEFAULT_TOUR_IMAGE, getImageUrl } from '../../../config';
import { ApolloError } from '@apollo/client';

interface DestinationPopularToursProps {
	destinationName: string;
	tours: Tour[];
	onLikeTour?: (tourId: string) => void;
	loading?: boolean;
	error?: ApolloError;
}


const DestinationPopularTours = ({
	destinationName,
	tours,
	onLikeTour,
	loading,
	error,
}: DestinationPopularToursProps) => {
	if (!loading && !error && (!tours || tours.length === 0)) return null;

	const displayTours = tours.slice(0, 4);

	return (
		<section className="destination-popular-tours-section">
			{/* Section Header */}
			<div className="section-header-row">
				<div>
					<h2 className="section-main-title">Popular Tours &amp; Experiences</h2>
					<p className="section-sub-title">Unforgettable adventures across {destinationName}.</p>
				</div>
				<Link href="/tour" className="view-all-header-link">
					<span>Explore All Tours</span>
					<span className="material-symbols-outlined">arrow_forward</span>
				</Link>
			</div>

			{/* Exactly 4 Tour Package Cards in 1 Row on Desktop */}
			<div className="tours-cards-grid">
				{loading ? <p>Loading top tours…</p> : null}
				{!loading && error ? <p>Top tours are unavailable right now.</p> : null}
				{displayTours.map((tour, idx) => {
					const imgUrl = getImageUrl(tour.tourImages?.[0], DEFAULT_TOUR_IMAGE);
					const inclusions = tour.tourAdditionalInfo?.split(',').map((value) => value.trim()).filter(Boolean).slice(0, 3) || [];
					const isLiked = tour.meLiked?.[0]?.myFavorite;
					const priceKRW = tour.tourPrice;
					const rating = typeof tour.tourRating === 'number' ? tour.tourRating.toFixed(2) : '—';
					const departure =
						tour.tourDepartureCity || tour.tourDestinationCity || destinationName;

					return (
						<article key={tour._id || idx} className="tour-card-item">
							<div className="card-media-wrapper">
								<img
									src={imgUrl}
									alt={tour.tourName}
									className="tour-img"
									onError={(e: any) => {
										e.target.src = DEFAULT_TOUR_IMAGE;
									}}
								/>

								{onLikeTour && (
									<button
										type="button"
										className={`tour-fav-btn ${isLiked ? 'liked' : ''}`}
										onClick={(e) => {
											e.preventDefault();
											onLikeTour(tour._id);
										}}
										aria-label="Wishlist Tour"
									>
										<span
											className="material-symbols-outlined"
											style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
										>
											favorite
										</span>
									</button>
								)}

								<div className="schedule-badge-pill">
									<span className="material-symbols-outlined icon-clock">schedule</span>
									<span>{tour.tourStartDate && tour.tourEndDate ? 'Scheduled tour' : 'Dates to be announced'}</span>
								</div>
							</div>

							<div className="card-details-box">
								<div>
									<div className="location-rating-row">
										<span className="location-text">{departure}</span>
										<span className="rating-badge">
											<span
												className="material-symbols-outlined icon-star"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												star
											</span>
											<span className="rating-num">{rating}</span>
										</span>
									</div>

									<h3 className="tour-name-title">{tour.tourName}</h3>

									{/* Inclusions Chips */}
									<div className="inclusions-chips-group">
										{inclusions.map((inc, i) => (
											<span key={i} className="inclusion-chip">
												{inc}
											</span>
										))}
									</div>
								</div>

								<div className="card-price-package-row">
									<div className="price-box">
										<span className="price-amount">{typeof priceKRW === 'number' ? `₩${priceKRW.toLocaleString()}` : 'Price on request'}</span>
										<span className="price-subtext">per person</span>
									</div>
									<Link href={`/tour/detail?id=${tour._id}`} className="view-package-btn">
										View Package
									</Link>
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default DestinationPopularTours;
