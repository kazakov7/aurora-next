import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_AGENT_PROPERTIES } from "../../../../apollo/user/query";
import { PropertyType, PropertyStatus } from "../../../enums/property.enum";
import { Direction } from "../../../enums/common.enum";
import { useRouter } from "next/router";
import { DEFAULT_PROPERTY_IMAGE, getImageUrl } from "../../../../libs/config";
import { Property } from "../../../types/property/property";
import AgentPropertyForm from "./AgentPropertyForm";
import { sweetErrorHandling } from "../../../../libs/sweetAlert";
import { useI18n } from "../../../i18n";

const MyHotels = () => {
  const { tEnum, t, tx } = useI18n();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [propertyStatus, setPropertyStatus] = useState<PropertyStatus | "">("");
  const [formTarget, setFormTarget] = useState<Property | null | undefined>(undefined);

  const { data, loading, refetch } = useQuery(GET_AGENT_PROPERTIES, {
    fetchPolicy: "network-only",
    onError: (err) => sweetErrorHandling(err),
    variables: {
      input: {
        page,
        limit: 10,
        sort: "createdAt",
        direction: Direction.DESC,
        search: {
          ...(propertyStatus && { propertyStatus }),
        },
      },
    },
  });

  const properties = data?.getAgentProperties?.list || [];
  const total = data?.getAgentProperties?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  /** HANDLERS **/
  const handleAddHotel = () => setFormTarget(null);
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
              <h2>{t("agent.myHotels.myHotels")}</h2>
              <span className="count-badge">{t("agent.myHotels.registered", { total })}</span>
            </div>
            <p>{t("agent.myHotels.intro")}</p>
          </div>
          <button onClick={handleAddHotel} className="add-btn">
            <span className="material-symbols-outlined">add</span>
            {t("agent.addHotel")}
          </button>
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("agent.myHotels.searchPlaceholder")}
              type="text"
              disabled
              title={t("agent.textSearchUnsupported")}
            />
          </div>
          <div className="select-box">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              disabled
              title={t("agent.typeFilterUnsupported")}
            >
              <option value="">{t("agent.myHotels.allProperties")}</option>
              {Object.values(PropertyType).map(pt => (
                <option key={pt} value={pt}>{tEnum("propertyType", pt)}</option>
              ))}
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
          <div className="select-box">
            <select
              value={propertyStatus}
              onChange={(e) => setPropertyStatus(e.target.value as PropertyStatus)}
            >
              <option value="">{t("common.allStatuses")}</option>
              {Object.values(PropertyStatus).map(ps => (
                <option key={ps} value={ps}>{tEnum("propertyStatus", ps)}</option>
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
                <th>{t("common.property")}</th>
                <th>{t("common.type")}</th>
                <th>{t("agent.myHotels.nightlyRate")}</th>
                <th>{t("common.status")}</th>
                <th style={{ textAlign: 'right' }}>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>{t("agent.myHotels.loadingProperties")}</td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#707881' }}>{t("agent.myHotels.noPropertiesFound")}</td>
                </tr>
              ) : (
                properties.map((prop: any) => (
                  <tr key={prop._id}>
                    <td>
                      <div className="item-cell">
                        <img
                          src={getImageUrl(prop?.propertyImages?.[0], DEFAULT_PROPERTY_IMAGE)}
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
                        {tEnum("propertyType", prop.propertyType)}
                      </span>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="price">${Number(prop.pricePerNight || 0).toLocaleString("en-US")}</span>
                        <span className="unit">{t("agent.myHotels.night", { currency: prop.currency })}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${prop.propertyStatus === PropertyStatus.ACTIVE ? 'active' : 'pending'}`}>
                        <span className="dot"></span>
                        {tEnum("propertyStatus", prop.propertyStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => setFormTarget(prop)}>
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
              {tx("agent.myHotels.showingRange", { range: <strong>{(page - 1) * 10 + 1}–{Math.min(page * 10, total)}</strong>, total: <strong>{total}</strong> })}
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
        <AgentPropertyForm property={formTarget} onClose={() => setFormTarget(undefined)} onSaved={handleFormSaved} />
      )}
    </div>
  );
};

export default MyHotels;
