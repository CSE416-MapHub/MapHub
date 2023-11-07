import axios from 'axios';

const SERVER_PORT = 3031

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    return ""
  }
  

  // if hostname is localhost, change the port, else prepend with api
  let baseURL = ""
  if (window.location.hostname === "localhost") {
    baseURL = `http://localhost:${SERVER_PORT}`
  } else {
    baseURL = `https://api.${window.location.hostname}`
  }
  // if pathname has /dev, the url we return also has /dev
  if (window.location.pathname.startsWith("/dev")) {
    baseURL += "/dev"
  }
  console.log("base url is " + baseURL)
  return baseURL
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
    return this.api.post('/auth/register', {
      username,
      email,
      password,
      passwordVerify: passwordConfirm,
    });
  }
}

export default AccountAPI;
