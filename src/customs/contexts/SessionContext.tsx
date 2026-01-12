// import React, { createContext, useContext, useState, ReactNode } from "react";

// interface SessionContextType {
//   token: string | null;
//   saveToken: (token: string) => void;
//   clearToken: () => void;
// }

// const SessionContext = createContext<SessionContextType | undefined>(undefined);

// export const useSession = (): SessionContextType => {
//   const context = useContext(SessionContext);
//   if (!context) {
//     throw new Error("useSession must be used within a SessionProvider");
//   }
//   return context;
// };

// interface SessionProviderProps {
//   children: ReactNode;
// }

// export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(localStorage.getItem("session"));

//   const saveToken = (newToken: string) => {
//     localStorage.setItem("session", newToken);
//     setToken(newToken);
//   };

//   const clearToken = () => {
//     localStorage.removeItem("session");
//     setToken(null);
//   };

//   return (
//     <SessionContext.Provider value={{ token, saveToken, clearToken }}>
//       {children}
//     </SessionContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { revokeToken } from '../api/users';

export type AuthType = 'admin' | 'guest' | null;

interface SessionContextType {
  token: string | null;
  authType: AuthType;
  groupId: string | null;
  saveToken: (token: string, groupId?: string) => void;
  clearToken: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('session'));
  const [authType, setAuthType] = useState<AuthType>(
    (localStorage.getItem('authType') as AuthType) || null,
  );
  const [groupId, setGroupId] = useState<string | null>(localStorage.getItem('groupId'));

  const saveToken = (newToken: string, groupId?: string) => {
    // if (!type) throw new Error('authType harus diisi (admin/guest)');

    localStorage.setItem('session', newToken);
    // localStorage.setItem('authType', type);
    if (groupId) localStorage.setItem('groupId', groupId);

    setToken(newToken);
    // setAuthType(type);
    setGroupId(groupId ?? null);
  };

  const clearToken = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('authType');
    localStorage.removeItem('groupId');
    setToken(null);
    setAuthType(null);
    setGroupId(null);
    revokeToken(token!);
  };

  return (
    <SessionContext.Provider value={{ token, authType, groupId, saveToken, clearToken }}>
      {children}
    </SessionContext.Provider>
  );
};
