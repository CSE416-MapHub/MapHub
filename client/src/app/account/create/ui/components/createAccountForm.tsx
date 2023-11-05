'use client'

import { useReducer } from 'react';

import ValidatedTextField from './ValidatedTextField';

import styles from './createAccountForm.module.css';

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
};
interface CreateAccountState {
  username: CreateAccountFieldState,
  email: CreateAccountFieldState,
  password: CreateAccountFieldState,
  passwordConfirm: CreateAccountFieldState,
};

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
};
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
  action: CreateAccountAction
): CreateAccountState {
  switch (action.type) {
    case CreateAccountActionType.updateUsername:
      return {
        ...state,
        username: {
          ...state.username,
          value: action.value,
        },
      };
    case CreateAccountActionType.validateUsername:
      // Checks if the username is well-formed. A well-formed username must
      // include alphanumeric characters, underscores, or dots such that the 
      // last character is not a dot. The username must also be between 3 to 16
      // characters.
      // TODO: Implement unique username checking.
      const { username } = state;
      if (!/^[\w\.]{2,15}[\w]$/.test(username.value)) {
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
    case CreateAccountActionType.updateEmail:
      return {
        ...state,
        email: {
          ...state.email,
          value: action.value,
        },
      };
    case CreateAccountActionType.validateEmail:
      // Checks if the email address is well-formed. An email address is
      // well-formed if it starts with a set of alphanumeric characters,
      // underscores, and dots, followed by an @ symbol, followed by a domain
      // name (set of alphanumeric characters, underscores, and dots such that
      // it ends with a dot), and followed by a top-level domain name (a set of
      // alphanumeric characters and underscores of length 2-4). 
      const { email } = state;
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
        email.error = true;
        email.errorText = 'Please enter a valid email address.'
      } else {
        email.error = false;
        email.errorText = '';
      }
      return {
        ...state,
        email,
      }
    default:
      return state;
  }
}


function CreateAccountForm() {
  const [ createAccountState, createAccountDispatch ] = useReducer(
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

  return (
    <div className={styles.container}>
      <ValidatedTextField
        id="username"
        type="text"
        label="Username"
        value={createAccountState.username.value}
        setValue={setUsername}
        maxLength={16}
        error={createAccountState.username.error}
        validate={validateUsername}
        helperText={createAccountState.username.errorText}
      />
      <ValidatedTextField
        id="email"
        type="email"
        label="Email Address"
        value={createAccountState.email.value}
        setValue={setEmail}
        error={createAccountState.email.error}
        validate={validateEmail}
        helperText={createAccountState.email.errorText}
      />
    </div>
  );
}

export default CreateAccountForm;
