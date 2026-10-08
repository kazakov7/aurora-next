import React, { useState } from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { sweetMixinErrorAlert } from '../../../libs/sweetAlert';

const AdminSupportPage: NextPage = () => {
	// BACKEND LIMITATION: There are no GraphQL schemas for Support Tickets.
	// We render the layout to match the Stitch design but data is disabled.
	const tickets: any[] = [];
	const total = 0;
	const startItem = 0;
	const endItem = 0;
	const totalPages = 1;

	const exportCSV = () => {
		sweetMixinErrorAlert('Support Tickets API is not supported by the backend.');
	};

	const unsupportedAction = () => {
		sweetMixinErrorAlert('This action is not supported by the backend API.');
	};

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Support Tickets Management</h1>
					<p>Handle user inquiries, bug reports, and assistance requests.</p>
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
						<span className="table-badge">{total} Tickets</span>
					</div>
					<div className="header-right">
						<div className="search-box">
							<span className="material-symbols-outlined">search</span>
							<input
								type="text"
								placeholder="Search tickets..."
								disabled
							/>
						</div>
						<div className="filter-select-group">
							<select className="filter-select" disabled>
								<option value="all">All Priorities</option>
							</select>
							<select className="filter-select" disabled>
								<option value="all">All Statuses</option>
							</select>
							<button className="reset-filter-btn" type="button" onClick={unsupportedAction}>
								<span className="material-symbols-outlined">filter_alt_off</span>
								Reset
							</button>
						</div>
					</div>
				</div>

				<div className="table-container">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Ticket Subject</th>
								<th>Submitter</th>
								<th>Priority</th>
								<th>Status</th>
								<th>Created Date</th>
								<th style={{ width: 120, textAlign: 'right' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
									<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#ba1a1a' }}>
										<span className="material-symbols-outlined" style={{ fontSize: 48 }}>api</span>
										<h3>Unsupported Feature</h3>
										<p style={{ color: '#707881' }}>The AURA backend does not currently have APIs for Support Tickets.</p>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div className="table-footer">
					<span>
						Showing {startItem}–{endItem} of {total} records
					</span>
					<div className="pagination">
						<button className="page-btn square" disabled type="button">
							<span className="material-symbols-outlined">chevron_left</span>
						</button>
						<button className="page-btn square" disabled type="button">
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default withAdminLayout(AdminSupportPage);
