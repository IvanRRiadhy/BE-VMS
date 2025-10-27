import React from 'react';
import {
  Box,
  Button,
  Grid2,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Autocomplete,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';

interface Filters {
  gender: number;
  organization: string;
  department: string;
  district: string;
  joinStart: string;
  exitEnd: string;
  statusEmployee: number;
}

interface OptionItem {
  id: string;
  name: string;
}

type FilterMoreContentProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
  organizationData: OptionItem[];
  departmentData: OptionItem[];
  districtData: OptionItem[];
};

const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  organizationData,
  departmentData,
  districtData,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, name } = e.target as any;
    const key = (id || name) as keyof Filters;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onApplyFilter();
  };

  const initialFilters: Filters = {
    gender: -1,
    organization: '',
    department: '',
    district: '',
    joinStart: '',
    exitEnd: '',
    statusEmployee: -1,
  };

  return (
    <Box
      sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}
      onKeyDown={handleKeyDown}
    >
      <Typography variant="h5" gutterBottom>
        Employee Filter
      </Typography>

      <Grid2 container spacing={3}>
        {/* Join Dates */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinStart">
            <Typography variant="caption">Join Start</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="joinStart"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.joinStart}
            onChange={handleChange}
            InputProps={{ sx: { fontSize: '0.7rem' } }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="exitEnd">
            <Typography variant="caption">Exit End</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="exitEnd"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.exitEnd}
            onChange={handleChange}
            InputProps={{ sx: { fontSize: '0.7rem' } }}
          />
        </Grid2>

        {/* Organization */}
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="organization" sx={{ mt: 0 }}>
            <Typography variant="caption">Organization</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="organization"
            options={organizationData}
            value={organizationData.find((o) => o.id === filters.organization) || null}
            onChange={(_, val) =>
              setFilters((prev) => ({ ...prev, organization: val ? val.id : '' }))
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
            clearOnEscape
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select organization"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.7rem' } }}
              />
            )}
          />
        </Grid2>

        {/* Department */}
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="department" sx={{ mt: 0 }}>
            <Typography variant="caption">Department</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="department"
            options={departmentData}
            value={departmentData.find((o) => o.id === filters.department) || null}
            onChange={(_, val) =>
              setFilters((prev) => ({ ...prev, department: val ? val.id : '' }))
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
            clearOnEscape
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select department"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.7rem' } }}
              />
            )}
          />
        </Grid2>

        {/* District */}
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="district" sx={{ mt: 0 }}>
            <Typography variant="caption">District</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="district"
            options={districtData}
            value={districtData.find((o) => o.id === filters.district) || null}
            onChange={(_, val) => setFilters((prev) => ({ ...prev, district: val ? val.id : '' }))}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
            clearOnEscape
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select district"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.7rem' } }}
              />
            )}
          />
        </Grid2>

        {/* Gender */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel>
            <Typography variant="caption">Gender</Typography>
          </CustomFormLabel>
          <FormControl>
            <RadioGroup row name="gender" value={String(filters.gender)} onChange={handleChange}>
              <FormControlLabel
                value="0"
                control={<CustomRadio />}
                label="Female"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
              <FormControlLabel
                value="1"
                control={<CustomRadio />}
                label="Male"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
            </RadioGroup>
          </FormControl>
        </Grid2>

        {/* Status Employee */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel>
            <Typography variant="caption">Status Employee</Typography>
          </CustomFormLabel>
          <FormControl>
            <RadioGroup
              row
              name="statusEmployee"
              value={String(filters.statusEmployee)}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Active"
                control={<CustomRadio />}
                label="Active"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
              <FormControlLabel
                value="Non Active"
                control={<CustomRadio />}
                label="Non Active"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
            </RadioGroup>
          </FormControl>
        </Grid2>

        {/* Actions */}
        <Grid2 size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button variant="outlined" onClick={() => setFilters(initialFilters)}>
              Reset
            </Button>
            <Button variant="contained" onClick={onApplyFilter}>
              Apply
            </Button>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default FilterMoreContent;
