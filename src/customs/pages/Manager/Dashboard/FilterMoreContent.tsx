import {
  Box,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface Filters {
  is_action: boolean | null | undefined;
  start_date: string;
  end_date: string;
  site_approval: number | null;
  approval_type: string;
}

type FilterMoreContentProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
};

const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
}) => {
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === 'site_approval' ? (value === '' ? null : Number(value)) : value,
    }));
  };

  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Approval Filter
      </Typography>

      <Grid container spacing={3} mt={3}>
        {/* Start Date */}
        <Grid size={{ xs: 12 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={filters.start_date ? dayjs(filters.start_date) : null}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  start_date: newValue ? newValue.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="End Date"
              value={filters.end_date ? dayjs(filters.end_date) : null}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  end_date: newValue ? newValue.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Site Approval */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="site-approval-label">Site Approval</InputLabel>
            <Select
              labelId="site-approval-label"
              name="site_approval"
              value={filters.site_approval?.toString() || ''}
              label="Site Approval"
              onChange={handleSelectChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={0}>NonApproval</MenuItem>
              <MenuItem value={1}>VmsManager</MenuItem>
              <MenuItem value={2}>VmsManagerAndHost</MenuItem>
              <MenuItem value={3}>VmsManagerOrManager</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Approval Type */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="approval-type-label">Approval Type</InputLabel>
            <Select
              labelId="approval-type-label"
              name="approval_type"
              value={filters.approval_type || ''}
              label="Approval Type"
              onChange={handleSelectChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="host">Host</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Is Action */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="is-action-label">Status</InputLabel>
            <Select
              labelId="is-action-label"
              name="is_action"
              value={
                filters.is_action === null || filters.is_action === undefined
                  ? ''
                  : filters.is_action
                  ? 'true'
                  : 'false'
              }
              label="Status"
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  is_action: val === '' ? undefined : val === 'true' ? true : false,
                }));
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Accept</MenuItem>
              <MenuItem value="false">Deny</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Apply Button */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={onApplyFilter}>
              Apply
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterMoreContent;
