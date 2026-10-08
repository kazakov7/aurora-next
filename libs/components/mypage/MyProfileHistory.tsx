import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED, GET_VISITED_TOURS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { DEFAULT_PROPERTY_IMAGE, DEFAULT_TOUR_IMAGE, getImageUrl } from '../../config';
import { Property } from '../../types/property/property';
import { Tour } from '../../types/tour/tour';

const MyProfileHistory: React.FC = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const { data, loading, error } = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 10,
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});
	const { data: tourData, loading: toursLoading, error: toursError } = useQuery(GET_VISITED_TOURS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 10 } },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const visitedProperties: Property[] = data?.getVisited?.list || [];
	const visitedTours: Tour[] = tourData?.getVisitedTours?.list || [];
	const visitedList = [
		...visitedProperties.map((property) => ({ ...property, isTour: false as const })),
		...visitedTours.map((tour) => ({ ...tour, isTour: true as const })),
	];
	const total = (data?.getVisited?.metaCounter?.[0]?.total ?? visitedProperties.length) +
		(tourData?.getVisitedTours?.metaCounter?.[0]?.total ?? visitedTours.length);

	return (
		<div>
			<div className="section-top-bar">
				<div className="title-group">
					<h2>Travel History</h2>
					<span className="counter-pill">{total} logged journeys</span>
				</div>
			</div>

			{(loading || toursLoading) && !data && !tourData ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>Loading your travel history...</p></div>
			) : error || toursError ? (
				<div className="profile-empty-state"><h3>Travel history is unavailable</h3><p>{error?.message || toursError?.message}</p></div>
			) : visitedList.length > 0 ? (
				<div className="booking-cards-stack">
					{visitedList.map((item) => {
						const title = item.isTour ? item.tourName : item.propertyName;
						const loc = item.isTour
							? item.tourDestinationCity || item.tourDepartureCity || 'Location not provided'
							: item.propertyAddress || item.propertyCity || 'Location not provided';
						const img = item.isTour
							? getImageUrl(item.tourImages?.[0], DEFAULT_TOUR_IMAGE)
							: getImageUrl(item.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE);

						return (
							<article key={`${item.isTour ? 'tour' : 'property'}-${item._id}`} className="booking-card-item" onClick={() => router.push(item.isTour ? `/tour/detail?id=${item._id}` : `/property/detail?id=${item._id}`)}>
								<div className="card-img-box">
									<img src={img} alt={title} />
									<span className="rating-badge">{item.isTour ? 'TOUR' : 'HOTEL'}</span>
								</div>
								<div className="card-middle-info">
									<h3 className="booking-title">{title}</h3>
									<p className="location-line">
										<span className="material-symbols-outlined">location_on</span>
										<span>{loc}</span>
									</p>
									<p style={{ margin: 0, fontSize: '13px', color: '#707881' }}>Recently viewed</p>
								</div>
							</article>
						);
					})}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">explore</span>
					</div>
					<h3>No travel history logged yet</h3>
					<p>Your completed bookings and visited sanctuaries will be archived here as your digital passport.</p>
				</div>
			)}
		</div>
	);
};

export default MyProfileHistory;
