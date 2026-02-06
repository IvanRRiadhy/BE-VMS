import { Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandYoutube,
} from '@tabler/icons-react';
import FooterBg from 'src/assets/images/backgrounds/footer-bg.jpg';

const Footer = () => {
  return (
    <Box>
      <Box
        sx={{
          backgroundImage: `url(${FooterBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 250,
          width: '100%',
          borderTop: '2px solid #055499',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            gap={{ xs: 0, sm: 2 }}
            flexWrap={'wrap'}
          >
            <Box
              component="a"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              mb={1}
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <IconBrandFacebook style={{ color: '#fff' }} />
            </Box>
            <Box
              component="a"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              mb={1}
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                cursor: 'pointer',
              }}
            >
              <IconBrandInstagram style={{ color: '#fff' }} />
            </Box>
            <Box
              component="a"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              mb={1}
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                cursor: 'pointer',
              }}
            >
              <IconBrandTelegram style={{ color: '#fff' }} />
            </Box>
            <Box
              component="a"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              mb={1}
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                cursor: 'pointer',
              }}
            >
              <IconBrandYoutube style={{ color: '#fff' }} />
            </Box>
            <Box
              component="a"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              mb={1}
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                cursor: 'pointer',
              }}
            >
              <IconBrandWhatsapp style={{ color: '#fff' }} />
            </Box>
          </Box>
          <Stack spacing={1} sx={{ textAlign: 'right', color: 'primary.main' }}>
            <Typography variant="h6">Bank Indonesia</Typography>
            <Typography variant="h6">Jalan Jendral Sudirman</Typography>
            <Typography variant="h6">Contact Center Bank Indonesia Bicara</Typography>
            <Typography variant="h6">Telp. : 131 dan 1500131 (dari luar negeri)</Typography>
            <Typography variant="h6">E-mail : bicara@bi.go.id</Typography>
            <Typography variant="h6">Chatbot LISA : 081 131 131 131</Typography>
          </Stack>
        </Container>
      </Box>
      <Box
        sx={{
          backgroundColor: 'primary.main',
          height: '60px',
          width: '100%',
          borderRadius: '0 !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          mt: '0px',
        }}
      >
        <Typography variant="h6">© 2026 Bank Indonesia</Typography>
      </Box>
    </Box>
  );
};

export default Footer;
