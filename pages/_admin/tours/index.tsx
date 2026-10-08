import React, { useState } from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_TOURS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_TOUR_STATUS_BY_ADMIN, REMOVE_TOUR_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AllToursInquiry } from '../../../libs/types/tour/tour.input';
import { Tour } from '../../../libs/types/tour/tour';
import { TourStatus } from '../../../libs/enums/tour.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert, sweetConfirmAlert } from '../../../libs/sweetAlert';
import moment from 'moment';

const AdminToursPage: NextPage = () => {
	const [tours, setTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	
	const [formStatus, setFormStatus] = useState<TourStatus>(TourStatus.ACTIVE);

	const [searchFilter, setSearchFilter] = useState<AllToursInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_ALL_TOURS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setTours(data?.getAllToursByAdmin?.list || []);
			setTotal(data?.getAllToursByAdmin?.metaCounter?.[0]?.total || 0);
		},
	});

	const [updateTourStatusByAdmin] = useMutation(UPDATE_TOUR_STATUS_BY_ADMIN);
	const [removeTourByAdmin] = useMutation(REMOVE_TOUR_BY_ADMIN);

	/** HANDLERS **/
	const handleSearchChange = (text: string) => {
		setSearchFilter((prev) => {
			const newSearch = { ...prev.search };
			if (text) newSearch.tourDepartureCity = text;
			else delete newSearch.tourDepartureCity;
			return { ...prev, search: newSearch, page: 1 };
		});
	};

	const handleStatusChange = (val: string) => {
		setSearchFilter((prev) => ({
			...prev,
			search: { ...prev.search, tourStatus: val === 'all' ? undefined : (val as TourStatus) },
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

	const openEditDrawer = (tour: Tour) => {
		setSelectedTour(tour);
		setFormStatus(tour.tourStatus);
		setIsDrawerOpen(true);
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedTour(null);
	};

	const handleSave = async () => {
		try {
			if (selectedTour) {
				await updateTourStatusByAdmin({
					variables: { input: { _id: selectedTour._id, tourStatus: formStatus } },
				});
				sweetTopSmallSuccessAlert('Tour status updated!', 800);
			}
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handleDelete = async (id: string) => {
		if (await sweetConfirmAlert('Are you sure you want to delete this tour?')) {
			try {
				await removeTourByAdmin({ variables: { tourId: id } });
				sweetTopSmallSuccessAlert('Tour deleted!', 800);
				refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(err.message);
			}
		}
	};

	const exportCSV = () => {
		if (!tours || tours.length === 0) {
			sweetMixinErrorAlert('No data to export');
			return;
		}
		const headers = ['ID', 'Name', 'Price', 'Capacity', 'Start Date', 'End Date', 'Status', 'Created Date'];
		const rows = tours.map((t) => [
			t._id,
			`"${t.tourName.replace(/"/g, '""')}"`,
			t.tourPrice,
			t.tourCapacity,
			moment(t.tourStartDate).format('YYYY-MM-DD'),
			moment(t.tourEndDate).format('YYYY-MM-DD'),
			t.tourStatus,
			moment(t.createdAt).format('YYYY-MM-DD'),
		]);

		const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `aura_tours_${Date.now()}.csv`);
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
					<h1>Tours Management</h1>
					<p>Review, approve, and moderate guided tours and packages.</p>
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
						<span className="table-badge">{total} Tours</span>
					</div>
					<div className="header-right">
						<div className="search-box">
							<span className="material-symbols-outlined">search</span>
							<input
								type="text"
								placeholder="Search departure city..."
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>
						<div className="filter-select-group">
							<select className="filter-select" onChange={(e) => handleStatusChange(e.target.value)}>
								<option value="all">All Statuses</option>
								<option value={TourStatus.ACTIVE}>Active</option>
								<option value={TourStatus.PENDING}>Pending</option>
								<option value={TourStatus.INACTIVE}>Inactive</option>
								<option value={TourStatus.REJECTED}>Rejected</option>
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
								<th>Tour Name</th>
								<th>Schedule</th>
								<th>Price</th>
								<th>Capacity</th>
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
							) : tours.length === 0 ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										No tours found.
									</td>
								</tr>
							) : (
								tours.map((tour) => (
									<tr key={tour._id}>
										<td>
											<span style={{ fontWeight: 600, color: '#141b2b' }}>{tour.tourName}</span>
										</td>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												<span style={{ color: '#141b2b' }}>{moment(tour.tourStartDate).format('MMM DD')} - {moment(tour.tourEndDate).format('MMM DD, YYYY')}</span>
											</div>
										</td>
										<td>
											<span style={{ fontWeight: 600, color: '#006194' }}>{tour.tourCurrency === 'KRW' ? '₩' : '$'}{tour.tourPrice.toLocaleString()}</span>
										</td>
										<td>
											<span style={{ fontSize: 13, color: '#707881' }}>{tour.tourReservedSeats} / {tour.tourCapacity}</span>
										</td>
										<td>
											<span
												className={`status-pill ${
													tour.tourStatus === TourStatus.ACTIVE ? 'emerald' : tour.tourStatus === TourStatus.PENDING ? 'amber' : 'cancelled'
												}`}
											>
												<span className="dot"></span>
												{tour.tourStatus}
											</span>
										</td>
										<td style={{ textAlign: 'right' }}>
											<div style={{ display: 'inline-flex', gap: 6 }}>
												<button
													type="button"
													onClick={() => openEditDrawer(tour)}
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
													onClick={() => handleDelete(tour._id)}
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

			{isDrawerOpen && selectedTour && (
				<>
					<div className="admin-drawer-backdrop" onClick={closeDrawer} />
					<aside className="admin-drawer">
						<div className="drawer-header">
							<div className="header-title">
								<span className="material-symbols-outlined">edit_document</span>
								<span>Moderate Tour</span>
							</div>
							<button className="close-btn" type="button" onClick={closeDrawer}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="drawer-body">
							<div className="admin-form-group">
								<label>Tour Name</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none' }}>
									{selectedTour.tourName}
								</div>
							</div>
							
							<div className="admin-form-group">
								<label>Description</label>
								<div className="admin-form-control" style={{ background: '#f1f3ff', border: 'none', height: 100, overflowY: 'auto' }}>
									{selectedTour.tourDesc}
								</div>
							</div>

							<div className="admin-form-group">
								<label>
									Status <span className="required">*</span>
								</label>
								<select
									className="admin-form-control select"
									value={formStatus}
									onChange={(e) => setFormStatus(e.target.value as TourStatus)}
								>
									<option value={TourStatus.ACTIVE}>Active</option>
									<option value={TourStatus.PENDING}>Pending</option>
									<option value={TourStatus.INACTIVE}>Inactive</option>
									<option value={TourStatus.REJECTED}>Rejected</option>
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

export default withAdminLayout(AdminToursPage);
