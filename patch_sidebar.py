import re

with open("libs/components/mypage/MyProfileSidebar.tsx", "r") as f:
    content = f.read()

# 1. Add GET_MY_AGENT_APPLICATIONS import
content = content.replace(
    'import { GET_FAVORITES, GET_FAVORITE_TOURS, GET_MY_BOOKINGS, GET_UNREAD_NOTIFICATION_COUNT } from "../../../apollo/user/query";',
    'import { GET_FAVORITES, GET_FAVORITE_TOURS, GET_MY_BOOKINGS, GET_UNREAD_NOTIFICATION_COUNT, GET_MY_AGENT_APPLICATIONS } from "../../../apollo/user/query";\nimport { AgentType, AgentVerificationStatus } from "../../enums/agent.enum";\nimport { Direction } from "../../enums/common.enum";'
)

# 2. Add query execution
query_str = """  const { data: agentData } = useQuery(GET_MY_AGENT_APPLICATIONS, {
    fetchPolicy: "network-only",
    skip: user?.memberType !== "AGENT",
    variables: {
      input: {
        page: 1,
        limit: 1,
        search: { verificationStatus: AgentVerificationStatus.APPROVED }
      }
    }
  });
  
  const myAgentType = agentData?.getMyAgentApplications?.list?.[0]?.agentType;
"""
content = content.replace('  const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, queryOptions);', '  const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, queryOptions);\n' + query_str)

# 3. Add Operator Section rendering
# We need to render the operator section before the divider and Admin Dashboard.
operator_section = """
        {user?.memberType === "AGENT" && myAgentType && (
          <>
            <div className="sidebar-section-title" style={{ padding: '16px 12px 8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#707881', fontWeight: 600 }}>
              Partner Operations
            </div>
            {myAgentType === AgentType.HOTEL && (
              <button
                type="button"
                className={`sidebar-item-btn ${currentCat === "myHotels" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "myHotels")}
              >
                <div className="item-left">
                  <span className="material-symbols-outlined">domain</span>
                  <span>My Hotels</span>
                </div>
              </button>
            )}
            {myAgentType === AgentType.TOUR && (
              <button
                type="button"
                className={`sidebar-item-btn ${currentCat === "myTours" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "myTours")}
              >
                <div className="item-left">
                  <span className="material-symbols-outlined">explore</span>
                  <span>My Tours</span>
                </div>
              </button>
            )}
            <button
              type="button"
              className={`sidebar-item-btn ${currentCat === "reservations" ? "active" : ""}`}
              onClick={(e) => handleNavClick(e, "reservations")}
            >
              <div className="item-left">
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Reservations</span>
              </div>
            </button>
          </>
        )}
"""

content = content.replace('        <div className="sidebar-nav-divider" />', operator_section + '\n        <div className="sidebar-nav-divider" />')

with open("libs/components/mypage/MyProfileSidebar.tsx", "w") as f:
    f.write(content)
