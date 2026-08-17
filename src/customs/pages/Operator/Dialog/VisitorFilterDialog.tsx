import React, { useMemo, useState } from 'react';
import {
  Card,
  Box,
  CardHeader,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  FormControl,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
  CardContent,
  ListItem,
  Avatar,
  CardActions,
  Select,
  Button,
  Tabs,
  Tab,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  RadioGroup,
  DialogActions,
  Radio,
  TextField,
  Autocomplete,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

type VisitorStatusFilter = 'all' | 'checkout' | 'block' | 'expired';

interface VisitorFilterDialogProps {
  open: boolean;
  value: VisitorStatusFilter;
  onClose: () => void;
  onApply: (value: VisitorStatusFilter) => void;
  onReset: () => void;
}

const VisitorFilterDialog = ({
  open,
  value,
  onClose,
  onApply,
  onReset,
}: VisitorFilterDialogProps) => {
  const [selectedFilter, setSelectedFilter] = useState<VisitorStatusFilter>(value);

  React.useEffect(() => {
    if (open) {
      setSelectedFilter(value);
    }
  }, [open, value]);

  const handleReset = () => {
    setSelectedFilter('all');
    onReset();
  };

  const handleApply = () => {
    onApply(selectedFilter);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Visitor Filter
        <IconButton aria-label="close" onClick={onClose}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2 }}>
        <Typography>Status</Typography>
        <RadioGroup
          value={selectedFilter}
          onChange={(e) => {
            setSelectedFilter(e.target.value as VisitorStatusFilter);
          }}
        >
          <FormControlLabel value="all" control={<Radio />} label="All Visitors" />

          <FormControlLabel value="checkout" control={<Radio />} label="Checkout" />

          <FormControlLabel value="block" control={<Radio />} label="Block" />

          <FormControlLabel value="expired" control={<Radio />} label="Expired" />
        </RadioGroup>

        <Stack direction="column" spacing={2} mt={0.5}>
          <Typography variant="subtitle2">Visit Date</Typography>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            fullWidth
            label="End Date"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography variant="subtitle2">Visitor Type</Typography>
          <Autocomplete
            fullWidth
            options={['Employee', 'Guest', 'Vendor']}
            defaultValue=""
            renderInput={(params) => <TextField {...params} label="" />}
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button color="secondary" onClick={handleReset}>
          Reset
        </Button>

        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorFilterDialog;
