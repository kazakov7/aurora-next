import React, { useState } from 'react';
import { ChatConversation } from './chat.types';

interface ChatDossierProps {
	conversation: ChatConversation;
}

const ChatDossier: React.FC<ChatDossierProps> = ({ conversation }) => {
	const [isFollowing, setIsFollowing] = useState(true);

	const handleViewProfile = () => {
		alert(`Opening profile dossier for ${conversation.name}`);
	};

	const handleFileClick = (fileName: string) => {
		alert(`Opening shared file: ${fileName}`);
	};

	return (
		<aside aria-label="Member Dossier" className="chat-dossier-panel">
			{/* Profile Summary Header */}
			<div className="dossier-profile-header">
				<div className="dossier-avatar-box">
					{conversation.avatar ? (
						<img src={conversation.avatar} alt={conversation.name} className="dossier-avatar" />
					) : (
						<div className="dossier-avatar-placeholder">
							<span className="material-symbols-outlined">{conversation.icon || 'person'}</span>
						</div>
					)}
					<span className="check-badge">
						<span className="material-symbols-outlined">check</span>
					</span>
				</div>

				<div className="name-verified-row">
					<h3>{conversation.name}</h3>
					{conversation.verified && (
						<span className="material-symbols-outlined verified-icon">verified</span>
					)}
				</div>

				<span className="dossier-role-badge">
					{conversation.roleBadge || (conversation.role === 'partner' ? 'Hotel Partner' : 'Traveler')}
				</span>

				{conversation.location && (
					<p className="dossier-location">
						<span className="material-symbols-outlined">location_on</span>
						{conversation.location}
					</p>
				)}

				<p className="dossier-bio">{conversation.bio || 'AURA Member & Luxury Traveler'}</p>

				{/* Primary Direct Actions */}
				<div className="dossier-actions-grid">
					<button type="button" className="btn-view-profile" onClick={handleViewProfile}>
						View Profile
					</button>
					<button
						type="button"
						className={`btn-follow-toggle ${isFollowing ? 'following' : ''}`}
						onClick={() => setIsFollowing(!isFollowing)}
					>
						<span className="material-symbols-outlined">
							{isFollowing ? 'check' : 'person_add'}
						</span>
						<span>{isFollowing ? 'Following' : 'Follow'}</span>
					</button>
				</div>
			</div>

			<div className="dossier-divider" />

			{/* Partner Stays & Sanctuaries (if available) */}
			{conversation.properties && conversation.properties.length > 0 && (
				<>
					<div className="dossier-section">
						<div className="section-title-row">
							<span className="section-title">THEIR PROPERTIES</span>
							<span className="see-all-link" onClick={() => alert('Viewing all partner properties')}>
								See All ({conversation.properties.length + 1})
							</span>
						</div>

						{conversation.properties.map((prop) => (
							<div key={prop.id} className="property-dossier-card">
								<div className="prop-thumb" style={{ backgroundImage: `url('${prop.image}')` }} />
								<div className="prop-details">
									<h4>{prop.title}</h4>
									<p className="prop-loc">{prop.location}</p>
									<div className="prop-price-row">
										<span className="prop-price">
											From {prop.price}
											<span className="per-night"> / nt</span>
										</span>
										<span className="prop-rating">
											<span className="material-symbols-outlined star-icon">star</span>
											{prop.rating}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="dossier-divider" />
				</>
			)}

			{/* Shared Media & Documents Collapsible Section */}
			<div className="dossier-section">
				<div className="shared-files-header">
					<div className="left-group">
						<span className="material-symbols-outlined">folder_shared</span>
						<span>Shared Files & Media</span>
					</div>
					<span className="item-count">
						{conversation.sharedFiles ? `${conversation.sharedFiles.length} items` : '0 items'}
					</span>
				</div>

				<div className="files-list">
					{conversation.sharedFiles && conversation.sharedFiles.length > 0 ? (
						conversation.sharedFiles.map((f) => (
							<div
								key={f.id}
								className="file-item-row"
								onClick={() => handleFileClick(f.fileName)}
							>
								<div className="file-info-left">
									<span className="material-symbols-outlined file-icon">
										{f.type === 'pdf' ? 'description' : 'image'}
									</span>
									<span className="file-name">{f.fileName}</span>
								</div>
								<span className="file-size">{f.fileSize}</span>
							</div>
						))
					) : (
						<div className="file-item-row">
							<div className="file-info-left">
								<span className="material-symbols-outlined file-icon">info</span>
								<span className="file-name">No shared media yet</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Direct Host Protection Trust Badge */}
			<div className="dossier-trust-badge">
				<span className="material-symbols-outlined trust-icon">verified_user</span>
				<div className="trust-text font-body-sm">
					<p className="trust-title">AURA Verified Partner</p>
					<p className="trust-desc">
						Bookings through this chat are backed by Instant Escrow Protection and 24/7 Airside
						Concierge.
					</p>
				</div>
			</div>
		</aside>
	);
};

export default ChatDossier;
