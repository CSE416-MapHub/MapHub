'use client';

import React, {
  useReducer,
  MouseEventHandler,
  useEffect,
  useContext,
} from 'react';
import { Typography } from '@mui/material';

import Button from '../../../../../components/button';
import ValidatedTextField from '../../../components/ValidatedTextField';

import AccountAPI from 'api/AccountAPI';

import styles from '../../../components/form.module.css';
import { useRouter } from 'next/navigation';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { AuthContext, AuthActions } from '../../../../../context/AuthProvider';
import { base64StringToBlob } from 'blob-util';

/**
 * The CreateAccountState is an object filled with states of text field
 * parameters. Each text field parameter holds the following:
 *     * value - the actual text value of the input text field,
 *     * error - a boolean indicating whether the input is valid, and
 *     * errorText - an error message indicating why the value is not valid.
 */
interface CreateAccountFieldState {
  value: string;
  error: boolean;
  errorText: string;
}

export interface CreateAccountState {
  username: CreateAccountFieldState;
  email: CreateAccountFieldState;
  password: CreateAccountFieldState;
  passwordConfirm: CreateAccountFieldState;
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
}
interface CreateAccountAction {
  type: CreateAccountActionType;
  value?: any;
  error?: string | null;
}

/**
 * The createAccountReducer function takes the current state along with an
 * action to perform on the state. It returns a new state with the action
 * performed. The actions include: updating the value of text fields and
 * validating the text field values. Validation checks the current value in the
 * state and modifies the error and errorText states for the text field.
 */
export function createAccountReducer(
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
        username.errorText =
          'Please enter a valid username between 3-16 ' +
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
        password.errorText =
          'Please enter a password with at least eight ' +
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
      if (
        password.value !== passwordConfirm.value ||
        passwordConfirm.value.length === 0
      ) {
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
  }
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

/**
 * The CreateAccountForm renders a frontend form with the following text fields:
 * username, email address, password, and confirm password. The form also
 * includes a button for submission. The state of the form and its verification
 * is handled by the createAccountReducer.
 */
function CreateAccountForm() {
  const router = useRouter();
  const { state: authState, dispatch: authDispatch } = useContext(AuthContext);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = React.useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = React.useState(false);
  // const [showSuccessSnackbar, setShowSuccessSnackbar] = React.useState(false); // Add this state
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

  const handleCreateAccountClick: MouseEventHandler = async () => {
    // createAccountDispatch({
    //   type: CreateAccountActionType.createAccount,
    // });
    try {
      const result = await AccountAPI.registerUser(
        createAccountState.username.value,
        createAccountState.email.value,
        createAccountState.password.value,
        createAccountState.passwordConfirm.value,
      );

      // Handle the result accordingly, dispatch actions, etc.
      if (result.data.success) {
        authDispatch({
          type: AuthActions.REGISTER_SUCCESS,
          payload: {
            user: {
              id: result.data._id,
              username: createAccountState.username.value,
              profilePic: URL.createObjectURL(
                base64StringToBlob(result.data.profilePic),
              ),
            },
          },
        });
        console.log('successfully registered');
        setSuccessSnackbarOpen(true);
        console.log(authState);
      }
    } catch (error: any) {
      console.log('Registration failed:', error);
      authDispatch({
        type: AuthActions.REGISTER_FAILURE,
        payload: {
          error: error.response?.data?.errorMessage || 'Registration failed.',
        },
      });
      console.log(authState);
    }
  };

  const handleSnackbarClose = () => {
    setSuccessSnackbarOpen(false);
    setErrorSnackbarOpen(false);
    authDispatch({
      type: AuthActions.REGISTER_FAILURE,
      payload: {
        error: '',
      },
    });
  };

  useEffect(() => {
    // This effect runs after the component has rendered
    console.log(successSnackbarOpen);
    if (successSnackbarOpen) {
      // If either snackbar is open, initiate the redirect after a delay
      const timer = setTimeout(() => {
        router.replace('/account/sign-in');
      }, 1000); // Adjust the delay as needed

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [successSnackbarOpen, router]);

  useEffect(() => {
    // Check if registration failed and display error snackbar accordingly
    if (authState.error !== '') {
      setErrorSnackbarOpen(true);
    }
    console.log(authState.error);
  }, [authState.error]);

  return (
    <div className={styles.container}>
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={6000} // Adjust as needed
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {authState.error || 'Account creation failed!'}
        </Alert>
      </Snackbar>
      <Typography className={styles.title} variant="h2" align="left">
        Create an account
      </Typography>
      <Typography className={styles.body} variant="body1" align="left">
        Join MapHub to edit maps in any way you can imagine. Get access to
        liking, commenting, and sharing others' maps.
      </Typography>
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
      <ValidatedTextField
        id="password"
        type="password"
        label="Password"
        value={createAccountState.password.value}
        setValue={setPassword}
        error={createAccountState.password.error}
        validate={validatePassword}
        helperText={createAccountState.password.errorText}
      />
      <ValidatedTextField
        id="password-confirm"
        type="password"
        label="Confirm Password"
        value={createAccountState.passwordConfirm.value}
        setValue={setPasswordConfirm}
        error={createAccountState.passwordConfirm.error}
        validate={validatePasswordConfirm}
        helperText={createAccountState.passwordConfirm.errorText}
      />
      <Button variant="filled" onClick={handleCreateAccountClick}>
        Create Account
      </Button>
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000} // Adjust as needed
        onClose={handleSnackbarClose}
      >
        <Alert
          id="success-alert"
          onClose={handleSnackbarClose}
          severity="success"
        >
          Account created successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CreateAccountForm;
