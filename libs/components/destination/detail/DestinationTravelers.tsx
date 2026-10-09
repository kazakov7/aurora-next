import React, { useState } from 'react';
import Link from 'next/link';
import { ApolloError, useMutation, useReactiveVar } from '@apollo/client';
import FollowButton from '../../common/FollowButton';
import { Member } from '../../../types/member/member';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../../config';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { sweetMixinErrorAlert } from '../../../sweetAlert';

interface DestinationTravelersProps { destinationName: string; travelers: Member[]; loading?: boolean; error?: ApolloError; onRefetch: () => Promise<unknown>; }

const DestinationTravelers = ({ destinationName, travelers, loading, error, onRefetch }: DestinationTravelersProps) => {
	const user = useReactiveVar(userVar);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [pending, setPending] = useState<Record<string, boolean>>({});
	const follow = async (member: Member, following: boolean) => {
		if (!user._id) return sweetMixinErrorAlert('Please login first!');
		try { setPending((current) => ({ ...current, [member._id]: true })); if (following) await unsubscribe({ variables: { input: member._id } }); else await subscribe({ variables: { input: member._id } }); await onRefetch(); } catch (error) { sweetMixinErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.'); } finally { setPending((current) => ({ ...current, [member._id]: false })); }
	};
	if (!loading && !error && travelers.length === 0) return null;
	return <section className="destination-travelers-section"><div className="section-header-box"><h2 className="travelers-heading">Travelers Who Explored {destinationName}</h2><p className="travelers-subheading">Meet people who have experienced this destination.</p></div><div className="travelers-cards-grid">{loading ? <p>Loading travelers…</p> : null}{!loading && error ? <p>Travelers are unavailable right now.</p> : null}{travelers.map((traveler) => { const following = Boolean(traveler.meFollowed?.[0]?.myFollowing); return <div key={traveler._id} className="traveler-card-item"><img src={getImageUrl(traveler.memberImage, DEFAULT_USER_AVATAR)} alt={traveler.memberFullName || traveler.memberNick} className="traveler-avatar" /><h3 className="traveler-name">{traveler.memberFullName || traveler.memberNick}</h3><span className="traveler-handle">@{traveler.memberNick}</span>{traveler.memberDesc ? <p className="traveler-bio">{traveler.memberDesc}</p> : null}<div className="journeys-badge-pill"><span className="material-symbols-outlined icon-plane">flight_takeoff</span><span>{traveler.memberTours} journeys</span></div><div className="card-actions-row"><Link href={traveler._id === user._id ? '/mypage' : `/member?memberId=${traveler._id}`} className="profile-link">View Profile</Link>{traveler._id !== user._id ? <FollowButton isFollowing={following} isLoading={Boolean(pending[traveler._id])} onClick={() => void follow(traveler, following)} /> : null}</div></div>;})}</div></section>;
};

export default DestinationTravelers;
