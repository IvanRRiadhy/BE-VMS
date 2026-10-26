import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  const { t } = useTranslation();
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
        {t('pageNotFound')}
      </Typography>
      <Typography variant="body1" mb={3}>
        {t('pageNotFoundDescription')}
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/">
        {t('backToHome')}
      </Button>
    </Box>
  );
}
