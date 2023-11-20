'use client';

import React, { useReducer, MouseEventHandler } from 'react';
import { Container, Link, Typography } from '@mui/material';

import Button from '../../../../../components/button';
import ValidatedTextField from '../../../components/ValidatedTextField';

import styles from '../../../components/form.module.css';

interface LoginFieldState {
  value: string;
  error: boolean;
  errorText: string;
}

interface LoginState {
  username: LoginFieldState;
  password: LoginFieldState;
}

enum LoginActionType {
  updateUsername = 'updateUsername',
  validateUsername = 'validateUsername',
  updatePassword = 'updatePassword',
  validatePassword = 'validatePassword',
  login = 'login',
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
      if (!username.error && !password.error) {
        // Call your authentication API here
      }
      // TODO: Handle login success or failure
      return validatedState;
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
  });

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
    loginDispatch({
      type: LoginActionType.login,
    });
  };

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
    </div>
  );
}

export default LoginForm;
