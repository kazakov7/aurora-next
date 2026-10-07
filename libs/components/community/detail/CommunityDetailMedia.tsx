import React from 'react';
import { getImageUrl } from '../../../config';

interface CommunityDetailMediaProps {
	image?: string;
	title: string;
}

const CommunityDetailMedia: React.FC<CommunityDetailMediaProps> = ({ image, title }) => {
	const imageUrl = getImageUrl(
		image,
		'https://lh3.googleusercontent.com/aida-public/AB6AXuA02pCDcq9Bn_Tgf3I96n6Rhcr3SonGXyRBb_fmxOUcZGv9y2SwCpczoaTNilKrBMZHS8n9QFZNgKAyIs9wZRPQ-ZrTkxT_X0eWoKzoZHLvMh0_CjyjNJgXcgvyVkUEplj9ypulQjWi13DgrqLJ-vJwfR_rnK6jRiztES2GEQPo2lvlQwduUeIL2JhrTfUXq3SND4Jl5S8zDNH2nrVf-9pjGwo15Czxt89y6qCnyWDBQde6DEQNA75K'
	);

	return (
		<figure className="community-detail-media-wrap">
			<div className="cover-image-container">
				<img
					className="cover-image"
					src={imageUrl}
					alt={title}
				/>
			</div>
		</figure>
	);
};

export default CommunityDetailMedia;
