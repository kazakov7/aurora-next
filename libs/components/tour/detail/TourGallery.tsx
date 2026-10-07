import React, { useState } from 'react';
import { Tour } from '../../../types/tour/tour';
import { getImageUrl } from '../../../config';

interface TourGalleryProps {
	tour: Tour;
}

const defaultTourGallery = [
	{
		url: 'https://lh3.googleusercontent.com/aida/AEtjO1VUw8gwH-UBiHOUk3H7ZHmQKS7N_AqBqtD05bfuw4T9hrfcyjqvPSQo3LQlN3_6YZaYZonh1U8DBuzuRmy_rQXcBZB_TNtDMGJLYTNrenP-CB8J7xZmKLt2si8EY6ilIR4OQkydpIXHuQ5pEL6YT7G9g65hXEaR7-27MzC0Gb9xbIzt2OZBSw14KQktxOPd1iz2xIALwniuHb1Xkz3DgqWZdcFcKUZhjnk7pJoZ2sRL9VLNbPW1uf5YkSo',
		title: 'Swiss Alps Panoramic Expedition',
		badge: 'Matterhorn & Stellisee Alpine Reflection',
	},
	{
		url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb6sNSrDzqp2ZVoIxWNorDPaWovfQWq7NKiDAgL1q0h5Lq_eoQIzRsTA4Y98bd7AmyRNbmwzxG1613Vw_1RDLNt-h77X8XMqOB5C_CjHL58BLFxDxSpz9iN_qglstNa_odvNy-xc7ZX4MJMTu_NvhHKj5rDmYaF5nmees3i0ZTeyH8d0M8Z-x_OI5jJWsHYulnD0sbEAx4Wp7CdH42bwlDe5HafmkQQU24a1Dvz1Swt-Wp0RPhrRoE',
		title: 'Glacier Express',
		badge: 'Panoramic Domed Carriage',
	},
	{
		url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsCBHB3vEewr28dCwWs12RQO5JKVizgb2pbTYUYQrCxMLEkNUbD_Izi-gZTMYRBYaEzpsl7T1D51_WTHUp1680bG4iJifsNTWQ0vdZAIJ-RWCkuLnFfgEq4TJpUQ3mMHhfX1EdujxY4SaSffh8QYgTNSvxDB_pWUnpNgbW13xoJCen3x3vVHQwqEEKxTpGNMv0H0sYygEhVXjdbRYYzUrBhBnZwwhlhSz2xretzkgkfzl3ElpJhVJx',
		title: 'Lake Lucerne',
		badge: 'Pristine Waters & Mountains',
	},
	{
		url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEud2Q0wvg4RjwpdPtOFNxGUUuVQmy8QD6ZEgRxMI44sLVrGtRPLH31hWGORdCJ2ErXxdg6EuTrw66IiCLobzHqlkgGrpHqMLtaxyoBJycvaKDpRDTBbcgVwF7gUjpJ6LAR6QhPAFn_UX89RZPZY1uIhjnEj5FhiymYrN2HL-k2xlViHUWgm9sPn_Up0p5DPbSuXSgf98s9grykamN9AFMHafl6s-cnxLtsECpDKOVYUlMH4Doro9P',
		title: 'Jungfraujoch',
		badge: 'Top of Europe 3,454m Observation Deck',
	},
	{
		url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeAsHdLhqbdJzYNM15ennjUYFqXrKH5TaGuuKXkvokKy_J3BSGRIAkuZxhNoRdUJBFxzSniqfVOmSFh3wE57pDdzkzQvK9F94kEubYeZqv4x8Aq-EtqJ1RMi_ZbiZHP9P64bpcEPjJePMnRAT3rrNyTS93Knn20N6KuYtSPPq86nVQxRRIRCGhT1Ll-9uImgCHXgQTxQx5xB8NAQuW3XRdh--FGIMu2L9lMla_OGRZiYMeGnKh57Og',
		title: 'Zermatt',
		badge: 'Alpine Sanctuary & Village View',
	},
];

const TourGallery = ({ tour }: TourGalleryProps) => {
	const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);

	const galleryImages = defaultTourGallery.map((item, idx) => {
		const tourImg = tour?.tourImages?.[idx];
		return {
			url: tourImg ? getImageUrl(tourImg, item.url) : item.url,
			title: idx === 0 ? tour?.tourName || item.title : item.title,
			badge: idx === 0 ? `${tour?.tourDestinationCity || 'Alpine'} Discovery` : item.badge,
		};
	});

	const openLightbox = (index: number) => {
		setActiveModalIdx(index);
	};

	const closeLightbox = () => {
		setActiveModalIdx(null);
	};

	const nextPhoto = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (activeModalIdx !== null) {
			setActiveModalIdx((activeModalIdx + 1) % galleryImages.length);
		}
	};

	const prevPhoto = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (activeModalIdx !== null) {
			setActiveModalIdx((activeModalIdx - 1 + galleryImages.length) % galleryImages.length);
		}
	};

	return (
		<>
			<div className="tour-gallery-container">
				<div className="gallery-layout-grid">
					{/* Main Large Scenic Photo (col-span-7) */}
					<div className="main-gallery-cell" onClick={() => openLightbox(0)}>
						<img
							src={galleryImages[0].url}
							alt={galleryImages[0].title}
							className="main-gallery-img"
						/>
						<div className="gallery-gradient-scrim"></div>
						<div className="gallery-overlay-meta">
							<span className="gallery-badge-pill">{galleryImages[0].badge}</span>
							<p className="gallery-caption-title">{galleryImages[0].title}</p>
						</div>
					</div>

					{/* 4 Photo 2x2 Grid (col-span-5) */}
					<div className="side-gallery-grid">
						{galleryImages.slice(1, 5).map((item, idx) => (
							<div
								key={idx}
								className="side-gallery-cell"
								onClick={() => openLightbox(idx + 1)}
							>
								<img
									src={item.url}
									alt={item.title}
									className="side-gallery-img"
								/>
								<div className="side-gradient-scrim"></div>
								<div className="side-caption-meta">
									<span className="side-caption-pill">{item.title}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Floating "View All Photos" Button */}
				<button
					type="button"
					className="view-all-photos-btn"
					onClick={() => openLightbox(0)}
				>
					<span className="material-symbols-outlined">photo_library</span>
					<span>View All {Math.max(galleryImages.length, tour?.tourImages?.length || 5)} Photos</span>
				</button>
			</div>

			{/* Lightbox Modal */}
			{activeModalIdx !== null && (
				<div className="tour-lightbox-modal" onClick={closeLightbox}>
					<div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
						<button
							className="lightbox-close-btn"
							type="button"
							onClick={closeLightbox}
						>
							<span className="material-symbols-outlined">close</span>
						</button>
						<button
							className="lightbox-nav-btn prev"
							type="button"
							onClick={prevPhoto}
						>
							<span className="material-symbols-outlined">chevron_left</span>
						</button>
						<div className="lightbox-image-wrapper">
							<img
								src={galleryImages[activeModalIdx].url}
								alt={galleryImages[activeModalIdx].title}
								className="lightbox-img"
							/>
							<div className="lightbox-caption">
								<span className="lightbox-counter">
									{activeModalIdx + 1} / {galleryImages.length}
								</span>
								<h4>{galleryImages[activeModalIdx].title}</h4>
								<p>{galleryImages[activeModalIdx].badge}</p>
							</div>
						</div>
						<button
							className="lightbox-nav-btn next"
							type="button"
							onClick={nextPhoto}
						>
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default TourGallery;
