import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_MEMBER } from '../../apollo/user/query';
import { Member } from '../../libs/types/member/member';
import MemberHeader from '../../libs/components/member/MemberHeader';
import MemberSidebar from '../../libs/components/member/MemberSidebar';
import MemberArticles from '../../libs/components/member/MemberArticles';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowing from '../../libs/components/member/MemberFollowing';
import MemberProducts from '../../libs/components/member/MemberProducts';

interface GetMemberResponse {
	getMember?: Member;
}

const MemberPage: NextPage = () => {
	const router = useRouter();
	const rawMemberId = router.query.memberId || router.query.id;
	const memberId = typeof rawMemberId === 'string' ? rawMemberId : '';

	const [activeTab, setActiveTab] = useState<'articles' | 'followers' | 'following' | 'products'>('articles');
	const [isFollowing, setIsFollowing] = useState<boolean>(false);
	const [followersCount, setFollowersCount] = useState<number>(0);
	const [followingCount, setFollowingCount] = useState<number>(0);
	const [articlesCount, setArticlesCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<GetMemberResponse>(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !router.isReady || !memberId,
		notifyOnNetworkStatusChange: true,
	});

	const member = data?.getMember;

	/** LIFECYCLES **/
	useEffect(() => {
		if (member) {
			setFollowersCount(member.memberFollowers || 0);
			setFollowingCount(member.memberFollowings || 0);
			setArticlesCount(member.memberArticles || 0);
			setIsFollowing(!!member.meFollowed?.[0]?.myFollowing);
		}
	}, [member]);

	/** HANDLERS **/
	const handleFollowChange = (newStatus: boolean) => {
		setIsFollowing(newStatus);
		setFollowersCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));
	};

	const memberTitle = member?.memberFullName || member?.memberNick || 'Member';

	return (
		<div className="member-profile-page">
			<Head>
				<title>{member ? `${memberTitle} — AURA Member Profile` : 'Member — AURA'}</title>
				<meta
					name="description"
					content={
						member?.memberDesc ||
						'Explore curated journals, monographs, and architectural chronicles on AURA.'
					}
				/>
			</Head>

			<div className="member-profile-container">
				{loading && !member && <p className="member-profile-state">Loading member profile…</p>}
				{!loading && !memberId && (
					<p className="member-profile-state">Member ID parameter is required.</p>
				)}
				{!loading && memberId && !member && (
					<p className="member-profile-state">Member not found.</p>
				)}

				{member && (
					<>
						{/* Public Profile Header Container */}
						<MemberHeader
							member={member}
							isFollowing={isFollowing}
							followersCount={followersCount}
							articlesCount={articlesCount}
							onFollowChange={handleFollowChange}
						/>

						{/* Two-Column Page Layout */}
						<div className="member-layout">
							{/* Left Vertical Nav Sidebar */}
							<MemberSidebar
								activeTab={activeTab}
								onTabChange={setActiveTab}
								articlesCount={articlesCount}
								followersCount={followersCount}
								followingCount={followingCount}
								member={member}
							/>

							{/* Right Dynamic Content Area */}
							{activeTab === 'articles' && (
								<MemberArticles
									member={member}
									onArticlesCountChange={(cnt) => setArticlesCount(cnt)}
								/>
							)}
							
							{activeTab === 'products' && (
								<MemberProducts member={member} />
							)}

							{activeTab === 'followers' && (
								<MemberFollowers
									member={member}
									onFollowersCountChange={(cnt) => setFollowersCount(cnt)}
								/>
							)}

							{activeTab === 'following' && (
								<MemberFollowing
									member={member}
									onFollowingCountChange={(cnt) => setFollowingCount(cnt)}
								/>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
