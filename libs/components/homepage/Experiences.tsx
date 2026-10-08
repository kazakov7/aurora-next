import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_TOURS } from '../../../apollo/user/query';
import { Tour } from '../../types/tour/tour';
import { ToursInquiry } from '../../types/tour/tour.input';
import { Direction } from '../../enums/common.enum';
import { getImageUrl } from '../../config';

interface ExperiencesProps {
	initialInput?: ToursInquiry;
}

const formatKrw = (price?: number) => (typeof price === 'number' ? `₩${price.toLocaleString()}` : 'Price on request');

const Experiences = ({ initialInput }: ExperiencesProps) => {
	const router = useRouter();
	const queryInput: ToursInquiry = initialInput || {
		page: 1,
		limit: 4,
		sort: 'tourViews',
		direction: Direction.DESC,
		search: {},
	};

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_TOURS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
		notifyOnNetworkStatusChange: true,
		ssr: false,
	});
	const tours: Tour[] = data?.getTours?.list ?? [];

	/** HANDLERS **/
	const pushDetailHandler = (tourId: string) => router.push({ pathname: '/tour/detail', query: { id: tourId } });

	return (
		<section className="experiences-section">
			<div className="section-container">
				<div className="section-header">
					<div>
						<span className="section-tag">Guided Immersions</span>
						<h2 className="section-title">Experiences Worth Taking</h2>
					</div>
					<Link href="/tour" className="section-link"><span>View curated tours</span><span className="material-symbols-outlined">arrow_forward</span></Link>
				</div>

				<div className="tours-grid">
					{tours.map((tour) => {
						const imageUrl = getImageUrl(tour.tourImages?.[0]);
						const departure = [tour.tourDepartureCity, tour.tourDepartureCountry].filter(Boolean).join(', ');
						const destination = tour.tourDestinationCity ? ` · To ${tour.tourDestinationCity}` : '';

						return (
							<div key={tour._id} className="tour-card cursor-pointer" onClick={() => pushDetailHandler(tour._id)}>
								<div className="card-image-box">
									{imageUrl ? <img src={imageUrl} alt={tour.tourName} className="tour-img" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
									<span className="duration-badge">{typeof tour.tourCapacity === 'number' ? `${tour.tourCapacity} Guests Max` : 'Capacity unavailable'}</span>
								</div>
								<div className="card-body">
									<div className="rating-row"><span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span><span className="rating-text">{typeof tour.tourRating === 'number' ? tour.tourRating.toFixed(2) : '—'} ({tour.tourReviews ?? 0})</span></div>
									<h3 className="tour-title">{tour.tourName}</h3>
									{departure || destination ? <p className="tour-subtitle">{departure}{destination}</p> : null}
									<div className="tour-footer">
										<div className="price-col"><span className="from-text">From</span><span className="price-text">{formatKrw(tour.tourPrice)}</span></div>
										<span className="feature-badge">{tour.tourStatus}</span>
									</div>
								</div>
							</div>
						);
					})}
					{!loading && tours.length === 0 ? <p className="tours-empty-state">No tours available yet.</p> : null}
				</div>
			</div>
		</section>
	);
};

export default Experiences;
