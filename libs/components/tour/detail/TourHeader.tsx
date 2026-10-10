import React from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { getDurationDays } from '../../../utils';
import { useI18n } from '../../../i18n';
import { FadeIn } from '../../motion/FadeIn';

interface TourHeaderProps {
	tour: Tour;
	isLiked: boolean;
	likeHandler: () => void;
}

const TourHeader = ({ tour, isLiked, likeHandler }: TourHeaderProps) => {
	const { t, tEnum } = useI18n();
	const ratingVal = typeof tour.tourRating === 'number' ? tour.tourRating.toFixed(2) : '—';
	const reviewsCount = tour.tourReviews ?? 0;

	const durationDays = getDurationDays(tour.tourStartDate, tour.tourEndDate);
	const duration = durationDays ? t('common.days', { count: durationDays }) : t('common.durationUnavailable');

	const shareHandler = async () => {
		try {
			if (typeof window !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(window.location.href);
				await sweetTopSmallSuccessAlert(t('common.linkCopied'));
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<FadeIn distance={12} className="tour-header-section">
			{/* 1. Breadcrumbs */}
			<nav aria-label={t('common.breadcrumb')} className="breadcrumbs-nav">
				<Link href="/" className="crumb-link">
					{t('navigation.home')}
				</Link>
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				<Link href="/tour" className="crumb-link">
					{t('navigation.tours')}
				</Link>
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				{tour.tourDestinationCity ? <span className="crumb-text">{tour.tourDestinationCity}</span> : null}
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				<span className="crumb-active truncate">{tour.tourName}</span>
			</nav>

			{/* 2. Title & Header Actions */}
			<div className="title-actions-bar">
				<div className="title-info-group">
					<div className="badges-row">
						<span className="badge-tag primary-badge">{tEnum('tourStatus', tour.tourStatus)}</span>
					</div>
					<h1 className="tour-main-title">{tour.tourName}</h1>
					<div className="meta-info-row">
						<div className="rating-pill">
							<span
								className="material-symbols-outlined star-icon"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								star
							</span>
							<span className="score">{ratingVal}</span>
							<span className="reviews-link">{t('tours.header.reviews', { reviewsCount })}</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">location_on</span>
							<span>{tour.tourDestinationCity || t('tours.header.destinationUnavailable')}</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">schedule</span>
							<span>{duration}</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">flight_takeoff</span>
							<span>
								{t('tours.header.departs', { place: [tour.tourDepartureCity, tour.tourDepartureCountry].filter(Boolean).join(', ') || t('tours.header.locationUnavailable') })}
							</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="actions-group">
					<button className="action-pill-btn" type="button" onClick={shareHandler}>
						<span className="material-symbols-outlined">share</span>
						<span>{t('common.share')}</span>
					</button>
					<button
						className={`action-pill-btn like-btn ${isLiked ? 'liked' : ''}`}
						type="button"
						onClick={likeHandler}
					>
						<span
							className="material-symbols-outlined fav-icon"
							style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
						>
							favorite
						</span>
						<span>{isLiked ? t('tours.header.liked') : t('common.like')}</span>
					</button>
				</div>
			</div>
		</FadeIn>
	);
};

export default TourHeader;
