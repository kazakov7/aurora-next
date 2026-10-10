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

const MyTours = () => {
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
              <h2>My Tours</h2>
              <span className="count-badge">{total} Packages</span>
            </div>
            <p>Create, update, and manage your curated expedition packages, itineraries, and seat capacity.</p>
          </div>
          <button onClick={handleAddTour} className="add-btn">
            <span className="material-symbols-outlined">add</span>
            Add Tour
          </button>
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tour packages by title or location..."
              type="text"
              disabled
              title="Text search not supported by backend yet"
            />
          </div>
          <div className="select-box">
            <select
              value={tourStatus}
              onChange={(e) => setTourStatus(e.target.value as TourStatus)}
            >
              <option value="">All Statuses</option>
              {Object.values(TourStatus).map(ts => (
                <option key={ts} value={ts}>{ts}</option>
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
                <th>Tour Package</th>
                <th>Dates</th>
                <th>Capacity</th>
                <th>Price / Person</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>Loading tours...</td>
                </tr>
              ) : tours.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>No tours found.</td>
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
                            {[tour.tourDestinationCity, tour.tourDepartureCountry].filter(Boolean).join(' · ') || 'Location not provided'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {moment(tour.tourStartDate).format('MMM DD')} – {moment(tour.tourEndDate).format('MMM DD, YYYY')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price" style={{ fontSize: '14px' }}>
                          {tour.tourReservedSeats || 0} / {tour.tourCapacity} Booked
                        </span>
                        <span className="unit" style={{ color: tour.tourReservedSeats >= tour.tourCapacity ? '#ba1a1a' : '#006194', fontWeight: 600 }}>
                          {Math.max(0, tour.tourCapacity - (tour.tourReservedSeats || 0))} Seats Left
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price">${Number(tour.tourPrice || 0).toLocaleString()}</span>
                        <span className="unit">{tour.tourCurrency}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${tour.tourStatus === TourStatus.ACTIVE ? 'active' : 'pending'}`}>
                        <span className="dot"></span>
                        {tour.tourStatus}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => setFormTarget(tour)}>
                          Edit
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
              Showing <strong>{(page - 1) * 10 + 1}–{Math.min(page * 10, total)}</strong> of <strong>{total}</strong> tours
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
