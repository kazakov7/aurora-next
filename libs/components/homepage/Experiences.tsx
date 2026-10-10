import React from "react";
import Link from "next/link";
import { Tour } from "../../types/tour/tour";
import { getImageUrl } from "../../config";

interface ExperiencesProps {
  tours: Tour[];
  loading?: boolean;
  error?: Error;
}

const formatUsd = (price?: number) =>
  typeof price === "number" ? `$${price.toLocaleString()}` : "Price on request";

const Experiences = ({ tours, loading, error }: ExperiencesProps) => {
  return (
    <section className="experiences-section">
      <div className="section-container">
        <div className="section-header">
          <div>
            <span className="section-tag">Guided Immersions</span>
            <h2 className="section-title">Experiences Worth Taking</h2>
          </div>
          <Link href="/tour" className="section-link">
            <span>View curated tours</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="tours-grid">
          {loading ? (
            <p className="tours-empty-state">Loading top tours…</p>
          ) : null}
          {!loading && error ? (
            <p className="tours-empty-state">
              Top tours are unavailable right now.
            </p>
          ) : null}
          {tours.map((tour) => {
            const imageUrl = getImageUrl(tour.tourImages?.[0]);
            const departure = [
              tour.tourDepartureCity,
              tour.tourDepartureCountry,
            ]
              .filter(Boolean)
              .join(", ");
            const destination = tour.tourDestinationCity
              ? ` · To ${tour.tourDestinationCity}`
              : "";

            return (
              <Link
                key={tour._id}
                href={{ pathname: "/tour/detail", query: { id: tour._id } }}
                className="tour-card"
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
                      ? `${tour.tourCapacity} Guests Max`
                      : "Capacity unavailable"}
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
                      <span className="from-text">From</span>
                      <span className="price-text">
                        {formatUsd(tour.tourPrice)}
                      </span>
                    </div>
                    <span className="feature-badge">{tour.tourStatus}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {!loading && !error && tours.length === 0 ? (
            <p className="tours-empty-state">No ranked tours available yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Experiences;
