import React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';

const MyProfileHistory: React.FC = () => {
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_VISITED, {
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

	const visitedList = data?.getVisited?.list || [];
	const total = data?.getVisited?.metaCounter?.[0]?.total || visitedList.length;

	return (
		<div>
			<div className="section-top-bar">
				<div className="title-group">
					<h2>Travel History</h2>
					<span className="counter-pill">{total} logged journeys</span>
				</div>
			</div>

			{visitedList.length > 0 ? (
				<div className="booking-cards-stack">
					{visitedList.map((item: any) => {
						const prop = item.visitedProperty || item;
						const title = prop?.propertyTitle || prop?.propertyName || 'Alpine Sanctuary';
						const loc = prop?.propertyAddress || prop?.propertyCity || 'Switzerland';
						const img = getImageUrl(
							prop?.propertyImages?.[0],
							'https://lh3.googleusercontent.com/aida-public/AB6AXuD8_BY-EVXIV7xo-yc9MYTb9NSoxhEi7EEv_XTCME9ZgfFw4tHp3r2MxvwZtjXUEnDFhGmRxFL45eq5LW-kSq3pfgKWZailt6pMXNLA7AILQwc6ni5OJlwUQwfaSoibHu1ciegz2OHO18tz_NErv3xXG3t7qtchAETDE-3q0qOCuiNxi1N43cAY-jINAZZJvIGhJEGSvz8a4onhCI47CfTAEJatfn0hxZHImOuDPkE7YYbavINRkHb6',
						);

						return (
							<article key={item._id} className="booking-card-item">
								<div className="card-img-box">
									<img src={img} alt={title} />
									<span className="rating-badge">Completed</span>
								</div>
								<div className="card-middle-info">
									<h3 className="booking-title">{title}</h3>
									<p className="location-line">
										<span className="material-symbols-outlined">location_on</span>
										<span>{loc}</span>
									</p>
									<p style={{ margin: 0, fontSize: '13px', color: '#707881' }}>
										Visited on {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
									</p>
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
