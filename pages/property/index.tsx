import { Pagination, Stack, Typography } from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import PropertyHero from "../../libs/components/property/PropertyHero";
import PropertyCard from "../../libs/components/property/PropertyCard";
import Filter from "../../libs/components/property/Filter";
import { PropertiesInquiry } from "../../libs/types/property/property.input";
import { Property } from "../../libs/types/property/property";
import { PropertyType } from "../../libs/enums/property.enum";
import { Direction, Message } from "../../libs/enums/common.enum";
import { GET_PROPERTIES } from "../../apollo/user/query";
import { LIKE_TARGET_PROPERTY } from "../../apollo/user/mutation";
import { userVar } from "../../apollo/store";
import { sweetMixinErrorAlert } from "../../libs/sweetAlert";
import { useI18n } from "../../libs/i18n";
import MobileFilterPanel from "../../libs/components/common/MobileFilterPanel";
import LoadingSpinner from "../../libs/components/common/LoadingSpinner";

const defaultInput: PropertiesInquiry = {
  page: 1,
  limit: 12,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};

/** Sort state holds stable ids (RECOMMENDED, PRICE_ASC, PRICE_DESC, RATING_DESC, NEWEST); labels come from the dictionary **/
const quickChips = [
  { labelKey: "hotels.list.chipAll", value: "ALL" },
  { labelKey: "hotels.list.chipVillas", value: PropertyType.VILLA },
  { labelKey: "hotels.list.chipResorts", value: PropertyType.RESORT },
  { labelKey: "hotels.list.chipHotels", value: PropertyType.HOTEL },
  { labelKey: "hotels.list.chipApartments", value: PropertyType.APARTMENT },
];

const PropertyList: NextPage = ({ initialInput = defaultInput }: any) => {
  const { t, tError } = useI18n();
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(() => {
    if (typeof window !== "undefined" && router.query.input) {
      try {
        return JSON.parse(router.query.input as string);
      } catch (e) {
        return initialInput;
      }
    }
    return initialInput;
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSort, setSelectedSort] = useState<string>("RECOMMENDED");
  const [activeChip, setActiveChip] = useState<string>("ALL");

  /** APOLLO REQUESTS **/
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
  const {
    data,
    loading,
    refetch: refetchProperties,
  } = useQuery(GET_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
  });

  /** LIFECYCLES **/
  useEffect(() => {
    const list = data?.getProperties?.list;
    const meta = data?.getProperties?.metaCounter?.[0]?.total;
    if (list) {
      setProperties(list);
    }
    if (meta !== undefined) {
      setTotal(meta);
    }
  }, [data]);

  useEffect(() => {
    if (router.query.input) {
      try {
        const parsed = JSON.parse(router.query.input as string);
        setSearchFilter(parsed);
        setCurrentPage(parsed.page || 1);

        // Sync sort dropdown state
        if (parsed.sort === "pricePerNight") {
          if (parsed.direction === Direction.ASC)
            setSelectedSort("PRICE_ASC");
          else setSelectedSort("PRICE_DESC");
        } else if (parsed.sort === "propertyRating") {
          setSelectedSort("RATING_DESC");
        } else if (parsed.sort === "createdAt") {
          setSelectedSort("NEWEST");
        } else {
          setSelectedSort("RECOMMENDED");
        }

        // Sync active chip
        if (parsed.search?.propertyTypeList?.[0]) {
          setActiveChip(parsed.search.propertyTypeList[0]);
        } else {
          setActiveChip("ALL");
        }

        refetchProperties({ input: parsed });
      } catch (e) {
        // ignore parse error
      }
    }
  }, [router.query.input]);

  /** HANDLERS **/
  const handlePaginationChange = async (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    const updated = { ...searchFilter, page: newPage };
    setSearchFilter(updated);
    setCurrentPage(newPage);
    await router.push(
      {
        pathname: "/property",
        query: { input: JSON.stringify(updated) },
      },
      undefined,
      { scroll: false },
    );
  };

  const likePropertyHandler = async (
    e: React.MouseEvent,
    propertyId: string,
  ) => {
    e.stopPropagation();
    try {
      if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));
      await likeTargetProperty({
        variables: { propertyId },
      });
      await refetchProperties({ input: searchFilter });
    } catch (err: any) {
      console.log("ERROR, likePropertyHandler:", err.message);
      sweetMixinErrorAlert(tError(err));
    }
  };

  const sortChangeHandler = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSort(val);

    let sortField = "propertyViews";
    let sortDirection = Direction.DESC;

    switch (val) {
      case "PRICE_ASC":
        sortField = "pricePerNight";
        sortDirection = Direction.ASC;
        break;
      case "PRICE_DESC":
        sortField = "pricePerNight";
        sortDirection = Direction.DESC;
        break;
      case "RATING_DESC":
        sortField = "propertyRating";
        sortDirection = Direction.DESC;
        break;
      case "NEWEST":
        sortField = "createdAt";
        sortDirection = Direction.DESC;
        break;
      case "RECOMMENDED":
      default:
        sortField = "propertyViews";
        sortDirection = Direction.DESC;
        break;
    }

    const updated: PropertiesInquiry = {
      ...searchFilter,
      page: 1,
      sort: sortField,
      direction: sortDirection,
    };

    setSearchFilter(updated);
    setCurrentPage(1);
    await router.push(
      {
        pathname: "/property",
        query: { input: JSON.stringify(updated) },
      },
      undefined,
      { scroll: false },
    );
  };

  const chipClickHandler = async (val: string) => {
    setActiveChip(val);
    const updated: PropertiesInquiry = {
      ...searchFilter,
      page: 1,
      search: {
        ...searchFilter.search,
        propertyTypeList: val === "ALL" ? undefined : [val as PropertyType],
      },
    };

    setSearchFilter(updated);
    setCurrentPage(1);
    await router.push(
      {
        pathname: "/property",
        query: { input: JSON.stringify(updated) },
      },
      undefined,
      { scroll: false },
    );
  };

  const totalPages = Math.max(1, Math.ceil(total / (searchFilter.limit || 12)));

  return (
    <div className="property-page-wrapper">
      {/* Hero Section */}
      <PropertyHero />

      {/* Main Content Layout */}
      <div className="property-main-container">
        <div className="property-layout-flex">
          {/* Left Sidebar Filter */}
          <MobileFilterPanel title={t("hotels.filter.filters")}>
            <Filter
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              initialInput={initialInput}
            />
          </MobileFilterPanel>

          {/* Right Column Listing */}
          <main className="property-listing-main">
            {/* Listing Header Bar */}
            <div className="listing-header-box">
              <div className="header-top-row">
                <div className="heading-with-counter">
                  <h2 className="listing-heading">{t("hotels.list.exploreHotels")}</h2>
                  <span className="journeys-badge">
                    {t("hotels.list.staysAvailable", { total })}
                  </span>
                </div>

                {/* Sort Dropdown */}
                <div className="sort-group">
                  <span className="sort-title">{t("hotels.list.sortBy")}</span>
                  <div className="sort-dropdown-box">
                    <select
                      value={selectedSort}
                      onChange={sortChangeHandler}
                      className="sort-dropdown"
                    >
                      <option value="RECOMMENDED">{t("hotels.list.recommended")}</option>
                      <option value="PRICE_ASC">
                        {t("hotels.list.priceLowToHigh")}
                      </option>
                      <option value="PRICE_DESC">
                        {t("hotels.list.priceHighToLow")}
                      </option>
                      <option value="RATING_DESC">{t("common.topRated")}</option>
                      <option value="NEWEST">{t("common.newest")}</option>
                    </select>
                    <span className="material-symbols-outlined dropdown-icon">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="quick-filter-chips">
              {quickChips.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className={`chip-btn ${
                    activeChip === chip.value ? "active" : ""
                  }`}
                  onClick={() => chipClickHandler(chip.value)}
                >
                  {t(chip.labelKey)}
                </button>
              ))}
            </div>

            {/* Hotels Grid */}
            {loading && properties.length === 0 ? (
              <div className="listing-loader-wrapper">
                <LoadingSpinner size="lg" label={t("hotels.list.loadingHotels")} />
              </div>
            ) : properties.length === 0 ? (
              <div className="no-data-box">
                <span className="material-symbols-outlined no-data-icon">
                  hotel
                </span>
                <h3>{t("hotels.list.noStaysFound")}</h3>
                <p>
                  {t("hotels.list.adjustFilters")}
                </p>
              </div>
            ) : (
              <div className="hotels-grid" style={{ position: "relative" }}>
                {loading && (
                  <LoadingSpinner overlay size="md" label={t("hotels.list.updatingHotels")} />
                )}
                {properties.map((property, idx) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    index={idx}
                    likePropertyHandler={likePropertyHandler}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <Stack
                className="pagination-config"
                sx={{ mt: "50px", alignItems: "center" }}
              >
                {properties.length !== 0 && (
                  <Stack className="pagination-box">
                    <Pagination
                      page={currentPage}
                      count={totalPages}
                      onChange={handlePaginationChange}
                      shape="circular"
                      color="primary"
                      getItemAriaLabel={(type, page, selected) =>
                        type === "page"
                          ? t(selected ? "common.pagination.currentPage" : "common.pagination.goToPage", { page })
                          : t(`common.pagination.${type}`)
                      }
                    />
                  </Stack>
                )}

                {properties.length !== 0 && (
                  <Stack className="total-result" sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("hotels.list.totalAvailable", { count: total })}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default withLayoutBasic(PropertyList);
