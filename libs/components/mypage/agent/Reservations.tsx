import React, { useState } from "react";
import { useQuery, useReactiveVar } from "@apollo/client";
import { GET_AGENT_PROPERTY_BOOKINGS, GET_AGENT_TOUR_BOOKINGS, GET_MY_AGENT_APPLICATIONS } from "../../../../apollo/user/query";
import { AgentType, AgentVerificationStatus } from "../../../enums/agent.enum";
import { BookingStatus } from "../../../enums/booking.enum";
import { Direction } from "../../../enums/common.enum";
import { useRouter } from "next/router";
import moment from "moment";
import { userVar } from "../../../../apollo/store";

const Reservations = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | "">("");

  // Get Agent Type
  const { data: agentData } = useQuery(GET_MY_AGENT_APPLICATIONS, {
    fetchPolicy: "network-only",
    skip: user?.memberType !== "AGENT",
    variables: {
      input: {
        page: 1, limit: 1, search: { verificationStatus: AgentVerificationStatus.APPROVED }
      }
    }
  });

  const agentType = agentData?.getMyAgentApplications?.list?.[0]?.agentType;
  const isHotel = agentType === AgentType.HOTEL;
  const isTour = agentType === AgentType.TOUR;

  // Property Bookings Query
  const { data: propBookingsData, loading: propLoading } = useQuery(GET_AGENT_PROPERTY_BOOKINGS, {
    fetchPolicy: "network-only",
    skip: !isHotel,
    variables: {
      input: {
        page, limit: 10, sort: "createdAt", direction: Direction.DESC,
        search: {
          ...(bookingStatus && { bookingStatusList: [bookingStatus] }),
          // Search string isn't well supported in backend booking query, omit for now or send as memberId if objectId
        }
      }
    }
  });

  // Tour Bookings Query
  const { data: tourBookingsData, loading: tourLoading } = useQuery(GET_AGENT_TOUR_BOOKINGS, {
    fetchPolicy: "network-only",
    skip: !isTour,
    variables: {
      input: {
        page, limit: 10, sort: "createdAt", direction: Direction.DESC,
        search: {
          ...(bookingStatus && { bookingStatusList: [bookingStatus] }),
        }
      }
    }
  });

  const loading = isHotel ? propLoading : tourLoading;
  const bookings = isHotel ? (propBookingsData?.getAgentPropertyBookings?.list || []) : (tourBookingsData?.getAgentTourBookings?.list || []);
  const total = isHotel ? (propBookingsData?.getAgentPropertyBookings?.metaCounter?.[0]?.total || 0) : (tourBookingsData?.getAgentTourBookings?.metaCounter?.[0]?.total || 0);
  const totalPages = Math.ceil(total / 10) || 1;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return "active";
      case BookingStatus.PENDING: return "pending";
      case BookingStatus.COMPLETED: return "completed";
      default: return "pending";
    }
  };

  return (
    <div className="agent-management-page">
      <div className="agent-header-card">
        <div className="header-top">
          <div className="title-box">
            <div className="title-row">
              <h2>Reservations</h2>
            </div>
            <p>Manage incoming guest reservations and stay dates across your {isHotel ? "properties" : "tours"}.</p>
          </div>
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking ID..."
              type="text"
            />
          </div>
          <div className="select-box">
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
            >
              <option value="">All Statuses</option>
              {Object.values(BookingStatus).map(bs => (
                <option key={bs} value={bs}>{bs}</option>
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
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Listing & Stay</th>
                <th>Guests</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>Loading reservations...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>No reservations found.</td>
                </tr>
              ) : (
                bookings.map((booking: any) => (
                  <tr key={booking._id}>
                    <td className="booking-id-cell">
                      #{booking.bookingRefId || booking._id.substring(0,8).toUpperCase()}
                    </td>
                    <td>
                      <div className="customer-cell">
                        {booking.memberData?.memberImage ? (
                          <img src={`${process.env.REACT_APP_API_URL}/${booking.memberData.memberImage}`} className="avatar" alt="customer" />
                        ) : (
                          <div className="initials">{booking.memberData?.memberNick?.substring(0,2).toUpperCase() || 'US'}</div>
                        )}
                        <div className="cust-info">
                          <span className="cust-name">{booking.memberData?.memberFullName || booking.memberData?.memberNick}</span>
                          <span className="cust-email">{booking.memberData?.memberPhone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price" style={{ fontSize: '14px' }}>
                          {isHotel ? booking.propertyData?.propertyName : booking.tourData?.tourName}
                        </span>
                        <span className="unit">
                          {moment(booking.checkIn).format('MMM DD, YYYY')}
                          {isHotel && booking.checkOut && ` – ${moment(booking.checkOut).format('MMM DD, YYYY')}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge" style={{ background: 'transparent', padding: 0 }}>
                        {booking.bookingGuests} {isHotel ? "Guests" : "Seats"}
                      </span>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price">${booking.bookingTotalPrice}</span>
                        <span className="unit">{booking.bookingCurrency}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(booking.bookingStatus)}`}>
                        <span className="dot"></span>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => router.push(`/_admin/bookings?id=${booking._id}`)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 0 && (
          <div className="pagination-footer">
            <span className="page-info">
              Showing <strong>{(page - 1) * 10 + 1}–{Math.min(page * 10, total)}</strong> of <strong>{total}</strong> reservations
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
    </div>
  );
};

export default Reservations;
