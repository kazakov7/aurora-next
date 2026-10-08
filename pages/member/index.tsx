import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_MEMBER } from '../../apollo/user/query';
import { Member } from '../../libs/types/member/member';
import MemberHeader from '../../libs/components/member/MemberHeader';

interface GetMemberResponse {
	getMember?: Member;
}

const MemberPage: NextPage = () => {
	const router = useRouter();
	const memberId = typeof router.query.memberId === 'string' ? router.query.memberId : '';

	const [isFollowing, setIsFollowing] = useState(false);
	const [followersCount, setFollowersCount] = useState(0);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<GetMemberResponse>(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !router.isReady || !memberId,
		notifyOnNetworkStatusChange: true,
	});

	const member = data?.getMember;

	useEffect(() => {
		if (member) {
			setFollowersCount(member.memberFollowers);
			// If backend returns meFollowed boolean, set it here:
			// setIsFollowing(!!member.meFollowed?.[0]?.myFollow);
		}
	}, [member]);

	const handleFollowChange = (newStatus: boolean) => {
		setIsFollowing(newStatus);
		setFollowersCount(prev => newStatus ? prev + 1 : prev - 1);
	};

	return (
		<div className="member-profile-page">
			<Head>
				<title>{member ? `${member.memberNick} — AURA` : 'Member — AURA'}</title>
			</Head>

			<div className="member-profile-container">
				{loading && <p className="member-profile-state">Loading member profile…</p>}
				{!loading && !memberId && <p className="member-profile-state">Member ID is required.</p>}
				{!loading && memberId && !member && <p className="member-profile-state">Member not found.</p>}

				{member && (
					<MemberHeader 
						member={member} 
						isFollowing={isFollowing} 
						followersCount={followersCount} 
						onFollowChange={handleFollowChange} 
					/>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
