import React, { useState } from 'react';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MY_BOOKINGS } from '../../../apollo/user/query';
import { CANCEL_BOOKING } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { BookingCategory, BookingStatus } from '../../enums/booking.enum';
import { Booking } from '../../types/booking/booking';
import { getImageUrl } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyProfileBookings: React.FC = () => {
	const user = useReactiveVar(userVar);
	const [activeCategory, setActiveCategory] = useState<'ALL' | 'HOTEL' | 'TOUR'>('ALL');
	const [activeStatus, setActiveStatus] = useState<string>('ALL');
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

	/** APOLLO REQUESTS **/
	const [cancelBookingMutation] = useMutation(CANCEL_BOOKING);

	const { data, loading, refetch } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 20,
				search: {
					memberId: user?._id || '',
					bookingCategory:
						activeCategory === 'HOTEL'
							? BookingCategory.PROPERTY
							: activeCategory === 'TOUR'
							? BookingCategory.TOUR
							: undefined,
					bookingStatus:
						activeStatus === 'UPCOMING'
							? BookingStatus.CONFIRMED
							: activeStatus === 'COMPLETED'
							? BookingStatus.COMPLETED
							: activeStatus === 'CANCELLED'
							? BookingStatus.CANCELLED
							: undefined,
				},
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const bookings: Booking[] = data?.getMyBookings?.list || [];
	const total = data?.getMyBookings?.metaCounter?.[0]?.total || bookings.length;

	const activeCount = bookings.filter(
		(b) => b.bookingStatus === BookingStatus.CONFIRMED || b.bookingStatus === BookingStatus.PENDING,
	).length;
	const hotelCount = bookings.filter((b) => b.bookingCategory === BookingCategory.PROPERTY).length;
	const tourCount = bookings.filter((b) => b.bookingCategory === BookingCategory.TOUR).length;

	/** HANDLERS **/
	const handleCancel = async (bookingId: string) => {
		const confirmed = await sweetConfirmAlert('Are you sure you want to cancel this reservation?');
		if (!confirmed) return;

		try {
			await cancelBookingMutation({
				variables: { bookingId },
			});
			sweetTopSmallSuccessAlert('Reservation cancelled successfully.', 1000);
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Cancellation failed.');
		}
	};

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
						onClick={() => sweetTopSmallSuccessAlert('Calendar exported to iCal & Google Calendar.', 1000)}
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
			{bookings.length > 0 ? (
				<div className="booking-cards-stack">
					{bookings.map((booking: Booking) => {
						const isHotel = booking.bookingCategory === BookingCategory.PROPERTY;
						const title = isHotel
							? booking.propertyData?.propertyName || 'Sanctuary Retreat'
							: booking.tourData?.tourName || 'Alpine Expedition';
						const city = isHotel
							? booking.propertyData?.propertyCity || 'Santorini, Greece'
							: 'Alps Region';
						const imgUrl = isHotel
							? getImageUrl(
									booking.propertyData?.propertyImages?.[0],
									'https://lh3.googleusercontent.com/aida-public/AB6AXuD8_BY-EVXIV7xo-yc9MYTb9NSoxhEi7EEv_XTCME9ZgfFw4tHp3r2MxvwZtjXUEnDFhGmRxFL45eq5LW-kSq3pfgKWZailt6pMXNLA7AILQwc6ni5OJlwUQwfaSoibHu1ciegz2OHO18tz_NErv3xXG3t7qtchAETDE-3q0qOCuiNxi1N43cAY-jINAZZJvIGhJEGSvz8a4onhCI47CfTAEJatfn0hxZHImOuDPkE7YYbavINRkHb6',
							  )
							: getImageUrl(
									booking.tourData?.tourImages?.[0],
									'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBGLwDlfM8YtqhZoRxKxdvdcrqmuPZy3JcLHyzuR-q_-qcnZ_6iMAHGMlqK3XJovY7fxH5uMFEkaLtXh6jlhsQYsuOQ94lWyTfgkd66T7Hfxbpvv9gRQCpt6q0A3WAOQaJ0_94Lx9DwnKWQNipcpMnyWjueAwFuG2GcAqzkw7Ay3ES31QOlTu1RmwiEBVIaxMxSt6frcNKsRko_vqxFX8ZI-DYpJhBdJ7nmFvf_rCcohd9ZjKx5fG',
							  );

						const refCode = booking.bookingRefId || `#AUR-${booking._id.slice(-5).toUpperCase()}`;
						const isConfirmed =
							booking.bookingStatus === BookingStatus.CONFIRMED ||
							booking.bookingStatus === BookingStatus.PENDING;
						const isCancelled = booking.bookingStatus === BookingStatus.CANCELLED;

						return (
							<article key={booking._id} className="booking-card-item">
								<div className="card-img-box">
									<img src={imgUrl} alt={title} />
									<span className="rating-badge">5.0 ★</span>
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
											{booking.bookingGuests || 2} Guests
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
											₩{(booking.bookingTotalPrice || 1840000).toLocaleString()}
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
										{!isCancelled && (
											<button
												type="button"
												className="cancel-btn"
												onClick={() => handleCancel(booking._id)}
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
									{selectedBooking.bookingRefId || `#AUR-${selectedBooking._id.slice(-5).toUpperCase()}`}
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
								{selectedBooking.propertyData?.propertyName || selectedBooking.tourData?.tourName || 'Luxury Sanctuary'}
							</div>
							<div>
								<strong>Stay / Tour Dates:</strong> {formatDateRange(selectedBooking.checkIn, selectedBooking.checkOut)}
							</div>
							<div>
								<strong>Registered Guests:</strong> {selectedBooking.bookingGuests || 2} persons
							</div>
							<div>
								<strong>Total Amount:</strong> ₩{(selectedBooking.bookingTotalPrice || 1840000).toLocaleString()} (KRW)
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
								onClick={() => {
									sweetTopSmallSuccessAlert('Concierge team notified. A curator will reach out shortly.', 1200);
									setSelectedBooking(null);
								}}
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
