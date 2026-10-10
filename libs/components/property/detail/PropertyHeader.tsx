import React from 'react';
import Link from 'next/link';
import { Property } from '../../../types/property/property';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { useI18n } from '../../../i18n';

interface PropertyHeaderProps {
	property: Property;
	isLiked: boolean;
	likeHandler: () => void;
}

const PropertyHeader = ({ property, isLiked, likeHandler }: PropertyHeaderProps) => {
	const { t, tEnum } = useI18n();
	const ratingVal = typeof property.propertyRating === 'number' ? property.propertyRating.toFixed(2) : '—';
	const reviewsCount = property.propertyReviews ?? 0;

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
		<div className="property-header-section">
			{/* 1. Breadcrumbs */}
			<nav aria-label={t('common.breadcrumb')} className="breadcrumbs-nav">
				<Link href="/" className="crumb-link">
					{t('navigation.home')}
				</Link>
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				<Link href="/property" className="crumb-link">
					{t('navigation.hotels')}
				</Link>
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				{property.propertyCity ? <span className="crumb-text">{property.propertyCity}</span> : null}
				<span className="material-symbols-outlined crumb-sep">chevron_right</span>
				<span className="crumb-active truncate">{property.propertyName}</span>
			</nav>

			{/* 2. Title & Header Actions */}
			<div className="title-actions-bar">
				<div className="title-info-group">
					<div className="badges-row">
						<span className="badge-tag primary-badge">{tEnum('propertyType', property.propertyType)}</span>
						<span className="badge-tag">{tEnum('propertyStatus', property.propertyStatus)}</span>
					</div>
					<h1 className="property-main-title">{property.propertyName}</h1>
					<div className="meta-info-row">
						<div className="rating-pill">
							<span
								className="material-symbols-outlined star-icon"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								star
							</span>
							<span className="score">{ratingVal}</span>
							<span className="reviews-link">{t('hotels.header.reviews', { reviewsCount })}</span>
						</div>
						<span className="dot-divider">•</span>
						<div className="location-item">
							<span className="material-symbols-outlined">location_on</span>
							<span>
								{[property.propertyCity, property.propertyAddress].filter(Boolean).join(', ')}
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
						<span>{isLiked ? t('hotels.header.liked') : t('common.like')}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default PropertyHeader;
