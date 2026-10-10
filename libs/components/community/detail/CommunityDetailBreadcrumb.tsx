import React from 'react';
import Link from 'next/link';
import { useI18n } from '../../../i18n';

interface CommunityDetailBreadcrumbProps {
	categoryLabel: string;
	categoryKey?: string;
	title: string;
}

const CommunityDetailBreadcrumb: React.FC<CommunityDetailBreadcrumbProps> = ({
	categoryLabel,
	categoryKey,
	title,
}) => {
	const { t } = useI18n();
	return (
		<div className="community-detail-breadcrumb-wrap">
			<nav aria-label={t('common.breadcrumb')} className="breadcrumb-nav">
				<Link href="/" className="crumb-link">
					{t('navigation.home')}
				</Link>
				<span className="material-symbols-outlined separator">chevron_right</span>
				<Link href="/community" className="crumb-link">
					{t('navigation.community')}
				</Link>
				<span className="material-symbols-outlined separator">chevron_right</span>
				<Link
					href={categoryKey ? `/community?cat=${categoryKey}` : '/community'}
					className="crumb-link"
				>
					{categoryLabel}
				</Link>
				<span className="material-symbols-outlined separator">chevron_right</span>
				<span className="crumb-current" title={title}>
					{title}
				</span>
			</nav>
		</div>
	);
};

export default CommunityDetailBreadcrumb;
