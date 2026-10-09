import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ApolloError, useMutation, useReactiveVar } from "@apollo/client";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { getJwtToken } from "../../auth";
import { Message } from "../../enums/common.enum";
import { Member } from "../../types/member/member";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
} from "../../sweetAlert";
import FollowButton from "../common/FollowButton";

interface CuratorStat {
  label: string;
  value: number;
}

/** Faqat backend qaytargan raqamlarni ko'rsatadi — bo'sh joy sun'iy to'ldirilmaydi **/
const buildStats = (curator: Member): CuratorStat[] => {
  const candidates: CuratorStat[] = [
    { label: "Followers", value: curator.memberFollowers },
    { label: "Stays", value: curator.memberProperties },
    { label: "Tours", value: curator.memberTours },
    { label: "Articles", value: curator.memberArticles },
  ];

  return candidates
    .filter((stat) => typeof stat.value === "number" && stat.value > 0)
    .slice(0, 2);
};

interface CommunityCuratorsProps {
  travelers: Member[];
  loading?: boolean;
  error?: ApolloError;
}

const CommunityCurators = ({ travelers, loading, error }: CommunityCuratorsProps) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [followOverrides, setFollowOverrides] = useState<
    Record<string, boolean>
  >({});
  const [updatingFollowIds, setUpdatingFollowIds] = useState<
    Record<string, boolean>
  >({});
  const [followerDeltas, setFollowerDeltas] = useState<Record<string, number>>(
    {},
  );
  /** APOLLO REQUESTS **/
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);

  const curators = travelers;

  /** HANDLERS **/
  const followHandler = async (
    event: React.MouseEvent,
    curatorId: string,
    isFollowing: boolean,
  ) => {
    event.stopPropagation();
    if (updatingFollowIds[curatorId]) return;

    try {
      if (!user?._id || !getJwtToken()) {
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
      const mutationOptions = { variables: { input: curatorId } };

      if (isFollowing) {
        await unsubscribe(mutationOptions);
      } else {
        await subscribe(mutationOptions);
      }

      // Update the card in place instead of refetching the whole section
      setFollowerDeltas((current) => ({
        ...current,
        [curatorId]: (current[curatorId] ?? 0) + (nextFollowingStatus ? 1 : -1),
      }));
      await sweetTopSmallSuccessAlert(
        nextFollowingStatus ? "Following" : "Unfollowed",
        800,
      );
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

  return (
    <section className="curators-section">
      <div className="section-container">
        <div className="section-header">
          <div>
            <span className="section-tag">Community Curators</span>
            <h2 className="section-title">
              Meet the creative minds behind our success
            </h2>
          </div>
          <Link href="/community" className="section-link">
            <span>Explore community</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="curators-grid">
		  {loading && !curators.length ? <p className="curators-empty-state">Loading top travelers…</p> : null}
		  {!loading && error ? <p className="curators-empty-state">Top travelers are unavailable right now.</p> : null}
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
            const isSelf = curator._id === user?._id;
            const stats = buildStats({
              ...curator,
              memberFollowers:
                (curator.memberFollowers ?? 0) +
                (followerDeltas[curator._id] ?? 0),
            });

            return (
              <article key={curator._id} className="curator-card">
                <div className="curator-portrait">
                  <img
                    src={avatarUrl}
                    alt={curator.memberFullName || curator.memberNick}
                    className="curator-img"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_USER_AVATAR;
                    }}
                  />
                  <span className="portrait-sheen" aria-hidden="true" />
                  <span className="curator-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="curator-body">
                  {curator.memberType ? (
                    <span className="curator-overline">
                      {curator.memberType}
                    </span>
                  ) : null}

                  <h3 className="curator-name">
                    <Link
                      href={isSelf ? "/mypage" : `/member?memberId=${curator._id}`}
                      className="curator-link"
                    >
                      {curator.memberFullName || curator.memberNick}
                    </Link>
                  </h3>

                  {curator.memberDesc ? (
                    <p className="curator-desc">{curator.memberDesc}</p>
                  ) : null}

                  <div className="curator-footer">
                    <span className="curator-stats">
                      {stats.map((stat, statIndex) => (
                        <React.Fragment key={stat.label}>
                          {statIndex > 0 ? (
                            <span className="stat-dot" aria-hidden="true" />
                          ) : null}
                          <span className="stat">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                          </span>
                        </React.Fragment>
                      ))}
                    </span>

                    {!isSelf ? (
                      <span className="curator-action">
                        <FollowButton
                          isFollowing={isFollowing}
                          isLoading={isUpdatingFollow}
                          onClick={(event) =>
                            followHandler(event, curator._id, isFollowing)
                          }
                          size="sm"
                        />
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && !error && curators.length === 0 ? (
			<p className="curators-empty-state">No ranked travelers available yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default CommunityCurators;
