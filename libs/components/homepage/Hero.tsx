import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import TuneIcon from "@mui/icons-material/Tune";
import ApartmentIcon from "@mui/icons-material/Apartment";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const Hero = () => {
  const router = useRouter();
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");

  const [openType, setOpenType] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  const propertyType = ["HOTEL", "RESORT", "VILLA", "APARTMENT"];
  const propertyLocation = [
    "Seoul",
    "Busan",
    "Jeju",
    "Incheon",
    "Japan",
    "Greece",
    "Switzerland",
    "Italy",
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
    const searchObj: any = {};
    if (location) searchObj.propertyCityList = [location];
    if (type) searchObj.propertyTypeList = [type];
    if (guests) searchObj.minGuests = guests;

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
                <span>LET'S MAKE A BEST TRIP EVER</span>
                <FlightTakeoffIcon className="flight-icon" />
              </div>

              <h1 className="hero-title">
                Make your Hassle Free Vacation plans now!{" "}
                <span className="plane-accent">✈</span>
              </h1>

              <p className="hero-subtitle">
                Invest in unforgettable luxury travel experiences curated across
                the world's most breathtaking horizons with discrete 24/7
                concierge guidance.
              </p>

              <div className="hero-divider"></div>

              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-value-box">
                    <StarRoundedIcon className="star-icon" />
                    <span className="stat-value">4.94</span>
                  </div>
                  <span className="stat-label">Total Rating</span>
                </div>

                <div className="stat-separator"></div>

                <div className="stat-item">
                  <span className="stat-value">105+</span>
                  <span className="stat-label">Curated Expeditions</span>
                </div>

                <div className="stat-separator"></div>

                <div className="stat-item">
                  <span className="stat-value">44</span>
                  <span className="stat-label">Global Awards</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="hero-right">
              <div className="hero-img-box">
                <img
                  src="/img/banner/hero_traveler.jpg"
                  alt="Traveler"
                  className="hero-img"
                />

                <div className="curated-badge">
                  <VerifiedUserIcon className="badge-check" />
                  <span>Curated Guide</span>
                </div>

                <div className="testimonial-card">
                  <span className="quote-icon">99</span>
                  <span className="user-name">Jenny Wilson</span>
                  <p className="quote-text">
                    "Curated stays and bespoke expeditions across the world.
                    Highly recommended."
                  </p>
                  <div className="avatars-row">
                    <div className="avatar-stack">
                      <span className="avatar av-1">J</span>
                      <span className="avatar av-2">M</span>
                      <span className="avatar av-3">ER</span>
                    </div>
                    <span className="traveled-count">+75k Traveled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SEARCH FILTER BAR */}
          <div className="search-filter-container">
            <div className="filter-bar">
              {/* TYPE FIELD (was FROM) */}
              <div
                className={`filter-item ${openType ? "active" : ""}`}
                onClick={() => setOpenType(!openType)}
              >
                <ApartmentIcon className="item-icon" />
                <div className="item-text">
                  <span className="label">STAY TYPE</span>
                  <span className="value">{type || "All Stays"}</span>
                </div>
              </div>

              {/* SWAP BUTTON */}
              <div
                className="swap-btn"
                onClick={() => {
                  const tempType = type;
                  const tempLoc = location;
                  setType(tempLoc); // Just for UI interaction effect
                  setLocation(tempType);
                }}
              >
                <SwapHorizIcon />
              </div>

              {/* LOCATION FIELD (was TO) */}
              <div
                className={`filter-item ${openLocation ? "active" : ""}`}
                onClick={() => setOpenLocation(!openLocation)}
              >
                <LocationOnIcon className="item-icon" />
                <div className="item-text">
                  <span className="label">LOCATION</span>
                  <span className="value">{location || "Anywhere"}</span>
                </div>
              </div>

              {/* DATES FIELD */}
              <div className="filter-item date-item">
                <CalendarMonthIcon className="item-icon" />
                <div className="item-text">
                  <span className="label">DATES</span>
                  <div className="date-inputs">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              {/* GUESTS FIELD */}
              <div
                className={`filter-item ${openGuests ? "active" : ""}`}
                onClick={() => setOpenGuests(!openGuests)}
              >
                <GroupIcon className="item-icon" />
                <div className="item-text">
                  <span className="label">TRAVELERS</span>
                  <span className="value">{guests} Guests</span>
                </div>
              </div>

              {/* SEARCH ACTION BUTTON */}
              <div className="search-submit-btn" onClick={searchHandler}>
                <SearchIcon />
              </div>
            </div>

            {/* POPUP DROPDOWNS */}
            <div
              className={`filter-type ${openType ? "on" : ""}`}
              ref={typeRef}
              style={{ left: "0" }}
            >
              <div
                onClick={() => {
                  setType("");
                  setOpenType(false);
                }}
              >
                All Stays
              </div>
              {propertyType.map((t: string) => (
                <div
                  onClick={() => {
                    setType(t);
                    setOpenType(false);
                  }}
                  key={t}
                >
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <div
              className={`filter-location ${openLocation ? "on" : ""}`}
              ref={locationRef}
              style={{ left: "27%" }}
            >
              <div
                onClick={() => {
                  setLocation("");
                  setOpenLocation(false);
                }}
              >
                Anywhere
              </div>
              {propertyLocation.map((loc: string) => (
                <div
                  onClick={() => {
                    setLocation(loc);
                    setOpenLocation(false);
                  }}
                  key={loc}
                >
                  <span>{loc}</span>
                </div>
              ))}
            </div>

            <div
              className={`filter-rooms ${openGuests ? "on" : ""}`}
              ref={guestsRef}
              style={{ right: "100px" }}
            >
              {[1, 2, 4, 5].map((num: number) => (
                <div
                  onClick={() => {
                    setGuests(num);
                    setOpenGuests(false);
                  }}
                  key={num}
                >
                  <span>
                    {num}+ Guest{num > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
