import React from 'react';
import { useRouter } from 'next/router';
import { Destination } from '../../types/destination/destination';
import { getImageUrl } from '../../config';

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

const fallbackDestinationImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAmr86BrPNSPtODV0B_HvFp31VUrG3Mq8_rqOBKlLM8CGidURXs6knOrv6P4nzP4oPcAMeQXhdV5zTwoNGuu8R9px3qS5Efj1jCMUWuhcFxywAEYXyXEjd8zKUW9KPYRMtP3xnosBuOilIQ4CUJtkC46hkFnBYVTrMmhL8vMslA3tilqs_qGk_8pJ73fd3s6qg-rXWfCgPIemqbAkeLeLwTfPLBx5iyjqMIYhqtGF1NKKlYHpRSsBZv',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAQhurT8QVkMLG_-vPpaonLqzQWr8wYnGCCHjWI3I94JQKVMqxBYk2ti0osAPUys0-5EzsEhPk1Lnow181ZTTajH7VqYWK2MGYMjIOW1yyksJsjUrkqru8ByHpjUJet21-7QWKlCKyjy7kgakXx05Xdnev76rmIwI4kyz9U9PiHWnXosrkRgnuNQa_mXdJHFzUF6Az69-k-lbx5TJuexOfEMIpx3uUtR-aripGM5bycNjWnRZmoXPTK',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDC1-LcMLyi0Nl4IazGmW2CEUCiDX8JuNA2LAIkbIRzhVEzObzl_pSe14R4hlDmah5qhY2tIPnwXzLHHpAndQyPsYjnHy-Xn7_ZtQef79_rfsw5M32D_ZOjYxzb8yyrNrzOtdF7W2CU9BezUuPW2OHPGgXiJ7hJQg8GNZsi0LNTyq2PPHU84jq7MeW1krKECHuhJH6GQNG4IlaxtdnxYXh7lnmUrqTbMbU-9oEVnelCJtChR3kuFd_u',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDGMguVVyuSEna_7BJkY307bT0ZSOfWmtZwy7xsanx05JldzXKIlFSCdQJvEosgDALWWo9x2PbEP0Ok485VLywiHUqQdZN7OmvhKNdk5Y7Z1WTHiUdUjH9sG2To5Pmp0RViy8-Z-yQ7_LUjWBe4_cy5v-AT0CfqcqZgxRAjbMTSMqJQX6CGhmIuP-u-HUKuaapl9PZDsCEEfnns63XdKaWQUE-kdrBRGgKt3IZRvnUbXPmSp1dbr44Y',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCiqV2wAX3rH9MZ-gjpLHNuNfOkO2WcyRqAJbvoJW1jwll1pd5iFcomGQmBcf4dOxr4WTa5kwjYSE-Z8Pzc-a6cwZNOKgr-eDbJI66ebWviTpNkQDsCpM4f0b5SHqAzkz56rl2nVSmKERW4QH-V4Snpz3CNepTfCefLeqm0mOoon7sJKqXJKalfYAQbTchhLcx8v2qHX3qKsJsYnwzBh0uAjiS1f5oDUdi-9D1dHKCyMwBBeW4dBZpn',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAHLeZpFB27ABvBV0ZuP4PMfBNGmu-nPUcRWLIV0F6z8EUBcrdrFOmzT0TloXH_3J53FkMfZV149Y2JOq3gt2EwXBOSh0Snr1yp1Jw3bsBNpw0dJbw2ZSNCdoJYMEHexLkYDEgzPpA5SjsDsFFa_dw_2FWunFgGmd7tY97wFZX3_KysF479oeGn7r0qGSMGiTH6e_ZhpBKleVOjGzG_JXNA047bOlHvaF7vR2LN7I3ZIMDllY-5MeXw',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuB4uiJdk_6D-xKxpoeauNaM-JOEqnx0jcJ2CasoLs9FAOELl3s6dK55ZSooe_wOi1qPD8GMHUGjVX_cFfcF48H-R7ZapdLtmhbFLS12e-Rw2eJzgPM22jsxR5kcrQji67OnGgDpKEbFOYPAZJCu_5GvVydvBZAoRJUjjSys_SWG8zYa8mRWa4hdVGLvTv9W-vw_T2p4pFmhS2i5sEHz8X4jo_I-3gzeLJtUMsk6KdHyVlwzH9_Vn79F',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBcbcdV8w-u9LwWWObMn6cF5xsuC5mGfSussGlqLt77GnMLqY7Le7xis9KBv7QBSTsXkmm6FDd3KOnosfR8oat92eEFEJOY_MITDjbOmCmg74QF4eskNQg6kfLg4nz--3QaD-DIkmFs3B9QiAPwdaxMoln1QUH7BjoPHqKf-VnSiREWV68xoUDjAoEbhfbHe6rs40eJ9UYr3iDkTRmLCYgB829r6Yr-mPIFAItzDnW4qf04ZVS6UhHw',
];

const DestinationCard = ({ destination, index = 0, onLike }: DestinationCardProps) => {
	const router = useRouter();

	const fallbackImg = fallbackDestinationImages[index % fallbackDestinationImages.length];
	const imageSrc = getImageUrl(destination.destinationImages?.[0], fallbackImg);
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
						e.target.src = fallbackImg;
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
