import React from 'react';
import { useRouter } from 'next/router';
import { Destination } from '../../types/destination/destination';
import { DEFAULT_DESTINATION_IMAGE, getImageUrl } from '../../config';

interface DestinationCardProps {
	destination: Destination;
	index?: number;
	onLike?: (e: React.MouseEvent, id: string) => void;
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

const DestinationCard = ({ destination, index = 0, onLike }: DestinationCardProps) => {
	const router = useRouter();

	const imageSrc = getImageUrl(destination.destinationImages?.[0], DEFAULT_DESTINATION_IMAGE);
	const flag = countryFlags[destination.destinationCountry] || '🌐';

	const isLiked = destination.meLiked && destination.meLiked[0]?.myFavorite;

	const handleClick = () => {
		router.push({
			pathname: '/destination/detail',
			query: { id: destination._id },
		});
	};

	return (
		<article className="destination-card" onClick={handleClick}>
			{/* Image Box */}
			<div className="card-image-wrapper">
				<img
					src={imageSrc}
					alt={destination.destinationName}
					className="card-img"
					onError={(e: any) => {
						if (!e.target.src.endsWith(DEFAULT_DESTINATION_IMAGE)) e.target.src = DEFAULT_DESTINATION_IMAGE;
					}}
				/>
				<span className="card-country-badge">
					{destination.destinationCountry} {flag}
				</span>

				{onLike && (
					<button
						type="button"
						className={`card-fav-btn ${isLiked ? 'liked' : ''}`}
						onClick={(e) => onLike(e, destination._id)}
						aria-label="Save to favorites"
					>
						<span
							className="material-symbols-outlined"
							style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
						>
							favorite
						</span>
					</button>
				)}
			</div>

			{/* Card Body */}
			<div className="card-content-body">
				<div className="card-title-row">
					<h3 className="card-title">
						{destination.destinationName} {flag}
					</h3>
				</div>
				<p className="card-desc">
					{destination.destinationDesc ||
						`Experience the extraordinary natural landscapes and discreet architecture of ${destination.destinationName}.`}
				</p>

				{/* Stays and Tours count badge */}
				<div className="card-meta-counts">
					<span className="meta-count-item">
						<span className="material-symbols-outlined">hotel</span>
						<span>{destination.destinationProperties || 0} Stays</span>
					</span>
					<span className="meta-sep">•</span>
					<span className="meta-count-item">
						<span className="material-symbols-outlined">tour</span>
						<span>{destination.destinationTours || 0} Tours</span>
					</span>
				</div>
			</div>
		</article>
	);
};

export default DestinationCard;
