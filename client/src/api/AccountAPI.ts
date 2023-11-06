import axios from 'axios';

function getBaseUrl(): string {
  // TODO: Implement the function that returns the base URL for the account API.
  return '';
}
axios.defaults.withCredentials = true;

/**
 * The AccountAPI class is responsible for communicating with the server with
 * matters concerning accounts and users on MapHub.
 */
class AccountAPI {
  static api = axios.create({
    baseURL: getBaseUrl(),
  });

  static async registerUser(username: string, email: string, password: string, passwordConfirm: string) {
    return this.api.post('/register', {
      username,
      email,
      password,
      passwordVerify: passwordConfirm,
    });
  }
}

export default AccountAPI;
