import {
  Box,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface Filters {
  type: number; // -1 = All
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
  const handleChange = (e: SelectChangeEvent) => {
    const value = Number(e.target.value);
    setFilters((prev) => ({ ...prev, type: value }));
  };

  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filter Type Site Space
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 12 }} mt={3}>
          <FormControl fullWidth>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              name="type"
              value={String(filters.type)}
              label="Type"
              onChange={handleChange}
            >
              <MenuItem value="-1">All</MenuItem>
              <MenuItem value="0">Site</MenuItem>
              <MenuItem value="1">Building</MenuItem>
              <MenuItem value="2">Floor</MenuItem>
              <MenuItem value="3">Room</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={onApplyFilter}>
              Apply
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterMoreContent;
