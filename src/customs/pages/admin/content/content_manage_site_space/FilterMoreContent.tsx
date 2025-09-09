import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  FormControl,
  RadioGroup,
  Grid2 as Grid,
  Grid2,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface Filters {
  gender: number;
  organization: string;
  department: string;
  district: string;
  joinStart: string;
  exitEnd: string;
  statusEmployee: number;
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
    gender: 0,
    organization: '',
    department: '',
    district: '',
    joinStart: '',
    exitEnd: '',
    statusEmployee: 0,
  };

  return (
    <Box
      sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}
      onKeyDown={handleKeyDown}
    >
      <Typography variant="h6" gutterBottom>
        Employee Filter
      </Typography>

      <Grid2 container spacing={3}>
        {/* Join Dates */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinStart">
            <Typography variant="caption">Join Start</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="joinStart"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.joinStart}
            onChange={handleChange}
          />
        </Grid2>
        {/* <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinEnd">
            <Typography variant="caption">Join End :</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="joinEnd"
            type="date"
            fullWidth
            variant="outlined"
          />
        </Grid2> */}

        {/* Exit Dates */}
        {/* <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="exitStart">
            <Typography variant="caption">Exit Start :</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="exitStart"
            type="date"
            fullWidth
            variant="outlined"
          />
        </Grid2> */}

        {/* Actions */}
        <Grid2 size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              mt: 1,
              alignItems: 'center',
            }}
          >
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
