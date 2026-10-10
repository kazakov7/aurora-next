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
            const span = spans[index] ?? 4;
            const imageUrl = getImageUrl(destination.destinationImages?.[0]);
            const stays = destination.destinationProperties ?? 0;
            const tours = destination.destinationTours ?? 0;

            return (
              <Link
                key={destination._id}
                href={{
                  pathname: "/destination/detail",
                  query: { id: destination._id },
                }}
                className={`bento-card span-${span}`}
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
                    {destination.destinationCountry || "Global"}
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
                      <span className="stat">{stays} Stays</span>
                      <span className="stat-dot" aria-hidden="true" />
                      <span className="stat">{tours} Tours</span>
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
