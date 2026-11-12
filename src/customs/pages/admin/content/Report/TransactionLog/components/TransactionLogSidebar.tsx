import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

import {
  IconDeviceFloppy,
  IconInfoCircle,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
  IconReport,
  IconTrash,
} from '@tabler/icons-react';

interface TransactionLogSidebarProps {
  formData: any;
  handleChange: (field: string, value: any) => void;

  isFilterCollapsed: boolean;
  onToggleCollapse: () => void;

  visitorOptions: any[];
  isFetchingVisitor: boolean;
  visitorSearch: string;
  setVisitorSearch: (value: string) => void;
  setPageVisitor: (page: number) => void;

  visitorStatusOptions: { id: string; label: string }[];
  sites: any[];
  allVisitorEmployee: any[];

  loading: boolean;
  onGenerate: () => void;
  onSave: () => void;
  onReset: () => void;
}

const TransactionLogSidebar = ({
  formData,
  handleChange,
  isFilterCollapsed,
  onToggleCollapse,
  visitorOptions,
  isFetchingVisitor,
  visitorSearch,
  setVisitorSearch,
  setPageVisitor,
  visitorStatusOptions,
  sites,
  allVisitorEmployee,
  loading,
  onGenerate,
  onSave,
  onReset,
}: TransactionLogSidebarProps) => {
  return (
    <Box
      sx={{
        width: {
          xs: '100%',
          md: isFilterCollapsed ? '48px' : '25%',
          xl: isFilterCollapsed ? '48px' : '16.666%',
        },
        flexShrink: 0,
        transition: 'width 300ms ease',
        overflow: 'hidden',
        alignSelf: 'stretch',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          p: isFilterCollapsed ? 1 : 2,
          height: '100%',
          overflowY: 'auto',
          minHeight: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isFilterCollapsed ? 'center' : 'space-between',
            mb: 1,
          }}
        >
          {!isFilterCollapsed && <Typography variant="h5">Transaction Log Report</Typography>}

          <Tooltip title={isFilterCollapsed ? 'Show Sidebar' : 'Hide Sidebar'} arrow>
            <IconButton size="small" onClick={onToggleCollapse}>
              {isFilterCollapsed ? (
                <IconLayoutSidebarRightCollapse />
              ) : (
                <IconLayoutSidebarLeftCollapse />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {!isFilterCollapsed && (
          <>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              {/* Report Name */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Report Name</CustomFormLabel>

                <TextField
                  fullWidth
                  size="small"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter Report Name"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Description</CustomFormLabel>

                <TextField
                  fullWidth
                  size="small"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Period */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Period</CustomFormLabel>

                <CustomSelect
                  fullWidth
                  value={formData.time_report}
                  onChange={(e: any) => handleChange('time_report', e.target.value)}
                  sx={{ mt: 0.5 }}
                >
                  <MenuItem value="all">Select Period</MenuItem>
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="CustomDate">Custom Date</MenuItem>
                </CustomSelect>
              </Grid>

              {/* Start Date */}
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Start Date</CustomFormLabel>
                  <Tooltip title='Select "Custom Date" to enable this field.' arrow>
                    <IconInfoCircle
                      style={{
                        color: '#9e9e9e',
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                </Box>

                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.start_date || ''}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={formData.time_report !== 'CustomDate'}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* End Date */}
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>End Date</CustomFormLabel>
                  <Tooltip title='Select "Custom Date" to enable this field.' arrow>
                    <IconInfoCircle
                      style={{
                        color: '#9e9e9e',
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                </Box>

                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.end_date || ''}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={formData.time_report !== 'CustomDate'}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Visitor */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Visitor</CustomFormLabel>

                <Autocomplete
                  size="small"
                  options={visitorOptions}
                  loading={isFetchingVisitor}
                  filterOptions={(options) => options}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  inputValue={visitorSearch}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input' || reason === 'clear') {
                      setVisitorSearch(value);
                      setPageVisitor(0);
                    }
                  }}
                  value={visitorOptions.find((item) => item.id === formData.visitor_id) ?? null}
                  onChange={(_, value) => {
                    handleChange('visitor_id', value?.id ?? null);
                    setVisitorSearch(value?.name ?? '');
                  }}
                  noOptionsText={
                    visitorSearch.length < 3 ? 'Type at least 3 characters' : 'No visitor found'
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} placeholder="Search Visitor" />}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Visitor Status */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Visitor Status</CustomFormLabel>

                <Autocomplete
                  multiple
                  size="small"
                  options={visitorStatusOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={visitorStatusOptions.filter((option) =>
                    formData.visitor_statuss?.includes(option.id),
                  )}
                  onChange={(_, values) =>
                    handleChange(
                      'visitor_statuss',
                      values.map((value) => value.id),
                    )
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.label}
                        size="small"
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select Visitor Status" />
                  )}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Sites */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Sites</CustomFormLabel>

                <Autocomplete
                  multiple
                  size="small"
                  options={sites}
                  value={sites.filter((site) =>
                    formData.sites
                      .map((id: string) => id.toString().toUpperCase())
                      .includes(site.id.toString().toUpperCase()),
                  )}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, values) =>
                    handleChange(
                      'sites',
                      values.map((value) => value.id),
                    )
                  }
                  renderInput={(params) => <TextField {...params} placeholder="Select Sites" />}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Host */}
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Host</CustomFormLabel>

                <Autocomplete
                  multiple
                  size="small"
                  options={allVisitorEmployee}
                  value={allVisitorEmployee.filter((employee) =>
                    formData.hosts.includes(employee.id),
                  )}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, values) =>
                    handleChange(
                      'hosts',
                      values.map((value) => value.id),
                    )
                  }
                  renderInput={(params) => <TextField {...params} placeholder="Select Host" />}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Checkboxes */}
              <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                <FormGroup>
                  <FormControlLabel
                    label="Previous"
                    control={
                      <Checkbox
                        checked={formData.previous}
                        onChange={(e) => handleChange('previous', e.target.checked)}
                      />
                    }
                  />
                </FormGroup>
              </Grid>

              <Grid size={{ xs: 12, md: 6, xl: 6 }}>
                <FormGroup>
                  <FormControlLabel
                    label="Preregister Done"
                    control={
                      <Checkbox
                        checked={formData.is_preregister_done}
                        onChange={(e) => handleChange('is_preregister_done', e.target.checked)}
                      />
                    }
                  />
                </FormGroup>
              </Grid>

              {/* Actions */}
              <Grid size={{ xs: 12 }} mt={2}>
                <Box display="flex" gap={1} flexDirection="column">
                  <Button
                    variant="contained"
                    onClick={onGenerate}
                    startIcon={<IconReport size={20} />}
                    disabled={loading}
                    size="medium"
                    sx={{ fontSize: 12 }}
                  >
                    Generate Report
                  </Button>

                  <Button
                    variant="contained"
                    onClick={onSave}
                    startIcon={<IconDeviceFloppy size={20} />}
                    disabled={loading}
                    size="medium"
                    sx={{
                      fontSize: 12,
                      minWidth: 150,
                      backgroundColor: '#16a765',
                      '&.Mui-disabled': {
                        backgroundColor: '#16a765',
                        color: '#fff',
                        opacity: 0.7,
                      },
                    }}
                  >
                    Save Generate
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={onReset}
                    startIcon={<IconTrash size={20} />}
                    disabled={loading}
                    size="medium"
                    sx={{ fontSize: 12, minWidth: 150 }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TransactionLogSidebar;
