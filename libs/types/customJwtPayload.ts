export interface CustomJwtPayload {
	_id: string;
	memberType: string;
	memberStatus: string;
	memberAuthType?: string;
	memberPhone: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	[key: string]: any;
}
