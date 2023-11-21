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
class MapAPI {
  static api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
  });

  static async createMap(map: MHJSON) {
    return this.api.post('/map/map', { map });
  }

  // static async updateMap(mapID: string, delta: Delta){

  // }

  static async getMapById(mapID: string) {
    return this.api.get(`/map/${mapID}`);
  }

  static async getRecentMapIds(numOfMaps: number) {
    return this.api.get(`/map/recents/`, { params: { numOfMaps } });
  }

  /**
   * Sends a GET request to the server to fetch all registered users.
   * Returns a list of usernames from the server.
   *
   * @returns the server response
   */
  static async getAllUsers() {
    return this.api.get('/auth/users');
  }
}

export default MapAPI;
