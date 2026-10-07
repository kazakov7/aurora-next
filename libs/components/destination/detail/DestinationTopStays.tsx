import React from 'react';
import Link from 'next/link';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';

interface DestinationTopStaysProps {
	destinationName: string;
	properties: Property[];
	onLikeProperty?: (propertyId: string) => void;
}

const fallbackPropertyImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDxa1CW9My3Pj1BJAePWpuWcypYOot-2rQQRVl8jSXjQ6CzzVTmEvMhnVkQ2oA-Rkm8QqY0-y71FOZwcVllTWdVtpL23-ymsGbXr8v450B1gWnNSwG_1I-i998PcMqr17p3CNTNN56fGev_DEEp3ADw6vgaD-LW4cX5CYsq0tSGIeleGga4o7iJ4KaAIdXAsoKITWDXARESJaPABBvwXM4yl-BAExtEs6nvVlxZAairr5sIqMD9DE3A',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD3x23-7Gw1rfhyWVVYZIAZ91Fqi5bbtRV_2uKpXk2qBuR0MZAV9uY6_2VEytjYi-1u070_Vf047BJHLVZxdJzdoD5RDFHe66cltQgMSr7o3gGTeJ0ShD0MTD9VVDkL4IvdEsvlhDM8VJiZYXzjVnuHXKTh1d5yQAmpFBGX19qdZiHvRsthXP4R3m5nLPfNDPvE3BJz7GcxYQSYF-UHaeyvz73dG6NSi2PXidQN0hly7k8yfvR0WhIy',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDqq3k0xMzmZGuctsqptTuYZQsVhjiQdQ4se9J2JimNlqTedSbrsEVfWZsENWw24cHpB-2x8bZwE8wpQXSWueSHYGTOCDKRQHSAafCrCEOJUmS0X5lNqk7L1mxedkyqVlqtjbkTIkdksJQGQvtQOvR63HZCtTEXTkObarXeKEy2_j1e22_vyWhnbdTLq6_sAp-I9PNfkJase2rgZ0T5vGbzLl3Z3-7z-VRUxToMgBtQrcgYH82Y9IEx',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuA6gRItolLUSmoVoAeppFFSnYt882g35Bba7vqN8Lx3-6x-TsGNUNWn1UXKQca6du0h6Cy95MYR2v7hi-lbLEh6_G5qyAVOd7GvCx6-ORz6S6PxgRz5_8YAyU6wq26fFPlIpxampFxRgpNiMkm_jOzeq3hFREz7DjT6Zll5W1lptk4hkI0msetLmUlZMZixv1qfNwGTXfNSdleMncnXxI0tyUzwsM5VMYFy4fd8_vdLoR1x0XhRKYOo',
];

const categoryPills = ['Curated', 'Architectural', 'Coastal Sanctuary', 'Oceanfront'];

const DestinationTopStays = ({
	destinationName,
	properties,
	onLikeProperty,
}: DestinationTopStaysProps) => {
	if (!properties || properties.length === 0) return null;

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
				{displayProperties.map((property, idx) => {
					const fallback = fallbackPropertyImages[idx % fallbackPropertyImages.length];
					const imgUrl = getImageUrl(property.propertyImages?.[0], fallback);
					const pillLabel = categoryPills[idx % categoryPills.length];
					const isLiked = property.meLiked?.[0]?.myFavorite;
					const priceKRW = property.pricePerNight || 120000;
					const rating = (property.propertyRating || 4.95).toFixed(2);
					const reviews = property.propertyReviews || 120 + idx * 25;

					return (
						<article key={property._id || idx} className="stay-card-item">
							<div className="card-media-wrapper">
								<img
									src={imgUrl}
									alt={property.propertyName}
									className="stay-img"
									onError={(e: any) => {
										e.target.src = fallback;
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
										{property.propertyDesc ||
											`${property.propertyType || 'Sanctuary Suite'} · Skyline & Panoramic Views`}
									</p>
								</div>

								<div className="card-price-reserve-row">
									<div className="price-box">
										<span className="price-amount">₩{priceKRW.toLocaleString()}</span>
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
