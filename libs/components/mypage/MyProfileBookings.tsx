import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MY_BOOKINGS } from '../../../apollo/user/query';
import { CANCEL_BOOKING, CANCEL_TOUR_BOOKING } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { BookingCategory, BookingStatus } from '../../enums/booking.enum';
import { Booking } from '../../types/booking/booking';
import { DEFAULT_PROPERTY_IMAGE, DEFAULT_TOUR_IMAGE, getImageUrl } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyProfileBookings: React.FC = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [activeCategory, setActiveCategory] = useState<'ALL' | 'HOTEL' | 'TOUR'>('ALL');
	const [activeStatus, setActiveStatus] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

	/** APOLLO REQUESTS **/
	const [cancelBookingMutation] = useMutation(CANCEL_BOOKING);
	const [cancelTourBookingMutation] = useMutation(CANCEL_TOUR_BOOKING);

	const { data, loading, error, refetch } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 100,
				search: {},
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const allBookings: Booking[] = data?.getMyBookings?.list || [];
	const total = data?.getMyBookings?.metaCounter?.[0]?.total ?? allBookings.length;
	const bookings = useMemo(() => allBookings.filter((booking) => {
		const categoryMatches = activeCategory === 'ALL' ||
			(activeCategory === 'HOTEL' && booking.bookingCategory === BookingCategory.PROPERTY) ||
			(activeCategory === 'TOUR' && booking.bookingCategory === BookingCategory.TOUR);
		const statusMatches = activeStatus === 'ALL' ||
			(activeStatus === 'UPCOMING' && [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.bookingStatus)) ||
			(activeStatus === 'COMPLETED' && booking.bookingStatus === BookingStatus.COMPLETED) ||
			(activeStatus === 'CANCELLED' && booking.bookingStatus === BookingStatus.CANCELLED);
		return categoryMatches && statusMatches;
	}), [activeCategory, activeStatus, allBookings]);

	const activeCount = allBookings.filter(
		(b) => b.bookingStatus === BookingStatus.CONFIRMED || b.bookingStatus === BookingStatus.PENDING,
	).length;
	const hotelCount = allBookings.filter((b) => b.bookingCategory === BookingCategory.PROPERTY).length;
	const tourCount = allBookings.filter((b) => b.bookingCategory === BookingCategory.TOUR).length;

	/** HANDLERS **/
	const handleCancel = async (booking: Booking) => {
		const confirmed = await sweetConfirmAlert('Are you sure you want to cancel this reservation?');
		if (!confirmed) return;

		try {
			const cancelMutation = booking.bookingCategory === BookingCategory.TOUR
				? cancelTourBookingMutation
				: cancelBookingMutation;
			await cancelMutation({ variables: { bookingId: booking._id } });
			sweetTopSmallSuccessAlert('Reservation cancelled successfully.', 1000);
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Cancellation failed.');
		}
	};

	const handleExportCalendar = () => {
		const calendarBookings = allBookings.filter((booking) => booking.checkIn);
		if (!calendarBookings.length) {
			sweetMixinErrorAlert('There are no dated bookings to export.');
			return;
		}
		const toDate = (value?: Date | string) => value
			? new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
			: '';
		const events = calendarBookings.map((booking) => {
			const title = booking.propertyData?.propertyName || booking.tourData?.tourName || 'AURA booking';
			return ['BEGIN:VEVENT', `UID:${booking._id}@aurora.travel`, `DTSTART:${toDate(booking.checkIn)}`, `DTEND:${toDate(booking.checkOut || booking.checkIn)}`, `SUMMARY:${title.replace(/[;,]/g, ' ')}`, `DESCRIPTION:Booking ${booking.bookingRefId} — ${booking.bookingStatus}`, 'END:VEVENT'].join('\r\n');
		});
		const blob = new Blob([['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AURA Travel//Bookings//EN', ...events, 'END:VCALENDAR'].join('\r\n')], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'aura-bookings.ics';
		link.click();
		URL.revokeObjectURL(url);
	};

	const formatPrice = (amount: number, currency = 'KRW') => new Intl.NumberFormat('ko-KR', {
		style: 'currency', currency, maximumFractionDigits: currency === 'KRW' ? 0 : 2,
	}).format(amount);

	const formatDateRange = (inDate?: Date | string, outDate?: Date | string) => {
		if (!inDate) return 'Flexible Dates';
		const start = new Date(inDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		if (!outDate) return start;
		const end = new Date(outDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		return `${start} – ${end}`;
	};

	return (
		<div>
			{/* Top Header */}
			<div className="section-top-bar" style={{ borderBottom: '1px solid #dce2f7', paddingBottom: '18px' }}>
				<div className="title-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<h2>My Bookings</h2>
						<span className="counter-pill">
							{total} bookings · {activeCount} active
						</span>
					</div>
					<p style={{ margin: 0, fontSize: '13px', color: '#545c72' }}>
						Manage your upcoming and past trips with seamless concierge integration.
					</p>
				</div>
				<div className="bar-actions">
					<button
						type="button"
						className="primary-action-btn"
						style={{ background: '#f1f3ff', color: '#141b2b', boxShadow: 'none' }}
						onClick={handleExportCalendar}
					>
						<span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#545c72' }}>
							file_download
						</span>
						<span>Export Calendar</span>
					</button>
				</div>
			</div>

			{/* Filters Section */}
			<div className="booking-filter-bar">
				{/* Category Filter Pills */}
				<div className="category-pills">
					<button
						type="button"
						className={`cat-pill-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
						onClick={() => setActiveCategory('ALL')}
					>
						All ({total})
					</button>
					<button
						type="button"
						className={`cat-pill-btn ${activeCategory === 'HOTEL' ? 'active' : ''}`}
						onClick={() => setActiveCategory('HOTEL')}
					>
						Hotels ({hotelCount})
					</button>
					<button
						type="button"
						className={`cat-pill-btn ${activeCategory === 'TOUR' ? 'active' : ''}`}
						onClick={() => setActiveCategory('TOUR')}
					>
						Tours ({tourCount})
					</button>
				</div>

				{/* Status Sub-navigation */}
				<div className="status-subnav">
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'ALL' ? 'active' : ''}`}
						onClick={() => setActiveStatus('ALL')}
					>
						All Statuses ({total})
					</button>
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'UPCOMING' ? 'active' : ''}`}
						onClick={() => setActiveStatus('UPCOMING')}
					>
						Upcoming ({activeCount})
					</button>
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'COMPLETED' ? 'active' : ''}`}
						onClick={() => setActiveStatus('COMPLETED')}
					>
						Completed
					</button>
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'CANCELLED' ? 'active' : ''}`}
						onClick={() => setActiveStatus('CANCELLED')}
					>
						Cancelled
					</button>
				</div>
			</div>

			{/* Booking Cards Stack */}
			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>Loading your bookings...</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>Bookings are unavailable</h3><p>{error.message}</p></div>
			) : bookings.length > 0 ? (
				<div className="booking-cards-stack">
					{bookings.map((booking: Booking) => {
						const isHotel = booking.bookingCategory === BookingCategory.PROPERTY;
						const title = isHotel
							? booking.propertyData?.propertyName || 'Unavailable property'
							: booking.tourData?.tourName || 'Unavailable tour';
						const city = isHotel
							? booking.propertyData?.propertyCity || booking.propertyData?.propertyAddress || 'Location not provided'
							: booking.tourData?.tourDestinationCity || booking.tourData?.tourDepartureCity || 'Location not provided';
						const imgUrl = isHotel
							? getImageUrl(booking.propertyData?.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE)
							: getImageUrl(booking.tourData?.tourImages?.[0], DEFAULT_TOUR_IMAGE);

						const refCode = booking.bookingRefId;
						const rating = isHotel ? booking.propertyData?.propertyRating : booking.tourData?.tourRating;
						const isConfirmed =
							booking.bookingStatus === BookingStatus.CONFIRMED ||
							booking.bookingStatus === BookingStatus.PENDING;
						const isCancelled = booking.bookingStatus === BookingStatus.CANCELLED;
						const isCancellable = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.bookingStatus);

						return (
							<article key={booking._id} className="booking-card-item">
								<div className="card-img-box">
									<img src={imgUrl} alt={title} />
									{typeof rating === 'number' && rating > 0 && <span className="rating-badge">{rating.toFixed(1)} ★</span>}
								</div>

								<div className="card-middle-info">
									<div className="top-meta">
										<span className="type-pill">{isHotel ? 'HOTEL' : 'TOUR'}</span>
										<span className="ref-code">{refCode}</span>
									</div>
									<h3 className="booking-title">{title}</h3>
									<p className="location-line">
										<span className="material-symbols-outlined">location_on</span>
										<span>{city}</span>
									</p>
									<div className="date-guests-line">
										<span>
											<span className="material-symbols-outlined">calendar_today</span>
											{formatDateRange(booking.checkIn, booking.checkOut)}
										</span>
										<span>·</span>
										<span>
											<span className="material-symbols-outlined">person</span>
											{booking.bookingGuests} Guests
										</span>
									</div>
								</div>

								<div className="card-right-status">
									<span
										className={`status-badge ${
											isCancelled ? 'cancelled' : isConfirmed ? 'confirmed' : 'completed'
										}`}
									>
										{isConfirmed && <span className="pulse-dot"></span>}
										{isCancelled ? 'Cancelled' : isConfirmed ? 'Confirmed' : 'Completed'}
									</span>

									<div className="price-block">
										<span className="amount">
											{formatPrice(booking.bookingTotalPrice, booking.bookingCurrency)}
										</span>
										<span className="note">total · taxes included</span>
									</div>

									<div className="action-btns">
										<button
											type="button"
											className="view-btn"
											onClick={() => setSelectedBooking(booking)}
										>
											View Details
										</button>
									{isCancellable && (
											<button
												type="button"
												className="cancel-btn"
											onClick={() => handleCancel(booking)}
											>
												Cancel
											</button>
										)}
									</div>
								</div>
							</article>
						);
					})}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">confirmation_number</span>
					</div>
					<h3>No reservations found</h3>
					<p>Explore luxury hotels and bespoke expeditions to reserve your next journey.</p>
				</div>
			)}

			{/* Booking Details Modal */}
			{selectedBooking && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(20, 27, 43, 0.65)',
						backdropFilter: 'blur(8px)',
						zIndex: 1000,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '24px',
					}}
					onClick={() => setSelectedBooking(null)}
				>
					<div
						style={{
							background: '#ffffff',
							borderRadius: '24px',
							maxWidth: '520px',
							width: '100%',
							padding: '32px',
							boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
							position: 'relative',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
							<div>
								<span style={{ fontSize: '11px', fontWeight: 700, color: '#006194', textTransform: 'uppercase' }}>
									Reservation Details
								</span>
								<h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#141b2b' }}>
									{selectedBooking.bookingRefId}
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setSelectedBooking(null)}
								style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#545c72' }}
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#3f4850' }}>
							<div>
								<strong>Destination / Property:</strong>{' '}
								{selectedBooking.propertyData?.propertyName || selectedBooking.tourData?.tourName || 'Listing unavailable'}
							</div>
							<div>
								<strong>Stay / Tour Dates:</strong> {formatDateRange(selectedBooking.checkIn, selectedBooking.checkOut)}
							</div>
							<div>
								<strong>Registered Guests:</strong> {selectedBooking.bookingGuests} persons
							</div>
							<div>
								<strong>Total Amount:</strong> {formatPrice(selectedBooking.bookingTotalPrice, selectedBooking.bookingCurrency)}
							</div>
							<div>
								<strong>Status:</strong>{' '}
								<span style={{ color: '#137333', fontWeight: 600 }}>{selectedBooking.bookingStatus}</span>
							</div>
						</div>

						<div style={{ marginTop: '28px', display: 'flex', gap: '10px' }}>
							<button
								type="button"
								style={{
									flex: 1,
									height: '44px',
									background: '#006194',
									color: '#ffffff',
									border: 'none',
									borderRadius: '12px',
									fontWeight: 600,
									cursor: 'pointer',
								}}
								onClick={() => router.push('/chat')}
							>
								Contact Atelier Concierge
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MyProfileBookings;
