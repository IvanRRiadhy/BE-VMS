import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}

const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => (
  <Box>
    <Typography fontSize={14} fontWeight={600} color="#3b4656" mb={0.5}>
      {label}
    </Typography>

    <FormControl fullWidth size="small">
      <Select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        sx={{
          height: 40,
          fontSize: 12,
          backgroundColor: '#fff',
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

export default FilterSelect;
