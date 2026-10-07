import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Hero = () => {
	const router = useRouter();
	const [location, setLocation] = useState('');

	/** HANDLERS **/
	const searchHandler = () => {
		router.push({
			pathname: '/property',
			query: location ? { input: JSON.stringify({ search: { text: location } }) } : {},
		});
	};

	return (
		<section className="hero-section">
			<div className="hero-banner">
				{/* Atmospheric Scrim */}
				<div className="hero-scrim"></div>

				{/* Content Container */}
				<div className="hero-content-container">
					<div className="hero-badge">
						<span className="badge-dot"></span>
						<span className="badge-text">The Next Era of Travel</span>
					</div>

					<h1 className="hero-title">Go Somewhere Extraordinary.</h1>

					<p className="hero-subtitle">
						Curated stays and bespoke expeditions across the world&apos;s most breathtaking horizons.
					</p>

					{/* Horizontal Search Console */}
					<div className="search-console">
						{/* Where */}
						<div
							className="console-box"
							onClick={() => router.push('/destination')}
						>
							<span className="material-symbols-outlined box-icon">explore</span>
							<div className="box-text">
								<span className="label">Where to?</span>
								<span className="value">Explore anywhere</span>
							</div>
						</div>

						<div className="console-divider"></div>

						{/* When */}
						<div className="console-box">
							<span className="material-symbols-outlined box-icon">calendar_today</span>
							<div className="box-text">
								<span className="label">When</span>
								<span className="value">Add dates</span>
							</div>
						</div>

						<div className="console-divider"></div>

						{/* Who */}
						<div className="console-box">
							<span className="material-symbols-outlined box-icon">group</span>
							<div className="box-text">
								<span className="label">Who</span>
								<span className="value">2 guests · 1 room</span>
							</div>
						</div>

						{/* Search CTA */}
						<button className="console-search-btn" onClick={searchHandler} type="button">
							<span className="material-symbols-outlined">search</span>
							<span>Search Expeditions</span>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
