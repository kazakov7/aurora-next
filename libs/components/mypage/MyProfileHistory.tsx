import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { DEFAULT_PROPERTY_IMAGE, getImageUrl } from '../../config';
import { Property } from '../../types/property/property';
import { useI18n } from '../../i18n';

const MyProfileHistory: React.FC = () => {
	const { t } = useI18n();
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
					<h2>{t('profile.history.title')}</h2>
					<span className="counter-pill">{t('profile.history.count', { total })}</span>
				</div>
			</div>

			{loading && !data ? (
				<div className="profile-empty-state"><div className="loading-spinner" /><p>{t('profile.history.loading')}</p></div>
			) : error ? (
				<div className="profile-empty-state"><h3>{t('profile.history.unavailable')}</h3><p>{error?.message}</p></div>
			) : visitedProperties.length > 0 ? (
				<div className="booking-cards-stack">
					{visitedProperties.map((item) => {
						const title = item.propertyName;
						const loc = item.propertyAddress || item.propertyCity || t('common.locationNotProvided');
						const img = getImageUrl(item.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE);

						return (
							<article key={`property-${item._id}`} className="booking-card-item" onClick={() => router.push(`/property/detail?id=${item._id}`)}>
								<div className="card-img-box">
									<img src={img} alt={title} />
									<span className="rating-badge">{t('common.hotelBadge')}</span>
								</div>
								<div className="card-middle-info">
									<h3 className="booking-title">{title}</h3>
									<p className="location-line">
										<span className="material-symbols-outlined">location_on</span>
										<span>{loc}</span>
									</p>
									<p style={{ margin: 0, fontSize: '13px', color: '#707881' }}>{t('profile.recentlyViewed')}</p>
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
					<h3>{t('profile.history.emptyTitle')}</h3>
					<p>{t('profile.history.emptyText')}</p>
				</div>
			)}
		</div>
	);
};

export default MyProfileHistory;
