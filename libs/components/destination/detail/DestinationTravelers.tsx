import React, { useState } from 'react';
import Link from 'next/link';

interface DestinationTravelersProps {
	destinationName: string;
}

interface TravelerItem {
	id: string;
	name: string;
	username: string;
	avatar: string;
	role: string;
	journeys: number;
	following: boolean;
}

const initialTravelers: TravelerItem[] = [
	{
		id: 't-1',
		name: 'Elena Rostova',
		username: '@elenarostova',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBTPKxoK4CRvWNLxGvuiHRpwLEBBSAL_I0W9PrlovJQ1ZJr3LNmbbg7x0UDQ8xUAdTec_neeI3CYw0CcZtQsw970lBrKOVwEb45JRvCjqGXPtXeanNsjuMZ-ugo4VfnGqsacjtxvVsN3o9-l0DPXLc25aCNVlktdJiTT14RMWZJSkJOVa6JywX_TJQdyQTQSiCcdKTijiB2QyG9OVicA2Ybfo3z17l9kUFunQXHM9Hf6DcvqOlqlZKw',
		role: 'Alpine Mountaineer & Architectural Explorer',
		journeys: 3,
		following: true,
	},
	{
		id: 't-2',
		name: 'Marcus Chen',
		username: '@marcuschen',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuB3hEmjbDUAwZDYRHjIl7QHtdOlKLWr1DsIl5eSFoWoQQ8Wyv00XaUFU1VwKaV0kxrZS69fV9Q6kpkkEfpFEdC8X6gS_lDun18mOuXT54Ertgxm7J0o0tHLYaDv20vx18XTD6pDzk_DcQBkQmurnxzJmnxTmluwLPlkxY0cd8ydcpC6PQ78ZL8CmyJ8KrS_g4bnxWArRStLLR8Lz8Kdu_9jabVCfYIyHl1fbekuA7-_SF_qy1LtDz2A',
		role: 'Architectural Curator & Modernist',
		journeys: 5,
		following: false,
	},
	{
		id: 't-3',
		name: 'Aria Takahashi',
		username: '@ariatakahashi',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAynuRLFE7gpnD7yZj5D0F58V_s3UG8nUTYJrc-_1_LdEnV23wJ7msMDDmEWhZS0QHsi-A4G008gbUCEcj6Y5ifrk2SpwrbUHidRh7LTavYOvDrInJxqUOgY8NUDQLj7nph_NWIqar5uKqRm3nE4lvVtvtIbdFcqNrr6jO2Te3tRk-GMXqKb-PI-J8XRckrmbxmo4najvCS1WrAN2-gnk_vKV_svpOSZIuKo_r2YpegGBg7c8XG2FuO',
		role: 'Tea Master & Cultural Scholar',
		journeys: 4,
		following: true,
	},
	{
		id: 't-4',
		name: 'Kenji Sato',
		username: '@kenjisato',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDqwBfhJNJK3lYwJcQq4vVSM3YU0R-et3veoRckgSu4rlaCdXjLQ1Jf8igjRpt_OfqFXyTWpS4q1G5986G-0jSqffblMb-xfzmA1PPvaiRC1uycrSJ7PeJoVDlhlTh5p4oL87tc6XGiWDXMV08ZKI4S6Q1A9S1Qc0GOhFSJBewx7vHY1VCAEQsvu5dxhA-WSKOO-068GkXBmfUHfa-mka-RGN4WpDSxe06itsI9fNXf0MsNYMxJP9JL',
		role: 'Documentary Photographer & Essayist',
		journeys: 2,
		following: false,
	},
];

const DestinationTravelers = ({ destinationName }: DestinationTravelersProps) => {
	const [travelers, setTravelers] = useState<TravelerItem[]>(initialTravelers);

	const toggleFollow = (id: string) => {
		setTravelers((prev) =>
			prev.map((t) => (t.id === id ? { ...t, following: !t.following } : t)),
		);
	};

	return (
		<section className="destination-travelers-section">
			<div className="section-header-box">
				<h2 className="travelers-heading">Travelers Who Explored {destinationName}</h2>
				<p className="travelers-subheading">
					Meet people who have experienced this destination.
				</p>
			</div>

			<div className="travelers-cards-grid">
				{travelers.map((traveler) => (
					<div key={traveler.id} className="traveler-card-item">
						<img src={traveler.avatar} alt={traveler.name} className="traveler-avatar" />
						<h3 className="traveler-name">{traveler.name}</h3>
						<span className="traveler-handle">{traveler.username}</span>
						<p className="traveler-bio">{traveler.role}</p>

						<div className="journeys-badge-pill">
							<span className="material-symbols-outlined icon-plane">flight_takeoff</span>
							<span>
								{traveler.journeys} Journeys to {destinationName}
							</span>
						</div>

						<div className="card-actions-row">
							<Link href="/community" className="profile-link">
								View Profile
							</Link>
							<button
								type="button"
								className={`follow-toggle-btn ${traveler.following ? 'following' : ''}`}
								onClick={() => toggleFollow(traveler.id)}
							>
								{traveler.following ? 'Following' : '+ Follow'}
							</button>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default DestinationTravelers;
