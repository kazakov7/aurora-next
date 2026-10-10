import React, { useState } from "react";
import { Destination } from "../../../types/destination/destination";
import { sweetTopSmallSuccessAlert } from "../../../sweetAlert";
import { useI18n } from "../../../i18n";

interface DestinationAboutProps {
  destination: Destination;
  onLike: (destinationId: string) => void;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
}

const DestinationAbout = ({
  destination,
  onLike,
  isLiked,
  likesCount,
  commentsCount,
}: DestinationAboutProps) => {
  const { t, formatNumber } = useI18n();
  const [shareCopied, setShareCopied] = useState(false);
  const ratingValue =
    typeof destination.destinationRating === "number"
      ? destination.destinationRating.toFixed(1)
      : "—";
  const reviewsTotal = destination.destinationReviews ?? 0;
  const hasCoordinates =
    typeof destination.latitude === "number" &&
    typeof destination.longitude === "number";

  /** HANDLERS **/
  const handleShare = async () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;

    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    await sweetTopSmallSuccessAlert(t("common.linkCopied"), 900);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <section className="destination-about-section">
      <div className="about-grid-layout">
        <div className="editorial-col">
          <span className="editorial-eyebrow">
            {t("destinations.about.destinationOverview")}
          </span>
          <h1 className="editorial-heading">
            {t("destinations.about.discover", {
              destinationName: destination.destinationName,
            })}
          </h1>
          {destination.destinationDesc ? (
            <p className="editorial-paragraph">{destination.destinationDesc}</p>
          ) : (
            <p className="editorial-paragraph is-empty">
              {t("destinations.about.noDescription")}
            </p>
          )}

          <div
            className="about-stats-row"
            aria-label={t("destinations.about.destinationEngagement")}
          >
            <div className="about-stat">
              <span className="material-symbols-outlined">visibility</span>
              <strong>{formatNumber(destination.destinationViews ?? 0)}</strong>
              <span>{t("destinations.about.views")}</span>
            </div>
            <button
              type="button"
              className={`about-stat ${isLiked ? "liked" : ""}`}
              onClick={() => onLike(destination._id)}
              aria-label={t("destinations.about.likeDestination")}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                favorite
              </span>
              <strong>{formatNumber(likesCount)}</strong>
              <span>{t("destinations.about.likes")}</span>
            </button>
            <a
              href="#traveler-comments"
              className="about-stat"
              title={t("destinations.about.jumpToTravelerComments")}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <strong>{formatNumber(commentsCount)}</strong>
              <span>{t("destinations.about.comments")}</span>
            </a>
            <div className="about-stat rating">
              <span className="material-symbols-outlined">star</span>
              <strong>{ratingValue}</strong>
              <span>
                {t("destinations.about.reviews", {
                  reviewsTotal: formatNumber(reviewsTotal),
                })}
              </span>
            </div>
          </div>

          <div className="about-actions-row">
            <button
              type="button"
              className="about-action secondary"
              onClick={handleShare}
            >
              <span className="material-symbols-outlined">share</span>
              {shareCopied
                ? t("destinations.about.copiedLink")
                : t("common.share")}
            </button>
            <a href="#cities" className="about-action primary">
              {t("destinations.about.exploreCities")}
              <span className="material-symbols-outlined">arrow_downward</span>
            </a>
          </div>
        </div>

        <div className="quick-info-col">
          <div className="quick-info-card">
            <div className="icon-badge badge-primary">
              <span className="material-symbols-outlined">location_city</span>
            </div>
            <div className="card-info-content">
              <div className="card-kicker">{t("common.destination")}</div>
              <h3 className="card-heading">{destination.destinationName}</h3>
              <p className="card-desc">{destination.destinationCountry}</p>
            </div>
          </div>

          <div className="quick-info-card">
            <div className="icon-badge badge-secondary">
              <span className="material-symbols-outlined">hotel</span>
            </div>
            <div className="card-info-content">
              <div className="card-kicker">
                {t("destinations.about.availableStays")}
              </div>
              <h3 className="card-heading">
                {t("destinations.about.properties", {
                  destinationProperties: formatNumber(
                    destination.destinationProperties ?? 0,
                  ),
                })}
              </h3>
              <p className="card-desc">{t("destinations.about.staysNote")}</p>
            </div>
          </div>

          <div className="quick-info-card">
            <div className="icon-badge badge-surface">
              <span className="material-symbols-outlined">explore</span>
            </div>
            <div className="card-info-content">
              <div className="card-kicker">
                {t("destinations.about.availableTours")}
              </div>
              <h3 className="card-heading">
                {t("destinations.about.tours", {
                  destinationTours: formatNumber(
                    destination.destinationTours ?? 0,
                  ),
                })}
              </h3>
              <p className="card-desc">
                {hasCoordinates
                  ? `${destination.latitude?.toFixed(
                      4,
                    )}, ${destination.longitude?.toFixed(4)}`
                  : t("destinations.about.noCoordinates")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationAbout;
