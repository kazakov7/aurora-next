import React from 'react';

interface MemberSidebarProps {
	activeTab: 'articles' | 'followers' | 'following';
	onTabChange: (tab: 'articles' | 'followers' | 'following') => void;
	articlesCount?: number;
	followersCount?: number;
	followingCount?: number;
}

const MemberSidebar: React.FC<MemberSidebarProps> = ({
	activeTab,
	onTabChange,
	articlesCount = 18,
	followersCount = 14200,
	followingCount = 389,
}) => {
	const formatCount = (count: number) => {
		if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
		return String(count);
	};

	return (
		<aside aria-label="Member Profile Sections" className="member-sidebar">
			{/* Navigation Box */}
			<nav className="sidebar-nav-card">
				{/* Tab 1: Articles */}
				<button
					type="button"
					className={`nav-tab-item ${activeTab === 'articles' ? 'active' : ''}`}
					onClick={() => onTabChange('articles')}
				>
					<div className="tab-left">
						<span
							className="material-symbols-outlined tab-icon"
							style={activeTab === 'articles' ? { fontVariationSettings: "'FILL' 1" } : undefined}
						>
							menu_book
						</span>
						<span>Articles</span>
					</div>
					<span className="tab-badge">{articlesCount}</span>
				</button>

				{/* Tab 2: Followers */}
				<button
					type="button"
					className={`nav-tab-item ${activeTab === 'followers' ? 'active' : ''}`}
					onClick={() => onTabChange('followers')}
				>
					<div className="tab-left">
						<span className="material-symbols-outlined tab-icon">group</span>
						<span>Followers</span>
					</div>
					<span className="tab-badge">{formatCount(followersCount)}</span>
				</button>

				{/* Tab 3: Following */}
				<button
					type="button"
					className={`nav-tab-item ${activeTab === 'following' ? 'active' : ''}`}
					onClick={() => onTabChange('following')}
				>
					<div className="tab-left">
						<span className="material-symbols-outlined tab-icon">person_add</span>
						<span>Following</span>
					</div>
					<span className="tab-badge">{followingCount}</span>
				</button>
			</nav>

			{/* Member Registry Metadata Card */}
			<div className="credentials-card">
				<div className="credentials-header">
					<span className="material-symbols-outlined">verified</span>
					<span>Curator Credentials</span>
				</div>
				<p className="since-text">Member since May 2022</p>
				<p className="credentials-desc">
					42 Curated Journeys · 9 Design Monographs · Grand Prix de la Photographie Alpine
					nominee.
				</p>
			</div>
		</aside>
	);
};

export default MemberSidebar;
