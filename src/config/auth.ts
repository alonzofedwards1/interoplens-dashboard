export type AuthMode = 'none' | 'session';

const authModeValue = process.env.REACT_APP_AUTH_MODE;
export const AUTH_MODE: AuthMode =
    authModeValue === 'none' ? 'none' : 'session';

export const isAuthEnabled = AUTH_MODE !== 'none';
