import React, { useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

export interface HostItem {
	id: string;
	name: string;
	avatar?: string;
	badge: string;
	ratingOrSub: string;
}

export interface AgencyItem {
	id: string;
	name: string;
	icon: string;
	locationOrSub: string;
}

// Curated verified lists matching Stitch HTML design specifications
const defaultHotelOwners: HostItem[] = [
	{
		id: '1',
		name: 'Julian Vance',
		avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKUBpOZ-VkQxNv0lwBRGi-VwT2sZYacCQmA_c2eNxPXymBedQobJ67uu7ZjUui4Qsq1DZIUxM9zap5yzde4ohaPaCw1nDgL7h5iPRjQw1fcwHp59PEMWgy9G4AAUcE_Q_QE9NPPm_EHBOTmVQr6gqSfdUG15oyHvPKnvM7saFdCBTw2D5xAfpWaWy6iDbg2N2v1Ws0ol_4V8fVZIbbQwVjK6DULcMW3OjzQzbz7wmiuHRbTq7Cxo8J',
		badge: 'Superhost',
		ratingOrSub: 'Valais Chalets · 4.98 ★',
	},
	{
		id: '2',
		name: 'Claire Delacroix',
		avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
		badge: 'Superhost',
		ratingOrSub: 'Provence Manors · 4.95 ★',
	},
	{
		id: '3',
		name: 'Kenji Takahashi',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
		badge: 'Premier Host',
		ratingOrSub: 'Kyoto Ryokans · 5.0 ★',
	},
	{
		id: '4',
		name: 'Astrid Lindholm',
		avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
		badge: 'Verified',
		ratingOrSub: 'Lofoten Cabins · 4.92 ★',
	},
	{
		id: '5',
		name: 'Matteo Rossi',
		avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
		badge: 'Superhost',
		ratingOrSub: 'Dolomite Lodges · 4.97 ★',
	},
	{
		id: '6',
		name: 'Fatima Al-Mansoor',
		avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
		badge: 'Luxury Host',
		ratingOrSub: 'Oman Desert Sanctuaries · 4.99 ★',
	},
	{
		id: '7',
		name: 'Henrik Vanger',
		avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
		badge: 'Superhost',
		ratingOrSub: 'Reykjavik Design Stays · 4.91 ★',
	},
	{
		id: '8',
		name: 'Zita Cobb',
		avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
		badge: 'Master Host',
		ratingOrSub: 'Fogo Island Hospitality · 5.0 ★',
	},
	{
		id: '9',
		name: 'David Lauren',
		avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
		badge: 'Superhost',
		ratingOrSub: 'Colorado Ranch Estates · 4.94 ★',
	},
	{
		id: '10',
		name: 'Beatrice Soneva',
		avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
		badge: 'Eco Host',
		ratingOrSub: 'Maldives Overwater Villas · 4.99 ★',
	},
];

const defaultTourAgencies: AgencyItem[] = [
	{
		id: 't1',
		name: 'Nordic Aurora Expeditions',
		icon: 'wb_twilight',
		locationOrSub: 'Polar Guide Agency · Tromsø',
	},
	{
		id: 't2',
		name: 'Cappadocia Sky Voyages',
		icon: 'flight',
		locationOrSub: 'Aerial Ballooning · Göreme',
	},
	{
		id: 't3',
		name: 'Atacama Celestial Tours',
		icon: 'nights_stay',
		locationOrSub: 'Stargazing Safaris · Chile',
	},
	{
		id: 't4',
		name: 'Cyclades Private Charters',
		icon: 'sailing',
		locationOrSub: 'Maritime Expeditions · Naxos',
	},
	{
		id: 't5',
		name: 'Kyoto Heritage Walks',
		icon: 'temple_buddhist',
		locationOrSub: 'Historical Curators · Kyoto',
	},
	{
		id: 't6',
		name: 'Inca Trail Naturalists',
		icon: 'hiking',
		locationOrSub: 'Andean Mountain Treks · Cusco',
	},
	{
		id: 't7',
		name: 'Swiss Alpine Rail & Trek',
		icon: 'train',
		locationOrSub: 'Glacier Mountaineering · Zermatt',
	},
	{
		id: 't8',
		name: 'Amalfi Coastline Cruises',
		icon: 'directions_boat',
		locationOrSub: 'Private Yachters · Positano',
	},
	{
		id: 't9',
		name: 'Serengeti Great Migration',
		icon: 'pets',
		locationOrSub: 'Wilderness Safaris · Arusha',
	},
	{
		id: 't10',
		name: 'Faroe Cliffs Expeditions',
		icon: 'waves',
		locationOrSub: 'Tour Agency · Faroe Islands',
	},
];

interface CommunitySidebarProps {
	realOwners?: HostItem[];
	realAgencies?: AgencyItem[];
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
	realOwners = [],
	realAgencies = [],
}) => {
	const [followedHosts, setFollowedHosts] = useState<Record<string, boolean>>({});
	const [followedAgencies, setFollowedAgencies] = useState<Record<string, boolean>>({});

	// Combine real database owners with curated list up to 10
	const hotelOwners = realOwners.length > 0
		? [...realOwners, ...defaultHotelOwners.filter((d) => !realOwners.some((r) => r.name === d.name))].slice(0, 10)
		: defaultHotelOwners;

	const tourAgencies = realAgencies.length > 0
		? [...realAgencies, ...defaultTourAgencies.filter((d) => !realAgencies.some((r) => r.name === d.name))].slice(0, 10)
		: defaultTourAgencies;

	const toggleFollowHost = (id: string, name: string) => {
		const nextState = !followedHosts[id];
		setFollowedHosts((prev) => ({ ...prev, [id]: nextState }));
		sweetTopSmallSuccessAlert(nextState ? `Following ${name}` : `Unfollowed ${name}`);
	};

	const toggleFollowAgency = (id: string, name: string) => {
		const nextState = !followedAgencies[id];
		setFollowedAgencies((prev) => ({ ...prev, [id]: nextState }));
		sweetTopSmallSuccessAlert(nextState ? `Following ${name}` : `Unfollowed ${name}`);
	};

	return (
		<aside className="community-sidebar-column">
			{/* SECTION 1: TOP 10 HOTEL OWNERS */}
			<div className="sidebar-ranking-card">
				<div className="card-header-bar">
					<div className="header-left">
						<span className="material-symbols-outlined header-icon">apartment</span>
						<div>
							<h3 className="section-title">Top 10 Hotel Owners</h3>
							<p className="section-subtitle">Curated hosts by verified stays</p>
						</div>
					</div>
					<Link href="/property" className="view-all-link">
						Explore
					</Link>
				</div>

				<ul className="ranked-rows-list">
					{hotelOwners.map((owner, idx) => {
						const isFollowing = !!followedHosts[owner.id];
						return (
							<li key={owner.id} className="ranked-item-row">
								<div className="item-profile-info">
									<span className="rank-number">{idx + 1}</span>
									<img
										className="user-avatar"
										src={owner.avatar}
										alt={owner.name}
									/>
									<div className="user-text-meta">
										<div className="name-line">
											<span className="user-name">{owner.name}</span>
											<span className="badge-tag">{owner.badge}</span>
										</div>
										<span className="sub-line">{owner.ratingOrSub}</span>
									</div>
								</div>

								<button
									type="button"
									className={`follow-toggle-btn ${isFollowing ? 'following' : ''}`}
									onClick={() => toggleFollowHost(owner.id, owner.name)}
								>
									{isFollowing ? 'Following' : 'Follow'}
								</button>
							</li>
						);
					})}
				</ul>
			</div>

			{/* SECTION 2: TOP 10 TOUR COMPANIES */}
			<div className="sidebar-ranking-card">
				<div className="card-header-bar">
					<div className="header-left">
						<span className="material-symbols-outlined header-icon">explore</span>
						<div>
							<h3 className="section-title">Top 10 Tour Companies</h3>
							<p className="section-subtitle">Top-rated expedition agencies</p>
						</div>
					</div>
					<Link href="/tour" className="view-all-link">
						Explore
					</Link>
				</div>

				<ul className="ranked-rows-list">
					{tourAgencies.map((agency, idx) => {
						const isFollowing = !!followedAgencies[agency.id];
						return (
							<li key={agency.id} className="ranked-item-row">
								<div className="item-profile-info">
									<div className="agency-icon-box">
										<span className="material-symbols-outlined">{agency.icon}</span>
									</div>
									<div className="user-text-meta">
										<span className="user-name">{agency.name}</span>
										<span className="sub-line">{agency.locationOrSub}</span>
									</div>
								</div>

								<button
									type="button"
									className={`follow-toggle-btn ${isFollowing ? 'following' : ''}`}
									onClick={() => toggleFollowAgency(agency.id, agency.name)}
								>
									{isFollowing ? 'Following' : 'Follow'}
								</button>
							</li>
						);
					})}
				</ul>
			</div>

			{/* Sidebar Editorial Trust Note */}
			<div className="sidebar-trust-standard-card">
				<div className="trust-header">
					<span className="material-symbols-outlined trust-icon">verified_user</span>
					<span className="trust-title">Aura Community Standard</span>
				</div>
				<p className="trust-description">
					All featured posts and rankings reflect verified stays and genuine guest ratings. Creators receive no remuneration for editorial mentions.
				</p>
			</div>
		</aside>
	);
};

export default CommunitySidebar;
