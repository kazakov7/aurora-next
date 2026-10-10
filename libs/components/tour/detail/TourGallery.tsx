import React, { useState } from 'react';
import { getImageUrl } from '../../../config';
import { Tour } from '../../../types/tour/tour';
import { useI18n } from '../../../i18n';

interface TourGalleryProps { tour: Tour; }

const TourGallery = ({ tour }: TourGalleryProps) => {
	const { t } = useI18n();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const images = (tour.tourImages || []).map((image, index) => ({ url: getImageUrl(image), title: t('tours.gallery.photoTitle', { tourName: tour.tourName, index: index + 1 }) })).filter((image) => Boolean(image.url));
	const close = () => setActiveIndex(null);
	const previous = (event: React.MouseEvent) => { event.stopPropagation(); if (activeIndex !== null) setActiveIndex((activeIndex - 1 + images.length) % images.length); };
	const next = (event: React.MouseEvent) => { event.stopPropagation(); if (activeIndex !== null) setActiveIndex((activeIndex + 1) % images.length); };

	if (!images.length) return <div className="tour-gallery-empty-state"><span className="material-symbols-outlined">photo_library</span><p>{t('tours.gallery.noPhotos')}</p></div>;

	return (
		<>
			<div className="tour-gallery-container">
				<div className="gallery-layout-grid">
					<div className="main-gallery-cell" onClick={() => setActiveIndex(0)}><img src={images[0].url} alt={images[0].title} className="main-gallery-img" /><div className="gallery-gradient-scrim" /><div className="gallery-overlay-meta"><p className="gallery-caption-title">{tour.tourName}</p></div></div>
					<div className="side-gallery-grid">{images.slice(1, 5).map((image, index) => <div key={image.url} className="side-gallery-cell" onClick={() => setActiveIndex(index + 1)}><img src={image.url} alt={image.title} className="side-gallery-img" /><div className="side-gradient-scrim" /><div className="side-caption-meta"><p className="side-caption-text">{t('tours.gallery.photoIndex', { index: index + 2 })}</p></div></div>)}</div>
				</div>
				<button type="button" className="view-all-photos-btn" onClick={() => setActiveIndex(0)}><span className="material-symbols-outlined">photo_library</span><span>{t('tours.gallery.viewAllPhotos', { count: images.length })}</span></button>
			</div>
			{activeIndex !== null ? <div className="tour-lightbox-modal" onClick={close} role="dialog" aria-modal="true" aria-label={t('tours.gallery.tourPhotos')}><div className="lightbox-content" onClick={(event) => event.stopPropagation()}><button className="lightbox-close-btn" type="button" aria-label={t('tours.gallery.closePhotos')} onClick={close}><span className="material-symbols-outlined">close</span></button>{images.length > 1 ? <button className="lightbox-nav-btn prev" type="button" aria-label={t('tours.gallery.previousPhoto')} onClick={previous}><span className="material-symbols-outlined">chevron_left</span></button> : null}<div className="lightbox-image-wrapper"><img src={images[activeIndex].url} alt={images[activeIndex].title} className="lightbox-img" /><div className="lightbox-caption"><span className="lightbox-counter">{activeIndex + 1} / {images.length}</span><h4>{images[activeIndex].title}</h4></div></div>{images.length > 1 ? <button className="lightbox-nav-btn next" type="button" aria-label={t('tours.gallery.nextPhoto')} onClick={next}><span className="material-symbols-outlined">chevron_right</span></button> : null}</div></div> : null}
		</>
	);
};

export default TourGallery;
