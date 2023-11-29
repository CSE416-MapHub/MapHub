import axios from 'axios';

const SERVER_PORT = 3031;

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // if hostname is localhost, change the port, else prepend with api
  let baseURL;
  if (window.location.hostname === 'localhost') {
    baseURL = `http://localhost:${SERVER_PORT}`;
  } else {
    baseURL = `https://api.${window.location.hostname}`;
  }
  // if pathname has /dev, the url we return also has /dev
  if (window.location.pathname.startsWith('/dev')) {
    baseURL += '/dev';
  }
  return baseURL;
}

/**
 * The AccountAPI is responsible for sending and receiving requests from the
 * server for account login, creation, deletion, and modifications.
 */
class AccountAPI {
  static api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
  });

  /**
   * Sends a POST request to the server to create a new account with a username,
   * email address, password, and password confirmation. Returns a response from
   * the server.
   *
   * @param username - the new account username
   * @param email - the new account email address
   * @param password - the new account password
   * @param passwordConfirm - the new account password confirmation
   * @returns the server response
   */
  static async registerUser(
    username: string,
    email: string,
    password: string,
    passwordConfirm: string,
  ) {
    return this.api.post('/auth/register', {
      username,
      email,
      password,
      passwordVerify: passwordConfirm,
    });
  }
  /**
   * Sends a POST request to the server to login to an existing account
   * with a valid username and password. Returns a response from
   * the server.
   *
   * @param username - the existing account username
   * @param password - the existing account password
   * @returns the server response
   */
  static async loginUser(username: string, password: string) {
    return this.api.post('/auth/login', {
      username,
      password,
    });
  }

  /**
   * Sends a POST request to the server to logout a user.
   *
   * @returns the server response
   */
  static async logoutUser() {
    try {
      const response = await this.api.post('/auth/logout');
      return response.data; // Assuming your server returns relevant data upon successful logout
    } catch (error) {
      console.error('Logout failed:', error);
      throw error; // Propagate the error for handling in the calling code
    }
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

  static async getExists(username: string) {
    return this.api.get(`/auth/exists?username=${username}`);
  }
}

export default AccountAPI;
