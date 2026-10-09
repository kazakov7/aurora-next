import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED_TOURS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { DEFAULT_TOUR_IMAGE, getImageUrl } from '../../config';
import { Tour } from '../../types/tour/tour';

const MyProfileVisitedTours: React.FC = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const { data, loading, error } = useQuery(GET_VISITED_TOURS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 20,
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const visitedTours: Tour[] = data?.getVisitedTours?.list || [];
	const total = data?.getVisitedTours?.metaCounter?.[0]?.total ?? visitedTours.length;

	return (
		<div>
			<div className="section-top-bar">
				<div className="title-group">
					<h2>Visited Tours</h2>
					<span className="counter-pill">{total} tours</span>
				</div>
			</div>

			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>Loading your visited tours...</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>Tours history is unavailable</h3><p>{error?.message}</p></div>
			) : visitedTours.length > 0 ? (
				<div className="booking-cards-stack">
					{visitedTours.map((item) => {
						const title = item.tourName;
						const loc = item.tourDestinationCity || item.tourDepartureCity || 'Location not provided';
						const img = getImageUrl(item.tourImages?.[0], DEFAULT_TOUR_IMAGE);

						return (
							<article key={`tour-${item._id}`} className="booking-card-item" onClick={() => router.push(`/tour/detail?id=${item._id}`)}>
								<div className="card-img-box">
									<img src={img} alt={title} />
									<span className="rating-badge">TOUR</span>
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
					<h3>No tours visited yet</h3>
					<p>Your viewed tours and expeditions will be saved here.</p>
				</div>
			)}
		</div>
	);
};

export default MyProfileVisitedTours;
