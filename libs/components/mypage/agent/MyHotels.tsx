import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_AGENT_PROPERTIES } from "../../../../apollo/user/query";
import { PropertyType, PropertyStatus } from "../../../enums/property.enum";
import { Direction } from "../../../enums/common.enum";
import { useRouter } from "next/router";
import moment from "moment";

const MyHotels = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [propertyStatus, setPropertyStatus] = useState<PropertyStatus | "">("");

  const { data, loading } = useQuery(GET_AGENT_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page,
        limit: 10,
        sort: "createdAt",
        direction: Direction.DESC,
        search: {
          ...(search && { text: search }),
          ...(propertyType && { propertyType }),
          ...(propertyStatus && { propertyStatus }),
        },
      },
    },
  });

  const properties = data?.getAgentProperties?.list || [];
  const total = data?.getAgentProperties?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const handleAddHotel = () => {
    router.push("/property/create");
  };

  return (
    <div className="agent-management-page">
      <div className="agent-header-card">
        <div className="header-top">
          <div className="title-box">
            <div className="title-row">
              <h2>My Hotels</h2>
              <span className="count-badge">{total} Registered</span>
            </div>
            <p>Overview and manage your luxury properties, room inventories, and nightly rates.</p>
          </div>
          <button onClick={handleAddHotel} className="add-btn">
            <span className="material-symbols-outlined">add</span>
            Add Hotel
          </button>
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties by name or region..."
              type="text"
            />
          </div>
          <div className="select-box">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            >
              <option value="">All Properties</option>
              {Object.values(PropertyType).map(pt => (
                <option key={pt} value={pt}>{pt.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
          <div className="select-box">
            <select
              value={propertyStatus}
              onChange={(e) => setPropertyStatus(e.target.value as PropertyStatus)}
            >
              <option value="">All Statuses</option>
              {Object.values(PropertyStatus).map(ps => (
                <option key={ps} value={ps}>{ps}</option>
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
                <th>Property</th>
                <th>Type</th>
                <th>Nightly Rate</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>Loading properties...</td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>No properties found.</td>
                </tr>
              ) : (
                properties.map((prop: any) => (
                  <tr key={prop._id}>
                    <td>
                      <div className="item-cell">
                        <img
                          src={prop.propertyImages?.[0] ? `${process.env.REACT_APP_API_URL}/${prop.propertyImages[0]}` : "/img/placeholder.png"}
                          alt={prop.propertyName}
                        />
                        <div className="item-info">
                          <span className="item-name" onClick={() => router.push(`/property/detail?id=${prop._id}`)}>
                            {prop.propertyName}
                          </span>
                          <span className="item-loc">
                            <span className="material-symbols-outlined">pin_drop</span>
                            {prop.propertyCity}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">
                        {prop.propertyType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price">${prop.pricePerNight}</span>
                        <span className="unit">{prop.currency} / night</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${prop.propertyStatus === PropertyStatus.ACTIVE ? 'active' : 'pending'}`}>
                        <span className="dot"></span>
                        {prop.propertyStatus}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => router.push(`/_admin/properties?id=${prop._id}`)}>
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
        
        {totalPages > 0 && (
          <div className="pagination-footer">
            <span className="page-info">
              Showing <strong>{(page - 1) * 10 + 1}–{Math.min(page * 10, total)}</strong> of <strong>{total}</strong> properties
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

export default MyHotels;
