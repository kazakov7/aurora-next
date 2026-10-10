import React from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { DEFAULT_TOUR_IMAGE, getImageUrl } from '../../../config';
import { ApolloError } from '@apollo/client';
import { useI18n } from '../../../i18n';
import { RevealOnScroll } from '../../motion/RevealOnScroll';

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
	const { t } = useI18n();
	if (!loading && !error && (!tours || tours.length === 0)) return null;

	const displayTours = tours.slice(0, 4);

	return (
		<section className="destination-popular-tours-section">
			{/* Section Header */}
			<RevealOnScroll distance={16} style={{ width: '100%' }}>
				<div className="section-header-row">
					<div>
						<h2 className="section-main-title">{t('destinations.popularTours.title')}</h2>
						<p className="section-sub-title">{t('destinations.popularTours.subtitle', { destinationName })}</p>
					</div>
					<Link href="/tour" className="view-all-header-link">
						<span>{t('destinations.popularTours.exploreAllTours')}</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>
			</RevealOnScroll>

			{/* Exactly 4 Tour Package Cards in 1 Row on Desktop */}
			<div className="tours-cards-grid">
				{loading ? <p>{t('destinations.popularTours.loading')}</p> : null}
				{!loading && error ? <p>{t('destinations.popularTours.unavailable')}</p> : null}
				{displayTours.map((tour, idx) => {
					const imgUrl = getImageUrl(tour.tourImages?.[0], DEFAULT_TOUR_IMAGE);
					const inclusions = tour.tourAdditionalInfo?.split(',').map((value) => value.trim()).filter(Boolean).slice(0, 3) || [];
					const isLiked = tour.meLiked?.[0]?.myFavorite;
					const priceUSD = tour.tourPrice;
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
								<span className="duration-tag">{departure}</span>

								{onLikeTour && (
									<button
										type="button"
										className={`tour-fav-btn ${isLiked ? 'liked' : ''}`}
										onClick={(e) => {
											e.preventDefault();
											onLikeTour(tour._id);
										}}
										aria-label={t('destinations.popularTours.wishlistTour')}
									>
										<span
											className="material-symbols-outlined"
											style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
										>
											favorite
										</span>
									</button>
								)}
							</div>

							<div className="card-details-box">
								<div>
									<div className="location-rating-row">
										<span className="location-text">
											{tour.tourDepartureCity || tour.tourDestinationCity || destinationName}
										</span>
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

									{inclusions.length > 0 && (
										<div className="inclusions-chips-group">
											{inclusions.map((item, tIdx) => (
												<span key={tIdx} className="inclusion-chip">
													{item}
												</span>
											))}
										</div>
									)}
								</div>

								<div className="card-price-package-row">
									<div className="price-box">
										<span className="price-amount">{typeof priceUSD === 'number' ? `$${priceUSD.toLocaleString('en-US')}` : t('destinations.popularTours.priceOnRequest')}</span>
										<span className="price-subtext"> {t('destinations.popularTours.perPerson')}</span>
									</div>
									<Link href={`/tour/detail?id=${tour._id}`} className="view-package-btn">
										{t('destinations.popularTours.viewPackage')}
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
