import {
  Box,
  Button,
  Typography,
  Grid2 as Grid,
  FormControl,
  Divider,
  Autocomplete,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  Checkbox,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useHost } from 'src/hooks/useHost';
import { useSites } from 'src/hooks/useSites';

interface VisitorFilters {
  is_employee: string;
  is_blacklist: string;
}

type OptionItem = {
  id: string;
  name: string;
};

type FilterMoreContentProps = {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onApplyFilter: () => void;
  onResetFilter: () => void;
};
const defaultFilters: VisitorFilters = {
  is_employee: '',
  is_blacklist: '',
};

const FilterMoreContentVisitor: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  onResetFilter,
}) => {
  const statusMap: Record<string, string> = {
    All: 'All',
    Preregis: 'Preregis',
    Checkin: 'Checkin',
    Checkout: 'Checkout',
    Denied: 'Denied',
    Block: 'Block',
  };

  const visitorRole: Record<string, string> = {
    Visitor: 'Visitor',
    Delivery: 'Delivery',
    Vip: 'Vip',
  };

  const visitorRoleOptions = Object.values(visitorRole);

  const statusOptions = Object.values(statusMap);

  const { data: sites = [] } = useSites();
  const { data: host = [] } = useHost();

  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          Filter Visitor
        </Typography>
        {/* <IconX onClick={() => setShowDrawerFilterMore(false)} style={{ cursor: 'pointer' }} /> */}
      </Box>
      <Divider />

      <Grid container spacing={1} sx={{ p: 1 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Visitor Status</CustomFormLabel>

          <Autocomplete
            options={statusOptions}
            value={filters.visitor_status || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                visitor_status: val || '',
              }))
            }
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Visitor Status"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { fontSize: '0.8rem' },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Visitor Role</CustomFormLabel>
          <Autocomplete
            options={visitorRoleOptions}
            value={filters.visitor_role || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                visitor_role: val || '',
              }))
            }
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Visitor Role"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.8rem' } }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Visitor Period Start</CustomFormLabel>

          <CustomTextField
            type="date"
            fullWidth
            value={filters.start_date}
            onChange={(e) =>
              setFilters((prev: any) => ({
                ...prev,
                start_date: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Visitor Period End</CustomFormLabel>

          <CustomTextField
            type="date"
            fullWidth
            value={filters.end_date}
            onChange={(e) =>
              setFilters((prev: any) => ({
                ...prev,
                end_date: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Host</CustomFormLabel>
          <Autocomplete
            options={host}
            getOptionLabel={(option) => option.name}
            value={host.find((o) => o.id === filters.site_id) || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                site_id: val?.id || '',
              }))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Host"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { fontSize: '0.8rem' },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Site</CustomFormLabel>
          <Autocomplete
            options={sites}
            getOptionLabel={(option) => option.name}
            value={sites.find((o) => o.id === filters.site_id) || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                site_id: val?.id || '',
              }))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Sites"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { fontSize: '0.8rem' },
                }}
              />
            )}
          />
        </Grid>

        {/* Blacklist */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Block</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_block === 'true'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      is_block: 'true',
                    }))
                  }
                />
              }
              label="Yes"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_block === 'false'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      is_block: 'false',
                    }))
                  }
                />
              }
              label="No"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
          </FormGroup>
        </Grid>

        {/* <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Transaction Status</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.transaction_status === 'true'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      transaction_status: 'true',
                    }))
                  }
                />
              }
              label="Available"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.transaction_status === 'false'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      transaction_status: 'false',
                    }))
                  }
                />
              }
              label="Not Available"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
          </FormGroup>
        </Grid> */}

        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Emergency Situation</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.emergency_situation === 'true'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      emergency_situation: 'true',
                    }))
                  }
                />
              }
              label="Yes"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.emergency_situation === 'false'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      emergency_situation: 'false',
                    }))
                  }
                />
              }
              label="No"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
          </FormGroup>
        </Grid>

        {/* Apply Button */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {/* Reset */}
          <Button variant="outlined" color="primary" onClick={onResetFilter}>
            Reset
          </Button>
          <Button variant="contained" color="primary" onClick={onApplyFilter}>
            Apply
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterMoreContentVisitor;
