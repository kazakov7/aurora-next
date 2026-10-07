import { CommentStatus, CommentGroup } from '../../enums/comment.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../destination/destination';

export interface Comment {
	_id: string;
	commentStatus: CommentStatus;
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
	memberData?: Member;
}

export interface Comments {
	list: Comment[];
	metaCounter: TotalCounter[];
}

export interface CommentInput {
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
}
