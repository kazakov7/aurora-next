import React, { useEffect, useState } from 'react';
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
import { GET_PROPERTY, GET_PROPERTIES } from '../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Message } from '../../libs/enums/common.enum';

const PropertyDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [propertyId, setPropertyId] = useState<string>('');

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.isReady) {
			const id = router.query.id as string;
			if (id) {
				setPropertyId(id);
			}
		}
	}, [router.isReady, router.query.id]);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	// If no ID is provided in query, fetch first property from list so direct visits work gracefully
	const { data: initialListData } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: 1, search: {} } },
		skip: !!propertyId,
	});

	useEffect(() => {
		if (!propertyId && initialListData?.getProperties?.list?.[0]?._id) {
			setPropertyId(initialListData.getProperties.list[0]._id);
		}
	}, [propertyId, initialListData]);

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
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		try {
			await likeTargetProperty({ variables: { propertyId: property._id } });
			await sweetTopSmallSuccessAlert(isLiked ? 'Removed from favorites' : 'Saved to favorites');
			await refetchProperty();
		} catch (err: any) {
			await sweetErrorAlert(err.message || 'Error occurred');
		}
	};

	if (propertyLoading || !property) {
		return (
			<div className="property-detail-page">
				<div className="detail-container">
					<div
						style={{
							minHeight: '60vh',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '12px',
							color: '#545c72',
							fontSize: '16px',
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{
								fontSize: '32px',
								color: '#006194',
								animation: 'spin 1s linear infinite',
							}}
						>
							sync
						</span>
						<span>Loading sanctuary details...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{property.propertyName} | AURA Luxury Sanctuary</title>
				<meta
					name="description"
					content={property.propertyDesc || 'Curated luxury architectural sanctuary by AURA.'}
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
						<PropertyReservationWidget property={property} />
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
