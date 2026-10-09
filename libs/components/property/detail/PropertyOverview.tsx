import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_DESTINATION, GET_PROPERTY_HOST } from '../../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { getJwtToken } from '../../../auth';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../../config';
import { Destination } from '../../../types/destination/destination';
import { Message } from '../../../enums/common.enum';
import { MemberType } from '../../../enums/member.enum';
import { Property } from '../../../types/property/property';
import { sweetErrorAlert } from '../../../sweetAlert';
import FollowButton from '../../common/FollowButton';

interface PropertyOverviewProps {
	property: Property;
}

const amenityIconMap: Record<string, string> = {
	wifi: 'wifi', pool: 'pool', sauna: 'sauna', kitchen: 'countertops',
	'air conditioning': 'ac_unit', heating: 'thermostat', elevator: 'elevator',
	'ocean view': 'water', 'mountain view': 'landscape', spa: 'hot_tub',
	fireplace: 'fireplace', gym: 'fitness_center', parking: 'local_parking',
	concierge: 'room_service', breakfast: 'bakery_dining',
};

const PropertyOverview = ({ property }: PropertyOverviewProps) => {
	const [descExpanded, setDescExpanded] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const amenities = property.amenities || [];
	const [subscribe, { loading: subscribing }] = useMutation(SUBSCRIBE);
	const [unsubscribe, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);
	const { data: destinationData } = useQuery<{ getDestination?: Destination }>(GET_DESTINATION, {
		fetchPolicy: 'cache-and-network',
		variables: { destinationId: property.destinationId },
		skip: !property.destinationId,
	});
	const { data: hostData, refetch: refetchHost } = useQuery(GET_PROPERTY_HOST, {
		fetchPolicy: 'network-only',
		variables: { input: property.memberId },
		skip: !property.memberId,
	});
	const destination = destinationData?.getDestination;
	const host = hostData?.getMember || property.memberData;
	const hostName = host?.memberFullName || host?.memberNick || 'Host';
	const hostImage = getImageUrl(host?.memberImage, DEFAULT_USER_AVATAR);
	const isOwnHostProfile = user?._id === host?._id;
	const isFollowing = Boolean(host?.meFollowed?.[0]?.myFollowing);
	const isFollowUpdating = subscribing || unsubscribing;
	const hasCoordinates = typeof destination?.latitude === 'number' && typeof destination?.longitude === 'number';
	const latitude = destination?.latitude ?? 0;
	const longitude = destination?.longitude ?? 0;
	const mapBounds = `${longitude - 0.012},${latitude - 0.008},${longitude + 0.012},${latitude + 0.008}`;
	const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(mapBounds)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
	const mapLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

	/** HANDLERS **/
	const handleFollow = async () => {
		if (!host?._id || isOwnHostProfile) return;
		if (!user?._id || !getJwtToken()) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}

		try {
			const mutationOptions = { variables: { input: host._id } };
			if (isFollowing) await unsubscribe(mutationOptions);
			else await subscribe(mutationOptions);
			await refetchHost();
		} catch (error: unknown) {
			await sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.');
		}
	};

	const handleMessageHost = async () => {
		if (!host?._id || isOwnHostProfile) return;
		if (!user?._id || !getJwtToken()) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			void router.push('/account/login');
			return;
		}
		void router.push(`/chat?memberId=${host._id}`);
	};

	return (
		<div className="left-column-content">
			<div className="detail-card overview-specs-card">
				<div className="specs-card-header">
					<div>
						<h2 className="specs-heading">{property.propertyType}</h2>
						<p className="specs-subtext">Hotel details</p>
					</div>
				</div>
				<div className="quick-specs-grid">
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">groups</span><div className="spec-details"><span className="spec-label">Capacity</span><span className="spec-value">{property.maxGuests} Guests</span></div></div>
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">king_bed</span><div className="spec-details"><span className="spec-label">Bedrooms</span><span className="spec-value">{property.bedrooms} Bedrooms</span></div></div>
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">bed</span><div className="spec-details"><span className="spec-label">Beds</span><span className="spec-value">{property.beds} Beds</span></div></div>
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">bathtub</span><div className="spec-details"><span className="spec-label">Bathrooms</span><span className="spec-value">{property.bathrooms} Baths</span></div></div>
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">favorite</span><div className="spec-details"><span className="spec-label">Saved by</span><span className="spec-value">{property.propertyLikes.toLocaleString()} traveler{property.propertyLikes === 1 ? '' : 's'}</span></div></div>
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">visibility</span><div className="spec-details"><span className="spec-label">Views</span><span className="spec-value">{property.propertyViews.toLocaleString()}</span></div></div>
					<div className="spec-chip"><span className="material-symbols-outlined spec-icon">confirmation_number</span><div className="spec-details"><span className="spec-label">Bookings</span><span className="spec-value">{property.propertyBookings.toLocaleString()}</span></div></div>
				</div>
			</div>

			<div className="detail-card description-card">
				<h3 className="section-title">About this hotel</h3>
				{property.propertyDesc ? (
					<>
						<div className={`description-body ${descExpanded ? 'expanded' : ''}`}><p>{property.propertyDesc}</p></div>
						{property.propertyDesc.length > 280 ? <button className="read-more-toggle" type="button" onClick={() => setDescExpanded((current) => !current)}><span>{descExpanded ? 'Show less' : 'Read more'}</span><span className="material-symbols-outlined">{descExpanded ? 'expand_less' : 'expand_more'}</span></button> : null}
					</>
				) : <p className="detail-empty-copy">The host has not added a description yet.</p>}
			</div>

			<div className="detail-card amenities-card">
				<div className="amenities-header"><h3 className="section-title">Amenities</h3><span className="amenities-count">{amenities.length} included</span></div>
				{amenities.length ? <div className="amenities-grid">
					{amenities.map((amenity) => {
						const key = Object.keys(amenityIconMap).find((item) => amenity.toLowerCase().includes(item));
						return <div key={amenity} className="amenity-item"><span className="material-symbols-outlined amenity-icon">{key ? amenityIconMap[key] : 'check_circle'}</span><span className="amenity-name">{amenity}</span></div>;
					})}
				</div> : <p className="detail-empty-copy">Amenities have not been listed yet.</p>}
			</div>

			<div className="detail-card location-card">
				<div className="location-header">
					<div>
						<h3 className="section-title">Location</h3>
						<p className="location-address">{[property.propertyAddress, property.propertyCity].filter(Boolean).join(', ') || 'Location details are not available yet.'}</p>
					</div>
				</div>
				{hasCoordinates ? (
					<div className="map-preview-banner">
						<iframe className="location-map-frame" src={mapUrl} title={`${property.propertyName} location map`} loading="lazy" />
						<a className="map-open-link" href={mapLink} target="_blank" rel="noreferrer">
							<span className="material-symbols-outlined">open_in_new</span>
							Open map
						</a>
					</div>
				) : <p className="detail-empty-copy">Map coordinates are not available for this destination yet.</p>}
			</div>

			<div className="detail-card host-profile-card">
				<div className="host-card-inner">
					<div className="host-main-info">
						<div className="host-avatar-wrapper"><img src={hostImage} alt={hostName} className="host-avatar" /></div>
						<div className="host-text-details">
							<div className="host-name-row"><h3 className="host-name">{hostName}</h3>{host?.memberType === MemberType.AGENT ? <span className="host-agent-badge"><span className="material-symbols-outlined">verified</span>Agent</span> : null}</div>
							<p className="host-title">{host?.memberType === MemberType.AGENT ? 'Verified accommodation agent' : 'Property host'}</p>
							{host?.memberDesc ? <p className="host-description">{host.memberDesc}</p> : null}
							<div className="host-metrics-row">
								<span className="metric-text"><strong>{host?.memberFollowers ?? 0}</strong> Followers</span>
								<span className="metric-sep">•</span>
								<span className="metric-text"><strong>{host?.memberProperties ?? 0}</strong> Hotels</span>
							</div>
						</div>
					</div>
					<div className="host-action-buttons">
						{host?._id ? <Link className="host-btn secondary-btn" href={`/member?memberId=${host._id}`}>View profile</Link> : null}
						{!isOwnHostProfile && host?._id ? <button className="host-btn chat-btn" type="button" onClick={() => void handleMessageHost()}><span className="material-symbols-outlined">chat</span>Message</button> : null}
						{!isOwnHostProfile && host?._id ? (
							<FollowButton 
								isFollowing={isFollowing} 
								isLoading={isFollowUpdating} 
								onClick={handleFollow} 
							/>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PropertyOverview;
