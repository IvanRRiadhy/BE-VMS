import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

type ToastType = AlertColor;

interface ToastOptions {
  duration?: number;
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

export const toast = (
  message: string,
  severity: ToastType = 'info',
  options: ToastOptions = {},
) => {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);

    root = createRoot(container);
  }

  root?.render(
    <ToastContainer message={message} severity={severity} duration={options.duration ?? 4000} />,
  );
};

interface ToastContainerProps {
  message: string;
  severity: ToastType;
  duration: number;
}

const ToastContainer = ({ message, severity, duration }: ToastContainerProps) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;

    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default toast;