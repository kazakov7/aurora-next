import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import {
  GET_DESTINATION,
  GET_PROPERTY_HOST,
} from "../../../../apollo/user/query";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { getJwtToken } from "../../../auth";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../../config";
import { Destination } from "../../../types/destination/destination";
import { Message } from "../../../enums/common.enum";
import { MemberType } from "../../../enums/member.enum";
import { Property } from "../../../types/property/property";
import { sweetErrorAlert } from "../../../sweetAlert";
import FollowButton from "../../common/FollowButton";
import { useI18n } from "../../../i18n";

interface PropertyOverviewProps {
  property: Property;
}

const amenityIconMap: Record<string, string> = {
  wifi: "wifi",
  pool: "pool",
  sauna: "sauna",
  kitchen: "countertops",
  "air conditioning": "ac_unit",
  heating: "thermostat",
  elevator: "elevator",
  "ocean view": "water",
  "mountain view": "landscape",
  spa: "hot_tub",
  fireplace: "fireplace",
  gym: "fitness_center",
  parking: "local_parking",
  concierge: "room_service",
  breakfast: "bakery_dining",
};

const PropertyOverview = ({ property }: PropertyOverviewProps) => {
  const { t, tEnum, tError, tValue, formatNumber } = useI18n();
  const [descExpanded, setDescExpanded] = useState(false);
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const amenities = property.amenities || [];
  const [subscribe, { loading: subscribing }] = useMutation(SUBSCRIBE);
  const [unsubscribe, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);
  const { data: destinationData } = useQuery<{ getDestination?: Destination }>(
    GET_DESTINATION,
    {
      fetchPolicy: "cache-and-network",
      variables: { destinationId: property.destinationId },
      skip: !property.destinationId,
    },
  );
  const { data: hostData, refetch: refetchHost } = useQuery(GET_PROPERTY_HOST, {
    fetchPolicy: "network-only",
    variables: { input: property.memberId },
    skip: !property.memberId,
  });
  const destination = destinationData?.getDestination;
  const host = hostData?.getMember || property.memberData;
  const hostName =
    host?.memberFullName || host?.memberNick || t("hotels.overview.host");
  const hostImage = getImageUrl(host?.memberImage, DEFAULT_USER_AVATAR);
  const isOwnHostProfile = user?._id === host?._id;
  const isFollowing = Boolean(host?.meFollowed?.[0]?.myFollowing);
  const isFollowUpdating = subscribing || unsubscribing;
  const hasCoordinates =
    typeof destination?.latitude === "number" &&
    typeof destination?.longitude === "number";
  const latitude = destination?.latitude ?? 0;
  const longitude = destination?.longitude ?? 0;
  const mapBounds = `${longitude - 0.012},${latitude - 0.008},${
    longitude + 0.012
  },${latitude + 0.008}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    mapBounds,
  )}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

  /** HANDLERS **/
  const handleFollow = async () => {
    if (!host?._id || isOwnHostProfile) return;
    if (!user?._id || !getJwtToken()) {
      await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
      return;
    }

    try {
      const mutationOptions = { variables: { input: host._id } };
      if (isFollowing) await unsubscribe(mutationOptions);
      else await subscribe(mutationOptions);
      await refetchHost();
    } catch (error: unknown) {
      await sweetErrorAlert(tError(error, "common.followUpdateFailed"));
    }
  };

  const handleMessageHost = async () => {
    if (!host?._id || isOwnHostProfile) return;
    if (!user?._id || !getJwtToken()) {
      await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
      void router.push("/account/login");
      return;
    }
    void router.push(`/chat?memberId=${host._id}`);
  };

  return (
    <div className="left-column-content">
      <div className="detail-card overview-specs-card">
        <div className="specs-card-header">
          <div>
            <h2 className="specs-heading">
              {tEnum("propertyType", property.propertyType)}
            </h2>
            <p className="specs-subtext">{t("hotels.overview.hotelDetails")}</p>
          </div>
        </div>
        <div className="quick-specs-grid">
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">groups</span>
            <div className="spec-details">
              <span className="spec-label">{t("common.capacity")}</span>
              <span className="spec-value">
                {t("hotels.overview.guests", { maxGuests: property.maxGuests })}
              </span>
            </div>
          </div>
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">
              king_bed
            </span>
            <div className="spec-details">
              <span className="spec-label">
                {t("hotels.overview.bedrooms")}
              </span>
              <span className="spec-value">
                {t("hotels.overview.bedroomsCount", {
                  bedrooms: property.bedrooms,
                })}
              </span>
            </div>
          </div>
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">bed</span>
            <div className="spec-details">
              <span className="spec-label">{t("hotels.overview.beds")}</span>
              <span className="spec-value">
                {t("hotels.overview.bedsCount", { beds: property.beds })}
              </span>
            </div>
          </div>
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">bathtub</span>
            <div className="spec-details">
              <span className="spec-label">
                {t("hotels.overview.bathrooms")}
              </span>
              <span className="spec-value">
                {t("hotels.overview.bathsCount", {
                  bathrooms: property.bathrooms,
                })}
              </span>
            </div>
          </div>
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">
              favorite
            </span>
            <div className="spec-details">
              <span className="spec-label">{t("hotels.overview.savedBy")}</span>
              <span className="spec-value">
                {t("hotels.overview.travelers", {
                  count: property.propertyLikes,
                  formatted: formatNumber(property.propertyLikes),
                })}
              </span>
            </div>
          </div>
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">
              visibility
            </span>
            <div className="spec-details">
              <span className="spec-label">{t("common.views")}</span>
              <span className="spec-value">
                {formatNumber(property.propertyViews)}
              </span>
            </div>
          </div>
          <div className="spec-chip">
            <span className="material-symbols-outlined spec-icon">
              confirmation_number
            </span>
            <div className="spec-details">
              <span className="spec-label">{t("common.bookings")}</span>
              <span className="spec-value">
                {formatNumber(property.propertyBookings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-card description-card">
        <h3 className="section-title">{t("hotels.overview.aboutThisHotel")}</h3>
        {property.propertyDesc ? (
          <>
            <div
              className={`description-body ${descExpanded ? "expanded" : ""}`}
            >
              <p>{property.propertyDesc}</p>
            </div>
            {property.propertyDesc.length > 280 ? (
              <button
                className="read-more-toggle"
                type="button"
                onClick={() => setDescExpanded((current) => !current)}
              >
                <span>
                  {descExpanded
                    ? t("hotels.overview.showLess")
                    : t("hotels.overview.readMore")}
                </span>
                <span className="material-symbols-outlined">
                  {descExpanded ? "expand_less" : "expand_more"}
                </span>
              </button>
            ) : null}
          </>
        ) : (
          <p className="detail-empty-copy">
            {t("hotels.overview.noDescription")}
          </p>
        )}
      </div>

      <div className="detail-card amenities-card">
        <div className="amenities-header">
          <h3 className="section-title">{t("common.amenities")}</h3>
          <span className="amenities-count">
            {t("hotels.overview.included", { count: amenities.length })}
          </span>
        </div>
        {amenities.length ? (
          <div className="amenities-grid">
            {amenities.map((amenity) => {
              const key = Object.keys(amenityIconMap).find((item) =>
                amenity.toLowerCase().includes(item),
              );
              return (
                <div key={amenity} className="amenity-item">
                  <span className="material-symbols-outlined amenity-icon">
                    {key ? amenityIconMap[key] : "check_circle"}
                  </span>
                  <span className="amenity-name">
                    {tValue("amenities", amenity)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="detail-empty-copy">
            {t("hotels.overview.noAmenities")}
          </p>
        )}
      </div>

      <div className="detail-card location-card">
        <div className="location-header">
          <div>
            <h3 className="section-title">{t("common.location")}</h3>
            <p className="location-address">
              {[property.propertyAddress, property.propertyCity]
                .filter(Boolean)
                .join(", ") || t("hotels.overview.noLocation")}
            </p>
          </div>
        </div>
        {hasCoordinates ? (
          <div className="map-preview-banner">
            <iframe
              className="location-map-frame"
              src={mapUrl}
              title={t("hotels.overview.locationMap", {
                propertyName: property.propertyName,
              })}
              loading="lazy"
            />
            <a
              className="map-open-link"
              href={mapLink}
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              {t("hotels.overview.openMap")}
            </a>
          </div>
        ) : (
          <p className="detail-empty-copy">
            {t("hotels.overview.noCoordinates")}
          </p>
        )}
      </div>

      <div className="detail-card host-profile-card">
        <div className="host-card-inner">
          <div className="host-main-info">
            <div className="host-avatar-wrapper">
              <img src={hostImage} alt={hostName} className="host-avatar" />
            </div>
            <div className="host-text-details">
              <div className="host-name-row">
                <h3 className="host-name">{hostName}</h3>
                {host?.memberType === MemberType.AGENT ? (
                  <span className="host-agent-badge">
                    <span className="material-symbols-outlined">verified</span>
                    {t("common.agent")}
                  </span>
                ) : null}
              </div>
              <p className="host-title">
                {host?.memberType === MemberType.AGENT
                  ? t("hotels.overview.verifiedAccommodationAgent")
                  : t("hotels.overview.propertyHost")}
              </p>
              {host?.memberDesc ? (
                <p className="host-description">{host.memberDesc}</p>
              ) : null}
              <div className="host-metrics-row">
                <span className="metric-text">
                  <strong>{host?.memberFollowers ?? 0}</strong>{" "}
                  {t("common.followers")}
                </span>
                <span className="metric-sep">•</span>
                <span className="metric-text">
                  <strong>{host?.memberProperties ?? 0}</strong>{" "}
                  {t("navigation.hotels")}
                </span>
              </div>
            </div>
          </div>
          <div className="host-action-buttons">
            {host?._id ? (
              <Link
                className="host-btn secondary-btn"
                href={`/member?memberId=${host._id}`}
              >
                {t("hotels.overview.viewProfile")}
              </Link>
            ) : null}
            {!isOwnHostProfile && host?._id ? (
              <button
                className="host-btn chat-btn"
                type="button"
                onClick={() => void handleMessageHost()}
              >
                <span className="material-symbols-outlined">chat</span>
                {t("common.message")}
              </button>
            ) : null}
            {!isOwnHostProfile && host?._id ? (
              <FollowButton
                isFollowing={isFollowing}
                isLoading={isFollowUpdating}
                onClick={handleFollow}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;
