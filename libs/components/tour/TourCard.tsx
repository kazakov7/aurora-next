import React from 'react';
import { useRouter } from 'next/router';
import { Tour } from '../../types/tour/tour';
import { getImageUrl } from '../../config';
import { getDurationDays } from '../../utils';
import LikeButton from '../common/LikeButton';
import { useI18n } from '../../i18n';

interface TourCardProps {
	tour: Tour;
	likeTourHandler: (event: React.MouseEvent, id: string) => void;
}

const TourCard = ({ tour, likeTourHandler }: TourCardProps) => {
	const { tEnum, t, formatDate } = useI18n();
	const durationDays = getDurationDays(tour.tourStartDate, tour.tourEndDate);
	const duration = durationDays ? t('common.days', { count: durationDays }) : t('common.durationUnavailable');
	const schedule = `${duration} · ${formatDate(tour.tourStartDate) || t('common.dateUnavailable')} – ${formatDate(tour.tourEndDate) || t('common.dateUnavailable')}`;
	const router = useRouter();
	const image = getImageUrl(tour.tourImages?.[0]);
	const isLiked = Boolean(tour.meLiked?.[0]?.myFavorite);

	return (
		<article className="tour-card" onClick={() => router.push({ pathname: '/tour/detail', query: { id: tour._id } })}>
			<div className="tour-card-image-box">
				{image ? (
					<img src={image} alt={tour.tourName} className="tour-card-img" />
				) : (
					<div className="tour-card-image-empty">{t('common.noImageAvailable')}</div>
				)}
				{tour.tourStatus ? <span className="tour-card-badge">{tEnum('tourStatus', tour.tourStatus)}</span> : null}
				
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
						<span className="location-name">{[tour.tourDestinationCity, tour.tourDepartureCountry].filter(Boolean).join(', ') || t('tours.card.locationUnavailable')}</span>
					</div>
					<h3 className="tour-title">{tour.tourName}</h3>
					<div className="tour-duration-row">
						<span className="material-symbols-outlined">calendar_month</span>
						<span>{schedule}</span>
					</div>
				</div>
				<div className="tour-card-footer">
					<div className="tour-price-row">
						<div className="price-block">
							<span className="price-label">{t('common.from')}</span>
							<span className="price-amount">${tour.tourPrice.toLocaleString('en-US')}</span>
						</div>
						<span className="price-unit">{t('tours.card.perTraveler')}</span>
					</div>
					<button className="view-package-btn" type="button">
						<span>{t('tours.card.viewPackage')}</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</button>
				</div>
			</div>
		</article>
	);
};

export default TourCard;
