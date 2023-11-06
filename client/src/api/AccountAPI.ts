import axios from 'axios';

function getBaseUrl(): string {
  // TODO: Implement the function that returns the base URL for the account API.
  return '';
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
    passwordConfirm: string
  ) {
    return this.api.post('/register', {
      username,
      email,
      password,
      passwordVerify: passwordConfirm,
    });
  }
}

export default AccountAPI;
