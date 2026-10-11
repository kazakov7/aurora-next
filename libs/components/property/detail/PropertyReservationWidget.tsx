import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { START_PROPERTY_PAYMENT } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Message } from '../../../enums/common.enum';
import { Property } from '../../../types/property/property';
import { PropertyStatus } from '../../../enums/property.enum';
import { sweetErrorAlert } from '../../../sweetAlert';
import PropertyAvailabilityCalendar from './PropertyAvailabilityCalendar';
import { useI18n } from '../../../i18n';
import useDeviceDetect from '../../../hooks/useDeviceDetect';
import { motion, AnimatePresence } from 'framer-motion';
import { appleEase } from '../../../motion/transitions';

interface PropertyReservationWidgetProps {
	property: Property;
	refetchProperty: () => Promise<unknown>;
}

interface StartPropertyPaymentResponse {
	startPropertyPayment?: {
		clientSecret?: string;
	};
}

const getNights = (checkIn: string, checkOut: string): number => {
	const start = new Date(`${checkIn}T00:00:00.000Z`);
	const end = new Date(`${checkOut}T00:00:00.000Z`);
	const difference = end.getTime() - start.getTime();
	return Number.isFinite(difference) && difference > 0 ? Math.round(difference / 86_400_000) : 0;
};

const PropertyReservationWidget = ({ property, refetchProperty }: PropertyReservationWidgetProps) => {
	const { t } = useI18n();
	const router = useRouter();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const widgetRef = useRef<HTMLElement | null>(null);
	const [isWidgetInView, setIsWidgetInView] = useState(false);
	const [checkIn, setCheckIn] = useState<string>('');
	const [checkOut, setCheckOut] = useState<string>('');
	const [guestCount, setGuestCount] = useState<number>(Math.min(2, Math.max(1, property.maxGuests)));
	const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
	const [clientSecret, setClientSecret] = useState<string>('');
	const [checkoutKey, setCheckoutKey] = useState<string>('');
	const maxGuestsAllowed = Math.max(1, property.maxGuests);
	const isBookable = property.propertyStatus === PropertyStatus.ACTIVE;
	const nights = getNights(checkIn, checkOut);
	const pricePerNight = property.pricePerNight;
	const total = pricePerNight * nights;
	const ratingVal = typeof property.propertyRating === 'number' ? property.propertyRating.toFixed(2) : '—';
	const reviewsCount = property.propertyReviews ?? 0;

	/** APOLLO REQUESTS **/
	const [startPropertyPayment, { loading: paymentStarting }] = useMutation<StartPropertyPaymentResponse>(START_PROPERTY_PAYMENT);

	/** LIFECYCLES **/
	useEffect(() => {
		setGuestCount((current) => Math.min(Math.max(1, current), maxGuestsAllowed));
	}, [maxGuestsAllowed]);

	useEffect(() => {
		if (device !== 'mobile' || typeof IntersectionObserver === 'undefined' || !widgetRef.current) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsWidgetInView(entry.isIntersecting);
			},
			{ threshold: 0.15 },
		);
		observer.observe(widgetRef.current);
		return () => observer.disconnect();
	}, [device]);

	/** HANDLERS **/
	const clearCheckout = () => setClientSecret('');
	const resetCheckout = () => {
		setClientSecret('');
		setCheckoutKey('');
	};

	const handleDateChange = (nextCheckIn: string, nextCheckOut: string) => {
		setCheckIn(nextCheckIn);
		setCheckOut(nextCheckOut);
		resetCheckout();
	};

	const handleReserve = async () => {
		if (!user?._id) {
			await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
			return;
		}
		if (!property._id || !isBookable || nights < 1 || guestCount < 1 || guestCount > maxGuestsAllowed) {
			await sweetErrorAlert(t('hotels.reservation.invalidSelection'));
			return;
		}
		try {
			await router.push({ pathname: '/checkout', query: { type: 'property', id: property._id, checkIn, checkOut, guests: guestCount } });
		} catch (error) {
			await sweetErrorAlert(t('hotels.reservation.checkoutFailed'));
		}
	};

	const handleStickyAction = async () => {
		if (nights < 1) {
			widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return;
		}
		await handleReserve();
	};

	const handlePaymentConfirmed = async () => {
		await refetchProperty();
		setCheckoutKey('');
	};

	return (
		<>
			<aside ref={widgetRef} className="reservation-sticky-widget">
				<div className="widget-card">
					<div className="price-header-row">
						<div className="price-tag-group">
							<span className="price-value">${pricePerNight.toLocaleString('en-US')}</span>
							<span className="price-unit">{t('common.perNight')}</span>
						</div>
						<div className="rating-badge-inline">
							<span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
							<span className="score">{ratingVal}</span>
							<span className="count">({reviewsCount})</span>
						</div>
					</div>

					<div className="picker-block">
						<PropertyAvailabilityCalendar propertyId={property._id} checkIn={checkIn} checkOut={checkOut} onChange={handleDateChange} />

						<div className="guest-picker-wrapper">
							<div className="guest-picker-box" onClick={() => setIsGuestDropdownOpen((current) => !current)}>
								<div><label className="picker-label">{t('hotels.reservation.guests')}</label><div className="picker-val">{t('common.guestCount', { count: guestCount })}</div></div>
								<span className="material-symbols-outlined chevron">{isGuestDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
							</div>
							<AnimatePresence>
								{isGuestDropdownOpen ? (
									<motion.div
										className="guest-dropdown-menu"
										initial={{ opacity: 0, y: -6, scale: 0.98 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -6, scale: 0.98 }}
										transition={{ duration: 0.18, ease: appleEase }}
									>
										{Array.from({ length: maxGuestsAllowed }, (_, index) => index + 1).map((guestOption) => (
											<button key={guestOption} type="button" className={`guest-menu-item ${guestCount === guestOption ? 'selected' : ''}`} onClick={() => { setGuestCount(guestOption); setIsGuestDropdownOpen(false); resetCheckout(); }}>
												<span>{t('common.guestCount', { count: guestOption })}</span>
												{guestCount === guestOption ? <span className="material-symbols-outlined check-icon">check</span> : null}
											</button>
										))}
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>
					</div>

					<motion.button
						className="reserve-cta-btn"
						type="button"
						disabled={paymentStarting || nights < 1 || !isBookable}
						onClick={handleReserve}
						whileHover={{ scale: 1.015 }}
						whileTap={{ scale: 0.985 }}
						transition={{ duration: 0.18, ease: appleEase }}
					>
						<span className="material-symbols-outlined lock-icon">lock</span>
						<span>{paymentStarting ? t('hotels.reservation.preparingSecurePayment') : isBookable ? t('hotels.reservation.reserveHotel') : t('hotels.reservation.unavailable')}</span>
					</motion.button>
					<p className="no-charge-note">{t('hotels.reservation.stripeNote')}</p>

					<div className="itemized-breakdown">
						<div className="breakdown-row"><span className="breakdown-label">{t('hotels.reservation.priceBreakdown', { count: nights, price: pricePerNight.toLocaleString('en-US') })}</span><span className="breakdown-value">${total.toLocaleString('en-US')}</span></div>
						<div className="breakdown-divider" />
						<div className="breakdown-row total-row"><span className="total-label">{t('common.total')}</span><span className="total-value">${total.toLocaleString('en-US')}</span></div>
					</div>
				</div>
			</aside>
			{device === 'mobile' && (
				<div className={`mobile-sticky-booking-bar ${isWidgetInView ? 'widget-in-view' : ''}`}>
					<div className="sticky-booking-info" onClick={() => widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
						<div className="sticky-price-row">
							<span className="sticky-price">${pricePerNight.toLocaleString('en-US')}</span>
							<span className="sticky-unit">{t('common.perNight')}</span>
						</div>
						<div className="sticky-meta-row">
							<span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
							<span className="sticky-score">{ratingVal}</span>
							<span className="sticky-count">({reviewsCount})</span>
							{nights > 0 && <span className="sticky-dates-pill">• ${total.toLocaleString('en-US')}</span>}
						</div>
					</div>
					<button
						type="button"
						className="sticky-booking-cta"
						disabled={paymentStarting || !isBookable}
						onClick={handleStickyAction}
					>
						<span className="material-symbols-outlined cta-icon">{nights < 1 ? 'calendar_month' : 'lock'}</span>
						<span>{paymentStarting ? t('hotels.reservation.preparingSecurePayment') : isBookable ? t('hotels.reservation.reserveHotel') : t('hotels.reservation.unavailable')}</span>
					</button>
				</div>
			)}
		</>
	);
};

export default PropertyReservationWidget;
