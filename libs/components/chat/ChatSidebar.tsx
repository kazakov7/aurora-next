import React, { useMemo, useState } from 'react';
import { ChatConversation, ChatMember, ChatRole } from './chat.types';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { useI18n } from '../../i18n';

interface ChatSidebarProps {
	conversations: ChatConversation[];
	activeId: string;
	currentMemberId: string;
	loading: boolean;
	error?: string;
	onSelect: (id: string) => void;
	onViewProfile: (conversation: ChatConversation) => void;
	onRequestDelete: (conversation: ChatConversation) => void;
}

const getPeer = (conversation: ChatConversation, currentMemberId: string): ChatMember | undefined =>
	conversation.memberOneId === currentMemberId ? conversation.memberTwoData : conversation.memberOneData;

const getRole = (conversation: ChatConversation, currentMemberId: string): ChatRole =>
	conversation.chatType === 'GLOBAL'
		? 'global'
		: getPeer(conversation, currentMemberId)?.memberType === 'AGENT'
			? 'partner'
			: 'traveler';

const ChatSidebar: React.FC<ChatSidebarProps> = ({
	conversations,
	activeId,
	currentMemberId,
	loading,
	error,
	onSelect,
	onViewProfile,
	onRequestDelete,
}) => {
	const { t, formatDate } = useI18n();
	const [searchTerm, setSearchTerm] = useState('');
	const [filterTab, setFilterTab] = useState<'all' | 'partners' | 'travelers' | 'unread'>('all');
	const [openMenuId, setOpenMenuId] = useState('');
	const unreadTotal = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);
	const filteredConversations = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		return [...conversations]
			.sort((first, second) =>
				first.chatType === 'GLOBAL'
					? -1
					: second.chatType === 'GLOBAL'
						? 1
						: +new Date(second.lastMessageAt || 0) - +new Date(first.lastMessageAt || 0),
			)
			.filter((conversation) => {
				const role = getRole(conversation, currentMemberId);
				if (filterTab === 'partners' && role !== 'partner') return false;
				if (filterTab === 'travelers' && role !== 'traveler') return false;
				if (filterTab === 'unread' && !(conversation.unreadCount || 0)) return false;
				if (!normalizedSearch || role === 'global') return true;
				const peer = getPeer(conversation, currentMemberId);
				return `${peer?.memberNick || ''} ${peer?.memberFullName || ''}`.toLowerCase().includes(normalizedSearch);
			});
	}, [conversations, currentMemberId, filterTab, searchTerm]);

	return (
		<aside aria-label={t('chat.sidebar.conversationsDirectory')} className="chat-sidebar">
			<div className="sidebar-header">
				<div className="header-top-row"><div className="title-group"><h2>{t('chat.sidebar.messages')}</h2><span className="unread-badge">{t('chat.sidebar.unread', { unreadTotal })}</span></div></div>
				<div className="search-box"><span className="material-symbols-outlined search-icon">search</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t('chat.sidebar.searchConversations')} /></div>
				<div className="filter-pills">
					{(['all', 'partners', 'travelers', 'unread'] as const).map((tab) => <button key={tab} type="button" className={`pill-btn ${filterTab === tab ? 'active' : ''}`} onClick={() => setFilterTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</button>)}
				</div>
			</div>
			<div className="conversations-list">
				{loading && !conversations.length ? <div className="no-conversations-empty"><p>{t('chat.sidebar.loadingConversations')}</p></div> : null}
				{error ? <div className="no-conversations-empty"><p>{error}</p></div> : null}
				{filteredConversations.map((conversation) => {
					const role = getRole(conversation, currentMemberId);
					const peer = getPeer(conversation, currentMemberId);
					const name = role === 'global' ? t('common.globalChat') : peer?.memberNick || peer?.memberFullName || t('common.unavailableMember');
					const subtitle = role === 'global' ? t('navigation.community') : role === 'partner' ? t('chat.travelPartner') : t('common.travelerLabel');
					const isActive = conversation._id === activeId;
					const isDirect = conversation.chatType === 'DIRECT';
					return (
						<div key={conversation._id} className={`conversation-row ${isActive ? 'active' : ''} ${role === 'global' ? 'global-item' : ''}`}>
							<button type="button" className="conversation-item" onClick={() => onSelect(conversation._id)}>
								{isActive ? <span className="active-indicator" /> : null}
								<div className="avatar-box">{role === 'global' ? <div className="avatar-placeholder global"><span className="material-symbols-outlined">public</span></div> : <img src={getImageUrl(peer?.memberImage, DEFAULT_USER_AVATAR)} alt={name} className="avatar-img" />}</div>
								<div className="item-info"><div className="name-row"><span className="item-name">{name}</span><span className={`item-time ${isActive ? 'active-time' : ''}`}>{formatDate(conversation.lastMessageAt, 'time')}</span></div><div className="sub-row"><span className={`role-tag ${role}`}>{subtitle}</span></div><p className={`last-msg ${conversation.unreadCount ? 'unread-msg' : ''}`}>{conversation.lastMessage || t('chat.sidebar.noMessagesYet')}</p></div>
								{conversation.unreadCount ? <span className="unread-count-badge">{conversation.unreadCount}</span> : null}
							</button>
							{isDirect ? <div className="conversation-context"><button type="button" className="conversation-menu-trigger" aria-label={t('chat.sidebar.conversationActionsFor', { name })} aria-expanded={openMenuId === conversation._id} onClick={() => setOpenMenuId((current) => current === conversation._id ? '' : conversation._id)}><span className="material-symbols-outlined">more_horiz</span></button>{openMenuId === conversation._id ? <div className="conversation-context-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setOpenMenuId(''); onViewProfile(conversation); }}><span className="material-symbols-outlined">person</span>{t('common.viewProfile')}</button><button type="button" role="menuitem" className="delete-chat-menu-item" onClick={() => { setOpenMenuId(''); onRequestDelete(conversation); }}><span className="material-symbols-outlined">delete_outline</span>{t('chat.deleteChat')}</button></div> : null}</div> : null}
						</div>
					);
				})}
				{!loading && !error && !filteredConversations.length ? <div className="no-conversations-empty"><span className="material-symbols-outlined">forum</span><p>{t('chat.sidebar.noConversationsFound')}</p></div> : null}
			</div>
		</aside>
	);
};

export default ChatSidebar;
