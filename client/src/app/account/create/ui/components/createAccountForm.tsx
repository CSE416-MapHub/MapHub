'use client';

import { useReducer, MouseEventHandler } from 'react';
import { Typography } from '@mui/material';

import Button from '../../../../../components/button';
import ValidatedTextField from '../../../components/ValidatedTextField';

import AccountAPI from 'api/AccountAPI';

import styles from '../../../components/form.module.css';

/**
 * The CreateAccountState is an object filled with states of text field
 * parameters. Each text field parameter holds the following:
 *     * value - the actual text value of the input text field,
 *     * error - a boolean indicating whether or not the input is valid, and
 *     * errorText - an error message indicating why the value is not valid.
 */
interface CreateAccountFieldState {
  value: string,
  error: boolean,
  errorText: string,
}

interface CreateAccountState {
  username: CreateAccountFieldState,
  email: CreateAccountFieldState,
  password: CreateAccountFieldState,
  passwordConfirm: CreateAccountFieldState,
}

/**
 * CreateAccountActionType represents the type of action the reducer must
 * perform. CreateAccountAction represents the type of action and the values
 * that needs to be passed to the reducer to perform the action.
 */
enum CreateAccountActionType {
  updateUsername = 'updateUsername',
  validateUsername = 'validateUsername',
  updateEmail = 'updateEmail',
  validateEmail = 'validateEmail',
  updatePassword = 'updatePassword',
  validatePassword = 'validatePassword',
  updatePasswordConfirm = 'updatePasswordConfirm',
  validatePasswordConfirm = 'validatePasswordConfirm',
  validate = 'validate',
  createAccount = 'createAccount',
}

interface CreateAccountAction {
  type: CreateAccountActionType,
  value?: any,
}

/**
 * The createAccountReducer function takes the current state along with an
 * action to perform on the state. It returns a new state with the action
 * performed. The actions include: updating the value of text fields and
 * validating the text field values. Validation checks the current value in the
 * state and modifies the error and errorText states for the text field.
 */
function createAccountReducer(
  state: CreateAccountState,
  action: CreateAccountAction,
): CreateAccountState {
  switch (action.type) {
    case CreateAccountActionType.updateUsername: {
      return {
        ...state,
        username: {
          ...state.username,
          value: action.value,
        },
      };
    }
    case CreateAccountActionType.validateUsername: {
      // Checks if the username is well-formed. A well-formed username must
      // include alphanumeric characters, underscores, or dots such that the 
      // last character is not a dot. The username must also be between 3 to 16
      // characters.
      // TODO: Implement unique username checking.
      const { username } = state;
      if (!/^[\w.]{2,15}[\w]$/.test(username.value)) {
        username.error = true;
        username.errorText = 'Please enter a valid username between 3-16 ' +
          'alphanumeric, underscore, or dot characters.';
      } else {
        username.error = false;
        username.errorText = '';
      }
      return {
        ...state,
        username,
      };
    }
    case CreateAccountActionType.updateEmail: {
      return {
        ...state,
        email: {
          ...state.email,
          value: action.value,
        },
      };
    }
    case CreateAccountActionType.validateEmail: {
      // Checks if the email address is well-formed. An email address is
      // well-formed if it starts with a set of alphanumeric characters,
      // underscores, and dots, followed by an @ symbol, followed by a domain
      // name (set of alphanumeric characters, underscores, and dots such that
      // it ends with a dot), and followed by a top-level domain name (a set of
      // alphanumeric characters and underscores of length 2-4). 
      const { email } = state;
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
        email.error = true;
        email.errorText = 'Please enter a valid email address.';
      } else {
        email.error = false;
        email.errorText = '';
      }
      return {
        ...state,
        email,
      };
    }
    case CreateAccountActionType.updatePassword: {
      return {
        ...state,
        password: {
          ...state.password,
          value: action.value,
        },
      };
    }
    case CreateAccountActionType.validatePassword: {
      // Checks if the password is well-formed. A password is well-formed if it
      // is a set of characters such that it is longer than 8 characters and 
      // contains one uppercase letter, one lowercase letter, and one digit.
      const { password } = state;
      if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/.test(password.value)) {
        password.error = true;
        password.errorText = 'Please enter a password with at least eight ' +
          'characters with one uppercase, one lowercase, and one digit';
      } else {
        password.error = false;
        password.errorText = '';
      }
      return {
        ...state,
        password,
      };
    }
    case CreateAccountActionType.updatePasswordConfirm: {
      return {
        ...state,
        passwordConfirm: {
          ...state.passwordConfirm,
          value: action.value,
        },
      };
    }
    case CreateAccountActionType.validatePasswordConfirm: {
      // Checks if the password confirmation is well-formed and matches the 
      // first password input value. Only checks whether the passwords
      // match, which means that the password is also well-formed.
      const { password, passwordConfirm } = state;
      if (password.value !== passwordConfirm.value || passwordConfirm.value.length === 0) {
        passwordConfirm.error = true;
        passwordConfirm.errorText = 'Please reconfirm the password.';
      } else {
        passwordConfirm.error = false;
        passwordConfirm.errorText = '';
      }
      return {
        ...state,
        passwordConfirm,
      };
    }
    case CreateAccountActionType.validate: {
      let newState = createAccountReducer(state, {
        type: CreateAccountActionType.validateUsername,
      });
      newState = createAccountReducer(newState, {
        type: CreateAccountActionType.validateEmail,
      });
      newState = createAccountReducer(newState, {
        type: CreateAccountActionType.validatePassword,
      });
      newState = createAccountReducer(newState, {
        type: CreateAccountActionType.validatePasswordConfirm,
      });
      return newState;
    }
    case CreateAccountActionType.createAccount: {
      // Creates a new account by validating all input text fields and sending
      // the registration request to the backend.
      const validatedState = createAccountReducer(state, {
        type: CreateAccountActionType.validate,
      });
      console.log('IN CREATE ACCOUNT');
      if (!validatedState.username.error &&
        !validatedState.email.error &&
        !validatedState.password.error &&
        !validatedState.password.error) {
        AccountAPI.registerUser(
          validatedState.username.value,
          validatedState.email.value,
          validatedState.password.value,
          validatedState.passwordConfirm.value,
        );
      }
      // TODO: Navigate to another page upon successfully creating an account
      // or modify the form state.
      return validatedState;
    }
    default: {
      return state;
    }
  }
}

/**
 * The CreateAccountForm renders a frontend form with the following text fields:
 * username, email address, password, and confirm password. The form also
 * includes a button for submission. The state of the form and its verification
 * is handled by the createAccountReducer.
 */
function CreateAccountForm() {
  const [createAccountState, createAccountDispatch] = useReducer(
    createAccountReducer,
    {
      username: {
        value: '',
        error: false,
        errorText: '',
      },
      email: {
        value: '',
        error: false,
        errorText: '',
      },
      password: {
        value: '',
        error: false,
        errorText: '',
      },
      passwordConfirm: {
        value: '',
        error: false,
        errorText: '',
      },
    },
  );

  const setUsername = (value: string) => {
    createAccountDispatch({
      type: CreateAccountActionType.updateUsername,
      value,
    });
  };

  const validateUsername = () => {
    createAccountDispatch({
      type: CreateAccountActionType.validateUsername,
    });
  };

  const setEmail = (value: string) => {
    createAccountDispatch({
      type: CreateAccountActionType.updateEmail,
      value,
    });
  };

  const validateEmail = () => {
    createAccountDispatch({
      type: CreateAccountActionType.validateEmail,
    });
  };

  const setPassword = (value: string) => {
    createAccountDispatch({
      type: CreateAccountActionType.updatePassword,
      value,
    });
  };

  const validatePassword = () => {
    createAccountDispatch({
      type: CreateAccountActionType.validatePassword,
    });
  };

  const setPasswordConfirm = (value: string) => {
    createAccountDispatch({
      type: CreateAccountActionType.updatePasswordConfirm,
      value,
    });
  };

  const validatePasswordConfirm = () => {
    createAccountDispatch({
      type: CreateAccountActionType.validatePasswordConfirm,
    });
  };

  const handleCreateAccountClick: MouseEventHandler = () => {
    createAccountDispatch({
      type: CreateAccountActionType.createAccount,
    });
  };

  return (
    <div className={styles.container}>
      <Typography className={styles.title} variant='h2' align='left'>
        Create an account
      </Typography>
      <Typography className={styles.body} variant='body1' align='left'>
        Join MapHub to edit maps in any way you can imagine. Get access to
        liking, commenting, and sharing others' maps.
      </Typography>
      <ValidatedTextField
        id='username'
        type='text'
        label='Username'
        value={createAccountState.username.value}
        setValue={setUsername}
        maxLength={16}
        error={createAccountState.username.error}
        validate={validateUsername}
        helperText={createAccountState.username.errorText}
      />
      <ValidatedTextField
        id='email'
        type='email'
        label='Email Address'
        value={createAccountState.email.value}
        setValue={setEmail}
        error={createAccountState.email.error}
        validate={validateEmail}
        helperText={createAccountState.email.errorText}
      />
      <ValidatedTextField
        id='password'
        type='password'
        label='Password'
        value={createAccountState.password.value}
        setValue={setPassword}
        error={createAccountState.password.error}
        validate={validatePassword}
        helperText={createAccountState.password.errorText}
      />
      <ValidatedTextField
        id='password-confirm'
        type='password'
        label='Confirm Password'
        value={createAccountState.passwordConfirm.value}
        setValue={setPasswordConfirm}
        error={createAccountState.passwordConfirm.error}
        validate={validatePasswordConfirm}
        helperText={createAccountState.passwordConfirm.errorText}
      />
      <Button
        variant='filled'
        onClick={handleCreateAccountClick}
      >
        Create Account
      </Button>
    </div>
  );
}

export default CreateAccountForm;
