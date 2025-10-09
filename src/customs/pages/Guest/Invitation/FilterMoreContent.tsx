import React from 'react';
import {
  Box,
  Button,
  Grid2 as Grid,
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
  visitor_period_start: string;
  visitor_period_end: string;
}

interface OptionItem {
  id: string;
  name: string;
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, name } = e.target as any;
    const key = (id || name) as keyof Filters;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onApplyFilter();
  };

  const initialFilters: Filters = {
    visitor_period_start: '',
    visitor_period_end: '',
  };

  return (
    <Box
      sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}
      onKeyDown={handleKeyDown}
    >
      <Typography variant="h5" gutterBottom>
        Filter Invitation
      </Typography>

      <Grid container spacing={3}>
        {/* Join Dates */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinStart">
            <Typography variant="caption">Visit Start</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="visior_period_start"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.visitor_period_start}
            onChange={handleChange}
            InputProps={{ sx: { fontSize: '0.7rem' } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="exitEnd">
            <Typography variant="caption">Visit End</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="exitEnd"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.visitor_period_end}
            onChange={handleChange}
            InputProps={{ sx: { fontSize: '0.7rem' } }}
          />
        </Grid>

        {/* Organization */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="organization" sx={{ mt: 0 }}>
            <Typography variant="caption">Registered Site</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="organization"
            options={[]}
            // value={organizationData.find((o) => o.id === filters.organization) || null}
            // onChange={(_, val) =>
            //   setFilters((prev) => ({ ...prev, organization: val ? val.id : '' }))
            // }
            // isOptionEqualToValue={(opt, val) => opt.id === val.id}
            // getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
            clearOnEscape
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Regesitered Site"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.7rem' } }}
              />
            )}
          />
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button variant="outlined" onClick={() => setFilters(initialFilters)} size="small">
              Reset
            </Button>
            <Button variant="contained" onClick={onApplyFilter} size="small">
              Apply
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterMoreContent;
