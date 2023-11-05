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
      if (!/^[\w\.]{2,15}[\w]$/.test(state.username.value)) {
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
    </div>
  )
}

export default CreateAccountForm;
