import React from "react";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "../../../apollo/store";
import { Property } from "../../types/property/property";
import { DEFAULT_PROPERTY_IMAGE, getImageUrl } from "../../config";
import { parseApiDate } from "../../utils";
import LikeButton from "../common/LikeButton";
import { useI18n } from "../../i18n";

interface PropertyCardProps {
  property: Property;
  index?: number;
  likePropertyHandler: (e: React.MouseEvent, id: string) => void;
}

/** Badge is derived only from real listing metrics; no badge when nothing qualifies **/
const NEW_LISTING_DAYS = 30;
const getListingBadge = (
  property: Property,
): { labelKey: string; className: string } | null => {
  if (
    (property.propertyReviews ?? 0) > 0 &&
    (property.propertyRating ?? 0) >= 4.5
  )
    return { labelKey: "hotels.card.badgeTopRated", className: "best-price" };
  if ((property.propertyBookings ?? 0) >= 5)
    return { labelKey: "hotels.card.badgePopular", className: "popular" };
  // The API sends createdAt as an epoch-millisecond string, which `new Date()` alone cannot parse
  const createdAt = parseApiDate(property.createdAt)?.getTime() ?? NaN;
  if (
    !Number.isNaN(createdAt) &&
    Date.now() - createdAt < NEW_LISTING_DAYS * 24 * 60 * 60 * 1000
  )
    return { labelKey: "hotels.card.new", className: "rare-find" };
  return null;
};

const PropertyCard = ({ property, likePropertyHandler }: PropertyCardProps) => {
  const { t, tEnum } = useI18n();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const isLiked = Boolean(property?.meLiked?.[0]?.myFavorite);

  const imageSrc = getImageUrl(
    property.propertyImages?.[0],
    DEFAULT_PROPERTY_IMAGE,
  );
  const badge = getListingBadge(property);
  const reviewsCount = property.propertyReviews ?? 0;
  const ratingVal =
    reviewsCount > 0 && property.propertyRating
      ? property.propertyRating.toFixed(2)
      : "";
  const address = [property.propertyCity, property.propertyAddress]
    .filter(Boolean)
    .join(", ");

  /** HANDLERS **/
  const pushDetailHandler = () => {
    router.push({
      pathname: "/property/detail",
      query: { id: property._id },
    });
  };

  return (
    <article className="hotel-card" onClick={pushDetailHandler}>
      <div className="card-image-wrapper">
        <img
          src={imageSrc}
          alt={property.propertyName}
          className="card-img"
          onError={(e: any) => {
            if (!e.target.src.endsWith(DEFAULT_PROPERTY_IMAGE))
              e.target.src = DEFAULT_PROPERTY_IMAGE;
          }}
        />
        {badge && (
          <div className={`card-badge-pill ${badge.className}`}>
            {t(badge.labelKey)}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
          }}
        >
          <LikeButton
            isLiked={isLiked}
            onClick={(e) => likePropertyHandler(e, property._id)}
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>

      <div className="card-content">
        <div className="card-top-section">
          <div className="title-rating-row">
            <h3 className="card-title">{property.propertyName}</h3>
            <div className="card-rating">
              <span className="star-icon">★</span>
              {ratingVal ? (
                <>
                  <span className="rating-value">{ratingVal}</span>
                  <span className="reviews-count">({reviewsCount})</span>
                </>
              ) : (
                <span className="rating-value">{t("hotels.card.new")}</span>
              )}
            </div>
          </div>

          <div className="location-info-row">
            <span className="distance-info">
              {t("hotels.card.upToGuests", { maxGuests: property.maxGuests ?? 0 })}
            </span>
            <span className="distance-info">
              {t("hotels.card.bedroomsBeds", { bedrooms: property.bedrooms ?? 0, beds: property.beds ?? 0 })}
            </span>
          </div>

          <div className="card-divider"></div>

          {address && (
            <div className="address-row">
              <span className="material-symbols-outlined">pin_drop</span>
              <span className="address-text">{address}</span>
            </div>
          )}

          <div className="tags-row">
            {property.propertyType && (
              <span className="tag-pill">{tEnum("propertyType", property.propertyType)}</span>
            )}
            {property.amenities && property.amenities[0] && (
              <span className="tag-pill">{property.amenities[0]}</span>
            )}
          </div>
        </div>

        <div className="card-bottom-section">
          <div className="card-divider"></div>
          <div className="price-reserve-row">
            <div className="price-box">
              <div className="price-main">
                <span className="price-prefix">{t("common.from")}</span>
                <span className="price-amount">
                  ${property.pricePerNight?.toLocaleString("en-US")}
                </span>
                <span className="price-suffix">{t("common.perNight")}</span>
              </div>
              <span className="price-sub">{t("hotels.card.taxesIncluded")}</span>
            </div>
            <button
              className="reserve-action-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pushDetailHandler();
              }}
            >
              {t("booking.reserve")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
