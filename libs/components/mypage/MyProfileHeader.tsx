import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "../../../apollo/store";
import { GET_MEMBER } from "../../../apollo/user/query";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";
import { setJwtToken, updateUserInfo } from "../../auth";


interface MyProfileHeaderProps {
  onCategoryChange?: (category: string) => void;
}

const MyProfileHeader: React.FC<MyProfileHeaderProps> = ({
  onCategoryChange,
}) => {
  const user = useReactiveVar(userVar);
  const router = useRouter();

  

  const { data } = useQuery(GET_MEMBER, {
    fetchPolicy: "network-only",
    variables: { input: user?._id || "" },
    skip: !user?._id,
  });
  const profile = data?.getMember || user;

  useEffect(() => {
    const member = data?.getMember;
    if (!member) return;

    // Own profile reads return a fresh JWT so role changes (e.g. agent approval) apply without re-login
    if (member.accessToken) {
      setJwtToken(member.accessToken);
      updateUserInfo(member.accessToken);
    }

    const current = userVar();

    userVar({
      ...current,
      ...member,
      accessToken: current.accessToken,
    });
  }, [data]);
  const handleNav = (cat: string) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      router.push(
        { pathname: "/mypage", query: { category: cat } },
        undefined,
        { shallow: true },
      );
    }
  };

  const profileImg = getImageUrl(profile?.memberImage, DEFAULT_USER_AVATAR);
  const userNick = profile?.memberNick || "AURA traveller";
  const userAddress = profile?.memberAddress || "Location not provided";

  return (
    <section className="profile-header-card">
      <div className="header-content-wrapper">
        {/* Left: Avatar & Identity Details */}
        <div className="header-left-bio">
          {/* Avatar */}
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              <img alt={userNick} className="avatar-img" src={profileImg} />
            </div>
          </div>

          {/* Name, Handle, Badges, Location & Bio */}
          <div className="bio-details">
            <div className="name-row">
              <h1>{userNick}</h1>
              <span className="verified-pill">
                {profile?.memberType || "USER"}
              </span>
            </div>

            <div className="meta-row">
              <span className="handle">
                @{userNick.toLowerCase().replace(/\s+/g, "")}
              </span>
              <span className="dot">•</span>
              <span className="location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                {userAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Key Metrics & Actions */}
        <div className="header-right-section">
          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="metric-item" onClick={() => handleNav("articles")}>
              <div className="metric-number">
                {profile?.memberArticles ?? 0}
              </div>
              <div className="metric-label">Articles</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item" onClick={() => handleNav("followers")}>
              <div className="metric-number">
                {profile?.memberFollowers ?? 0}
              </div>
              <div className="metric-label">Followers</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item" onClick={() => handleNav("following")}>
              <div className="metric-number">
                {profile?.memberFollowings ?? 0}
              </div>
              <div className="metric-label">Following</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {profile?.memberType === "USER" && (
              <button
                className="btn-primary"
                onClick={() => handleNav("partner")}
              >
                <span className="material-symbols-outlined">handshake</span>
                <span>Become a Partner</span>
              </button>
            )}
            <button
              className={
                profile?.memberType === "USER" ? "btn-secondary" : "btn-primary"
              }
              onClick={() => handleNav("settings")}
            >
              <span className="material-symbols-outlined">edit</span>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default MyProfileHeader;
