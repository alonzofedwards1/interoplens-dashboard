export type AuthMode = 'none' | 'oauth';

export const AUTH_MODE: AuthMode =
    (process.env.REACT_APP_AUTH_MODE as AuthMode) === 'oauth' ? 'oauth' : 'none';

export const isAuthEnabled = AUTH_MODE !== 'none';
