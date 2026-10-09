import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { DEFAULT_PROPERTY_IMAGE, getImageUrl } from '../../config';
import { Property } from '../../types/property/property';

const MyProfileHistory: React.FC = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const { data, loading, error } = useQuery(GET_VISITED, {
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

	const visitedProperties: Property[] = data?.getVisited?.list || [];
	const total = data?.getVisited?.metaCounter?.[0]?.total ?? visitedProperties.length;

	return (
		<div>
			<div className="section-top-bar">
				<div className="title-group">
					<h2>Visited Hotels</h2>
					<span className="counter-pill">{total} hotels</span>
				</div>
			</div>

			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>Loading your visited hotels...</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>Hotels history is unavailable</h3><p>{error?.message}</p></div>
			) : visitedProperties.length > 0 ? (
				<div className="booking-cards-stack">
					{visitedProperties.map((item) => {
						const title = item.propertyName;
						const loc = item.propertyAddress || item.propertyCity || 'Location not provided';
						const img = getImageUrl(item.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE);

						return (
							<article key={`property-${item._id}`} className="booking-card-item" onClick={() => router.push(`/property/detail?id=${item._id}`)}>
								<div className="card-img-box">
									<img src={img} alt={title} />
									<span className="rating-badge">HOTEL</span>
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
						<span className="material-symbols-outlined">hotel</span>
					</div>
					<h3>No hotels visited yet</h3>
					<p>Your viewed hotels will be saved here for quick reference.</p>
				</div>
			)}
		</div>
	);
};

export default MyProfileHistory;
