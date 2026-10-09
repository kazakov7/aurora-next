const fs = require('fs');
let code = fs.readFileSync('../AURORA/apps/aurora-api/src/components/booking/booking.service.ts', 'utf-8');

const newMethod = `
	public async getAllBookingsByAdmin(input: BookingsInquiry): Promise<Bookings> {
		const match: T = {};
		if (input.search?.bookingStatusList?.length) {
			match.bookingStatus = { $in: input.search.bookingStatusList };
		}

		const result = await this.bookingModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
							{ $lookup: { from: 'properties', localField: 'bookingRefId', foreignField: '_id', as: 'propertyData' } },
							{ $unwind: { path: '$propertyData', preserveNullAndEmptyArrays: true } },
							{ $lookup: { from: 'tours', localField: 'bookingRefId', foreignField: '_id', as: 'tourData' } },
							{ $unwind: { path: '$tourData', preserveNullAndEmptyArrays: true } }
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return result[0] as Bookings;
	}

	private async getBookings`;

code = code.replace('	private async getBookings', newMethod);
fs.writeFileSync('../AURORA/apps/aurora-api/src/components/booking/booking.service.ts', code);
console.log("Patched booking.service.ts");
