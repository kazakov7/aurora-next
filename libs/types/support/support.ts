import { SupportCategory, SupportStatus } from '../../enums/support.enum';
import { TotalCounter } from '../destination/destination';

export interface SupportTicket {
	_id: string;
	ticketCategory: SupportCategory;
	ticketStatus: SupportStatus;
	ticketName: string;
	ticketEmail: string;
	ticketSubject: string;
	ticketMessage: string;
	ticketAttachment?: string;
	ticketReply?: string;
	repliedAt?: Date;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface SupportTickets {
	list: SupportTicket[];
	metaCounter: TotalCounter[];
}
