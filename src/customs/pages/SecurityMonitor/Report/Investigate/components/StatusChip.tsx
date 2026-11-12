import { Box, Chip, Stack } from '@mui/material';

interface StatusChipProps {
  label: string;
  color: string;
}

const StatusChip = ({ label, color }: StatusChipProps) => (
  <Chip
    size="small"
    label={
      <Stack direction="row" spacing={0.6} alignItems="center">
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
        <span>{label}</span>
      </Stack>
    }
    sx={{
      mt: 0.5,
      height: 22,
      borderRadius: 1,
      backgroundColor: `${color}18`,
      color,
      fontSize: 11,
      fontWeight: 600,
      '& .MuiChip-label': {
        px: 0.8,
      },
    }}
  />
);

export default StatusChip;
