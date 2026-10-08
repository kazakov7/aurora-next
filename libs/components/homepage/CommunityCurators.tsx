import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_HOME_EXPLORERS } from "../../../apollo/user/query";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { getJwtToken } from "../../auth";
import { Direction, Message } from "../../enums/common.enum";
import { Member } from "../../types/member/member";
import { MembersInquiry } from "../../types/member/member.input";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
} from "../../sweetAlert";
import FollowButton from "../common/FollowButton";
import { Globe, Mail } from "lucide-react";

const CommunityCurators = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [followOverrides, setFollowOverrides] = useState<
    Record<string, boolean>
  >({});
  const [updatingFollowIds, setUpdatingFollowIds] = useState<
    Record<string, boolean>
  >({});
  const queryInput: MembersInquiry = {
    page: 1,
    limit: 4,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {},
  };

  /** APOLLO REQUESTS **/
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);

  const { data, loading, refetch } = useQuery(GET_HOME_EXPLORERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: queryInput },
    notifyOnNetworkStatusChange: true,
    ssr: false,
  });
  const curators: Member[] = data?.getAllMembers?.list ?? [];

  /** HANDLERS **/
  const followHandler = async (
    event: React.MouseEvent,
    curatorId: string,
    isFollowing: boolean,
  ) => {
    event.stopPropagation();
    if (updatingFollowIds[curatorId]) return;

    try {
      const accessToken = getJwtToken();
      if (!user?._id || !accessToken) {
        await sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
        await router.push({
          pathname: "/account/login",
          query: { referrer: router.asPath },
        });
        return;
      }

      const nextFollowingStatus = !isFollowing;
      setFollowOverrides((current) => ({
        ...current,
        [curatorId]: nextFollowingStatus,
      }));
      setUpdatingFollowIds((current) => ({ ...current, [curatorId]: true }));
      const mutationOptions = {
        variables: { input: curatorId },
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "apollo-require-preflight": "true",
          },
        },
      };

      if (isFollowing) {
        await unsubscribe(mutationOptions);
      } else {
        await subscribe(mutationOptions);
      }

      await refetch({ input: queryInput }).catch((refetchError) => {
        console.log("ERROR, refetch explorers:", refetchError);
      });
      setFollowOverrides((current) => {
        const updated = { ...current };
        delete updated[curatorId];
        return updated;
      });
    } catch (err: unknown) {
      setFollowOverrides((current) => ({
        ...current,
        [curatorId]: isFollowing,
      }));
      const errorMessage =
        err instanceof Error ? err.message : "Unable to update follow status.";
      console.log("ERROR, followHandler:", errorMessage);
      sweetMixinErrorAlert(errorMessage);
    } finally {
      setUpdatingFollowIds((current) => ({ ...current, [curatorId]: false }));
    }
  };

  const redirectToMemberPage = (memberId: string) => {
    if (memberId === user?._id) {
      router.push("/mypage");
    } else {
      router.push(`/member?memberId=${memberId}`);
    }
  };

  const SHAPE_COLORS = ["#3f24ff", "#fcab6c", "#ebe266", "#23b6fa"];

  return (
    <section className="curators-section team-section">
      <div className="section-container">
        <div className="section-header team-header">
          <div className="team-badge">Team</div>
          <h2 className="team-title">Meet the creative minds<br/>behind our success</h2>
        </div>

        <div className="team-grid">
          {curators.map((curator: Member, index: number) => {
            const backendFollowing = Boolean(
              curator.meFollowed?.[0]?.myFollowing,
            );
            const isFollowing =
              followOverrides[curator._id] ?? backendFollowing;
            const isUpdatingFollow = Boolean(updatingFollowIds[curator._id]);
            const avatarUrl = getImageUrl(
              curator.memberImage,
              DEFAULT_USER_AVATAR,
            );

            // Mock roles since backend only has memberType
            const roles = ["WordPress Developer", "Social Media Specialist", "Product Designer", "UI Designer"];
            const role = roles[index % roles.length];
            const shapeIndex = index % 4;

            return (
              <div
                key={curator._id}
                className="team-card"
                data-shape={shapeIndex}
                onClick={() => redirectToMemberPage(curator._id)}
              >
                <div className="team-avatar-wrap">
                  <img
                    src={avatarUrl}
                    alt={curator.memberNick}
                    className="team-cover-img"
                    onError={(e: any) => { e.target.src = DEFAULT_USER_AVATAR; }}
                  />
                </div>
                
                <div className="team-bottom-content">
                  <h3 className="team-name">
                    {curator.memberFullName || curator.memberNick}
                  </h3>
                  <div className="team-role">{role}</div>
                  
                  <div className="team-social-icons">
                    <Globe size={18} strokeWidth={1.5} />
                    <Mail size={18} strokeWidth={1.5} />
                  </div>

                  {user?._id !== curator._id && (
                    <div className="team-follow-wrapper">
                      <FollowButton 
                        isFollowing={isFollowing} 
                        isLoading={isUpdatingFollow} 
                        onClick={(e) => followHandler(e, curator._id, isFollowing)} 
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {!loading && curators.length === 0 && (
            <p className="curators-empty-state">No team members found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommunityCurators;
