import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import DestinationDetailHero from '../../libs/components/destination/detail/DestinationDetailHero';
import DestinationAbout from '../../libs/components/destination/detail/DestinationAbout';
import DestinationCities from '../../libs/components/destination/detail/DestinationCities';
import DestinationTopStays from '../../libs/components/destination/detail/DestinationTopStays';
import DestinationPopularTours from '../../libs/components/destination/detail/DestinationPopularTours';
import DestinationTravelers from '../../libs/components/destination/detail/DestinationTravelers';
import DestinationReviews from '../../libs/components/destination/detail/DestinationReviews';
import DestinationContinueExploring from '../../libs/components/destination/detail/DestinationContinueExploring';

import { Destination } from '../../libs/types/destination/destination';
import { Property } from '../../libs/types/property/property';
import { Tour } from '../../libs/types/tour/tour';
import { Member } from '../../libs/types/member/member';
import { RankingList } from '../../libs/types/ranking/ranking';
import { Direction, Message } from '../../libs/enums/common.enum';

import {
	GET_DESTINATION,
	GET_DESTINATIONS,
	GET_DESTINATION_REVIEWS,
} from '../../apollo/user/query';
import { GET_TOP_PROPERTIES, GET_TOP_TOURS, GET_TOP_TRAVELERS } from '../../apollo/ranking/query';
import {
	LIKE_TARGET_DESTINATION,
	LIKE_TARGET_PROPERTY,
	LIKE_TARGET_TOUR,
} from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetErrorAlert } from '../../libs/sweetAlert';
import { useI18n } from '../../libs/i18n';

const DestinationDetail: NextPage = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [destinationId, setDestinationId] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			return params.get('id') || '';
		}
		return '';
	});
	const [likesCount, setLikesCount] = useState<number>(0);
	const [isLiked, setIsLiked] = useState<boolean>(false);

	/** ROUTE PARAMS **/
	useEffect(() => {
		if (router.isReady) {
			const id = router.query.id as string;
			if (id && id !== destinationId) {
				setDestinationId(id);
			}
		}
	}, [router.isReady, router.query.id, destinationId]);

	/** INITIAL SEED / FALLBACK IF DIRECT VISIT TO /destination/detail **/
	const { data: initialListData } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-first',
		variables: {
			input: {
				page: 1,
				limit: 1,
				sort: 'destinationViews',
				direction: Direction.DESC,
				search: {},
			},
		},
		skip: !!destinationId,
	});

	useEffect(() => {
		if (!destinationId && initialListData?.getDestinations?.list?.[0]?._id) {
			setDestinationId(initialListData.getDestinations.list[0]._id);
		}
	}, [destinationId, initialListData]);

	/** MAIN DESTINATION QUERY **/
	const {
		data: destinationData,
		loading: destinationLoading,
		refetch: refetchDestination,
	} = useQuery(GET_DESTINATION, {
		fetchPolicy: 'network-only',
		variables: { destinationId },
		skip: !destinationId,
	});

	const destination: Destination | undefined = destinationData?.getDestination;

	useEffect(() => {
		if (destination) {
			setLikesCount(destination.destinationLikes || 0);
			setIsLiked(!!destination.meLiked?.[0]?.myFavorite);
		}
	}, [destination]);

	/** SIBLING CITIES IN SAME COUNTRY **/
	const country = destination?.destinationCountry;
	const { data: siblingCitiesData } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'destinationViews',
				direction: Direction.DESC,
				search: country ? { destinationCountry: country } : {},
			},
		},
		skip: !country,
	});
	const siblingCities: Destination[] = siblingCitiesData?.getDestinations?.list || [];

	/** TOP STAYS (PROPERTIES) **/
	const { data: propertiesData, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useQuery<{ getTopProperties?: RankingList<Property> }>(GET_TOP_PROPERTIES, { fetchPolicy: 'cache-and-network', variables: { input: { destinationId, limit: 4 } }, skip: !destinationId });
	const topStays: Property[] = propertiesData?.getTopProperties?.list || [];

	/** POPULAR TOURS **/
	const { data: toursData, loading: toursLoading, error: toursError, refetch: refetchTours } = useQuery<{ getTopTours?: RankingList<Tour> }>(GET_TOP_TOURS, { fetchPolicy: 'cache-and-network', variables: { input: { destinationId, limit: 4 } }, skip: !destinationId });
	const popularTours: Tour[] = toursData?.getTopTours?.list || [];
	const { data: travelersData, loading: travelersLoading, error: travelersError, refetch: refetchTravelers } = useQuery<{ getTopTravelers?: RankingList<Member> }>(GET_TOP_TRAVELERS, { fetchPolicy: 'cache-and-network', variables: { input: { destinationId, limit: 4 } }, skip: !destinationId });
	const topTravelers: Member[] = travelersData?.getTopTravelers?.list || [];

	/** DESTINATION REVIEWS **/
	const { data: reviewsData, refetch: refetchReviews } = useQuery(GET_DESTINATION_REVIEWS, {
		fetchPolicy: 'network-only',
		variables: {
			destinationId,
			input: { page: 1, limit: 10 },
		},
		skip: !destinationId,
	});
	const reviewsList = reviewsData?.getDestinationReviews?.list || [];
	const totalReviews = reviewsData?.getDestinationReviews?.metaCounter?.[0]?.total || 0;

	/** CONTINUE EXPLORING (OTHER DESTINATIONS) **/
	const { data: otherDestinationsData } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'destinationLikes',
				direction: Direction.DESC,
				search: {},
			},
		},
	});
	const otherDestinations: Destination[] = (
		otherDestinationsData?.getDestinations?.list || []
	).filter((d: Destination) => d._id !== destinationId);

	/** MUTATIONS **/
	const [likeTargetDestination] = useMutation(LIKE_TARGET_DESTINATION);
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	const handleLikeDestination = async (targetId: string) => {
		try {
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));

			setIsLiked(!isLiked);
			setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));

			await likeTargetDestination({
				variables: { destinationId: targetId },
			});
			await refetchDestination();
		} catch (err: any) {
			console.log('ERROR, handleLikeDestination:', err.message);
			// Roll back the optimistic toggle
			setIsLiked(isLiked);
			setLikesCount(destination?.destinationLikes || 0);
			sweetErrorAlert(tError(err));
		}
	};

	const handleLikeProperty = async (propertyId: string) => {
		try {
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));
			await likeTargetProperty({
				variables: { propertyId },
			});
			await refetchProperties();
		} catch (err: any) {
			console.log('ERROR, handleLikeProperty:', err.message);
			sweetErrorAlert(tError(err));
		}
	};

	const handleLikeTour = async (tourId: string) => {
		try {
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));
			await likeTargetTour({
				variables: { tourId },
			});
			await refetchTours();
		} catch (err: any) {
			console.log('ERROR, handleLikeTour:', err.message);
			sweetErrorAlert(tError(err));
		}
	};

	if (destinationLoading || !destination) {
		return (
			<div className="destination-detail-page-wrapper">
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '60vh',
						gap: '12px',
						fontSize: '16px',
						color: '#545c72',
					}}
				>
					<span
						className="material-symbols-outlined"
						style={{
							fontSize: '32px',
							color: '#006194',
						}}
					>
						sync
					</span>
					<span>{t('destinations.detail.loading')}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="destination-detail-page-wrapper">
			<Head>
				<title>{t('destinations.detail.metaTitle', { destinationName: destination.destinationName, destinationCountry: destination.destinationCountry })}</title>
				<meta
					name="title"
					content={t('destinations.detail.metaName', { destinationName: destination.destinationName })}
				/>
				<meta
					name="description"
					content={destination.destinationDesc || t('destinations.detail.metaDescription')}
				/>
			</Head>

			{/* 1. Hero Section */}
			<DestinationDetailHero destination={destination} />

			{/* 2. About Section */}
			<DestinationAbout
				destination={destination}
				onLike={handleLikeDestination}
				isLiked={isLiked}
				likesCount={likesCount}
				commentsCount={totalReviews || destination.destinationComments || 0}
			/>

			{/* 3. Explore Cities in Country */}
			<DestinationCities destination={destination} cities={siblingCities} />

			{/* 4. Top Stays / Hotels */}
			<DestinationTopStays
				destinationName={destination.destinationName}
				properties={topStays}
				loading={propertiesLoading}
				error={propertiesError}
				onLikeProperty={handleLikeProperty}
			/>

			{/* 5. Popular Tours & Experiences */}
			<DestinationPopularTours
				destinationName={destination.destinationName}
				tours={popularTours}
				loading={toursLoading}
				error={toursError}
				onLikeTour={handleLikeTour}
			/>

			{/* 6. Notable Travelers */}
			<DestinationTravelers destinationName={destination.destinationName} travelers={topTravelers} loading={travelersLoading} error={travelersError} onRefetch={refetchTravelers} />

			{/* 7. Traveler Reviews & Community Notes */}
			<DestinationReviews
				destinationId={destination._id}
				destinationName={destination.destinationName}
				reviews={reviewsList}
				totalReviews={totalReviews}
				averageRating={destination.destinationRating || 4.9}
				onReviewAdded={() => {
					refetchReviews();
					refetchDestination();
				}}
			/>

			{/* 8. Continue Exploring */}
			<DestinationContinueExploring destinations={otherDestinations} />
		</div>
	);
};

export default withLayoutBasic(DestinationDetail);
