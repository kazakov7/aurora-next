import React from 'react';
import Link from 'next/link';

const TravelPartners = () => {
	return (
		<section className="travel-partners-section">
			<div className="section-container">
				{/* Section Header */}
				<div className="partners-header">
					<span className="section-tag">Global Alliances</span>
					<h2 className="section-title">Trusted Travel Partners</h2>
					<p className="section-subtitle">
						Guaranteed white-glove logistics, priority upgrades, and exclusive sanctuary access worldwide.
					</p>
				</div>

				<div className="partners-grid">
					{/* Column 1: Elite Hotel Collections */}
					<div className="partner-card">
						<div className="card-title-row">
							<span className="material-symbols-outlined partner-icon">hotel</span>
							<h3 className="card-title">Elite Hotel Collections</h3>
						</div>
						<ul className="partner-list">
							<li className="partner-item">
								<Link href="/property?search=Aman" className="partner-link">
									<div className="item-name">
										<span className="dot primary-dot"></span>
										<span>Aman Resorts</span>
									</div>
									<span className="item-desc">Global Sanctuary Member</span>
								</Link>
							</li>
							<li className="partner-item">
								<Link href="/property?search=Four+Seasons" className="partner-link">
									<div className="item-name">
										<span className="dot primary-dot"></span>
										<span>Four Seasons Retreats</span>
									</div>
									<span className="item-desc">Preferred Executive Tier</span>
								</Link>
							</li>
							<li className="partner-item">
								<Link href="/property?search=Belmond" className="partner-link">
									<div className="item-name">
										<span className="dot primary-dot"></span>
										<span>Belmond Heritage</span>
									</div>
									<span className="item-desc">Curated Trains &amp; Stays</span>
								</Link>
							</li>
						</ul>
					</div>

					{/* Column 2: Expedition Operators */}
					<div className="partner-card">
						<div className="card-title-row">
							<span className="material-symbols-outlined partner-icon">nature_people</span>
							<h3 className="card-title">Expedition Operators</h3>
						</div>
						<ul className="partner-list">
							<li className="partner-item">
								<Link href="/tour?search=Expedition" className="partner-link">
									<div className="item-name">
										<span className="dot secondary-dot"></span>
										<span>National Geographic Expeditions</span>
									</div>
									<span className="item-desc">Certified Field Naturalists</span>
								</Link>
							</li>
							<li className="partner-item">
								<Link href="/tour?search=Overland" className="partner-link">
									<div className="item-name">
										<span className="dot secondary-dot"></span>
										<span>Abercrombie &amp; Kent</span>
									</div>
									<span className="item-desc">Bespoke Overland Trails</span>
								</Link>
							</li>
							<li className="partner-item">
								<Link href="/tour?search=Conservation" className="partner-link">
									<div className="item-name">
										<span className="dot secondary-dot"></span>
										<span>Wilderness Safaris</span>
									</div>
									<span className="item-desc">Pure Conservation Concessions</span>
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TravelPartners;
