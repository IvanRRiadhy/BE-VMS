import React from 'react';
import { Box, Button, Grid2 as Grid, Typography, Autocomplete } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface Filters {
  site_id: string;
}

interface OptionItem {
  id: string;
  name: string;
}

type FilterMoreContentProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
  siteOptions: OptionItem[]; // ⬅️ tambahan: daftar site dari API
};

const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  siteOptions,
}) => {
  const handleReset = () => {
    setFilters({ site_id: '' });
  };

  return (
    <Box
      sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}
      onKeyDown={(e) => e.key === 'Enter' && onApplyFilter()}
    >
      <Typography variant="h5" gutterBottom>
        History Filter
      </Typography>

      <Grid container spacing={3}>
        {/* Site filter */}
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
            <Typography variant="caption">Registered Site</Typography>
          </CustomFormLabel>

          <Autocomplete
            id="site_id"
            size="small"
            options={siteOptions}
            value={siteOptions.find((s) => s.id === filters.site_id) || null}
            onChange={(_, val) => setFilters((prev) => ({ ...prev, site_id: val ? val.id : '' }))}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
            clearOnEscape
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Select Registered Site"
                variant="outlined"
                InputProps={{ ...params.InputProps, sx: { fontSize: '0.8rem' } }}
              />
            )}
          />
        </Grid>

        {/* Action buttons */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button variant="outlined" onClick={handleReset} size="small">
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
