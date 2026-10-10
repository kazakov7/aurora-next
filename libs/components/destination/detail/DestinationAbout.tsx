import React, { useState } from 'react';
import Link from 'next/link';
import { Destination } from '../../../types/destination/destination';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface DestinationAboutProps {
	destination: Destination;
	onLike: (destinationId: string) => void;
	isLiked: boolean;
	likesCount: number;
	commentsCount: number;
}

const DestinationAbout = ({ destination, onLike, isLiked, likesCount, commentsCount }: DestinationAboutProps) => {
	const [shareCopied, setShareCopied] = useState(false);
	const ratingValue = typeof destination.destinationRating === 'number' ? destination.destinationRating.toFixed(1) : '—';
	const reviewsTotal = destination.destinationReviews ?? 0;
	const hasCoordinates = typeof destination.latitude === 'number' && typeof destination.longitude === 'number';

	/** HANDLERS **/
	const handleShare = async () => {
		if (typeof window === 'undefined' || !navigator.clipboard) return;

		await navigator.clipboard.writeText(window.location.href);
		setShareCopied(true);
		await sweetTopSmallSuccessAlert('Link copied to clipboard!', 900);
		setTimeout(() => setShareCopied(false), 2000);
	};

	return (
		<section className="destination-about-section">
			<div className="about-grid-layout">
				<div className="editorial-col">
					<nav aria-label="Breadcrumb" className="about-breadcrumb-nav">
						<Link href="/destination">Destinations</Link>
						<span>/</span>
						<Link href={{ pathname: '/destination', query: { search: destination.destinationCountry } }}>
							{destination.destinationCountry}
						</Link>
						<span>/</span>
						<strong>{destination.destinationName}</strong>
					</nav>

					<span className="editorial-eyebrow">Destination overview</span>
					<h1 className="editorial-heading">Discover {destination.destinationName}</h1>
					{destination.destinationDesc ? (
						<p className="editorial-paragraph">{destination.destinationDesc}</p>
					) : (
						<p className="editorial-paragraph is-empty">Destination description is not available yet.</p>
					)}

					<div className="about-stats-row" aria-label="Destination engagement">
						<div className="about-stat">
							<span className="material-symbols-outlined">visibility</span>
							<strong>{(destination.destinationViews ?? 0).toLocaleString()}</strong>
							<span>views</span>
						</div>
						<button type="button" className={`about-stat ${isLiked ? 'liked' : ''}`} onClick={() => onLike(destination._id)} aria-label="Like destination">
							<span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
							<strong>{likesCount.toLocaleString()}</strong>
							<span>likes</span>
						</button>
						<a href="#traveler-comments" className="about-stat" title="Jump to traveler comments">
							<span className="material-symbols-outlined">chat_bubble</span>
							<strong>{commentsCount.toLocaleString()}</strong>
							<span>comments</span>
						</a>
						<div className="about-stat rating">
							<span className="material-symbols-outlined">star</span>
							<strong>{ratingValue}</strong>
							<span>({reviewsTotal.toLocaleString()} reviews)</span>
						</div>
					</div>

					<div className="about-actions-row">
						<button type="button" className="about-action secondary" onClick={handleShare}>
							<span className="material-symbols-outlined">share</span>
							{shareCopied ? 'Copied Link!' : 'Share'}
						</button>
						<a href="#cities" className="about-action primary">
							Explore Cities
							<span className="material-symbols-outlined">arrow_downward</span>
						</a>
					</div>
				</div>

				<div className="quick-info-col">
					<div className="quick-info-card">
						<div className="icon-badge badge-primary"><span className="material-symbols-outlined">location_city</span></div>
						<div className="card-info-content">
							<div className="card-kicker">Destination</div>
							<h3 className="card-heading">{destination.destinationName}</h3>
							<p className="card-desc">{destination.destinationCountry}</p>
						</div>
					</div>

					<div className="quick-info-card">
						<div className="icon-badge badge-secondary"><span className="material-symbols-outlined">hotel</span></div>
						<div className="card-info-content">
							<div className="card-kicker">Available stays</div>
							<h3 className="card-heading">{(destination.destinationProperties ?? 0).toLocaleString()} properties</h3>
							<p className="card-desc">Real accommodations listed for this destination</p>
						</div>
					</div>

					<div className="quick-info-card">
						<div className="icon-badge badge-surface"><span className="material-symbols-outlined">explore</span></div>
						<div className="card-info-content">
							<div className="card-kicker">Available tours</div>
							<h3 className="card-heading">{(destination.destinationTours ?? 0).toLocaleString()} tours</h3>
							<p className="card-desc">
								{hasCoordinates ? `${destination.latitude?.toFixed(4)}, ${destination.longitude?.toFixed(4)}` : 'Coordinates are not available yet'}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DestinationAbout;
