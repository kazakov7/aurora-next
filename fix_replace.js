const fs = require('fs');
let code = fs.readFileSync('pages/_admin/index.tsx', 'utf-8');

// I will just manually fix that line using simple replacement that doesn't trigger the $ bug
// Or I can rewrite the whole file from the previous commit, but I don't have git tracking.

// Let's just restore the tbody
const tbodyReplacement = `
            <tbody>
              {bookingsLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}><span style={{ color: "#707881" }}>Loading bookings...</span></td></tr>
              ) : recentBookingsData.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}><span style={{ color: "#707881" }}>No recent bookings found.</span></td></tr>
              ) : (
                recentBookingsData.map((booking: any) => (
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
                    <td><strong style={{color: '#1a2b49'}}>{booking.bookingCurrency === 'KRW' ? '₩' : '$$'}{booking.bookingTotalPrice.toLocaleString()}</strong></td>
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

// Now find the broken tbody start and end
const startIndex = code.indexOf('<tbody>');
const endIndex = code.indexOf('</table>');
if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + tbodyReplacement.replace(/\$\$/g, '$$$$') + code.substring(endIndex);
}

fs.writeFileSync('pages/_admin/index.tsx', code);
console.log("Fixed tbody string literal");
