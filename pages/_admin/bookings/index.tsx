import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import Swal from 'sweetalert2';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../../apollo/admin/query';
import { CANCEL_BOOKING_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { Booking, Bookings } from '../../../libs/types/booking/booking';
import { BookingStatus } from '../../../libs/enums/booking.enum';
import { useI18n } from '../../../libs/i18n';

interface GetAllBookingsByAdminData {
	getAllBookingsByAdmin: Bookings;
}

interface BookingsInquiry {
	page: number;
	limit: number;
	search?: { bookingStatusList?: BookingStatus[] };
}

const PAGE_LIMIT = 10;

const formatAmount = (amount: number, currency: string): string => {
	const symbol = currency === 'USD' ? '$' : currency === 'USD' ? '$' : `${currency} `;
	return `${symbol}${amount.toLocaleString('en-US')}`;
};

const AdminBookingsPage: NextPage = () => {
	const { tEnum, t, tError, formatDate } = useI18n();
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
	const input = useMemo<BookingsInquiry>(() => ({
		page,
		limit: PAGE_LIMIT,
		search: status === 'ALL' ? {} : { bookingStatusList: [status] },
	}), [page, status]);

	const { data, loading, error, refetch } = useQuery<GetAllBookingsByAdminData>(GET_ALL_BOOKINGS_BY_ADMIN, {
		variables: { input },
		fetchPolicy: 'network-only',
	});
	const [cancelBookingByAdmin] = useMutation(CANCEL_BOOKING_BY_ADMIN);

	/** An admin cancels a hold or a paid booking at any time; a paid one is refunded in full **/
	const handleCancel = async (booking: Booking) => {
		const result = await Swal.fire({
			title: t('admin.bookings.cancelTitle'),
			text: t(booking.bookingStatus === BookingStatus.CONFIRMED ? 'admin.bookings.cancelPaidText' : 'admin.bookings.cancelHoldText'),
			input: 'textarea',
			inputPlaceholder: t('admin.bookings.cancelPlaceholder'),
			showCancelButton: true,
			confirmButtonColor: '#dc2626',
			cancelButtonColor: '#94a3b8',
			confirmButtonText: t('admin.bookings.cancelButton'),
			cancelButtonText: t('common.cancel'),
			reverseButtons: true,
			inputValidator: (value) => (!value || !value.trim() ? t('admin.bookings.reasonRequired') : undefined),
		});
		if (!result.isConfirmed || !result.value) return;

		try {
			await cancelBookingByAdmin({ variables: { input: { _id: booking._id, cancelReason: result.value.trim() } } });
			await sweetTopSmallSuccessAlert(t('admin.bookings.bookingCancelled'), 1200);
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err));
		}
	};

	const bookings = data?.getAllBookingsByAdmin?.list ?? [];
	const total = data?.getAllBookingsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
	const startItem = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
	const endItem = Math.min(page * PAGE_LIMIT, total);

	const getBookingItem = (booking: Booking): string => booking.propertyData?.propertyName ?? booking.tourData?.tourName ?? t('admin.bookings.unavailableListing');
	// Stays and tours both carry their dates in bookingStartDate/bookingEndDate
	const getBookingDate = (booking: Booking): string =>
		`${formatDate(booking.bookingStartDate) || '—'} – ${formatDate(booking.bookingEndDate) || '—'}`;

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>{t('admin.bookings.bookingsManagement')}</h1>
					<p>{t('admin.bookings.intro')}</p>
				</div>
			</div>

			<section className="admin-table-section">
				<div className="table-header">
					<div className="header-left"><h2>{t('common.directory')}</h2><span className="table-badge">{t('admin.bookings.bookings', { total })}</span></div>
					<div className="header-right">
						<div className="filter-select-group">
							<select className="filter-select" value={status} onChange={(event) => { setStatus(event.target.value as BookingStatus | 'ALL'); setPage(1); }}>
								<option value="ALL">{t('admin.bookings.allStatuses')}</option>
								{Object.values(BookingStatus).map((value) => <option key={value} value={value}>{tEnum('bookingStatus', value)}</option>)}
							</select>
						</div>
					</div>
				</div>

				<div className="table-container">
					<table className="admin-table">
						<thead><tr><th>{t('common.bookingId')}</th><th>{t('common.customer')}</th><th>{t('common.category')}</th><th>{t('admin.bookings.listing')}</th><th>{t('admin.bookings.dates')}</th><th>{t('common.total')}</th><th>{t('common.status')}</th><th /></tr></thead>
						<tbody>
							{loading ? (
								<tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px' }}>{t('admin.bookings.loadingBookings')}</td></tr>
							) : error ? (
								<tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#ba1a1a' }}>{error.message}</td></tr>
							) : bookings.length === 0 ? (
								<tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px' }}>{t('admin.bookings.noBookingsFound')}</td></tr>
							) : bookings.map((booking) => (
								<tr key={booking._id}>
									<td><span style={{ fontFamily: 'monospace', color: '#006194', fontWeight: 600 }}>#{booking._id.slice(-6).toUpperCase()}</span></td>
									<td>{booking.memberData?.memberNick ?? booking.memberData?.memberFullName ?? t('admin.bookings.unknownMember')}</td>
									<td><span className={`badge-pill ${booking.bookingCategory === 'PROPERTY' ? 'sky' : 'indigo'}`}>{tEnum('bookingCategory', booking.bookingCategory)}</span></td>
									<td>{getBookingItem(booking)}</td>
									<td>{getBookingDate(booking)}</td>
									<td><strong>{formatAmount(booking.bookingTotalPrice, booking.bookingCurrency)}</strong></td>
									<td><span className={`status-pill ${booking.bookingStatus === BookingStatus.CONFIRMED || booking.bookingStatus === BookingStatus.COMPLETED ? 'green' : booking.bookingStatus === BookingStatus.PENDING ? 'amber' : 'red'}`}><span className="dot" /> {tEnum('bookingStatus', booking.bookingStatus)}</span></td>
									<td>
										{(booking.bookingStatus === BookingStatus.PENDING || booking.bookingStatus === BookingStatus.CONFIRMED) && (
											<button type="button" className="page-btn" style={{ color: '#ba1a1a' }} onClick={() => void handleCancel(booking)}>
												{t('admin.bookings.cancelButton')}
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="table-footer">
					<span>{t('admin.bookings.showingRange', { startItem, endItem, total })}</span>
					<div className="pagination">
						<button className="page-btn square" type="button" disabled={page === 1 || loading} onClick={() => setPage((current) => current - 1)}><span className="material-symbols-outlined">chevron_left</span></button>
						<span className="page-btn active">{page}</span>
						<button className="page-btn square" type="button" disabled={page === totalPages || loading} onClick={() => setPage((current) => current + 1)}><span className="material-symbols-outlined">chevron_right</span></button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default withAdminLayout(AdminBookingsPage);
