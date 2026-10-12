import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_AGENT_TOURS } from "../../../../apollo/user/query";
import { TourStatus } from "../../../enums/tour.enum";
import { Direction } from "../../../enums/common.enum";
import { useRouter } from "next/router";
import { DEFAULT_TOUR_IMAGE, getImageUrl } from "../../../../libs/config";
import { Tour } from "../../../types/tour/tour";
import AgentTourForm from "./AgentTourForm";
import moment from "moment";
import { sweetErrorHandling } from "../../../../libs/sweetAlert";
import { useI18n } from "../../../i18n";

const MyTours = () => {
  const { tEnum, t, formatDate, tx } = useI18n();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tourStatus, setTourStatus] = useState<TourStatus | "">("");
  const [formTarget, setFormTarget] = useState<Tour | null | undefined>(undefined);

  const { data, loading, refetch } = useQuery(GET_AGENT_TOURS, {
    fetchPolicy: "network-only",
    onError: (err) => sweetErrorHandling(err),
    variables: {
      input: {
        page,
        limit: 10,
        sort: "createdAt",
        direction: Direction.DESC,
        search: {
          ...(tourStatus && { tourStatus }),
        },
      },
    },
  });

  const tours = data?.getAgentTours?.list || [];
  const total = data?.getAgentTours?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  /** HANDLERS **/
  const handleAddTour = () => setFormTarget(null);
  const handleFormSaved = () => {
    setFormTarget(undefined);
    void refetch();
  };

  return (
    <div className="agent-management-page">
      <div className="agent-header-card">
        <div className="header-top">
          <div className="title-box">
            <div className="title-row">
              <h2>{t("agent.myTours.myTours")}</h2>
              <span className="count-badge">{t("agent.myTours.packages", { total })}</span>
            </div>
            <p>{t("agent.myTours.intro")}</p>
          </div>
          <button onClick={handleAddTour} className="add-btn">
            <span className="material-symbols-outlined">add</span>
            {t("agent.addTour")}
          </button>
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("agent.myTours.searchPlaceholder")}
              type="text"
              disabled
              title={t("agent.textSearchUnsupported")}
            />
          </div>
          <div className="select-box">
            <select
              value={tourStatus}
              onChange={(e) => setTourStatus(e.target.value as TourStatus)}
            >
              <option value="">{t("common.allStatuses")}</option>
              {Object.values(TourStatus).map(ts => (
                <option key={ts} value={ts}>{tEnum("tourStatus", ts)}</option>
              ))}
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      <div className="agent-table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t("agent.myTours.tourPackage")}</th>
                <th>{t("agent.myTours.dates")}</th>
                <th>{t("common.capacity")}</th>
                <th>{t("agent.myTours.pricePerson")}</th>
                <th>{t("common.status")}</th>
                <th style={{ textAlign: 'right' }}>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>{t("agent.myTours.loadingTours")}</td>
                </tr>
              ) : tours.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>{t("agent.myTours.noToursFound")}</td>
                </tr>
              ) : (
                tours.map((tour: any) => (
                  <tr key={tour._id}>
                    <td>
                      <div className="item-cell">
                        <img
                          src={getImageUrl(tour?.tourImages?.[0], DEFAULT_TOUR_IMAGE)}
                          alt={tour.tourName}
                        />
                        <div className="item-info">
                          <span className="item-name" onClick={() => router.push(`/tour/detail?id=${tour._id}`)}>
                            {tour.tourName}
                          </span>
                          <span className="item-loc" style={{ marginTop: '4px' }}>
                            {[tour.tourDestinationCity, tour.tourDepartureCountry].filter(Boolean).join(' · ') || t("common.locationNotProvided")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {formatDate(tour.tourStartDate, "short")} – {formatDate(tour.tourEndDate, "medium")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price" style={{ fontSize: '14px' }}>
                          {t("agent.myTours.booked", { tourReservedSeats: tour.tourReservedSeats || 0, tourCapacity: tour.tourCapacity })}
                        </span>
                        <span className="unit" style={{ color: tour.tourReservedSeats >= tour.tourCapacity ? '#ba1a1a' : '#006194', fontWeight: 600 }}>
                          {t("agent.myTours.seatsLeft", { math: Math.max(0, tour.tourCapacity - (tour.tourReservedSeats || 0)) })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price">${Number(tour.tourPrice || 0).toLocaleString("en-US")}</span>
                        <span className="unit">{tour.tourCurrency}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${tour.tourStatus === TourStatus.ACTIVE ? 'active' : 'pending'}`}>
                        <span className="dot"></span>
                        {tEnum("tourStatus", tour.tourStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        {/* A tour an admin turned off is listed, but the API refuses to edit it */}
                        <button
                          onClick={() => setFormTarget(tour)}
                          disabled={tour.tourStatus === TourStatus.INACTIVE}
                        >
                          {t("common.edit")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {total > 0 && (
          <div className="pagination-footer">
            <span className="page-info">
              {tx("agent.myTours.showingRange", { range: <strong>{(page - 1) * 10 + 1}–{Math.min(page * 10, total)}</strong>, total: <strong>{total}</strong> })}
            </span>
            <div className="page-controls">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={page === p ? 'active' : ''}
                >
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {formTarget !== undefined && (
        <AgentTourForm tour={formTarget} onClose={() => setFormTarget(undefined)} onSaved={handleFormSaved} />
      )}
    </div>
  );
};

export default MyTours;
