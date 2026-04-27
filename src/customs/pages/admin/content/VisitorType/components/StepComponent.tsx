import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  MenuItem,
  IconButton,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  TextField,
  FormControl,
  Select,
  Autocomplete,
  Box,
  Divider,
  Checkbox,
} from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import RenderDetailRows from '../RenderDetailRows';
import { memo, useEffect } from 'react';

interface StepContentProps {
  activeStep: number;
  formData: any;
  errors: any;
  sectionsData: any[];
  setSectionsData: any;
  customField: any[];
  selectedAccess: any[];
  selectedAnalytics: any;
  accessData: any[];
  documents: any[];
  documentIdentities: any[];
  analyticCctv: any[];
  setDeletedAccessIds: any;

  handleChange: any;
  handleAddDetail: any;
  handleDetailChange: any;
  handleDeleteDetail: any;
  handleReorder: any;
  handleChangeDocument: any;
  handleRemoveDocument: any;
  handleAddDocument: any;
  handleAddAccess: any;
  setFormData: any;
  setSelectedAccess: any;
  setSelectedAnalytics: any;
}

const StepContentComponent: React.FC<StepContentProps> = ({
  activeStep,
  formData,
  errors,
  sectionsData,
  setSectionsData,
  customField,
  selectedAccess,
  selectedAnalytics,
  accessData,
  documents,
  documentIdentities,
  handleChange,
  handleAddDetail,
  handleDetailChange,
  analyticCctv,
  setDeletedAccessIds,
  handleDeleteDetail,
  handleAddDocument,
  handleRemoveDocument,
  handleChangeDocument,
  handleReorder,
  handleAddAccess,
  setFormData,
  setSelectedAccess,
  setSelectedAnalytics,
}) => {
  const identityOptions = [
    { value: -1, label: '' },
    { value: 0, label: 'NIK' },
    { value: 1, label: 'KTP' },
    { value: 2, label: 'Passport' },
    { value: 3, label: 'Driver License' },
    { value: 4, label: 'Card Access' },
    { value: 5, label: 'Face' },
  ];

  const options = [
    { label: 'SPU', value: 'SPU' },
    { label: 'DC', value: 'DC' },
  ];

  if (activeStep === 0) {
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
            Visitor Type
          </Typography>
          <Grid size={12}>
            <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
              Name
            </CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name}
              // onChange={handleChange}
              onChange={(e) => {
                setFormData((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
              error={Boolean(errors.name)}
              helperText={errors.name || ''}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <CustomFormLabel htmlFor="org" sx={{ mt: 1 }}>
                Document
              </CustomFormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.need_document}
                    onChange={(e) => {
                      // console.log(e.target.checked);
                      setFormData((prev: any) => ({
                        ...prev,
                        need_document: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Need Document
                    <Tooltip title="When activated, this visitor type must present a document">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
            {formData.need_document && documents.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 1, mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Identity Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {documentIdentities.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={row.document_id}
                              onChange={(e) =>
                                handleChangeDocument(index, 'document_id', e.target.value)
                              }
                            >
                              {documents.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={row.identity_type}
                              onChange={(e) =>
                                handleChangeDocument(index, 'identity_type', Number(e.target.value))
                              }
                            >
                              {identityOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleRemoveDocument(index)}>
                            <IconTrash size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {documentIdentities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                          No document added yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Box sx={{ p: 2 }}>
                  <Button onClick={handleAddDocument} color="primary" variant="contained">
                    Add New
                  </Button>
                </Box>
              </TableContainer>
            )}
          </Grid>
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Access
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {/* <TableCell>#</TableCell> */}
                    <TableCell>Access</TableCell>
                    <TableCell align="center">Early Access</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedAccess.map((row, index) => (
                    <TableRow key={index}>
                      {/* <TableCell>{index + 1}</TableCell> */}

                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Autocomplete
                            size="small"
                            options={accessData}
                            getOptionLabel={(option: any) => option.name ?? ''}
                            value={accessData.find((a) => a.id === row.access_control_id) || null}
                            onChange={(_, newValue) => {
                              setSelectedAccess((prev: any[]) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, access_control_id: newValue?.id ?? '' } : r,
                                ),
                              );
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="Select access" />
                            )}
                            renderOption={(props, option) => {
                              const isDisabled = selectedAccess.some(
                                (x, i) => x.access_control_id === option.id && i !== index,
                              );

                              return (
                                <li
                                  // key={option.id}
                                  {...props}
                                  style={{
                                    opacity: isDisabled ? 0.5 : 1,
                                    pointerEvents: isDisabled ? 'none' : 'auto',
                                  }}
                                >
                                  {option.name}
                                </li>
                              );
                            }}
                          />
                        </FormControl>
                      </TableCell>

                      <TableCell align="center">
                        <Switch
                          checked={row.early_access}
                          onChange={(e) => {
                            setSelectedAccess((prev: any[]) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, early_access: e.target.checked } : r,
                              ),
                            );
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedAccess((prev: any[]) => {
                              const removed = prev[index];

                              if (removed?.id) {
                                setDeletedAccessIds((ids: string[]) => [...ids, removed.id!]);
                              }

                              return prev.filter((_, i) => i !== index);
                            });
                          }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {selectedAccess.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                        No access added yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Box sx={{ p: 2 }}>
                <Button variant="contained" onClick={handleAddAccess}>
                  Add New
                </Button>
              </Box>
            </TableContainer>
          </Grid>

          {formData.can_track_cctv && (
            <Grid size={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                System Analytic
              </Typography>
              <Autocomplete
                options={analyticCctv}
                value={selectedAnalytics}
                getOptionLabel={(option: any) => option.name ?? ''}
                onChange={(_, newValue) => {
                  if (!newValue) {
                    setSelectedAnalytics(null);
                    return;
                  }

                  setSelectedAnalytics({
                    id: undefined,
                    integration_id: newValue.integration_id,
                    name: newValue.name,
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select analytic system" />
                )}
              />
            </Grid>
          )}
          <Grid size={12}>
            <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
              Description
            </CustomFormLabel>
            <CustomTextField
              id="description"
              value={formData.description}
              onChange={(e: any) => {
                setFormData((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              error={Boolean(errors.description)}
              helperText={errors.description || ''}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel
              htmlFor="duration_visit"
              sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
            >
              Minimal Time Visit
              <Tooltip title="The minimum time of the visit in hours.">
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CustomFormLabel>
            <CustomTextField
              id="duration_visit"
              value={formData.duration_visit ?? ''}
              // onChange={handleChange}
              onChange={(e: any) => {
                setFormData((prev: any) => ({
                  ...prev,
                  duration_visit: e.target.value,
                }));
              }}
              error={Boolean(errors.duration_visit)}
              helperText={errors.duration_visit || ''}
              fullWidth
              type="text"
              // inputProps={{
              //   inputMode: 'numeric',
              //   pattern: '[0-9]*',
              // }}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel
              htmlFor="max_time_visit"
              sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
            >
              Maximal Time Visit
              <Tooltip title="The maximum time of the visit in hours.">
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CustomFormLabel>
            <CustomTextField
              id="max_time_visit"
              // value={formData.max_time_visit}
              value={formData.max_time_visit ?? ''}
              // onChange={handleChange}
              onChange={(e: any) => {
                setFormData((prev: any) => ({
                  ...prev,
                  max_time_visit: e.target.value,
                }));
              }}
              error={Boolean(errors.max_time_visit)}
              helperText={errors.max_time_visit ?? ''}
              fullWidth
              type="text"
              // inputProps={{
              //   inputMode: 'numeric',
              //   pattern: '[0-9]*',
              // }}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel htmlFor="period" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              Period ({formData.simple_period ? 'minutes' : 'days'})
              <Tooltip
                title={
                  formData.simple_period
                    ? 'The visit duration will be short and counted in minutes.'
                    : 'If set to 1 day, access will expire at the end of the next day.'
                }
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CustomFormLabel>
            <CustomTextField
              id="period"
              value={formData.period ?? ''}
              // onChange={handleChange}
              onChange={(e: any) => {
                setFormData((prev: any) => ({
                  ...prev,
                  period: e.target.value,
                }));
              }}
              error={Boolean(errors.period)}
              helperText={errors.period || ''}
              fullWidth
              type="text"
              // inputProps={{
              //   inputMode: 'numeric',
              //   pattern: '[0-9]*',
              // }}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel
              htmlFor="grace_time"
              sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
            >
              Grace Time
              <Tooltip title="The allowed time for the visitor to leave the premises after the visit duration ends.">
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CustomFormLabel>
            <CustomTextField
              id="grace_time"
              value={formData.grace_time ?? ''}
              // onChange={handleChange}
              onChange={(e: any) => {
                setFormData((prev: any) => ({
                  ...prev,
                  grace_time: e.target.value,
                }));
              }}
              error={Boolean(errors.grace_time)}
              helperText={errors.grace_time || ''}
              fullWidth
              type="text"
              // inputProps={{
              //   inputMode: 'numeric',
              //   pattern: '[0-9]*',
              // }}
            />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid size={{ xs: 6, xl: 12 }} mt={1}>
            <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Settings
            </Typography>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_parking}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        can_parking: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Can Parking
                    <Tooltip
                      title="Visitor will receive a parking slot and access to the parking area."
                      arrow
                    >
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 6, xl: 12 }} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_track_ble || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev: any) => {
                        const updated = { ...prev, can_track_ble: checked };
                        return updated;
                      });
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                    Can Tracking
                    <Tooltip
                      title="When turned on, this type will be able to track the visitor's location."
                      arrow
                    >
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 6, xl: 12 }} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_track_cctv || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev: any) => {
                        const updated = { ...prev, can_track_cctv: checked };
                        return updated;
                      });
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                    Can Analytic
                    <Tooltip title="">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 6, xl: 12 }} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.show_in_form}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        show_in_form: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Show In Form
                    <Tooltip title="When turned on, this type will show up and be available for selection in the portal form.">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={12} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_access}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        can_access: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Can Access
                    <Tooltip title="When turned on, the visitor will get access using a card, QR code, or BLE.">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={12} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.add_to_menu}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        add_to_menu: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Add To Menu
                    <Tooltip title="When turned on, this visitor type will be shown in the menu page.">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={12} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.direct_visit}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        direct_visit: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                    Direct Visit
                    <Tooltip title="When turned on, visitors can direct visit">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid size={12} mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.can_notification_arrival}
                  onChange={(e) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      can_notification_arrival: e.target.checked,
                    }));
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                  Can Notification Arrival
                  <Tooltip title="When turned on, the host will be notified when their visitor arrives.">
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </Grid>
          <Grid size={12} mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_enable}
                  onChange={(e) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      is_enable: e.target.checked,
                    }));
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  Status (Enable/Disable)
                  <Tooltip title="When turned on, this type will appear on the visitor portal for selection.">
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </Grid>
          <Grid size={3} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.vip}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        vip: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Vip
                    <Tooltip title="When turned on, special features for VIP visitors will be enabled.">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>

          <Grid size={3} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    // checked={formData.is_multi_site ?? false}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        is_multi_site: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Multi Site
                    <Tooltip title="When turned on, this visitor type can be used across multiple sites.">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>

          {/* <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.simple_visitor}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          simple_visitor: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Simple Visitor
                      <Tooltip title="When turned on, this visit type is treated as a short or minimal-duration visit.">
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid> */}

          <Grid size={12} mt={1}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.simple_visitor}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        simple_visitor: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Simple Visitor
                    <Tooltip title="When turned on, this visit type is treated as a short or minimal-duration visit.">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Grid>

          {formData.simple_visitor && (
            <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.simple_period}
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          simple_period: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Simple Period
                      <Tooltip title="When enabled, the duration of the visit is considered short and will be calculated in minutes.">
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
          )}

          <Divider sx={{ mt: 1 }} />

          <Grid size={12} mt={1}>
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1, mt: 2 }}
              >
                Special Visitor
              </Typography>
              <Autocomplete
                options={options}
                // value={value}
                // onChange={(event, newValue) => {
                //   setValue(newValue); // hanya 1 yang bisa dipilih
                // }}
                disableCloseOnSelect={false}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ mr: 0.5 }} />
                    {option.label}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label=""
                    placeholder="Select special visitor"
                    sx={{ mt: 1 }}
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  const currentSection = sectionsData[activeStep - 1];
  if (!currentSection) return null;

  return (
    <>
      <div>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={currentSection.is_document}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSectionsData((prev: any) =>
                    prev.map((section: any, idx: number) =>
                      idx === activeStep - 1 ? { ...section, is_document: checked } : section,
                    ),
                  );
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                Is Document
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentSection.can_multiple_used}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSectionsData((prev: any) =>
                    prev.map((section: any, idx: any) =>
                      idx === activeStep - 1 ? { ...section, can_multiple_used: checked } : section,
                    ),
                  );
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                Can Multi Purpose
                <Tooltip title="When enabled, this visit type can be used for multiple purposes">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Box>

        {!currentSection.is_document && !currentSection.can_multiple_used && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>

                <RenderDetailRows
                  title="visit_form"
                  data={currentSection.visit_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('visit_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                  onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={false}
                  sectionKey="visit_form"
                />

                <Button
                  size="small"
                  onClick={() => handleAddDetail('visit_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>

            {/* Pra Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography>
                <RenderDetailRows
                  title="pra_form"
                  data={currentSection.pra_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('pra_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                  onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={false}
                  sectionKey="pra_form"
                />

                <Button
                  size="small"
                  onClick={() => handleAddDetail('pra_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>

            {/* Checkout Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Checkout Form
                </Typography>
                <RenderDetailRows
                  title="checkout_form"
                  data={currentSection.checkout_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('checkout_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('checkout_form', index)}
                  onReorder={(newData: any) => handleReorder('checkout_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={false}
                  sectionKey="checkout_form"
                />

                <Button
                  size="small"
                  onClick={() => handleAddDetail('checkout_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>
          </>
        )}

        {currentSection.can_multiple_used && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>
                <RenderDetailRows
                  title="visit_form"
                  data={currentSection.visit_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('visit_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                  onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={true}
                  sectionKey="visit_form"
                />
                <Button
                  size="small"
                  onClick={() => handleAddDetail('visit_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>
            {/* Pra Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography>
                <RenderDetailRows
                  title="pra_form"
                  data={currentSection.pra_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('pra_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                  onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={true}
                  sectionKey="pra_form"
                />
                <Button
                  size="small"
                  onClick={() => handleAddDetail('pra_form' as const)}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>
            {/*Checkout Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Checkout Form
                </Typography>
                {/* <TableContainer component={Paper} sx={{ mb: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
  
                            <TableCell>Field Name</TableCell>
                            <TableCell>Display</TableCell>
                            <TableCell>Enabled</TableCell>
  
                            <TableCell>Mandatory</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {renderDetailRows(
                            currentSection.checkout_form || [],
                            (key, field, value) =>
                              handleDetailChange('checkout_form', key, field, value),
                            (key) => handleDeleteDetail('checkout_form', key),
                            true,
                            false,
                            true,
                            'checkout_form',
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer> */}
                <RenderDetailRows
                  title="checkout_form"
                  data={currentSection.checkout_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('checkout_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('checkout_form', index)}
                  onReorder={(newData: any) => handleReorder('checkout_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={true}
                  sectionKey="checkout_form"
                />
                <Button
                  size="small"
                  onClick={() => handleAddDetail('checkout_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>
          </>
        )}

        {currentSection.is_document && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>
                {/* <TableContainer component={Paper} sx={{ mb: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field Name</TableCell>
                            <TableCell>Display</TableCell>
                            <TableCell>Enabled</TableCell>
                            <TableCell>Mandatory</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {renderDetailRows(
                            currentSection.visit_form || [],
                            (index, field, value) =>
                              handleDetailChange('visit_form', index, field, value),
                            (index) => handleDeleteDetail('visit_form', index),
                            true,
                            true,
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer> */}
                <RenderDetailRows
                  title="visit_form"
                  data={currentSection.visit_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('visit_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                  onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  showMandatory={true}
                  isDocument={true}
                  canMultiple={false}
                  sectionKey="visit_form"
                />
                <Button
                  size="small"
                  onClick={() => handleAddDetail('visit_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>

            {/* pra Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography>
                {/* <TableContainer component={Paper} sx={{ mb: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field Name</TableCell>
                            <TableCell>Display</TableCell>
                            <TableCell>Enabled</TableCell>
                          
                            <TableCell>Mandatory</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {renderDetailRows(
                            currentSection.pra_form || [],
                            (index, field, value) =>
                              handleDetailChange('pra_form', index, field, value),
                            (index) => handleDeleteDetail('pra_form', index),
                            true,
                            true,
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer> */}
                <RenderDetailRows
                  title="pra_form"
                  data={currentSection.pra_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('pra_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                  onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  showMandatory={true}
                  isDocument={true}
                  canMultiple={false}
                  sectionKey="pra_form"
                />
                <Button
                  size="small"
                  onClick={() => handleAddDetail('pra_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </Button>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box mt={1}>
                {/* <Typography variant="subtitle1" fontWeight={600}>
                      Visit Form
                    </Typography> */}
                <Typography variant="subtitle1" fontWeight={600}>
                  Documents Visit Form
                </Typography>
                <CustomSelect
                  id="visitor_type_documents"
                  name="foreign_id"
                  value={String(currentSection.foreign_id || '')}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    const newVal = String(e.target.value);

                    setSectionsData((prev: any) =>
                      prev.map((section: any, idx: number) =>
                        idx === activeStep - 1 ? { ...section, foreign_id: newVal } : section,
                      ),
                    );
                  }}
                  fullWidth
                  required
                  variant="outlined"
                  renderValue={(selected: any) => {
                    const docName = documents.find((d) => String(d.id) === String(selected))?.name;
                    return docName ?? 'Pilih Dokumen Visit Form';
                  }}
                >
                  {(Array.isArray(documents) ? documents : []).map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Grid>

            <Grid size={12} sx={{ display: 'none' }}>
              <Box mt={1}>
                {/* <Typography variant="subtitle1" fontWeight={600}>
                      Pra Form
                    </Typography> */}
                <Typography variant="subtitle1" fontWeight={600}>
                  Documents Pra Form
                </Typography>
                <CustomSelect
                  id="visitor_type_documents"
                  name="foreign_id"
                  value={String(currentSection.pra_form?.[0]?.document_id || '')}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    const newVal = String(e.target.value);

                    setSectionsData((prev: any) =>
                      prev.map((section: any, idx: number) =>
                        idx === activeStep - 1 ? { ...section, foreign_id: newVal } : section,
                      ),
                    );
                  }}
                  fullWidth
                  required
                  variant="outlined"
                  renderValue={(selected: any) => {
                    const docName = documents.find((d) => String(d.id) === String(selected))?.name;
                    return docName ?? 'Pilih Dokumen Pra Registration';
                  }}
                >
                  {(Array.isArray(documents) ? documents : []).map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Grid>
          </>
        )}
      </div>
    </>
  );
};

export default memo(StepContentComponent);
