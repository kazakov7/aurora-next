import React from 'react';
import Link from 'next/link';

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
	return (
		<div className="community-detail-breadcrumb-wrap">
			<nav aria-label="Breadcrumb" className="breadcrumb-nav">
				<Link href="/" className="crumb-link">
					Home
				</Link>
				<span className="material-symbols-outlined separator">chevron_right</span>
				<Link href="/community" className="crumb-link">
					Community
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
