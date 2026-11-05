import { Box, Grid2 as Grid, MenuItem, Button } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/id';
import { IconRefresh } from '@tabler/icons-react';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

dayjs.extend(utc);

interface VisitorFilters {
  site: string;
  host: string;
  visitorName: string;
  access: string;
}

interface VisitorFilterProps {
  filters: VisitorFilters;
  setFilters: React.Dispatch<React.SetStateAction<VisitorFilters>>;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  handleResetFilter: () => void;
}

const MonitoringFilter = ({
  filters,
  setFilters,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleResetFilter,
}: VisitorFilterProps) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Site */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Site</CustomFormLabel>
          <CustomSelect
            fullWidth
            displayEmpty
            value={filters.site}
            onChange={(e: any) => setFilters((prev) => ({ ...prev, site: e.target.value }))}
          >
            <MenuItem value="">All Sites</MenuItem>
            <MenuItem value="site-1">Site 1</MenuItem>
            <MenuItem value="site-2">Site 2</MenuItem>
          </CustomSelect>
        </Grid>

        {/* Host */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Host</CustomFormLabel>
          <CustomSelect
            fullWidth
            displayEmpty
            value={filters.host}
            onChange={(e: any) => setFilters((prev) => ({ ...prev, host: e.target.value }))}
          >
            <MenuItem value="">All Hosts</MenuItem>
            <MenuItem value="host-1">Host 1</MenuItem>
            <MenuItem value="host-2">Host 2</MenuItem>
          </CustomSelect>
        </Grid>

        {/* Visitor Name */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Visitor Name</CustomFormLabel>
          <CustomSelect
            fullWidth
            displayEmpty
            value={filters.visitorName}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                visitorName: e.target.value,
              }))
            }
          >
            <MenuItem value="">All Visitor</MenuItem>
            <MenuItem value="Danny">Danny</MenuItem>
            <MenuItem value="Ilham">Ilham</MenuItem>
          </CustomSelect>
        </Grid>

        {/* Access */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Access</CustomFormLabel>
          <CustomSelect
            fullWidth
            displayEmpty
            value={filters.access}
            onChange={(e: any) => setFilters((prev) => ({ ...prev, access: e.target.value }))}
          >
            <MenuItem value="">All Access</MenuItem>
            <MenuItem value="SCP 5">SCP 5</MenuItem>
            <MenuItem value="SCP 4">SCP 4</MenuItem>
          </CustomSelect>
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Start Date</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
            <DatePicker
              format="DD/MM/YYYY"
              value={startDate ? dayjs(startDate) : null}
              onChange={(value) => {
                const date = value?.isValid() ? value.format('YYYY-MM-DD') : '';

                setStartDate(date);

                if (date && endDate && dayjs.utc(date).isAfter(dayjs.utc(endDate), 'day')) {
                  setEndDate(date);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  placeholder: 'DD/MM/YYYY',
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>End Date</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
            <DatePicker
              format="DD/MM/YYYY"
              value={endDate ? dayjs(endDate) : null}
              minDate={startDate ? dayjs(startDate) : undefined}
              onChange={(value) => {
                setEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '');
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  placeholder: 'DD/MM/YYYY',
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Reset */}
        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Action</CustomFormLabel>
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="primary"
            startIcon={<IconRefresh />}
            onClick={handleResetFilter}
          >
            Reset Filter
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonitoringFilter;
