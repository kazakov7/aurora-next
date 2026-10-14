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
} from "../../sweetAlert";
import { Property } from "../../types/property/property";
import { Tour } from "../../types/tour/tour";

import WishlistPlaceCard from "./WishlistPlaceCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { useI18n } from "../../i18n";

const MyProfileWishlist: React.FC = () => {
  const { t, tError, formatDate } = useI18n();
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
        page: 1,
        limit: 50,
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
        page: 1,
        limit: 50,
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
    ;

  let totalItems = 0;
  if (activeTab === "HOTELS") {
    totalItems = propTotal;
  } else if (activeTab === "TOURS") {
    totalItems = tourTotal;
  } else {
    totalItems = propTotal + tourTotal;
  }
  
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
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err, "common.actionFailed"));
    }
  };

  return (
    <div>
      {/* Top Control Bar */}
      <div className="section-top-bar">
        <div className="title-group">
          <h2>{t("profile.wishlist.myWishlist")}</h2>
          <span className="counter-pill">{t("profile.wishlist.savedPlaces", { totalItems })}</span>
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
              {t("profile.wishlist.tabAll", { propTotal: propTotal + tourTotal })}
            </button>
            <button
              type="button"
              className={`cat-pill-btn ${
                activeTab === "HOTELS" ? "active" : ""
              }`}
              onClick={() => handleTabChange("HOTELS")}
            >
              {t("profile.wishlist.tabHotels", { propTotal })}
            </button>
            <button
              type="button"
              className={`cat-pill-btn ${
                activeTab === "TOURS" ? "active" : ""
              }`}
              onClick={() => handleTabChange("TOURS")}
            >
              {t("profile.wishlist.tabTours", { tourTotal })}
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist Cards Grid */}
      {(propertiesLoading || toursLoading) && !propData && !tourData ? (
        <div className="profile-empty-state">
          <div className="loading-spinner" />
          <p>{t("profile.wishlist.loading")}</p>
        </div>
      ) : propertiesError || toursError ? (
        <div className="profile-empty-state">
          <h3>{t("profile.wishlist.unavailable")}</h3>
          <p>{propertiesError?.message || toursError?.message}</p>
        </div>
      ) : displayList.length > 0 ? (
        <div className="wishlist-cards-grid" style={{ position: "relative" }}>
          {(propertiesLoading || toursLoading) && (
            <LoadingSpinner overlay size="md" label={t("common.updating")} />
          )}
          {displayList.map((item) => {
            const isTour = item.isTour;
            const title = isTour ? item.tourName : item.propertyName;
            const location = isTour
              ? item.tourDestinationCity ||
                item.tourDepartureCity ||
                t("common.locationNotProvided")
              : item.propertyAddress ||
                item.propertyCity ||
                t("common.locationNotProvided");
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
              ? `${formatDate(item.tourStartDate)} – ${formatDate(item.tourEndDate)}`
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
                  t("profile.wishlist.noDescriptionProvided")
                }
                pricePerNight={price || 0}
                currency={currency || "USD"}
                priceUnit={isTour ? t("profile.wishlist.perPerson") : t("common.perNight")}
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
          <h3>{t("profile.wishlist.emptyTitle")}</h3>
          <p>
            {t("profile.wishlist.emptyText")}
          </p>
        </div>
      )}

      
    </div>
  );
};

export default MyProfileWishlist;
