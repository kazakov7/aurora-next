const fs = require('fs');
let code = fs.readFileSync('../AURORA/apps/aurora-api/src/components/booking/booking.resolver.ts', 'utf-8');

const newMethod = `
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Bookings)
	public async getAllBookingsByAdmin(
		@Args('input') input: BookingsInquiry,
	): Promise<Bookings> {
		return this.bookingService.getAllBookingsByAdmin(input);
	}
}
`;

code = code.replace(/}\s*$/, newMethod);
fs.writeFileSync('../AURORA/apps/aurora-api/src/components/booking/booking.resolver.ts', code);
console.log("Patched booking.resolver.ts");
