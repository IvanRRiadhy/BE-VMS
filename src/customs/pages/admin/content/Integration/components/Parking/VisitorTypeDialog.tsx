import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface VisitorTypeDialogProps {
  open: boolean;
  saving: boolean;
  isBatchEdit: boolean;
  enabled: {
    visitor_type_id: boolean;
  };
  organizationForm: any;
  orgOptions: Array<{ id: string; label: string }>;
  onClose: () => void;
  onSubmit: () => void;
  setOrganizationForm: React.Dispatch<React.SetStateAction<any>>;
  setEnabled: React.Dispatch<React.SetStateAction<any>>;
}

const VisitorTypeDialog = ({
  open,
  saving,
  isBatchEdit,
  enabled,
  organizationForm,
  orgOptions,
  onClose,
  onSubmit,
  setOrganizationForm,
  setEnabled,
}: VisitorTypeDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onClose} transitionDuration={0}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Edit Visitor Type
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={saving}
          sx={{ color: (t) => t.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {!organizationForm ? (
          <Box sx={{ py: 2 }}>Loading…</Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <CustomFormLabel htmlFor="visitor_type_id" sx={{ mt: 0 }}>
                  Visitor Type
                </CustomFormLabel>

                {isBatchEdit && (
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        size="small"
                        checked={enabled.visitor_type_id}
                        onChange={(e) =>
                          setEnabled((p: any) => ({
                            ...p,
                            visitor_type_id: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                  />
                )}
              </Box>

              <Autocomplete
                multiple
                fullWidth
                autoHighlight
                disablePortal
                options={orgOptions}
                value={orgOptions.filter((o) =>
                  (organizationForm?.visitor_type_id ?? []).includes(o.id),
                )}
                onChange={(_, newVal) =>
                  setOrganizationForm((p: any) => ({
                    ...p,
                    visitor_type_id: newVal.map((v) => v.id),
                  }))
                }
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    size="small"
                    disabled={isBatchEdit ? !enabled.visitor_type_id || saving : saving}
                  />
                )}
                disabled={isBatchEdit ? !enabled.visitor_type_id || saving : saving}
              />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>

              <Switch
                checked={Boolean(organizationForm?.active)}
                onChange={(e) =>
                  setOrganizationForm((prev: any) => ({
                    ...prev,
                    active: e.target.checked,
                  }))
                }
                color="primary"
              />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
              <CustomTextField value={organizationForm?.name ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Group Type</CustomFormLabel>
              <CustomTextField value={organizationForm?.group_type ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>

              <CustomTextField value={organizationForm?.integration_id ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>

              <CustomTextField value={organizationForm?.uid ?? ''} fullWidth disabled />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!organizationForm || saving}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorTypeDialog;
