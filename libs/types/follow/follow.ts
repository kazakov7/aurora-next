import { Member } from '../member/member';
import { TotalCounter } from '../destination/destination';

export interface MeFollowed {
	followingId: string;
	followerId: string;
	myFollowing: boolean;
}

export interface Follower {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	meFollowed?: MeFollowed[];
	followerData?: Member;
}

export interface Followers {
	list: Follower[];
	metaCounter: TotalCounter[];
}

export interface Following {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	meFollowed?: MeFollowed[];
	followingData?: Member;
}

export interface Followings {
	list: Following[];
	metaCounter: TotalCounter[];
}
