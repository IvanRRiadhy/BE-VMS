import { Portal, Snackbar, Alert } from '@mui/material';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface GlobalSnackbarProps {
  open: boolean;
  message: string;
  severity?: SnackbarSeverity;
  autoHideDuration?: number;
  onClose: () => void;
}

const SnackbarOperator = ({
  open,
  message,
  severity = 'info',
  autoHideDuration = 3000,
  onClose,
}: GlobalSnackbarProps) => {
  return (
    <Portal>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          zIndex: 99999,
          position: 'fixed',
          top: 20,
          left: 0,
          right: 0,
          margin: '0 auto',
          maxWidth: 500,
          '& .MuiPaper-root': {
            minWidth: 420,
            maxWidth: 600,
            fontSize: '1rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
            p: 2.5,
            borderRadius: 2,
          },
        }}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '16px', whiteSpace: 'pre-line' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Portal>
  );
};

export default SnackbarOperator;
