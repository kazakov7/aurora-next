import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import withAdminLayout from "../../libs/components/layout/LayoutAdmin";
import { useQuery } from "@apollo/client";
import {
  GET_ALL_MEMBERS_BY_ADMIN,
  GET_ALL_PROPERTIES_BY_ADMIN,
  GET_ALL_TOURS_BY_ADMIN,
  GET_AGENT_APPLICATIONS_BY_ADMIN,
  GET_ALL_BOOKINGS_BY_ADMIN,
} from "../../apollo/admin/query";
import { T } from "../../libs/types/common";
import { Member } from "../../libs/types/member/member";
import { Property } from "../../libs/types/property/property";
import { Tour } from "../../libs/types/tour/tour";
import { Agent } from "../../libs/types/agent/agent";
import { PropertyStatus } from "../../libs/enums/property.enum";
import { TourStatus } from "../../libs/enums/tour.enum";
import { AgentVerificationStatus } from "../../libs/enums/agent.enum";
import moment from "moment";
import { useI18n } from "../../libs/i18n";
import LoadingSpinner from "../../libs/components/common/LoadingSpinner";

const AdminDashboardOverview: NextPage = () => {
  // Stat states
  const { tEnum, t, formatNumber, formatDate } = useI18n();
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [activeProperties, setActiveProperties] = useState<number>(0);
  const [activeTours, setActiveTours] = useState<number>(0);

  // Data states
  const [recentBookings, setRecentBookings] = useState<any[]>([]); // Static for now as no booking query yet
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);

  /** APOLLO QUERIES **/

  // 1. Members
  useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: 1,
        limit: 1,
        search: {},
      },
    },
    onCompleted: (data: T) => {
      setTotalMembers(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
    },
  });

  // 2. Properties (Hotels)
  useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: 1,
        limit: 1,
        search: {
          propertyStatus: PropertyStatus.ACTIVE,
        },
      },
    },
    onCompleted: (data: T) => {
      setActiveProperties(
        data?.getAllPropertiesByAdmin?.metaCounter?.[0]?.total ?? 0,
      );
    },
  });

  // 3. Tours
  useQuery(GET_ALL_TOURS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: 1,
        limit: 1,
        search: {
          tourStatus: TourStatus.ACTIVE,
        },
      },
    },
    onCompleted: (data: T) => {
      setActiveTours(data?.getAllToursByAdmin?.metaCounter?.[0]?.total ?? 0);
    },
  });

  // 4. Agent Applications
  useQuery(GET_AGENT_APPLICATIONS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: 1,
        limit: 5,
        search: {
          verificationStatus: AgentVerificationStatus.PENDING,
        },
      },
    },
    onCompleted: (data: T) => {
      setPendingAgents(data?.getAgentApplications?.list ?? []);
    },
  });

  const { data: bookingsData, loading: bookingsLoading } = useQuery(
    GET_ALL_BOOKINGS_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: { page: 1, limit: 5 } },
    },
  );
  const recentBookingsData = bookingsData?.getAllBookingsByAdmin?.list || [];
  const totalBookings =
    bookingsData?.getAllBookingsByAdmin?.metaCounter?.[0]?.total || 0;

  return (
    <div className="admin-overview dashboard-container">
      {/* TOP SECTION: HEADER / CONTEXT BAR */}
      <div className="overview-header">
        <div className="header-text">
          <h1>{t("admin.dashboard.systemOverview")}</h1>
          <p>
            {t("admin.dashboard.intro")}
          </p>
        </div>
        <div className="header-actions">
          <span className="live-sync-badge">
            <span className="sync-dot"></span>
            {t("admin.dashboard.liveSyncActive")}
          </span>
        </div>
      </div>

      {/* 1. OVERVIEW STATISTICS: 4 COMPACT CARDS */}
      <section aria-label={t("admin.dashboard.keyPerformanceIndicators")} className="kpi-grid">
        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">{t("admin.dashboard.totalMembers")}</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">{formatNumber(totalMembers)}</span>
            <div className="kpi-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              <span>{t("admin.dashboard.live")}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">{t("admin.dashboard.activeHotels")}</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">hotel</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">
              {formatNumber(activeProperties)}
            </span>
            <div className="kpi-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              <span>{t("admin.dashboard.live")}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">{t("admin.dashboard.activeTours")}</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">explore</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">{formatNumber(activeTours)}</span>
            <div className="kpi-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              <span>{t("admin.dashboard.live")}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">{t("admin.dashboard.totalBookings")}</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">{formatNumber(totalBookings)}</span>
            <div className="kpi-trend warning">
              <span className="material-symbols-outlined">pending</span>
              <span>{t("admin.dashboard.dev")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECENT BOOKINGS TABLE SECTION */}
      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left">
            <h2>{t("admin.dashboard.recentBookings")}</h2>
            <span className="table-badge primary">{t("admin.dashboard.total", { totalBookings })}</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder={t("admin.dashboard.searchReferenceCustomer")} />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="px-6">{t("common.bookingId")}</th>
                <th>{t("common.customer")}</th>
                <th>{t("common.category")}</th>
                <th>{t("admin.dashboard.bookingItem")}</th>
                <th>{t("common.date")}</th>
                <th>{t("common.total")}</th>
                <th>{t("common.status")}</th>
                <th className="px-6 text-right">{t("common.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {bookingsLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="table-loading-cell"
                  >
                    <LoadingSpinner size="md" label={t("admin.dashboard.loadingBookings")} />
                  </td>
                </tr>
              ) : recentBookingsData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    <span style={{ color: "#707881" }}>
                      {t("admin.dashboard.noRecentBookingsFound")}
                    </span>
                  </td>
                </tr>
              ) : (
                recentBookingsData.map((booking: any) => (
                  <tr key={booking._id}>
                    <td className="px-6">
                      <span
                        style={{
                          fontFamily: "monospace",
                          color: "#006194",
                          fontWeight: 600,
                        }}
                      >
                        #
                        {booking._id
                          .substring(booking._id.length - 6)
                          .toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="user-avatar-cell">
                        <div className="avatar-circle bg-secondary">
                          {booking.memberData?.memberNick
                            ?.substring(0, 2)
                            .toUpperCase() || "US"}
                        </div>
                        <div className="user-cell">
                          <span className="user-name">
                            {booking.memberData?.memberNick || t("common.unknown")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${
                          booking.bookingCategory === "HOTEL" ? "sky" : "indigo"
                        }`}
                      >
                        {tEnum("bookingCategory", booking.bookingCategory)}
                      </span>
                    </td>
                    <td>
                      <span className="item-text">
                        {booking.propertyData?.propertyName ||
                          booking.tourData?.tourName ||
                          t("admin.dashboard.unknownItem")}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(booking.createdAt, "medium")}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#1a2b49" }}>
                        {booking.bookingCurrency === "USD" ? "$" : "$"}
                        {booking.bookingTotalPrice.toLocaleString("en-US")}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          booking.bookingStatus === "CONFIRMED"
                            ? "green"
                            : booking.bookingStatus === "PENDING"
                            ? "amber"
                            : "red"
                        }`}
                      >
                        <span className="dot"></span> {tEnum("bookingStatus", booking.bookingStatus)}
                      </span>
                    </td>
                    <td className="px-6 text-right">
                      <div className="actions-group">
                        <button className="text-btn">{t("common.view")}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default withAdminLayout(AdminDashboardOverview);
