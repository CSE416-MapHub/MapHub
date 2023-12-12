'use client';

import { useReducer, MouseEventHandler } from 'react';
import { Typography } from '@mui/material';
import Link from 'next/link';
import AccountAPI from 'api/AccountAPI';
import Button from '../../../../../components/button';
import ValidatedTextField from '../../../components/ValidatedTextField';
import { useRouter } from 'next/navigation';
import styles from '../../../components/form.module.css';
import { useSearchParams } from 'next/navigation';

interface ForgotAccountFieldState {
  value: string;
  error: boolean;
  errorText: string;
}

interface ForgotAccountState {
  email: ForgotAccountFieldState;
}

enum ForgotAccountActionType {
  updateEmail = 'updateEmail',
  validateEmail = 'validateEmail',
  sendEmail = 'sendEmail',
}

interface ForgotAccountAction {
  type: ForgotAccountActionType;
  value?: any;
}

function forgotAccountReducer(
  state: ForgotAccountState,
  action: ForgotAccountAction,
): ForgotAccountState {
  switch (action.type) {
    case ForgotAccountActionType.updateEmail: {
      return {
        ...state,
        email: {
          ...state.email,
          value: action.value,
        },
      };
    }
    case ForgotAccountActionType.validateEmail: {
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

    case ForgotAccountActionType.sendEmail:
      async () => {
        // Creates a new account by validating all input text fields and sending
        // the registration request to the backend.
        const validatedState = forgotAccountReducer(state, {
          type: ForgotAccountActionType.validateEmail,
        });
        const { email } = validatedState;
        //Valid email
        if (!email.error) {
        }
        console.log('THERE IS EMAIL ERROR');
        // TODO: Navigate to another page upon successfully creating an account
        // or modify the form state.
        return validatedState;
      };
    default: {
      return state;
    }
  }
}

/**
 * The forgotAccountForm renders a frontend form with the following text fields:
 * Account, email address, password, and confirm password. The form also
 * includes a button for submission. The state of the form and its verification
 * is handled by the forgotAccountReducer.
 */
function ForgotAccountForm() {
  // const pathName = usePathname();
  // console.log(pathName);
  const router = useRouter();

  const searchParams = useSearchParams();
  console.log(searchParams.get('query'));

  var usernameOrPassword = searchParams.get('query');
  const [forgotAccountState, forgotAccountDispatch] = useReducer(
    forgotAccountReducer,
    {
      email: {
        value: '',
        error: false,
        errorText: '',
      },
    },
  );

  const setEmail = (value: string) => {
    forgotAccountDispatch({
      type: ForgotAccountActionType.updateEmail,
      value,
    });
  };

  const validateEmail = () => {
    forgotAccountDispatch({
      type: ForgotAccountActionType.validateEmail,
    });
  };

  const handleSendEmailClick: MouseEventHandler = async () => {
    console.log('IN SEND EMAIL');
    const passwordResetLink = await AccountAPI.getPasswordResetLink(
      forgotAccountState.email.value,
    );

    // forgotAccountDispatch({
    //   type: ForgotAccountActionType.sendEmail,
    // });
  };

  return (
    <div className={styles.container}>
      <Typography className={styles.title} variant="h2">
        Reset {usernameOrPassword}
      </Typography>
      <ValidatedTextField
        id="email"
        type="email"
        label="Email Address"
        value={forgotAccountState.email.value}
        setValue={setEmail}
        error={forgotAccountState.email.error}
        validate={validateEmail}
        helperText={forgotAccountState.email.errorText}
      />
      <Link
        href="/account/forgot-account/success?query=[usernameOrPassword]"
        as={`/account/forgot-account/success?query=${usernameOrPassword}`}
      >
        <Button variant="filled" onClick={handleSendEmailClick}>
          Send Email
        </Button>
      </Link>
    </div>
  );
}

export default ForgotAccountForm;
