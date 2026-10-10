import React from 'react';
import Link from 'next/link';
import { ApolloError } from '@apollo/client';
import { RankingAgent } from '../../types/ranking/ranking';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../config';
import { useI18n } from '../../i18n';

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
	return <Link href={`/member?memberId=${agent.memberId}`} className="marquee-partner-card"><div className="card-top"><img className="partner-avatar" src={getImageUrl(member?.memberImage, DEFAULT_USER_AVATAR)} alt={name} /><div className="partner-identity"><div className="name-wrapper"><p className="partner-name">{name}</p><span className="material-symbols-outlined verified-icon">verified</span></div><span className="partner-handle">{agent.agentType === 'HOTEL' ? t('home.partners.hotelPartner') : t('home.partners.tourPartner')}</span></div></div>{agent.companyDesc ? <p className="partner-message">{agent.companyDesc}</p> : null}<div className="partner-badge">{t('home.partners.approved')}</div></Link>;
};

const PartnerRow = ({ agents, reverse }: { agents: RankingAgent[]; reverse?: boolean }) => <div className="marquee-row-wrapper"><div className={`marquee-scroll-container ${reverse ? 'reverse' : ''}`}>{agents.map((agent) => <PartnerCard key={agent._id} agent={agent} />)}</div></div>;

const TravelPartners = ({ hotelAgents, tourAgents, loading, error }: TravelPartnersProps) => { const { t } = useI18n(); return <section className="travel-partners-section"><div className="section-container"><div className="partners-header"><span className="section-tag">{t('home.partners.eyebrow')}</span><h2 className="section-title">{t('home.partners.title')}</h2><p className="section-subtitle">{t('home.partners.description')}</p></div><div className="partners-marquee-area"><div className="marquee-fade-left" />{loading ? <p className="partners-empty-state">{t('home.partners.loading')}</p> : null}{!loading && error ? <p className="partners-empty-state">{t('home.partners.unavailable')}</p> : null}{!loading && !error ? <><PartnerRow agents={hotelAgents} /><PartnerRow agents={tourAgents} reverse /></> : null}{!loading && !error && hotelAgents.length + tourAgents.length === 0 ? <p className="partners-empty-state">{t('home.partners.empty')}</p> : null}<div className="marquee-fade-right" /></div></div></section>; };

export default TravelPartners;
