import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { GET_MY_AGENT_APPLICATIONS } from "../../../apollo/user/query";
import { SUBMIT_AGENT_APPLICATION } from "../../../apollo/user/mutation";
import { userVar } from "../../../apollo/store";
import { AgentType, AgentVerificationStatus } from "../../enums/agent.enum";
import {
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "../../sweetAlert";
import moment from "moment";
import { useI18n } from "../../i18n";

const AgentApplicationPage: React.FC = () => {
  const { t, tEnum, tError, formatDate } = useI18n();
  const user = useReactiveVar(userVar);

  const [formMode, setFormMode] = useState<"hidden" | "create" | "resubmit">("hidden");
  
  const [agentType, setAgentType] = useState<AgentType>(AgentType.HOTEL);
  const [companyName, setCompanyName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");

  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const { data, loading, refetch } = useQuery(GET_MY_AGENT_APPLICATIONS, {
    fetchPolicy: "network-only",
    variables: { input: { page: 1, limit: 10, search: {} } },
    skip: !user?._id,
  });

  const [submitAgentApplication, { loading: submitting }] = useMutation(
    SUBMIT_AGENT_APPLICATION,
  );

  const applications = data?.getMyAgentApplications?.list || [];
  const latestApp = applications[0];

  useEffect(() => {
    if (!loading && applications) {
      if (!latestApp) {
        setFormMode("create");
      } else if (latestApp.verificationStatus === AgentVerificationStatus.PENDING || latestApp.verificationStatus === AgentVerificationStatus.APPROVED) {
        setFormMode("hidden");
      } else if (latestApp.verificationStatus === AgentVerificationStatus.REJECTED && formMode === "hidden") {
        setFormMode("hidden");
      }
    }
  }, [loading, applications, latestApp]);

  const handleApplyAgain = () => {
    if (latestApp) {
      setAgentType(latestApp.agentType);
      setCompanyName(latestApp.companyName || "");
      setBusinessNumber(latestApp.businessNumber || "");
      setCompanyAddress(latestApp.companyAddress || "");
      setCompanyDesc(latestApp.companyDesc || "");
    }
    setFormMode("resubmit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !businessNumber.trim() || !companyAddress.trim()) {
      sweetMixinErrorAlert(t("common.fillRequiredFields"));
      return;
    }

    try {
      await submitAgentApplication({
        variables: {
          input: {
            agentType,
            companyName: companyName.trim(),
            businessNumber: businessNumber.trim(),
            companyAddress: companyAddress.trim(),
            companyDesc: companyDesc.trim(),
          },
        },
      });
      await refetch();
      sweetTopSmallSuccessAlert(t("profile.agentApplication.submitted"), 2000);
      setFormMode("hidden");
    } catch (err: any) {
      sweetMixinErrorAlert(tError(err, "profile.agentApplication.submitFailed"));
    }
  };

  const toggleHistory = (id: string) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: AgentVerificationStatus) => {
    switch (status) {
      case AgentVerificationStatus.PENDING:
        return (
          <span style={{ padding: "4px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
            {t("profile.agentApplication.pendingReview")}
          </span>
        );
      case AgentVerificationStatus.APPROVED:
        return (
          <span style={{ padding: "4px 8px", background: "#d1fae5", color: "#065f46", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
            {t("profile.agentApplication.approved")}
          </span>
        );
      case AgentVerificationStatus.REJECTED:
        return (
          <span style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
            {t("profile.agentApplication.notApproved")}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <p className="member-profile-state">{t("profile.agentApplication.loading")}</p>;
  }

  const isFormVisible = formMode === "create" || formMode === "resubmit";

  return (
    <div>
      <div className="section-top-bar" style={{ marginBottom: "24px" }}>
        <div className="title-group">
          {latestApp ? (
            <>
              <h2>{t("profile.agentApplication.yourAgentApplication")}</h2>
              <span className="counter-pill">{t("profile.agentApplication.trackText")}</span>
            </>
          ) : (
            <>
              <div style={{ fontSize: "12px", color: "#006194", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px", textTransform: "uppercase" }}>{t("profile.agentApplication.partnerProgram")}</div>
              <h2>{t("profile.agentApplication.becomeAnAuroraPartner")}</h2>
              <span className="counter-pill">{t("profile.agentApplication.introText")}</span>
            </>
          )}
        </div>
      </div>

      {latestApp?.verificationStatus === AgentVerificationStatus.PENDING && !isFormVisible && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #dce2f7", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>{getStatusBadge(latestApp.verificationStatus)}</div>
          <h3 style={{ fontSize: "20px", color: "#141b2b", margin: 0 }}>{t("profile.agentApplication.underReviewTitle")}</h3>
          <p style={{ fontSize: "14px", color: "#3f4850", margin: 0 }}>{t("profile.agentApplication.underReviewText")}</p>
          
          <div style={{ background: "#f9f9ff", borderRadius: "12px", padding: "20px", marginTop: "8px", display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#707881", fontSize: "13px" }}>{t("profile.agentApplication.agentType")}</span><span style={{ fontWeight: 600, fontSize: "13px" }}>{tEnum("agentType", latestApp.agentType)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#707881", fontSize: "13px" }}>{t("profile.agentApplication.companyName")}</span><span style={{ fontWeight: 600, fontSize: "13px" }}>{latestApp.companyName}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#707881", fontSize: "13px" }}>{t("profile.agentApplication.businessNumber")}</span><span style={{ fontWeight: 600, fontSize: "13px" }}>{latestApp.businessNumber}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#707881", fontSize: "13px" }}>{t("profile.agentApplication.submissionDate")}</span><span style={{ fontWeight: 600, fontSize: "13px" }}>{formatDate(latestApp.createdAt, "medium")}</span></div>
          </div>
          <div style={{ fontSize: "12px", color: "#707881", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
             <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>info</span>
             {t("profile.agentApplication.reviewingNote")}
          </div>
        </div>
      )}

      {latestApp?.verificationStatus === AgentVerificationStatus.APPROVED && !isFormVisible && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #dce2f7", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>{getStatusBadge(latestApp.verificationStatus)}</div>
          <h3 style={{ fontSize: "20px", color: "#141b2b", margin: 0 }}>{t("profile.agentApplication.youAreAnAuroraPartner")}</h3>
          <p style={{ fontSize: "14px", color: "#3f4850", margin: 0 }}>{t("profile.agentApplication.approvedText")}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "8px", alignSelf: "flex-start", height: "40px", padding: "0 24px", background: "#006194", color: "#fff", borderRadius: "8px", fontWeight: 600, border: "none", cursor: "pointer" }}>
            {t("profile.agentApplication.refreshPage")}
          </button>
        </div>
      )}

      {latestApp?.verificationStatus === AgentVerificationStatus.REJECTED && !isFormVisible && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #fecaca", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>{getStatusBadge(latestApp.verificationStatus)}</div>
          <h3 style={{ fontSize: "20px", color: "#141b2b", margin: 0 }}>{t("profile.agentApplication.needsChangesTitle")}</h3>
          <p style={{ fontSize: "14px", color: "#3f4850", margin: 0 }}>{t("profile.agentApplication.needsChangesText")}</p>
          
          <div style={{ background: "#fef2f2", borderLeft: "4px solid #ef4444", padding: "16px", borderRadius: "0 8px 8px 0", marginTop: "8px" }}>
             <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>{t("profile.agentApplication.reasonForRejection")}</div>
             <div style={{ fontSize: "14px", color: "#7f1d1d" }}>{latestApp.rejectionReason || t("profile.agentApplication.noFeedback")}</div>
          </div>

          <button onClick={handleApplyAgain} style={{ marginTop: "8px", alignSelf: "flex-start", height: "40px", padding: "0 24px", background: "#006194", color: "#fff", borderRadius: "8px", fontWeight: 600, border: "none", cursor: "pointer" }}>
            {t("profile.agentApplication.applyAgain")}
          </button>
        </div>
      )}

      {isFormVisible && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #dce2f7", marginBottom: "24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Type Selector */}
            <div>
               <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#141b2b", marginBottom: "12px" }}>{t("profile.agentApplication.partnerType")} <span style={{ color: "#ba1a1a" }}>*</span></label>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div 
                    onClick={() => setAgentType(AgentType.HOTEL)}
                    style={{ padding: "20px", borderRadius: "12px", border: agentType === AgentType.HOTEL ? "2px solid #006194" : "1px solid #dce2f7", background: agentType === AgentType.HOTEL ? "#f1f3ff" : "#fff", cursor: "pointer", transition: "all 0.2s" }}
                  >
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span className="material-symbols-outlined" style={{ color: agentType === AgentType.HOTEL ? "#006194" : "#707881" }}>hotel</span>
                        <span style={{ fontWeight: 600, color: agentType === AgentType.HOTEL ? "#006194" : "#141b2b" }}>{t("profile.agentApplication.hotelPartner")}</span>
                     </div>
                     <p style={{ margin: 0, fontSize: "12px", color: "#707881", lineHeight: 1.4 }}>{t("profile.agentApplication.hotelPartnerText")}</p>
                  </div>
                  
                  <div 
                    onClick={() => setAgentType(AgentType.TOUR)}
                    style={{ padding: "20px", borderRadius: "12px", border: agentType === AgentType.TOUR ? "2px solid #006194" : "1px solid #dce2f7", background: agentType === AgentType.TOUR ? "#f1f3ff" : "#fff", cursor: "pointer", transition: "all 0.2s" }}
                  >
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span className="material-symbols-outlined" style={{ color: agentType === AgentType.TOUR ? "#006194" : "#707881" }}>explore</span>
                        <span style={{ fontWeight: 600, color: agentType === AgentType.TOUR ? "#006194" : "#141b2b" }}>{t("profile.agentApplication.tourPartner")}</span>
                     </div>
                     <p style={{ margin: 0, fontSize: "12px", color: "#707881", lineHeight: 1.4 }}>{t("profile.agentApplication.tourPartnerText")}</p>
                  </div>
               </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141b2b", marginBottom: "6px" }}>{t("profile.agentApplication.companyName")} <span style={{ color: "#ba1a1a" }}>*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("profile.agentApplication.companyPlaceholder")}
                  style={{ width: "100%", height: "44px", padding: "0 14px", background: "#f1f3ff", border: "1px solid transparent", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141b2b", marginBottom: "6px" }}>{t("profile.agentApplication.businessRegistrationNumber")} <span style={{ color: "#ba1a1a" }}>*</span></label>
                <input
                  type="text"
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  placeholder={t("profile.agentApplication.businessNumberPlaceholder")}
                  style={{ width: "100%", height: "44px", padding: "0 14px", background: "#f1f3ff", border: "1px solid transparent", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141b2b", marginBottom: "6px" }}>{t("profile.agentApplication.companyAddress")} <span style={{ color: "#ba1a1a" }}>*</span></label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder={t("profile.agentApplication.addressPlaceholder")}
                  style={{ width: "100%", height: "44px", padding: "0 14px", background: "#f1f3ff", border: "1px solid transparent", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141b2b", marginBottom: "6px" }}>{t("profile.agentApplication.companyDescription")}</label>
                <textarea
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  placeholder={t("profile.agentApplication.descriptionPlaceholder")}
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", background: "#f1f3ff", border: "1px solid transparent", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              {formMode === "resubmit" && (
                 <button type="button" onClick={() => setFormMode("hidden")} style={{ height: "44px", padding: "0 24px", background: "#f1f3ff", color: "#3f4850", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>{t("common.cancel")}</button>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{ height: "44px", padding: "0 32px", background: "#006194", color: "#ffffff", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                {submitting ? t("profile.agentApplication.submitting") : t("profile.agentApplication.submitApplication")}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Application History */}
      {applications.length > 0 && (
        <div style={{ marginTop: "40px" }}>
           <h3 style={{ fontSize: "16px", color: "#141b2b", marginBottom: "16px" }}>{t("profile.agentApplication.applicationHistory")}</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {applications.map((app: any) => {
                 const isExpanded = expandedHistory[app._id];
                 return (
                    <div key={app._id} style={{ background: "#fff", border: "1px solid #dce2f7", borderRadius: "12px", overflow: "hidden" }}>
                       <div 
                         onClick={() => toggleHistory(app._id)}
                         style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isExpanded ? "#f9f9ff" : "#fff" }}
                       >
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                             <span style={{ fontSize: "13px", color: "#707881", width: "90px" }}>{formatDate(app.createdAt, "medium")}</span>
                             <span style={{ fontSize: "14px", fontWeight: 600, color: "#141b2b" }}>{tEnum("agentType", app.agentType)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                             {getStatusBadge(app.verificationStatus)}
                             <span className="material-symbols-outlined" style={{ color: "#bfc7d2", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>expand_more</span>
                          </div>
                       </div>
                       
                       {isExpanded && (
                          <div style={{ padding: "16px", borderTop: "1px solid #dce2f7", display: "grid", gap: "12px", background: "#fff" }}>
                             <div style={{ display: "flex" }}><span style={{ color: "#707881", fontSize: "13px", width: "140px" }}>{t("profile.agentApplication.companyName")}</span><span style={{ fontSize: "13px" }}>{app.companyName}</span></div>
                             <div style={{ display: "flex" }}><span style={{ color: "#707881", fontSize: "13px", width: "140px" }}>{t("profile.agentApplication.businessNumber")}</span><span style={{ fontSize: "13px" }}>{app.businessNumber}</span></div>
                             {app.verificationStatus === AgentVerificationStatus.REJECTED && (
                                <div style={{ display: "flex" }}><span style={{ color: "#991b1b", fontSize: "13px", width: "140px", fontWeight: 600 }}>{t("profile.agentApplication.rejectionReason")}</span><span style={{ fontSize: "13px", color: "#7f1d1d" }}>{app.rejectionReason || "N/A"}</span></div>
                             )}
                          </div>
                       )}
                    </div>
                 );
              })}
           </div>
        </div>
      )}

    </div>
  );
};

export default AgentApplicationPage;
