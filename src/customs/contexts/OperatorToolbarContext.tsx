import React, { createContext, useContext, useState } from 'react';

const OperatorToolbarContext = createContext<{
  toolbar: React.ReactNode;
  setToolbar: (toolbar: React.ReactNode) => void;
}>({
  toolbar: null,
  setToolbar: () => {},
});

export const OperatorToolbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [toolbar, setToolbar] = useState<React.ReactNode>(null);

  return (
    <OperatorToolbarContext.Provider value={{ toolbar, setToolbar }}>
      {children}
    </OperatorToolbarContext.Provider>
  );
};

export const useOperatorToolbar = () => useContext(OperatorToolbarContext);
