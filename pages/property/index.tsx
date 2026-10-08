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
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../libs/sweetAlert";

const defaultInput: PropertiesInquiry = {
  page: 1,
  limit: 6,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};

const quickChips = [
  { label: "All Stays", value: "ALL" },
  { label: "Villas", value: PropertyType.VILLA },
  { label: "Resorts", value: PropertyType.RESORT },
  { label: "Hotels", value: PropertyType.HOTEL },
  { label: "Apartments", value: PropertyType.APARTMENT },
];

const PropertyList: NextPage = ({ initialInput = defaultInput }: any) => {
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
  const [selectedSort, setSelectedSort] = useState<string>("Recommended");
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
            setSelectedSort("Price: Low to High");
          else setSelectedSort("Price: High to Low");
        } else if (parsed.sort === "propertyRating") {
          setSelectedSort("Top Rated");
        } else if (parsed.sort === "createdAt") {
          setSelectedSort("Newest");
        } else {
          setSelectedSort("Recommended");
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
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
      await likeTargetProperty({
        variables: { propertyId },
      });
      await refetchProperties({ input: searchFilter });
      await sweetTopSmallSuccessAlert("Saved to favorites!", 800);
    } catch (err: any) {
      console.log("ERROR, likePropertyHandler:", err.message);
      sweetMixinErrorAlert(err.message);
    }
  };

  const sortChangeHandler = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSort(val);

    let sortField = "propertyViews";
    let sortDirection = Direction.DESC;

    switch (val) {
      case "Price: Low to High":
        sortField = "pricePerNight";
        sortDirection = Direction.ASC;
        break;
      case "Price: High to Low":
        sortField = "pricePerNight";
        sortDirection = Direction.DESC;
        break;
      case "Top Rated":
        sortField = "propertyRating";
        sortDirection = Direction.DESC;
        break;
      case "Newest":
        sortField = "createdAt";
        sortDirection = Direction.DESC;
        break;
      case "Recommended":
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
          <Filter
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            initialInput={initialInput}
          />

          {/* Right Column Listing */}
          <main className="property-listing-main">
            {/* Listing Header Bar */}
            <div className="listing-header-box">
              <div className="header-top-row">
                <div className="heading-with-counter">
                  <h2 className="listing-heading">Explore Hotels</h2>
                  <span className="journeys-badge">
                    {total} stays available
                  </span>
                </div>

                {/* Sort Dropdown */}
                <div className="sort-group">
                  <span className="sort-title">SORT BY</span>
                  <div className="sort-dropdown-box">
                    <select
                      value={selectedSort}
                      onChange={sortChangeHandler}
                      className="sort-dropdown"
                    >
                      <option value="Recommended">Recommended</option>
                      <option value="Price: Low to High">
                        Price: Low to High
                      </option>
                      <option value="Price: High to Low">
                        Price: High to Low
                      </option>
                      <option value="Top Rated">Top Rated</option>
                      <option value="Newest">Newest</option>
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
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Hotels Grid */}
            {properties.length === 0 && !loading ? (
              <div className="no-data-box">
                <span className="material-symbols-outlined no-data-icon">
                  hotel
                </span>
                <h3>No Stays Found</h3>
                <p>
                  Try adjusting your search filters or destination criteria.
                </p>
              </div>
            ) : (
              <div className="hotels-grid">
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
                    />
                  </Stack>
                )}

                {properties.length !== 0 && (
                  <Stack className="total-result" sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total {total} propert{total > 1 ? "ies" : "y"} available
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
