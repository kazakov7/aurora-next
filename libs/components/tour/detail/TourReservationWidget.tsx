import React, { useState } from 'react';
import Link from 'next/link';
import { Tour } from '../../../types/tour/tour';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface TourReservationWidgetProps {
	tour: Tour;
}

const TourReservationWidget = ({ tour }: TourReservationWidgetProps) => {
	const [travelers, setTravelers] = useState<number>(2);

	const tourPrice = tour?.tourPrice || 2450000;
	const originalPrice = Math.round(tourPrice * 1.12);

	const totalCapacity = tour?.tourCapacity || 14;
	const reserved = tour?.tourReservedSeats || 0;
	const seatsLeft = Math.max(1, totalCapacity - reserved);

	const ratingVal = tour?.tourRating ? tour.tourRating.toFixed(2) : '4.96';
	const reviewsCount = tour?.tourReviews || 184;

	// Format dates
	const formatDate = (dateVal: any, fallback: string) => {
		if (!dateVal) return fallback;
		const d = new Date(Number(dateVal) || dateVal);
		if (isNaN(d.getTime())) return fallback;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	};

	const startDateStr = formatDate(tour?.tourStartDate, 'Oct 12, 2026');
	const endDateStr = formatDate(tour?.tourEndDate, 'Oct 18, 2026');

	// Calculate breakdown
	const subtotal = tourPrice * travelers;
	const guideFeePerPerson = 120000;
	const guideTotal = guideFeePerPerson * travelers;
	const taxFeePerPerson = 55000;
	const taxTotal = taxFeePerPerson * travelers;
	const totalPrice = subtotal + guideTotal + taxTotal;

	const handleIncrement = () => {
		if (travelers < seatsLeft) {
			setTravelers(travelers + 1);
		}
	};

	const handleDecrement = () => {
		if (travelers > 1) {
			setTravelers(travelers - 1);
		}
	};

	const handleReserve = () => {
		sweetTopSmallSuccessAlert(`Reservation request submitted for ${travelers} traveler(s)!`);
	};

	return (
		<aside className="tour-reservation-widget">
			<div className="widget-card">
				{/* Price Header in KRW */}
				<div className="price-header-row">
					<div className="price-tags-group">
						<span className="price-original">₩{originalPrice.toLocaleString()}</span>
						<span className="price-current">₩{tourPrice.toLocaleString()}</span>
						<span className="price-unit">/ person</span>
					</div>
					<div className="rating-badge-inline">
						<span
							className="material-symbols-outlined star-icon"
							style={{ fontVariationSettings: "'FILL' 1" }}
						>
							star
						</span>
						<span className="score">{ratingVal}</span>
						<span className="count">({reviewsCount})</span>
					</div>
				</div>

				{/* Scheduled Tour Window Card */}
				<div className="tour-window-block">
					<div className="window-top-labels">
						<span className="window-title">Tour Departure Window</span>
						<span className="seats-alert-badge">Only {seatsLeft} seats left at this tier</span>
					</div>

					<div className="window-date-card">
						<div>
							<div className="window-dates">
								{startDateStr} — {endDateStr}
							</div>
							<div className="window-sub">7 Days / 6 Nights · Guaranteed Departure</div>
						</div>
						<span className="material-symbols-outlined verified-icon">verified</span>
					</div>

					{/* Traveler Selector with +/- */}
					<div className="traveler-selector-row">
						<div>
							<label className="traveler-label">Travelers</label>
							<div className="traveler-val">
								{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
							</div>
						</div>
						<div className="stepper-controls">
							<button
								type="button"
								className="stepper-btn"
								onClick={handleDecrement}
								disabled={travelers <= 1}
							>
								-
							</button>
							<span className="stepper-count">{travelers}</span>
							<button
								type="button"
								className="stepper-btn"
								onClick={handleIncrement}
								disabled={travelers >= seatsLeft}
							>
								+
							</button>
						</div>
					</div>
				</div>

				{/* CTA Button */}
				<button className="reserve-cta-btn" type="button" onClick={handleReserve}>
					<span className="material-symbols-outlined lock-icon">lock</span>
					<span>Reserve Tour</span>
				</button>
				<p className="refund-guarantee-note">
					Instant confirmation upon deposit. 100% refundable up to 30 days before departure.
				</p>

				{/* Itemized Breakdown in KRW */}
				<div className="itemized-breakdown">
					<div className="breakdown-row">
						<span className="breakdown-label">
							₩{tourPrice.toLocaleString()} × {travelers} Travelers
						</span>
						<span className="breakdown-value">₩{subtotal.toLocaleString()}</span>
					</div>
					<div className="breakdown-row">
						<span className="breakdown-label">1st Class Swiss Rail Surcharge</span>
						<span className="breakdown-value free-tag">Included</span>
					</div>
					<div className="breakdown-row">
						<span className="breakdown-label">Certified Alpine Guide &amp; Gratuity</span>
						<span className="breakdown-value">₩{guideTotal.toLocaleString()}</span>
					</div>
					<div className="breakdown-row">
						<span className="breakdown-label">Swiss Cantonal Tourism &amp; Eco Tax</span>
						<span className="breakdown-value">₩{taxTotal.toLocaleString()}</span>
					</div>

					{/* Total Price Box */}
					<div className="total-price-box">
						<span className="total-title">Total Price</span>
						<span className="total-amount">₩{totalPrice.toLocaleString()}</span>
					</div>
				</div>

				{/* Guarantee Badge */}
				<div className="escrow-guarantee-box">
					<span className="material-symbols-outlined shield-icon">shield</span>
					<div className="guarantee-text">
						<strong>AURA Escrow Guarantee</strong>
						<p>Funds are secured in a Swiss fiduciary vault until tour commences.</p>
					</div>
				</div>
			</div>

			{/* Help Widget */}
			<div className="flight-help-card">
				<div className="help-left">
					<span className="material-symbols-outlined agent-icon">support_agent</span>
					<span className="help-text">Custom flight inquiries from Seoul?</span>
				</div>
				<Link href="/cs" className="inquire-link">
					Inquire
				</Link>
			</div>
		</aside>
	);
};

export default TourReservationWidget;
