import { Box, Divider, Typography, Grid2 as Grid, Button, TextField } from '@mui/material';
import React from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

type FilterMoreContentProps = {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onApplyFilter: () => void;
  onResetFilter: () => void;
};

const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  onResetFilter,
}) => {
  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>
          Filter History
        </Typography>
        {/* <IconX onClick={() => setShowDrawerFilterMore(false)} style={{ cursor: 'pointer' }} /> */}
      </Box>
      <Divider />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>Start Date</CustomFormLabel>
          <TextField
            fullWidth
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters((prev: any) => ({
                ...prev,
                start_date: e.target.value,
              }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}>End Date</CustomFormLabel>
          <TextField
            fullWidth
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters((prev: any) => ({
                ...prev,
                end_date: e.target.value,
              }))
            }
          />
        </Grid>
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

export default FilterMoreContent;
