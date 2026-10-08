import React, { useState } from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROPERTY_STATUS_BY_ADMIN, REMOVE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AllPropertiesInquiry } from '../../../libs/types/property/property.input';
import { Property } from '../../../libs/types/property/property';
import { PropertyStatus } from '../../../libs/enums/property.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert, sweetConfirmAlert } from '../../../libs/sweetAlert';

const AdminPropertiesPage: NextPage = () => {
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	
	const [formStatus, setFormStatus] = useState<PropertyStatus>(PropertyStatus.ACTIVE);

	const [searchFilter, setSearchFilter] = useState<AllPropertiesInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setProperties(data?.getAllPropertiesByAdmin?.list || []);
			setTotal(data?.getAllPropertiesByAdmin?.metaCounter?.[0]?.total || 0);
		},
	});

	const [updatePropertyStatusByAdmin] = useMutation(UPDATE_PROPERTY_STATUS_BY_ADMIN);
	const [removePropertyByAdmin] = useMutation(REMOVE_PROPERTY_BY_ADMIN);

	/** HANDLERS **/
	const handleSearchChange = (text: string) => {
		setSearchFilter((prev) => {
			const newSearch = { ...prev.search };
			if (text) newSearch.propertyCityList = [text];
			else delete newSearch.propertyCityList;
			return { ...prev, search: newSearch, page: 1 };
		});
	};

	const handleStatusChange = (val: string) => {
		setSearchFilter((prev) => ({
			...prev,
			search: { ...prev.search, propertyStatus: val === 'all' ? undefined : (val as PropertyStatus) },
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

	const openEditDrawer = (property: Property) => {
		setSelectedProperty(property);
		setFormStatus(property.propertyStatus);
		setIsDrawerOpen(true);
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedProperty(null);
	};

	const handleSave = async () => {
		try {
			if (selectedProperty) {
				await updatePropertyStatusByAdmin({
					variables: { input: { _id: selectedProperty._id, propertyStatus: formStatus } },
				});
				sweetTopSmallSuccessAlert('Property status updated!', 800);
			}
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handleDelete = async (id: string) => {
		if (await sweetConfirmAlert('Are you sure you want to delete this property?')) {
			try {
				await removePropertyByAdmin({ variables: { propertyId: id } });
				sweetTopSmallSuccessAlert('Property deleted!', 800);
				refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(err.message);
			}
		}
	};

	const exportCSV = () => {
		if (!properties || properties.length === 0) {
			sweetMixinErrorAlert('No data to export');
			return;
		}
		const headers = ['ID', 'Name', 'Type', 'City', 'Price', 'Status', 'Created Date'];
		const rows = properties.map((p) => [
			p._id,
			`"${p.propertyName.replace(/"/g, '""')}"`,
			p.propertyType,
			`"${p.propertyCity}"`,
			p.pricePerNight,
			p.propertyStatus,
			new Date(p.createdAt).toLocaleDateString(),
		]);

		const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `aura_properties_${Date.now()}.csv`);
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
					<h1>Hotels & Properties Management</h1>
					<p>Review, approve, and moderate property listings.</p>
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
						<span className="table-badge">{total} Properties</span>
					</div>
					<div className="header-right">
						<div className="search-box">
							<span className="material-symbols-outlined">search</span>
							<input
								type="text"
								placeholder="Search city..."
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>
						<div className="filter-select-group">
							<select className="filter-select" onChange={(e) => handleStatusChange(e.target.value)}>
								<option value="all">All Statuses</option>
								<option value={PropertyStatus.ACTIVE}>Active</option>
								<option value={PropertyStatus.PENDING}>Pending</option>
								<option value={PropertyStatus.INACTIVE}>Inactive</option>
								<option value={PropertyStatus.REJECTED}>Rejected</option>
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
								<th>Property Name</th>
								<th>Location</th>
								<th>Price (Per Night)</th>
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
							) : properties.length === 0 ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										No properties found.
									</td>
								</tr>
							) : (
								properties.map((property) => (
									<tr key={property._id}>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												<span style={{ fontWeight: 600, color: '#141b2b' }}>{property.propertyName}</span>
												<span style={{ fontSize: 13, color: '#707881' }}>{property.propertyType}</span>
											</div>
										</td>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												<span style={{ color: '#141b2b' }}>{property.propertyCity}</span>
												<span style={{ fontSize: 13, color: '#707881', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.propertyAddress}</span>
											</div>
										</td>
										<td>
											<span style={{ fontWeight: 600, color: '#006194' }}>{property.currency === 'KRW' ? '₩' : '$'}{property.pricePerNight.toLocaleString()}</span>
										</td>
										<td>
											<div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#707881' }}>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span>
													{property.propertyLikes}
												</span>
												<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
													<span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
													{property.propertyViews}
												</span>
											</div>
										</td>
										<td>
											<span
												className={`status-pill ${
													property.propertyStatus === PropertyStatus.ACTIVE ? 'emerald' : property.propertyStatus === PropertyStatus.PENDING ? 'amber' : 'cancelled'
												}`}
											>
												<span className="dot"></span>
												{property.propertyStatus}
											</span>
										</td>
										<td style={{ textAlign: 'right' }}>
											<div style={{ display: 'inline-flex', gap: 6 }}>
												<button
													type="button"
													onClick={() => openEditDrawer(property)}
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
													onClick={() => handleDelete(property._id)}
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

			{isDrawerOpen && selectedProperty && (
				<>
					<div className="admin-drawer-backdrop" onClick={closeDrawer} />
					<aside className="admin-drawer">
						<div className="drawer-header">
							<div className="header-title">
								<span className="material-symbols-outlined">edit_document</span>
								<span>Moderate Property</span>
							</div>
							<button className="close-btn" type="button" onClick={closeDrawer}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="drawer-body">
							<div className="admin-form-group">
								<label>Property Name</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none' }}>
									{selectedProperty.propertyName}
								</div>
							</div>
							
							<div className="admin-form-group">
								<label>Description</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none', height: 100, overflowY: 'auto' }}>
									{selectedProperty.propertyDesc}
								</div>
							</div>

							<div className="admin-form-group">
								<label>
									Status <span className="required">*</span>
								</label>
								<select
									className="admin-form-control select"
									value={formStatus}
									onChange={(e) => setFormStatus(e.target.value as PropertyStatus)}
								>
									<option value={PropertyStatus.ACTIVE}>Active</option>
									<option value={PropertyStatus.PENDING}>Pending</option>
									<option value={PropertyStatus.INACTIVE}>Inactive</option>
									<option value={PropertyStatus.REJECTED}>Rejected</option>
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

export default withAdminLayout(AdminPropertiesPage);
