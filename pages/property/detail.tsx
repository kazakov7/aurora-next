import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyHeader from '../../libs/components/property/detail/PropertyHeader';
import PropertyGallery from '../../libs/components/property/detail/PropertyGallery';
import PropertyOverview from '../../libs/components/property/detail/PropertyOverview';
import PropertyReservationWidget from '../../libs/components/property/detail/PropertyReservationWidget';
import PropertyComments from '../../libs/components/property/detail/PropertyComments';
import SimilarProperties from '../../libs/components/property/detail/SimilarProperties';
import { Property } from '../../libs/types/property/property';
import { GET_PROPERTY } from '../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetErrorAlert } from '../../libs/sweetAlert';
import { Message } from '../../libs/enums/common.enum';
import { useI18n } from '../../libs/i18n';
import LoadingSpinner from '../../libs/components/common/LoadingSpinner';

const PropertyDetail: NextPage = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const propertyId = router.isReady && typeof router.query.id === 'string' ? router.query.id : '';

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		data: propertyData,
		loading: propertyLoading,
		refetch: refetchProperty,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: { propertyId },
		skip: !propertyId,
	});

	const property: Property = propertyData?.getProperty;
	const isLiked = Boolean(property?.meLiked && property?.meLiked[0]?.myFavorite);

	/** HANDLERS **/
	const likeHandler = async () => {
		if (!user?._id) {
			await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
			return;
		}
		try {
			await likeTargetProperty({ variables: { propertyId: property._id } });
			await refetchProperty();
		} catch (err: any) {
			await sweetErrorAlert(tError(err, 'common.errorOccurred'));
		}
	};

	if (!router.isReady || propertyLoading) {
		return (
			<div className="property-detail-page">
				<div className="detail-container">
					<div className="listing-loader-wrapper" style={{ minHeight: '60vh' }}>
						<LoadingSpinner size="xl" label={t('hotels.detail.loading')} />
					</div>
				</div>
			</div>
		);
	}

	if (!property) {
		return (
			<div className="property-detail-page">
				<div className="detail-container">
					<div className="detail-empty-state">
						<h1>{t('hotels.detail.hotelUnavailable')}</h1>
						<p>{t('hotels.detail.notFound')}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{t('hotels.detail.metaTitle', { propertyName: property.propertyName })}</title>
				<meta
					name="description"
					content={property.propertyDesc || t('hotels.detail.metaDescription')}
				/>
			</Head>

			<div className="property-detail-page">
				<div className="detail-container">
					{/* 1 & 2. Breadcrumbs & Title Bar */}
					<PropertyHeader
						property={property}
						isLiked={isLiked}
						likeHandler={likeHandler}
					/>

					{/* 3. Asymmetric 5-Photo Gallery */}
					<PropertyGallery property={property} />

					{/* 4. Two-Column Layout (65% / 35%) */}
					<div className="detail-two-col-layout">
						{/* Left Column (Overview, Description, Highlights, Amenities, Location, Host) */}
						<PropertyOverview property={property} />

						{/* Right Sticky Reservation Widget */}
						<PropertyReservationWidget property={property} refetchProperty={refetchProperty} />
					</div>

					{/* 5, 6, 7. Guest Comments, Pagination & Leave a Comment */}
					<PropertyComments
						property={property}
						refetchProperty={refetchProperty}
					/>

					{/* 8. Similar Hotels (4-card row) */}
					<SimilarProperties
						currentPropertyId={property._id}
						city={property.propertyCity}
					/>
				</div>
			</div>
		</>
	);
};

export default withLayoutBasic(PropertyDetail);
