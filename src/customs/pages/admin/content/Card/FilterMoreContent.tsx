import React from 'react';
import { Box, Typography, Button, Autocomplete } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface Filters {
  type: number;
  card_status: number;
}

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
};

const typeOptions = [
  { value: -1, label: 'All Types' },
  { value: 0, label: 'Non Access Card' },
  { value: 1, label: 'RFID' },
  { value: 2, label: 'BLE' },
];

const cardStatusOptions = [
  { value: -1, label: 'All Status' },
  { value: 0, label: 'Not Found' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'Lost' },
  { value: 3, label: 'Broken' },
  { value: 4, label: 'Not Return' },
];

const getOption = (options: any[], val: number) =>
  options.find((o) => o.value === val) || options[0];

const FilterMoreContent: React.FC<Props> = ({ filters, setFilters, onApplyFilter }) => {
  const initialFilters: Filters = {
    type: -1,
    card_status: -1,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Card Filter
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomFormLabel>
            <Typography variant="caption">Type</Typography>
          </CustomFormLabel>

          <Autocomplete
            size="small"
            options={typeOptions}
            getOptionLabel={(opt) => opt.label}
            value={getOption(typeOptions, filters.type)}
            onChange={(_, newVal) =>
              setFilters((prev) => ({
                ...prev,
                type: newVal ? newVal.value : -1,
              }))
            }
            renderInput={(params) => <CustomTextField {...params} placeholder="Select type" />}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomFormLabel>
            <Typography variant="caption">Status</Typography>
          </CustomFormLabel>

          <Autocomplete
            size="small"
            options={cardStatusOptions}
            getOptionLabel={(opt) => opt.label}
            value={getOption(cardStatusOptions, filters.card_status)}
            onChange={(_, newVal) =>
              setFilters((prev) => ({
                ...prev,
                card_status: newVal ? newVal.value : -1,
              }))
            }
            renderInput={(params) => <CustomTextField {...params} placeholder="Select status" />}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              mt: 2,
            }}
          >
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
