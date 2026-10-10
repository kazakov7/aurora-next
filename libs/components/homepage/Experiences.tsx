import React, { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Keyboard } from "swiper";
import { Tour } from "../../types/tour/tour";
import { getImageUrl } from "../../config";
import { useI18n } from "../../i18n";
import { RevealOnScroll } from "../motion/RevealOnScroll";
import { HoverLift } from "../motion/HoverLift";

interface ExperiencesProps {
  tours: Tour[];
  loading?: boolean;
  error?: Error;
}

const formatUsd = (price: number | undefined, fallback: string) =>
  typeof price === "number" ? `$${price.toLocaleString("en-US")}` : fallback;

const Experiences = ({ tours, loading, error }: ExperiencesProps) => {
  const { t, tEnum } = useI18n();
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

  return (
    <section className="experiences-section">
      <div className="section-container">
        <RevealOnScroll distance={16}>
          <div className="section-header">
            <div>
              <span className="section-tag">{t("home.experiences.eyebrow")}</span>
              <h2 className="section-title">{t("home.experiences.title")}</h2>
            </div>
            <div className="section-header-controls">
              {tours.length > 2 ? (
                <>
                  <button
                    ref={(node) => setPrevEl(node)}
                    className="carousel-control-btn prev"
                    type="button"
                    aria-label={t("common.pagination.previous")}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    ref={(node) => setNextEl(node)}
                    className="carousel-control-btn next"
                    type="button"
                    aria-label={t("common.pagination.next")}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              ) : null}
              <Link href="/tour" className="section-link">
                <span>{t("home.experiences.browse")}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        {loading && !tours.length ? (
          <p className="tours-empty-state">{t("home.experiences.loading")}</p>
        ) : null}
        {!loading && error ? (
          <p className="tours-empty-state">{t("home.experiences.unavailable")}</p>
        ) : null}
        {!loading && !error && tours.length === 0 ? (
          <p className="tours-empty-state">{t("home.experiences.empty")}</p>
        ) : null}

        {tours.length > 0 ? (
          <div className="aurora-swiper-container">
            <Swiper
              modules={[Navigation, A11y, Keyboard]}
              navigation={{
                prevEl,
                nextEl,
              }}
              keyboard={{ enabled: true }}
              spaceBetween={14}
              slidesPerView={1.22}
              breakpoints={{
                480: { slidesPerView: 1.35, spaceBetween: 16 },
                680: { slidesPerView: 2.15, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1280: { slidesPerView: 4, spaceBetween: 24 },
              }}
            >
              {tours.map((tour) => {
                const imageUrl = getImageUrl(tour.tourImages?.[0]);
                const departure = [
                  tour.tourDepartureCity,
                  tour.tourDepartureCountry,
                ]
                  .filter(Boolean)
                  .join(", ");
                const destination = tour.tourDestinationCity
                  ? ` · ${t("home.experiences.to", { city: tour.tourDestinationCity })}`
                  : "";

                return (
                  <SwiperSlide key={tour._id}>
                    <HoverLift style={{ width: "100%", height: "100%" }}>
                      <Link
                        href={{ pathname: "/tour/detail", query: { id: tour._id } }}
                        className="tour-card"
                        style={{ width: "100%", height: "100%" }}
                      >
                        <div className="card-image-box">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={tour.tourName}
                              className="tour-img"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                          <span className="duration-badge">
                            {typeof tour.tourCapacity === "number"
                              ? t("home.experiences.capacity", { count: tour.tourCapacity })
                              : t("home.experiences.capacityUnavailable")}
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="rating-row">
                            <span className="material-symbols-outlined star-icon filled">
                              star
                            </span>
                            <span className="rating-text">
                              {typeof tour.tourRating === "number"
                                ? tour.tourRating.toFixed(2)
                                : "—"}{" "}
                              ({tour.tourReviews ?? 0})
                            </span>
                          </div>
                          <h3 className="tour-title">{tour.tourName}</h3>
                          {departure || destination ? (
                            <p className="tour-subtitle">
                              {departure}
                              {destination}
                            </p>
                          ) : null}
                          <div className="tour-footer">
                            <div className="price-col">
                              <span className="from-text">{t("home.experiences.from")}</span>
                              <span className="price-text">
                                {formatUsd(
                                  tour.tourPrice,
                                  t("home.experiences.priceOnRequest")
                                )}
                              </span>
                            </div>
                            <span className="feature-badge">
                              {tEnum("tourStatus", tour.tourStatus)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </HoverLift>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Experiences;
