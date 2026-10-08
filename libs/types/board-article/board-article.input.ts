import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';

export interface BAISearch {
	articleCategory?: BoardArticleCategory;
	text?: string;
	memberId?: string;
}

export interface BoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: BAISearch;
}

export interface ABAISearch {
	articleCategory?: BoardArticleCategory;
	articleStatus?: BoardArticleStatus;
}

export interface AllBoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ABAISearch;
}

export interface BoardArticleInput {
	articleCategory: BoardArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImage?: string;
}

export interface BoardArticleUpdate {
	_id: string;
	articleTitle?: string;
	articleContent?: string;
	articleImage?: string;
	articleStatus?: BoardArticleStatus;
}
