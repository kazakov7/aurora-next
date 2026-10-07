import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Tour } from '../../types/tour/tour';
import { getImageUrl } from '../../config';

interface TourCardProps {
	tour: Tour;
	index?: number;
	likeTourHandler: (e: React.MouseEvent, id: string) => void;
}

const fallbackTourImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDl3i9FYscrY06caRD6UUHmLQNDG5tOKjnKxel7IMhk4IzX53vq6PZDmnY4qtKu21wnzzXoigBGECpA675OMfFVAOk2W9whTnWdzpig7JybeVeGJX87-zaXl58deZr1rBrX3OXCc3a5HIsFIKNmxd4haifCvB7LyZweHlUFAVEfdkKcvpnU-tQCwZ8VsLlQeeYQ1qUV4-IDkEiiaY7DDRZ-AhNA26mLflVFezjC4VqkUhd2AHlP1ReI',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuB4ddL1RToE9q0g-mWW3Z8Bjmvm98IxTYruzW8M2CZNqDXI32yTi5G96K6n3GIqHzXzSk6DybZZ1w7IZHU8VuK2eVMwr6eeGEwxeSmZGsFF3E2Km8WvpddXGWCCzHe7aMnvkKYRVv7j370AHYoY6kJJCZhyap0Pw0ncXF9_xGCbB41ADLNyQ5RT83qiB4yE1I7euZTjpju5cOUqeZs-rxg3H3l6hDYU7XHDBzwkU0rMvwMuYSQ-cL8_',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNWfgeaIGUFXi1aELFR3Arme0ky9FF16IDx0nnOtGJrHDQG0rgNx4yHL0dQmX02hVxBDJ_spdhVtUnoG8ymdoEX7caHaSuq-pg1Wlr7VGcWv7jJ2Ujav3FmU2ma1WMHouyqO2HQdsyL_0Igte1kE0NRMYFfhoSIEvghhNjNh86LoqSv1IBfxOBzefFHCRTKYYi6kmMg5iGQXYmBYUGnMme_Z2Cs2kMEdWxD3b3DlhWNl8M0Hoq4uY',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD-H34LlS6MKAEl0GePVk5Q83H3uMU3gGwgXPKOZc8KIurGKqSKe2GUVcnc72gPykJvXTE0NM3PhOVLK8tOF1J5Gt1u2nMVUDlrTtVb61T4mPRgsnJZx5bdjRz9tWc--Ac1DOg73RLPhjFy9EAtSvxI35Ys5Mmt-3z8MUVYpKrcDQc-2EIKAhlEqIcJVROpskgbHw3kq5RoSnXYAgKxoiH5jxMJDgRuS0FMBFePzkqMuIcawiZkTLVR',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAKDrJLLewUvtWh7QwqGhb-IkKXUGpbnGau71JGz6MsTtoiMPQPNjvNGLj3vLFDhuw057zDtyG49kmm6wMkgHp5Jef1woFfcMzWztfQg1LvTQNou7Fl51q5Vd4BSeCb-u_UteFD1wXd8PGqZVv7ba1gnmXZ5unyfEFYynaC7uNf6hjg1jgHw07wTIutH7wblWluLo4JGx5jP74WnpwrajPs8jrJSn-lxMLNLAOSOiLg0ZcQibDZYm1i',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDx57yyyBvFHv9cuhkr4bmfacz5fIMFrKSAftroCYsmPaEAuklTPSAmVdq9CGqnRBL1YYOlqePDbWV6MrpVkeU4YrY7ej1wirTIeee0fniPqfcJRusmJFhf1nsPFObK3YRDamCOeAUPEoZYVE6xvCIlM0ciGR5o5OruOKfM2CsG8v4ijneB6K2xqkUljU7GjjzpYcBsICEIZ_h-hEdwV96Jh5pj8TL8N6jc6UilR1TGE_XGfy59Xth2',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDf5G-mKxqofbBA3VDV8__SjQQRC6T4L2Oy5DVfOCTilX9UW7ckj8XUyxFq7VKiiTemw_v-esvFmR9u5exeKplLibNK1tK_FywR1IjkVw5sd2ldOYwKC4UU4wIKNlzUr-VMrzJEmUu3QqcBrvCRHaUEmR7wZL4TmkWUnnjvodCuKW1IrHhEJcZKW_mQPZEju9YddtUu-cAZrXmh6TMzQ4DcHaoumhhrehw7V2b_YY1GrHgFjDXcnM8p',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAGWmECqgKozIXqw0edhFUvSX_nLIoV2f45yooVRA_IlcDCHD0bNUVA04ZHkKFCCyurTjt9oEgt9Ed4Yy4pTgEOIuRba4sHAb7_ZSuBHWmducuOIyu1jSYfzpHiUUc72X66iz2x9jQzwUkAQkO_O9xzlYcN738vv4bhkWBuHgNykR9fctsbzadPckwjQPuGKPi9AX1kXp7cqX4enRnmRpy354bgtR_IZnmbujtuW8CvUkywk_Ekz9t7',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBD1SGe3m4mqfPvzMHL_gxp5VkKjzqP4j7hde7UoLPI5t-5YYf6JZo5pTGx1MYcTZVVP4hbOphjad7oM7xqOO-Qs17TtuXtM1MrUagM2qP0LssIo6AT9CiitnP2bPdw7oC9lXTOFTG2FKgZBdWDF9jDgoY0l0koxX8_S4Jgs24rsjjsR6WihYdNZu0f1eSrJzh35sVhbHUY9r1uIkc9rA816UHSSJB6nOvJyduy6fGyZqF4cDwCna7p',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDwqxhX5YQAw5mOn-ZmG46YdI2XNd7QKoWLDgqulIqDoOmzD4MTS353YXS6uAI-R5Z1jk3BxghLIcWawHk7BPkJEswcwwEEZ-_m-R_D37b0QLl1LH6IcIHhRwwDhFQEZ-CO_p_4WUVIIZ_TcaYY_NgkbT3tpH6fRhRxkbvDIX-0QwR-QgiGfV7kK0SdWGjGWklyxd9eeLNMKoFXri4s6dFkY-rpgeeLe_xweogvE91cucJhRF9_yO5u',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuC4RWByrQn4Kj3h0aBpzSYsFQKYu2KpQAyoWghRmYvPv9H6K49KN-p2uCt7fYfEMpx7jXHh4xOa2dOtHIMFOSHn0j_DkTrq3PwinftTE-ZHDitnfBuoRn4aWdJa00nKXUF4u_1eccGMbPij_pje7JgvepV6Z9c2jx9seAWyntz550FBklIR35AP4Ofr51tIMt3jzW2I-UPpC0YwO23WPhM5Le2XEmJltcjQXzlOrsp_Tn3vKo1N8OSc',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuArbFmKm-Bcn8UXtY2q9BZW54wwTB68UKG0ou65j7ZoJVjy55saQTl6igoVp_LbA9pcoW4Bmz4c7wXrOBsjJJVTcMR4lIk-xLjnqpH0gXJlJivVXojJ8C9MRlwFf2smmrDI3bZWAactTBoM_3BK_NmyyfrDe53NT9rqlpFz2U86pu3LlGLJPhJxvdNs1rLILxdkRyGqRFEhxmv4CeqqprIJ6Wk_ftqDp1DG30TpyW4_z9yINsA9prbL',
];

const badges = ['Fast Selling', 'Curated', 'Featured', 'Limited Space'];

const fallbackInclusions = [
	['Flights', 'Lodge', 'Breakfast'],
	['Cave Suite', 'Guide', 'Transfers'],
	['4x4 Excursions', 'Eco-Dome', 'Meals'],
	['Catamaran', 'Skipper', 'Snorkel'],
	['Ryokan', 'Tea Ceremony', 'Bullet Train'],
	['Permits', 'Luxury Tents', 'Porters'],
	['Yacht', 'Wine Tasting', 'Villa'],
	['Scenic Train', 'Alpine Chalet', 'Passes'],
];

const TourCard = ({ tour, index = 0, likeTourHandler }: TourCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isLiked = tour?.meLiked && tour?.meLiked[0]?.myFavorite;

	const fallbackImg = fallbackTourImages[index % fallbackTourImages.length];
	const imageSrc = getImageUrl(tour.tourImages?.[0], fallbackImg);
	const badgeText = badges[index % badges.length];

	// Parse duration text
	const getDurationText = () => {
		if (tour.tourStartDate && tour.tourEndDate) {
			const start = new Date(Number(tour.tourStartDate) || tour.tourStartDate);
			const end = new Date(Number(tour.tourEndDate) || tour.tourEndDate);
			const diffDays = Math.max(
				1,
				Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
			);
			const nights = Math.max(1, diffDays - 1);
			const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			return `${nights}N ${diffDays}D · ${startStr} – ${endStr}`;
		}
		return '6N 7D · Oct 18 – Oct 24';
	};

	// Parse inclusions
	let inclusions: string[] = [];
	if (tour.tourAdditionalInfo) {
		try {
			if (typeof tour.tourAdditionalInfo === 'string') {
				inclusions = JSON.parse(tour.tourAdditionalInfo);
			} else if (Array.isArray(tour.tourAdditionalInfo)) {
				inclusions = tour.tourAdditionalInfo;
			}
		} catch (e) {
			inclusions = tour.tourAdditionalInfo.toString().split(',').map((s) => s.trim());
		}
	}
	if (!inclusions || inclusions.length === 0) {
		inclusions = fallbackInclusions[index % fallbackInclusions.length];
	}

	const locationText =
		tour.tourDestinationCity && tour.tourDepartureCountry
			? `${tour.tourDestinationCity}, ${tour.tourDepartureCountry}`
			: tour.tourDestinationCity || 'Tromsø, Norway';

	/** HANDLERS **/
	const pushDetailHandler = () => {
		router.push({
			pathname: '/tour/detail',
			query: { id: tour._id },
		});
	};

	return (
		<article className="tour-card" onClick={pushDetailHandler}>
			{/* Image & Badges */}
			<div className="tour-card-image-box">
				<img
					src={imageSrc}
					alt={tour.tourName}
					className="tour-card-img"
					onError={(e: any) => {
						e.target.src = fallbackImg;
					}}
				/>
				<span className="tour-card-badge">{badgeText}</span>
				<button
					aria-label="Save to Wishlist"
					className={`tour-card-wishlist-btn ${isLiked ? 'liked' : ''}`}
					type="button"
					onClick={(e) => likeTourHandler(e, tour._id)}
				>
					<span
						className="material-symbols-outlined"
						style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
					>
						favorite
					</span>
				</button>
			</div>

			{/* Content */}
			<div className="tour-card-body">
				<div className="tour-card-info">
					{/* Location Pin */}
					<div className="tour-location-row">
						<span className="material-symbols-outlined">pin_drop</span>
						<span className="location-name">{locationText}</span>
					</div>

					{/* Title */}
					<h3 className="tour-title">{tour.tourName}</h3>

					{/* Dates & Duration */}
					<div className="tour-duration-row">
						<span className="material-symbols-outlined">calendar_month</span>
						<span>{getDurationText()}</span>
					</div>

					{/* Inclusions Pills */}
					<div className="tour-inclusions-row">
						{inclusions.slice(0, 3).map((item, idx) => (
							<span key={idx} className="inclusion-pill">
								{item}
							</span>
						))}
					</div>
				</div>

					{/* Price & Action */}
					<div className="tour-card-footer">
						<div className="tour-price-row">
							<div className="price-block">
								<span className="price-label">From</span>
								<span className="price-amount">
									₩{Number(tour.tourPrice || 0).toLocaleString()}
								</span>
							</div>
							<span className="price-unit">Per traveler</span>
						</div>

						<button className="view-package-btn" type="button">
						<span>View Package</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</button>
				</div>
			</div>
		</article>
	);
};

export default TourCard;
