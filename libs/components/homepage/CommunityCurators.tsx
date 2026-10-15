import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper";
import { ApolloError, useApolloClient, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../apollo/user/mutation";
import { GET_MEMBER, GET_MY_FOLLOWING_IDS } from "../../../apollo/user/query";
import { userVar } from "../../../apollo/store";
import { getJwtToken } from "../../auth";
import { Message } from "../../enums/common.enum";
import { Member } from "../../types/member/member";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";
import {
  sweetMixinErrorAlert,
} from "../../sweetAlert";
import FollowButton from "../common/FollowButton";
import { useI18n } from "../../i18n";
import { RevealOnScroll } from "../motion/RevealOnScroll";
import { StaggerContainer } from "../motion/StaggerContainer";
import { StaggerItem } from "../motion/StaggerItem";
import { HoverLift } from "../motion/HoverLift";
import useDeviceDetect from "../../hooks/useDeviceDetect";

interface CuratorStat {
  label: string;
  value: number;
}

/** Faqat backend qaytargan raqamlarni ko'rsatadi — bo'sh joy sun'iy to'ldirilmaydi **/
const buildStats = (curator: Member, labels: Record<string, string>): CuratorStat[] => {
  const candidates: CuratorStat[] = [
    { label: labels.followers, value: curator.memberFollowers },
    { label: labels.stays, value: curator.memberProperties },
    { label: labels.tours, value: curator.memberTours },
    { label: labels.articles, value: curator.memberArticles },
  ];

  return candidates
    .filter((stat) => typeof stat.value === "number" && stat.value > 0)
    .slice(0, 2);
};

interface CommunityCuratorsProps {
  travelers: Member[];
  loading?: boolean;
  error?: ApolloError;
  refetchCurators: () => Promise<void>;
  authChecked: boolean;
}

interface FollowingIdsResponse {
  getMemberFollowings?: {
    list: Array<{ followingId: string }>;
  };
}

const CommunityCurators = ({ travelers, loading, error, refetchCurators, authChecked }: CommunityCuratorsProps) => {
	const { t, tEnum, tError } = useI18n();
  const router = useRouter();
  const apolloClient = useApolloClient();
  const user = useReactiveVar(userVar);
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const [updatingFollowIds, setUpdatingFollowIds] = useState<
    Record<string, boolean>
  >({});
  /** APOLLO REQUESTS **/
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const {
    data: followingData,
    loading: followingLoading,
    refetch: refetchFollowing,
  } = useQuery<FollowingIdsResponse>(GET_MY_FOLLOWING_IDS, {
    fetchPolicy: "network-only",
    skip: !user?._id,
    variables: {
      input: {
        page: 1,
        limit: Math.max(user?.memberFollowings ?? 0, 100),
        search: { followerId: user?._id },
      },
    },
  });
  const followingIds = useMemo(
    () => new Set<string>((followingData?.getMemberFollowings?.list ?? []).map((follow) => follow.followingId)),
    [followingData],
  );

  const curators = travelers;

  /** LIFECYCLES **/
  useEffect(() => {
    setFollowOverrides({});
  }, [user?._id]);

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
        await sweetMixinErrorAlert(t(Message.NOT_AUTHENTICATED));
        await router.push({
          pathname: "/account/login",
          query: { referrer: router.asPath },
        });
        return;
      }

      setUpdatingFollowIds((current) => ({ ...current, [curatorId]: true }));
      const mutationOptions = { variables: { input: curatorId } };

      if (isFollowing) {
        await unsubscribe(mutationOptions);
      } else {
        await subscribe(mutationOptions);
      }

      const verification = await apolloClient.query<{ getMember: Member }>({
        query: GET_MEMBER,
        variables: { input: curatorId },
        fetchPolicy: 'network-only',
      });
      const persistedFollowing = Boolean(verification.data.getMember?.meFollowed?.[0]?.myFollowing);

      if (persistedFollowing === isFollowing) {
        throw new Error(t('common.followUpdateFailed'));
      }

      await Promise.all([refetchCurators(), refetchFollowing()]);
      setFollowOverrides((current) => ({ ...current, [curatorId]: persistedFollowing }));
    } catch (err: unknown) {
      setFollowOverrides((current) => ({ ...current, [curatorId]: isFollowing }));
      const errorMessage =
        tError(err, "common.followUpdateFailed");
      console.log("ERROR, followHandler:", errorMessage);
      sweetMixinErrorAlert(errorMessage);
    } finally {
      setUpdatingFollowIds((current) => ({ ...current, [curatorId]: false }));
    }
  };

  const device = useDeviceDetect();
  const isMobile = device === "mobile";

  const renderCuratorCard = (curator: Member, index: number) => {
    const hasFollowingSnapshot = Boolean(followingData?.getMemberFollowings);
    const rankingFollowing = Boolean(curator.meFollowed?.[0]?.myFollowing);
    const persistedFollowing = user?._id && hasFollowingSnapshot ? followingIds.has(curator._id) : rankingFollowing;
    const isFollowing = followOverrides[curator._id] ?? persistedFollowing;
    const isInitialFollowSync = !authChecked || Boolean(user?._id && followingLoading && !hasFollowingSnapshot);
    const isUpdatingFollow = Boolean(updatingFollowIds[curator._id]) || isInitialFollowSync;
    const avatarUrl = getImageUrl(
      curator.memberImage,
      DEFAULT_USER_AVATAR,
    );
    const isSelf = curator._id === user?._id;
    const stats = buildStats(curator, {
      followers: t("home.community.followers"),
      stays: t("home.community.stays"),
      tours: t("home.community.tours"),
      articles: t("home.community.articles"),
    });

    return (
      <article className="curator-card" style={{ height: "100%" }}>
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
              {tEnum("memberType", curator.memberType)}
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
  };

  return (
    <section className="curators-section">
      <div className="section-container">
        <RevealOnScroll distance={16}>
          <div className="section-header">
            <div>
              <span className="section-tag">{t("home.community.eyebrow")}</span>
              <h2 className="section-title">
                {t("home.community.title")}
              </h2>
            </div>
            <Link href="/community" className="section-link">
              <span>{t("home.community.explore")}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </RevealOnScroll>

        {loading && !curators.length ? <p className="curators-empty-state">{t("home.community.loading")}</p> : null}
        {!loading && error ? <p className="curators-empty-state">{t("home.community.unavailable")}</p> : null}

        {isMobile ? (
          <div className="curators-mobile-grid">
            {curators.slice(0, 4).map((curator: Member, index: number) => (
              <div key={curator._id} className="curator-grid-col">
                {renderCuratorCard(curator, index)}
              </div>
            ))}
          </div>
        ) : (
          <StaggerContainer className="curators-grid">
            {curators.map((curator: Member, index: number) => (
              <StaggerItem key={curator._id}>
                <HoverLift style={{ height: "100%" }}>
                  {renderCuratorCard(curator, index)}
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {!loading && !error && curators.length === 0 ? (
          <p className="curators-empty-state">{t("home.community.empty")}</p>
        ) : null}
      </div>
    </section>
  );
};

export default CommunityCurators;
