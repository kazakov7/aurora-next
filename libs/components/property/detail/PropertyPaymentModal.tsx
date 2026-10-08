import React, { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PropertyPaymentModalProps {
	clientSecret: string;
	paymentAmount: number;
	onClose: () => void;
	onPaymentConfirmed: () => Promise<void>;
}

interface PropertyPaymentFormProps {
	paymentAmount: number;
	onClose: () => void;
	onPaymentConfirmed: () => Promise<void>;
	onSubmittingChange: (submitting: boolean) => void;
}

export const isStripePaymentConfigured = Boolean(stripePublishableKey);

const PropertyPaymentForm = ({ paymentAmount, onClose, onPaymentConfirmed, onSubmittingChange }: PropertyPaymentFormProps) => {
	const stripe = useStripe();
	const elements = useElements();
	const [submitting, setSubmitting] = useState(false);

	/** HANDLERS **/
	const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!stripe || !elements || submitting) return;

		setSubmitting(true);
		onSubmittingChange(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				redirect: 'if_required',
			});

			if (error) throw new Error(error.message || 'Payment could not be completed.');
			if (paymentIntent?.status !== 'succeeded') {
				throw new Error('Payment is still processing. Please check your bookings shortly.');
			}

			await onPaymentConfirmed();
			await sweetTopSmallSuccessAlert('Payment confirmed. Your booking is being finalized.', 1800);
			onClose();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Payment could not be completed.';
			await sweetErrorAlert(message);
		} finally {
			setSubmitting(false);
			onSubmittingChange(false);
		}
	};

	return (
		<form className="property-payment-form" onSubmit={handlePayment}>
			<PaymentElement />
			<div className="payment-modal-actions">
				<button type="button" className="payment-cancel-btn" disabled={submitting} onClick={onClose}>
					Cancel
				</button>
				<button type="submit" className="payment-confirm-btn" disabled={!stripe || submitting}>
					{submitting ? 'Confirming...' : `Pay ₩${paymentAmount.toLocaleString()}`}
				</button>
			</div>
		</form>
	);
};

const PropertyPaymentModal = ({ clientSecret, paymentAmount, onClose, onPaymentConfirmed }: PropertyPaymentModalProps) => {
	const [submitting, setSubmitting] = useState(false);

	if (!stripePromise) return null;

	return (
		<div className="property-payment-modal" role="dialog" aria-modal="true" aria-label="Secure payment">
			<div className="payment-modal-backdrop" />
			<div className="payment-modal-content">
				<div className="payment-modal-heading">
					<div>
						<span className="payment-modal-eyebrow">Secure Stripe checkout</span>
						<h2>Complete your reservation</h2>
					</div>
					<button type="button" className="payment-close-btn" aria-label="Close payment" disabled={submitting} onClick={onClose}>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>
				<Elements stripe={stripePromise} options={{ clientSecret }}>
					<PropertyPaymentForm
						paymentAmount={paymentAmount}
						onClose={onClose}
						onPaymentConfirmed={onPaymentConfirmed}
						onSubmittingChange={setSubmitting}
					/>
				</Elements>
			</div>
		</div>
	);
};

export default PropertyPaymentModal;
