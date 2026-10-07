import React from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface TourHeaderProps {
	tour: Tour;
	isLiked: boolean;
	likeHandler: () => void;
}

const TourHeader = ({ tour, isLiked, likeHandler }: TourHeaderProps) => {
	const ratingVal = tour?.tourRating ? tour.tourRating.toFixed(2) : '4.96';
	const reviewsCount = tour?.tourReviews || 184;

	// Calculate duration text
	const getDurationText = () => {
		if (tour?.tourStartDate && tour?.tourEndDate) {
			const start = new Date(Number(tour.tourStartDate) || tour.tourStartDate);
			const end = new Date(Number(tour.tourEndDate) || tour.tourEndDate);
			const diffDays = Math.max(
				1,
				Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
			);
			const nights = Math.max(1, diffDays - 1);
			return `${diffDays} Days / ${nights} Nights`;
		}
		return '7 Days / 6 Nights';
	};

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
				<span className="crumb-text">{tour?.tourDestinationCity || 'Switzerland'}</span>
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				<span className="crumb-active truncate">{tour?.tourName || 'Swiss Alps Discovery'}</span>
			</nav>

			{/* 2. Title & Header Actions */}
			<div className="title-actions-bar">
				<div className="title-info-group">
					<div className="badges-row">
						<span className="badge-tag primary-badge">Curated Expedition</span>
						<span className="badge-tag subtle-badge">Bestseller</span>
					</div>
					<h1 className="tour-main-title">{tour?.tourName || 'Swiss Alps Discovery — 7 Days'}</h1>
					<div className="meta-info-row">
						<div className="rating-pill">
							<span
								className="material-symbols-outlined star-icon"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								star
							</span>
							<span className="score">{ratingVal}</span>
							<span className="reviews-link">({reviewsCount} verified reviews)</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">location_on</span>
							<span>{tour?.tourDestinationCity || 'Switzerland'}</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">schedule</span>
							<span>{getDurationText()}</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="meta-item">
							<span className="material-symbols-outlined">flight_takeoff</span>
							<span>
								Departs: {tour?.tourDepartureCity || 'Seoul'}, {tour?.tourDepartureCountry || 'South Korea'}
							</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="cert-item">
							<span className="material-symbols-outlined">verified_user</span>
							<span>Swiss Alpine Certified</span>
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
						className={`action-pill-btn save-btn ${isLiked ? 'liked' : ''}`}
						type="button"
						onClick={likeHandler}
					>
						<span
							className="material-symbols-outlined fav-icon"
							style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
						>
							favorite
						</span>
						<span>{isLiked ? 'Saved' : 'Save'}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default TourHeader;
