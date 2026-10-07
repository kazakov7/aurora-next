import React from 'react';

const DestinationHero = () => {
	return (
		<section className="destination-hero-section">
			{/* Background Image with Scale */}
			<div
				className="hero-bg-image"
				style={{
					backgroundImage:
						"url('https://lh3.googleusercontent.com/aida-public/AB6AXuALKUgN7Lw3hGxDiAISYFfXJbDCcqEYI3fRCtYqW6xnya5QCqSnWM968PppWmbMlYHk_9xgthwjPSQkyk6q1FYxbjmuhoWathjebsGuLidOQQiFeA7uXX0x8wW55CZhqYnZrQKKVaxMs2FGaR_kx09HHk_mMtkg6TgZ_kBIHdQgcVgmk49eqYjgNJiACV_4naH5JHFiPyUTGZP1d7SO3EdqyfJ_3CWkIOm-aHrWb-pt-BDc-ZIQndO8')",
				}}
			></div>

			{/* Scrim / Gradient Overlays */}
			<div className="hero-gradient-overlay-bottom"></div>
			<div className="hero-gradient-overlay-left"></div>

			{/* Centered Content Container */}
			<div className="hero-content-wrapper">
				<div className="hero-inner-text">
					<div className="hero-pill-badge">
						<span className="badge-cyan-dot"></span>
						<span className="badge-text">GLOBAL SANCTUARIES &amp; TERRITORIES</span>
					</div>
					<h1 className="hero-main-title">Explore the World</h1>
					<p className="hero-subtitle">Every destination has a story.</p>
				</div>
			</div>
		</section>
	);
};

export default DestinationHero;
