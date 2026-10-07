import React, { useState } from 'react';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';

interface PropertyOverviewProps {
	property: Property;
}

const amenityIconMap: Record<string, string> = {
	wifi: 'wifi',
	pool: 'pool',
	sauna: 'sauna',
	kitchen: 'countertops',
	'air conditioning': 'ac_unit',
	heating: 'thermostat',
	elevator: 'elevator',
	'ocean view': 'water',
	'mountain view': 'landscape',
	spa: 'hot_tub',
	fireplace: 'fireplace',
	gym: 'fitness_center',
	parking: 'local_parking',
	concierge: 'room_service',
	breakfast: 'bakery_dining',
};

const PropertyOverview = ({ property }: PropertyOverviewProps) => {
	const [descExpanded, setDescExpanded] = useState(false);

	const hostName = property?.memberData?.memberNick || property?.memberData?.memberFullName || 'Julian Laurent';
	const hostImg = getImageUrl(
		property?.memberData?.memberImage,
		'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
	);

	const fullDesc =
		property?.propertyDesc ||
		'Perched on the pristine glacial precipice of the Matterhorn valley, this bespoke architectural sanctuary combines brutalist alpine concrete with century-old larch timber. Soaring double-height floor-to-ceiling glass pavilions frame unobstructed views of alpine summits, while heated geothermal terrazzo floors and ambient artisan lighting provide an unmatched cocoon of luxury after exhilarating days on the slopes.';

	const amenitiesList =
		property?.amenities && property.amenities.length > 0
			? property.amenities
			: [
					'1Gbps Starlink Wi-Fi',
					'Heated Geothermal Pool',
					'Finnish Panoramic Sauna',
					'Ski Locker & Boot Dryer',
					'Artisan Organic Breakfast',
					'Matterhorn Mountain View',
					'Suspended Hearth Fireplace',
					'Private Valet Electro-Shuttle',
					'Grand Cru Wine Cellar',
			  ];

	return (
		<div className="left-column-content">
			{/* Chalet Overview Specs */}
			<div className="detail-card overview-specs-card">
				<div className="specs-card-header">
					<div>
						<h2 className="specs-heading">
							{property?.propertyType ? `Private Modernist ${property.propertyType}` : 'Private Modernist Chalet'}
						</h2>
						<p className="specs-subtext">Curated by Swiss Heritage Atelier · Built 2023</p>
					</div>
					<div className="superhost-pill">
						<span className="material-symbols-outlined">verified</span>
						<span>Sanctuary Superhost</span>
					</div>
				</div>

				{/* Quick Spec Chips */}
				<div className="quick-specs-grid">
					<div className="spec-chip">
						<span className="material-symbols-outlined spec-icon">groups</span>
						<div className="spec-details">
							<span className="spec-label">Capacity</span>
							<span className="spec-value">{property?.maxGuests || 8} Guests</span>
						</div>
					</div>
					<div className="spec-chip">
						<span className="material-symbols-outlined spec-icon">king_bed</span>
						<div className="spec-details">
							<span className="spec-label">Bedrooms</span>
							<span className="spec-value">{property?.bedrooms || 4} Bedrooms</span>
						</div>
					</div>
					<div className="spec-chip">
						<span className="material-symbols-outlined spec-icon">bathtub</span>
						<div className="spec-details">
							<span className="spec-label">Bathrooms</span>
							<span className="spec-value">{property?.bathrooms || 3} Baths</span>
						</div>
					</div>
					<div className="spec-chip">
						<span className="material-symbols-outlined spec-icon">square_foot</span>
						<div className="spec-details">
							<span className="spec-label">Living Area</span>
							<span className="spec-value">420 m²</span>
						</div>
					</div>
				</div>
			</div>

			{/* Description Narrative */}
			<div className="detail-card description-card">
				<h3 className="section-title">The Sanctuary Experience</h3>
				<div className={`description-body ${descExpanded ? 'expanded' : ''}`}>
					<p>{fullDesc}</p>
					{descExpanded && (
						<p className="extra-paragraph">
							Constructed with ultra-low carbon footprint technology, triple-glazed solar thermal glass,
							and natural spruce cladding from sustainably managed cantonal forests. Every suite includes
							individual climate zoning, acoustic dampening walls, and custom artisanal furniture commissioned
							exclusively for this sanctuary retreat.
						</p>
					)}
				</div>
				<button
					className="read-more-toggle"
					type="button"
					onClick={() => setDescExpanded(!descExpanded)}
				>
					<span>{descExpanded ? 'Show less' : 'Read more about the architecture'}</span>
					<span className="material-symbols-outlined">
						{descExpanded ? 'expand_less' : 'expand_more'}
					</span>
				</button>
			</div>

			{/* Sanctuary Highlights */}
			<div className="detail-card highlights-card">
				<h3 className="section-title">Sanctuary Highlights</h3>
				<div className="highlights-grid">
					<div className="highlight-item">
						<div className="highlight-icon-box">
							<span className="material-symbols-outlined">downhill_skiing</span>
						</div>
						<div className="highlight-content">
							<h4 className="highlight-title">Ski-In / Ski-Out Access</h4>
							<p className="highlight-desc">
								Immediate link to premier ski trails via private heated terrace track.
							</p>
						</div>
					</div>
					<div className="highlight-item">
						<div className="highlight-icon-box">
							<span className="material-symbols-outlined">hot_tub</span>
						</div>
						<div className="highlight-content">
							<h4 className="highlight-title">Private Geothermal Spa</h4>
							<p className="highlight-desc">
								Bio-sauna, cedar cold-plunge barrel, and 38°C outdoor hydrotherapy infinity spa.
							</p>
						</div>
					</div>
					<div className="highlight-item">
						<div className="highlight-icon-box">
							<span className="material-symbols-outlined">room_service</span>
						</div>
						<div className="highlight-content">
							<h4 className="highlight-title">Dedicated Concierge</h4>
							<p className="highlight-desc">
								Daily artisan breakfast, lift pass provisioning, and bespoke mountain guide bookings.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Curated Amenities Grid */}
			<div className="detail-card amenities-card">
				<div className="amenities-header">
					<h3 className="section-title">Curated Amenities</h3>
					<span className="amenities-count">{amenitiesList.length} Included Features</span>
				</div>
				<div className="amenities-grid">
					{amenitiesList.map((item, idx) => {
						const normalized = item.toLowerCase();
						const iconKey = Object.keys(amenityIconMap).find((k) => normalized.includes(k));
						const iconName = iconKey ? amenityIconMap[iconKey] : 'check_circle';

						return (
							<div key={idx} className="amenity-item">
								<span className="material-symbols-outlined amenity-icon">{iconName}</span>
								<span className="amenity-name">{item}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Location & Setting */}
			<div className="detail-card location-card">
				<div className="location-header">
					<div>
						<h3 className="section-title">Location & Setting</h3>
						<p className="location-address">
							{property?.propertyAddress || 'Schluhmattstrasse 119, 3920 Zermatt, Switzerland'}
						</p>
					</div>
					<span className="location-distance">
						<span className="material-symbols-outlined">navigation</span>
						350m to Mountain Gondola
					</span>
				</div>

				<div
					className="map-preview-banner"
					style={{
						backgroundImage:
							"url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdgBJhVqHOY5l_KWREqb0QPu2P62YoFrUoNLKLnwAXHwgtOFdW37XYJHnJjh60z-sAwUN5yFBs_bz3xmdyFSQ2HlsvXf9GXBNo8i3O0Ibl5MghWV5_iIAQTPD-KvmzMLW-HJi_WwFNeXU16JFR2cBtuLHvURoM6MdvkSGkMlHi0yGTMuCoQxsvIBeww2g0Qs_10aWDLdcGI97Ro4rSpmYWePMwFtDz4sp5qhvwNWPm8p0wUuMfR6Jl')",
					}}
				>
					<div className="map-overlay-tint"></div>
					<div className="floating-pin-badge">
						<span className="ping-dot"></span>
						<span className="pin-dot"></span>
						<span className="pin-title">{property?.propertyName || 'Alpine Sanctuary'}</span>
						<span className="pin-elev">(1,840m)</span>
					</div>
					<div className="map-bottom-tag">
						Vehicle-free zone • 8 mins to Central Station via Electro-Cart
					</div>
				</div>
			</div>

			{/* Host Profile Card */}
			<div className="detail-card host-profile-card">
				<div className="host-card-inner">
					<div className="host-main-info">
						<div className="host-avatar-wrapper">
							<img
								src={hostImg}
								alt={hostName}
								className="host-avatar"
							/>
							<span className="host-badge-check">
								<span className="material-symbols-outlined">check</span>
							</span>
						</div>
						<div className="host-text-details">
							<h3 className="host-name">{hostName}</h3>
							<p className="host-title">Sanctuary Host · 7 years hosting</p>
							<div className="host-metrics-row">
								<div className="metric-chip">
									<span
										className="material-symbols-outlined star-icon"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										star
									</span>
									<span>4.99 Rating</span>
								</div>
								<span className="metric-sep">•</span>
								<span className="metric-text">100% Response Rate (within 1 hour)</span>
							</div>
						</div>
					</div>

					<div className="host-action-buttons">
						<button className="host-btn secondary-btn" type="button">
							View Profile
						</button>
						<button className="host-btn primary-btn" type="button">
							Message Host
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PropertyOverview;
