const fs = require('fs');

// Property
let propCode = fs.readFileSync('libs/components/property/detail/PropertyReservationWidget.tsx', 'utf-8');
propCode = propCode.replace(
    /router\.push\('\/checkout'\);/g,
    `router.push({ pathname: '/checkout', query: { type: 'property', id: property._id, checkIn, checkOut, guests: guestCount } });`
);
fs.writeFileSync('libs/components/property/detail/PropertyReservationWidget.tsx', propCode);

// Tour
let tourCode = fs.readFileSync('libs/components/tour/detail/TourReservationWidget.tsx', 'utf-8');
tourCode = tourCode.replace(
    /router\.push\('\/checkout'\);/g,
    `router.push({ pathname: '/checkout', query: { type: 'tour', id: tour._id, guests: travelers } });`
);
fs.writeFileSync('libs/components/tour/detail/TourReservationWidget.tsx', tourCode);

console.log("Widgets updated to route with query params");
