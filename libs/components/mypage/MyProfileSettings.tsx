import React, { useEffect, useState, useRef } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { UPDATE_MEMBER } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { getJwtToken, setJwtToken, updateUserInfo } from "../../auth";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";

const MyProfileSettings: React.FC = () => {
  const user = useReactiveVar(userVar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nick, setNick] = useState<string>(user?.memberNick || "");
  const [phone, setPhone] = useState<string>(user?.memberPhone || "");
  const [address, setAddress] = useState<string>(user?.memberAddress || "");
  const [desc, setDesc] = useState<string>(user?.memberDesc || "");
  const [image, setImage] = useState<string>(user?.memberImage || "");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  /** APOLLO REQUESTS **/
  const [updateMemberMutation, { loading }] = useMutation(UPDATE_MEMBER);

  useEffect(() => {
    setNick(user?.memberNick || "");
    setPhone(user?.memberPhone || "");
    setAddress(user?.memberAddress || "");
    setDesc(user?.memberDesc || "");
    setImage(user?.memberImage || "");
  }, [user?._id, user?.memberNick, user?.memberPhone, user?.memberAddress, user?.memberDesc, user?.memberImage]);

  /** HANDLERS **/
  const handleImageUpload = async (e: any) => {
    try {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);

        const token = getJwtToken();
        const formData = new FormData();
        formData.append(
            'operations',
            JSON.stringify({
                query: `mutation ImageUploader($file: Upload!, $target: String!) {
                    imageUploader(file: $file, target: $target) 
              }`,
                variables: {
                    file: null,
                    target: 'member',
                },
            }),
        );
        formData.append(
            'map',
            JSON.stringify({
                '0': ['variables.file'],
            }),
        );
        formData.append('0', file);

        const response = await fetch(process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql', {
            method: 'POST',
            headers: {
                'apollo-require-preflight': 'true',
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const json = await response.json();
        const responseImage = json.data?.imageUploader;
        if (responseImage) {
            setImage(responseImage);
        } else {
            throw new Error(json.errors?.[0]?.message || 'Upload failed');
        }
    } catch (err: any) {
        console.log('Error, handleImageUpload:', err);
        sweetMixinErrorAlert(err.message || 'Image upload failed');
    } finally {
        setUploadingImage(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateMemberMutation({
        variables: {
          input: {
            _id: user?._id,
            memberNick: nick.trim(),
            memberPhone: phone.trim(),
            memberAddress: address.trim(),
            memberDesc: desc.trim(),
            memberImage: image,
          },
        },
      });

      if (result.data?.updateMember) {
        const { accessToken } = result.data.updateMember;
        if (accessToken) {
          setJwtToken(accessToken);
          updateUserInfo(accessToken);
        }
        userVar({ ...userVar(), ...result.data.updateMember });
        sweetTopSmallSuccessAlert("Profile updated successfully!", 1000);
      }
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
          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
             <img 
                src={getImageUrl(image, DEFAULT_USER_AVATAR)} 
                alt="Avatar" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #dce2f7' }}
             />
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#141b2b" }}>Profile Picture</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                            height: '36px', padding: '0 16px', background: '#e9edff', color: '#006194', 
                            border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {uploadingImage ? 'Uploading...' : 'Change Image'}
                    </button>
                    {image && (
                        <button 
                            type="button" 
                            onClick={() => setImage('')}
                            style={{
                                height: '36px', padding: '0 16px', background: '#ffebee', color: '#c62828', 
                                border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            Remove
                        </button>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                />
             </div>
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
              disabled={loading || uploadingImage}
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
