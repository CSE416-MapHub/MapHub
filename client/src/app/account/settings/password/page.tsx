'use client';

import { isAxiosError } from 'axios';
import { useContext, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';

import AccountAPI from 'api/AccountAPI';
import { AuthActions, AuthContext } from 'context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';
import SettingsMain from '../components/settingsMain';
import SettingsHead from '../components/settingsHead';
import SettingsPane from '../components/settingsPane';
import SettingsSection from '../components/settingsSection';
import SettingsTextField from '../components/settingsTextField';
import SettingsButton from '../components/settingsButton';

import styles from './styles/editPassword.module.scss';

interface EditPasswordInput {
  value: string;
  error: boolean;
  helperText: string;
}
interface EditPasswordState {
  currentPassword: EditPasswordInput;
  newPassword: EditPasswordInput;
  newPasswordConfirm: EditPasswordInput;
}

enum EditPasswordActionType {
  updateCurrentPassword = 'updateCurrentPassword',
  validateCurrentPassword = 'validateCurrentPassword',
  invalidateCurrentPassword = 'invalidateCurrentPassword',
  updateNewPassword = 'updateNewPassword',
  validateNewPassword = 'validateNewPassword',
  updateNewPasswordConfirm = 'updateNewPasswordConfirm',
  validateNewPasswordConfirm = 'validateNewPasswordConfirm',
  validateAll = 'validateAll',
}

interface EditPasswordAction {
  type: EditPasswordActionType;
  value?: any;
}

function EditPassword() {
  const editPasswordReducer = (
    state: EditPasswordState,
    action: EditPasswordAction,
  ): EditPasswordState => {
    switch (action.type) {
      case EditPasswordActionType.updateCurrentPassword:
        return {
          ...state,
          currentPassword: {
            ...state.currentPassword,
            value: action.value,
          },
        };
      case EditPasswordActionType.validateCurrentPassword: {
        const { currentPassword } = state;
        if (currentPassword.value.length === 0) {
          currentPassword.error = true;
          currentPassword.helperText =
            'Current password is required. Please enter your current password.';
        } else {
          currentPassword.error = false;
          currentPassword.helperText = '';
        }
        return {
          ...state,
          currentPassword,
        };
      }
      case EditPasswordActionType.invalidateCurrentPassword:
        return {
          ...state,
          currentPassword: {
            ...state.currentPassword,
            error: true,
            helperText:
              'Incorrect password. Please enter your current password again.',
          },
        };
      case EditPasswordActionType.updateNewPassword:
        return {
          ...state,
          newPassword: {
            ...state.newPassword,
            value: action.value,
          },
        };
      case EditPasswordActionType.validateNewPassword: {
        const { newPassword } = state;
        if (
          !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/.test(newPassword.value)
        ) {
          newPassword.error = true;
          newPassword.helperText =
            'Please enter a new password with at least eight characters with at least one uppercase, one lowercase, and one digit.';
        } else {
          newPassword.error = false;
          newPassword.helperText = '';
        }
        return {
          ...state,
          newPassword,
        };
      }
      case EditPasswordActionType.updateNewPasswordConfirm:
        return {
          ...state,
          newPasswordConfirm: {
            ...state.newPasswordConfirm,
            value: action.value,
          },
        };
      case EditPasswordActionType.validateNewPasswordConfirm: {
        const { newPassword, newPasswordConfirm } = state;
        if (newPassword.value !== newPasswordConfirm.value) {
          newPasswordConfirm.error = true;
          newPasswordConfirm.helperText =
            "Passwords don't match. Please reconfirm your new password.";
        } else {
          newPasswordConfirm.error = false;
          newPasswordConfirm.helperText = '';
        }
        return {
          ...state,
          newPasswordConfirm,
        };
      }
      case EditPasswordActionType.validateAll: {
        let newState = editPasswordReducer(state, {
          type: EditPasswordActionType.validateCurrentPassword,
        });
        newState = editPasswordReducer(newState, {
          type: EditPasswordActionType.validateNewPassword,
        });

        return editPasswordReducer(newState, {
          type: EditPasswordActionType.validateNewPasswordConfirm,
        });
      }
      default:
        return state;
    }
  };
  const editPasswordInitial: EditPasswordState = {
    currentPassword: {
      value: '',
      error: false,
      helperText: '',
    },
    newPassword: {
      value: '',
      error: false,
      helperText: '',
    },
    newPasswordConfirm: {
      value: '',
      error: false,
      helperText: '',
    },
  };

  const auth = useContext(AuthContext);
  const notifications = useContext(NotificationsContext);
  const router = useRouter();
  const [editPasswordState, editPasswordDispatch] = useReducer(
    editPasswordReducer,
    editPasswordInitial,
  );

  useEffect(() => {
    if (auth.state.isLoggedIn === false) {
      router.replace('/account/sign-in');
    }
  }, [auth.state.isLoggedIn]);

  const setCurrentPassword = (value: string) => {
    editPasswordDispatch({
      type: EditPasswordActionType.updateCurrentPassword,
      value,
    });
  };

  const validateCurrentPassword = () => {
    editPasswordDispatch({
      type: EditPasswordActionType.validateCurrentPassword,
    });
  };

  const setNewPassword = (value: string) => {
    editPasswordDispatch({
      type: EditPasswordActionType.updateNewPassword,
      value,
    });
  };

  const validateNewPassword = () => {
    editPasswordDispatch({
      type: EditPasswordActionType.validateNewPassword,
    });
  };

  const setNewPasswordConfirm = (value: string) => {
    editPasswordDispatch({
      type: EditPasswordActionType.updateNewPasswordConfirm,
      value,
    });
  };

  const validateNewPasswordConfirm = () => {
    editPasswordDispatch({
      type: EditPasswordActionType.validateNewPasswordConfirm,
    });
  };

  const handleSubmit = async () => {
    editPasswordDispatch({
      type: EditPasswordActionType.validateAll,
    });

    if (
      !editPasswordState.currentPassword.error &&
      !editPasswordState.newPassword.error &&
      !editPasswordState.newPasswordConfirm.error
    ) {
      try {
        const response = await AccountAPI.putPassword(
          editPasswordState.currentPassword.value,
          editPasswordState.newPassword.value,
          editPasswordState.newPasswordConfirm.value,
        );
        auth.dispatch({
          type: AuthActions.UPDATE_USER,
          payload: {
            user: response.data.user,
          },
        });
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: 'Password successfully changed.',
            actions: {
              close: true,
            },
            autoHideDuration: 5000,
          },
        });
        router.push('/account/settings');
      } catch (error) {
        if (isAxiosError(error) && error?.response) {
          switch (error.response.data.errorCode) {
            case 1:
            case 2:
            case 3: {
              editPasswordDispatch({
                type: EditPasswordActionType.validateAll,
              });
              notifications.dispatch({
                type: NotificationsActionType.enqueue,
                value: {
                  message: 'Cannot edit password.',
                  actions: {
                    close: true,
                  },
                  autoHideDuration: 5000,
                },
              });
              break;
            }
            case 5: {
              editPasswordDispatch({
                type: EditPasswordActionType.invalidateCurrentPassword,
              });
              notifications.dispatch({
                type: NotificationsActionType.enqueue,
                value: {
                  message: 'Cannot edit password.',
                  actions: {
                    close: true,
                  },
                  autoHideDuration: 5000,
                },
              });
              break;
            }
            case 4:
            default: {
              notifications.dispatch({
                type: NotificationsActionType.enqueue,
                value: {
                  message: 'Network Error. Cannot edit password.',
                  actions: {
                    label: {
                      text: 'Retry',
                      onClick: handleSubmit,
                    },
                  },
                  autoHideDuration: 5000,
                },
              });
              break;
            }
          }
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message: 'Internal Error. Cannot edit password.',
              actions: {
                label: {
                  text: 'Retry',
                  onClick: handleSubmit,
                },
              },
              autoHideDuration: 5000,
            },
          });
        }
      }
    } else {
      notifications.dispatch({
        type: NotificationsActionType.enqueue,
        value: {
          message: 'Cannot edit password.',
          actions: {
            close: true,
          },
          autoHideDuration: 5000,
        },
      });
    }
  };

  return (
    <SettingsMain id="edit-password">
      <SettingsHead
        id="edit-password-head"
        headlineId="edit-password-headline"
        back={{ name: 'Settings', href: '/account/settings' }}
      >
        Edit Password
      </SettingsHead>
      <SettingsPane id="edit-password-pane">
        <SettingsSection className={styles['settings__section--leading']}>
          <SettingsTextField
            id="current-password"
            label="Current Password"
            type="password"
            value={editPasswordState.currentPassword.value}
            setValue={setCurrentPassword}
            error={editPasswordState.currentPassword.error}
            validate={validateCurrentPassword}
            helperText={editPasswordState.currentPassword.helperText}
            autoComplete="current-password"
          />
        </SettingsSection>
        <SettingsSection>
          <SettingsTextField
            id="new-password"
            label="New Password"
            type="password"
            value={editPasswordState.newPassword.value}
            setValue={setNewPassword}
            error={editPasswordState.newPassword.error}
            validate={validateNewPassword}
            helperText={editPasswordState.newPassword.helperText}
            autoComplete="new-password"
          />
          <SettingsTextField
            id="new-password-confirm"
            label="Confirm New Password"
            type="password"
            value={editPasswordState.newPasswordConfirm.value}
            setValue={setNewPasswordConfirm}
            error={editPasswordState.newPasswordConfirm.error}
            validate={validateNewPasswordConfirm}
            helperText={editPasswordState.newPasswordConfirm.helperText}
            autoComplete="new-password"
          />
        </SettingsSection>
        <SettingsButton variant="filled" onClick={handleSubmit}>
          Save
        </SettingsButton>
      </SettingsPane>
    </SettingsMain>
  );
}

export default EditPassword;
