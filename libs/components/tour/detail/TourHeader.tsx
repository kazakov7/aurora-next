import React from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { getDateDuration } from '../../../utils';

interface TourHeaderProps {
	tour: Tour;
	isLiked: boolean;
	likeHandler: () => void;
}

const TourHeader = ({ tour, isLiked, likeHandler }: TourHeaderProps) => {
	const ratingVal = typeof tour.tourRating === 'number' ? tour.tourRating.toFixed(2) : '—';
	const reviewsCount = tour.tourReviews ?? 0;

	const duration = getDateDuration(tour.tourStartDate, tour.tourEndDate);

	const shareHandler = async () => {
		try {
			if (typeof window !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(window.location.href);
				await sweetTopSmallSuccessAlert('Link copied to clipboard!');
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="tour-header-section">
			{/* 1. Breadcrumbs */}
			<nav aria-label="Breadcrumb" className="breadcrumbs-nav">
				<Link href="/" className="crumb-link">
					Home
				</Link>
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				<Link href="/tour" className="crumb-link">
					Tours
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
						<span className="badge-tag primary-badge">{tour.tourStatus}</span>
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
							<span className="reviews-link">({reviewsCount} reviews)</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">location_on</span>
							<span>{tour.tourDestinationCity || 'Destination unavailable'}</span>
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
								Departs: {[tour.tourDepartureCity, tour.tourDepartureCountry].filter(Boolean).join(', ') || 'Location unavailable'}
							</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="actions-group">
					<button className="action-pill-btn" type="button" onClick={shareHandler}>
						<span className="material-symbols-outlined">share</span>
						<span>Share</span>
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
						<span>{isLiked ? 'Liked' : 'Like'}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default TourHeader;
