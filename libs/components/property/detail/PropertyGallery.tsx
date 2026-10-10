import React, { useState } from 'react';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';
import { useI18n } from '../../../i18n';

interface PropertyGalleryProps {
	property: Property;
}

const PropertyGallery = ({ property }: PropertyGalleryProps) => {
	const { t } = useI18n();
	const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);
	const galleryImages = (property.propertyImages || [])
		.map((image, index) => ({
			url: getImageUrl(image),
			title: t('hotels.gallery.photoTitle', { propertyName: property.propertyName, index: index + 1 }),
			badge: property.propertyCity ? t('hotels.gallery.cityView', { city: property.propertyCity }) : '',
		}))
		.filter((image) => Boolean(image.url));

	/** HANDLERS **/
	const closeLightbox = () => setActiveModalIdx(null);
	const nextPhoto = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (activeModalIdx !== null) setActiveModalIdx((activeModalIdx + 1) % galleryImages.length);
	};
	const prevPhoto = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (activeModalIdx !== null) setActiveModalIdx((activeModalIdx - 1 + galleryImages.length) % galleryImages.length);
	};

	if (!galleryImages.length) {
		return (
			<div className="property-gallery-empty-state">
				<span className="material-symbols-outlined">photo_library</span>
				<p>{t('hotels.gallery.noPhotos')}</p>
			</div>
		);
	}

	return (
		<>
			<div className="property-gallery-container">
				<div className="gallery-layout-grid">
					<div className="main-gallery-cell" onClick={() => setActiveModalIdx(0)}>
						<img src={galleryImages[0].url} alt={galleryImages[0].title} className="main-gallery-img" />
						<div className="gallery-gradient-scrim" />
						<div className="gallery-overlay-meta">
							{galleryImages[0].badge ? <span className="gallery-badge-pill">{galleryImages[0].badge}</span> : null}
							<p className="gallery-caption-title">{property.propertyName}</p>
						</div>
					</div>
					<div className="side-gallery-grid">
						{galleryImages.slice(1, 5).map((image, index) => (
							<div key={image.url} className="side-gallery-cell" onClick={() => setActiveModalIdx(index + 1)}>
								<img src={image.url} alt={image.title} className="side-gallery-img" />
								<div className="side-gradient-scrim" />
								<div className="side-caption-meta"><p className="side-caption-text">{t('hotels.gallery.photoIndex', { index: index + 2 })}</p></div>
							</div>
						))}
					</div>
				</div>
				<button type="button" className="view-all-photos-btn" onClick={() => setActiveModalIdx(0)}>
					<span className="material-symbols-outlined">photo_library</span>
					<span>{t('hotels.gallery.viewAllPhotos', { count: galleryImages.length })}</span>
				</button>
			</div>

			{activeModalIdx !== null ? (
				<div className="gallery-lightbox-modal" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label={t('hotels.gallery.hotelPhotos')}>
					<div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
						<button className="lightbox-close-btn" type="button" aria-label={t('hotels.gallery.closePhotos')} onClick={closeLightbox}><span className="material-symbols-outlined">close</span></button>
						{galleryImages.length > 1 ? <button className="lightbox-nav-btn prev" type="button" aria-label={t('hotels.gallery.previousPhoto')} onClick={prevPhoto}><span className="material-symbols-outlined">chevron_left</span></button> : null}
						<div className="lightbox-image-wrapper">
							<img src={galleryImages[activeModalIdx].url} alt={galleryImages[activeModalIdx].title} className="lightbox-img" />
							<div className="lightbox-caption">
								<span className="lightbox-counter">{activeModalIdx + 1} / {galleryImages.length}</span>
								<h4>{galleryImages[activeModalIdx].title}</h4>
							</div>
						</div>
						{galleryImages.length > 1 ? <button className="lightbox-nav-btn next" type="button" aria-label={t('hotels.gallery.nextPhoto')} onClick={nextPhoto}><span className="material-symbols-outlined">chevron_right</span></button> : null}
					</div>
				</div>
			) : null}
		</>
	);
};

export default PropertyGallery;
