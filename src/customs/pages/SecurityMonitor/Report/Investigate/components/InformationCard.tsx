import { Box, Stack, Typography } from '@mui/material';
import type React from 'react';

interface InformationCardProps {
  title: string;
  action?: boolean;
  children: React.ReactNode;
}

const InformationCard = ({ title, children }: InformationCardProps) => (
  <Box
    sx={{
      border: '1px solid #e5e9ef',
      borderRadius: 1.5,
      mb: 2,
      overflow: 'hidden',
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      px={1.5}
      py={1}
      sx={{
        backgroundColor: '#fafbfd',
        borderBottom: '1px solid #e8ecf1',
      }}
    >
      <Typography fontSize={16} fontWeight={700}>
        {title}
      </Typography>
    </Stack>

    <Box px={1.5} py={1.2}>
      {children}
    </Box>
  </Box>
);

export default InformationCard;
