import React, { useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { START_TOUR_PAYMENT } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Message } from '../../../enums/common.enum';
import { Tour } from '../../../types/tour/tour';
import { sweetErrorAlert } from '../../../sweetAlert';
import { formatApiDate } from '../../../utils';
import PropertyPaymentModal, { isStripePaymentConfigured } from '../../property/detail/PropertyPaymentModal';

interface TourReservationWidgetProps {
	tour: Tour;
	refetchTour: () => Promise<unknown>;
}

interface StartTourPaymentResponse {
	startTourPayment?: { clientSecret?: string };
}

const TourReservationWidget = ({ tour, refetchTour }: TourReservationWidgetProps) => {
	const user = useReactiveVar(userVar);
	const seatsLeft = Math.max(0, tour.tourCapacity - (tour.tourReservedSeats ?? 0));
	const [travelers, setTravelers] = useState(Math.min(2, Math.max(1, seatsLeft)));
	const [clientSecret, setClientSecret] = useState('');
	const [checkoutKey, setCheckoutKey] = useState('');
	const totalPrice = tour.tourPrice * travelers;
	const rating = typeof tour.tourRating === 'number' ? tour.tourRating.toFixed(2) : '—';
	const reviews = tour.tourReviews ?? 0;
	const [startTourPayment, { loading: paymentStarting }] = useMutation<StartTourPaymentResponse>(START_TOUR_PAYMENT);

	/** LIFECYCLES **/
	useEffect(() => {
		setTravelers((current) => Math.min(Math.max(1, current), Math.max(1, seatsLeft)));
	}, [seatsLeft]);

	/** HANDLERS **/
	const resetCheckout = () => {
		setClientSecret('');
		setCheckoutKey('');
	};
	const closeCheckout = () => setClientSecret('');
	const handleReserve = async () => {
		if (!user?._id) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		if (!isStripePaymentConfigured) {
			await sweetErrorAlert('Secure payment is not configured. Please contact support.');
			return;
		}
		if (!tour._id || tour.tourCurrency !== 'KRW' || seatsLeft < 1 || travelers < 1 || travelers > seatsLeft) {
			await sweetErrorAlert('This tour no longer has enough available seats.');
			return;
		}
		if (!window.crypto?.randomUUID) {
			await sweetErrorAlert('Secure checkout is unavailable in this browser. Please update your browser and try again.');
			return;
		}

		const idempotencyKey = checkoutKey || window.crypto.randomUUID();
		setCheckoutKey(idempotencyKey);
		try {
			const { data } = await startTourPayment({ variables: { input: { tourId: tour._id, bookingGuests: travelers, idempotencyKey } } });
			const nextClientSecret = data?.startTourPayment?.clientSecret;
			if (!nextClientSecret) throw new Error('Unable to initialize secure payment.');
			setClientSecret(nextClientSecret);
		} catch (error: unknown) {
			await sweetErrorAlert(error instanceof Error ? error.message : 'Unable to start your tour reservation.');
		}
	};
	const handlePaymentConfirmed = async () => {
		await refetchTour();
		setCheckoutKey('');
	};

	return (
		<>
			<aside className="tour-reservation-widget">
				<div className="widget-card">
					<div className="price-header-row">
						<div className="price-tags-group"><span className="price-current">₩{tour.tourPrice.toLocaleString()}</span><span className="price-unit">/ person</span></div>
						<div className="rating-badge-inline"><span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span><span className="score">{rating}</span><span className="count">({reviews})</span></div>
					</div>

					<div className="tour-window-block">
						<div className="window-top-labels"><span className="window-title">Tour dates</span><span className="seats-alert-badge">{seatsLeft} seat{seatsLeft === 1 ? '' : 's'} available</span></div>
						<div className="window-date-card"><div><div className="window-dates">{formatApiDate(tour.tourStartDate)} — {formatApiDate(tour.tourEndDate)}</div><div className="window-sub">Seats are confirmed after successful payment.</div></div><span className="material-symbols-outlined verified-icon">event</span></div>
						<div className="traveler-selector-row">
							<div><label className="traveler-label">Travelers</label><div className="traveler-val">{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}</div></div>
							<div className="stepper-controls"><button type="button" className="stepper-btn" disabled={travelers <= 1} onClick={() => { setTravelers((current) => current - 1); resetCheckout(); }}>-</button><span className="stepper-count">{travelers}</span><button type="button" className="stepper-btn" disabled={travelers >= seatsLeft} onClick={() => { setTravelers((current) => current + 1); resetCheckout(); }}>+</button></div>
						</div>
					</div>

					<button className="reserve-cta-btn" type="button" disabled={paymentStarting || seatsLeft < 1} onClick={handleReserve}><span className="material-symbols-outlined lock-icon">lock</span><span>{paymentStarting ? 'Preparing secure payment...' : seatsLeft < 1 ? 'Sold out' : 'Reserve tour'}</span></button>
					<p className="refund-guarantee-note">A secure Stripe payment form opens before any charge is confirmed.</p>
					<div className="itemized-breakdown"><div className="breakdown-row"><span className="breakdown-label">₩{tour.tourPrice.toLocaleString()} × {travelers} traveler{travelers === 1 ? '' : 's'}</span><span className="breakdown-value">₩{totalPrice.toLocaleString()}</span></div><div className="total-price-box"><span className="total-title">Total</span><span className="total-amount">₩{totalPrice.toLocaleString()}</span></div></div>
				</div>
			</aside>
			{clientSecret ? <PropertyPaymentModal clientSecret={clientSecret} paymentAmount={totalPrice} onClose={closeCheckout} onPaymentConfirmed={handlePaymentConfirmed} /> : null}
		</>
	);
};

export default TourReservationWidget;
