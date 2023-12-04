import axios from 'axios';
import { post } from 'cypress/types/jquery';
import { MHJSON } from 'types/MHJSON';
import {
  PostPayload,
  LikePayloadPost,
  LikePayloadComment,
} from 'types/postPayload';
const SERVER_PORT = 3031;

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // if hostname is localhost, change the port, else prepend with api
  let baseURL = '';
  if (window.location.hostname === 'localhost') {
    baseURL = `http://localhost:${SERVER_PORT}`;
  } else {
    baseURL = `https://api.${window.location.hostname}`;
  }
  // if pathname has /dev, the url we return also has /dev
  if (window.location.pathname.startsWith('/dev')) {
    baseURL += '/dev';
  }
  console.log('base url is ' + baseURL);
  return baseURL;
}

/**
 * The MapAPI is responsible for sending and receiving requests from the
 * server for account login, creation, deletion, and modifications.
 */
class PostAPI {
  static api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
  });

  static async publishMap(mapID: string, title: string, description: string) {
    return this.api.post('/posts/publish', { mapID, title, description });
  }
  static async getPostById(postId: string) {
    return this.api.get(`/posts/post/${postId}`);
  }
  static async queryPosts(searchQuery: string) {
    return this.api.get('/posts/all', { params: { searchQuery } });
  }
  static async getAllUserPosts(userId: string) {
    return this.api.get(`/posts/user/${userId}`);
  }

  static async createComment(postID: string, content: string) {
    return this.api.post(`/posts/comments/${postID} `, { content });
  }
  // static async updatePostInfo(postPayload: PostPayload) {
  //   return this.api.put(`/posts/post/${postPayload.postId}`, { postPayload });
  // }

  static async changeLikeToPost(likePayload: LikePayloadPost) {
    return this.api.patch(`/posts/post/likeChange`, { likePayload });
  }

  static async changeLikeToComment(likePayload: LikePayloadComment) {
    return this.api.patch(`/posts/comments/likeChange`, { likePayload });
  }

  static async addReplyToComment(commentId: string, content: string) {
    return this.api.post(`/posts/comments/${commentId}/replies`, { content });
  }
}

export default PostAPI;
