import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Grid2 as Grid,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Typography,
  Autocomplete,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  Select,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconTrash } from '@tabler/icons-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;

  selectedRoleAccess: string;
  groupPermissionMap: Record<string, string[]>;

  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;

  permissionSites: Record<string, string[]>;
  setPermissionSites: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;

  organizationSiteOptions: any[];
  regsiteredSiteOptions: any[];
  visitorTypeOptions: any[];
  siteOptions: any[];

  permissionNeedSite: string[];
  getDropdownOptions: (perm: string) => any[];
  handleAddSiteAssignment: () => void;

  formatPermissionLabel: (value: string) => string;
  accessOptions: any[];
}

const DialogPermissionUserGroup: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  selectedRoleAccess,
  groupPermissionMap,
  formData,
  setFormData,
  permissionSites,
  setPermissionSites,
  organizationSiteOptions,
  regsiteredSiteOptions,
  siteOptions,
  visitorTypeOptions,
  permissionNeedSite,
  getDropdownOptions,
  formatPermissionLabel,
  handleAddSiteAssignment,
  accessOptions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          onClose();
        }
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ textTransform: 'capitalize' }}>
        Permission {selectedRoleAccess ? `- ${selectedRoleAccess}` : ''}
      </DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        {/* <Grid size={{ xs: 12 }}> */}
        <Grid container spacing={1}>
          {(groupPermissionMap[selectedRoleAccess] ?? []).map((perm) => {
            const checked = formData.permissions?.includes(perm);

            return (
              <Grid
                size={
                  perm === 'SiteAssignment' ||
                  perm === 'OperatorRegisterSite' ||
                  perm === 'ManageVisitor' ||
                  perm === 'ManageSiteScope' ||
                  perm === 'ManageAccessScope' ||
                  perm === 'ManageVisitorTypeScope' ||
                  perm === 'VisitorTypeAssignment' ||
                  perm === 'VisitorTypeAssignment' ||
                  perm === 'OrganizationAssignment'
                    ? { xs: 12 }
                    : { xs: 12, md: 6 }
                }
                key={perm}
              >
                <Box>
                  <FormControlLabel
                    labelPlacement="end"
                    control={
                      <Switch
                        checked={checked}
                        sx={{ m: 0 }}
                        onChange={(e) => {
                          const isChecked = e.target.checked;

                          setFormData((prev: any) => ({
                            ...prev,
                            permissions: isChecked
                              ? [...(prev.permissions ?? []), perm]
                              : prev.permissions.filter((p: any) => p !== perm),
                          }));

                          if (!isChecked) {
                            setPermissionSites((prev) => ({
                              ...prev,
                              [perm]: [],
                            }));
                          }
                        }}
                      />
                    }
                    label={formatPermissionLabel(perm)}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexDirection: 'row-reverse',
                      width: '100%',
                      m: 0,
                    }}
                  />

                  {checked && perm === 'ManageAccessScope' && (
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Access</TableCell>
                            <TableCell align="center">Can Grant</TableCell>
                            <TableCell align="center">Can Revoke</TableCell>
                            <TableCell align="center">Can Block</TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {formData.accesses.map((row: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                <FormControl size="small" fullWidth>
                                  <Select
                                    value={row.access_control_id}
                                    onChange={(e) => {
                                      const value = e.target.value as string;

                                      setFormData((prev: any) => ({
                                        ...prev,
                                        accesses: prev.accesses.map((r: any, i: number) =>
                                          i === index ? { ...r, access_control_id: value } : r,
                                        ),
                                      }));
                                    }}
                                  >
                                    {accessOptions.map((site) => (
                                      <MenuItem
                                        key={site.id}
                                        value={site.id}
                                        disabled={formData.accesses.some(
                                          (x: any, i: any) =>
                                            x.access_control_id === site.id && i !== index,
                                        )}
                                      >
                                        {site.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>

                              <TableCell align="center">
                                <Switch
                                  checked={row.can_grant}
                                  onChange={(e) => {
                                    const checked = e.target.checked;

                                    setFormData((prev: any) => ({
                                      ...prev,
                                      accesses: prev.accesses.map((r: any, i: number) =>
                                        i === index ? { ...r, can_grant: checked } : r,
                                      ),
                                    }));
                                  }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <Switch
                                  checked={row.can_revoke}
                                  onChange={(e) => {
                                    const checked = e.target.checked;

                                    setFormData((prev: any) => ({
                                      ...prev,
                                      accesses: prev.accesses.map((r: any, i: number) =>
                                        i === index ? { ...r, can_revoke: checked } : r,
                                      ),
                                    }));
                                  }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <Switch
                                  checked={row.can_block}
                                  onChange={(e) => {
                                    const checked = e.target.checked;

                                    setFormData((prev: any) => ({
                                      ...prev,
                                      accesses: prev.accesses.map((r: any, i: number) =>
                                        i === index ? { ...r, can_block: checked } : r,
                                      ),
                                    }));
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    setFormData((prev: any) => {
                                      const removed = prev.accesses[index];

                                      return {
                                        ...prev,
                                        accesses: prev.accesses.filter(
                                          (_: any, i: number) => i !== index,
                                        ),
                                        deleted_access_ids: removed?.id
                                          ? [...(prev.deleted_access_ids ?? []), removed.id]
                                          : prev.deleted_access_ids,
                                      };
                                    });
                                  }}
                                >
                                  <IconTrash size={18} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}

                          {formData.accesses.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                No site added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <Box sx={{ p: 2 }}>
                        <Button variant="contained" onClick={handleAddSiteAssignment}>
                          Add Access
                        </Button>
                      </Box>
                    </TableContainer>
                  )}

                  {/* ORGANIZATION */}
                  {checked && perm === 'OrganizationAssignment' && (
                    <Autocomplete
                      multiple
                      options={organizationSiteOptions}
                      getOptionLabel={(option: any) => option.name || ''}
                      value={organizationSiteOptions.filter((opt: any) =>
                        formData.organization.includes(opt.id),
                      )}
                      onChange={(_, newValues) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          organization: newValues.map((v: any) => v.id),
                        }));
                      }}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          placeholder="Select organization"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  )}

                  {/* REGISTERED SITE */}
                  {checked && perm === 'OperatorRegisterSite' && (
                    <Autocomplete
                      multiple
                      options={regsiteredSiteOptions}
                      getOptionLabel={(option: any) => option.name || ''}
                      value={regsiteredSiteOptions.filter((opt: any) =>
                        formData.registeredSite.includes(opt.id),
                      )}
                      onChange={(_, newValues) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          registeredSite: newValues.map((v: any) => v.id),
                        }));
                      }}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          placeholder="Select registered site"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  )}

                  {/* REGISTERED SITE */}
                  {checked && perm === 'ManageSiteScope' && (
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={siteOptions}
                      getOptionLabel={(option: any) => option.name || ''}
                      value={siteOptions.filter((site) => formData.manageSite.includes(site.id))}
                      onChange={(_, newValues) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          manageSite: newValues.map((v: any) => v.id),
                        }));
                      }}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          placeholder="Select sites"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  )}

                  {checked && perm === 'ManageVisitorTypeScope' && (
                    <Autocomplete
                      multiple
                      options={visitorTypeOptions}
                      getOptionLabel={(option: any) => option.name || ''}
                      value={visitorTypeOptions.filter((opt: any) =>
                        formData.visitorType.includes(opt.id),
                      )}
                      onChange={(_, newValues) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          visitorType: newValues.map((v: any) => v.id),
                        }));
                      }}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          placeholder="Select visitor type"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  )}

                  {/* GENERIC PERMISSION DROPDOWN */}
                  {checked &&
                    permissionNeedSite.includes(perm) &&
                    perm !== 'OrganizationAssignment' &&
                    perm !== 'ManageSiteScope' &&
                    perm !== 'ManageVisitorTypeScope' &&
                    perm !== 'ManageAccessScope' &&
                    perm !== 'OperatorRegisterSite' && (
                      <Autocomplete
                        multiple
                        options={getDropdownOptions(perm)}
                        disableCloseOnSelect
                        getOptionLabel={(option: any) => option.name || ''}
                        value={getDropdownOptions(perm).filter((opt: any) =>
                          (permissionSites[perm] ?? []).includes(opt.id),
                        )}
                        onChange={(_, newValues) => {
                          setPermissionSites((prev) => ({
                            ...prev,
                            [perm]: newValues.map((v: any) => v.id),
                          }));
                        }}
                        renderInput={(params) => (
                          <CustomTextField
                            {...params}
                            placeholder="Select values"
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    )}

                  {checked &&
                    perm === 'ManageVisitor' &&
                    (permissionSites['ManageVisitor'] ?? []).includes(
                      'OperatorVisitorSendNotificationArrival',
                    ) && (
                      <Accordion
                        defaultExpanded
                        disableGutters
                        sx={{
                          mt: 2,
                          boxShadow: 'none',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography fontWeight="semibold">
                            Operator Send Notification Arrival Permissions
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomFormLabel>Notification Subject</CustomFormLabel>
                              <CustomSelect size="small" fullWidth>
                                <MenuItem value="Host">Host</MenuItem>
                                <MenuItem value="OperatorVms">OperatorVms</MenuItem>
                                <MenuItem value="Head">Head</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                              </CustomSelect>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomFormLabel>Entity</CustomFormLabel>
                              <CustomSelect size="small" fullWidth />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                              <CustomFormLabel>Notification Type</CustomFormLabel>
                              <CustomSelect size="small" fullWidth>
                                <MenuItem value="1">Email</MenuItem>
                              </CustomSelect>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomFormLabel>To Name</CustomFormLabel>
                              <CustomTextField size="small" fullWidth placeholder="To Name" />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomFormLabel>To Email</CustomFormLabel>
                              <CustomTextField size="small" fullWidth placeholder="To Email" />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                              <CustomFormLabel>Description</CustomFormLabel>
                              <CustomTextField
                                multiline
                                rows={3}
                                fullWidth
                                size="small"
                                placeholder="Description for this notification permission"
                              />
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
        {/* </Grid> */}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPermissionUserGroup;
