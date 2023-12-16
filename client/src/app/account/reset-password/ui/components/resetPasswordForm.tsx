'use client';

import React, { MouseEventHandler, useReducer, useContext } from 'react';
import { Link, Typography } from '@mui/material';
import AccountAPI from 'api/AccountAPI';
import Button from '../../../../../components/button';
import ValidatedTextField from '../../../components/ValidatedTextField';
import { useRouter } from 'next/navigation';
import styles from '../../../components/form.module.css';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';

interface ResetPasswordFieldState {
  value: string;
  error: boolean;
  errorText: string;
}

interface ResetPasswordState {
  password: ResetPasswordFieldState;
  passwordConfirm: ResetPasswordFieldState;
}

enum ResetPasswordActionType {
  updatePassword = 'updatePassword',
  validatePassword = 'validatePassword',
  updatePasswordConfirm = 'updatePasswordConfirm',
  validatePasswordConfirm = 'validatePasswordConfirm',
  resetPassword = 'resetPassword',
}

interface ResetPasswordAction {
  type: ResetPasswordActionType;
  value?: any;
}

function ResetPasswordReducer(
  state: ResetPasswordState,
  action: ResetPasswordAction,
): ResetPasswordState {
  switch (action.type) {
    case ResetPasswordActionType.updatePassword: {
      return {
        ...state,
        password: {
          ...state.password,
          value: action.value,
        },
      };
    }
    case ResetPasswordActionType.validatePassword: {
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

    case ResetPasswordActionType.updatePasswordConfirm: {
      return {
        ...state,
        passwordConfirm: {
          ...state.passwordConfirm,
          value: action.value,
        },
      };
    }
    case ResetPasswordActionType.validatePasswordConfirm: {
      const { password, passwordConfirm } = state;
      if (!passwordConfirm.value) {
        passwordConfirm.error = true;
        passwordConfirm.errorText = 'Please confirm your password.';
      } else if (password.value !== passwordConfirm.value) {
        passwordConfirm.error = true;
        passwordConfirm.errorText = 'Passwords do not match.';
      } else {
        passwordConfirm.error = false;
        passwordConfirm.errorText = '';
      }
      return {
        ...state,
        passwordConfirm,
      };
    }

    default: {
      return state;
    }
  }
}

type ResetPasswordFormProps = {
  token: string;
};

function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const notifications = useContext(NotificationsContext);

  const [ResetPasswordState, ResetPasswordDispatch] = useReducer(
    ResetPasswordReducer,
    {
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

  const handlePasswordReset = async () => {
    try {
      console.log(
        'sending toke:',
        token,
        'with passwrod',
        ResetPasswordState.passwordConfirm.value,
      );
      // Assuming resetUserPassword is imported or defined above
      const response = await AccountAPI.resetUserPassword(
        token,
        ResetPasswordState.passwordConfirm.value,
      );
      if (response.data.success) {
        router.push('/account/reset-password/success');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      // Handle errors (e.g., display a message to the user)
      notifications.dispatch({
        type: NotificationsActionType.enqueue,
        value: {
          message: error,
          actions: {
            close: true,
          },
        },
      });
    }
  };

  const setPassword = (value: string) => {
    ResetPasswordDispatch({
      type: ResetPasswordActionType.updatePassword,
      value,
    });
  };

  const validatePassword = () => {
    ResetPasswordDispatch({
      type: ResetPasswordActionType.validatePassword,
    });
  };

  const setPasswordConfirm = (value: string) => {
    ResetPasswordDispatch({
      type: ResetPasswordActionType.updatePasswordConfirm,
      value,
    });
  };

  const validatePasswordConfirm = () => {
    ResetPasswordDispatch({
      type: ResetPasswordActionType.validatePasswordConfirm,
    });
  };

  return (
    <div className={styles.container}>
      <Typography className={styles.title} variant="h2">
        Reset Password
      </Typography>
      <ValidatedTextField
        id="password"
        type="password"
        label="Password"
        value={ResetPasswordState.password.value}
        setValue={setPassword}
        error={ResetPasswordState.password.error}
        validate={validatePassword}
        helperText={ResetPasswordState.password.errorText}
      />
      <ValidatedTextField
        id="passwordConfirm"
        type="password"
        label="Confirm Password"
        value={ResetPasswordState.passwordConfirm.value}
        setValue={setPasswordConfirm}
        error={ResetPasswordState.passwordConfirm.error}
        validate={validatePasswordConfirm}
        helperText={ResetPasswordState.passwordConfirm.errorText}
      />

      {/* <Link href="/account/reset-password/success"> */}

      <Button variant="filled" onClick={handlePasswordReset}>
        Reset Password
      </Button>
      {/* </Link> */}
    </div>
  );
}

export default ResetPasswordForm;
