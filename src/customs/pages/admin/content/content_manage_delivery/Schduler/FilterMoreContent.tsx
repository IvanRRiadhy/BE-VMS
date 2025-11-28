import React from 'react';
import { Box, Button, Grid2 as Grid, Typography, Autocomplete } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface Filters {
  visitor_type_id: string | null;
  host_id: string | null;
  site_id: string | null;
  time_access_id: string | null;
}

interface OptionItem {
  id: string;
  name: string;
}

type FilterMoreContentProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
  timeAccessData: OptionItem[];
  visitorTypeData: OptionItem[];
  siteData: OptionItem[];
  hostData: OptionItem[];
};

const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  timeAccessData,
  visitorTypeData,
  siteData,
  hostData,
}) => {
  const initialFilters: Filters = {
    visitor_type_id: null,
    host_id: null,
    site_id: null,
    time_access_id: null,
  };

  const handleAutocompleteChange = (key: keyof Filters, value: OptionItem | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ? value.id : null,
    }));
  };

  return (
    <Box sx={{ padding: { xs: 0.5, lg: 3 }, margin: 1.5, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Scheduler Filters
      </Typography>

      <Grid container spacing={3}>
        {/* Time Access */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="time_access_id" sx={{ mt: 0 }}>
            <Typography variant="caption">Time Access</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="time_access_id"
            options={timeAccessData ?? []}
            value={
              timeAccessData.find(
                (item) => item.id.toLowerCase() === filters.time_access_id?.toLowerCase(),
              ) || null
            }
            onChange={(_, newValue) => handleAutocompleteChange('time_access_id', newValue)}
            isOptionEqualToValue={(opt, val) => opt.id.toLowerCase() === val?.id.toLowerCase()}
            getOptionLabel={(opt) => opt.name ?? ''}
            renderInput={(params) => (
              <CustomTextField {...params} placeholder="Select Time Access" />
            )}
          />
        </Grid>

        {/* Visitor Type */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="visitor_type_id" sx={{ mt: 0 }}>
            <Typography variant="caption">Visitor Type</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="visitor_type_id"
            options={visitorTypeData ?? []}
            value={
              visitorTypeData.find(
                (item) => item.id.toLowerCase() === filters.visitor_type_id?.toLowerCase(),
              ) || null
            }
            onChange={(_, newValue) => handleAutocompleteChange('visitor_type_id', newValue)}
            isOptionEqualToValue={(opt, val) => opt.id.toLowerCase() === val?.id.toLowerCase()}
            getOptionLabel={(opt) => opt.name ?? ''}
            renderInput={(params) => (
              <CustomTextField {...params} placeholder="Select Visitor Type" />
            )}
          />
        </Grid>

        {/* Site */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
            <Typography variant="caption">Site</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="site_id"
            options={siteData ?? []}
            value={
              siteData.find((item) => item.id.toLowerCase() === filters.site_id?.toLowerCase()) ||
              null
            }
            onChange={(_, newValue) => handleAutocompleteChange('site_id', newValue)}
            isOptionEqualToValue={(opt, val) => opt.id.toLowerCase() === val?.id.toLowerCase()}
            getOptionLabel={(opt) => opt.name ?? ''}
            renderInput={(params) => <CustomTextField {...params} placeholder="Select Site" />}
          />
        </Grid>

        {/* Host */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="host_id" sx={{ mt: 0 }}>
            <Typography variant="caption">Host</Typography>
          </CustomFormLabel>
          <Autocomplete
            id="host_id"
            options={hostData ?? []}
            value={
              hostData.find((item) => item.id.toLowerCase() === filters.host_id?.toLowerCase()) ||
              null
            }
            onChange={(_, newValue) => handleAutocompleteChange('host_id', newValue)}
            isOptionEqualToValue={(opt, val) => opt.id.toLowerCase() === val?.id.toLowerCase()}
            getOptionLabel={(opt) => opt.name ?? ''}
            renderInput={(params) => <CustomTextField {...params} placeholder="Select Host" />}
          />
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button variant="outlined" onClick={() => setFilters(initialFilters)}>
              Reset
            </Button>
            <Button variant="contained" onClick={onApplyFilter}>
              Apply
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterMoreContent;
