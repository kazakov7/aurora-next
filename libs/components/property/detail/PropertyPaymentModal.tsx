import React, { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { AppLocale, useI18n } from '../../../i18n';
import { motion } from 'framer-motion';
import { appleEase } from '../../../motion/transitions';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
/** Stripe Elements has no Uzbek translation, so `uz` lets Stripe pick from the browser language **/
const STRIPE_LOCALES: Record<AppLocale, 'en' | 'ko' | 'auto'> = { en: 'en', ko: 'ko', uz: 'auto' };

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
	const { t, tError } = useI18n();
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

			if (error) throw new Error(tError(error, 'hotels.paymentModal.paymentFailed'));
			if (paymentIntent?.status !== 'succeeded') {
				throw new Error(t('hotels.paymentModal.stillProcessing'));
			}

			await onPaymentConfirmed();
			await sweetTopSmallSuccessAlert(t('hotels.paymentModal.paymentConfirmed'), 1800);
			onClose();
		} catch (error: unknown) {
			const message = tError(error, 'hotels.paymentModal.paymentFailed');
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
					{t('common.cancel')}
				</button>
				<button type="submit" className="payment-confirm-btn" disabled={!stripe || submitting}>
					{submitting ? t('hotels.paymentModal.confirming') : t('hotels.paymentModal.pay', { paymentAmount: paymentAmount.toLocaleString('en-US') })}
				</button>
			</div>
		</form>
	);
};

const PropertyPaymentModal = ({ clientSecret, paymentAmount, onClose, onPaymentConfirmed }: PropertyPaymentModalProps) => {
	const { t, locale } = useI18n();
	const [submitting, setSubmitting] = useState(false);

	if (!stripePromise) return null;

	return (
		<div className="property-payment-modal" role="dialog" aria-modal="true" aria-label={t('hotels.paymentModal.securePayment')}>
			<motion.div
				className="payment-modal-backdrop"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.25, ease: appleEase }}
				onClick={!submitting ? onClose : undefined}
			/>
			<motion.div
				className="payment-modal-content"
				initial={{ opacity: 0, scale: 0.95, y: 16 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.97, y: 8 }}
				transition={{ duration: 0.28, ease: appleEase }}
			>
				<div className="payment-modal-heading">
					<div>
						<span className="payment-modal-eyebrow">{t('hotels.paymentModal.secureStripeCheckout')}</span>
						<h2>{t('hotels.paymentModal.completeYourReservation')}</h2>
					</div>
					<button type="button" className="payment-close-btn" aria-label={t('hotels.paymentModal.closePayment')} disabled={submitting} onClick={onClose}>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>
				<Elements stripe={stripePromise} options={{ clientSecret, locale: STRIPE_LOCALES[locale] }}>
					<PropertyPaymentForm
						paymentAmount={paymentAmount}
						onClose={onClose}
						onPaymentConfirmed={onPaymentConfirmed}
						onSubmittingChange={setSubmitting}
					/>
				</Elements>
			</motion.div>
		</div>
	);
};

export default PropertyPaymentModal;
