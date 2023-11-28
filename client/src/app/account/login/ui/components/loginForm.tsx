'use client';

import React, {
  useReducer,
  MouseEventHandler,
  useEffect,
  useContext,
} from 'react';
import {
  Alert,
  AlertProps,
  Container,
  Link,
  Snackbar,
  Typography,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import Button from '../../../../../components/button';
import ValidatedTextField from '../../../components/ValidatedTextField';

import styles from '../../../components/form.module.css';
import AccountAPI from '../../../../../api/AccountAPI';
import { useRouter } from 'next/navigation';
import { AuthContext, AuthActions } from '../../../../../context/AuthProvider';
import { base64StringToBlob } from 'blob-util';

interface LoginFieldState {
  value: string;
  error: boolean;
  errorText: string;
}

interface LoginState {
  username: LoginFieldState;
  password: LoginFieldState;
  alertOpen: boolean;
}

enum LoginActionType {
  updateUsername = 'updateUsername',
  validateUsername = 'validateUsername',
  updatePassword = 'updatePassword',
  validatePassword = 'validatePassword',
  login = 'login',
  showAlert = 'showAlert',
  hideAlert = 'hideAlert',
}

interface LoginAction {
  type: LoginActionType;
  value?: any;
}

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case LoginActionType.updateUsername: {
      return {
        ...state,
        username: {
          ...state.username,
          value: action.value,
        },
      };
    }
    case LoginActionType.validateUsername: {
      const { username } = state;
      if (!username.value) {
        username.error = true;
        username.errorText = 'Please enter your username.';
      } else {
        username.error = false;
        username.errorText = '';
      }
      return {
        ...state,
        username,
      };
    }
    case LoginActionType.updatePassword: {
      return {
        ...state,
        password: {
          ...state.password,
          value: action.value,
        },
      };
    }
    case LoginActionType.validatePassword: {
      const { password } = state;
      if (!password.value) {
        password.error = true;
        password.errorText = 'Please enter your password.';
      } else {
        password.error = false;
        password.errorText = '';
      }
      return {
        ...state,
        password,
      };
    }
    case LoginActionType.login: {
      const validatedState = loginReducer(state, {
        type: LoginActionType.validateUsername,
      });
      const { username, password } = validatedState;
      console.log(validatedState);
      if (!username.error && !password.error) {
        // Call your authentication API here
        AccountAPI.loginUser(
          validatedState.username.value,
          validatedState.password.value,
        )
          .then(response => {
            console.log('Login successful:', response);
            //Redirect to user dashboard
          })
          .catch(error => {
            console.log('Login failed:', error.response.data.errorMessage);
          });
      }
      return validatedState;
    }

    case LoginActionType.showAlert: {
      return {
        ...state,
        alertOpen: true,
      };
    }

    case LoginActionType.hideAlert: {
      return {
        ...state,
        alertOpen: false,
      };
    }
    default: {
      return state;
    }
  }
}

function LoginForm() {
  const [loginState, loginDispatch] = useReducer(loginReducer, {
    username: {
      value: '',
      error: false,
      errorText: '',
    },
    password: {
      value: '',
      error: false,
      errorText: '',
    },
    alertOpen: false,
  });
  const router = useRouter();
  const { dispatch: authDispatch } = useContext(AuthContext); // Access the auth context

  const setUsername = (value: string) => {
    loginDispatch({
      type: LoginActionType.updateUsername,
      value,
    });
  };

  const validateUsername = () => {
    loginDispatch({
      type: LoginActionType.validateUsername,
    });
  };

  const setPassword = (value: string) => {
    loginDispatch({
      type: LoginActionType.updatePassword,
      value,
    });
  };

  const validatePassword = () => {
    loginDispatch({
      type: LoginActionType.validatePassword,
    });
  };

  const handleLoginClick: MouseEventHandler = () => {
    const { username, password } = loginState;

    if (!username.error && !password.error) {
      // Call your authentication API here
      AccountAPI.loginUser(username.value, password.value)
        .then(response => {
          console.log('Login successful:', response);
          // authContext.helpers.login(authContext, {
          //   id: response.data.user.id,
          //   username: response.data.user.username,
          // });
          authDispatch({
            type: AuthActions.LOGIN,
            payload: {
              user: {
                id: response.data.user.id,
                username: response.data.user.username,
                profilePic: URL.createObjectURL(
                  base64StringToBlob(response.data.user.profilePic),
                ),
              },
            },
          });
          //Redirect to dashboard
          router.replace('/account/dashboard');
        })
        .catch(error => {
          console.log('Login failed:', error.response?.data?.errorMessage);
          // Update the state to show the alert
          loginDispatch({
            type: LoginActionType.showAlert,
          });
        });
    }
  };

  const handleAlertClose = () => {
    loginDispatch({
      type: LoginActionType.hideAlert,
    });
  };

  useEffect(() => {
    // Show the alert when alertOpen becomes true
    if (!loginState.alertOpen) {
      handleAlertClose();
    }
  }, [loginState.alertOpen]);

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    function Alert(props, ref) {
      return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    },
  );

  return (
    <div className={styles.container}>
      <Typography className={styles.title} variant="h2">
        Login
      </Typography>
      <ValidatedTextField
        id="username"
        type="text"
        label="Username"
        value={loginState.username.value}
        setValue={setUsername}
        error={loginState.username.error}
        validate={validateUsername}
        helperText={loginState.username.errorText}
      />
      <ValidatedTextField
        id="password"
        type="password"
        label="Password"
        value={loginState.password.value}
        setValue={setPassword}
        error={loginState.password.error}
        validate={validatePassword}
        helperText={loginState.password.errorText}
      />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Link variant="body1" href="/account/forgot-account?query=username">
          Forgot Username
        </Link>
        <Link variant="body1" href="/account/forgot-account?query=password">
          Forgot Password
        </Link>
      </Container>
      <Button variant="filled" onClick={handleLoginClick}>
        Login
      </Button>

      <Snackbar
        open={loginState.alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert severity="error" onClose={handleAlertClose}>
          Incorrect username or password!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default LoginForm;
