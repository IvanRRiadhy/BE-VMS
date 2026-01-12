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
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface VisitorFilters {
  organization_id: string;
  department_id: string;
  district_id: string;
  is_employee: string;
  gender: string;
  is_email_verified: string;
  is_blacklist: string;
}

type OptionItem = {
  id: string;
  name: string;
};

type FilterMoreContentProps = {
  filters: VisitorFilters;
  setFilters: React.Dispatch<React.SetStateAction<VisitorFilters>>;
  onApplyFilter: () => void;
  organizationData?: OptionItem[];
  departmentData?: OptionItem[];
  districtData?: OptionItem[];
};
const defaultFilters: VisitorFilters = {
  organization_id: '',
  department_id: '',
  district_id: '',
  is_employee: '',
  gender: '',
  is_email_verified: '',
  is_blacklist: '',
};

const FilterMoreContentVisitor: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  organizationData = [],
  departmentData = [],
  districtData = [],
}) => {
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5 }}>
      <Typography variant="h5" gutterBottom>
        Filter Visitor
      </Typography>
      <Divider />

      <Grid container spacing={3} sx={{ marginTop: '5px' }}>
        {/* Organization */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Organization</CustomFormLabel>
          <Autocomplete
            options={organizationData}
            value={organizationData.find((o) => o.id === filters.organization_id) || null}
            onChange={(_, val) =>
              setFilters((prev) => ({
                ...prev,
                organization_id: val ? val.id : '',
              }))
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => opt?.name ?? ''}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select organization"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.8rem' } }}
              />
            )}
          />
        </Grid>

        {/* Department */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Department</CustomFormLabel>
          <Autocomplete
            options={departmentData}
            value={departmentData.find((o) => o.id === filters.department_id) || null}
            onChange={(_, val) =>
              setFilters((prev) => ({
                ...prev,
                department_id: val ? val.id : '',
              }))
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => opt?.name ?? ''}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select department"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.8rem' } }}
              />
            )}
          />
        </Grid>

        {/* District */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>District</CustomFormLabel>
          <Autocomplete
            options={districtData}
            value={districtData.find((o) => o.id === filters.district_id) || null}
            onChange={(_, val) =>
              setFilters((prev) => ({
                ...prev,
                district_id: val ? val.id : '',
              }))
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => opt?.name ?? ''}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select district"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.8rem' } }}
              />
            )}
          />
        </Grid>

        {/* Gender */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Gender</CustomFormLabel>
          <FormControl>
            <RadioGroup row name="gender" value={filters.gender} onChange={handleRadioChange}>
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
        </Grid>

        {/* Email Verified */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Is Email Verified</CustomFormLabel>
          <FormControl>
            <RadioGroup
              row
              name="is_email_verified"
              value={filters.is_email_verified}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                value="true"
                control={<CustomRadio />}
                label="True"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
              <FormControlLabel
                value="false"
                control={<CustomRadio />}
                label="False"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Is Employee */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Is Employee</CustomFormLabel>
          <FormControl>
            <RadioGroup
              row
              name="is_employee"
              value={filters.is_employee}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                value="true"
                control={<CustomRadio />}
                label="True"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
              <FormControlLabel
                value="false"
                control={<CustomRadio />}
                label="False"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Blacklist */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Blacklist</CustomFormLabel>
          <FormControl>
            <RadioGroup
              row
              name="is_blacklist"
              value={filters.is_blacklist}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                value="true"
                control={<CustomRadio />}
                label="True"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
              <FormControlLabel
                value="false"
                control={<CustomRadio />}
                label="False"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Apply Button */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {/* Reset */}
          <Button variant="outlined" color="primary" onClick={() => setFilters(defaultFilters)}>
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
