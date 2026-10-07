import React, { useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { UPDATE_MEMBER } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { logOut } from "../../auth";
import {
  sweetConfirmAlert,
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";

const MyProfileSettings: React.FC = () => {
  const user = useReactiveVar(userVar);

  const [nick, setNick] = useState<string>(user?.memberNick || "");
  const [phone, setPhone] = useState<string>(user?.memberPhone || "");
  const [address, setAddress] = useState<string>(user?.memberAddress || "");
  const [desc, setDesc] = useState<string>(user?.memberDesc || "");

  /** APOLLO REQUESTS **/
  const [updateMemberMutation, { loading }] = useMutation(UPDATE_MEMBER);

  /** HANDLERS **/
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMemberMutation({
        variables: {
          input: {
            _id: user?._id,
            memberNick: nick.trim(),
            memberPhone: phone.trim(),
            memberAddress: address.trim(),
            memberDesc: desc.trim(),
          },
        },
      });

      userVar({
        ...user,
        memberNick: nick.trim(),
        memberPhone: phone.trim(),
        memberAddress: address.trim(),
        memberDesc: desc.trim(),
      });

      sweetTopSmallSuccessAlert("Profile updated successfully!", 1000);
    } catch (err: any) {
      sweetMixinErrorAlert(err.message || "Update failed.");
    }
  };

  return (
    <div>
      <div className="section-top-bar">
        <div className="title-group">
          <h2>Account Settings</h2>
          <span className="counter-pill">Profile & Preferences</span>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid #dce2f7",
          maxWidth: "640px",
        }}
      >
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#141b2b",
                marginBottom: "6px",
              }}
            >
              Explorer Nickname
            </label>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                background: "#f1f3ff",
                border: "1px solid transparent",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#141b2b",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#141b2b",
                marginBottom: "6px",
              }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                background: "#f1f3ff",
                border: "1px solid transparent",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#141b2b",
                outline: "none",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#141b2b",
                marginBottom: "6px",
              }}
            >
              Base Location / Residence
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Valais, Switzerland"
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                background: "#f1f3ff",
                border: "1px solid transparent",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#141b2b",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#141b2b",
                marginBottom: "6px",
              }}
            >
              Explorer Bio & Editorial Focus
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tell the community about your travel pursuits..."
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "#f1f3ff",
                border: "1px solid transparent",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#141b2b",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: "44px",
                padding: "0 24px",
                background: "#006194",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfileSettings;
