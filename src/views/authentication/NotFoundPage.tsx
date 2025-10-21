import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      textAlign="center"
    >
      <Typography variant="h3" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" mb={3}>
        Halaman yang kamu cari tidak ditemukan atau sudah tidak tersedia.
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/">
        Kembali ke Halaman Utama
      </Button>
    </Box>
  );
}
