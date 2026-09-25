import {
  Box,
  Button,
  Typography,
  Grid2 as Grid,
  Divider,
  Autocomplete,
  Drawer,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
type FilterMoreContentProps = {
  open: any;
  onClose: any;
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onApply: () => void;
  onResetFilter: () => void;
};
const FilterApproval: React.FC<FilterMoreContentProps> = ({
  open,
  onClose,
  filters,
  setFilters,
  onApply,
  onResetFilter,
}) => {
  const approvalStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '60vw', sm: '40vw' } } }}
    >
      <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" gutterBottom>
            Filter Approval
          </Typography>
          <IconX onClick={onClose} style={{ cursor: 'pointer' }} />
        </Box>
        <Divider />
        <Grid container spacing={1} sx={{ p: 1 }}>
          {/* Approval Status */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ mt: { xs: 0, lg: 2 } }}> Approval Status </CustomFormLabel>
            <Autocomplete
              options={approvalStatusOptions}
              getOptionLabel={(option) => option.label}
              value={
                approvalStatusOptions.find((o) => o.value === filters['approval-status']) || null
              }
              onChange={(_, val) =>
                setFilters((prev: any) => ({ ...prev, 'approval-status': val?.value || undefined }))
              }
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  placeholder="Select Approval Status"
                  variant="outlined"
                  InputProps={{ ...params.InputProps, sx: { fontSize: '0.8rem' } }}
                />
              )}
            />
          </Grid>
          <Grid
            size={{ xs: 12 }}
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}
          >
            <Button variant="outlined" color="primary" onClick={onResetFilter}>
              Reset
            </Button>
            <Button variant="contained" color="primary" onClick={onApply}>
              Apply
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
};
export default FilterApproval;
