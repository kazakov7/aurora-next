import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_MEMBER, GET_MEMBER_AGENT } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import FollowButton from '../common/FollowButton';
import { ChatConversation, ChatMember } from './chat.types';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { sweetErrorAlert } from '../../sweetAlert';
import { AgentVerificationStatus, AgentType } from '../../enums/agent.enum';
import moment from 'moment';
import { useI18n } from '../../i18n';

interface ChatDossierProps {
	conversation?: ChatConversation;
	currentMemberId: string;
}

const getPeer = (conversation: ChatConversation, currentMemberId: string): ChatMember | undefined => 
	conversation.memberOneId === currentMemberId ? conversation.memberTwoData : conversation.memberOneData;

const ChatDossier: React.FC<ChatDossierProps> = ({ conversation, currentMemberId }) => {
	const { t, tError, formatDate } = useI18n();
	const router = useRouter();
	const peer = conversation?.chatType === 'DIRECT' && conversation ? getPeer(conversation, currentMemberId) : undefined;
	const isGlobal = conversation?.chatType === 'GLOBAL';
	
	// Fetch real public profile of the member
	const { data, refetch, loading } = useQuery(GET_MEMBER, { 
		variables: { input: peer?._id || '' }, 
		skip: !peer?._id, 
		fetchPolicy: 'network-only' 
	});
	
	const queriedMember = data?.getMember;
	const member = peer && queriedMember?._id === peer._id ? queriedMember : peer;
	
	// Fetch agent details if the member is an AGENT
	const { data: agentData, loading: agentLoading } = useQuery(GET_MEMBER_AGENT, {
		variables: { memberId: member?._id || '' },
		skip: !member?._id || member?.memberType !== 'AGENT',
		fetchPolicy: 'network-only'
	});
	
	const agent = agentData?.getMemberAgent;

	const [subscribe, { loading: subscribing }] = useMutation(SUBSCRIBE);
	const [unsubscribe, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);

	const name = isGlobal ? t('common.globalChat') : member?.memberFullName || member?.memberNick || t('common.unavailableMember');
	const isFollowing = Boolean(member?.meFollowed?.[0]?.myFollowing);
	
	// Reset/Refetch when conversation switches
	useEffect(() => {
		if (peer?._id) {
			refetch({ input: peer._id });
		}
	}, [peer?._id, refetch]);

	const handleFollow = async () => {
		if (!member?._id) return;
		try {
			const options = {
				variables: { input: member._id },
				refetchQueries: ['GetMember', 'GetMyChats'],
				awaitRefetchQueries: true,
			};
			if (isFollowing) await unsubscribe(options);
			else await subscribe(options);
			await refetch({ input: member._id });
		} catch (error) {
			await sweetErrorAlert(tError(error, 'common.followUpdateFailed'));
		}
	};

	if (!conversation) {
		return (
			<aside aria-label={t('chat.dossier.memberInformation')} className="chat-dossier-panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
				<p style={{ color: '#707881', fontSize: '14px' }}>{t('chat.dossier.selectConversation')}</p>
			</aside>
		);
	}

	if (isGlobal) {
		return (
			<aside aria-label={t('chat.dossier.memberInformation')} className="chat-dossier-panel">
				<div className="dossier-profile-header">
					<div className="dossier-avatar-box">
						<div className="dossier-avatar-placeholder">
							<span className="material-symbols-outlined">public</span>
						</div>
					</div>
					<div className="name-verified-row">
						<h3>{t('chat.dossier.auroraGlobal')}</h3>
					</div>
					<span className="dossier-role-badge">{t('chat.dossier.communityLounge')}</span>
					<div className="dossier-stats-grid">
						<div className="stat-card">
							<span className="stat-val">24/7</span>
							<span className="stat-lbl">{t('common.active')}</span>
						</div>
						<div className="stat-card">
							<span className="stat-val">{t('chat.dossier.public')}</span>
							<span className="stat-lbl">{t('chat.dossier.access')}</span>
						</div>
					</div>
				</div>
				<div className="dossier-divider" />
				<div className="dossier-section">
					<span className="section-title">{t('chat.dossier.about')}</span>
					<div className="about-row">
						<span className="about-val">{t('chat.dossier.loungeDescription')}</span>
					</div>
				</div>
				<div className="dossier-divider" />
				<div className="dossier-section">
					<div className="shared-files-header">
						<div className="left-group">
							<span className="material-symbols-outlined">folder_shared</span>
							<span>{t('chat.dossier.sharedFilesMedia')}</span>
						</div>
						<span className="item-count">{t('chat.dossier.noItems')}</span>
					</div>
					<div className="files-list">
						<div className="file-item-row">
							<div className="file-info-left">
								<span className="material-symbols-outlined file-icon">info</span>
								<span className="file-name">{t('chat.dossier.attachmentsUnsupported')}</span>
							</div>
						</div>
					</div>
				</div>
			</aside>
		);
	}

	return (
		<aside aria-label={t('chat.dossier.memberInformation')} className="chat-dossier-panel">
			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#707881' }}>
					{t('chat.dossier.loadingProfile')}
				</div>
			) : (
				<>
					<div className="dossier-profile-header">
						<div className="dossier-avatar-box">
							<img src={getImageUrl(member?.memberImage, DEFAULT_USER_AVATAR)} alt={name} className="dossier-avatar" />
						</div>
						<div className="name-verified-row">
							<h3>{name}</h3>
							{agent?.verificationStatus === AgentVerificationStatus.APPROVED && (
								<span className="material-symbols-outlined verified-icon" title={t('chat.dossier.verifiedPartner')}>verified</span>
							)}
						</div>
						<span className="dossier-role-badge">
							{member?.memberType === 'AGENT' 
								? (agent?.agentType === AgentType.HOTEL ? t('chat.dossier.hotelPartner') : agent?.agentType === AgentType.TOUR ? t('chat.dossier.tourPartner') : t('chat.dossier.travelPartner')) 
								: t('common.travelerLabel')}
						</span>
						
						<div className="dossier-stats-grid">
							<div className="stat-card">
								<span className="stat-val">{member?.memberArticles || 0}</span>
								<span className="stat-lbl">{t('common.articles')}</span>
							</div>
							<div className="stat-card">
								<span className="stat-val">{member?.memberFollowers || 0}</span>
								<span className="stat-lbl">{t('common.followers')}</span>
							</div>
							<div className="stat-card">
								<span className="stat-val">{member?.memberFollowings || 0}</span>
								<span className="stat-lbl">{t('common.followButton.following')}</span>
							</div>
						</div>

						{member?._id && member._id !== currentMemberId && (
							<div className="dossier-actions-grid">
								<button type="button" className="btn-view-profile" onClick={() => void router.push(`/member?memberId=${member._id}`)}>
									{t('common.viewProfile')}
								</button>
								<FollowButton 
									isFollowing={isFollowing} 
									isLoading={subscribing || unsubscribing} 
									onClick={() => void handleFollow()} 
									style={{ width: '100%' }} 
								/>
							</div>
						)}
					</div>

					<div className="dossier-divider" />

					<div className="dossier-section">
						<span className="section-title">{t('chat.dossier.about')}</span>
						{member?.memberAddress ? (
							<div className="about-row">
								<span className="about-lbl">{t('common.location')}</span>
								<span className="about-val">{member.memberAddress}</span>
							</div>
						) : null}
						<div className="about-row">
							<span className="about-lbl">{t('chat.dossier.memberSince')}</span>
							<span className="about-val">{member?.createdAt ? formatDate(member.createdAt, 'monthYear') : '...'}</span>
						</div>
						{member?.memberDesc ? (
							<div className="about-row">
								<span className="about-lbl">{t('chat.dossier.bio')}</span>
								<span className="about-val">{member.memberDesc}</span>
							</div>
						) : null}
					</div>

					{member?.memberType === 'AGENT' && agent && (
						<>
							<div className="dossier-divider" />
							<div className="dossier-section">
								<span className="section-title">{t('chat.dossier.partnerDetails')}</span>
								<div className="agent-info-card">
									<div className="agent-info-row">
										<span className="ai-lbl">{t('chat.dossier.company')}</span>
										<span className="ai-val">{agent.companyName}</span>
									</div>
									<div className="agent-info-row">
										<span className="ai-lbl">{agent.agentType === AgentType.HOTEL ? t('chat.dossier.activeHotels') : t('chat.dossier.activeTours')}</span>
										<span className="ai-val">{agent.agentType === AgentType.HOTEL ? (member?.memberProperties || 0) : (member?.memberTours || 0)}</span>
									</div>
								</div>
							</div>
						</>
					)}

					<div className="dossier-divider" />
					<div className="dossier-section">
						<div className="shared-files-header">
							<div className="left-group">
								<span className="material-symbols-outlined">folder_shared</span>
								<span>{t('chat.dossier.sharedFilesMedia')}</span>
							</div>
							<span className="item-count">{t('chat.dossier.noItems')}</span>
						</div>
						<div className="files-list">
							<div className="file-item-row">
								<div className="file-info-left">
									<span className="material-symbols-outlined file-icon">info</span>
									<span className="file-name">{t('chat.dossier.attachmentsUnsupported')}</span>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</aside>
	);
};

export default ChatDossier;
