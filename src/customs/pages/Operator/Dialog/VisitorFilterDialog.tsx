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
  startDate: string;
  endDate: string;
  // onApply: (value: VisitorStatusFilter) => void;
  onApply: (status: VisitorStatusFilter, startDate: string, endDate: string) => void;
  onReset: () => void;
}

const VisitorFilterDialog = ({
  open,
  value,
  startDate,
  endDate,
  onClose,
  onApply,
  onReset,
}: VisitorFilterDialogProps) => {
  const [selectedFilter, setSelectedFilter] = useState<VisitorStatusFilter>(value);

  const [selectedStartDate, setSelectedStartDate] = useState(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate);

  React.useEffect(() => {
    if (open) {
      setSelectedFilter(value);
      setSelectedStartDate(startDate);
      setSelectedEndDate(endDate);
    }
  }, [open, value, startDate, endDate]);

  const handleReset = () => {
    setSelectedFilter('all');
    setSelectedStartDate('');
    setSelectedEndDate('');

    onReset();
  };

  const handleApply = () => {
    onApply(selectedFilter, selectedStartDate, selectedEndDate);
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
            value={selectedStartDate}
            onChange={(e) => setSelectedStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={selectedEndDate}
            onChange={(e) => setSelectedEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
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
