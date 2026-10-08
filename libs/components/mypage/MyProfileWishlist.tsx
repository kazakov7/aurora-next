import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_FAVORITES, GET_FAVORITE_TOURS } from "../../../apollo/user/query";
import {
  LIKE_TARGET_PROPERTY,
  LIKE_TARGET_TOUR,
} from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import {
  DEFAULT_PROPERTY_IMAGE,
  DEFAULT_TOUR_IMAGE,
  getImageUrl,
} from "../../config";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";
import { Property } from "../../types/property/property";
import { Tour } from "../../types/tour/tour";

import WishlistPlaceCard from "./WishlistPlaceCard";

const MyProfileWishlist: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activeTab, setActiveTab] = useState<"ALL" | "HOTELS" | "TOURS">("ALL");
  const [page, setPage] = useState(1);

  const handleTabChange = (tab: "ALL" | "HOTELS" | "TOURS") => {
    setActiveTab(tab);
    setPage(1);
  };

  /** APOLLO REQUESTS **/
  const [likePropertyMutation] = useMutation(LIKE_TARGET_PROPERTY);
  const [likeTourMutation] = useMutation(LIKE_TARGET_TOUR);

  const {
    data: propData,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProps,
  } = useQuery(GET_FAVORITES, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: page,
        limit: 6,
      },
    },
    skip: !user?._id,
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: tourData,
    loading: toursLoading,
    error: toursError,
    refetch: refetchTours,
  } = useQuery(GET_FAVORITE_TOURS, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: page,
        limit: 6,
      },
    },
    skip: !user?._id,
    notifyOnNetworkStatusChange: true,
  });

  const favoriteProperties: Property[] = propData?.getFavorites?.list || [];
  const favoriteTours: Tour[] = tourData?.getFavoriteTours?.list || [];

  const propTotal = propData?.getFavorites?.metaCounter?.[0]?.total || 0;
  const tourTotal = tourData?.getFavoriteTours?.metaCounter?.[0]?.total || 0;

  const combinedList = [
    ...favoriteProperties.map((property) => ({
      ...property,
      isTour: false as const,
    })),
    ...favoriteTours.map((tour) => ({ ...tour, isTour: true as const })),
  ];

  const displayList = combinedList
    .filter((item) => {
      if (activeTab === "HOTELS") return !item.isTour;
      if (activeTab === "TOURS") return item.isTour;
      return true;
    })
    .slice(0, 6);

  let totalItems = 0;
  if (activeTab === "HOTELS") {
    totalItems = propTotal;
  } else if (activeTab === "TOURS") {
    totalItems = tourTotal;
  } else {
    totalItems = propTotal + tourTotal;
  }
  const totalPages = Math.ceil(totalItems / 6) || 1;

  /** HANDLERS **/
  const handleRemoveFavorite = async (
    e: React.MouseEvent,
    item: (Property & { isTour: false }) | (Tour & { isTour: true }),
  ) => {
    e.stopPropagation();
    try {
      if (item.isTour) {
        await likeTourMutation({ variables: { tourId: item._id } });
        await refetchTours();
      } else {
        await likePropertyMutation({ variables: { propertyId: item._id } });
        await refetchProps();
      }
      sweetTopSmallSuccessAlert("Removed from Wishlist.", 800);
    } catch (err: any) {
      sweetMixinErrorAlert(err.message || "Action failed.");
    }
  };

  return (
    <div>
      {/* Top Control Bar */}
      <div className="section-top-bar">
        <div className="title-group">
          <h2>My Wishlist</h2>
          <span className="counter-pill">{totalItems} saved places</span>
        </div>
        <div className="bar-actions">
          <div
            className="category-pills"
            style={{ display: "flex", gap: "8px" }}
          >
            <button
              type="button"
              className={`cat-pill-btn ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => handleTabChange("ALL")}
            >
              All ({propTotal + tourTotal})
            </button>
            <button
              type="button"
              className={`cat-pill-btn ${
                activeTab === "HOTELS" ? "active" : ""
              }`}
              onClick={() => handleTabChange("HOTELS")}
            >
              Hotels ({propTotal})
            </button>
            <button
              type="button"
              className={`cat-pill-btn ${
                activeTab === "TOURS" ? "active" : ""
              }`}
              onClick={() => handleTabChange("TOURS")}
            >
              Tours ({tourTotal})
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist Cards Grid */}
      {(propertiesLoading || toursLoading) && !propData && !tourData ? (
        <div className="profile-empty-state">
          <div className="loading-spinner" />
          <p>Loading your wishlist...</p>
        </div>
      ) : propertiesError || toursError ? (
        <div className="profile-empty-state">
          <h3>Wishlist is unavailable</h3>
          <p>{propertiesError?.message || toursError?.message}</p>
        </div>
      ) : displayList.length > 0 ? (
        <div className="wishlist-cards-grid">
          {displayList.map((item) => {
            const isTour = item.isTour;
            const title = isTour ? item.tourName : item.propertyName;
            const location = isTour
              ? item.tourDestinationCity ||
                item.tourDepartureCity ||
                "Location not provided"
              : item.propertyAddress ||
                item.propertyCity ||
                "Location not provided";
            const price = isTour ? item.tourPrice : item.pricePerNight;
            const currency = isTour ? item.tourCurrency : item.currency;
            const images = isTour ? item.tourImages : item.propertyImages;
            const mappedImages =
              images && images.length > 0
                ? images.map((img: string) => getImageUrl(img))
                : [isTour ? DEFAULT_TOUR_IMAGE : DEFAULT_PROPERTY_IMAGE];
            const rating = isTour
              ? item.tourRating ?? 0
              : item.propertyRating ?? 0;
            const dateRange = isTour
              ? `${new Date(
                  item.tourStartDate,
                ).toLocaleDateString()} – ${new Date(
                  item.tourEndDate,
                ).toLocaleDateString()}`
              : item.propertyType;

            return (
              <WishlistPlaceCard
                key={item._id}
                images={mappedImages}
                tags={[isTour ? "TOUR" : "HOTEL"]}
                rating={rating}
                title={title}
                dateRange={dateRange}
                hostType={location}
                description={
                  (isTour ? item.tourDesc : item.propertyDesc) ||
                  "No description provided."
                }
                pricePerNight={price || 0}
                currency={currency || "KRW"}
                priceUnit={isTour ? "/ person" : "/ night"}
                isLiked={true}
                onLikeToggle={(e) => handleRemoveFavorite(e, item)}
                onClick={() =>
                  router.push(
                    isTour
                      ? `/tour/detail?id=${item._id}`
                      : `/property/detail?id=${item._id}`,
                  )
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="profile-empty-state">
          <div className="empty-icon">
            <span className="material-symbols-outlined">bookmark_border</span>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>
            Explore sanctuaries, architectural hotels, and private tours across
            the world to save them here.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <span className="pagination-info">
            Showing {(page - 1) * 6 + 1}–{Math.min(page * 6, totalItems)} of{" "}
            {totalItems} places
          </span>
          <div className="pagination-pills">
            <button
              type="button"
              className="nav-arrow-btn"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  type="button"
                  className={`page-num-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              className="nav-arrow-btn"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfileWishlist;
