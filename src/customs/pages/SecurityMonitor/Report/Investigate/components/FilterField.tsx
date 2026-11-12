import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import type React from 'react';

interface FilterFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  type?: 'text' | 'date';
}

const FilterField = ({
  label,
  placeholder,
  value,
  icon,
  onChange,
  onClick,
  type = 'text',
}: FilterFieldProps) => (
  <Box>
    <Typography fontSize={14} fontWeight={600} color="#3b4656" mb={0.5}>
      {label}
    </Typography>

    <TextField
      fullWidth
      size="small"
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      onClick={onClick}
      InputProps={{
        readOnly: !!onClick,
        endAdornment:
          type !== 'date' && icon ? (
            <InputAdornment position="end">{icon}</InputAdornment>
          ) : undefined,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: 42,
          fontSize: 12,
          marginTop: '2px',
          backgroundColor: '#fff',
        },
        '& .MuiInputBase-input': {
          fontSize: 12,
        },
      }}
    />
  </Box>
);

export default FilterField;
