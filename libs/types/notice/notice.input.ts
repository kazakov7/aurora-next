import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeTitle: string;
	noticeContent: string;
}

export interface NoticeUpdate {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle?: string;
	noticeContent?: string;
}

export interface NoticeSearch {
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	text?: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: NoticeSearch;
}
