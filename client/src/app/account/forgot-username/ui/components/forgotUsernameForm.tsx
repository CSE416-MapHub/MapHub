'use client'

import { useReducer, MouseEventHandler } from 'react';
import { Button, Typography } from '@mui/material';

import ValidatedTextField from '../../../components/ValidatedTextField';

import AccountAPI from 'api/AccountAPI';

import styles from '../../../components/form.module.css';

interface ForgotUsernameFieldState {
  value: string,
  error: boolean,
  errorText: string,
};
interface ForgotUsernameState {
  email: ForgotUsernameFieldState
};


enum ForgotUsernameActionType {
  updateEmail = 'updateEmail',
  validateEmail = 'validateEmail',
  sendEmail = 'sendEmail',
};
interface ForgotUsernameAction {
  type: ForgotUsernameActionType,
  value?: any,
}


function forgotUsernameReducer(
  state: ForgotUsernameState,
  action: ForgotUsernameAction
): ForgotUsernameState {
  switch (action.type) {
    case ForgotUsernameActionType.updateEmail: {
        return {
            ...state,
            email: {
                ...state.email,
                value: action.value,
            },
        };
    }
    case ForgotUsernameActionType.validateEmail: {
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
      };
    }

    case ForgotUsernameActionType.sendEmail: {
      // Creates a new account by validating all input text fields and sending
      // the registration request to the backend.
      const validatedState = forgotUsernameReducer(state, {
        type: ForgotUsernameActionType.validateEmail,
      });
      const { email } = validatedState;
      if (!email.error) {
        console.log("IN SEND EMAIL")
        //Authentication API
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
 * The forgotUsernameForm renders a frontend form with the following text fields:
 * username, email address, password, and confirm password. The form also 
 * includes a button for submission. The state of the form and its verification
 * is handled by the forgotUsernameReducer.
 */
function ForgotUsernameForm() {
  const [ forgotUsernameState, forgotUsernameDispatch ] = useReducer(
    forgotUsernameReducer,
    {
      email: {
        value: '',
        error: false,
        errorText: '',
      }
    },
  );

  const setEmail = (value: string) => {
    forgotUsernameDispatch({
      type: ForgotUsernameActionType.updateEmail,
      value,
    });
  };

  const validateEmail = () => {
    forgotUsernameDispatch({
      type: ForgotUsernameActionType.validateEmail,
    });
  };

  const handleSendEmailClick : MouseEventHandler = (event) => {
    forgotUsernameDispatch({
      type: ForgotUsernameActionType.sendEmail,
    });
  }

  return (
    <div className={styles.container}>
    <Typography className={styles.title} variant="h2">
        Reset Username
      </Typography>
      <ValidatedTextField
        id="email"
        type="email"
        label="Email Address"
        value={forgotUsernameState.email.value}
        setValue={setEmail}
        error={forgotUsernameState.email.error}
        validate={validateEmail}
        helperText={forgotUsernameState.email.errorText}
      />
      <Button 
        className={styles.confirmButton}
        variant="contained"
        onClick={handleSendEmailClick}
      >
        Send Email
      </Button>
    </div>
  );
}

export default ForgotUsernameForm;
