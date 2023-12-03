export enum LikeChange {
  ADD_LIKE = 'like',
  REMOVE_LIKE = 'dislike',
}

export interface LikePayloadPost {
  postId: string;
  likeChange: LikeChange;
}
export interface LikePayloadComment {
  commentId: string;
  likeChange: LikeChange;
}

export interface PostPayload {
  postId: string;
  title?: string;
  description: string;
}
