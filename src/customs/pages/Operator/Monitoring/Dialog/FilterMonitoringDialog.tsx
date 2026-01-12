import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import React from 'react';

interface FilterMonitoringDialogProps {
  open: boolean;
  onClose: () => void;
  filters: any;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
}

const FilterMonitoringDialog: React.FC<FilterMonitoringDialogProps> = ({
  open,
  onClose,
  filters,
  onChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Filter Monitoring</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Visitor */}
          <Grid size={12}>
            <Typography variant="h6" mb={1}>
              Visitor
            </Typography>
            <CustomTextField
              fullWidth
              placeholder="Input name visitor"
              value={filters.visitorName}
              onChange={(e) => onChange('visitorName', e.target.value)}
            />
          </Grid>

          {/* Activity */}
          <Grid size={12}>
            <Typography variant="h6" mb={1}>
              Activity
            </Typography>
            <FormControl fullWidth>
              <Select
                value={filters.activity}
                onChange={(e) => onChange('activity', e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#999' }}>Select activity</span>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="" disabled>
                  Select activity
                </MenuItem>
                <MenuItem value="in">Masuk</MenuItem>
                <MenuItem value="out">Keluar</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Alarm */}
          <Grid size={12}>
            <Typography variant="h6" mb={1}>
              Alarm
            </Typography>
            <FormControl fullWidth>
              <Select
                value={filters.alarm}
                onChange={(e) => onChange('alarm', e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#999' }}>Select Alarm</span>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="" disabled>
                  Select Alarm
                </MenuItem>
                <MenuItem value="1">Alarm 1</MenuItem>
                <MenuItem value="2">Alarm 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Operator Log */}
          <Grid size={12}>
            <Typography variant="h6" mb={1}>
              Operator Log
            </Typography>
            <CustomTextField
              fullWidth
              placeholder="Input operator log"
              value={filters.operatorLog}
              onChange={(e) => onChange('operatorLog', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterMonitoringDialog;
