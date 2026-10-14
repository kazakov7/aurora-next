import React, { useState } from 'react';
import { NextPage } from 'next';
import Swal from 'sweetalert2';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROPERTY_STATUS_BY_ADMIN, REMOVE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { AllPropertiesInquiry } from '../../../libs/types/property/property.input';
import { Property } from '../../../libs/types/property/property';
import { PropertyStatus } from '../../../libs/enums/property.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert, sweetConfirmAlert } from '../../../libs/sweetAlert';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../../libs/config';
import { useI18n } from '../../../libs/i18n';
import LoadingSpinner from '../../../libs/components/common/LoadingSpinner';

const AdminPropertiesPage: NextPage = () => {
	const { t, tEnum, tError, formatDate } = useI18n();
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

	const handleViewFullProperty = (id: string) => {
		window.open(`/property/detail?id=${id}`, '_blank');
	};

	const handleEditStatus = async (property: Property) => {
		const { value: newStatus } = await Swal.fire({
			title: t('admin.properties.updatePropertyStatus'),
			text: t('admin.properties.selectNewStatusFor', { propertyName: property.propertyName }),
			input: 'select',
			inputOptions: {
				ACTIVE: t('common.active'),
				PENDING: t('common.pending'),
				INACTIVE: t('common.inactive'),
				REJECTED: t('common.rejected'),
			},
			inputValue: property.propertyStatus,
			showCancelButton: true,
			confirmButtonColor: '#006194',
			cancelButtonColor: '#94a3b8',
			confirmButtonText: t('admin.properties.saveStatus'),
			cancelButtonText: t('common.cancel'),
		});

		if (newStatus && newStatus !== property.propertyStatus) {
			try {
				await updatePropertyStatusByAdmin({
					variables: { input: { _id: property._id, propertyStatus: newStatus as PropertyStatus } },
				});
				await sweetTopSmallSuccessAlert(t('admin.properties.propertyStatusUpdatedSuccessfully'), 1000);
				setSelectedProperty((prev) => (prev ? { ...prev, propertyStatus: newStatus as PropertyStatus } : null));
				refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(tError(err));
			}
		}
	};

	const handleToggleActivation = async (property: Property) => {
		const isCurrentlyActive = property.propertyStatus === PropertyStatus.ACTIVE;
		const targetStatus = isCurrentlyActive ? PropertyStatus.INACTIVE : PropertyStatus.ACTIVE;

		const result = await Swal.fire({
			title: t(isCurrentlyActive ? 'admin.properties.deactivateTitle' : 'admin.properties.activateTitle'),
			text: isCurrentlyActive
				? t('admin.properties.deactivateText', { propertyName: property.propertyName })
				: t('admin.properties.activateText', { propertyName: property.propertyName }),
			icon: isCurrentlyActive ? 'warning' : 'question',
			showCancelButton: true,
			confirmButtonColor: isCurrentlyActive ? '#dc2626' : '#006194',
			cancelButtonColor: '#94a3b8',
			confirmButtonText: t(isCurrentlyActive ? 'admin.properties.confirmDeactivate' : 'admin.properties.confirmActivate'),
			cancelButtonText: t('common.cancel'),
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			await updatePropertyStatusByAdmin({
				variables: { input: { _id: property._id, propertyStatus: targetStatus } },
			});
			await sweetTopSmallSuccessAlert(t(isCurrentlyActive ? 'admin.properties.deactivated' : 'admin.properties.activated'), 1000);
			setSelectedProperty((prev) => (prev ? { ...prev, propertyStatus: targetStatus } : null));
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err));
		}
	};

	const handleEmailAgent = (email?: string, name?: string) => {
		if (email) {
			window.location.href = `mailto:${email}?subject=${encodeURIComponent(t('admin.properties.emailSubject', { propertyName: selectedProperty?.propertyName }))}`;
		} else {
			Swal.fire({
				title: t('admin.properties.agentContact'),
				text: t('admin.properties.agentContactText', {
					name: name || t('admin.properties.thisProperty'),
					contact: selectedProperty?.memberData?.memberPhone || selectedProperty?.memberData?.memberNick || t('admin.properties.notAvailable'),
				}),
				icon: 'info',
				confirmButtonColor: '#006194',
			});
		}
	};

	const handleSave = async () => {
		try {
			if (selectedProperty) {
				await updatePropertyStatusByAdmin({
					variables: { input: { _id: selectedProperty._id, propertyStatus: formStatus } },
				});
				sweetTopSmallSuccessAlert(t('admin.properties.propertyStatusUpdated'), 800);
			}
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err));
		}
	};

	const handleDelete = async (id: string) => {
		if (await sweetConfirmAlert(t('admin.properties.deleteConfirm'))) {
			try {
				await removePropertyByAdmin({ variables: { propertyId: id } });
				sweetTopSmallSuccessAlert(t('admin.properties.propertyDeleted'), 800);
				refetch();
			} catch (err: any) {
				sweetMixinErrorAlert(tError(err));
			}
		}
	};

	const exportCSV = () => {
		if (!properties || properties.length === 0) {
			sweetMixinErrorAlert(t('common.noDataToExport'));
			return;
		}
		const headers = ['ID', t('common.name'), t('common.type'), t('admin.properties.city'), t('admin.properties.price'), t('common.status'), t('common.createdDate')];
		const rows = properties.map((p) => [
			p._id,
			`"${p.propertyName.replace(/"/g, '""')}"`,
			p.propertyType,
			`"${p.propertyCity}"`,
			p.pricePerNight,
			p.propertyStatus,
			formatDate(p.createdAt),
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
					<h1>{t('admin.properties.hotelsPropertiesManagement')}</h1>
					<p>{t('admin.properties.intro')}</p>
				</div>

			</div>

			<section className="admin-table-section">
				<div className="table-header">
					<div className="header-left">
						<h2>{t('common.directory')}</h2>
						<span className="table-badge">{t('admin.properties.properties', { total })}</span>
					</div>
					<div className="header-right">
						<div className="search-box">
							<span className="material-symbols-outlined">search</span>
							<input
								type="text"
								placeholder={t('admin.properties.searchCity')}
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>
						<div className="filter-select-group">
							<select className="filter-select" onChange={(e) => handleStatusChange(e.target.value)}>
								<option value="all">{t('common.allStatuses')}</option>
								<option value={PropertyStatus.ACTIVE}>{t('common.active')}</option>
								<option value={PropertyStatus.PENDING}>{t('common.pending')}</option>
								<option value={PropertyStatus.INACTIVE}>{t('common.inactive')}</option>
								<option value={PropertyStatus.REJECTED}>{t('common.rejected')}</option>
							</select>
							<button className="reset-filter-btn" type="button" onClick={resetFilters}>
								<span className="material-symbols-outlined">filter_alt_off</span>
								{t('common.reset')}
							</button>
						</div>
					</div>
				</div>

				<div className="table-container">
					<table className="admin-table">
						<thead>
							<tr>
								<th>{t('admin.properties.propertyName')}</th>
								<th>{t('common.location')}</th>
								<th>{t('admin.properties.pricePerNight')}</th>
								<th>{t('common.metrics')}</th>
								<th>{t('common.status')}</th>
								<th style={{ width: 120, textAlign: 'right' }}>{t('common.actions')}</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={6} className="table-loading-cell">
										<LoadingSpinner size="md" label={t('common.loading')} />
									</td>
								</tr>
							) : properties.length === 0 ? (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
										{t('admin.properties.noPropertiesFound')}
									</td>
								</tr>
							) : (
								properties.map((property) => (
									<tr key={property._id}>
										<td>
											<div
												style={{ display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer' }}
												onClick={() => openEditDrawer(property)}
											>
												<span style={{ fontWeight: 600, color: '#141b2b' }}>{property.propertyName}</span>
												<span style={{ fontSize: 13, color: '#707881' }}>{tEnum('propertyType', property.propertyType)}</span>
											</div>
										</td>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
												<span style={{ color: '#141b2b' }}>{property.propertyCity}</span>
												<span style={{ fontSize: 13, color: '#707881', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.propertyAddress}</span>
											</div>
										</td>
										<td>
											<span style={{ fontWeight: 600, color: '#006194' }}>{property.currency === 'USD' ? '$' : '$'}{property.pricePerNight.toLocaleString('en-US')}</span>
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
												{tEnum('propertyStatus', property.propertyStatus)}
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
						{t('admin.showingRecords', { startItem, endItem, total })}
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

			{/* PROPERTY DETAILS MODAL */}
			{isDrawerOpen && selectedProperty && (
				<>
					<div className="admin-property-modal-backdrop" onClick={closeDrawer} />
					<div className="admin-property-modal" role="dialog" aria-modal="true">
						{/* 1. Modal Header */}
						<div className="modal-header">
							<div className="header-left">
								<h2 className="modal-title">{t('admin.properties.propertyDetails')}</h2>
								<div
									className={`status-pill ${
										selectedProperty.propertyStatus === PropertyStatus.ACTIVE
											? 'active'
											: selectedProperty.propertyStatus === PropertyStatus.PENDING
											? 'pending'
											: selectedProperty.propertyStatus === PropertyStatus.REJECTED
											? 'rejected'
											: 'inactive'
									}`}
								>
									<span className="status-dot" />
									<span>{tEnum('propertyStatus', selectedProperty.propertyStatus)}</span>
								</div>
							</div>
							<button className="modal-close-btn" type="button" onClick={closeDrawer} aria-label={t('common.close')}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						{/* 2. Modal Body */}
						<div className="modal-body">
							{/* Hero Property Image Banner Card */}
							<div className="property-banner-card">
								<img
									src={
										selectedProperty.propertyImages?.[0]
											? getImageUrl(selectedProperty.propertyImages[0])
											: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop'
									}
									alt={selectedProperty.propertyName}
									className="banner-img"
									onError={(e: any) => {
										e.target.src =
											'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop';
									}}
								/>
								<div className="banner-overlay">
									<span className="type-tag">
										{selectedProperty.propertyType ? tEnum('propertyType', selectedProperty.propertyType) : t('common.property')}
									</span>
									<h3 className="banner-title">{selectedProperty.propertyName}</h3>
									<p className="banner-subtitle">
										{t('admin.properties.idLabel', { id: selectedProperty._id.slice(-6).toUpperCase() })} ·{' '}
										{[selectedProperty.propertyCity, selectedProperty.propertyAddress]
											.filter(Boolean)
											.join(', ') || t('common.locationNotProvided')}
									</p>
								</div>
							</div>

							{/* Agent Profile Card */}
							<div className="property-agent-card">
								<div className="agent-left">
									<div className="agent-avatar">
										{selectedProperty.memberData?.memberImage ? (
											<img
												src={getImageUrl(selectedProperty.memberData.memberImage, DEFAULT_USER_AVATAR)}
												alt={
													selectedProperty.memberData.memberFullName ||
													selectedProperty.memberData.memberNick
												}
											/>
										) : (
											(
												selectedProperty.memberData?.memberFullName ||
												selectedProperty.memberData?.memberNick ||
												'JL'
											)
												.split(' ')
												.map((w: string) => w[0])
												.slice(0, 2)
												.join('')
												.toUpperCase()
										)}
									</div>
									<div className="agent-info">
										<div className="name-row">
											<h4 className="agent-name">
												{selectedProperty.memberData?.memberFullName ||
													selectedProperty.memberData?.memberNick ||
													'Julian Laurent'}
											</h4>
											<span className="material-symbols-outlined verified-icon">verified</span>
										</div>
										<span className="agent-role">
											{t('admin.properties.verifiedAgent')} •{' '}
											{selectedProperty.memberData?.memberNick
												? `${selectedProperty.memberData.memberNick} Atelier`
												: 'Swiss Alpine Atelier'}
										</span>
									</div>
								</div>
								<button
									className="agent-mail-btn"
									type="button"
									title={t('admin.properties.contactAgent')}
									onClick={() =>
										handleEmailAgent(
											selectedProperty.memberData?.memberEmail,
											selectedProperty.memberData?.memberFullName ||
												selectedProperty.memberData?.memberNick,
										)
									}
								>
									<span className="material-symbols-outlined">mail</span>
								</button>
							</div>

							{/* 2x3 Metadata Grid */}
							<div className="property-meta-grid">
								{/* 1. Property Type */}
								<div className="meta-card">
									<span className="meta-label">{t('common.propertyType')}</span>
									<span className="meta-value">
										{selectedProperty.propertyType ? tEnum('propertyType', selectedProperty.propertyType) : t('common.hotel')}
									</span>
								</div>

								{/* 2. Location */}
								<div className="meta-card">
									<span className="meta-label">{t('common.location')}</span>
									<span className="meta-value" title={[selectedProperty.propertyCity, selectedProperty.propertyAddress].filter(Boolean).join(', ')}>
										{[selectedProperty.propertyCity, selectedProperty.propertyAddress].filter(Boolean).join(', ') || t('common.locationNotProvided')}
									</span>
								</div>

								{/* 3. Base Price */}
								<div className="meta-card">
									<span className="meta-label">{t('admin.properties.basePrice')}</span>
									<span className="meta-value price">
										{selectedProperty.currency === 'USD' ? '$' : '$'}
										{selectedProperty.pricePerNight?.toLocaleString('en-US') || '680'} {t('common.perNight')}
									</span>
								</div>

								{/* 4. Rating */}
								<div className="meta-card">
									<span className="meta-label">{t('admin.properties.rating')}</span>
									<span className="meta-value rating">
										<span className="star">★</span>
										<span>
											{t('admin.properties.reviews', { propertyRating: (selectedProperty.propertyRating || 4.98).toFixed(2), propertyReviews: selectedProperty.propertyReviews ??
												selectedProperty.propertyComments ??
												124 })}
										</span>
									</span>
								</div>

								{/* 5. Status */}
								<div className="meta-card">
									<span className="meta-label">{t('common.status')}</span>
									<span
										className={`meta-value ${
											selectedProperty.propertyStatus === PropertyStatus.ACTIVE
												? 'status-active'
												: selectedProperty.propertyStatus === PropertyStatus.PENDING
												? 'status-pending'
												: selectedProperty.propertyStatus === PropertyStatus.REJECTED
												? 'status-rejected'
												: 'status-inactive'
										}`}
									>
										{selectedProperty.propertyStatus ? tEnum('propertyStatus', selectedProperty.propertyStatus) : t('common.active')}
									</span>
								</div>

								{/* 6. Rooms / Units */}
								<div className="meta-card">
									<span className="meta-label">{t('admin.properties.roomsUnits')}</span>
									<span className="meta-value">
										{selectedProperty.bedrooms
											? t('admin.properties.suites', { bedrooms: selectedProperty.bedrooms })
											: t('admin.properties.guestsMax', { maxGuests: selectedProperty.maxGuests || 2 })}
									</span>
								</div>
							</div>

							{/* Summary */}
							<div className="property-summary-section">
								<h4 className="summary-heading">{t('admin.properties.summary')}</h4>
								<p className="summary-text">
									{selectedProperty.propertyDesc ||
										'A secluded luxury sanctuary nestled in the Swiss Alps facing the Matterhorn, offering private thermal baths, helipad access, and Michelin-starred dining.'}
								</p>
							</div>
						</div>

						{/* 3. Modal Footer */}
						<div className="modal-footer">
							<button
								type="button"
								className="btn-view-full"
								onClick={() => handleViewFullProperty(selectedProperty._id)}
							>
								<span>{t('admin.properties.viewFullProperty')}</span>
								<span className="material-symbols-outlined">arrow_outward</span>
							</button>

							<button
								type="button"
								className="btn-edit-details"
								onClick={() => handleEditStatus(selectedProperty)}
							>
								{t('admin.properties.editDetails')}
							</button>

							<div className="deactivate-action">
								<button
									type="button"
									className={`deactivate-btn ${selectedProperty.propertyStatus !== PropertyStatus.ACTIVE ? 'activate' : ''}`}
									onClick={() => handleToggleActivation(selectedProperty)}
								>
									{selectedProperty.propertyStatus === PropertyStatus.ACTIVE
										? t('admin.properties.deactivateProperty')
										: t('admin.properties.activateProperty')}
								</button>
								<p className="deactivate-note">
									{selectedProperty.propertyStatus === PropertyStatus.ACTIVE
										? t('admin.properties.deactivateNote')
										: t('admin.properties.activateNote')}
								</p>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default withAdminLayout(AdminPropertiesPage);
