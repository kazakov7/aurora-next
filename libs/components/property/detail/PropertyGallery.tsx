import React, { useState, useEffect, useCallback } from 'react';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';
import { useI18n } from '../../../i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { appleEase } from '../../../motion/transitions';

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
	const closeLightbox = useCallback(() => setActiveModalIdx(null), []);
	const nextPhoto = useCallback((event?: React.MouseEvent) => {
		if (event) event.stopPropagation();
		setActiveModalIdx((current) => (current !== null ? (current + 1) % galleryImages.length : null));
	}, [galleryImages.length]);
	const prevPhoto = useCallback((event?: React.MouseEvent) => {
		if (event) event.stopPropagation();
		setActiveModalIdx((current) => (current !== null ? (current - 1 + galleryImages.length) % galleryImages.length : null));
	}, [galleryImages.length]);

	/** KEYBOARD NAVIGATION **/
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (activeModalIdx === null) return;
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') nextPhoto();
			if (e.key === 'ArrowLeft') prevPhoto();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [activeModalIdx, closeLightbox, nextPhoto, prevPhoto]);

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
					<motion.div
						className="main-gallery-cell"
						onClick={() => setActiveModalIdx(0)}
						whileHover={{ scale: 1.008 }}
						transition={{ duration: 0.3, ease: appleEase }}
					>
						<img src={galleryImages[0].url} alt={galleryImages[0].title} className="main-gallery-img" />
						<div className="gallery-gradient-scrim" />
						<div className="gallery-overlay-meta">
							{galleryImages[0].badge ? <span className="gallery-badge-pill">{galleryImages[0].badge}</span> : null}
							<p className="gallery-caption-title">{property.propertyName}</p>
						</div>
					</motion.div>
					<div className="side-gallery-grid">
						{galleryImages.slice(1, 5).map((image, index) => (
							<motion.div
								key={image.url}
								className="side-gallery-cell"
								onClick={() => setActiveModalIdx(index + 1)}
								whileHover={{ scale: 1.015 }}
								transition={{ duration: 0.3, ease: appleEase }}
							>
								<img src={image.url} alt={image.title} className="side-gallery-img" />
								<div className="side-gradient-scrim" />
								<div className="side-caption-meta">
									<p className="side-caption-text">{t('hotels.gallery.photoIndex', { index: index + 2 })}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
				<motion.button
					type="button"
					className="view-all-photos-btn"
					onClick={() => setActiveModalIdx(0)}
					whileHover={{ scale: 1.03, y: -2 }}
					whileTap={{ scale: 0.97 }}
					transition={{ duration: 0.2, ease: appleEase }}
				>
					<span className="material-symbols-outlined">photo_library</span>
					<span>{t('hotels.gallery.viewAllPhotos', { count: galleryImages.length })}</span>
				</motion.button>
			</div>

			<AnimatePresence>
				{activeModalIdx !== null ? (
					<motion.div
						className="gallery-lightbox-modal"
						onClick={closeLightbox}
						role="dialog"
						aria-modal="true"
						aria-label={t('hotels.gallery.hotelPhotos')}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25, ease: appleEase }}
					>
						<motion.div
							className="lightbox-content"
							onClick={(event) => event.stopPropagation()}
							initial={{ opacity: 0, scale: 0.95, y: 12 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96, y: 8 }}
							transition={{ duration: 0.28, ease: appleEase }}
						>
							<button
								className="lightbox-close-btn"
								type="button"
								aria-label={t('hotels.gallery.closePhotos')}
								onClick={closeLightbox}
							>
								<span className="material-symbols-outlined">close</span>
							</button>

							{galleryImages.length > 1 ? (
								<button
									className="lightbox-nav-btn prev"
									type="button"
									aria-label={t('hotels.gallery.previousPhoto')}
									onClick={prevPhoto}
								>
									<span className="material-symbols-outlined">chevron_left</span>
								</button>
							) : null}

							<div className="lightbox-image-wrapper">
								<AnimatePresence mode="wait">
									<motion.img
										key={activeModalIdx}
										src={galleryImages[activeModalIdx].url}
										alt={galleryImages[activeModalIdx].title}
										className="lightbox-img"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2, ease: appleEase }}
									/>
								</AnimatePresence>
								<div className="lightbox-caption">
									<span className="lightbox-counter">
										{activeModalIdx + 1} / {galleryImages.length}
									</span>
									<h4>{galleryImages[activeModalIdx].title}</h4>
								</div>
							</div>

							{galleryImages.length > 1 ? (
								<button
									className="lightbox-nav-btn next"
									type="button"
									aria-label={t('hotels.gallery.nextPhoto')}
									onClick={nextPhoto}
								>
									<span className="material-symbols-outlined">chevron_right</span>
								</button>
							) : null}
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
};

export default PropertyGallery;
