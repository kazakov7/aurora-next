import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../../apollo/admin/query';
import { Booking, Bookings } from '../../../libs/types/booking/booking';
import { BookingStatus } from '../../../libs/enums/booking.enum';

interface GetAllBookingsByAdminData {
	getAllBookingsByAdmin: Bookings;
}

interface BookingsInquiry {
	page: number;
	limit: number;
	search?: { bookingStatusList?: BookingStatus[] };
}

const PAGE_LIMIT = 10;

const formatDate = (value?: Date | string): string => {
	if (!value) return '—';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatAmount = (amount: number, currency: string): string => {
	const symbol = currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : `${currency} `;
	return `${symbol}${amount.toLocaleString()}`;
};

const AdminBookingsPage: NextPage = () => {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
	const input = useMemo<BookingsInquiry>(() => ({
		page,
		limit: PAGE_LIMIT,
		search: status === 'ALL' ? {} : { bookingStatusList: [status] },
	}), [page, status]);

	const { data, loading, error } = useQuery<GetAllBookingsByAdminData>(GET_ALL_BOOKINGS_BY_ADMIN, {
		variables: { input },
		fetchPolicy: 'network-only',
	});

	const bookings = data?.getAllBookingsByAdmin?.list ?? [];
	const total = data?.getAllBookingsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
	const startItem = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
	const endItem = Math.min(page * PAGE_LIMIT, total);

	const getBookingItem = (booking: Booking): string => booking.propertyData?.propertyName ?? booking.tourData?.tourName ?? 'Unavailable listing';
	const getBookingDate = (booking: Booking): string => booking.bookingCategory === 'PROPERTY'
		? `${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`
		: formatDate(booking.createdAt);

	return (
		<div className="admin-overview dashboard-container">
			<div className="overview-header">
				<div className="header-text">
					<h1>Bookings Management</h1>
					<p>Review real platform reservations and their current booking status.</p>
				</div>
			</div>

			<section className="admin-table-section">
				<div className="table-header">
					<div className="header-left"><h2>Directory</h2><span className="table-badge">{total} Bookings</span></div>
					<div className="header-right">
						<div className="filter-select-group">
							<select className="filter-select" value={status} onChange={(event) => { setStatus(event.target.value as BookingStatus | 'ALL'); setPage(1); }}>
								<option value="ALL">All statuses</option>
								{Object.values(BookingStatus).map((value) => <option key={value} value={value}>{value}</option>)}
							</select>
						</div>
					</div>
				</div>

				<div className="table-container">
					<table className="admin-table">
						<thead><tr><th>Booking ID</th><th>Customer</th><th>Category</th><th>Listing</th><th>Dates</th><th>Total</th><th>Status</th></tr></thead>
						<tbody>
							{loading ? (
								<tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>Loading bookings...</td></tr>
							) : error ? (
								<tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#ba1a1a' }}>{error.message}</td></tr>
							) : bookings.length === 0 ? (
								<tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>No bookings found.</td></tr>
							) : bookings.map((booking) => (
								<tr key={booking._id}>
									<td><span style={{ fontFamily: 'monospace', color: '#006194', fontWeight: 600 }}>#{booking._id.slice(-6).toUpperCase()}</span></td>
									<td>{booking.memberData?.memberNick ?? booking.memberData?.memberFullName ?? 'Unknown member'}</td>
									<td><span className={`badge-pill ${booking.bookingCategory === 'PROPERTY' ? 'sky' : 'indigo'}`}>{booking.bookingCategory}</span></td>
									<td>{getBookingItem(booking)}</td>
									<td>{getBookingDate(booking)}</td>
									<td><strong>{formatAmount(booking.bookingTotalPrice, booking.bookingCurrency)}</strong></td>
									<td><span className={`status-pill ${booking.bookingStatus === BookingStatus.CONFIRMED || booking.bookingStatus === BookingStatus.COMPLETED ? 'green' : booking.bookingStatus === BookingStatus.PENDING ? 'amber' : 'red'}`}><span className="dot" /> {booking.bookingStatus}</span></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="table-footer">
					<span>Showing {startItem}–{endItem} of {total} bookings</span>
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
