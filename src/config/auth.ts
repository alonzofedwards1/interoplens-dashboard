export type AuthMode = 'none' | 'oauth';

const envAuthMode = process.env.REACT_APP_AUTH_MODE as AuthMode | undefined;
export const AUTH_MODE: AuthMode = envAuthMode === 'none' ? 'none' : 'oauth';

export const isAuthEnabled = AUTH_MODE !== 'none';
