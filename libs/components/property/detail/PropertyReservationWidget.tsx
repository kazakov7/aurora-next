import React, { useState } from 'react';
import { Property } from '../../../types/property/property';
import { sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface PropertyReservationWidgetProps {
	property: Property;
}

const PropertyReservationWidget = ({ property }: PropertyReservationWidgetProps) => {
	const [checkIn, setCheckIn] = useState<string>('2026-10-14');
	const [checkOut, setCheckOut] = useState<string>('2026-10-19');
	const [guestCount, setGuestCount] = useState<number>(Math.min(4, property?.maxGuests || 4));
	const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

	const pricePerNight = property?.pricePerNight || 230000;
	const nights = 5;
	const subtotal = pricePerNight * nights;
	const serviceFee = Math.round(subtotal * 0.05);
	const total = subtotal + serviceFee;

	const ratingVal = property?.propertyRating ? property.propertyRating.toFixed(2) : '4.98';
	const reviewsCount = property?.propertyReviews || 248;

	const handleReserve = () => {
		sweetTopSmallSuccessAlert(`Reservation request submitted for ${property?.propertyName || 'Sanctuary'}!`);
	};

	const maxGuestsAllowed = property?.maxGuests || 8;

	return (
		<aside className="reservation-sticky-widget">
			<div className="widget-card">
				{/* Price Header */}
				<div className="price-header-row">
					<div className="price-tag-group">
						<span className="price-value">₩{pricePerNight.toLocaleString()}</span>
						<span className="price-unit">/ night</span>
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

				{/* Date & Guest Picker Block */}
				<div className="picker-block">
					<div className="date-pickers-row">
						<div className="date-picker-box">
							<label className="picker-label">Check-In</label>
							<input
								type="date"
								className="picker-input"
								value={checkIn}
								onChange={(e) => setCheckIn(e.target.value)}
							/>
						</div>
						<div className="date-picker-box">
							<label className="picker-label">Check-Out</label>
							<input
								type="date"
								className="picker-input"
								value={checkOut}
								onChange={(e) => setCheckOut(e.target.value)}
							/>
						</div>
					</div>

					{/* Guests Picker */}
					<div className="guest-picker-wrapper">
						<div
							className="guest-picker-box"
							onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
						>
							<div>
								<label className="picker-label">Guests</label>
								<div className="picker-val">
									{guestCount} Guests ({Math.ceil(guestCount / 2)} Suites)
								</div>
							</div>
							<span className="material-symbols-outlined chevron">
								{isGuestDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
							</span>
						</div>

						{isGuestDropdownOpen && (
							<div className="guest-dropdown-menu">
								{Array.from({ length: maxGuestsAllowed }, (_, i) => i + 1).map((num) => (
									<button
										key={num}
										type="button"
										className={`guest-menu-item ${guestCount === num ? 'selected' : ''}`}
										onClick={() => {
											setGuestCount(num);
											setIsGuestDropdownOpen(false);
										}}
									>
										<span>{num} {num === 1 ? 'Guest' : 'Guests'}</span>
										{guestCount === num && (
											<span className="material-symbols-outlined check-icon">check</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* CTA Button */}
				<button className="reserve-cta-btn" type="button" onClick={handleReserve}>
					<span className="material-symbols-outlined lock-icon">lock</span>
					<span>Reserve Sanctuary</span>
				</button>
				<p className="no-charge-note">You will not be charged yet.</p>

				{/* Itemized Breakdown in KRW */}
				<div className="itemized-breakdown">
					<div className="breakdown-row">
						<span className="breakdown-label">
							₩{pricePerNight.toLocaleString()} × {nights} nights
						</span>
						<span className="breakdown-value">₩{subtotal.toLocaleString()}</span>
					</div>
					<div className="breakdown-row">
						<span className="breakdown-label">Service & staff gratuity</span>
						<span className="breakdown-value">₩{serviceFee.toLocaleString()}</span>
					</div>
					<div className="breakdown-row">
						<span className="breakdown-label">AURA White-Glove Concierge</span>
						<span className="breakdown-value free-tag">Included</span>
					</div>
					<div className="breakdown-divider"></div>
					<div className="breakdown-row total-row">
						<span className="total-label">Total before taxes</span>
						<span className="total-value">₩{total.toLocaleString()}</span>
					</div>
				</div>

				{/* Guarantee Badge */}
				<div className="guarantee-box">
					<span className="material-symbols-outlined shield-icon">verified_user</span>
					<div className="guarantee-text">
						<strong>AURA Escrow Guarantee</strong>
						<p>Funds securely held until 24h post-arrival</p>
					</div>
				</div>

				{/* Help Widget */}
				<div className="help-box">
					<span className="help-label">Questions regarding transfers or arrangements?</span>
					<button
						className="inquire-link"
						type="button"
						onClick={() => sweetTopSmallSuccessAlert('Concierge messenger connected!')}
					>
						Inquire with Concierge
					</button>
				</div>
			</div>
		</aside>
	);
};

export default PropertyReservationWidget;
