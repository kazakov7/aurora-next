import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MY_BOOKING_COUNTS, GET_MY_BOOKINGS } from '../../../apollo/user/query';
import { CANCEL_BOOKING, CANCEL_TOUR_BOOKING, SUBMIT_RATING } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { BookingCategory, BookingStatus } from '../../enums/booking.enum';
import { ReviewGroup } from '../../enums/review.enum';
import { Booking } from '../../types/booking/booking';
import { BISearch } from '../../types/booking/booking.input';
import { DEFAULT_PROPERTY_IMAGE, DEFAULT_TOUR_IMAGE, getImageUrl } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useI18n } from '../../i18n';
import LoadingSpinner from '../common/LoadingSpinner';
import BookingRatingAction from './BookingRatingAction';

const PAGE_LIMIT = 20;
// Same rule as the API: a paid booking is cancelled online until 48 hours before it starts
const GUEST_CANCEL_WINDOW_MS = 48 * 60 * 60 * 1000;


const STATUS_SEARCH: Record<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED', BISearch> = {
	ALL: {},
	UPCOMING: { bookingStatusList: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
	COMPLETED: { bookingStatusList: [BookingStatus.COMPLETED] },
	CANCELLED: { bookingStatusList: [BookingStatus.CANCELLED] },
};
const countInput = (search: BISearch) => ({ page: 1, limit: 1, search });
const RATING_VALUES = [1, 2, 3, 4, 5];

const MyProfileBookings: React.FC = () => {
	const { t, tEnum, tError, formatDate } = useI18n();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [activeCategory, setActiveCategory] = useState<'ALL' | 'HOTEL' | 'TOUR'>('ALL');
	const [activeStatus, setActiveStatus] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
	const [ratingValue, setRatingValue] = useState<number>(0);
	const [ratingHover, setRatingHover] = useState<number>(0);
	const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);
	const [ratingRefreshKey, setRatingRefreshKey] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [cancelBookingMutation] = useMutation(CANCEL_BOOKING);
	const [cancelTourBookingMutation] = useMutation(CANCEL_TOUR_BOOKING);
	const [submitRatingMutation] = useMutation(SUBMIT_RATING);

	// The remote backend BookingSearch only accepts bookingStatusList
	const search = useMemo(
		() => ({ ...STATUS_SEARCH[activeStatus] }),
		[activeStatus],
	);
	const { data, loading, error, refetch, fetchMore } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: PAGE_LIMIT, search } },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});
	const { data: countData, refetch: refetchCounts } = useQuery(GET_MY_BOOKING_COUNTS, {
		fetchPolicy: 'network-only',
		variables: {
			all: countInput({}),
			active: countInput(STATUS_SEARCH.UPCOMING),
		},
		skip: !user?._id,
	});

	const rawBookings: Booking[] = data?.getMyBookings?.list || [];

	// Client-side category filtering since backend returns all booking categories
	const bookings = useMemo(() => {
		if (activeCategory === 'HOTEL') {
			return rawBookings.filter((b) => b.bookingCategory === BookingCategory.PROPERTY);
		}
		if (activeCategory === 'TOUR') {
			return rawBookings.filter((b) => b.bookingCategory === BookingCategory.TOUR);
		}
		return rawBookings;
	}, [rawBookings, activeCategory]);

	const total = countData?.all?.metaCounter?.[0]?.total ?? rawBookings.length;
	const activeCount = countData?.active?.metaCounter?.[0]?.total ?? 0;
	const hotelCount = useMemo(
		() => rawBookings.filter((b) => b.bookingCategory === BookingCategory.PROPERTY).length,
		[rawBookings],
	);
	const tourCount = useMemo(
		() => rawBookings.filter((b) => b.bookingCategory === BookingCategory.TOUR).length,
		[rawBookings],
	);
	const filteredTotal = activeCategory === 'ALL'
		? (data?.getMyBookings?.metaCounter?.[0]?.total ?? rawBookings.length)
		: bookings.length;

	const handleLoadMore = async () => {
		await fetchMore({
			variables: { input: { page: Math.floor(rawBookings.length / PAGE_LIMIT) + 1, limit: PAGE_LIMIT, search } },
			updateQuery: (previous, { fetchMoreResult }) => ({
				getMyBookings: {
					...fetchMoreResult.getMyBookings,
					list: [...previous.getMyBookings.list, ...fetchMoreResult.getMyBookings.list],
				},
			}),
		});
	};

	/** A paid booking can be cancelled online until 48 hours before it starts, a payment hold any time **/
	const canCancel = (booking: Booking) => {
		if (booking.bookingStatus === BookingStatus.PENDING) return true;
		if (booking.bookingStatus !== BookingStatus.CONFIRMED || !booking.checkIn) return false;
		return new Date(booking.checkIn).getTime() - Date.now() >= GUEST_CANCEL_WINDOW_MS;
	};

	/** HANDLERS **/
	const openRating = (booking: Booking) => {
		setRatingBooking(booking);
		setRatingValue(0);
		setRatingHover(0);
	};

	const closeRating = () => {
		if (ratingSubmitting) return;
		setRatingBooking(null);
	};

	const handleSubmitRating = async () => {
		if (!ratingBooking || !ratingValue) return;
		try {
			setRatingSubmitting(true);
			await submitRatingMutation({
				variables: {
					input: {
						reviewGroup: ratingBooking.bookingCategory === BookingCategory.TOUR ? ReviewGroup.TOUR : ReviewGroup.PROPERTY,
						reviewRefId: ratingBooking.bookingRefId,
						reviewRating: ratingValue,
					},
				},
			});
			setRatingBooking(null);
			setRatingRefreshKey((current) => current + 1);
			sweetTopSmallSuccessAlert(t('profile.bookings.ratingSaved'), 1500);
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'profile.bookings.ratingFailed'));
		} finally {
			setRatingSubmitting(false);
		}
	};

	const handleCancel = async (booking: Booking) => {
		const isPaid = booking.bookingStatus === BookingStatus.CONFIRMED;
		const confirmed = await sweetConfirmAlert(
			t(isPaid ? 'profile.bookings.cancelPaidConfirm' : 'profile.bookings.cancelConfirm'),
		);
		if (!confirmed) return;

		try {
			const cancelMutation = booking.bookingCategory === BookingCategory.TOUR
				? cancelTourBookingMutation
				: cancelBookingMutation;
			await cancelMutation({ variables: { bookingId: booking._id } });
			sweetTopSmallSuccessAlert(t(isPaid ? 'profile.bookings.cancelledRefunded' : 'profile.bookings.cancelled'), 1500);
			await Promise.all([refetch(), refetchCounts()]);
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'profile.bookings.cancellationFailed'));
		}
	};

	const handleExportCalendar = () => {
		const calendarBookings = bookings.filter((booking) => booking.checkIn);
		if (!calendarBookings.length) {
			sweetMixinErrorAlert(t('profile.bookings.nothingToExport'));
			return;
		}
		const toDate = (value?: Date | string) => value
			? new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
			: '';
		const events = calendarBookings.map((booking) => {
			const title = booking.propertyData?.propertyName || booking.tourData?.tourName || t('profile.bookings.auroraBooking');
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

	const formatPrice = (amount: number, currency = 'USD') => new Intl.NumberFormat('en-US', {
		style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
	}).format(amount);

	const formatDateRange = (inDate?: Date | string, outDate?: Date | string) => {
		if (!inDate) return t('profile.bookings.flexibleDates');
		const start = formatDate(inDate, { month: 'short', day: 'numeric' });
		if (!outDate) return start;
		const end = formatDate(outDate, { month: 'short', day: 'numeric', year: 'numeric' });
		return `${start} – ${end}`;
	};

	return (
		<div>
			{/* Top Header */}
			<div className="section-top-bar" style={{ borderBottom: '1px solid #dce2f7', paddingBottom: '18px' }}>
				<div className="title-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<h2>{t('profile.bookings.myBookings')}</h2>
						<span className="counter-pill">
							{t('profile.bookings.summary', { total, activeCount })}
						</span>
					</div>
					<p style={{ margin: 0, fontSize: '13px', color: '#545c72' }}>
						{t('profile.bookings.intro')}
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
						<span>{t('profile.bookings.exportCalendar')}</span>
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
						{t('profile.bookings.tabAll', { total })}
					</button>
					<button
						type="button"
						className={`cat-pill-btn ${activeCategory === 'HOTEL' ? 'active' : ''}`}
						onClick={() => setActiveCategory('HOTEL')}
					>
						{t('profile.bookings.tabHotels', { hotelCount })}
					</button>
					<button
						type="button"
						className={`cat-pill-btn ${activeCategory === 'TOUR' ? 'active' : ''}`}
						onClick={() => setActiveCategory('TOUR')}
					>
						{t('profile.bookings.tabTours', { tourCount })}
					</button>
				</div>

				{/* Status Sub-navigation */}
				<div className="status-subnav">
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'ALL' ? 'active' : ''}`}
						onClick={() => setActiveStatus('ALL')}
					>
						{t('profile.bookings.statusAll', { total })}
					</button>
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'UPCOMING' ? 'active' : ''}`}
						onClick={() => setActiveStatus('UPCOMING')}
					>
						{t('profile.bookings.statusUpcoming', { activeCount })}
					</button>
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'COMPLETED' ? 'active' : ''}`}
						onClick={() => setActiveStatus('COMPLETED')}
					>
						{t('booking.completed')}
					</button>
					<button
						type="button"
						className={`status-tab-btn ${activeStatus === 'CANCELLED' ? 'active' : ''}`}
						onClick={() => setActiveStatus('CANCELLED')}
					>
						{t('booking.cancelled')}
					</button>
				</div>
			</div>

			{/* Booking Cards Stack */}
			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>{t('profile.bookings.loading')}</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>{t('profile.bookings.unavailable')}</h3><p>{error.message}</p></div>
			) : bookings.length > 0 ? (
				<div className="booking-cards-stack" style={{ position: 'relative' }}>
					{loading && <LoadingSpinner overlay size="md" label={t('common.updating')} />}
					{bookings.map((booking: Booking) => {
						const isHotel = booking.bookingCategory === BookingCategory.PROPERTY;
						const title = isHotel
							? booking.propertyData?.propertyName || t('profile.bookings.unavailableProperty')
							: booking.tourData?.tourName || t('profile.bookings.unavailableTour');
						const city = isHotel
							? booking.propertyData?.propertyCity || booking.propertyData?.propertyAddress || t('common.locationNotProvided')
							: booking.tourData?.tourDestinationCity || booking.tourData?.tourDepartureCity || t('common.locationNotProvided');
						const imgUrl = isHotel
							? getImageUrl(booking.propertyData?.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE)
							: getImageUrl(booking.tourData?.tourImages?.[0], DEFAULT_TOUR_IMAGE);

						const refCode = booking.bookingRefId;
						const rating = isHotel ? booking.propertyData?.propertyRating : booking.tourData?.tourRating;
						// A payment hold is not a booking yet: it says so until the payment arrives
						const isPending = booking.bookingStatus === BookingStatus.PENDING;
						const isConfirmed = booking.bookingStatus === BookingStatus.CONFIRMED;
						const isCancelled = booking.bookingStatus === BookingStatus.CANCELLED;
						const isCancellable = canCancel(booking);

						return (
							<article key={booking._id} className="booking-card-item">
								<div className="card-img-box">
									<img src={imgUrl} alt={title} />
									{typeof rating === 'number' && rating > 0 && <span className="rating-badge">{rating.toFixed(1)} ★</span>}
								</div>

								<div className="card-middle-info">
									<div className="top-meta">
										<span className="type-pill">{isHotel ? t('common.hotelBadge') : t('common.tourBadge')}</span>
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
											{t('profile.bookings.guests', { bookingGuests: booking.bookingGuests })}
										</span>
									</div>
								</div>

								<div className="card-right-status">
									<span
										className={`status-badge ${
											isCancelled ? 'cancelled' : isPending ? 'pending' : isConfirmed ? 'confirmed' : 'completed'
										}`}
									>
										{isConfirmed && <span className="pulse-dot"></span>}
										{isCancelled
											? t('booking.cancelled')
											: isPending
												? t('profile.bookings.awaitingPayment')
												: isConfirmed
													? t('booking.confirmed')
													: t('booking.completed')}
									</span>

									<div className="price-block">
										<span className="amount">
											{formatPrice(booking.bookingTotalPrice, booking.bookingCurrency)}
										</span>
										<span className="note">{t('profile.bookings.totalTaxesIncluded')}</span>
									</div>

									<div className="action-btns">
										<button
											type="button"
											className="view-btn"
											onClick={() => setSelectedBooking(booking)}
										>
											{t('common.viewDetails')}
										</button>
									{isCancellable && (
											<button
												type="button"
												className="cancel-btn"
											onClick={() => handleCancel(booking)}
											>
												{t('common.cancel')}
											</button>
										)}
										<BookingRatingAction
											key={`${booking._id}-${ratingRefreshKey}`}
											booking={booking}
											onRate={openRating}
										/>
									</div>
								</div>
							</article>
						);
					})}
					{bookings.length < filteredTotal && (
						<button
							type="button"
							className="view-btn"
							style={{ alignSelf: 'center' }}
							onClick={() => void handleLoadMore()}
							disabled={loading}
						>
							{t('profile.bookings.loadMore')}
						</button>
					)}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">confirmation_number</span>
					</div>
					<h3>{t('profile.bookings.noReservationsFound')}</h3>
					<p>{t('profile.bookings.emptyText')}</p>
				</div>
			)}

			{/* Rating Modal */}
			{ratingBooking && (
				<div className="rating-modal-backdrop" onClick={closeRating}>
					<div
						className="rating-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="rating-modal-title"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="rating-modal-head">
							<div>
								<span className="rating-modal-eyebrow">
									{t(ratingBooking.bookingCategory === BookingCategory.TOUR ? 'profile.bookings.rateYourTour' : 'profile.bookings.rateYourStay')}
								</span>
								<h3 id="rating-modal-title">
									{ratingBooking.propertyData?.propertyName || ratingBooking.tourData?.tourName}
								</h3>
							</div>
							<button type="button" className="rating-modal-close" onClick={closeRating} aria-label={t('common.close')}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="rating-stars" onMouseLeave={() => setRatingHover(0)}>
							{RATING_VALUES.map((value) => (
								<button
									key={value}
									type="button"
									className={value <= (ratingHover || ratingValue) ? 'active' : ''}
									aria-label={t('profile.bookings.starsLabel', { count: value })}
									aria-pressed={value === ratingValue}
									onMouseEnter={() => setRatingHover(value)}
									onFocus={() => setRatingHover(value)}
									onBlur={() => setRatingHover(0)}
									onClick={() => setRatingValue(value)}
								>
									<span className="material-symbols-outlined">star</span>
								</button>
							))}
						</div>
						<p className="rating-modal-note">{t('profile.bookings.ratingOnce')}</p>

						<div className="rating-modal-actions">
							<button type="button" className="rating-cancel-btn" onClick={closeRating} disabled={ratingSubmitting}>
								{t('common.cancel')}
							</button>
							<button
								type="button"
								className="rating-submit-btn"
								onClick={() => void handleSubmitRating()}
								disabled={!ratingValue || ratingSubmitting}
							>
								{t('profile.bookings.submitRating')}
							</button>
						</div>
					</div>
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
									{t('profile.bookings.reservationDetails')}
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
								<strong>{t('profile.bookings.destinationProperty')}</strong>{' '}
								{selectedBooking.propertyData?.propertyName || selectedBooking.tourData?.tourName || t('profile.bookings.listingUnavailable')}
							</div>
							<div>
								<strong>{t('profile.bookings.stayTourDates')}</strong> {formatDateRange(selectedBooking.checkIn, selectedBooking.checkOut)}
							</div>
							<div>
								<strong>{t('profile.bookings.registeredGuests')}</strong> {t('profile.bookings.persons', { bookingGuests: selectedBooking.bookingGuests })}
							</div>
							<div>
								<strong>{t('profile.bookings.totalAmount')}</strong> {formatPrice(selectedBooking.bookingTotalPrice, selectedBooking.bookingCurrency)}
							</div>
							<div>
								<strong>{t('profile.bookings.status')}</strong>{' '}
								<span style={{ color: '#137333', fontWeight: 600 }}>{tEnum('bookingStatus', selectedBooking.bookingStatus)}</span>
							</div>
							{selectedBooking.bookingStatus === BookingStatus.CONFIRMED && !canCancel(selectedBooking) && (
								<div style={{ fontSize: '13px', color: '#545c72' }}>{t('profile.bookings.cancelWindowClosed')}</div>
							)}
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
								{t('profile.bookings.contactAtelierConcierge')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MyProfileBookings;
