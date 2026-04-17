import React, { createContext, useContext, useState, ReactNode } from 'react';
import { revokeToken } from '../api/users';

export type AuthType = 'admin' | 'guest' | null;

interface SessionContextType {
  token: string | null;
  authType: AuthType;
  groupId: string | null;
  roleAccess: string | null;
  saveToken: (token: string, groupId?: string, roleAccess?: string) => void;
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
  const [roleAccess, setRoleAccess] = useState<string | null>(localStorage.getItem('roleAccess'));

  const saveToken = (newToken: string, groupId?: string, roleAccess?: string) => {
    localStorage.setItem('session', newToken);
    // localStorage.setItem('authType', type);
      if (groupId) {
        const normalized = groupId.toUpperCase();
        localStorage.setItem('groupId', normalized);
        setGroupId(normalized);
      }

    if (roleAccess) {
      localStorage.setItem('roleAccess', roleAccess);
      setRoleAccess(roleAccess);
    }
    setToken(newToken);
    // setAuthType(type);
    // setGroupId(groupId ?? null);
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
    <SessionContext.Provider value={{ token, authType, groupId, saveToken, clearToken, roleAccess }}>
      {children}
    </SessionContext.Provider>
  );
};
