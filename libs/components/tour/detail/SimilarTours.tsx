import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_TOURS } from '../../../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Tour } from '../../../types/tour/tour';
import { getImageUrl } from '../../../config';
import { Message } from '../../../enums/common.enum';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { getDateDuration } from '../../../utils';

interface SimilarToursProps { currentTourId: string; destinationCity?: string; }

const getDuration = (tour: Tour): string => {
	return getDateDuration(tour.tourStartDate, tour.tourEndDate);
};

const SimilarTours = ({ currentTourId, destinationCity }: SimilarToursProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const { data, refetch } = useQuery(GET_TOURS, { fetchPolicy: 'network-only', variables: { input: { page: 1, limit: 5, search: destinationCity ? { tourDestinationCity: destinationCity } : {} } } });
	const tours: Tour[] = data?.getTours?.list || [];
	const similarTours = tours.filter((tour) => tour._id !== currentTourId).slice(0, 4);

	/** HANDLERS **/
	const handleLike = async (event: React.MouseEvent, tourId: string) => {
		event.stopPropagation();
		if (!user?._id) { await sweetErrorAlert(Message.NOT_AUTHENTICATED); return; }
		try {
			await likeTargetTour({ variables: { tourId } });
			await refetch();
			await sweetTopSmallSuccessAlert('Saved to favorites', 800);
		} catch (error: unknown) {
			await sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update favorite.');
		}
	};

	return <section className="similar-tours-section"><div className="section-header-row"><div><h2 className="section-heading">Similar tours</h2><p className="section-subtext">More tours from the current results.</p></div><Link href="/tour" className="view-all-link"><span>View all tours</span><span className="material-symbols-outlined">arrow_forward</span></Link></div><div className="similar-tours-grid">{similarTours.map((tour) => { const image = getImageUrl(tour.tourImages?.[0]); const isLiked = Boolean(tour.meLiked?.[0]?.myFavorite); const rating = typeof tour.tourRating === 'number' ? tour.tourRating.toFixed(2) : '—'; return <article key={tour._id} className="similar-tour-card" onClick={() => router.push(`/tour/detail?id=${tour._id}`)}><div className="card-image-box">{image ? <img src={image} alt={tour.tourName} className="card-img" /> : <div className="card-image-empty">No image available</div>}{tour.tourDestinationCity ? <span className="card-dest-pill">{tour.tourDestinationCity}</span> : null}<button className={`card-heart-btn ${isLiked ? 'liked' : ''}`} type="button" aria-label="Save tour" onClick={(event) => handleLike(event, tour._id)}><span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span></button></div><div className="card-info-box"><div className="card-meta-line"><span className="duration-capacity">{getDuration(tour)} · {tour.tourCapacity} seats</span><div className="rating-tag"><span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span><span>{rating}</span></div></div><h3 className="card-title">{tour.tourName}</h3><p className="card-subtitle">{tour.tourStatus}</p><div className="card-bottom-line"><div className="price-group"><span className="price-tag">₩{tour.tourPrice.toLocaleString()}</span><span className="traveler-tag">/ traveler</span></div></div></div></article>; })}</div></section>;
};

export default SimilarTours;
