import React from 'react';
import { Tour } from '../../../types/tour/tour';
import { getImageUrl } from '../../../config';

interface TourOverviewProps {
	tour: Tour;
}

const defaultOrganizerAvatar =
	'https://lh3.googleusercontent.com/aida-public/AB6AXuANoecLgaWjzQNuQDqK45KStN1kt_4y-k9YU_-VhqfIcrv5ULVIPKysd0NQHnnmGTq3JnEnYX9V1Vbe8nD0OWSmrnUJMPl6hJB9ZE32Hpf0qJBICp5dgAznzJLdeo151taqlrU1zw1rSxfGI3PgwRWYwIu-8XYWCW7bqHZjgrzvXgYSHu7UqFp4SvP-QvHazGkPP6siC6H-9ulf0_-HLlgW7GOrkFyqA_SaaqsrS-8ibS1tTJYvE3iv';

const itineraryDays = [
	{
		day: 'Day 1',
		title: 'Zurich Arrival & Lakeshore Welcome Reception',
		desc: 'VIP reception at Zurich Airport (ZRH), private transfer to lakefront hotel, evening welcome cocktail cruise on Lake Zurich.',
	},
	{
		day: 'Day 2',
		title: 'Lucerne Historic Old Town & Mount Pilatus Cogwheel Rail',
		desc: "Stroll through Chapel Bridge, ascent via the world's steepest cogwheel railway to Pilatus Kulm (2,132m) with panoramic alpine lunch.",
	},
	{
		day: 'Day 3',
		title: 'GoldenPass Express Transit to Bernese Oberland & Grindelwald',
		desc: 'Ride the gauge-changing GoldenPass panoramic train through Simmental Valley to Grindelwald at the foot of the Eiger North Face.',
	},
	{
		day: 'Day 4',
		title: 'Jungfrau Region & Aletsch Glacier High-Altitude Exploration',
		desc: 'High-speed Eiger Express tricable gondola to Jungfraujoch (3,454m), Sphinx observatory, Ice Palace, and glacier plateau trek with UIAGM guide.',
	},
	{
		day: 'Day 5',
		title: 'Glacier Express Panoramic Crossing to Zermatt',
		desc: 'Board the legendary Glacier Express Excellence Class through the Oberalp Pass and Rhone Valley arriving into car-free Zermatt.',
	},
	{
		day: 'Day 6',
		title: 'Gornergrat Ridge (3,089m) & Valais Sommelier Pairing',
		desc: 'Catch morning reflections at Riffelsee, view 29 four-thousand-meter peaks, followed by cellar tasting of artisanal Valais Heida & Petite Arvine.',
	},
	{
		day: 'Day 7',
		title: 'Alpine Farewell Breakfast & Airport VIP Transfer',
		desc: 'Artisan breakfast facing the Matterhorn, electro-shuttle transfer to Zermatt station, and 1st class rail connection to Zurich Airport for return flight.',
	},
];

const inclusionsList = [
	'6 nights luxury 5-star alpine boutique & historic hotel stays',
	'Daily artisanal breakfast & curated 4-course alpine dinners',
	'1st Class Swiss Travel Pass with reserved Glacier Express seats',
	'Full-time UIAGM certified Swiss alpine naturalist escort',
	'Jungfraujoch & Gornergrat summit rail passes and admissions',
	'Door-to-door luggage porterage between all transit hubs',
];

const exclusionsList = [
	'International roundtrip flights from Seoul (ICN)',
	'Personal boutique shopping and optional spa treatments',
	'Comprehensive international travel and medical evacuation insurance',
	'Optional scenic helicopter charters over the Matterhorn',
];

const TourOverview = ({ tour }: TourOverviewProps) => {
	// Format dates
	const formatDate = (dateVal: any, fallback: string) => {
		if (!dateVal) return fallback;
		const d = new Date(Number(dateVal) || dateVal);
		if (isNaN(d.getTime())) return fallback;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	};

	const startDateStr = formatDate(tour?.tourStartDate, 'Oct 12, 2026');
	const endDateStr = formatDate(tour?.tourEndDate, 'Oct 18, 2026');

	// Calculate duration
	const getDurationText = () => {
		if (tour?.tourStartDate && tour?.tourEndDate) {
			const start = new Date(Number(tour.tourStartDate) || tour.tourStartDate);
			const end = new Date(Number(tour.tourEndDate) || tour.tourEndDate);
			const diffDays = Math.max(
				1,
				Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
			);
			const nights = Math.max(1, diffDays - 1);
			return `${diffDays}D / ${nights}N`;
		}
		return '7D / 6N';
	};

	const totalCapacity = tour?.tourCapacity || 14;
	const reserved = tour?.tourReservedSeats || 0;
	const seatsLeft = Math.max(1, totalCapacity - reserved);

	const organizerName =
		tour?.memberData?.memberNick ||
		tour?.memberData?.memberFullName ||
		'Swiss Alpine Atelier & Expeditions';
	const organizerAvatar = getImageUrl(tour?.memberData?.memberImage, defaultOrganizerAvatar);

	const tourDescText =
		tour?.tourDesc ||
		'Traverse the jagged heart of the Swiss Confederation on an ultra-curated seven-day odyssey engineered for discerning explorers. From the pristine waterfronts of Lake Zurich and Lucerne to the towering ice realms of the Jungfrau Region and the iconic frontal silhouette of the Matterhorn in Zermatt, experience Switzerland via first-class panoramic scenic railways, private alpine lodges, and insider access to historic mountain hamlets.';

	return (
		<div className="left-column-content">
			{/* Tour Overview Card */}
			<div className="detail-card tour-about-card">
				<div className="about-header-row">
					<div>
						<h2 className="about-heading">About This Tour</h2>
						<p className="about-subtext">Exclusive 7-Day Swiss Panoramic &amp; High-Alpine Odyssey</p>
					</div>
					<div className="certified-badge">
						<span className="material-symbols-outlined">verified</span>
						<span>Certified Expedition</span>
					</div>
				</div>

				{/* 8 Metadata Badges Grid */}
				<div className="metadata-badges-grid">
					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">schedule</span>
						<div className="badge-details">
							<span className="badge-label">Duration</span>
							<span className="badge-val">{getDurationText()}</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">flight_takeoff</span>
						<div className="badge-details">
							<span className="badge-label">Departure</span>
							<span className="badge-val">
								{tour?.tourDepartureCity || 'Seoul'} ({tour?.tourDepartureCountry?.slice(0, 3)?.toUpperCase() || 'ICN'})
							</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">public</span>
						<div className="badge-details">
							<span className="badge-label">Destination</span>
							<span className="badge-val">{tour?.tourDestinationCity || 'Switzerland'}</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">event</span>
						<div className="badge-details">
							<span className="badge-label">Start Date</span>
							<span className="badge-val">{startDateStr}</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">event_available</span>
						<div className="badge-details">
							<span className="badge-label">End Date</span>
							<span className="badge-val">{endDateStr}</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">groups</span>
						<div className="badge-details">
							<span className="badge-label">Group Size</span>
							<span className="badge-val">Max {totalCapacity} Guests</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">airline_seat_recline_extra</span>
						<div className="badge-details">
							<span className="badge-label">Availability</span>
							<span className="badge-val text-error">{seatsLeft} Seats Left</span>
						</div>
					</div>

					<div className="meta-badge-chip">
						<span className="material-symbols-outlined badge-icon">train</span>
						<div className="badge-details">
							<span className="badge-label">Class</span>
							<span className="badge-val">1st Class Rail</span>
						</div>
					</div>
				</div>

				{/* Description Narrative */}
				<div className="about-description-text">
					<p>{tourDescText}</p>
				</div>
			</div>

			{/* Tour Highlights */}
			<div className="detail-card highlights-card">
				<h3 className="section-title">Expedition Highlights</h3>
				<div className="highlights-grid">
					<div className="highlight-item">
						<div className="highlight-icon-box">
							<span className="material-symbols-outlined">train</span>
						</div>
						<div className="highlight-content">
							<h4 className="highlight-title">Glacier Express First Class</h4>
							<p className="highlight-desc">
								Panoramic domed carriage &amp; sommelier pairing across alpine passes.
							</p>
						</div>
					</div>

					<div className="highlight-item">
						<div className="highlight-icon-box">
							<span className="material-symbols-outlined">landscape</span>
						</div>
						<div className="highlight-content">
							<h4 className="highlight-title">Top of Europe Access</h4>
							<p className="highlight-desc">
								Jungfraujoch 3,454m ice palace &amp; private viewing deck access.
							</p>
						</div>
					</div>

					<div className="highlight-item">
						<div className="highlight-icon-box">
							<span className="material-symbols-outlined">hiking</span>
						</div>
						<div className="highlight-content">
							<h4 className="highlight-title">Alpine Naturalist Lead</h4>
							<p className="highlight-desc">
								UIAGM certified Swiss guide accompanying throughout all trails.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Day-by-Day Itinerary */}
			<div className="detail-card itinerary-card">
				<div className="itinerary-header-row">
					<div>
						<h3 className="section-title">Your Journey</h3>
						<p className="section-subtext">Explore your adventure, day by day.</p>
					</div>
					<span className="itinerary-meta-pill">7 Days · Complete Schedule</span>
				</div>

				<div className="itinerary-days-stack">
					{itineraryDays.map((item, idx) => (
						<div key={idx} className="itinerary-day-row">
							<span className="day-badge">{item.day}</span>
							<div className="day-details">
								<h4 className="day-title">{item.title}</h4>
								<p className="day-desc">{item.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Package Provisions: What's Included & Not Included */}
			<div className="detail-card provisions-card">
				<div className="provisions-header-row">
					<h3 className="section-title">Package Provisions</h3>
					<span className="provisions-tag">Transparent Inclusions</span>
				</div>

				<div className="provisions-grid">
					{/* Included */}
					<div className="provisions-column">
						<h4 className="column-heading included">
							<span className="material-symbols-outlined">check_circle</span>
							<span>What&apos;s Included</span>
						</h4>
						<ul className="provisions-list">
							{inclusionsList.map((item, idx) => (
								<li key={idx} className="provision-item">
									<span className="material-symbols-outlined check-icon">check</span>
									<span>{item}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Not Included */}
					<div className="provisions-column">
						<h4 className="column-heading excluded">
							<span className="material-symbols-outlined">cancel</span>
							<span>Not Included</span>
						</h4>
						<ul className="provisions-list">
							{exclusionsList.map((item, idx) => (
								<li key={idx} className="provision-item">
									<span className="material-symbols-outlined close-icon">close</span>
									<span>{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* Departure & Meeting Point */}
			<div className="detail-card departure-card">
				<div className="departure-header-row">
					<div>
						<h3 className="section-title">Departure &amp; Meeting Point</h3>
						<p className="section-subtext">
							{tour?.tourDepartureCity || 'Seoul Incheon'} International Airport Logistics
						</p>
					</div>
					<span className="departure-status-badge">
						<span className="material-symbols-outlined">flight_takeoff</span>
						<span>Guaranteed Departure Window</span>
					</span>
				</div>

				<div className="departure-boxes-grid">
					<div className="departure-box">
						<div className="box-title-row">
							<span className="material-symbols-outlined">meeting_room</span>
							<span>Origin &amp; Meeting Counter</span>
						</div>
						<p className="box-main-text">
							{tour?.tourDeparturePlace || 'Incheon ICN Terminal 2, Departure Counter H'}
						</p>
						<p className="box-sub-text">
							Group assembly at 08:30 KST on departure day with expedition director.
						</p>
					</div>

					<div className="departure-box">
						<div className="box-title-row">
							<span className="material-symbols-outlined">verified</span>
							<span>Dates &amp; Verification</span>
						</div>
						<p className="box-main-text">
							{startDateStr} — {endDateStr}
						</p>
						<p className="box-sub-text">
							Requires 6-month passport validity. Complimentary Schengen visa documentation provided.
						</p>
					</div>
				</div>
			</div>

			{/* Tour Organizer Card */}
			<div className="detail-card organizer-card">
				<div className="organizer-inner">
					<div className="organizer-main-info">
						<div className="organizer-avatar-wrapper">
							<img
								src={organizerAvatar}
								alt={organizerName}
								className="organizer-avatar"
							/>
							<span className="organizer-check-badge">
								<span className="material-symbols-outlined">check</span>
							</span>
						</div>
						<div className="organizer-text-info">
							<div className="organizer-name-row">
								<h4 className="organizer-name">{organizerName}</h4>
								<span className="verified-operator-pill">Verified Tour Operator</span>
							</div>
							<p className="organizer-desc">
								16 years leading Swiss expeditions • Official Swiss Tourism Alliance Member
							</p>
							<div className="organizer-metrics-row">
								<span>★ 4.99 Operator Rating</span>
								<span>•</span>
								<span>100% On-Time Departure Guarantee</span>
							</div>
						</div>
					</div>

					<div className="organizer-actions">
						<button className="organizer-btn secondary" type="button">
							View Profile
						</button>
						<button className="organizer-btn primary" type="button">
							<span className="material-symbols-outlined">chat</span>
							<span>Message Organizer</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TourOverview;
