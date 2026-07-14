import { Box, Typography } from '@mui/material';
import beImage from 'src/assets/images/logos/bio-experience-1x1-logo.png';

const Footer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        px: 1,

        // overflow: 'hidden',
        marginTop: '2px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={'bold'}>
        Copyright © 2026{' '}
        <span style={{ color: 'red' }}>
          <img src={beImage} style={{ width: '15px', marginRight: '5px', marginLeft: '5px' }} />
        </span>
        . All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
