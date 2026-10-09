import { SupportCategory, SupportStatus } from '../../enums/support.enum';
import { Direction } from '../../enums/common.enum';

export interface SupportTicketInput {
	ticketCategory: SupportCategory;
	ticketName: string;
	ticketEmail: string;
	ticketSubject: string;
	ticketMessage: string;
	ticketAttachment?: string;
}

export interface SupportTicketUpdate {
	_id: string;
	ticketStatus?: SupportStatus;
	ticketReply?: string;
}

export interface SupportTicketSearch {
	ticketCategory?: SupportCategory;
	ticketStatus?: SupportStatus;
	text?: string;
}

export interface SupportTicketsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: SupportTicketSearch;
}
