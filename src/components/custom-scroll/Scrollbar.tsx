// @ts-ignore
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { Box, styled, SxProps } from '@mui/material';

const SimpleBarStyle = styled(SimpleBar)(() => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar:before': {
    backgroundColor: '#1976d2 !important',
  },
  '& .simplebar-track.simplebar-vertical': {
    backgroundColor: '#1976d2 !important',
  },
}));

interface PropsType {
  children: React.ReactElement | React.ReactNode;
  sx: SxProps;
}

const Scrollbar = (props: PropsType) => {
  const { children, sx, ...other } = props;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

  if (isMobile) {
    return <Box sx={{ overflowX: 'auto' }}>{children}</Box>;
  }

  return (
    <SimpleBarStyle sx={sx} {...other}>
      {children}
    </SimpleBarStyle>
  );
};

export default Scrollbar;
