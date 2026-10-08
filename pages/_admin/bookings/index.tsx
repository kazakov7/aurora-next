import React from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { sweetMixinErrorAlert } from '../../../libs/sweetAlert';

const AdminBookingsPage: NextPage = () => {
	const exportCSV = () => sweetMixinErrorAlert('Bookings API is not supported by the backend.');

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Bookings Management</h1>
					<p>Track all platform reservations and payment statuses.</p>
				</div>
				<div className="header-actions">
					<button className="export-btn" type="button" onClick={exportCSV}>
						<span className="material-symbols-outlined">download</span>
						Export CSV
					</button>
				</div>
			</div>

			<section className="admin-table-section">
				<div className="table-header">
					<div className="header-left">
						<h2>Directory</h2>
						<span className="table-badge">0 Bookings</span>
					</div>
				</div>
				<div className="table-container">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Booking ID</th>
								<th>Customer</th>
								<th>Item</th>
								<th>Dates</th>
								<th>Status</th>
								<th style={{ width: 120, textAlign: 'right' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
									<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#ba1a1a' }}>
										<span className="material-symbols-outlined" style={{ fontSize: 48 }}>api</span>
										<h3>Unsupported Feature</h3>
										<p style={{ color: '#707881' }}>The AURA backend does not currently have APIs for Bookings.</p>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
};

export default withAdminLayout(AdminBookingsPage);
