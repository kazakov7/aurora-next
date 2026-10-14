import React from 'react';
import Link from 'next/link';
import { ApolloError } from '@apollo/client';
import { RankingAgent } from '../../types/ranking/ranking';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { useI18n } from '../../i18n';
import { RevealOnScroll } from '../motion/RevealOnScroll';
import { HoverLift } from '../motion/HoverLift';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface TravelPartnersProps {
	hotelAgents: RankingAgent[];
	tourAgents: RankingAgent[];
	loading?: boolean;
	error?: ApolloError;
}

const PartnerCard = ({ agent }: { agent: RankingAgent }) => {
	const { t } = useI18n();
	const member = agent.memberData;
	const name = agent.companyName || member?.memberFullName || member?.memberNick;
	return (
		<HoverLift y={-3} scale={1.015} style={{ flexShrink: 0 }}>
			<Link href={`/member?memberId=${agent.memberId}`} className="marquee-partner-card">
				<div className="card-top">
					<img className="partner-avatar" src={getImageUrl(member?.memberImage, DEFAULT_USER_AVATAR)} alt={name} />
					<div className="partner-identity">
						<div className="name-wrapper">
							<p className="partner-name">{name}</p>
							<span className="material-symbols-outlined verified-icon">verified</span>
						</div>
						<span className="partner-handle">
							{agent.agentType === 'HOTEL' ? t('home.partners.hotelPartner') : t('home.partners.tourPartner')}
						</span>
					</div>
				</div>
				{agent.companyDesc ? <p className="partner-message">{agent.companyDesc}</p> : null}
				<div className="partner-badge">{t('home.partners.approved')}</div>
			</Link>
		</HoverLift>
	);
};

const PartnerRow = ({ agents, reverse }: { agents: RankingAgent[]; reverse?: boolean }) => {
	if (!agents.length) return null;
	const repeatedAgents = agents.length < 6 ? [...agents, ...agents, ...agents, ...agents] : [...agents, ...agents];
	return (
		<div className="marquee-row-wrapper">
			<div className={`marquee-scroll-container ${reverse ? 'reverse' : ''}`}>
				{repeatedAgents.map((agent, index) => (
					<PartnerCard key={`${agent._id}-${index}`} agent={agent} />
				))}
			</div>
		</div>
	);
};

const TravelPartners = ({ hotelAgents, tourAgents, loading, error }: TravelPartnersProps) => {
	const { t } = useI18n();
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const topPartners = [...hotelAgents.slice(0, 2), ...tourAgents.slice(0, 2)];

	return (
		<section className="travel-partners-section">
			<div className="section-container">
				<RevealOnScroll distance={16}>
					<div className="partners-header">
						<span className="section-tag">{t('home.partners.eyebrow')}</span>
						<h2 className="section-title">{t('home.partners.title')}</h2>
						<p className="section-subtitle">{t('home.partners.description')}</p>
					</div>
				</RevealOnScroll>

				{loading ? <p className="partners-empty-state">{t('home.partners.loading')}</p> : null}
				{!loading && error ? <p className="partners-empty-state">{t('home.partners.unavailable')}</p> : null}

				{!loading && !error && isMobile ? (
					<div className="partners-mobile-list">
						{topPartners.map((agent) => {
							const member = agent.memberData;
							const name = agent.companyName || member?.memberFullName || member?.memberNick;
							return (
								<Link
									key={agent._id}
									href={`/member?memberId=${agent.memberId}`}
									className="partner-mobile-card"
								>
									<div className="partner-mobile-left">
										<img
											className="partner-avatar"
											src={getImageUrl(member?.memberImage, DEFAULT_USER_AVATAR)}
											alt={name}
										/>
										<div className="partner-identity">
											<div className="name-wrapper">
												<span className="partner-name">{name}</span>
												<span className="verified-check">✓</span>
											</div>
											<span className="partner-handle">
												{agent.agentType === 'HOTEL'
													? t('home.partners.hotelPartner')
													: t('home.partners.tourPartner')}
											</span>
										</div>
									</div>
									<span className="approved-pill">
										{t('home.partners.approvedShort') || 'Approved'}
									</span>
								</Link>
							);
						})}
					</div>
				) : null}

				{!loading && !error && !isMobile ? (
					<div className="partners-marquee-area">
						<div className="marquee-fade-left" />
						<PartnerRow agents={hotelAgents} />
						<PartnerRow agents={tourAgents} reverse />
						{hotelAgents.length + tourAgents.length === 0 ? (
							<p className="partners-empty-state">{t('home.partners.empty')}</p>
						) : null}
						<div className="marquee-fade-right" />
					</div>
				) : null}
			</div>
		</section>
	);
};

export default TravelPartners;
