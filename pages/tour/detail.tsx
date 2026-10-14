import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import TourHeader from '../../libs/components/tour/detail/TourHeader';
import TourGallery from '../../libs/components/tour/detail/TourGallery';
import TourOverview from '../../libs/components/tour/detail/TourOverview';
import TourReservationWidget from '../../libs/components/tour/detail/TourReservationWidget';
import TourComments from '../../libs/components/tour/detail/TourComments';
import SimilarTours from '../../libs/components/tour/detail/SimilarTours';
import { Tour } from '../../libs/types/tour/tour';
import { GET_TOUR } from '../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetErrorAlert } from '../../libs/sweetAlert';
import { Message } from '../../libs/enums/common.enum';
import { useI18n } from '../../libs/i18n';
import LoadingSpinner from '../../libs/components/common/LoadingSpinner';

const TourDetail: NextPage = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const tourId = router.isReady && typeof router.query.id === 'string' ? router.query.id : '';

	/** APOLLO REQUESTS **/
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	const {
		data: tourData,
		loading: tourLoading,
		refetch: refetchTour,
	} = useQuery(GET_TOUR, {
		fetchPolicy: 'network-only',
		variables: { tourId },
		skip: !tourId,
	});

	const tour: Tour = tourData?.getTour;
	const isLiked = Boolean(tour?.meLiked && tour?.meLiked[0]?.myFavorite);

	/** HANDLERS **/
	const likeHandler = async () => {
		if (!user?._id) {
			await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
			return;
		}
		try {
			await likeTargetTour({ variables: { tourId: tour._id } });
			await refetchTour();
		} catch (err: any) {
			await sweetErrorAlert(tError(err, 'common.errorOccurred'));
		}
	};

	if (!router.isReady || tourLoading) {
		return (
			<div className="tour-detail-page">
				<div className="detail-container">
					<div className="listing-loader-wrapper" style={{ minHeight: '60vh' }}>
						<LoadingSpinner size="xl" label={t('tours.detail.loading')} />
					</div>
				</div>
			</div>
		);
	}

	if (!tour) {
		return (
			<div className="tour-detail-page">
				<div className="detail-container"><div className="detail-empty-state"><h1>{t('tours.detail.tourUnavailable')}</h1><p>{t('tours.detail.notFound')}</p></div></div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{t('tours.detail.metaTitle', { tourName: tour.tourName })}</title>
				<meta
					name="description"
					content={tour.tourDesc || t('tours.detail.metaDescription')}
				/>
			</Head>

			<div className="tour-detail-page">
				<div className="detail-container">
					{/* 1 & 2. Breadcrumbs & Title Bar */}
					<TourHeader
						tour={tour}
						isLiked={isLiked}
						likeHandler={likeHandler}
					/>

					{/* 3. Asymmetric 5-Photo Gallery */}
					<TourGallery tour={tour} />

					{/* 4. Two-Column Layout (65% / 35%) */}
					<div className="detail-two-col-layout">
						{/* Left Column (About, Badges, Highlights, Itinerary, Provisions, Logistics, Organizer) */}
						<TourOverview tour={tour} />

						{/* Right Sticky Reservation Widget */}
						<TourReservationWidget tour={tour} refetchTour={refetchTour} />
					</div>

					{/* 5, 6, 7. Traveler Comments, Pagination & Leave a Comment */}
					<TourComments
						tour={tour}
						refetchTour={refetchTour}
					/>

					{/* 8. Similar Tours (4-card row) */}
					<SimilarTours
						currentTourId={tour._id}
						destinationCity={tour.tourDestinationCity}
					/>
				</div>
			</div>
		</>
	);
};

export default withLayoutBasic(TourDetail);
