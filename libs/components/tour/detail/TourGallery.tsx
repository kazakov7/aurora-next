import React, { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '../../../config';
import { Tour } from '../../../types/tour/tour';
import { useI18n } from '../../../i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { appleEase } from '../../../motion/transitions';

interface TourGalleryProps {
	tour: Tour;
}

const TourGallery = ({ tour }: TourGalleryProps) => {
	const { t } = useI18n();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const images = (tour.tourImages || [])
		.map((image, index) => ({
			url: getImageUrl(image),
			title: t('tours.gallery.photoTitle', { tourName: tour.tourName, index: index + 1 }),
		}))
		.filter((image) => Boolean(image.url));

	/** HANDLERS **/
	const close = useCallback(() => setActiveIndex(null), []);
	const previous = useCallback((event?: React.MouseEvent) => {
		if (event) event.stopPropagation();
		setActiveIndex((current) => (current !== null ? (current - 1 + images.length) % images.length : null));
	}, [images.length]);
	const next = useCallback((event?: React.MouseEvent) => {
		if (event) event.stopPropagation();
		setActiveIndex((current) => (current !== null ? (current + 1) % images.length : null));
	}, [images.length]);

	/** KEYBOARD NAVIGATION **/
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (activeIndex === null) return;
			if (e.key === 'Escape') close();
			if (e.key === 'ArrowRight') next();
			if (e.key === 'ArrowLeft') previous();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [activeIndex, close, next, previous]);

	if (!images.length) {
		return (
			<div className="tour-gallery-empty-state">
				<span className="material-symbols-outlined">photo_library</span>
				<p>{t('tours.gallery.noPhotos')}</p>
			</div>
		);
	}

	return (
		<>
			<div className="tour-gallery-container">
				<div className="gallery-layout-grid">
					<motion.div
						className="main-gallery-cell"
						onClick={() => setActiveIndex(0)}
						whileHover={{ scale: 1.008 }}
						transition={{ duration: 0.3, ease: appleEase }}
					>
						<img src={images[0].url} alt={images[0].title} className="main-gallery-img" />
						<div className="gallery-gradient-scrim" />
						<div className="gallery-overlay-meta">
							<p className="gallery-caption-title">{tour.tourName}</p>
						</div>
					</motion.div>
					<div className="side-gallery-grid">
						{images.slice(1, 5).map((image, index) => (
							<motion.div
								key={image.url}
								className="side-gallery-cell"
								onClick={() => setActiveIndex(index + 1)}
								whileHover={{ scale: 1.015 }}
								transition={{ duration: 0.3, ease: appleEase }}
							>
								<img src={image.url} alt={image.title} className="side-gallery-img" />
								<div className="side-gradient-scrim" />
								<div className="side-caption-meta">
									<p className="side-caption-text">{t('tours.gallery.photoIndex', { index: index + 2 })}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
				<motion.button
					type="button"
					className="view-all-photos-btn"
					onClick={() => setActiveIndex(0)}
					whileHover={{ scale: 1.03, y: -2 }}
					whileTap={{ scale: 0.97 }}
					transition={{ duration: 0.2, ease: appleEase }}
				>
					<span className="material-symbols-outlined">photo_library</span>
					<span>{t('tours.gallery.viewAllPhotos', { count: images.length })}</span>
				</motion.button>
			</div>

			<AnimatePresence>
				{activeIndex !== null ? (
					<motion.div
						className="tour-lightbox-modal"
						onClick={close}
						role="dialog"
						aria-modal="true"
						aria-label={t('tours.gallery.tourPhotos')}
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
								aria-label={t('tours.gallery.closePhotos')}
								onClick={close}
							>
								<span className="material-symbols-outlined">close</span>
							</button>

							{images.length > 1 ? (
								<button
									className="lightbox-nav-btn prev"
									type="button"
									aria-label={t('tours.gallery.previousPhoto')}
									onClick={previous}
								>
									<span className="material-symbols-outlined">chevron_left</span>
								</button>
							) : null}

							<div className="lightbox-image-wrapper">
								<AnimatePresence mode="wait">
									<motion.img
										key={activeIndex}
										src={images[activeIndex].url}
										alt={images[activeIndex].title}
										className="lightbox-img"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2, ease: appleEase }}
									/>
								</AnimatePresence>
								<div className="lightbox-caption">
									<span className="lightbox-counter">
										{activeIndex + 1} / {images.length}
									</span>
									<h4>{images[activeIndex].title}</h4>
								</div>
							</div>

							{images.length > 1 ? (
								<button
									className="lightbox-nav-btn next"
									type="button"
									aria-label={t('tours.gallery.nextPhoto')}
									onClick={next}
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

export default TourGallery;
