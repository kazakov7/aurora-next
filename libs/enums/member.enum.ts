export enum MemberType {
	USER = 'USER',
	AGENT = 'AGENT',
	ADMIN = 'ADMIN',
}

export enum MemberStatus {
	ACTIVE = 'ACTIVE',
	BLOCKED = 'BLOCKED',
	DELETED = 'DELETED',
}

export enum MemberAuthType {
	NICK = 'NICK',
	PHONE = 'PHONE',
	EMAIL = 'EMAIL',
	GOOGLE = 'GOOGLE',
	KAKAO = 'KAKAO',
	TELEGRAM = 'TELEGRAM',
}

export enum AgentType {
	HOTEL = 'HOTEL',
	TOUR = 'TOUR',
}

export enum AgentVerificationStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
	REVOKED = 'REVOKED',
}
