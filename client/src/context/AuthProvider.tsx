import React, { Dispatch, createContext, useReducer } from 'react';

import AccountAPI from '../api/AccountAPI';

export interface IAuthState {
  isLoggedIn: boolean;
  user: {
    id: string;
    username: string;
  } | null;
}

const initialState: IAuthState = {
  isLoggedIn: false,
  user: null,
};

export enum AuthActions {
  LOGIN,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
}

type AuthAction =
  | {
      type: AuthActions.LOGIN;
      payload: { user: { id: string; username: string } };
    }
  | { type: AuthActions.LOGOUT }
  | {
      type: AuthActions.REGISTER_SUCCESS;
      payload: { user: { id: string; username: string } };
    }
  | { type: AuthActions.REGISTER_FAILURE; payload: { error: string } };

// Define the reducer
function authReducer(prev: IAuthState, action: AuthAction): IAuthState {
  switch (action.type) {
    case AuthActions.LOGIN:
      console.log('MAKING NEW STATE');
      return {
        ...prev,
        isLoggedIn: true,
        user: action.payload.user,
      };
    case AuthActions.LOGOUT:
      return {
        ...prev,
        isLoggedIn: false,
        user: null,
      };
    case AuthActions.REGISTER_SUCCESS:
      return {
        ...prev,
        isLoggedIn: true,
        user: action.payload.user,
      };
    case AuthActions.REGISTER_FAILURE:
      return {
        ...prev,
        isLoggedIn: false,
        user: null,
      };
    default:
      return prev;
  }
}

// Define helpers for authentication
class AuthHelpers {
  public login(ctx: IAuthContext, user: { id: string; username: string }) {
    // Perform login logic, e.g., send a request to your server
    ctx.dispatch({
      type: AuthActions.LOGIN,
      payload: { user },
    });
  }

  public logout(ctx: IAuthContext) {
    ctx.dispatch({
      type: AuthActions.LOGOUT,
    });
  }

  public async register(
    ctx: IAuthContext,
    user: {
      username: string;
      email: string;
      password: string;
      passwordConfirm: string;
    },
  ) {
    // Perform registration logic, e.g., send a request to your server
    try {
      const result = await AccountAPI.registerUser(
        user.username,
        user.email,
        user.password,
        user.passwordConfirm,
      );

      if (result.data.success) {
        ctx.dispatch({
          type: AuthActions.REGISTER_SUCCESS,
          payload: {
            user: {
              id: result.data._id,
              username: user.username,
            },
          },
        });
      } else {
        ctx.dispatch({
          type: AuthActions.REGISTER_FAILURE,
          payload: {
            error: result.data.errorMessage,
          },
        });
      }
    } catch (error: any) {
      ctx.dispatch({
        type: AuthActions.REGISTER_FAILURE,
        payload: {
          error: error.response.data.errorMessage || 'Registration failed.',
        },
      });
    }
  }
}

// Define the authentication context
export interface IAuthContext {
  state: IAuthState;
  dispatch: Dispatch<AuthAction>;
  helpers: AuthHelpers;
}

export const AuthContext = createContext<IAuthContext>({
  state: initialState,
  dispatch: () => null,
  helpers: new AuthHelpers(),
});

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider
      value={{ state, dispatch, helpers: new AuthHelpers() }}
    >
      {children}
    </AuthContext.Provider>
  );
};
