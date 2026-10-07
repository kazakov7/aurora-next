import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Tour } from '../../types/tour/tour';
import { ToursInquiry } from '../../types/tour/tour.input';
import { Direction, Message } from '../../enums/common.enum';
import { T } from '../../types/common';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';

interface ExperiencesProps {
	initialInput?: ToursInquiry;
}

const defaultTours = [
	{
		_id: 'default-tour-1',
		tourName: 'Nordic Aurora & Husky Trek',
		tourDepartureCity: 'Tromsø, Norway',
		tourPrice: 1450,
		tourCurrency: 'USD',
		tourRating: 4.99,
		tourReviews: 84,
		tourImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuD4kCBFcDG76IWt55QXHb-70Rg0fSt7IG1QJmcnK-dnTQtiXBy0veusU0Hj0b_eLs1_kWPKvjJLNWqLI0c-aMG-5ohgqp7WQYfoTm6FeCjh9894Sf5vZ-IG_lTJrRJQdZq6-joZbVQ0tUtmp23IkuCZvUYuayLFxJhNaRKu-YkXKBLKBpPw3s0o1f9ojpQzjMslABnh3CspOXhfoF1gNcSfLRmwl1VzFn6EMy4Q_EY',
		],
		feature: 'Small Group',
		durationBadge: '3 Days · Expedition',
	},
	{
		_id: 'default-tour-2',
		tourName: 'Sunrise Ballooning & Valleys',
		tourDepartureCity: 'Göreme, Cappadocia',
		tourPrice: 420,
		tourCurrency: 'USD',
		tourRating: 4.96,
		tourReviews: 162,
		tourImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBTZ4DGbPNjAIsEgCleFee6-0rLwmJ-c-ikAV4KeoRnMypx5wPbkpNgWQR8nsfgYhKwqmZc_p2OpfKQiPWX-Yv4swT1RfYgxIUkygck87_PBsrfpMKPyDFoZt0NMDuaCCyeA2zRZc81VZ2twiyhlqvm-qRHOIxkT1CwiYq2xtOLt6335yZKeWCnoiQYbCdm7Xd7agbLq-Lo2bqb7y6uK_lmYaa2cYZM8T9XHApaleI',
		],
		feature: 'Champagne Flight',
		durationBadge: 'Half Day · Aerial',
	},
	{
		_id: 'default-tour-3',
		tourName: 'Atacama Stargazing & Salt',
		tourDepartureCity: 'San Pedro, Chile',
		tourPrice: 890,
		tourCurrency: 'USD',
		tourRating: 5.0,
		tourReviews: 48,
		tourImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDuotuEzK86iGGtdD43O-sTQ7EdtcJTsAjsEDAno8M3FImVZH5fCE-mJY0jY8zV2M_nGRkiGSTIXJpQomlqchAb8b9uOgJtgZHyXW-LmfpEx188blHd8pa9lBkNd0Z8TYL9686deO72gqJ2zPU1a56alXrjyQ5tXYrLxFCxvfe6l1jBy1nWVJXlcaQ32u6CryUNZv0mgCd0Wr5vtkzlScWhLOQlCJkzrpmTzvm2hxg',
		],
		feature: 'Private 4x4',
		durationBadge: '2 Days · Dark Sky',
	},
	{
		_id: 'default-tour-4',
		tourName: 'Private Cyclades Sea Passage',
		tourDepartureCity: 'Milos & Polyaigos, Greece',
		tourPrice: 720,
		tourCurrency: 'USD',
		tourRating: 4.94,
		tourReviews: 95,
		tourImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDaxljwTDIaucDltMZ_NitryCqaL6Y4wHw1iyI6P32SJPOW37bJa2ZafsApzRgvK_w2W9XW_EOSGYg5kaWYkw7CV0iilAfaUyKON8_5ijQul6WbeTUPMoMP2wrduERe4dg0hPCwBHpmGRIeIuKjuo4tv0j8quagR2wNbCNcb_9ikxTzpzxrYs6KMyU1UeB_fZLaI03q1HXifJ7T9JJnleElHzyVvREsaUK0JXE4ehg',
		],
		feature: 'Lunch Included',
		durationBadge: 'Full Day · Yacht',
	},
];

const Experiences = ({ initialInput }: ExperiencesProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [tours, setTours] = useState<Tour[]>([]);

	const queryInput: ToursInquiry = initialInput || {
		page: 1,
		limit: 4,
		sort: 'tourViews',
		direction: Direction.DESC,
		search: {},
	};

	/** APOLLO REQUESTS **/
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const { data, refetch: refetchTours } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const list = data?.getTours?.list;
		if (list && list.length > 0) {
			setTours(list);
		}
	}, [data]);

	/** HANDLERS **/
	const likeTourHandler = async (e: React.MouseEvent, tourId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({
				variables: { tourId },
			});
			await refetchTours({ input: queryInput });
			await sweetTopSmallSuccessAlert('Tour liked!', 800);
		} catch (err: any) {
			console.log('ERROR, likeTourHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const pushDetailHandler = (tour: Tour | any) => {
		if (tour._id && !tour._id.startsWith('default-')) {
			router.push({
				pathname: '/tour/detail',
				query: { id: tour._id },
			});
		} else {
			router.push('/tour');
		}
	};

	const displayTours = Array.from({ length: 4 }).map((_, index) => {
		if (tours[index]) return tours[index];
		return defaultTours[index];
	});

	return (
		<section className="experiences-section">
			<div className="section-container">
				{/* Section Header */}
				<div className="section-header">
					<div>
						<span className="section-tag">Guided Immersions</span>
						<h2 className="section-title">Experiences Worth Taking</h2>
					</div>
					<Link href="/tour" className="section-link">
						<span>View curated tours</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>

				{/* Tours Grid */}
				<div className="tours-grid">
					{displayTours.map((tour: any, idx: number) => {
						const isLiked = tour?.meLiked && tour?.meLiked[0]?.myFavorite;
						const imageUrl = getImageUrl(
							tour.tourImages?.[0],
							defaultTours[idx % defaultTours.length].tourImages[0],
						);
						const departure =
							tour.tourDepartureCity ||
							tour.tourDepartureCountry ||
							defaultTours[idx % defaultTours.length].tourDepartureCity;
						const destination = tour.tourDestinationCity ? ` · To ${tour.tourDestinationCity}` : '';

						return (
							<div
								key={tour._id || idx}
								className="tour-card cursor-pointer"
								onClick={() => pushDetailHandler(tour)}
							>
								<div className="card-image-box">
									<img
										src={imageUrl}
										alt={tour.tourName}
										className="tour-img"
										onError={(e: any) => {
											e.target.src = defaultTours[idx % defaultTours.length].tourImages[0];
										}}
									/>
									<span className="duration-badge">
										{tour.durationBadge ||
											(tour.tourCapacity ? `${tour.tourCapacity} Guests Max` : 'Curated Expedition')}
									</span>
								</div>

								<div className="card-body">
									<div className="rating-row">
										<span
											className="material-symbols-outlined star-icon"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											star
										</span>
										<span className="rating-text">
											{tour.tourRating ? tour.tourRating.toFixed(2) : '4.98'} ({tour.tourReviews || 36})
										</span>
									</div>

									<h3 className="tour-title">{tour.tourName}</h3>
									<p className="tour-subtitle">
										{departure}
										{destination}
									</p>

									<div className="tour-footer">
										<div className="price-col">
											<span className="from-text">From</span>
											<span className="price-text">
												{tour.tourCurrency === 'KRW' ? '₩' : '$'}
												{tour.tourPrice?.toLocaleString()}
											</span>
										</div>
										<span className="feature-badge">
											{tour.feature || (tour.tourStatus ? 'Featured' : 'Instant Booking')}
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default Experiences;
