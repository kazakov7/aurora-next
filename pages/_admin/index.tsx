import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import withAdminLayout from "../../libs/components/layout/LayoutAdmin";
import { useQuery } from "@apollo/client";
import {
  GET_ALL_MEMBERS_BY_ADMIN,
  GET_ALL_PROPERTIES_BY_ADMIN,
  GET_ALL_TOURS_BY_ADMIN,
  GET_AGENT_APPLICATIONS_BY_ADMIN,
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

const AdminDashboardOverview: NextPage = () => {
  // Stat states
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

  return (
    <div className="admin-overview dashboard-container">
      {/* TOP SECTION: HEADER / CONTEXT BAR */}
      <div className="overview-header">
        <div className="header-text">
          <h1>System Overview</h1>
          <p>
            Real-time marketplace telemetry, operational pipeline, and agent
            verifications
          </p>
        </div>
        <div className="header-actions">
          <span className="live-sync-badge">
            <span className="sync-dot"></span>
            Live Sync Active
          </span>
          <button className="filter-btn" type="button">
            <span className="material-symbols-outlined">tune</span>
            Filter Range
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW STATISTICS: 4 COMPACT CARDS */}
      <section aria-label="Key Performance Indicators" className="kpi-grid">
        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">Total Members</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">{totalMembers.toLocaleString()}</span>
            <div className="kpi-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              <span>Live</span>
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">Active Hotels</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">hotel</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">
              {activeProperties.toLocaleString()}
            </span>
            <div className="kpi-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              <span>Live</span>
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">Active Tours</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">explore</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">{activeTours.toLocaleString()}</span>
            <div className="kpi-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              <span>Live</span>
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="kpi-top">
            <span className="kpi-label">Total Bookings</span>
            <div className="kpi-icon-box">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-value">...</span>
            <div className="kpi-trend warning">
              <span className="material-symbols-outlined">pending</span>
              <span>Dev</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECENT BOOKINGS TABLE SECTION */}
      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left">
            <h2>Recent Bookings</h2>
            <span className="table-badge warning">Coming Soon (Mock)</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search reference, customer..." />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="px-6">Booking ID</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Booking Item</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", padding: "24px" }}
                >
                  <span style={{ color: "#707881" }}>
                    Booking API not implemented yet.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. PENDING AGENT VERIFICATIONS SECTION */}
      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left">
            <h2>Pending Agent Verifications</h2>
            <span className="table-badge warning">
              {pendingAgents.length} Pending
            </span>
          </div>
          <div className="header-right">
            <a href="#" className="action-link">
              View All Verifications
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="px-6">Agent</th>
                <th>Company</th>
                <th>Agent Type</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAgents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    <span style={{ color: "#707881" }}>
                      No pending applications found!
                    </span>
                  </td>
                </tr>
              ) : (
                pendingAgents.map((agent: Agent) => (
                  <tr key={agent._id}>
                    <td className="px-6">
                      <div className="user-avatar-cell">
                        <div className="avatar-circle bg-secondary">
                          {agent.memberData?.memberNick
                            ?.substring(0, 2)
                            .toUpperCase() || "AG"}
                        </div>
                        <div className="user-cell">
                          <span className="user-name">
                            {agent.memberData?.memberNick || "Unknown"}
                          </span>
                          <span className="user-email">
                            {agent.memberData?.memberEmail || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="item-text">{agent.companyName}</span>
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${
                          agent.agentType === "HOTEL" ? "sky" : "indigo"
                        }`}
                      >
                        {agent.agentType}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {moment(agent.createdAt).format("MMM DD, YYYY")}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill amber">
                        <span className="dot"></span> {agent.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 text-right">
                      <div className="actions-group">
                        <button className="text-btn">Review</button>
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
