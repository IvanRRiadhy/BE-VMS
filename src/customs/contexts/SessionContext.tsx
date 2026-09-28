import React, { createContext, useContext, useState, ReactNode } from 'react';
import { revokeToken } from '../api/users';

// interface SessionContextType {
//   token: string | null;
//   saveToken: (token: string) => void;
//   clearToken: () => void;
// }

// const SessionContext = createContext<SessionContextType | undefined>(undefined);

// export const useSession = (): SessionContextType => {
//   const ctx = useContext(SessionContext);
//   if (!ctx) throw new Error('useSession must be used within SessionProvider');
//   return ctx;
// };

// export const SessionProvider = ({ children }: { children: ReactNode }) => {
//   const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

//   const saveToken = (newToken: string) => {
//     localStorage.setItem('token', newToken);
//     setToken(newToken);
//   };

//   const clearToken = async () => {
//     const currentToken = token;

//     try {
//       if (currentToken) {
//         await revokeToken(currentToken);
//       }
//     } finally {
//       localStorage.removeItem('token');
//       setToken(null);
//     }
//   };

//   return (
//     <SessionContext.Provider value={{ token, saveToken, clearToken }}>
//       {children}
//     </SessionContext.Provider>
//   );
// };

interface SessionContextType {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  clearToken: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext);

  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return ctx;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearToken = async () => {
    try {
      await revokeToken();
    } catch {
      // walaupun revoke gagal, state tetap harus logout
      
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated: setIsAuthenticated,
        clearToken,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
