import React from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_DESTINATION, GET_PROPERTY_HOST } from '../../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { getJwtToken } from '../../../auth';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../../config';
import { Message } from '../../../enums/common.enum';
import { MemberType } from '../../../enums/member.enum';
import { Destination } from '../../../types/destination/destination';
import { Tour } from '../../../types/tour/tour';
import { sweetErrorAlert } from '../../../sweetAlert';
import { formatApiDate, getDateDuration } from '../../../utils';
import FollowButton from '../../common/FollowButton';

interface TourOverviewProps { tour: Tour; }

const parseAdditionalInfo = (value?: string[] | string): string[] => {
	if (Array.isArray(value)) return value.filter(Boolean);
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && Boolean(item)) : [];
	} catch {
		return value.split(',').map((item) => item.trim()).filter(Boolean);
	}
};

const TourOverview = ({ tour }: TourOverviewProps) => {
	const user = useReactiveVar(userVar);
	const [subscribe, { loading: subscribing }] = useMutation(SUBSCRIBE);
	const [unsubscribe, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);
	const { data: destinationData } = useQuery<{ getDestination?: Destination }>(GET_DESTINATION, { fetchPolicy: 'cache-and-network', variables: { destinationId: tour.destinationId }, skip: !tour.destinationId });
	const { data: organizerData, refetch: refetchOrganizer } = useQuery(GET_PROPERTY_HOST, { fetchPolicy: 'network-only', variables: { input: tour.memberId }, skip: !tour.memberId });
	const organizer = organizerData?.getMember || tour.memberData;
	const organizerName = organizer?.memberFullName || organizer?.memberNick || 'Organizer';
	const organizerImage = getImageUrl(organizer?.memberImage, DEFAULT_USER_AVATAR);
	const isOwnOrganizer = organizer?._id === user?._id;
	const isFollowing = Boolean(organizer?.meFollowed?.[0]?.myFollowing);
	const destination = destinationData?.getDestination;
	const hasCoordinates = typeof destination?.latitude === 'number' && typeof destination?.longitude === 'number';
	const latitude = destination?.latitude ?? 0;
	const longitude = destination?.longitude ?? 0;
	const bounds = `${longitude - 0.012},${latitude - 0.008},${longitude + 0.012},${latitude + 0.008}`;
	const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
	const mapLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
	const seatsLeft = Math.max(0, tour.tourCapacity - (tour.tourReservedSeats ?? 0));
	const additionalInfo = parseAdditionalInfo(tour.tourAdditionalInfo);

	/** HANDLERS **/
	const handleFollow = async () => {
		if (!organizer?._id || isOwnOrganizer) return;
		const accessToken = getJwtToken();
		if (!user?._id || !accessToken) { await sweetErrorAlert(Message.NOT_AUTHENTICATED); return; }
		try {
			const options = { variables: { input: organizer._id }, context: { headers: { Authorization: `Bearer ${accessToken}`, 'apollo-require-preflight': 'true' } } };
			if (isFollowing) await unsubscribe(options); else await subscribe(options);
			await refetchOrganizer();
		} catch (error: unknown) {
			await sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.');
		}
	};

	return (
		<div className="left-column-content">
			<div className="detail-card tour-about-card">
				<div className="about-header-row"><div><h2 className="about-heading">About this tour</h2><p className="about-subtext">{tour.tourStatus}</p></div></div>
				<div className="metadata-badges-grid">
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">schedule</span><div className="badge-details"><span className="badge-label">Duration</span><span className="badge-val">{getDateDuration(tour.tourStartDate, tour.tourEndDate)}</span></div></div>
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">event</span><div className="badge-details"><span className="badge-label">Start date</span><span className="badge-val">{formatApiDate(tour.tourStartDate)}</span></div></div>
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">event_available</span><div className="badge-details"><span className="badge-label">End date</span><span className="badge-val">{formatApiDate(tour.tourEndDate)}</span></div></div>
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">groups</span><div className="badge-details"><span className="badge-label">Availability</span><span className="badge-val">{seatsLeft} / {tour.tourCapacity} seats</span></div></div>
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">flight_takeoff</span><div className="badge-details"><span className="badge-label">Departure</span><span className="badge-val">{[tour.tourDepartureCity, tour.tourDepartureCountry].filter(Boolean).join(', ') || 'Unavailable'}</span></div></div>
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">favorite</span><div className="badge-details"><span className="badge-label">Saved by</span><span className="badge-val">{tour.tourLikes.toLocaleString()} traveler{tour.tourLikes === 1 ? '' : 's'}</span></div></div>
					<div className="meta-badge-chip"><span className="material-symbols-outlined badge-icon">visibility</span><div className="badge-details"><span className="badge-label">Views</span><span className="badge-val">{tour.tourViews.toLocaleString()}</span></div></div>
				</div>
				{tour.tourDesc ? <div className="about-description-text"><p>{tour.tourDesc}</p></div> : <p className="detail-empty-copy">The organizer has not added a tour description yet.</p>}
			</div>

			{additionalInfo.length ? <div className="detail-card provisions-card"><div className="provisions-header-row"><h3 className="section-title">Tour information</h3></div><ul className="provisions-list">{additionalInfo.map((item) => <li key={item} className="provision-item"><span className="material-symbols-outlined check-icon">check</span><span>{item}</span></li>)}</ul></div> : null}

			<div className="detail-card departure-card">
				<div className="departure-header-row"><div><h3 className="section-title">Departure & destination</h3><p className="section-subtext">{[tour.tourDeparturePlace, tour.tourDepartureCity].filter(Boolean).join(', ') || 'Departure details are not available yet.'}</p></div></div>
				{hasCoordinates ? <div className="tour-location-map"><iframe className="tour-location-map-frame" src={mapUrl} title={`${tour.tourName} destination map`} loading="lazy" /><a className="tour-map-open-link" href={mapLink} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">open_in_new</span>Open map</a></div> : null}
			</div>

			<div className="detail-card organizer-card">
				<div className="organizer-inner">
					<div className="organizer-main-info"><div className="organizer-avatar-wrapper"><img src={organizerImage} alt={organizerName} className="organizer-avatar" /></div><div className="organizer-text-info"><div className="organizer-name-row"><h4 className="organizer-name">{organizerName}</h4>{organizer?.memberType === MemberType.AGENT ? <span className="verified-operator-pill"><span className="material-symbols-outlined">verified</span>Agent</span> : null}</div><p className="organizer-desc">{organizer?.memberDesc || (organizer?.memberType === MemberType.AGENT ? 'Verified tour operator' : 'Tour organizer')}</p><div className="organizer-metrics-row"><span><strong>{organizer?.memberFollowers ?? 0}</strong> Followers</span><span>•</span><span><strong>{organizer?.memberTours ?? 0}</strong> Tours</span></div></div></div>
					<div className="organizer-actions">{organizer?._id ? <Link className="organizer-btn secondary" href={`/member?memberId=${organizer._id}`}>View profile</Link> : null}<button className="organizer-btn chat-btn" type="button" disabled title="1:1 chat will be available soon"><span className="material-symbols-outlined">chat</span>1:1 chat soon</button>{!isOwnOrganizer && organizer?._id ? (
						<FollowButton 
							isFollowing={isFollowing} 
							isLoading={subscribing || unsubscribing} 
							onClick={handleFollow} 
						/>
					) : null}</div>
				</div>
			</div>
		</div>
	);
};

export default TourOverview;
