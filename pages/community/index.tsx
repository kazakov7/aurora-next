import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import CommunityHeader from "../../libs/components/community/CommunityHeader";
import CommunityFilter, {
  COMMUNITY_CATEGORIES,
} from "../../libs/components/community/CommunityFilter";
import CommunityCard from "../../libs/components/community/CommunityCard";
import CommunitySidebar, {
  HostItem,
  AgencyItem,
} from "../../libs/components/community/CommunitySidebar";
import WriteStoryModal from "../../libs/components/community/WriteStoryModal";
import LoadingSpinner from "../../libs/components/common/LoadingSpinner";
import { BoardArticlesInquiry } from "../../libs/types/board-article/board-article.input";
import { BoardArticle } from "../../libs/types/board-article/board-article";
import { BoardArticleCategory } from "../../libs/enums/board-article.enum";
import { Direction, Message } from "../../libs/enums/common.enum";
import {
  GET_BOARD_ARTICLES,
  GET_PROPERTIES,
  GET_TOURS,
} from "../../apollo/user/query";
import { LIKE_TARGET_ARTICLE } from "../../apollo/user/mutation";
import { userVar } from "../../apollo/store";
import {
  sweetMixinErrorAlert,
} from "../../libs/sweetAlert";
import { useI18n } from "../../libs/i18n";

const categoryParamMap: Record<string, BoardArticleCategory | undefined> = {
  all: undefined,
  itineraries: BoardArticleCategory.TOUR,
  "hotel-reviews": BoardArticleCategory.HOTEL,
  photography: BoardArticleCategory.DESTINATION,
  expeditions: BoardArticleCategory.GUIDE,
  insights: BoardArticleCategory.NEWS,
};

const sortFieldMap: Record<string, string> = {
  Trending: "articleViews",
  Latest: "createdAt",
  "Top Rated": "articleLikes",
};

const defaultInput: BoardArticlesInquiry = {
  page: 1,
  limit: 6,
  sort: "articleViews",
  direction: Direction.DESC,
  search: {},
};

const CommunityPage: NextPage = () => {
  const { t, tError, tx } = useI18n();
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("Trending");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchFilter, setSearchFilter] =
    useState<BoardArticlesInquiry>(defaultInput);

  const [articles, setArticles] = useState<BoardArticle[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);

  // Like state tracking for reactive updates
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});

  // Real owners and agencies for sidebar
  const [realOwners, setRealOwners] = useState<HostItem[]>([]);
  const [realAgencies, setRealAgencies] = useState<AgencyItem[]>([]);

  /** APOLLO REQUESTS: ZERO MOCK / REAL GRAPHQL BACKEND DATA **/
  const [likeTargetArticle] = useMutation(LIKE_TARGET_ARTICLE);

  const {
    data,
    loading,
    error,
    refetch: refetchArticles,
  } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
  });

  // Query properties to extract real hotel hosts for sidebar
  const {
    data: propData,
    loading: propertiesLoading,
    error: propertiesError,
  } = useQuery(GET_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: { input: { page: 1, limit: 30, search: {} } },
  });

  // Query tours to extract real tour agencies for sidebar
  const {
    data: tourData,
    loading: toursLoading,
    error: toursError,
  } = useQuery(GET_TOURS, {
    fetchPolicy: "network-only",
    variables: { input: { page: 1, limit: 30, search: {} } },
  });

  /** PROCESS REAL OWNERS & AGENCIES **/
  useEffect(() => {
    if (propData?.getProperties?.list) {
      const memberCounts: Record<string, { member: any; count: number }> = {};
      propData.getProperties.list.forEach((prop: any) => {
        const m = prop.memberData;
        if (m?._id) {
          if (!memberCounts[m._id]) {
            memberCounts[m._id] = { member: m, count: 0 };
          }
          memberCounts[m._id].count += 1;
        }
      });

      const hosts: HostItem[] = Object.values(memberCounts).map(
        ({ member, count }) => ({
          id: member._id,
          name: member.memberFullName || member.memberNick || t("community.list.unnamedHost"),
          avatar: member.memberImage,
          subtitle: t("community.list.publishedProperties", { count }),
        }),
      );
      setRealOwners(hosts);
    }
  }, [propData]);

  useEffect(() => {
    if (tourData?.getTours?.list) {
      const memberTours: Record<string, { member: any; count: number }> = {};
      tourData.getTours.list.forEach((tour: any) => {
        const m = tour.memberData;
        if (m?._id) {
          if (!memberTours[m._id]) {
            memberTours[m._id] = {
              member: m,
              count: 0,
            };
          }
          memberTours[m._id].count += 1;
        }
      });

      const agencies: AgencyItem[] = Object.values(memberTours).map(
        ({ member, count }) => ({
          id: member._id,
          name:
            member.memberFullName || member.memberNick || t("community.list.unnamedOrganizer"),
          icon: "sailing",
          subtitle: t("community.list.publishedTours", { count }),
        }),
      );
      setRealAgencies(agencies);
    }
  }, [tourData]);

  /** LIFECYCLES: SYNC ARTICLES **/
  useEffect(() => {
    const list: BoardArticle[] = data?.getBoardArticles?.list;
    const meta = data?.getBoardArticles?.metaCounter?.[0]?.total;

    if (list) {
      setArticles(list);
      const newLikedMap: Record<string, boolean> = {};
      const newCountMap: Record<string, number> = {};
      list.forEach((art) => {
        const isLikedByMe =
          art.meLiked && art.meLiked.length > 0
            ? art.meLiked[0].myFavorite
            : false;
        newLikedMap[art._id] = !!isLikedByMe;
        newCountMap[art._id] = art.articleLikes || 0;
      });
      setLikedMap((prev) => ({ ...prev, ...newLikedMap }));
      setLikeCountMap((prev) => ({ ...prev, ...newCountMap }));
    }
    if (meta !== undefined) {
      setTotal(meta);
    }
  }, [data]);

  // Sync with router query parameters if user visits with query params
  useEffect(() => {
    if (router.query.cat && typeof router.query.cat === "string") {
      const catKey = router.query.cat;
      const categoryEnum = categoryParamMap[catKey];
      setSelectedCategoryKey(catKey);
      setSearchFilter((prev) => ({
        ...prev,
        page: 1,
        search: {
          ...prev.search,
          articleCategory: categoryEnum,
        },
      }));
    }
    if (router.query.sort && typeof router.query.sort === "string") {
      const sortVal = router.query.sort;
      const field = sortFieldMap[sortVal] || "articleViews";
      setSelectedSort(sortVal);
      setSearchFilter((prev) => ({
        ...prev,
        sort: field,
      }));
    }
  }, [router.query.cat, router.query.sort]);

  /** REAKTIV FILTRLASH & SARALASH (APPLY TUGMASISIZ BIR ZUMDA) **/
  const handleCategoryChange = async (
    catKey: string,
    categoryValue?: string,
  ) => {
    setSelectedCategoryKey(catKey);
    setCurrentPage(1);

    const updated: BoardArticlesInquiry = {
      ...searchFilter,
      page: 1,
      search: {
        ...searchFilter.search,
        articleCategory: categoryValue as BoardArticleCategory | undefined,
      },
    };

    setSearchFilter(updated);

    router.push(
      {
        pathname: "/community",
        query: {
          ...router.query,
          cat: catKey !== "all" ? catKey : undefined,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  const handleSortChange = async (sortOption: string) => {
    setSelectedSort(sortOption);
    const field = sortFieldMap[sortOption] || "articleViews";

    const updated: BoardArticlesInquiry = {
      ...searchFilter,
      sort: field,
      direction: Direction.DESC,
    };

    setSearchFilter(updated);

    router.push(
      {
        pathname: "/community",
        query: {
          ...router.query,
          sort: sortOption,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || (newPage - 1) * 6 >= total) return;
    setCurrentPage(newPage);
    setSearchFilter((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** LIKE INTERACTION WITH BACKEND GRAPHQL MUTATION **/
  const handleLikeArticle = async (articleId: string) => {
    if (!user?._id) {
      sweetMixinErrorAlert(t("community.list.loginToLike"));
      router.push({
        pathname: "/account/login",
        query: { referrer: router.asPath },
      });
      return;
    }

    const wasLiked = !!likedMap[articleId];
    const currentCount = likeCountMap[articleId] || 0;

    // Optimistic UI update
    setLikedMap((prev) => ({ ...prev, [articleId]: !wasLiked }));
    setLikeCountMap((prev) => ({
      ...prev,
      [articleId]: wasLiked
        ? Math.max(0, currentCount - 1)
        : currentCount + 1,
    }));

    try {
      await likeTargetArticle({
        variables: { input: articleId },
      });
      await refetchArticles();
    } catch (err: any) {
      setLikedMap((prev) => ({ ...prev, [articleId]: wasLiked }));
      setLikeCountMap((prev) => ({ ...prev, [articleId]: currentCount }));
      sweetMixinErrorAlert(tError(err, "community.likeFailed"));
    }
  };

  const totalPages = Math.ceil(total / (searchFilter.limit || 6)) || 1;

  return (
    <div className="community-page-wrapper">
      <Head>
        <title>{t("community.list.metaTitle")}</title>
        <meta
          name="description"
          content={t("community.header.intro")}
        />
      </Head>

      <main className="community-main-section">
        <div className="community-main-container">
          {/* Header Banner & Sort */}
          <CommunityHeader
            currentSort={selectedSort}
            onSortChange={handleSortChange}
            onOpenWriteModal={() => setIsWriteModalOpen(true)}
          />

          {/* Category Filter Pills */}
          <CommunityFilter
            selectedCategoryKey={selectedCategoryKey}
            onCategoryChange={handleCategoryChange}
          />

          {/* Main Two-Column Structure */}
          <div className="community-columns-layout">
            {/* LEFT COLUMN: Main Community Feed */}
            <section className="community-feed-column">
              {loading && articles.length === 0 ? (
                <div className="listing-loader-wrapper">
                  <LoadingSpinner size="lg" label={t("community.list.loading")} />
                </div>
              ) : error ? (
                <div className="community-empty-state">
                  <div className="empty-icon-wrap">
                    <span className="material-symbols-outlined icon">
                      error
                    </span>
                  </div>
                  <h3 className="empty-title">{t("community.list.unableToLoadDispatches")}</h3>
                  <p className="empty-desc">{error.message}</p>
                </div>
              ) : articles.length > 0 ? (
                <div className="community-cards-stack" style={{ position: "relative" }}>
                  {loading && (
                    <LoadingSpinner overlay size="md" label={t("common.updating")} />
                  )}
                  {articles.map((article) => (
                    <CommunityCard
                      key={article._id}
                      article={article}
                      onLike={handleLikeArticle}
                      isLiked={!!likedMap[article._id]}
                      likeCount={
                        likeCountMap[article._id] ?? article.articleLikes
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="community-empty-state">
                  <div className="empty-icon-wrap">
                    <span className="material-symbols-outlined icon">
                      auto_stories
                    </span>
                  </div>
                  <h3 className="empty-title">{t("community.list.noDispatchesFound")}</h3>
                  <p className="empty-desc">
                    {t("community.list.emptyText")}
                  </p>
                  <button
                    type="button"
                    className="empty-action-btn"
                    onClick={() => setIsWriteModalOpen(true)}
                  >
                    <span className="material-symbols-outlined">edit_note</span>
                    <span>{t("community.list.writeFirstStory")}</span>
                  </button>
                </div>
              )}

              {/* Pagination Controls */}
              {total > 0 && (
                <div className="community-pagination-bar">
                  <div className="pagination-info">
                    {tx("community.list.showingRange", {
                      range: (
                        <span className="bold">
                          {Math.min((currentPage - 1) * 6 + 1, total)}-{Math.min(currentPage * 6, total)}
                        </span>
                      ),
                      total: <span className="bold">{total}</span>,
                    })}
                  </div>

                  <div className="pagination-buttons">
                    <button
                      type="button"
                      className="page-nav-btn"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                      <span>{t("community.list.previous")}</span>
                    </button>

                    <div className="page-numbers">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            type="button"
                            className={`page-num-pill ${
                              currentPage === p ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="page-nav-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <span>{t("community.list.next")}</span>
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: 320px Sidebar */}
            <CommunitySidebar
              realOwners={realOwners}
              realAgencies={realAgencies}
              isLoading={propertiesLoading || toursLoading}
              hasError={Boolean(propertiesError || toursError)}
            />
          </div>
        </div>
      </main>

      {/* Write Story Modal */}
      <WriteStoryModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onCreated={() => refetchArticles()}
      />
    </div>
  );
};

export default withLayoutBasic(CommunityPage);
