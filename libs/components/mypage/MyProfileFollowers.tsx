import React, { useState } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_MEMBER_FOLLOWERS } from "../../../apollo/user/query";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { Follower } from "../../types/follow/follow";
import { getImageUrl } from "../../config";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";

const MyProfileFollowers: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"recent" | "name">("recent");
  // Map to track local toggle overrides: followerId -> isFollowingBack
  const [followStatusMap, setFollowStatusMap] = useState<
    Record<string, boolean>
  >({});

  /** APOLLO REQUESTS **/
  const [subscribeMutation] = useMutation(SUBSCRIBE);
  const [unsubscribeMutation] = useMutation(UNSUBSCRIBE);

  const { data, loading, refetch } = useQuery(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: 1,
        limit: 50,
        search: {
          followingId: user?._id || "",
        },
      },
    },
    skip: !user?._id,
    notifyOnNetworkStatusChange: true,
  });

  const followersList: Follower[] = data?.getMemberFollowers?.list || [];
  const total =
    data?.getMemberFollowers?.metaCounter?.[0]?.total ?? followersList.length;

  /** HANDLERS **/
  const handleToggleFollow = async (
    targetId: string,
    targetNick: string,
    isCurrentlyFollowing: boolean,
  ) => {
    if (!user?._id) {
      sweetMixinErrorAlert("Please log in first.");
      return;
    }

    try {
      if (isCurrentlyFollowing) {
        setFollowStatusMap((prev) => ({ ...prev, [targetId]: false }));
        await unsubscribeMutation({ variables: { input: targetId } });
        sweetTopSmallSuccessAlert(`Unfollowed ${targetNick}`, 800);
      } else {
        setFollowStatusMap((prev) => ({ ...prev, [targetId]: true }));
        await subscribeMutation({ variables: { input: targetId } });
        sweetTopSmallSuccessAlert(`Following ${targetNick}`, 800);
      }
      await refetch();
    } catch (err: any) {
      // Rollback state on error
      setFollowStatusMap((prev) => ({
        ...prev,
        [targetId]: isCurrentlyFollowing,
      }));
      sweetMixinErrorAlert(err.message || "Operation failed.");
    }
  };

  // Filter & Sort
  const processedList = [...followersList]
    .filter((item: Follower) => {
      const target = item?.followerData;
      const nick = (target?.memberNick || "").toLowerCase();
      const fullName = (target?.memberFullName || "").toLowerCase();
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return nick.includes(q) || fullName.includes(q);
    })
    .sort((a: Follower, b: Follower) => {
      if (sortOrder === "name") {
        const nameA = (a?.followerData?.memberNick || "").toLowerCase();
        const nameB = (b?.followerData?.memberNick || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      // Recent (createdAt DESC)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  return (
    <div>
      {/* Top Control Bar */}
      <div className="section-top-bar">
        <div className="title-group">
          <h2>Followers</h2>
          <span className="counter-pill">{total} followers</span>
        </div>
        <div className="bar-actions">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search followers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="custom-select-box">
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "recent" | "name")
              }
            >
              <option value="recent">Recently Followed</option>
              <option value="name">Name A–Z</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      {/* Wide Follower List Panel */}
      {processedList.length > 0 ? (
        <div className="list-panel-container">
          {processedList.map((item: Follower) => {
            const follower = item?.followerData;
            const followerId = follower?._id || item.followerId;
            const followerNick =
              follower?.memberFullName || follower?.memberNick || "Explorer";
            const handle = `@${(follower?.memberNick || "user")
              .toLowerCase()
              .replace(/\s+/g, "")}`;
            const followerLocation =
              follower?.memberAddress || follower?.memberType || "Adventurer";
            const followerImg = getImageUrl(
              follower?.memberImage,
              "/img/profile/defaultUser.svg",
            );

            // Determine if current user follows this follower back:
            // check local override map, or backend meFollowed aggregation
            const defaultFollowingBack = Boolean(
              item?.meFollowed?.[0]?.myFollowing,
            );
            const isFollowingBack =
              followerId in followStatusMap
                ? followStatusMap[followerId]
                : defaultFollowingBack;

            return (
              <div key={item._id || followerId} className="list-row-item">
                <div className="user-info-left">
                  <img
                    src={followerImg}
                    alt={followerNick}
                    className="avatar-circle"
                  />
                  <div className="text-details">
                    <div className="name-badge-row">
                      <span className="user-name">{followerNick}</span>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </div>
                    <p className="handle-sub">
                      {handle} · {followerLocation}
                    </p>
                  </div>
                </div>

                <div className="actions-right">
                  <button
                    type="button"
                    className={`follow-state-btn ${
                      isFollowingBack ? "is-following" : "not-following"
                    }`}
                    onClick={() =>
                      handleToggleFollow(
                        followerId,
                        followerNick,
                        isFollowingBack,
                      )
                    }
                  >
                    {isFollowingBack ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    className="more-options-btn"
                    aria-label="More options"
                    onClick={() =>
                      sweetTopSmallSuccessAlert(
                        `Follower profile: ${followerNick}`,
                        800,
                      )
                    }
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="profile-empty-state">
          <div className="empty-icon">
            <span className="material-symbols-outlined">group</span>
          </div>
          <h3>
            {searchTerm ? "No matching followers found" : "No followers yet"}
          </h3>
          <p>
            {searchTerm
              ? `No followers match "${searchTerm}".`
              : "Share inspiring travel stories and photographs to build your explorer community."}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyProfileFollowers;
