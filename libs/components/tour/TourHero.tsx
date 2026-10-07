import React from 'react';

const TourHero = () => {
	return (
		<section className="tour-hero-section">
			{/* Cinematic Photography Background */}
			<div
				className="hero-image"
				style={{
					backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4-yG1FDuIdh6orAxPc1eEsDIZU2aFJ9nXeYgksbKWxYRw_HLu2KsW_2iEs_vdoXDbjfTYhB6cP0y2Yogv3gsNuuTVozwMoNUGEcQAGGSUzQYlK73xL5XwfjFeUx_2AcD97VYGF8kOEvh0CQ_0Emk0nhSaKoPWnwUCTEogSosr7zzGaagi9ZfLK9wsM4BA_0lKkVMY8SdV3fwxx18sqVRFZHoBPEEkAhp_XhoEN6ELpny_spkSXCXS')`,
				}}
			/>

			{/* Multi-stage Scrim & Vignette Gradients */}
			<div className="hero-gradient-overlay" />

			{/* Centered Content Wrapper */}
			<div className="hero-content">
				<div className="hero-text-container">
					{/* Pill Badge */}
					<div className="hero-badge">
						<span className="badge-dot" />
						<span className="badge-text">CURATED EXPEDITIONS &amp; VOYAGES</span>
					</div>

					{/* Title */}
					<h1 className="hero-title">Discover Extraordinary Journeys</h1>

					{/* Subtitle */}
					<p className="hero-subtitle">
						Unforgettable experiences, thoughtfully curated. Venture into remote landscapes with elite
						naturalists and private charters.
					</p>
				</div>
			</div>
		</section>
	);
};

export default TourHero;
