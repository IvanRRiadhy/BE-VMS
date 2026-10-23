import { Portal, Backdrop, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';

interface GlobalBackdropLoadingProps {
  open: boolean;
}

const GlobalBackdropLoading = ({ open }: GlobalBackdropLoadingProps) => {
  return (
    <Portal>
      <Backdrop
        open={open}
        sx={{
          zIndex: 999999999,
          position: 'fixed',
          inset: 0,
          color: '#fff',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            color="primary"
            size={40}
            thickness={4}
            sx={{
              position: 'relative',
              zIndex: 2,
            }}
          />
        </Box>
      </Backdrop>
    </Portal>
  );
};

export default GlobalBackdropLoading;
