import Image from 'next/image';
import React, { ReactNode } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useI18n } from '../../i18n';

interface MobileMaintenanceGateProps {
	children: ReactNode;
}

const MobileMaintenanceGate = ({ children }: MobileMaintenanceGateProps) => {
	const device = useDeviceDetect();
	const { t } = useI18n();
	const isMobile = device === 'mobile';

	return (
		<>
			<section
				className={`mobile-maintenance-screen${isMobile ? ' is-active' : ''}`}
				aria-hidden={!isMobile}
			>
				<div className="mobile-maintenance-orb mobile-maintenance-orb-one" aria-hidden="true" />
				<div className="mobile-maintenance-orb mobile-maintenance-orb-two" aria-hidden="true" />

				<div className="mobile-maintenance-content">
					<span className="mobile-maintenance-badge">{t('mobileMaintenance.badge')}</span>
					<div className="mobile-maintenance-visual">
						<Image
							src="/img/mobile-maintenance.png"
							alt={t('mobileMaintenance.imageAlt')}
							width={1191}
							height={1321}
							sizes="(max-width: 767px) 82vw, 0px"
						/>
					</div>
					<p className="mobile-maintenance-eyebrow">AURORA</p>
					<h1>{t('mobileMaintenance.title')}</h1>
					<p className="mobile-maintenance-description">{t('mobileMaintenance.description')}</p>
					<div className="mobile-maintenance-desktop-note">
						<span className="material-symbols-outlined" aria-hidden="true">desktop_windows</span>
						<span>{t('mobileMaintenance.desktopNote')}</span>
					</div>
					<p className="mobile-maintenance-soon">{t('mobileMaintenance.soon')}</p>
				</div>
			</section>

			{!isMobile && children}
		</>
	);
};

export default MobileMaintenanceGate;
