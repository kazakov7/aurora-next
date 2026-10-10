import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper";
import { Destination } from "../../types/destination/destination";
import { getImageUrl } from "../../config";
import { ApolloError } from "@apollo/client";
import { useI18n } from "../../i18n";
import { RevealOnScroll } from "../motion/RevealOnScroll";
import { StaggerContainer } from "../motion/StaggerContainer";
import { StaggerItem } from "../motion/StaggerItem";
import useDeviceDetect from "../../hooks/useDeviceDetect";

interface TrendingDestinationsProps {
  destinations: Destination[];
  loading?: boolean;
  error?: ApolloError;
}

/** Kartalar soni bo'yicha 12-ustunli gridni teng bo'lib to'ldiruvchi shablonlar **/
const SPAN_OVERRIDES: Record<number, number[]> = {
  1: [12],
  2: [6, 6],
  3: [4, 4, 4],
  4: [6, 6, 6, 6],
  5: [4, 4, 4, 6, 6],
  6: [4, 4, 4, 4, 4, 4],
};

const buildSpans = (total: number): number[] => {
  if (total <= 0) return [];
  const override = SPAN_OVERRIDES[total];
  if (override) return override;

  return Array.from({ length: total }, () => 4);
};

const TrendingDestinations = ({
  destinations,
  loading,
  error,
}: TrendingDestinationsProps) => {
  const { t } = useI18n();
  const device = useDeviceDetect();
  const isMobile = device === "mobile";
  const visibleDestinations = destinations.slice(0, 6);
  const spans = buildSpans(visibleDestinations.length);

  const renderCard = (destination: Destination, index: number) => {
    const imageUrl = getImageUrl(destination.destinationImages?.[0]);
    const stays = destination.destinationProperties ?? 0;
    const tours = destination.destinationTours ?? 0;

    return (
      <Link
        href={{
          pathname: "/destination/detail",
          query: { id: destination._id },
        }}
        className="bento-card"
      >
        <span
          className="card-bg"
          style={
            imageUrl
              ? { backgroundImage: `url(${imageUrl})` }
              : undefined
          }
          aria-hidden="true"
        />
        <span className="card-scrim" aria-hidden="true" />

        {/* Top Glassmorphic Badges */}
        <div className="card-top-bar">
          <span className="card-chip-country">
            <span className="material-symbols-outlined chip-icon">location_on</span>
            {destination.destinationCountry || t("home.trending.global")}
          </span>
          <span className="card-chip-index">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Modern Bottom Content */}
        <div className="card-content">
          <h3 className="card-heading">
            {destination.destinationName}
          </h3>

          <div className="card-footer">
            <div className="card-stats">
              <span className="stat">{t("home.trending.stays", { count: stays })}</span>
              <span className="stat-dot" aria-hidden="true" />
              <span className="stat">{t("home.trending.tours", { count: tours })}</span>
            </div>

            <span className="card-action-btn" aria-hidden="true">
              <span className="material-symbols-outlined cue-icon">
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="trending-destinations-section">
      <div className="section-container">
        <RevealOnScroll distance={16}>
          <div className="section-header">
            <div>
              <span className="section-tag">{t("home.trending.eyebrow")}</span>
              <h2 className="section-title">{t("home.trending.title")}</h2>
            </div>
            <Link href="/destination" className="section-link">
              <span>{t("home.trending.exploreAll")}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </RevealOnScroll>

        {loading ? (
          <p className="bento-empty-state">{t("home.trending.loading")}</p>
        ) : null}
        {!loading && error ? (
          <p className="bento-empty-state">
            {t("home.trending.unavailable")}
          </p>
        ) : null}

        {isMobile ? (
          <div className="trending-mobile-swiper">
            <Swiper
              modules={[A11y, Keyboard]}
              keyboard={{ enabled: true }}
              spaceBetween={14}
              slidesPerView={1.22}
              slidesOffsetBefore={16}
              slidesOffsetAfter={16}
            >
              {visibleDestinations.map((destination, index) => (
                <SwiperSlide key={destination._id}>
                  {renderCard(destination, index)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <StaggerContainer className="bento-grid">
            {visibleDestinations.map((destination, index) => {
              const span = spans[index] ?? 4;
              return (
                <StaggerItem
                  key={destination._id}
                  className={`bento-item span-${span}`}
                >
                  {renderCard(destination, index)}
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {!loading && !error && destinations.length === 0 ? (
          <p className="bento-empty-state">
            {t("home.trending.empty")}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default TrendingDestinations;
