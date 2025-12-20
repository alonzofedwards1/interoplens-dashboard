import React, { createContext, useContext } from 'react';

import { AuthSession } from './authClient';

const SessionContext = createContext<AuthSession | null>(null);

export const SessionProvider: React.FC<{
    session: AuthSession | null;
    children: React.ReactNode;
}> = ({ session, children }) => {
    return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);

