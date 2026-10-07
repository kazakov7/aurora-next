import React from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { getImageUrl } from '../../../config';

interface DestinationPopularToursProps {
	destinationName: string;
	tours: Tour[];
	onLikeTour?: (tourId: string) => void;
}

const fallbackTourImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAcmRnGEorvdr5yd3I6vPiW5QuUqQFvijohi-znk9aduV9brKvMztnQWlAOWbz19bO26kjf6o1X9eAkNo-bVHblKQxA2jEdv0R6QebaWiOACxPseO-VqkO4bIY4CtbEEcXHE9c7EGPBLNKJsREpdQyIM-KFMlR7nUhjebAgXihnu_Zuq8fZDYNMaZSUTW_0HueyAAMmOsBQRDT1DaFZ7hjIPoB2gjpqKLSJ2khi7n5JjBeOHe_GWXJi',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuA-tCX_tRbldF7RbYNToMTZXR5njlk_MWCb7BflPZQatawTlnK6DNC1w1DGnodHkcjVdxCMaPWSurKNKec_1yrnhf46kgcOxP-Hq7J9pT7SKSK0H1pbfCSrInAfYyQgAs-SEJTSdu7fkPpSsRmxnXSrftmmFC3yXgzLI9N2Q0ZE8sIdy54eM3q10c9UCogDotFniY9QeYrZKYsFfzRbm5aqIBbnVIkNGwX8AI20QoxasVPmgbKOj5aU',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAN3_cgo6sKpA7QDW82-P2FuBvbbA3R9Cu7CUt2K8Gv_3rht4Oayf3FcyzptkQkZxcsq1rGaoEn5DP_DlO00Fx9Y8w855LIQFPFQIfVedmVFriCl496LtygxMeS6XWlhzD5ZeL-7_IyMl0g3KlS2mihqqIUnJl0OB0gnetgNe4zBglol0x4s33q-Nf_YLINCzWkDMKTij0Asyeci9v5MwdodWUdaGqZvHPPAomi5zU-FR3JBjUfiyw6',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCmEU55DnOzkWpBLEs3B7Hx-_JWziex0iTpcOl5Az4lDKtGMZmOj2G14OX41qEX9VjYEYAQI78XreacFM7DKPqZ6WeWCfD-azd48yVPDwW5FAibN7rTDjphtnyIo4jeyw8JGhIeeDmP2_7rt1sFJ8BbuhfcaXkvLJchlQdA7IdlZN5WfdKZrnqFVSI_WbeiO4jDbBaVVaGw7OtAbBNEw_ojkGY6MJfJOwRVe6ffuvrBu1V_PxhZygD_',
];

const sampleInclusions = [
	['Private Guide', 'Hanok Tea', 'Michelin Dining'],
	['Olle Trail Hike', 'Haenyeo Session', 'Luxury Stay'],
	['Yacht Charter', 'Street Food Class', 'Hot Springs'],
	['UNESCO Sites', 'Scholar Lead', 'Hanok Stay'],
];

const DestinationPopularTours = ({
	destinationName,
	tours,
	onLikeTour,
}: DestinationPopularToursProps) => {
	if (!tours || tours.length === 0) return null;

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
				{displayTours.map((tour, idx) => {
					const fallback = fallbackTourImages[idx % fallbackTourImages.length];
					const imgUrl = getImageUrl(tour.tourImages?.[0], fallback);
					const inclusions = sampleInclusions[idx % sampleInclusions.length];
					const isLiked = tour.meLiked?.[0]?.myFavorite;
					const priceKRW = tour.tourPrice || 450000;
					const rating = (tour.tourRating || 4.95).toFixed(2);
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
										e.target.src = fallback;
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
									<span>4 Days / 3 Nights</span>
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
										<span className="price-amount">₩{priceKRW.toLocaleString()}</span>
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
