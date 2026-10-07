import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "../../apollo/store";
import { getJwtToken, updateUserInfo, logOut } from "../auth";
import { getImageUrl } from "../config";

const Top = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activePath, setActivePath] = useState("home");

  /** LIFECYCLES **/
  useEffect(() => {
    const jwt = getJwtToken();
    if (jwt) updateUserInfo(jwt);
  }, []);

  useEffect(() => {
    const pathname = router.pathname;
    if (pathname === "/") setActivePath("home");
    else if (pathname.startsWith("/property")) setActivePath("hotels");
    else if (pathname.startsWith("/tour")) setActivePath("tours");
    else if (pathname.startsWith("/destination")) setActivePath("destinations");
    else if (pathname.startsWith("/community")) setActivePath("community");
    else if (pathname.startsWith("/mypage")) setActivePath("my-page");
    else if (pathname.startsWith("/chat")) setActivePath("chat");
    else if (pathname.startsWith("/cs")) setActivePath("customer-service");
  }, [router.pathname]);

  return (
    <header className="header-navbar">
      <div className="header-container">
        {/* Logo & Navigation */}
        <div className="nav-left">
          <Link href="/" className="logo-link">
            <span className="logo-text">AURA</span>
          </Link>

          <nav className="nav-menu">
            <Link
              href="/"
              className={`nav-item ${activePath === "home" ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              href="/property"
              className={`nav-item ${activePath === "hotels" ? "active" : ""}`}
            >
              Hotels
            </Link>
            <Link
              href="/tour"
              className={`nav-item ${activePath === "tours" ? "active" : ""}`}
            >
              Tours
            </Link>
            <Link
              href="/destination"
              className={`nav-item ${
                activePath === "destinations" ? "active" : ""
              }`}
            >
              Destinations
            </Link>
            <Link
              href="/community"
              className={`nav-item ${
                activePath === "community" ? "active" : ""
              }`}
            >
              Community
            </Link>
            {user?._id && (
              <Link
                href="/mypage"
                className={`nav-item ${
                  activePath === "my-page" ? "active" : ""
                }`}
              >
                My Page
              </Link>
            )}
            <Link
              href="/chat"
              className={`nav-item ${activePath === "chat" ? "active" : ""}`}
            >
              Chat
            </Link>
            <Link
              href="/cs"
              className={`nav-item ${
                activePath === "customer-service" ? "active" : ""
              }`}
            >
              CS
            </Link>
          </nav>
        </div>

        {/* Quick Search Input */}
        <div className="nav-search">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined search-icon">
              search
            </span>
            <input
              type="text"
              placeholder="Search places, stays..."
              className="search-input"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="nav-right">
          <Link
            href={user?._id ? "/mypage?category=wishlist" : "/account/join"}
          >
            <button
              aria-label="Saved Wishlist"
              className="icon-btn"
              type="button"
            >
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </Link>

          <Link
            href={
              user?._id ? "/mypage?category=notifications" : "/account/join"
            }
          >
            <button
              aria-label="Notifications"
              className="icon-btn relative"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="notification-dot"></span>
            </button>
          </Link>

          <div className="lang-currency">
            <button className="lang-btn" type="button">
              <span className="material-symbols-outlined">language</span>
              <span>USD · EN</span>
            </button>
          </div>

          {user?._id ? (
            <div className="user-profile-menu">
              <Link href="/mypage" className="avatar-link">
                <img
                  src={getImageUrl(
                    user?.memberImage,
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAIifsb8JN2LKRqZTER_hPU96n7R2XO4PNCfW122y_1bMUsLI0rC6oa5xTZUzzxRxT54eemqEHPhV4jIUhW-wFrpr3YHyIRRnrNRAvq3iq3p-H8q18_n0reQH4Z6-jJ3S5bTC6ST6pKSIQo_prbOMDq5Wvoa20BQgNu9d7fvA2gqL_Db2c7moEy2ebwQD3_fAoRy3fgBRLr0GH_laW8T1YxLHhu0K9BfdnSXQJuxvVK-P6AmjVIm9e5",
                  )}
                  alt="Profile"
                  className="avatar-img"
                />
              </Link>
            </div>
          ) : (
            <Link href="/account/join" className="avatar-link">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIifsb8JN2LKRqZTER_hPU96n7R2XO4PNCfW122y_1bMUsLI0rC6oa5xTZUzzxRxT54eemqEHPhV4jIUhW-wFrpr3YHyIRRnrNRAvq3iq3p-H8q18_n0reQH4Z6-jJ3S5bTC6ST6pKSIQo_prbOMDq5Wvoa20BQgNu9d7fvA2gqL_Db2c7moEy2ebwQD3_fAoRy3fgBRLr0GH_laW8T1YxLHhu0K9BfdnSXQJuxvVK-P6AmjVIm9e5"
                alt="Profile"
                className="avatar-img"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Top;
