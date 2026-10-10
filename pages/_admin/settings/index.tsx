import React from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { sweetMixinErrorAlert } from '../../../libs/sweetAlert';
import { useI18n } from '../../../libs/i18n';

const AdminSettingsPage: NextPage = () => {
	const { t } = useI18n();
	const saveSettings = () => sweetMixinErrorAlert(t('admin.settings.apiUnsupported'));

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>{t('admin.settings.platformSettings')}</h1>
					<p>{t('admin.settings.intro')}</p>
				</div>
				<div className="header-actions">
					<button className="export-btn" type="button" onClick={saveSettings} style={{ backgroundColor: '#006194', color: '#fff', border: 'none' }}>
						<span className="material-symbols-outlined" style={{ color: '#fff' }}>save</span>
						{t('common.saveChanges')}
					</button>
				</div>
			</div>

			<section className="admin-table-section" style={{ padding: '40px', textAlign: 'center' }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#ba1a1a', padding: '40px' }}>
					<span className="material-symbols-outlined" style={{ fontSize: 48 }}>api</span>
					<h3>{t('admin.unsupportedFeature')}</h3>
					<p style={{ color: '#707881' }}>{t('admin.settings.noApiText')}</p>
				</div>
			</section>
		</div>
	);
};

export default withAdminLayout(AdminSettingsPage);
