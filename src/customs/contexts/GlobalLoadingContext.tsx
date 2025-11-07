// import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
// import { Backdrop, CircularProgress } from '@mui/material';

// type GL = { open: boolean; show: () => void; hide: () => void };
// const GlobalLoadingContext = createContext<GL | undefined>(undefined);

// export const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [open, setOpen] = useState(false);
//   const timer = useRef<NodeJS.Timeout | null>(null);

//   const show = () => {
//     if (timer.current) clearTimeout(timer.current);
//     // langsung aktif tanpa delay (biar gak kalah dari render page)
//     setOpen(true);
//   };

//   const hide = () => {
//     timer.current = setTimeout(() => setOpen(false), 300);
//   };

//   return (
//     <GlobalLoadingContext.Provider value={{ open, show, hide }}>
//       {children}
//       <Backdrop
//         open={open}
//         sx={{
//           zIndex: (t) => t.zIndex.drawer + 9999,
//           color: '#1976d2',
//           bgcolor: 'rgba(255,255,255)',
//           backdropFilter: 'blur(2px)',
//           transition: 'opacity 0.2s ease-in-out',
//         }}
//       >
//         <CircularProgress color="primary" thickness={4} />
//       </Backdrop>
//     </GlobalLoadingContext.Provider>
//   );
// };

// export const useGlobalLoading = () => {
//   const ctx = useContext(GlobalLoadingContext);
//   if (!ctx) throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
//   return ctx;
// };

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { createPortal } from 'react-dom';

type GlobalLoadingContextType = {
  open: boolean;
  show: () => void;
  hide: () => void;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    // langsung aktif tanpa delay (biar gak kalah dari render page)
    setOpen(true);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 250); // sedikit lebih cepat biar smooth
  };

  // ✅ Backdrop dirender lewat portal agar tidak ikut rerender bareng App
  const backdrop = open
    ? createPortal(
        <Backdrop
          open
          sx={{
            zIndex: (t) => t.zIndex.drawer + 9999,
            color: '#1976d2',
            bgcolor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(3px)',
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          <CircularProgress color="primary" thickness={4} />
        </Backdrop>,
        document.body,
      )
    : null;

  return (
    <GlobalLoadingContext.Provider value={{ open, show, hide }}>
      {children}
      {backdrop}
    </GlobalLoadingContext.Provider>
  );
};

export const useGlobalLoading = () => {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  return ctx;
};
