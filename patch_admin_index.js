const fs = require('fs');
let code = fs.readFileSync('pages/_admin/index.tsx', 'utf-8');

code = code.replace(
  /GET_AGENT_APPLICATIONS_BY_ADMIN,/,
  "GET_AGENT_APPLICATIONS_BY_ADMIN,\n  GET_ALL_BOOKINGS_BY_ADMIN,"
);

const hooks = `  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 5 } },
  });
  const recentBookings = bookingsData?.getAllBookingsByAdmin?.list || [];
  const totalBookings = bookingsData?.getAllBookingsByAdmin?.metaCounter?.[0]?.total || 0;`;

code = code.replace(
  '  const totalMembers = membersData?.getAllMembersByAdmin?.metaCounter?.[0]?.total || 0;',
  '  const totalMembers = membersData?.getAllMembersByAdmin?.metaCounter?.[0]?.total || 0;\n' + hooks
);

code = code.replace(
  '<span className="kpi-value">...</span>',
  '<span className="kpi-value">{totalBookings.toLocaleString()}</span>'
);
code = code.replace(
  '<span className="table-badge warning">Coming Soon (Mock)</span>',
  '<span className="table-badge primary">{totalBookings} Total</span>'
);

const tbodyReplacement = `
            <tbody>
              {bookingsLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}><span style={{ color: "#707881" }}>Loading bookings...</span></td></tr>
              ) : recentBookings.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}><span style={{ color: "#707881" }}>No recent bookings found.</span></td></tr>
              ) : (
                recentBookings.map((booking: any) => (
                  <tr key={booking._id}>
                    <td className="px-6"><span style={{fontFamily: 'monospace', color: '#006194', fontWeight: 600}}>#{booking._id.substring(booking._id.length - 6).toUpperCase()}</span></td>
                    <td>
                      <div className="user-avatar-cell">
                        <div className="avatar-circle bg-secondary">
                          {booking.memberData?.memberNick?.substring(0, 2).toUpperCase() || "US"}
                        </div>
                        <div className="user-cell">
                          <span className="user-name">{booking.memberData?.memberNick || "Unknown"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={\`badge-pill \${booking.bookingCategory === 'HOTEL' ? 'sky' : 'indigo'}\`}>{booking.bookingCategory}</span>
                    </td>
                    <td>
                      <span className="item-text">{booking.propertyData?.propertyName || booking.tourData?.tourName || "Unknown Item"}</span>
                    </td>
                    <td><span className="date-text">{moment(booking.createdAt).format("MMM DD, YYYY")}</span></td>
                    <td><strong style={{color: '#1a2b49'}}>{booking.bookingCurrency === 'KRW' ? '₩' : '$'}{booking.bookingTotalPrice.toLocaleString()}</strong></td>
                    <td>
                      <span className={\`status-pill \${booking.bookingStatus === 'CONFIRMED' ? 'green' : booking.bookingStatus === 'PENDING' ? 'amber' : 'red'}\`}>
                        <span className="dot"></span> {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 text-right">
                      <div className="actions-group"><button className="text-btn">View</button></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
`;

code = code.replace(
  /<tbody>[\s\S]*Booking API not implemented yet.[\s\S]*<\/tbody>/,
  tbodyReplacement
);

fs.writeFileSync('pages/_admin/index.tsx', code);
console.log("Patched pages/_admin/index.tsx");
