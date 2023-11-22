import axios from 'axios';
import { MHJSON } from 'types/MHJSON';
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

  static async queryPosts(searchQuery: string) {
    return this.api.get('/posts/all', { params: { searchQuery } });
  }
  static async getAllUserPosts() {
    return this.api.get('/posts/user');
  }
}

export default PostAPI;
