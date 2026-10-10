import React, { useEffect, useMemo, useState } from 'react';
import { Destination } from '../../../types/destination/destination';
import { getImageUrl } from '../../../config';

interface DestinationDetailHeroProps {
	destination: Destination;
}

const DestinationDetailHero = ({ destination }: DestinationDetailHeroProps) => {
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const destinationImages = useMemo(
		() => destination.destinationImages.map((image) => getImageUrl(image)).filter(Boolean),
		[destination.destinationImages],
	);
	const imageCount = destinationImages.length;
	const previewImages = useMemo(
		() =>
			Array.from({ length: Math.min(3, Math.max(imageCount - 1, 0)) }, (_, offset) => {
				const index = (activeImageIndex + offset + 1) % imageCount;
				return { image: destinationImages[index], index };
			}),
		[activeImageIndex, destinationImages, imageCount],
	);

	/** LIFECYCLES **/
	useEffect(() => {
		setActiveImageIndex(0);
	}, [destination._id, imageCount]);

	/** HANDLERS **/
	const handlePreviousImage = () => {
		if (imageCount < 2) return;
		setActiveImageIndex((current) => (current - 1 + imageCount) % imageCount);
	};

	const handleNextImage = () => {
		if (imageCount < 2) return;
		setActiveImageIndex((current) => (current + 1) % imageCount);
	};

	return (
		<section className="destination-editorial-gallery" aria-label={`${destination.destinationName} image gallery`}>
			<div className="gallery-layout">
				<div className="gallery-featured-image">
					{destinationImages.map((image, index) => (
						<div
							key={`${image}-${index}`}
							className={`gallery-image-layer ${index === activeImageIndex ? 'is-active' : ''}`}
							style={{ backgroundImage: `url(${image})` }}
							aria-hidden="true"
						/>
					))}
					{imageCount === 0 ? <div className="gallery-empty-state">No destination images available</div> : null}
				</div>

				{imageCount > 1 ? (
					<aside className={`gallery-preview-column preview-total-${previewImages.length}`} aria-label="More destination images">
						<div className="gallery-preview-list">
							{previewImages.map(({ image, index }, previewPosition) => (
								<button
									key={`${image}-${index}`}
									type="button"
									className={`gallery-preview-button preview-position-${previewPosition + 1}`}
									onClick={() => setActiveImageIndex(index)}
									aria-label={`Show destination image ${index + 1} of ${imageCount}`}
								>
									<span className="gallery-preview-image" style={{ backgroundImage: `url(${image})` }} />
								</button>
							))}
						</div>

						<div className="gallery-navigation">
							<button type="button" onClick={handlePreviousImage} aria-label="Previous destination image">
								<span className="material-symbols-outlined">chevron_left</span>
							</button>
							<span aria-live="polite">{activeImageIndex + 1} / {imageCount}</span>
							<button type="button" onClick={handleNextImage} aria-label="Next destination image">
								<span className="material-symbols-outlined">chevron_right</span>
							</button>
							<strong>{imageCount} photos</strong>
						</div>
					</aside>
				) : null}
			</div>
		</section>
	);
};

export default DestinationDetailHero;
