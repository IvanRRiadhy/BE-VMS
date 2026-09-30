import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface VehicleDialogProps {
  open: boolean;
  cardForm: any;
  setCardForm: React.Dispatch<React.SetStateAction<any>>;

  enabled: {
    vehicle_type: boolean;
    [key: string]: any;
  };

  vehicleOptions: any[];
  vehicleLoading: boolean;

  isBatchEdit: boolean;
  saving: boolean;

  handleCloseDialog: () => void;
  handleSaveVehicle: () => void;
}

const VehicleDialog = ({
  open,
  cardForm,
  setCardForm,
  enabled,
  vehicleOptions,
  vehicleLoading,
  isBatchEdit,
  saving,
  handleCloseDialog,
  handleSaveVehicle,
}: VehicleDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={handleCloseDialog} transitionDuration={0}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Edit Vehicle
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          disabled={saving}
          sx={{ color: (t) => t.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }} dividers>
        {!cardForm ? (
          <Box sx={{ py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            {/* Vehicle Type */}
            <Box>
              <CustomFormLabel htmlFor="vehicle_type" sx={{ mt: 0 }}>
                Vehicle Type
              </CustomFormLabel>

              <CustomSelect
                size="small"
                fullWidth
                value={cardForm?.vehicle_id ?? ''}
                onChange={(e: any) => {
                  const selectedVehicle = vehicleOptions.find(
                    (vehicle: any) => String(vehicle.id) === String(e.target.value),
                  );

                  setCardForm((prev: any) => ({
                    ...prev,
                    vehicle_id: selectedVehicle?.id ?? '',
                    vehicle_type: selectedVehicle?.value ?? '',
                  }));
                }}
                disabled={
                  isBatchEdit
                    ? !enabled.vehicle_type || saving || vehicleLoading
                    : saving || vehicleLoading
                }
              >
                {vehicleOptions.map((vehicle: any) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* Name */}
            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>

              <CustomTextField value={cardForm?.name ?? ''} fullWidth disabled />
            </Box>

            {/* Type */}
            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Type</CustomFormLabel>

              <CustomTextField value={cardForm?.type ?? ''} fullWidth disabled />
            </Box>

            {/* Slug */}
            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Slug</CustomFormLabel>

              <CustomTextField value={cardForm?.slug ?? ''} fullWidth disabled />
            </Box>

            {/* Integration Id */}
            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>

              <CustomTextField value={cardForm?.integration_id ?? ''} fullWidth disabled />
            </Box>

            {/* Uid */}
            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>

              <CustomTextField value={cardForm?.uid ?? ''} fullWidth disabled />
            </Box>

            {/* Active */}
            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>

              <Switch
                checked={Boolean(cardForm?.active)}
                onChange={(e) =>
                  setCardForm((prev: any) => ({
                    ...prev,
                    active: e.target.checked,
                  }))
                }
                color="primary"
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={!cardForm || saving}
          onClick={handleSaveVehicle}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleDialog;
