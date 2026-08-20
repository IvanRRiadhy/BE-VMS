import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiKeyFormData, ApiKeySchema } from 'src/customs/api/Admin/Setting/schemas/apikey.schema';
import { IconX } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useEffect } from 'react';

interface ApiKeyFormDialogProps {
  open: boolean;
  editingId?: string | null;
  initialData?: ApiKeyFormData;
  onClose: () => void;
  onSubmit: (data: ApiKeyFormData) => void | Promise<void>;
}

const defaultValues: ApiKeyFormData = {
  name: '',
  description: '',
  is_active: false,
  expired_at: '',
  modules: [],
};

const API_KEY_MODULES = ['Employee', 'Visitor', 'Parking', 'Tracking'] as const;

const ApiKeyFormDialog = ({
  open,
  editingId,
  initialData,
  onClose,
  onSubmit,
}: ApiKeyFormDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(ApiKeySchema),
    defaultValues: initialData ?? defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialData ?? defaultValues);
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const submit = async (data: ApiKeyFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingId ? 'Edit API Key' : 'Add API Key'}

        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <form id="api-key-form" onSubmit={handleSubmit(submit)}>
          {/* Name */}
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Name
            </Typography>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  placeholder="Enter API key name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Box>

          {/* Description */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Description
            </Typography>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  placeholder="Enter API key description"
                  fullWidth
                  multiline
                  minRows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Box>

          {/* Expired At */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Expired At
            </Typography>

            <Controller
              name="expired_at"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.expired_at}
                  helperText={errors.expired_at?.message}
                />
              )}
            />
          </Box>

          {/* Modules */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Modules
            </Typography>

            <Controller
              name="modules"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  {API_KEY_MODULES.map((module) => (
                    <FormControlLabel
                      key={module}
                      control={
                        <Checkbox
                          checked={field.value.includes(module)}
                          onChange={(event) => {
                            const checked = event.target.checked;

                            const modules = checked
                              ? [...field.value, module]
                              : field.value.filter((item) => item !== module);

                            field.onChange(modules);
                          }}
                        />
                      }
                      label={module}
                    />
                  ))}
                </FormGroup>
              )}
            />

            {errors.modules && (
              <Typography variant="caption" color="error">
                {errors.modules.message}
              </Typography>
            )}
          </Box>

          {/* Status */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Status
            </Typography>

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  }
                  label={field.value ? 'Active' : 'Inactive'}
                />
              )}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting} variant="outlined">
          Cancel
        </Button>

        <Button type="submit" form="api-key-form" variant="contained" disabled={isSubmitting}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyFormDialog;
