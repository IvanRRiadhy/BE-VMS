import { Portal, Backdrop, CircularProgress } from '@mui/material';

interface GlobalBackdropLoadingProps {
  open: boolean;
}

const GlobalBackdropLoading = ({ open }: GlobalBackdropLoadingProps) => {
  return (
    <Portal>
      <Backdrop
        open={open}
        sx={{
          zIndex: 999999,
          position: 'fixed',
          margin: '0 auto',
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </Portal>
  );
};

export default GlobalBackdropLoading;
