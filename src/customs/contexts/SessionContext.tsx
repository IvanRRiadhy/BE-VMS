import React, { createContext, useContext, useState, ReactNode } from "react";

interface SessionContextType {
  token: string | null;
  saveToken: (token: string) => void;
  clearToken: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("session"));

  const saveToken = (newToken: string) => {
    localStorage.setItem("session", newToken);
    setToken(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem("session");
    setToken(null);
  };

  return (
    <SessionContext.Provider value={{ token, saveToken, clearToken }}>
      {children}
    </SessionContext.Provider>
  );
};
