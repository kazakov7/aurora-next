import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { START_PROPERTY_PAYMENT } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Message } from '../../../enums/common.enum';
import { Property } from '../../../types/property/property';
import { PropertyStatus } from '../../../enums/property.enum';
import { sweetErrorAlert } from '../../../sweetAlert';
import PropertyPaymentModal, { isStripePaymentConfigured } from './PropertyPaymentModal';

interface PropertyReservationWidgetProps {
	property: Property;
	refetchProperty: () => Promise<unknown>;
}

interface StartPropertyPaymentResponse {
	startPropertyPayment?: {
		clientSecret?: string;
	};
}

const formatDateForInput = (date: Date): string => {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const getDateAfterDays = (days: number): string => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + days);
	return formatDateForInput(date);
};

const getDateAfterDaysFrom = (dateValue: string, days: number): string => {
	const date = new Date(`${dateValue}T00:00:00`);
	date.setDate(date.getDate() + days);
	return formatDateForInput(date);
};

const getNights = (checkIn: string, checkOut: string): number => {
	const start = new Date(`${checkIn}T00:00:00`);
	const end = new Date(`${checkOut}T00:00:00`);
	const difference = end.getTime() - start.getTime();
	return Number.isFinite(difference) && difference > 0 ? Math.round(difference / 86_400_000) : 0;
};

const PropertyReservationWidget = ({ property, refetchProperty }: PropertyReservationWidgetProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const minimumCheckIn = getDateAfterDays(1);
	const [checkIn, setCheckIn] = useState<string>(minimumCheckIn);
	const [checkOut, setCheckOut] = useState<string>(getDateAfterDays(2));
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

	const handleCheckInChange = (nextCheckIn: string) => {
		setCheckIn(nextCheckIn);
		if (nextCheckIn >= checkOut) {
			const nextCheckOut = new Date(`${nextCheckIn}T00:00:00`);
			nextCheckOut.setDate(nextCheckOut.getDate() + 1);
			setCheckOut(formatDateForInput(nextCheckOut));
		}
		resetCheckout();
	};

	const handleCheckOutChange = (nextCheckOut: string) => {
		setCheckOut(nextCheckOut);
		resetCheckout();
	};

	const handleReserve = async () => {
		if (!user?._id) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		router.push('/checkout');	};

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
							<span className="price-value">₩{pricePerNight.toLocaleString()}</span>
							<span className="price-unit">/ night</span>
						</div>
						<div className="rating-badge-inline">
							<span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
							<span className="score">{ratingVal}</span>
							<span className="count">({reviewsCount})</span>
						</div>
					</div>

					<div className="picker-block">
						<div className="date-pickers-row">
							<div className="date-picker-box">
								<label className="picker-label">Check-In</label>
								<input type="date" className="picker-input" min={minimumCheckIn} value={checkIn} onChange={(event) => handleCheckInChange(event.target.value)} />
							</div>
							<div className="date-picker-box">
								<label className="picker-label">Check-Out</label>
							<input type="date" className="picker-input" min={getDateAfterDaysFrom(checkIn, 1)} value={checkOut} onChange={(event) => handleCheckOutChange(event.target.value)} />
							</div>
						</div>

						<div className="guest-picker-wrapper">
							<div className="guest-picker-box" onClick={() => setIsGuestDropdownOpen((current) => !current)}>
								<div><label className="picker-label">Guests</label><div className="picker-val">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</div></div>
								<span className="material-symbols-outlined chevron">{isGuestDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
							</div>
							{isGuestDropdownOpen ? (
								<div className="guest-dropdown-menu">
									{Array.from({ length: maxGuestsAllowed }, (_, index) => index + 1).map((guestOption) => (
										<button key={guestOption} type="button" className={`guest-menu-item ${guestCount === guestOption ? 'selected' : ''}`} onClick={() => { setGuestCount(guestOption); setIsGuestDropdownOpen(false); resetCheckout(); }}>
											<span>{guestOption} {guestOption === 1 ? 'Guest' : 'Guests'}</span>
											{guestCount === guestOption ? <span className="material-symbols-outlined check-icon">check</span> : null}
										</button>
									))}
								</div>
							) : null}
						</div>
					</div>

					<button className="reserve-cta-btn" type="button" disabled={paymentStarting || nights < 1 || !isBookable} onClick={handleReserve}>
						<span className="material-symbols-outlined lock-icon">lock</span>
						<span>{paymentStarting ? 'Preparing secure payment...' : isBookable ? 'Reserve hotel' : 'Unavailable'}</span>
					</button>
					<p className="no-charge-note">A secure Stripe payment form opens before any charge is confirmed.</p>

					<div className="itemized-breakdown">
						<div className="breakdown-row"><span className="breakdown-label">₩{pricePerNight.toLocaleString()} × {nights} night{nights === 1 ? '' : 's'}</span><span className="breakdown-value">₩{total.toLocaleString()}</span></div>
						<div className="breakdown-divider" />
						<div className="breakdown-row total-row"><span className="total-label">Total</span><span className="total-value">₩{total.toLocaleString()}</span></div>
					</div>
				</div>
			</aside>
			
		</>
	);
};

export default PropertyReservationWidget;
