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
import { useDepartment } from 'src/hooks/useDepartment';
import { useDistricts } from 'src/hooks/useDistricts';
import { useOrganizations } from 'src/hooks/useOrganization';

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

const FilterVisitor: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  onResetFilter,
}) => {
  const { data: organizations = [] } = useOrganizations();
  const { data: department = [] } = useDepartment();
  const { data: districts = [] } = useDistricts();

  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          Filter Visitor
        </Typography>
      </Box>
      <Divider />

      <Grid container spacing={1} sx={{ p: 1 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Organization</CustomFormLabel>
          <Autocomplete
            options={organizations}
            getOptionLabel={(option) => option.name}
            value={organizations.find((o) => o.id === filters.organization_id) || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                organization_id: val?.id || '',
              }))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Organization"
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
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Department</CustomFormLabel>
          <Autocomplete
            options={department}
            getOptionLabel={(option) => option.name}
            value={department.find((o) => o.id === filters.department_id) || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                department_id: val?.id || '',
              }))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Department"
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
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>District</CustomFormLabel>
          <Autocomplete
            options={districts}
            getOptionLabel={(option) => option.name}
            value={districts.find((o) => o.id === filters.district_id) || null}
            onChange={(_, val) =>
              setFilters((prev: any) => ({
                ...prev,
                district_id: val?.id || '',
              }))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select District"
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
          <CustomFormLabel sx={{ mt: 1 }}>Blacklist</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_blacklist === 'true'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      is_blacklist: 'true',
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
                  checked={filters.is_blacklist === 'false'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      is_blacklist: 'false',
                    }))
                  }
                />
              }
              label="No"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
          </FormGroup>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 1 }}>Email Verified</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_email_verified === 'true'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      is_email_verified: 'true',
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
                  checked={filters.is_email_verified === 'false'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      is_email_verified: 'false',
                    }))
                  }
                />
              }
              label="No"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
          </FormGroup>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 1 }}>Gender</CustomFormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.gender === 'Male'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      gender: 'Male',
                    }))
                  }
                />
              }
              label="Male"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.gender === 'Female'}
                  onChange={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      gender: 'Female',
                    }))
                  }
                />
              }
              label="Female"
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

export default FilterVisitor;
