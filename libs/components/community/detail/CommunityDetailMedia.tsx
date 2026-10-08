import React from 'react';
import { getImageUrl } from '../../../config';

interface CommunityDetailMediaProps {
	image?: string;
	title: string;
}

const CommunityDetailMedia: React.FC<CommunityDetailMediaProps> = ({ image, title }) => {
	if (!image) return null;

	const imageUrl = getImageUrl(image);

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
