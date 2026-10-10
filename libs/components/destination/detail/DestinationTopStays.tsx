import React from 'react';
import Link from 'next/link';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';
import { DEFAULT_PROPERTY_IMAGE } from '../../../config';
import { ApolloError } from '@apollo/client';

interface DestinationTopStaysProps {
	destinationName: string;
	properties: Property[];
	onLikeProperty?: (propertyId: string) => void;
	loading?: boolean;
	error?: ApolloError;
}

const DestinationTopStays = ({
	destinationName,
	properties,
	onLikeProperty,
	loading,
	error,
}: DestinationTopStaysProps) => {
	if (!loading && !error && (!properties || properties.length === 0)) return null;

	// Display exactly up to 4 items in 1 row on Desktop
	const displayProperties = properties.slice(0, 4);

	return (
		<section className="destination-top-stays-section">
			{/* Section Header */}
			<div className="section-header-row">
				<div>
					<h2 className="section-main-title">Top Stays in {destinationName}</h2>
					<p className="section-sub-title">Discover exceptional places to stay.</p>
				</div>
				<Link href="/property" className="view-all-header-link">
					<span>View All Hotels</span>
					<span className="material-symbols-outlined">arrow_forward</span>
				</Link>
			</div>

			{/* Exactly 4 Hotel Cards in 1 Row on Desktop */}
			<div className="stays-cards-grid">
				{loading ? <p>Loading top stays…</p> : null}
				{!loading && error ? <p>Top stays are unavailable right now.</p> : null}
				{displayProperties.map((property, idx) => {
					const imgUrl = getImageUrl(property.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE);
					const pillLabel = property.propertyType;
					const isLiked = property.meLiked?.[0]?.myFavorite;
					const priceUSD = property.pricePerNight;
					const rating = typeof property.propertyRating === 'number' ? property.propertyRating.toFixed(2) : '—';
					const reviews = property.propertyReviews ?? 0;

					return (
						<article key={property._id || idx} className="stay-card-item">
							<div className="card-media-wrapper">
								<img
									src={imgUrl}
									alt={property.propertyName}
									className="stay-img"
									onError={(e: any) => {
										e.target.src = DEFAULT_PROPERTY_IMAGE;
									}}
								/>
								<span className="stay-badge-pill">{pillLabel}</span>

								{onLikeProperty && (
									<button
										type="button"
										className={`stay-fav-btn ${isLiked ? 'liked' : ''}`}
										onClick={(e) => {
											e.preventDefault();
											onLikeProperty(property._id);
										}}
										aria-label="Save to Wishlist"
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
											{property.propertyCity || property.propertyAddress || destinationName}
										</span>
										<span className="rating-badge">
											<span
												className="material-symbols-outlined icon-star"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												star
											</span>
											<span className="rating-num">{rating}</span>
											<span className="reviews-count">({reviews})</span>
										</span>
									</div>

									<h3 className="stay-name-title">{property.propertyName}</h3>
									<p className="stay-specs-desc">
										{property.propertyDesc || property.propertyType}
									</p>
								</div>

								<div className="card-price-reserve-row">
									<div className="price-box">
										<span className="price-amount">{typeof priceUSD === 'number' ? `$${priceUSD.toLocaleString()}` : 'Price on request'}</span>
										<span className="price-unit"> / night</span>
									</div>
									<Link href={`/property/detail?id=${property._id}`} className="reserve-btn-link">
										Reserve
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

export default DestinationTopStays;
