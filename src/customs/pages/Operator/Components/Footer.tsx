import { Box, Typography } from '@mui/material';
import beImage from 'src/assets/images/logos/bio-experience-1x1-logo.png';

const Footer = () => {
  return (
    <Box
      sx={{
        // mt: 'auto',
        width: '100%',
        bgcolor: 'primary.main',
        borderTop: '1px solid',
        borderColor: 'divider',
        height: '50px',
        // overflow: 'hidden',
        marginTop: '5px',
        borderRadius: '0px !important',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Typography variant="h6" color="white" fontWeight={'bold'}>
        © 2026 Bank Indonesia
        {/* <span style={{ color: 'red' }}>
          <img src={beImage} style={{ width: '15px', marginRight: '5px', marginLeft: '5px' }} />
        </span>
        . All Rights Reserved. */}
      </Typography>
    </Box>
  );
};

export default Footer;
