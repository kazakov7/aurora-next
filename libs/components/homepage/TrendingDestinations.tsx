import React from "react";
import Link from "next/link";
import { Destination } from "../../types/destination/destination";
import { getImageUrl } from "../../config";
import { ApolloError } from "@apollo/client";

interface TrendingDestinationsProps {
  destinations: Destination[];
  loading?: boolean;
  error?: ApolloError;
}

type CardVariant = "wide" | "feature" | "compact";

/** Kartalar soni kam bo'lganda gridni teng bo'lib to'ldiruvchi shablonlar **/
const SPAN_OVERRIDES: Record<number, number[]> = {
  1: [12],
  2: [6, 6],
  3: [4, 4, 4],
};

/** Asosiy bento ritmi — joy nomiga emas, faqat pozitsiyaga bog'langan **/
const SPAN_RHYTHM = [7, 5, 4, 8];

/**
 * Har bir karta uchun ustun kengligini hisoblaydi. Oxirgi qator to'liq
 * bo'lmasa, oxirgi karta qolgan joyni egallaydi — shunda API nechta
 * destination qaytarishidan qat'i nazar grid teshiksiz chiqadi.
 */
const buildSpans = (total: number): number[] => {
  if (total <= 0) return [];

  const override = SPAN_OVERRIDES[total];
  if (override) return override;

  const spans = Array.from(
    { length: total },
    (_, index) => SPAN_RHYTHM[index % SPAN_RHYTHM.length],
  );

  let rowUsed = 0;
  spans.forEach((span) => {
    if (rowUsed + span > 12) rowUsed = 0;
    rowUsed += span;
  });
  if (rowUsed < 12) spans[spans.length - 1] += 12 - rowUsed;

  return spans;
};

const getVariant = (span: number): CardVariant => {
  if (span >= 8) return "wide";
  if (span === 7) return "feature";
  return "compact";
};

const TrendingDestinations = ({
  destinations,
  loading,
  error,
}: TrendingDestinationsProps) => {
  const spans = buildSpans(destinations.length);

  return (
    <section className="trending-destinations-section">
      <div className="section-container">
        <div className="section-header">
          <div>
            <span className="section-tag">Curation Grid</span>
            <h2 className="section-title">Trending Destinations</h2>
          </div>
          <Link href="/destination" className="section-link">
            <span>Explore all destinations</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="bento-grid">
          {loading ? (
            <p className="bento-empty-state">Loading destinations…</p>
          ) : null}
          {!loading && error ? (
            <p className="bento-empty-state">
              Destinations are unavailable right now.
            </p>
          ) : null}
          {destinations.map((destination, index) => {
            const span = spans[index] ?? 6;
            const variant = getVariant(span);
            const imageUrl = getImageUrl(destination.destinationImages?.[0]);
            const stays = destination.destinationProperties;
            const tours = destination.destinationTours;
            const hasStays = typeof stays === "number";
            const hasTours = typeof tours === "number";

            return (
              <Link
                key={destination._id}
                href={{
                  pathname: "/destination/detail",
                  query: { id: destination._id },
                }}
                className={`bento-card is-${variant} span-${span}`}
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
                <span className="card-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="card-content">
                  {destination.destinationCountry ? (
                    <span className="card-overline">
                      {destination.destinationCountry}
                    </span>
                  ) : null}

                  <h3 className="card-heading">
                    {destination.destinationName}
                  </h3>

                  {variant !== "compact" && destination.destinationDesc ? (
                    <p className="card-desc">{destination.destinationDesc}</p>
                  ) : null}

                  <div className="card-footer">
                    <span className="card-stats">
                      {hasStays ? (
                        <span className="stat">{stays} Stays</span>
                      ) : null}
                      {hasStays && hasTours ? (
                        <span className="stat-dot" aria-hidden="true" />
                      ) : null}
                      {hasTours ? (
                        <span className="stat">{tours} Tours</span>
                      ) : null}
                    </span>

                    <span className="card-cue" aria-hidden="true">
                      <span className="cue-label">View collection</span>
                      <span className="material-symbols-outlined cue-icon">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {!loading && !error && destinations.length === 0 ? (
            <p className="bento-empty-state">
              No ranked destinations available yet.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinations;
