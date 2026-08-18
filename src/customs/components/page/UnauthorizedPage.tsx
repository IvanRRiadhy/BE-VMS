import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        403 - Access Denied
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3}>
        You don’t have permission to access this page.
      </Typography>

      <Button variant="contained" color="primary" onClick={handleGoBack}>
        Go Back
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
