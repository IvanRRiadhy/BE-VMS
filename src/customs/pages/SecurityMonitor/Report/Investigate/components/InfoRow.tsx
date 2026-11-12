import { Stack, Typography } from '@mui/material';
import type React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Stack direction="row" spacing={2} sx={{ py: 0.45 }}>
    <Typography fontSize={12} color="text.secondary" sx={{ width: 105, flexShrink: 0 }}>
      {label}
    </Typography>

    <Typography fontSize={12} fontWeight={500} color="#303b4b">
      {value}
    </Typography>
  </Stack>
);

export default InfoRow;
