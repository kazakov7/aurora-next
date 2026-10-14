import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';

export interface CommentSearch {
	commentRefId: string;
	commentGroup?: CommentGroup;
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: CommentSearch;
}

export interface CommentInput {
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
}

export interface AllCommentsSearch {
	commentGroup?: CommentGroup;
	text?: string;
}

export interface AllCommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AllCommentsSearch;
}
