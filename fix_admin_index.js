const fs = require('fs');
let code = fs.readFileSync('pages/_admin/index.tsx', 'utf-8');

const hookStr = `
  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 5 } },
  });
  const recentBookingsData = bookingsData?.getAllBookingsByAdmin?.list || [];
  const totalBookings = bookingsData?.getAllBookingsByAdmin?.metaCounter?.[0]?.total || 0;
`;

code = code.replace(
  '  return (',
  hookStr + '\n  return ('
);

// We need to change recentBookings.map to recentBookingsData.map
// because recentBookings is a useState variable that's not populated!
code = code.replace(/recentBookings\.length === 0/g, 'recentBookingsData.length === 0');
code = code.replace(/recentBookings\.map/g, 'recentBookingsData.map');

fs.writeFileSync('pages/_admin/index.tsx', code);
console.log("Fixed pages/_admin/index.tsx");
