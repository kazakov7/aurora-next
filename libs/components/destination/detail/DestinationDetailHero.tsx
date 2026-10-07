import React, { useState } from 'react';
import Link from 'next/link';
import { Destination } from '../../../types/destination/destination';
import { getImageUrl } from '../../../config';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface DestinationDetailHeroProps {
	destination: Destination;
	onLike: (destinationId: string) => void;
	isLiked: boolean;
	likesCount: number;
	commentsCount: number;
}

const countryFlags: Record<string, string> = {
	Japan: '🇯🇵',
	'South Korea': '🇰🇷',
	Switzerland: '🇨🇭',
	Germany: '🇩🇪',
	Italy: '🇮🇹',
	France: '🇫🇷',
	Spain: '🇪🇸',
	Norway: '🇳🇴',
	Iceland: '🇮🇸',
	Greece: '🇬🇷',
	'New Zealand': '🇳🇿',
	Peru: '🇵🇪',
	Morocco: '🇲🇦',
	'South Africa': '🇿🇦',
	Canada: '🇨🇦',
	Portugal: '🇵🇹',
	Indonesia: '🇮🇩',
	Chile: '🇨🇱',
	Tanzania: '🇹🇿',
	Australia: '🇦🇺',
	Egypt: '🇪🇬',
	Turkey: '🇹🇷',
	Vietnam: '🇻🇳',
	Thailand: '🇹🇭',
	Brazil: '🇧🇷',
};

const countryRegions: Record<string, string> = {
	Japan: 'East Asia',
	'South Korea': 'East Asia',
	Switzerland: 'Central Europe',
	Germany: 'Western Europe',
	Italy: 'Southern Europe',
	France: 'Western Europe',
	Spain: 'Southern Europe',
	Norway: 'Northern Europe',
	Morocco: 'North Africa',
	Tanzania: 'East Africa',
	Egypt: 'North Africa',
	Australia: 'Oceania',
	'New Zealand': 'Oceania',
	Peru: 'South America',
	Brazil: 'South America',
	Canada: 'North America',
};

const fallbackHeroImage =
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCVDztHelxkq6wVTLni0kVvF-OSdkk9FlSWBOPkrX57ypaEawOWcWW4sB-ijuuD0ssL0KoSa68nU1aeM_go4anMguVniS_tEdCrHrnYVzcTrCmrkSitvrQbMO7BxOXc2QwUNMSqLtmEdp6bAIiPQO3Nuz9Sx2gIo4PBbFlW0jskDYOWZqPpEbfMYchIXDf1DGykbZSAJQDa2Lu2ouQOX8mjqCdlL86VmNfs2kxl4fwnu-qZPLPCYm53';

const DestinationDetailHero = ({
	destination,
	onLike,
	isLiked,
	likesCount,
	commentsCount,
}: DestinationDetailHeroProps) => {
	const [shareCopied, setShareCopied] = useState(false);

	const heroBg = getImageUrl(destination.destinationImages?.[0], fallbackHeroImage);
	const flag = countryFlags[destination.destinationCountry] || '🌐';
	const region = countryRegions[destination.destinationCountry] || destination.destinationCountry;

	const handleShare = async () => {
		if (typeof window !== 'undefined' && navigator.clipboard) {
			await navigator.clipboard.writeText(window.location.href);
			setShareCopied(true);
			await sweetTopSmallSuccessAlert('Link copied to clipboard!', 900);
			setTimeout(() => setShareCopied(false), 2000);
		}
	};

	const ratingValue = (destination.destinationRating || 4.9).toFixed(1);
	const reviewsTotal = destination.destinationReviews || 0;

	return (
		<section className="destination-detail-hero">
			{/* Cinematic Background Image */}
			<div
				className="hero-background-image"
				style={{ backgroundImage: `url(${heroBg})` }}
			></div>

			{/* Scrim Overlays */}
			<div className="hero-scrim-gradient"></div>

			{/* Centered Content Container */}
			<div className="hero-inner-container">
				{/* Breadcrumb & Country Badge */}
				<div className="hero-top-badges">
					<nav aria-label="Breadcrumb" className="hero-breadcrumb-nav">
						<Link href="/destination" className="breadcrumb-link">
							Destinations
						</Link>
						<span className="breadcrumb-sep">/</span>
						<Link
							href={{
								pathname: '/destination',
								query: { search: destination.destinationCountry },
							}}
							className="breadcrumb-link"
						>
							{destination.destinationCountry}
						</Link>
						<span className="breadcrumb-sep">/</span>
						<span className="breadcrumb-active">{destination.destinationName}</span>
					</nav>

					<span className="hero-region-chip">
						<span className="material-symbols-outlined">public</span>
						{region}
					</span>
				</div>

				{/* Headline & Subtitle */}
				<div className="hero-title-box">
					<h1 className="hero-main-heading">
						Discover {destination.destinationName}
						<span className="country-flag-emoji" role="img" aria-label={destination.destinationCountry}>
							{flag}
						</span>
					</h1>
					<p className="hero-main-subtext">
						{destination.destinationDesc ||
							'Where timeless traditions meet extraordinary adventures.'}
					</p>
				</div>

				{/* Social Action Stats & CTAs Bar */}
				<div className="hero-stats-action-bar">
					<div className="stats-pill-group">
						{/* 1. Views Pill */}
						<div className="stat-pill" title="Real-time page views">
							<span className="material-symbols-outlined icon-views">visibility</span>
							<span className="pill-number">
								{(destination.destinationViews || 1).toLocaleString()}
							</span>
							<span className="pill-unit">views</span>
						</div>

						{/* 2. Interactive Like Button */}
						<button
							type="button"
							className={`stat-pill-btn ${isLiked ? 'liked' : ''}`}
							onClick={() => onLike(destination._id)}
							aria-label="Like destination"
						>
							<span
								className="material-symbols-outlined icon-fav"
								style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
							>
								favorite
							</span>
							<span className="pill-number">{likesCount.toLocaleString()}</span>
							<span className="pill-unit">likes</span>
						</button>

						{/* 3. Comments Pill (Scrolls to Reviews Section) */}
						<a href="#traveler-comments" className="stat-pill-btn comments-link" title="Jump to reviews">
							<span className="material-symbols-outlined icon-chat">chat_bubble</span>
							<span className="pill-number">{commentsCount}</span>
							<span className="pill-unit">comments</span>
						</a>

						{/* 4. Rating Badge */}
						<div className="stat-pill rating-pill">
							<span
								className="material-symbols-outlined icon-star"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								star
							</span>
							<span className="pill-number bold-text">{ratingValue}</span>
							<span className="pill-unit">({reviewsTotal} reviews)</span>
						</div>
					</div>

					{/* CTAs */}
					<div className="hero-ctas-group">
						<button
							type="button"
							className="cta-glass-btn"
							onClick={handleShare}
							aria-label="Share destination link"
						>
							<span className="material-symbols-outlined">share</span>
							<span>{shareCopied ? 'Copied Link!' : 'Share'}</span>
						</button>

						<a href="#cities" className="cta-solid-btn">
							<span>Explore Cities</span>
							<span className="material-symbols-outlined">arrow_downward</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DestinationDetailHero;
