import React, { useState } from 'react';
import { ChatConversation } from './chat.types';

interface ChatSidebarProps {
	conversations: ChatConversation[];
	activeId: string;
	onSelect: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ conversations, activeId, onSelect }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filterTab, setFilterTab] = useState<'all' | 'partners' | 'travelers' | 'unread'>('all');

	const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

	const globalChat = conversations.find((c) => c.id === 'global');
	const otherFilteredConversations = conversations
		.filter((c) => c.id !== 'global')
		.filter((c) => {
			// Filter by search
			const matchesSearch =
				c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(c.subtitle && c.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
				c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

			if (!matchesSearch) return false;

			// Filter by Tab
			if (filterTab === 'partners') return c.role === 'partner';
			if (filterTab === 'travelers') return c.role === 'traveler';
			if (filterTab === 'unread') return (c.unreadCount || 0) > 0;
			return true;
		});
		
	const filteredConversations = globalChat 
		? [globalChat, ...otherFilteredConversations] 
		: otherFilteredConversations;

	return (
		<aside aria-label="Conversations Directory" className="chat-sidebar">
			{/* Sidebar Header */}
			<div className="sidebar-header">
				<div className="header-top-row">
					<div className="title-group">
						<h2>Messages</h2>
						<span className="unread-badge">{unreadTotal} Unread</span>
					</div>
					<button
						type="button"
						className="compose-btn"
						aria-label="Compose new message"
						onClick={() => alert('Compose new message: Select a contact or search members.')}
					>
						<span className="material-symbols-outlined">edit_square</span>
					</button>
				</div>

				{/* Search Input */}
				<div className="search-box">
					<span className="material-symbols-outlined search-icon">search</span>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search conversations..."
					/>
				</div>

				{/* Segmented Filter Pills */}
				<div className="filter-pills">
					<button
						type="button"
						className={`pill-btn ${filterTab === 'all' ? 'active' : ''}`}
						onClick={() => setFilterTab('all')}
					>
						All
					</button>
					<button
						type="button"
						className={`pill-btn ${filterTab === 'partners' ? 'active' : ''}`}
						onClick={() => setFilterTab('partners')}
					>
						Partners
					</button>
					<button
						type="button"
						className={`pill-btn ${filterTab === 'travelers' ? 'active' : ''}`}
						onClick={() => setFilterTab('travelers')}
					>
						Travelers
					</button>
					<button
						type="button"
						className={`pill-btn ${filterTab === 'unread' ? 'active' : ''}`}
						onClick={() => setFilterTab('unread')}
					>
						Unread
					</button>
				</div>
			</div>

			{/* Conversations Scroll List */}
			<div className="conversations-list">
				{filteredConversations.map((item) => {
					const isActive = item.id === activeId;
					return (
						<div
							key={item.id}
							className={`conversation-item ${isActive ? 'active' : ''} ${item.role === 'global' ? 'global-item' : ''}`}
							onClick={() => onSelect(item.id)}
						>
							{isActive && <span className="active-indicator" />}

							<div className="avatar-box">
								{item.avatar ? (
									<img src={item.avatar} alt={item.name} className="avatar-img" />
								) : (
									<div className={`avatar-placeholder ${item.role}`}>
										<span className="material-symbols-outlined">
											{item.icon || (item.role === 'global' ? 'public' : 'person')}
										</span>
									</div>
								)}
								{item.isOnline && <span className="online-dot" />}
							</div>

							<div className="item-info">
								<div className="name-row">
									<span className="item-name">{item.name}</span>
									<span className={`item-time ${isActive ? 'active-time' : ''}`}>{item.lastTime}</span>
								</div>
								<div className="sub-row">
									{item.role === 'global' ? (
										<span className="role-tag global">Community Lounge</span>
									) : item.role === 'partner' ? (
										<span className="role-tag partner">{item.subtitle || 'Hotel Partner'}</span>
									) : (
										<span className="role-tag traveler">{item.subtitle || 'Verified Explorer'}</span>
									)}
								</div>
								<p className={`last-msg ${item.unreadCount ? 'unread-msg' : ''}`}>{item.lastMessage}</p>
							</div>

							{item.unreadCount ? (
								<span className="unread-count-badge">{item.unreadCount}</span>
							) : item.role === 'partner' ? (
								<span className="material-symbols-outlined check-icon">done_all</span>
							) : null}
						</div>
					);
				})}

				{filteredConversations.length === 0 && (
					<div className="no-conversations-empty">
						<span className="material-symbols-outlined">search_off</span>
						<p>No conversations found</p>
					</div>
				)}
			</div>
		</aside>
	);
};

export default ChatSidebar;
