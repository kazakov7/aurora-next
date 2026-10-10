import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { START_TOUR_PAYMENT } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Message } from '../../../enums/common.enum';
import { Tour } from '../../../types/tour/tour';
import { sweetErrorAlert } from '../../../sweetAlert';
import { useI18n } from '../../../i18n';
import { motion } from 'framer-motion';
import { appleEase } from '../../../motion/transitions';

interface TourReservationWidgetProps {
	tour: Tour;
	refetchTour: () => Promise<unknown>;
}

interface StartTourPaymentResponse {
	startTourPayment?: { clientSecret?: string };
}

const TourReservationWidget = ({ tour, refetchTour }: TourReservationWidgetProps) => {
	const { t, formatDate } = useI18n();
	const router = useRouter();
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
			await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
			return;
		}
		if (!tour._id || seatsLeft < 1 || travelers < 1 || travelers > seatsLeft) {
			await sweetErrorAlert(t('tours.reservation.notEnoughSeats'));
			return;
		}
		try {
			await router.push({ pathname: '/checkout', query: { type: 'tour', id: tour._id, guests: travelers } });
		} catch (error) {
			await sweetErrorAlert(t('tours.reservation.checkoutFailed'));
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
						<div className="price-tags-group"><span className="price-current">${tour.tourPrice.toLocaleString('en-US')}</span><span className="price-unit">{t('tours.reservation.perPerson')}</span></div>
						<div className="rating-badge-inline"><span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span><span className="score">{rating}</span><span className="count">({reviews})</span></div>
					</div>

					<div className="tour-window-block">
						<div className="window-top-labels"><span className="window-title">{t('tours.reservation.tourDates')}</span><span className="seats-alert-badge">{t('tours.reservation.seatsAvailable', { count: seatsLeft })}</span></div>
						<div className="window-date-card"><div><div className="window-dates">{formatDate(tour.tourStartDate) || t('common.dateUnavailable')} — {formatDate(tour.tourEndDate) || t('common.dateUnavailable')}</div><div className="window-sub">{t('tours.reservation.seatsConfirmedNote')}</div></div><span className="material-symbols-outlined verified-icon">event</span></div>
						<div className="traveler-selector-row">
							<div><label className="traveler-label">{t('tours.reservation.travelers')}</label><div className="traveler-val">{travelers} {travelers === 1 ? t('common.travelerLabel') : t('tours.reservation.travelers')}</div></div>
							<div className="stepper-controls"><button type="button" className="stepper-btn" disabled={travelers <= 1} onClick={() => { setTravelers((current) => current - 1); resetCheckout(); }}>-</button><span className="stepper-count">{travelers}</span><button type="button" className="stepper-btn" disabled={travelers >= seatsLeft} onClick={() => { setTravelers((current) => current + 1); resetCheckout(); }}>+</button></div>
						</div>
					</div>

					<motion.button
						className="reserve-cta-btn"
						type="button"
						disabled={paymentStarting || seatsLeft < 1}
						onClick={handleReserve}
						whileHover={{ scale: 1.015 }}
						whileTap={{ scale: 0.985 }}
						transition={{ duration: 0.18, ease: appleEase }}
					>
						<span className="material-symbols-outlined lock-icon">lock</span>
						<span>{paymentStarting ? t('tours.reservation.preparingSecurePayment') : seatsLeft < 1 ? t('tours.reservation.soldOut') : t('tours.reservation.reserveTour')}</span>
					</motion.button>
					<p className="refund-guarantee-note">{t('tours.reservation.stripeNote')}</p>
					<div className="itemized-breakdown"><div className="breakdown-row"><span className="breakdown-label">{t('tours.reservation.priceBreakdown', { count: travelers, price: tour.tourPrice.toLocaleString('en-US') })}</span><span className="breakdown-value">${totalPrice.toLocaleString('en-US')}</span></div><div className="total-price-box"><span className="total-title">{t('common.total')}</span><span className="total-amount">${totalPrice.toLocaleString('en-US')}</span></div></div>
				</div>
			</aside>
			
		</>
	);
};

export default TourReservationWidget;
