import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ApartmentIcon from "@mui/icons-material/Apartment";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { PropertyType } from "../../enums/property.enum";
import { Destination } from "../../types/destination/destination";
import { useI18n } from "../../i18n";

interface HeroProps {
  destinations: Destination[];
}

/** AGENTS.md §9.1 — enum qiymatlari real API DTO'laridan olinadi **/
const STAY_TYPES: PropertyType[] = [
  PropertyType.HOTEL,
  PropertyType.RESORT,
  PropertyType.VILLA,
  PropertyType.APARTMENT,
];

const Hero = ({ destinations }: HeroProps) => {
  const router = useRouter();
  const { t } = useI18n();
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [openType, setOpenType] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  /** Destinations API'dan keladigan real manzillar **/
  const locationOptions = [
    "Seoul",
    "Tokyo",
    "Paris",
    "Osaka",
    "Bangkok",
    "Fukuoka",
  ];

  /** LIFECYCLES **/
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setOpenType(false);
      }
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setOpenLocation(false);
      }
      if (
        guestsRef.current &&
        !guestsRef.current.contains(event.target as Node)
      ) {
        setOpenGuests(false);
      }
    };

    document.addEventListener("mousedown", clickHandler);
    return () => {
      document.removeEventListener("mousedown", clickHandler);
    };
  }, []);

  /** HANDLERS **/
  const searchHandler = () => {
    const searchObj: Record<string, unknown> = {};
    if (location) searchObj.propertyCityList = [location];
    if (type) searchObj.propertyTypeList = [type];
    if (guests) searchObj.minGuests = guests;
    if (checkIn) searchObj.checkIn = checkIn;
    if (checkOut) searchObj.checkOut = checkOut;

    const queryInput = {
      page: 1,
      limit: 12,
      sort: "propertyViews",
      direction: "DESC",
      search: searchObj,
    };

    router.push({
      pathname: "/property",
      query: { input: JSON.stringify(queryInput) },
    });
  };

  return (
    <section className="hero-section">
      <div className="hero-banner">
        <div className="hero-content-container">
          <div className="hero-main-content">
            {/* LEFT COLUMN */}
            <div className="hero-left">
              <div className="badge-pill">
                <span className="dot">●</span>
                <span>{t("home.hero.eyebrow")}</span>
                <FlightTakeoffIcon className="flight-icon" />
              </div>

              <h1 className="hero-title">
                {t("home.hero.title")} <span className="plane-accent">✈</span>
              </h1>

              <p className="hero-subtitle">{t("home.hero.description")}</p>

              <div className="hero-divider"></div>

              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-value-box">
                    <ExploreRoundedIcon className="stat-icon" />
                    <span className="stat-value">
                      {t("home.hero.discover")}
                    </span>
                  </div>
                  <span className="stat-label">
                    {t("home.hero.discoverDescription")}
                  </span>
                </div>

                <div className="stat-separator" />

                <div className="stat-item">
                  <div className="stat-value-box">
                    <EventAvailableRoundedIcon className="stat-icon" />
                    <span className="stat-value">{t("home.hero.plan")}</span>
                  </div>
                  <span className="stat-label">
                    {t("home.hero.planDescription")}
                  </span>
                </div>

                <div className="stat-separator" />

                <div className="stat-item">
                  <div className="stat-value-box">
                    <GroupsRoundedIcon className="stat-icon" />
                    <span className="stat-value">{t("home.hero.connect")}</span>
                  </div>
                  <span className="stat-label">
                    {t("home.hero.connectDescription")}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="hero-right">
              <div className="hero-img-box">
                <img
                  src="/img/banner/hero_traveler.jpg"
                  alt={t("common.traveler")}
                  className="hero-img"
                />

                <div className="curated-badge">
                  <VerifiedUserIcon className="badge-check" />
                  <span>{t("home.hero.curatedGuide")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SEARCH FILTER BAR */}
          <div className="search-filter-container">
            <div className="filter-bar">
              {/* TYPE FIELD */}
              <div className="search-field-wrapper type-wrapper" ref={typeRef}>
                <button
                  type="button"
                  className={`filter-item ${openType ? "active" : ""}`}
                  onClick={() => {
                    setOpenType(!openType);
                    setOpenLocation(false);
                    setOpenGuests(false);
                  }}
                >
                  <ApartmentIcon className="item-icon" />
                  <div className="item-text">
                    <span className="label">{t("home.hero.stayType")}</span>
                    <span className="value">
                      {type || t("home.hero.allStays")}
                    </span>
                  </div>
                </button>

                {openType ? (
                  <div className="search-field-dropdown" role="listbox">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!type}
                      onClick={() => {
                        setType("");
                        setOpenType(false);
                      }}
                    >
                      {t("home.hero.allStays")}
                    </button>
                    {STAY_TYPES.map((t) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={type === t}
                        onClick={() => {
                          setType(t);
                          setOpenType(false);
                        }}
                        key={t}
                      >
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* LOCATION FIELD */}
              <div
                className="search-field-wrapper location-wrapper"
                ref={locationRef}
              >
                <button
                  type="button"
                  className={`filter-item ${openLocation ? "active" : ""}`}
                  onClick={() => {
                    setOpenLocation(!openLocation);
                    setOpenType(false);
                    setOpenGuests(false);
                  }}
                >
                  <LocationOnIcon className="item-icon" />
                  <div className="item-text">
                    <span className="label">{t("home.hero.location")}</span>
                    <span className="value">
                      {location || t("home.hero.anywhere")}
                    </span>
                  </div>
                </button>

                {openLocation ? (
                  <div className="search-field-dropdown" role="listbox">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!location}
                      onClick={() => {
                        setLocation("");
                        setOpenLocation(false);
                      }}
                    >
                      {t("home.hero.anywhere")}
                    </button>
                    {locationOptions.map((loc) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={location === loc}
                        onClick={() => {
                          setLocation(loc);
                          setOpenLocation(false);
                        }}
                        key={loc}
                      >
                        <span>{loc}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* DATES FIELD */}
              <div className="filter-item date-item">
                <CalendarMonthIcon className="item-icon" />
                <div className="item-text">
                  <span className="label">{t("home.hero.dates")}</span>
                  <div className="date-inputs">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut && e.target.value > checkOut) {
                          setCheckOut("");
                        }
                      }}
                      className="date-input"
                      aria-label={t("home.hero.checkIn")}
                    />
                    <span className="date-separator">—</span>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || undefined}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="date-input"
                      aria-label={t("home.hero.checkOut")}
                    />
                  </div>
                </div>
              </div>

              {/* GUESTS FIELD */}
              <div
                className="search-field-wrapper guests-wrapper"
                ref={guestsRef}
              >
                <button
                  type="button"
                  className={`filter-item ${openGuests ? "active" : ""}`}
                  onClick={() => {
                    setOpenGuests(!openGuests);
                    setOpenType(false);
                    setOpenLocation(false);
                  }}
                >
                  <GroupIcon className="item-icon" />
                  <div className="item-text">
                    <span className="label">{t("home.hero.travelers")}</span>
                    <span className="value">
                      {t("home.hero.guests", { count: guests })}
                    </span>
                  </div>
                </button>

                {openGuests ? (
                  <div className="search-field-dropdown" role="listbox">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={guests === num}
                        onClick={() => {
                          setGuests(num);
                          setOpenGuests(false);
                        }}
                        key={num}
                      >
                        <span>
                          {t(
                            num > 1
                              ? "home.hero.guestOptionPlural"
                              : "home.hero.guestOption",
                            { count: num },
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* SEARCH ACTION BUTTON */}
              <button
                type="button"
                className="search-submit-btn"
                onClick={searchHandler}
                aria-label={t("home.hero.searchStays")}
              >
                <SearchIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
