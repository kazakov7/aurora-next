import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Top from "../../libs/components/Top";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { userVar } from "../../apollo/store";
import { GET_PROPERTY, GET_TOUR } from "../../apollo/user/query";
import { START_PROPERTY_PAYMENT, START_TOUR_PAYMENT } from "../../apollo/user/mutation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from "../../libs/sweetAlert";
import { DEFAULT_PROPERTY_IMAGE, DEFAULT_TOUR_IMAGE, getImageUrl } from "../../libs/config";
import useAuthSession from "../../libs/hooks/useAuthSession";
import useDeviceDetect from "../../libs/hooks/useDeviceDetect";
import { AppLocale, useI18n } from "../../libs/i18n";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
/** Stripe Elements has no Uzbek translation, so `uz` lets Stripe pick from the browser language **/
const STRIPE_LOCALES: Record<AppLocale, "en" | "ko" | "auto"> = { en: "en", ko: "ko", uz: "auto" };

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};


interface CheckoutFormProps {
  onPaymentSubmitted: () => Promise<void>;
  paymentAmount: number;
  currency: string;
}

const CheckoutForm = ({ onPaymentSubmitted, paymentAmount, currency }: CheckoutFormProps) => {
  const { t, tError, locale } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) throw new Error(tError(error, "checkout.paymentNotCompleted"));
      if (paymentIntent?.status !== 'succeeded') {
        throw new Error(t("checkout.stillProcessing"));
      }
      await onPaymentSubmitted();
    } catch (err: any) {
      sweetErrorAlert(tError(err, "checkout.paymentFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <PaymentElement />
      <button 
        type="submit" 
        disabled={!stripe || submitting}
        style={{
          width: '100%',
          marginTop: '24px',
          padding: '14px',
          backgroundColor: '#006194',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}
      >
        {submitting ? t("payment.processing") : t("payment.payAmount", { paymentAmount: paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { t, tError, locale } = useI18n();
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const authChecked = useAuthSession();
  const type = typeof router.query.type === 'string' ? router.query.type : '';
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const checkIn = typeof router.query.checkIn === 'string' ? router.query.checkIn : '';
  const checkOut = typeof router.query.checkOut === 'string' ? router.query.checkOut : '';
  const guests = typeof router.query.guests === 'string' ? router.query.guests : '1';
  const isProperty = type === 'property';
  const isTour = type === 'tour';

  const { data: propData, loading: propLoading } = useQuery(GET_PROPERTY, {
    variables: { propertyId: id },
    skip: !isProperty || !id
  });

  const { data: tourData, loading: tourLoading } = useQuery(GET_TOUR, {
    variables: { tourId: id },
    skip: !isTour || !id
  });

  const item = isProperty ? propData?.getProperty : tourData?.getTour;
  const loading = isProperty ? propLoading : tourLoading;

  const [startPropPayment] = useMutation(START_PROPERTY_PAYMENT);
  const [startTourPayment] = useMutation(START_TOUR_PAYMENT);

  const [clientSecret, setClientSecret] = useState('');
  const [initializing, setInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  // Amount/currency charged by the server (authoritative); the client estimate is only a preview
  const [serverCharge, setServerCharge] = useState<{ amount: number; currency: string } | null>(null);
  const hasValidStayDates = !isProperty || (!!checkIn && !!checkOut && new Date(checkOut).getTime() > new Date(checkIn).getTime());

  /** Checkout requires a signed-in member: send guests to login and come back here afterwards **/
  useEffect(() => {
    if (!router.isReady || !authChecked || user?._id) return;
    void router.replace({ pathname: '/account/login', query: { referrer: router.asPath } });
  }, [authChecked, router, user?._id]);
  const idempotencyKeyRef = useRef<string>('');
	const paymentInitializationRef = useRef(false);

  useEffect(() => {
		if (!item || clientSecret || initializationError || initializing || paymentInitializationRef.current || !user?._id) return;
		if (isProperty && (!checkIn || !checkOut || new Date(checkOut).getTime() <= new Date(checkIn).getTime())) return;
    const initializePayment = async () => {
			paymentInitializationRef.current = true;
      setInitializing(true);
      try {
        if (!idempotencyKeyRef.current) idempotencyKeyRef.current = generateUUID();
        const idempotencyKey = idempotencyKeyRef.current;
        if (isProperty) {
          const { data } = await startPropPayment({
            variables: {
              input: {
                propertyId: item._id,
                checkIn: new Date(`${checkIn}T00:00:00`).toISOString(),
                checkOut: new Date(`${checkOut}T00:00:00`).toISOString(),
                bookingGuests: Number(guests) || 1,
                idempotencyKey
              }
            }
          });
          if (data?.startPropertyPayment?.clientSecret) {
            const payment = data.startPropertyPayment.payment;
            if (payment?.paymentAmount) setServerCharge({ amount: payment.paymentAmount, currency: payment.paymentCurrency });
            setClientSecret(data.startPropertyPayment.clientSecret);
					} else {
						setInitializationError(t("checkout.initFailedRetry"));
          }
        } else if (isTour) {
          const { data } = await startTourPayment({
            variables: {
              input: {
                tourId: item._id,
                bookingGuests: Number(guests) || 1,
                idempotencyKey
              }
            }
          });
          if (data?.startTourPayment?.clientSecret) {
            const payment = data.startTourPayment.payment;
            if (payment?.paymentAmount) setServerCharge({ amount: payment.paymentAmount, currency: payment.paymentCurrency });
            setClientSecret(data.startTourPayment.clientSecret);
					} else {
						setInitializationError(t("checkout.initFailedRetry"));
          }
        }
      } catch (err: any) {
				const message = tError(err, "checkout.initFailed");
				setInitializationError(message);
        sweetErrorAlert(message);
      } finally {
				paymentInitializationRef.current = false;
        setInitializing(false);
      }
    };
    initializePayment();
  }, [item, user, clientSecret, initializationError, initializing, isProperty, isTour, checkIn, checkOut, guests, startPropPayment, startTourPayment]);

	const handlePaymentRetry = () => {
		paymentInitializationRef.current = false;
		setInitializationError('');
	};

  if (!router.isReady || loading) {
    return <div id={device === "mobile" ? "mobile-wrap" : "pc-wrap"} className="checkout-page-root"><Top /><main style={{paddingTop: 100, textAlign: 'center'}}>{t("common.loading")}</main></div>;
  }

  if (!item) {
    return <div id={device === "mobile" ? "mobile-wrap" : "pc-wrap"} className="checkout-page-root"><Top /><main style={{paddingTop: 100, textAlign: 'center'}}>{t("checkout.itemNotFound")}</main></div>;
  }

  const getNights = () => {
    if (!isProperty || !hasValidStayDates) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const difference = end.getTime() - start.getTime();
    return Math.round(difference / 86_400_000);
  };

  const nights = isProperty ? getNights() : 0;
  const price = isProperty ? item.pricePerNight : item.tourPrice;
  const currency = serverCharge?.currency || (isProperty ? item.currency : item.tourCurrency);
  const totalAmount = serverCharge?.amount ?? (isProperty ? price * nights : price * Number(guests));

  const handlePaymentSubmitted = async () => {
    // Stripe's client response is not the booking authority. The webhook confirms it server-side.
    setPaymentSubmitted(true);
    await sweetTopSmallSuccessAlert(t("checkout.paymentReceivedToast"), 2000);
  };

  return (
    <div id={device === "mobile" ? "mobile-wrap" : "pc-wrap"} className="checkout-page-root">
      <Head>
        <title>{t("checkout.metaTitle")}</title>
      </Head>

      <Top />

      <main className="checkout-main">
        <div className="checkout-container">
          
          {paymentSubmitted ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#006194', marginBottom: '16px' }}>check_circle</span>
              <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>{t("checkout.paymentReceived")}</h1>
              <p style={{ color: '#545c72', marginBottom: '32px' }}>{t("checkout.confirmingText")}</p>
              <button 
                onClick={() => router.push('/mypage?category=bookings')}
                style={{ padding: '12px 24px', backgroundColor: '#006194', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                {t("checkout.viewMyBookings")}
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-top-context">
                <div className="context-text">
                  <h1>{t("checkout.completeYourBooking")}</h1>
                  <p>{t("checkout.reviewText")}</p>
                </div>
              </div>

              <div className="step-content two-columns" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div className="left-column" style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* GUEST DETAILS */}
                  <section className="booking-section">
                    <div className="section-header">
                      <span className="material-symbols-outlined icon">badge</span>
                      <h2>{t("checkout.guestInformation")}</h2>
                    </div>
                    <div className="guest-profile">
                      <div className="guest-info">
                        <div className="guest-name">{user?.memberFullName || user?.memberNick}</div>
                        <div className="guest-contacts">
                          <span>{user?.memberPhone}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* PAYMENT SECTION */}
                  <section className="booking-section">
                    <div className="section-header">
                      <span className="material-symbols-outlined icon">lock</span>
                      <h2>{t("payment.securePayment")}</h2>
                    </div>
                    <p style={{ fontSize: '13px', color: '#545c72' }}>{t("checkout.secureNotice")}</p>
                    
                    {!stripePromise ? (
                      <p style={{ color: 'red' }}>{t("checkout.stripeNotConfigured")}</p>
									) : !hasValidStayDates ? (
										<div>
											<p style={{ color: '#b42318' }}>{t("checkout.selectValidDates")}</p>
											<button type="button" onClick={() => router.push({ pathname: '/property/detail', query: { id } })} style={{ padding: '10px 16px', backgroundColor: '#006194', color: '#fff', border: 0, borderRadius: '8px', cursor: 'pointer' }}>
												{t("checkout.backToProperty")}
											</button>
										</div>
									) : initializationError ? (
										<div>
											<p style={{ color: '#b42318' }}>{initializationError}</p>
											<button type="button" onClick={handlePaymentRetry} style={{ padding: '10px 16px', backgroundColor: '#006194', color: '#fff', border: 0, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
												{t("common.retry")}
											</button>
										</div>
                    ) : !clientSecret ? (
                      <p>{t("checkout.initializingSecurePayment")}</p>
                    ) : (
                      <Elements stripe={stripePromise} options={{ clientSecret, locale: STRIPE_LOCALES[locale] }}>
                        <CheckoutForm 
                          onPaymentSubmitted={handlePaymentSubmitted} 
                          paymentAmount={totalAmount}
                          currency={currency}
                        />
                      </Elements>
                    )}
                  </section>
                </div>

                {/* RIGHT COLUMN - SUMMARY */}
                <div className="right-column" style={{ flex: '1 1 350px' }}>
                  <aside className="summary-card" style={{ position: 'sticky', top: '90px' }}>
                    <div className="summary-header">
                      <h2>{t("payment.priceSummary")}</h2>
                      <span>{currency}</span>
                    </div>
                    <div className="prop-micro">
                      <img
                        src={getImageUrl(isProperty ? item.propertyImages?.[0] : item.tourImages?.[0], isProperty ? DEFAULT_PROPERTY_IMAGE : DEFAULT_TOUR_IMAGE)}
                        alt={t("checkout.thumbnail")}
                      />
                      <div className="micro-info">
                        <p className="title">{isProperty ? item.propertyName : item.tourName}</p>
                        <p className="desc">{isProperty ? t("common.nightsCount", { count: nights }) : t("common.tour")} • {t("common.guestCountLower", { count: Number(guests) })}</p>
                      </div>
                    </div>
                    <div className="calc-row">
                      <span>${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {isProperty ? t("common.nightsCount", { count: nights }) : t("common.travelerCountLower", { count: Number(guests) })}</span>
                      <strong>${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="total-module">
                      <div className="total-header">
                        <span>{t("payment.totalDue")}</span>
                        <strong>${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <footer className="checkout-footer">
        <div className="footer-container">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
