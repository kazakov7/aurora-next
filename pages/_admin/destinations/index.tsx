import React, { useState } from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { UPDATE_DESTINATION_BY_ADMIN, REMOVE_DESTINATION_BY_ADMIN } from '../../../apollo/admin/mutation';
import { DestinationsInquiry } from '../../../libs/types/destination/destination.input';
import { Destination } from '../../../libs/types/destination/destination';
import { DestinationStatus } from '../../../libs/enums/destination.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert, sweetConfirmAlert } from '../../../libs/sweetAlert';

const AdminDestinationsPage: NextPage = () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	
	const [formStatus, setFormStatus] = useState<DestinationStatus>(DestinationStatus.ACTIVE);

	const [searchFilter, setSearchFilter] = useState<DestinationsInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setDestinations(data?.getDestinations?.list || []);
			setTotal(data?.getDestinations?.metaCounter?.[0]?.total || 0);
		},
	});

	const [updateDestinationByAdmin] = useMutation(UPDATE_DESTINATION_BY_ADMIN);
	const [removeDestinationByAdmin] = useMutation(REMOVE_DESTINATION_BY_ADMIN);

	/** HANDLERS **/
	const handleSearchChange = (text: string) => {
		setSearchFilter((prev) => ({
			...prev,
			search: { ...prev.search, text: text === '' ? undefined : text },
			page: 1,
		}));
	};

	const handleStatusChange = (val: string) => {
		setSearchFilter((prev) => ({
			...prev,
			search: { ...prev.search, destinationStatus: val === 'all' ? undefined : (val as DestinationStatus) },
			page: 1,
		}));
	};

	const resetFilters = () => {
		setSearchFilter({
			page: 1,
			limit: 10,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		});
		refetch();
	};

	const openEditDrawer = (destination: Destination) => {
		setSelectedDestination(destination);
		setFormStatus(destination.destinationStatus);
		setIsDrawerOpen(true);
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedDestination(null);
	};

	const handleSave = async () => {
		try {
			if (selectedDestination) {
				await updateDestinationByAdmin({
					variables: { input: { _id: selectedDestination._id, destinationStatus: formStatus } },
				});
				sweetTopSmallSuccessAlert('Destination status updated!', 800);
			}
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handleDelete = async (id: string) => {
		if (await sweetConfirmAlert('Are you sure you want to delete this destination?')) {
			try {
				await removeDestinationByAdmin({ variables: { destinationId: id } });
				sweetTopSmallSuccessAlert('Destination deleted!', 800);
				refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(err.message);
			}
		}
	};

	const exportCSV = () => {
		if (!destinations || destinations.length === 0) {
			sweetMixinErrorAlert('No data to export');
			return;
		}
		const headers = ['ID', 'Name', 'Country', 'Properties', 'Tours', 'Status', 'Created Date'];
		const rows = destinations.map((d) => [
			d._id,
			`"${d.destinationName.replace(/"/g, '""')}"`,
			`"${d.destinationCountry}"`,
			d.destinationProperties,
			d.destinationTours,
			d.destinationStatus,
			new Date(d.createdAt).toLocaleDateString(),
		]);

		const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `aura_destinations_${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const totalPages = Math.ceil(total / searchFilter.limit) || 1;
	const startItem = total === 0 ? 0 : (searchFilter.page - 1) * searchFilter.limit + 1;
	const endItem = Math.min(searchFilter.page * searchFilter.limit, total);

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Destinations Management</h1>
					<p>Manage travel hubs, cities, and associated analytics.</p>
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
						<span className="table-badge">{total} Destinations</span>
					</div>
					<div className="header-right">
						<div className="search-box">
							<span className="material-symbols-outlined">search</span>
							<input
								type="text"
								placeholder="Search name, country..."
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>
						<div className="filter-select-group">
							<select className="filter-select" onChange={(e) => handleStatusChange(e.target.value)}>
								<option value="all">All Statuses</option>
								<option value={DestinationStatus.ACTIVE}>Active</option>
								<option value={DestinationStatus.INACTIVE}>Inactive</option>
							</select>
							<button className="reset-filter-btn" type="button" onClick={resetFilters}>
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
								<th>Destination Name</th>
								<th>Country</th>
								<th>Items Connected</th>
								<th>Metrics</th>
								<th>Status</th>
								<th style={{ width: 120, textAlign: 'right' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										Loading...
									</td>
								</tr>
							) : destinations.length === 0 ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										No destinations found.
									</td>
								</tr>
							) : (
								destinations.map((destination) => (
									<tr key={destination._id}>
										<td>
											<span style={{ fontWeight: 600, color: '#141b2b' }}>{destination.destinationName}</span>
										</td>
										<td>
											<span style={{ color: '#141b2b' }}>{destination.destinationCountry}</span>
										</td>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												<span style={{ fontSize: 13, color: '#707881' }}>Hotels: {destination.destinationProperties}</span>
												<span style={{ fontSize: 13, color: '#707881' }}>Tours: {destination.destinationTours}</span>
											</div>
										</td>
										<td>
											<div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#707881' }}>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span>
													{destination.destinationLikes}
												</span>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
													{destination.destinationViews}
												</span>
											</div>
										</td>
										<td>
											<span
												className={`status-pill ${
													destination.destinationStatus === DestinationStatus.ACTIVE ? 'emerald' : 'cancelled'
												}`}
											>
												<span className="dot"></span>
												{destination.destinationStatus}
											</span>
										</td>
										<td style={{ textAlign: 'right' }}>
											<div style={{ display: 'inline-flex', gap: 6 }}>
												<button
													type="button"
													onClick={() => openEditDrawer(destination)}
													style={{
														padding: '6px',
														borderRadius: '6px',
														border: 'none',
														background: '#f1f3ff',
														color: '#006194',
														cursor: 'pointer',
													}}
												>
													<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
														edit
													</span>
												</button>
												<button
													type="button"
													onClick={() => handleDelete(destination._id)}
													style={{
														padding: '6px',
														borderRadius: '6px',
														border: 'none',
														background: '#ffdad6',
														color: '#ba1a1a',
														cursor: 'pointer',
													}}
												>
													<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
														delete
													</span>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="table-footer">
					<span>
						Showing {startItem}–{endItem} of {total} records
					</span>
					<div className="pagination">
						<button
							className="page-btn square"
							disabled={searchFilter.page === 1}
							type="button"
							onClick={() => setSearchFilter((prev) => ({ ...prev, page: prev.page - 1 }))}
						>
							<span className="material-symbols-outlined">chevron_left</span>
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								className={`page-btn ${p === searchFilter.page ? 'active' : ''}`}
								type="button"
								onClick={() => setSearchFilter((prev) => ({ ...prev, page: p }))}
							>
								{p}
							</button>
						))}
						<button
							className="page-btn square"
							disabled={searchFilter.page >= totalPages}
							type="button"
							onClick={() => setSearchFilter((prev) => ({ ...prev, page: prev.page + 1 }))}
						>
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			</section>

			{isDrawerOpen && selectedDestination && (
				<>
					<div className="admin-drawer-backdrop" onClick={closeDrawer} />
					<aside className="admin-drawer">
						<div className="drawer-header">
							<div className="header-title">
								<span className="material-symbols-outlined">edit_document</span>
								<span>Moderate Destination</span>
							</div>
							<button className="close-btn" type="button" onClick={closeDrawer}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="drawer-body">
							<div className="admin-form-group">
								<label>Destination Name</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none' }}>
									{selectedDestination.destinationName}
								</div>
							</div>
							
							<div className="admin-form-group">
								<label>Description</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none', height: 100, overflowY: 'auto' }}>
									{selectedDestination.destinationDesc}
								</div>
							</div>

							<div className="admin-form-group">
								<label>
									Status <span className="required">*</span>
								</label>
								<select
									className="admin-form-control select"
									value={formStatus}
									onChange={(e) => setFormStatus(e.target.value as DestinationStatus)}
								>
									<option value={DestinationStatus.ACTIVE}>Active</option>
									<option value={DestinationStatus.INACTIVE}>Inactive</option>
								</select>
							</div>
						</div>

						<div className="drawer-footer">
							<button className="btn secondary" type="button" onClick={closeDrawer}>
								Cancel
							</button>
							<button className="btn primary" type="button" onClick={handleSave}>
								Save Changes
							</button>
						</div>
					</aside>
				</>
			)}
		</div>
	);
};

export default withAdminLayout(AdminDestinationsPage);
