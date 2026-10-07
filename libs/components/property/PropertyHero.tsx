import React from 'react';

const PropertyHero = () => {
	return (
		<section className="property-hero-section">
			<img
				alt="Aura Luxury Sanctuary Resort at dusk"
				className="hero-image"
				src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeo3YE0Ir3CIRDmt9iw3y23VH0AKSUQ5xrlvzt3tSWzVgCbRIp5SW7YIywPtr9Axle6jk8DylLR2aOrR4yOfGszM95p8v_E1U-KTSjuZNbVak2qC9e_q7xNJf4Niw5oOZeGvk2payqdMbHTOg7PvrPcq7ZXrGzTSXXNZ6MKyj0EEl84aHIg3tLlvo9SRs-RaugnC1sWnNemtL7v_RTyHVW8r8v2c4BRCbyu1p1_9dWN9jp-4zVjlAx"
			/>
			<div className="hero-gradient-overlay"></div>
			<div className="hero-content">
				<div className="hero-badge">
					<span className="badge-dot"></span>
					<span className="badge-text">CURATED SANCTUARIES &amp; RESORTS</span>
				</div>
				<h1 className="hero-title">Find Your Perfect Stay</h1>
				<p className="hero-subtitle">
					Exceptional places for every journey. From cliffside Mediterranean villas to secluded alpine
					chalets, engineered for pure stillness.
				</p>
			</div>
		</section>
	);
};

export default PropertyHero;
