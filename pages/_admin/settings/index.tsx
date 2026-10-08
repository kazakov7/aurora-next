import React from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { sweetMixinErrorAlert } from '../../../libs/sweetAlert';

const AdminSettingsPage: NextPage = () => {
	const saveSettings = () => sweetMixinErrorAlert('Settings API is not supported by the backend.');

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Platform Settings</h1>
					<p>Configure global platform variables, tax rates, and API keys.</p>
				</div>
				<div className="header-actions">
					<button className="export-btn" type="button" onClick={saveSettings} style={{ backgroundColor: '#006194', color: '#fff', border: 'none' }}>
						<span className="material-symbols-outlined" style={{ color: '#fff' }}>save</span>
						Save Changes
					</button>
				</div>
			</div>

			<section className="admin-table-section" style={{ padding: '40px', textAlign: 'center' }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#ba1a1a', padding: '40px' }}>
					<span className="material-symbols-outlined" style={{ fontSize: 48 }}>api</span>
					<h3>Unsupported Feature</h3>
					<p style={{ color: '#707881' }}>The AURA backend does not currently have APIs for Global Settings.</p>
				</div>
			</section>
		</div>
	);
};

export default withAdminLayout(AdminSettingsPage);
