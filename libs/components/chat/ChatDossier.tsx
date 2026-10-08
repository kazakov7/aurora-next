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

interface ChatDossierProps {
	conversation?: ChatConversation;
	currentMemberId: string;
}

const getPeer = (conversation: ChatConversation, currentMemberId: string): ChatMember | undefined => 
	conversation.memberOneId === currentMemberId ? conversation.memberTwoData : conversation.memberOneData;

const ChatDossier: React.FC<ChatDossierProps> = ({ conversation, currentMemberId }) => {
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

	const name = isGlobal ? 'Global Chat' : member?.memberFullName || member?.memberNick || 'Unavailable member';
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
			await sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.');
		}
	};

	if (!conversation) {
		return (
			<aside aria-label="Member information" className="chat-dossier-panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
				<p style={{ color: '#707881', fontSize: '14px' }}>Select a conversation to view details.</p>
			</aside>
		);
	}

	if (isGlobal) {
		return (
			<aside aria-label="Member information" className="chat-dossier-panel">
				<div className="dossier-profile-header">
					<div className="dossier-avatar-box">
						<div className="dossier-avatar-placeholder">
							<span className="material-symbols-outlined">public</span>
						</div>
					</div>
					<div className="name-verified-row">
						<h3>AURORA Global</h3>
					</div>
					<span className="dossier-role-badge">Community Lounge</span>
					<div className="dossier-stats-grid">
						<div className="stat-card">
							<span className="stat-val">24/7</span>
							<span className="stat-lbl">Active</span>
						</div>
						<div className="stat-card">
							<span className="stat-val">Public</span>
							<span className="stat-lbl">Access</span>
						</div>
					</div>
				</div>
				<div className="dossier-divider" />
				<div className="dossier-section">
					<span className="section-title">About</span>
					<div className="about-row">
						<span className="about-val">Connect and share with the AURORA travel community. Please follow our community guidelines to keep the lounge welcoming and respectful for everyone.</span>
					</div>
				</div>
				<div className="dossier-divider" />
				<div className="dossier-section">
					<div className="shared-files-header">
						<div className="left-group">
							<span className="material-symbols-outlined">folder_shared</span>
							<span>Shared Files & Media</span>
						</div>
						<span className="item-count">0 items</span>
					</div>
					<div className="files-list">
						<div className="file-item-row">
							<div className="file-info-left">
								<span className="material-symbols-outlined file-icon">info</span>
								<span className="file-name">Attachments not supported yet.</span>
							</div>
						</div>
					</div>
				</div>
			</aside>
		);
	}

	return (
		<aside aria-label="Member information" className="chat-dossier-panel">
			{loading ? (
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#707881' }}>
					Loading profile...
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
								<span className="material-symbols-outlined verified-icon" title="Verified Partner">verified</span>
							)}
						</div>
						<span className="dossier-role-badge">
							{member?.memberType === 'AGENT' 
								? (agent?.agentType === AgentType.HOTEL ? 'Hotel Partner' : agent?.agentType === AgentType.TOUR ? 'Tour Partner' : 'Travel Partner') 
								: 'Traveler'}
						</span>
						
						<div className="dossier-stats-grid">
							<div className="stat-card">
								<span className="stat-val">{member?.memberArticles || 0}</span>
								<span className="stat-lbl">Articles</span>
							</div>
							<div className="stat-card">
								<span className="stat-val">{member?.memberFollowers || 0}</span>
								<span className="stat-lbl">Followers</span>
							</div>
							<div className="stat-card">
								<span className="stat-val">{member?.memberFollowings || 0}</span>
								<span className="stat-lbl">Following</span>
							</div>
						</div>

						{member?._id && member._id !== currentMemberId && (
							<div className="dossier-actions-grid">
								<button type="button" className="btn-view-profile" onClick={() => void router.push(`/member?memberId=${member._id}`)}>
									View Profile
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
						<span className="section-title">About</span>
						{member?.memberAddress ? (
							<div className="about-row">
								<span className="about-lbl">Location</span>
								<span className="about-val">{member.memberAddress}</span>
							</div>
						) : null}
						<div className="about-row">
							<span className="about-lbl">Member Since</span>
							<span className="about-val">{member?.createdAt ? moment(isNaN(Number(member.createdAt)) ? member.createdAt : Number(member.createdAt)).format('MMMM YYYY') : '...'}</span>
						</div>
						{member?.memberDesc ? (
							<div className="about-row">
								<span className="about-lbl">Bio</span>
								<span className="about-val">{member.memberDesc}</span>
							</div>
						) : null}
					</div>

					{member?.memberType === 'AGENT' && agent && (
						<>
							<div className="dossier-divider" />
							<div className="dossier-section">
								<span className="section-title">Partner Details</span>
								<div className="agent-info-card">
									<div className="agent-info-row">
										<span className="ai-lbl">Company</span>
										<span className="ai-val">{agent.companyName}</span>
									</div>
									<div className="agent-info-row">
										<span className="ai-lbl">{agent.agentType === AgentType.HOTEL ? 'Active Hotels' : 'Active Tours'}</span>
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
								<span>Shared Files & Media</span>
							</div>
							<span className="item-count">0 items</span>
						</div>
						<div className="files-list">
							<div className="file-item-row">
								<div className="file-info-left">
									<span className="material-symbols-outlined file-icon">info</span>
									<span className="file-name">Attachments not supported yet.</span>
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
