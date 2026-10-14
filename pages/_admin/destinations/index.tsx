import React, { useState } from "react";
import { NextPage } from "next";
import withAdminLayout from "../../../libs/components/layout/LayoutAdmin";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_DESTINATIONS_BY_ADMIN } from "../../../apollo/admin/query";
import {
  UPDATE_DESTINATION_BY_ADMIN,
  REMOVE_DESTINATION_BY_ADMIN,
} from "../../../apollo/admin/mutation";
import {
  CREATE_DESTINATION,
  IMAGES_UPLOADER,
} from "../../../apollo/user/mutation";
import {
  AdminDestinationsInquiry,
  DestinationInput,
} from "../../../libs/types/destination/destination.input";
import { Destination } from "../../../libs/types/destination/destination";
import { DestinationStatus } from "../../../libs/enums/destination.enum";
import { Direction } from "../../../libs/enums/common.enum";
import { getImageUrl } from "../../../libs/config";
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert,
} from "../../../libs/sweetAlert";
import { useI18n } from "../../../libs/i18n";
import LoadingSpinner from "../../../libs/components/common/LoadingSpinner";

/** The API keeps at most ten photos per city **/
const MAX_IMAGES = 10;
const EMPTY_CREATE_FORM = {
  destinationName: "",
  destinationCountry: "",
  destinationDesc: "",
  latitude: "",
  longitude: "",
};

/** An empty coordinate is left out; anything else must be a number in range **/
const toCoordinate = (value: string, limit: number): number | undefined | null => {
  if (value.trim() === "") return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= limit
    ? coordinate
    : null;
};

const AdminDestinationsPage: NextPage = () => {
  const { t, tEnum, tError, formatDate } = useI18n();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [formStatus, setFormStatus] = useState<DestinationStatus>(
    DestinationStatus.ACTIVE,
  );

  // Create Drawer state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createImages, setCreateImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const [searchFilter, setSearchFilter] = useState<AdminDestinationsInquiry>({
    page: 1,
    limit: 10,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {},
  });

  /** APOLLO REQUESTS **/
  // The admin list includes INACTIVE cities, so they can be turned back on or removed
  const { data, loading, refetch } = useQuery(GET_ALL_DESTINATIONS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      setDestinations(data?.getAllDestinationsByAdmin?.list || []);
      setTotal(data?.getAllDestinationsByAdmin?.metaCounter?.[0]?.total || 0);
    },
  });

  const [updateDestinationByAdmin] = useMutation(UPDATE_DESTINATION_BY_ADMIN);
  const [removeDestinationByAdmin] = useMutation(REMOVE_DESTINATION_BY_ADMIN);
  const [createDestination] = useMutation(CREATE_DESTINATION);
  const [imagesUploader] = useMutation(IMAGES_UPLOADER);

  /** The API removes only an INACTIVE city without hotels or tours **/
  const canDelete = (destination: Destination) =>
    destination.destinationStatus === DestinationStatus.INACTIVE;

  /** HANDLERS **/
  const handleSearchChange = (text: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      search: { ...prev.search, text: text === "" ? undefined : text },
      page: 1,
    }));
  };

  const handleStatusChange = (val: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        destinationStatus:
          val === "all" ? undefined : (val as DestinationStatus),
      },
      page: 1,
    }));
  };

  const resetFilters = () => {
    setSearchFilter({
      page: 1,
      limit: 10,
      sort: "createdAt",
      direction: Direction.DESC,
      search: {},
    });
    refetch();
  };

  const openEditDrawer = (destination: Destination) => {
    setSelectedDestination(destination);
    setFormStatus(destination.destinationStatus);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDestination(null);
  };

  const handleSave = async () => {
    try {
      if (selectedDestination) {
        await updateDestinationByAdmin({
          variables: {
            input: {
              _id: selectedDestination._id,
              destinationStatus: formStatus,
            },
          },
        });
        sweetTopSmallSuccessAlert(t("admin.destinations.destinationStatusUpdated"), 800);
      }
      closeDrawer();
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err));
    }
  };

  const openCreateDrawer = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateImages([]);
    setIsCreateOpen(true);
  };

  const closeCreateDrawer = () => {
    if (creating) return;
    setIsCreateOpen(false);
  };

  const handleCreateImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []).slice(
      0,
      MAX_IMAGES - createImages.length,
    );
    event.target.value = "";
    if (!files.length) return;
    try {
      setUploading(true);
      const { data } = await imagesUploader({
        variables: { files, target: "destination" },
      });
      const uploaded: string[] = (data?.imagesUploader ?? []).filter(Boolean);
      if (!uploaded.length) throw new Error(t("common.imageUploadFailed"));
      setCreateImages((previous) =>
        [...previous, ...uploaded].slice(0, MAX_IMAGES),
      );
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err, "common.imageUploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    const destinationName = createForm.destinationName.trim();
    const destinationCountry = createForm.destinationCountry.trim();
    if (!destinationName || !destinationCountry) {
      sweetMixinErrorAlert(t("admin.destinations.requiredFields"));
      return;
    }
    const latitude = toCoordinate(createForm.latitude, 90);
    const longitude = toCoordinate(createForm.longitude, 180);
    if (latitude === null || longitude === null) {
      sweetMixinErrorAlert(t("admin.destinations.invalidCoordinates"));
      return;
    }

    const input: DestinationInput = {
      destinationName,
      destinationCountry,
      destinationImages: createImages,
      destinationDesc: createForm.destinationDesc.trim() || undefined,
      latitude,
      longitude,
    };
    try {
      setCreating(true);
      await createDestination({ variables: { input } });
      sweetTopSmallSuccessAlert(
        t("admin.destinations.destinationCreated"),
        800,
      );
      setIsCreateOpen(false);
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await sweetConfirmAlert(
        t("admin.destinations.deleteConfirm"),
      )
    ) {
      try {
        await removeDestinationByAdmin({ variables: { destinationId: id } });
        sweetTopSmallSuccessAlert(t("admin.destinations.destinationDeleted"), 800);
        refetch();
      } catch (err: any) {
        sweetMixinErrorAlert(tError(err));
      }
    }
  };

  const exportCSV = () => {
    if (!destinations || destinations.length === 0) {
      sweetMixinErrorAlert(t("common.noDataToExport"));
      return;
    }
    const headers = [
      "ID",
      t("common.name"),
      t("admin.destinations.country"),
      t("common.properties"),
      t("navigation.tours"),
      t("common.status"),
      t("common.createdDate"),
    ];
    const rows = destinations.map((d) => [
      d._id,
      `"${d.destinationName.replace(/"/g, '""')}"`,
      `"${d.destinationCountry}"`,
      d.destinationProperties,
      d.destinationTours,
      d.destinationStatus,
      formatDate(d.createdAt),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_destinations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / searchFilter.limit) || 1;
  const startItem =
    total === 0 ? 0 : (searchFilter.page - 1) * searchFilter.limit + 1;
  const endItem = Math.min(searchFilter.page * searchFilter.limit, total);

  return (
    <div className="admin-overview dashboard-container">
      <div className="overview-header">
        <div className="header-text">
          <h1>{t("admin.destinations.destinationsManagement")}</h1>
          <p>{t("admin.destinations.intro")}</p>
        </div>
        <div className="header-actions">
          <button
            className="export-btn"
            type="button"
            onClick={openCreateDrawer}
            style={{
              backgroundColor: "#006194",
              color: "#fff",
              border: "none",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#fff" }}
            >
              add
            </span>
            {t("admin.destinations.addDestination")}
          </button>
        </div>
      </div>

      <section className="admin-table-section">
        <div className="table-header">
          <div className="header-left">
            <h2>{t("common.directory")}</h2>
            <span className="table-badge">{t("admin.destinations.destinations", { total })}</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder={t("admin.destinations.searchNameCountry")}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select-group">
              <select
                className="filter-select"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">{t("common.allStatuses")}</option>
                <option value={DestinationStatus.ACTIVE}>{t("common.active")}</option>
                <option value={DestinationStatus.INACTIVE}>{t("common.inactive")}</option>
              </select>
              <button
                className="reset-filter-btn"
                type="button"
                onClick={resetFilters}
              >
                <span className="material-symbols-outlined">
                  filter_alt_off
                </span>
                {t("common.reset")}
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.destinations.destinationName")}</th>
                <th>{t("admin.destinations.country")}</th>
                <th>{t("admin.destinations.itemsConnected")}</th>
                <th>{t("common.metrics")}</th>
                <th>{t("common.status")}</th>
                <th style={{ width: 120, textAlign: "right" }}>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="table-loading-cell"
                  >
                    <LoadingSpinner size="md" label={t("common.loading")} />
                  </td>
                </tr>
              ) : destinations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {t("admin.destinations.noDestinationsFound")}
                  </td>
                </tr>
              ) : (
                destinations.map((destination) => (
                  <tr key={destination._id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#141b2b" }}>
                        {destination.destinationName}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#141b2b" }}>
                        {destination.destinationCountry}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#707881" }}>
                          {t("admin.destinations.hotels", { destinationProperties: destination.destinationProperties })}
                        </span>
                        <span style={{ fontSize: 13, color: "#707881" }}>
                          {t("admin.destinations.tours", { destinationTours: destination.destinationTours })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          fontSize: 12,
                          color: "#707881",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14 }}
                          >
                            thumb_up
                          </span>
                          {destination.destinationLikes}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14 }}
                          >
                            visibility
                          </span>
                          {destination.destinationViews}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          destination.destinationStatus ===
                          DestinationStatus.ACTIVE
                            ? "emerald"
                            : "cancelled"
                        }`}
                      >
                        <span className="dot"></span>
                        {tEnum("destinationStatus", destination.destinationStatus)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => openEditDrawer(destination)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#f1f3ff",
                            color: "#006194",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(destination._id)}
                          disabled={!canDelete(destination)}
                          title={
                            !canDelete(destination)
                              ? t("admin.destinations.deleteOnlyInactive")
                              : undefined
                          }
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#ffdad6",
                            color: "#ba1a1a",
                            cursor:
                              !canDelete(destination)
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              !canDelete(destination) ? 0.4 : 1,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            {t("admin.showingRecords", { startItem, endItem, total })}
          </span>
          <div className="pagination">
            <button
              className="page-btn square"
              disabled={searchFilter.page === 1}
              type="button"
              onClick={() =>
                setSearchFilter((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${
                  p === searchFilter.page ? "active" : ""
                }`}
                type="button"
                onClick={() =>
                  setSearchFilter((prev) => ({ ...prev, page: p }))
                }
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn square"
              disabled={searchFilter.page >= totalPages}
              type="button"
              onClick={() =>
                setSearchFilter((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {isDrawerOpen && selectedDestination && (
        <>
          <div className="admin-drawer-backdrop" onClick={closeDrawer} />
          <aside className="admin-drawer">
            <div className="drawer-header">
              <div className="header-title">
                <span className="material-symbols-outlined">edit_document</span>
                <span>{t("admin.destinations.moderateTitle")}</span>
              </div>
              <button className="close-btn" type="button" onClick={closeDrawer}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body">
              <div className="admin-form-group">
                <label>{t("admin.destinations.destinationName")}</label>
                <div
                  className="admin-form-control"
                  style={{ background: "#f1f3ff", border: "none" }}
                >
                  {selectedDestination.destinationName}
                </div>
              </div>

              <div className="admin-form-group">
                <label>{t("common.description")}</label>
                <div
                  className="admin-form-control"
                  style={{
                    background: "#f1f3ff",
                    border: "none",
                    height: 100,
                    overflowY: "auto",
                  }}
                >
                  {selectedDestination.destinationDesc}
                </div>
              </div>

              <div className="admin-form-group">
                <label>
                  {t("common.status")} <span className="required">*</span>
                </label>
                <select
                  className="admin-form-control select"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as DestinationStatus)
                  }
                >
                  <option value={DestinationStatus.ACTIVE}>{t("common.active")}</option>
                  <option value={DestinationStatus.INACTIVE}>{t("common.inactive")}</option>
                </select>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="btn secondary"
                type="button"
                onClick={closeDrawer}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={handleSave}
              >
                {t("common.saveChanges")}
              </button>
            </div>
          </aside>
        </>
      )}

      {isCreateOpen && (
        <>
          <div className="admin-drawer-backdrop" onClick={closeCreateDrawer} />
          <aside className="admin-drawer">
            <div className="drawer-header">
              <div className="header-title">
                <span className="material-symbols-outlined">
                  add_location_alt
                </span>
                <span>{t("admin.destinations.createTitle")}</span>
              </div>
              <button
                className="close-btn"
                type="button"
                onClick={closeCreateDrawer}
                aria-label={t("common.close")}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body">
              <div className="admin-form-group">
                <label>
                  {t("admin.destinations.destinationName")}{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  maxLength={100}
                  placeholder={t("admin.destinations.namePlaceholder")}
                  value={createForm.destinationName}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      destinationName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label>
                  {t("admin.destinations.country")}{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  maxLength={100}
                  placeholder={t("admin.destinations.countryPlaceholder")}
                  value={createForm.destinationCountry}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      destinationCountry: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label>{t("common.description")}</label>
                <textarea
                  className="admin-form-control textarea"
                  maxLength={2000}
                  placeholder={t("admin.destinations.descPlaceholder")}
                  value={createForm.destinationDesc}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      destinationDesc: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid-2-col">
                <div className="admin-form-group">
                  <label>{t("admin.destinations.latitude")}</label>
                  <input
                    type="number"
                    step="any"
                    min={-90}
                    max={90}
                    className="admin-form-control"
                    placeholder="35.1796"
                    value={createForm.latitude}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, latitude: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>{t("admin.destinations.longitude")}</label>
                  <input
                    type="number"
                    step="any"
                    min={-180}
                    max={180}
                    className="admin-form-control"
                    placeholder="129.0756"
                    value={createForm.longitude}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, longitude: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>{t("admin.destinations.photos")}</label>
                <div className="admin-image-grid">
                  {createImages.map((image) => (
                    <div key={image} className="image-thumb">
                      <img src={getImageUrl(image)} alt="" />
                      <button
                        type="button"
                        onClick={() =>
                          setCreateImages((previous) =>
                            previous.filter((item) => item !== image),
                          )
                        }
                        aria-label={t("admin.destinations.removePhoto")}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                  {createImages.length < MAX_IMAGES && (
                    <label className={`image-add ${uploading ? "disabled" : ""}`}>
                      <span className="material-symbols-outlined">
                        {uploading ? "hourglass_top" : "add_photo_alternate"}
                      </span>
                      {uploading
                        ? t("admin.destinations.uploading")
                        : t("admin.destinations.addPhoto")}
                      <input
                        type="file"
                        accept="image/jpeg, image/png"
                        multiple
                        hidden
                        disabled={uploading}
                        onChange={handleCreateImages}
                      />
                    </label>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#707881" }}>
                  {t("admin.destinations.photosHint", { max: MAX_IMAGES })}
                </span>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="btn secondary"
                type="button"
                onClick={closeCreateDrawer}
                disabled={creating}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={() => void handleCreate()}
                disabled={creating || uploading}
              >
                {t("admin.destinations.createDestination")}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default withAdminLayout(AdminDestinationsPage);
