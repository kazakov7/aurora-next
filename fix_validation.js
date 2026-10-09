const fs = require('fs');

// Property
let propCode = fs.readFileSync('libs/components/property/detail/PropertyReservationWidget.tsx', 'utf-8');
propCode = propCode.replace(
    /router\.push\(\{ pathname: '\/checkout'[\s\S]*?\}\);\s*\};/,
    `if (!property._id || !isBookable || nights < 1 || guestCount < 1 || guestCount > maxGuestsAllowed) {
			await sweetErrorAlert('Please choose valid booking dates and guest count.');
			return;
		}
		router.push({ pathname: '/checkout', query: { type: 'property', id: property._id, checkIn, checkOut, guests: guestCount } });
	};`
);
fs.writeFileSync('libs/components/property/detail/PropertyReservationWidget.tsx', propCode);

// Tour
let tourCode = fs.readFileSync('libs/components/tour/detail/TourReservationWidget.tsx', 'utf-8');
tourCode = tourCode.replace(
    /router\.push\(\{ pathname: '\/checkout'[\s\S]*?\}\);\s*\};/,
    `if (!tour._id || seatsLeft < 1 || travelers < 1 || travelers > seatsLeft) {
			await sweetErrorAlert('This tour no longer has enough available seats.');
			return;
		}
		router.push({ pathname: '/checkout', query: { type: 'tour', id: tour._id, guests: travelers } });
	};`
);
fs.writeFileSync('libs/components/tour/detail/TourReservationWidget.tsx', tourCode);

console.log("Validation restored in reservation widgets");
