import { Button, InputAdornment, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { IconSearch, IconX } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface VisitorSearchInputProps {
  onOpenSearch: () => void;
  onClear?: any;
  containerRef?: React.RefObject<HTMLElement>;
}

const VisitorSearchInput = ({ onOpenSearch, onClear, containerRef }: VisitorSearchInputProps) => {
  const tooltipProps = {
    arrow: true,
    slotProps: {
      popper: { container: containerRef?.current },
      tooltip: { sx: { fontSize: '0.75rem', padding: '8px 14px' } },
    },
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <CustomTextField
        fullWidth
        size="small"
        placeholder="Search Visitor"
        onClick={onOpenSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={20} />
            </InputAdornment>
          ),
        }}
      />
      <Tooltip title="Clear data information" {...tooltipProps}>
        <Button variant="outlined" color="error" startIcon={<IconX size={18} />} onClick={onClear}>
          Clear
        </Button>
      </Tooltip>
    </Box>
  );
};

export default VisitorSearchInput;
