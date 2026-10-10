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
import { useI18n } from '../../libs/i18n';

interface GetMemberResponse {
	getMember?: Member;
}

const MemberPage: NextPage = () => {
	const { t } = useI18n();
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

	const memberTitle = member?.memberFullName || member?.memberNick || t('common.member');

	return (
		<div className="member-profile-page">
			<Head>
				<title>{member ? t('member.page.metaTitle', { memberTitle }) : t('member.page.metaTitleFallback')}</title>
				<meta
					name="description"
					content={
						member?.memberDesc ||
						t('member.page.metaDescription')
					}
				/>
			</Head>

			<div className="member-profile-container">
				{loading && !member && <p className="member-profile-state">{t('member.page.loadingMemberProfile')}</p>}
				{!loading && !memberId && (
					<p className="member-profile-state">{t('member.page.idRequired')}</p>
				)}
				{!loading && memberId && !member && (
					<p className="member-profile-state">{t('member.page.memberNotFound')}</p>
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
