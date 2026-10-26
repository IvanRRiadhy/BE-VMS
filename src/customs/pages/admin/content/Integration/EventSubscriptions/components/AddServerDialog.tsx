import React from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface EventSubscription {
  event_type: string;
  is_active: boolean;
}

interface ServerForm {
  integration_id: string;
  source_type: string;
  external_id: string;
  description: string;
  is_active: boolean;
  integration_event_subscriptions: EventSubscription[];
}

interface SourceTypeOption {
  label: string;
  value: string;
}

interface GroupTypeOption {
  label: string;
  value: string;
}

interface AddServerDialogProps {
  open: boolean;
  serverForm: ServerForm;
  onClose: () => void;
  integrationOptions?: any;
  loadingIntegrationOptions?: boolean;
  onChange: React.Dispatch<React.SetStateAction<ServerForm>>;
  onSubmit: () => void;
}

const AddServerDialog = ({
  open,
  serverForm,
  // sourceTypeOptions,
  // parkingGroupTypeOptions,
  // isParking,
  // isProwatch,
  // logdevOptions,
  // loadingLogdevs,
  integrationOptions,
  loadingIntegrationOptions,
  onClose,
  onChange,
  onSubmit,
}: AddServerDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 700,
          pb: 1,
        }}
      >
        Add Server
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {/* Integration */}
          <CustomFormLabel>Integration</CustomFormLabel>

          <TextField
            select
            fullWidth
            size="small"
            value={serverForm.integration_id}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                integration_id: e.target.value,
              }))
            }
          >
            {integrationOptions?.map((option: any) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          {/* Source */}
          {/* <CustomFormLabel>Source</CustomFormLabel>

          <TextField
            select
            fullWidth
            size="small"
            value={serverForm.source_type}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                source_type: e.target.value,
              }))
            }
          >
            {sourceTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>


          <CustomFormLabel>{isParking ? 'Group Type' : 'External ID'}</CustomFormLabel>

          {isParking ? (
            <TextField
              select
              fullWidth
              size="small"
              value={serverForm.external_id}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  external_id: e.target.value,
                }))
              }
            >
              <MenuItem value="">Select Group Type</MenuItem>

              {parkingGroupTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : isProwatch ? (
            <TextField
              select
              fullWidth
              size="small"
              value={serverForm.external_id}
              disabled={loadingLogdevs}
              onChange={(e) => {
                const selected = logdevOptions?.find((item) => item.log_dev_id === e.target.value);

                onChange((prev) => ({
                  ...prev,
                  external_id: selected?.log_dev_id ?? '',
                  description: selected?.description || selected?.name || '',
                }));
              }}
            >
              <MenuItem value="">
                {loadingLogdevs ? 'Loading Log Device...' : 'Select Log Device'}
              </MenuItem>

              {logdevOptions
                ?.filter((item) => item.active)
                .map((item) => (
                  <MenuItem key={item.log_dev_id} value={item.log_dev_id}>
                    {item.name} ({item.log_dev_id})
                  </MenuItem>
                ))}
            </TextField>
          ) : (
            <TextField
              size="small"
              fullWidth
              label="External ID"
              placeholder="e.g. CAM-LOBBY"
              value={serverForm.external_id}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  external_id: e.target.value,
                }))
              }
            />
          )} */}

          {/* Description */}
          {/* <CustomFormLabel>Description</CustomFormLabel>

          <TextField
            size="small"
            fullWidth
            label="Description"
            placeholder={isParking ? 'e.g. Parking Visitor' : 'e.g. Camera Lobby'}
            value={serverForm.description}
            disabled={isProwatch}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          /> */}

          {/* Status */}
          <CustomFormLabel>Status</CustomFormLabel>

          <FormControlLabel
            control={
              <Switch
                checked={serverForm.is_active}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
            }
            label="Active"
          />

          {/* Event Subscriptions */}
          {/* <CustomFormLabel>Event Subscriptions</CustomFormLabel>

          <Stack spacing={0.5}>
            {serverForm.integration_event_subscriptions.map((subscription, index) => (
              <Paper
                key={subscription.event_type}
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.7,
                  border: '1px solid #e4e8ee',
                  borderRadius: 0.8,
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {subscription.event_type}
                  </Typography>

                  <Switch
                    size="small"
                    checked={subscription.is_active}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        integration_event_subscriptions: prev.integration_event_subscriptions.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  is_active: e.target.checked,
                                }
                              : item,
                        ),
                      }))
                    }
                  />
                </Stack>
              </Paper>
            ))}
          </Stack> */}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          sx={{
            textTransform: 'none',
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServerDialog;
