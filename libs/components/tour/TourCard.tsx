import React from 'react';
import { useRouter } from 'next/router';
import { Tour } from '../../types/tour/tour';
import { getImageUrl } from '../../config';
import { formatApiDate, getDateDuration } from '../../utils';
import LikeButton from '../common/LikeButton';

interface TourCardProps {
	tour: Tour;
	likeTourHandler: (event: React.MouseEvent, id: string) => void;
}

const getDuration = (tour: Tour): string => {
	return `${getDateDuration(tour.tourStartDate, tour.tourEndDate)} · ${formatApiDate(tour.tourStartDate)} – ${formatApiDate(tour.tourEndDate)}`;
};

const TourCard = ({ tour, likeTourHandler }: TourCardProps) => {
	const router = useRouter();
	const image = getImageUrl(tour.tourImages?.[0]);
	const isLiked = Boolean(tour.meLiked?.[0]?.myFavorite);

	return (
		<article className="tour-card" onClick={() => router.push({ pathname: '/tour/detail', query: { id: tour._id } })}>
			<div className="tour-card-image-box">
				{image ? (
					<img src={image} alt={tour.tourName} className="tour-card-img" />
				) : (
					<div className="tour-card-image-empty">No image available</div>
				)}
				{tour.tourStatus ? <span className="tour-card-badge">{tour.tourStatus}</span> : null}
				
				<div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
					<LikeButton 
						isLiked={isLiked} 
						onClick={(event) => likeTourHandler(event, tour._id)}
						style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
					/>
				</div>
			</div>
			
			<div className="tour-card-body">
				<div className="tour-card-info">
					<div className="tour-location-row">
						<span className="material-symbols-outlined">pin_drop</span>
						<span className="location-name">{[tour.tourDestinationCity, tour.tourDepartureCountry].filter(Boolean).join(', ') || 'Location unavailable'}</span>
					</div>
					<h3 className="tour-title">{tour.tourName}</h3>
					<div className="tour-duration-row">
						<span className="material-symbols-outlined">calendar_month</span>
						<span>{getDuration(tour)}</span>
					</div>
				</div>
				<div className="tour-card-footer">
					<div className="tour-price-row">
						<div className="price-block">
							<span className="price-label">From</span>
							<span className="price-amount">₩{tour.tourPrice.toLocaleString()}</span>
						</div>
						<span className="price-unit">Per traveler</span>
					</div>
					<button className="view-package-btn" type="button">
						<span>View package</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</button>
				</div>
			</div>
		</article>
	);
};

export default TourCard;
