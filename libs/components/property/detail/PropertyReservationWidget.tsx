import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { START_PROPERTY_PAYMENT } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Message } from '../../../enums/common.enum';
import { Property } from '../../../types/property/property';
import { PropertyStatus } from '../../../enums/property.enum';
import { sweetErrorAlert } from '../../../sweetAlert';
import PropertyAvailabilityCalendar from './PropertyAvailabilityCalendar';
import { useI18n } from '../../../i18n';

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
	const user = useReactiveVar(userVar);
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

	const handlePaymentConfirmed = async () => {
		await refetchProperty();
		setCheckoutKey('');
	};

	return (
		<>
			<aside className="reservation-sticky-widget">
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
							{isGuestDropdownOpen ? (
								<div className="guest-dropdown-menu">
									{Array.from({ length: maxGuestsAllowed }, (_, index) => index + 1).map((guestOption) => (
										<button key={guestOption} type="button" className={`guest-menu-item ${guestCount === guestOption ? 'selected' : ''}`} onClick={() => { setGuestCount(guestOption); setIsGuestDropdownOpen(false); resetCheckout(); }}>
											<span>{t('common.guestCount', { count: guestOption })}</span>
											{guestCount === guestOption ? <span className="material-symbols-outlined check-icon">check</span> : null}
										</button>
									))}
								</div>
							) : null}
						</div>
					</div>

					<button className="reserve-cta-btn" type="button" disabled={paymentStarting || nights < 1 || !isBookable} onClick={handleReserve}>
						<span className="material-symbols-outlined lock-icon">lock</span>
						<span>{paymentStarting ? t('hotels.reservation.preparingSecurePayment') : isBookable ? t('hotels.reservation.reserveHotel') : t('hotels.reservation.unavailable')}</span>
					</button>
					<p className="no-charge-note">{t('hotels.reservation.stripeNote')}</p>

					<div className="itemized-breakdown">
						<div className="breakdown-row"><span className="breakdown-label">{t('hotels.reservation.priceBreakdown', { count: nights, price: pricePerNight.toLocaleString('en-US') })}</span><span className="breakdown-value">${total.toLocaleString('en-US')}</span></div>
						<div className="breakdown-divider" />
						<div className="breakdown-row total-row"><span className="total-label">{t('common.total')}</span><span className="total-value">${total.toLocaleString('en-US')}</span></div>
					</div>
				</div>
			</aside>
			
		</>
	);
};

export default PropertyReservationWidget;
