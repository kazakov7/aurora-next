import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MY_SUPPORT_TICKETS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { SupportStatus } from '../../enums/support.enum';
import { SupportTicket } from '../../types/support/support';
import { SupportTicketSearch } from '../../types/support/support.input';
import { getImageUrl } from '../../config';
import { useI18n } from '../../i18n';

const PAGE_LIMIT = 10;
const STATUS_TABS: Array<'ALL' | SupportStatus> = [
	'ALL',
	SupportStatus.OPEN,
	SupportStatus.IN_PROGRESS,
	SupportStatus.RESOLVED,
	SupportStatus.CLOSED,
];
const STATUS_CLASS: Record<SupportStatus, string> = {
	[SupportStatus.OPEN]: 'open',
	[SupportStatus.IN_PROGRESS]: 'in-progress',
	[SupportStatus.RESOLVED]: 'resolved',
	[SupportStatus.CLOSED]: 'closed',
};

/** The same short reference the support form shows after sending a request **/
const shortReference = (ticketId: string) => ticketId.slice(-8).toUpperCase();

const MyProfileRequests: React.FC = () => {
	const { t, tEnum, formatDate } = useI18n();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [activeStatus, setActiveStatus] = useState<'ALL' | SupportStatus>('ALL');
	// A support notification opens the request it is about
	const focusedTicketId = typeof router.query.ticket === 'string' ? router.query.ticket : null;

	/** APOLLO REQUESTS **/
	const search = useMemo<SupportTicketSearch>(
		() => (activeStatus === 'ALL' ? {} : { ticketStatus: activeStatus }),
		[activeStatus],
	);
	const { data, loading, error, fetchMore } = useQuery(GET_MY_SUPPORT_TICKETS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: PAGE_LIMIT, search } },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const tickets: SupportTicket[] = data?.getMySupportTickets?.list || [];
	const total = data?.getMySupportTickets?.metaCounter?.[0]?.total ?? 0;
	const focusedLoaded = Boolean(focusedTicketId) && tickets.some((ticket) => ticket._id === focusedTicketId);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!focusedLoaded) return;
		document.getElementById(`request-${focusedTicketId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, [focusedTicketId, focusedLoaded]);

	/** HANDLERS **/
	const handleLoadMore = async () => {
		await fetchMore({
			variables: { input: { page: Math.floor(tickets.length / PAGE_LIMIT) + 1, limit: PAGE_LIMIT, search } },
			updateQuery: (previous, { fetchMoreResult }) => ({
				getMySupportTickets: {
					...fetchMoreResult.getMySupportTickets,
					list: [...previous.getMySupportTickets.list, ...fetchMoreResult.getMySupportTickets.list],
				},
			}),
		});
	};

	return (
		<div>
			{/* Top Header */}
			<div className="section-top-bar" style={{ borderBottom: '1px solid #dce2f7', paddingBottom: '18px' }}>
				<div className="title-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<h2>{t('profile.requests.myRequests')}</h2>
						{activeStatus === 'ALL' && total > 0 && (
							<span className="counter-pill">{t('profile.requests.summary', { count: total })}</span>
						)}
					</div>
					<p style={{ margin: 0, fontSize: '13px', color: '#545c72' }}>{t('profile.requests.intro')}</p>
				</div>
				<div className="bar-actions">
					<button type="button" className="primary-action-btn" onClick={() => router.push('/cs#contact-form-section')}>
						<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
							edit_square
						</span>
						<span>{t('profile.requests.newRequest')}</span>
					</button>
				</div>
			</div>

			{/* Status Sub-navigation */}
			<div className="booking-filter-bar">
				<div className="status-subnav">
					{STATUS_TABS.map((status) => (
						<button
							key={status}
							type="button"
							className={`status-tab-btn ${activeStatus === status ? 'active' : ''}`}
							onClick={() => setActiveStatus(status)}
						>
							{status === 'ALL' ? t('profile.requests.statusAll') : tEnum('supportStatus', status)}
						</button>
					))}
				</div>
			</div>

			{/* Request Cards Stack */}
			{loading && !data ? (
				<div className="profile-empty-state">
					<div className="loading-spinner" />
					<p>{t('profile.requests.loading')}</p>
				</div>
			) : error ? (
				<div className="profile-empty-state">
					<h3>{t('profile.requests.unavailable')}</h3>
					<p>{error.message}</p>
				</div>
			) : tickets.length > 0 ? (
				<div className="request-cards-stack">
					{tickets.map((ticket) => (
						<article
							key={ticket._id}
							id={`request-${ticket._id}`}
							className={`request-card-item ${ticket._id === focusedTicketId ? 'focused' : ''}`}
						>
							<div className="request-head">
								<div className="request-meta">
									<span className="type-pill">{tEnum('supportCategory', ticket.ticketCategory)}</span>
									<span className="ref-code">#{shortReference(ticket._id)}</span>
									<span className="request-date">
										{t('profile.requests.sentOn', { date: formatDate(ticket.createdAt, 'dateTime') })}
									</span>
								</div>
								<span className={`request-status ${STATUS_CLASS[ticket.ticketStatus]}`}>
									{tEnum('supportStatus', ticket.ticketStatus)}
								</span>
							</div>

							<h3 className="request-subject">{ticket.ticketSubject}</h3>
							{/* Plain text: shown as written, never run as HTML */}
							<p className="request-message">{ticket.ticketMessage}</p>
							{ticket.ticketAttachment && (
								<a
									className="request-attachment"
									href={getImageUrl(ticket.ticketAttachment)}
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="material-symbols-outlined">attach_file</span>
									{t('profile.requests.viewAttachment')}
								</a>
							)}

							{ticket.ticketReply ? (
								<div className="request-reply">
									<div className="reply-head">
										<span className="material-symbols-outlined">support_agent</span>
										<strong>{t('profile.requests.replyFrom')}</strong>
										{ticket.repliedAt && <span>{formatDate(ticket.repliedAt, 'dateTime')}</span>}
									</div>
									<p>{ticket.ticketReply}</p>
								</div>
							) : (
								<div className="request-awaiting">
									<span className="material-symbols-outlined">schedule</span>
									<span>{t('profile.requests.awaitingReply')}</span>
								</div>
							)}
						</article>
					))}
					{tickets.length < total && (
						<button
							type="button"
							className="request-action-btn"
							onClick={() => void handleLoadMore()}
							disabled={loading}
						>
							{t('profile.requests.loadMore')}
						</button>
					)}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">support_agent</span>
					</div>
					<h3>{t(activeStatus === 'ALL' ? 'profile.requests.emptyTitle' : 'profile.requests.emptyFilteredTitle')}</h3>
					<p>{t('profile.requests.emptyText')}</p>
					{activeStatus === 'ALL' && (
						<button type="button" className="request-action-btn" onClick={() => router.push('/cs#contact-form-section')}>
							{t('profile.requests.contactSupport')}
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default MyProfileRequests;
