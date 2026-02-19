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
  visitors: OptionItem[];
};
const defaultFilters: VisitorFilters = {
  is_employee: '',
  is_blacklist: '',
};

const FilterBlacklist: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  onResetFilter,
  visitors,
}) => {
  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          Filter Blacklist Visitor
        </Typography>
      </Box>
      <Divider />

      <Grid container spacing={1} sx={{ p: 1 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Visitor</CustomFormLabel>

          <Autocomplete
            options={visitors}
            getOptionLabel={(option) => option.name}
            value={visitors.find((v) => v.id === filters.visitors) || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                visitors: val?.id || '',
              }))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Visitor"
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
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Visitor Period Start</CustomFormLabel>

          <CustomTextField
            // type="datetime-local"
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
            // type="datetime-local"
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

        {/* Blacklist */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 1 }}>Blacklist</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.status_blacklist === 'true'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      status_blacklist: 'true',
                    }))
                  }
                />
              }
              label="Active"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.status_blacklist === 'false'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      status_blacklist: 'false',
                    }))
                  }
                />
              }
              label="Non-Active"
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

export default FilterBlacklist;
