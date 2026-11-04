import { AccessTimeOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

interface PlaceholderTabProps {
  title: string;
}

const PlaceholderTab = ({ title }: PlaceholderTabProps) => (
  <Box
    sx={{
      p: 5,
      minHeight: 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box textAlign="center">
      <AccessTimeOutlined
        sx={{
          fontSize: 40,
          color: '#b5bfcc',
          mb: 1,
        }}
      />

      <Typography fontWeight={600} color="#445064">
        {title}
      </Typography>

      <Typography fontSize={12} color="text.secondary" mt={0.5}>
        Investigation data will be displayed here.
      </Typography>
    </Box>
  </Box>
);

export default PlaceholderTab;
