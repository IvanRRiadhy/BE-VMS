import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

interface GlobalLoaderProps {
  open: boolean;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ open }) => (
  <Backdrop
    open={open}
    sx={{
      color: '#fff',
      zIndex: (theme) => theme.zIndex.drawer + 999999,
      backgroundColor: 'rgba(255,255,255)',
      transition: 'opacity 0.3s ease-in-out',
    }}
  >
    <CircularProgress color="primary" size={50} />
  </Backdrop>
);

export default GlobalLoader;
