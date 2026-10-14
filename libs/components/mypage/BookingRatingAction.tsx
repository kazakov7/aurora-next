import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_RATING } from '../../../apollo/user/query';
import { BookingCategory, BookingStatus } from '../../enums/booking.enum';
import { ReviewGroup } from '../../enums/review.enum';
import { Booking } from '../../types/booking/booking';
import { useI18n } from '../../i18n';

interface BookingRatingActionProps {
	booking: Booking;
	onRate: (booking: Booking) => void;
}

const RATING_VALUES = [1, 2, 3, 4, 5];

const BookingRatingAction = ({ booking, onRate }: BookingRatingActionProps) => {
	const { t } = useI18n();
	const canLoadRating = booking.bookingStatus === BookingStatus.COMPLETED && Boolean(booking.bookingRefId);
	const reviewGroup = booking.bookingCategory === BookingCategory.TOUR ? ReviewGroup.TOUR : ReviewGroup.PROPERTY;

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_MY_RATING, {
		fetchPolicy: 'network-only',
		variables: { reviewGroup, reviewRefId: booking.bookingRefId },
		skip: !canLoadRating,
	});

	if (!canLoadRating || loading) return null;

	const rating = data?.getMyRating?.reviewRating;
	if (typeof rating === 'number') {
		return (
			<span className="my-rating" aria-label={t('profile.bookings.yourRatingValue', { rating })}>
				<span className="my-rating-label">{t('profile.bookings.yourRating')}</span>
				{RATING_VALUES.map((value) => (
					<span
						key={value}
						className={`material-symbols-outlined ${value <= rating ? 'filled' : ''}`}
						aria-hidden="true"
					>
						star
					</span>
				))}
			</span>
		);
	}

	return (
		<button type="button" className="rate-btn" onClick={() => onRate(booking)}>
			<span className="material-symbols-outlined">star</span>
			{t('profile.bookings.rate')}
		</button>
	);
};

export default BookingRatingAction;
