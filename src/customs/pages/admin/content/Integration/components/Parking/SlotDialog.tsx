import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';



interface SlotDialogProps {
  open: boolean;
  departmentForm: any;
  setDepartmentForm: React.Dispatch<React.SetStateAction<any>>;
  handleCloseDialog: () => void;
  handleSaveSlot: () => void;
  saving: boolean;
}

const SlotDialog = ({
  open,
  departmentForm,
  setDepartmentForm,
  handleCloseDialog,
  handleSaveSlot,
  saving,
}: SlotDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={handleCloseDialog} transitionDuration={0}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Edit Slot
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
        {!departmentForm ? (
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
              <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>

              <CustomTextField value={departmentForm?.uid ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>

              <CustomTextField value={departmentForm?.name ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Number</CustomFormLabel>

              <CustomTextField value={departmentForm?.number ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Host Id</CustomFormLabel>

              <CustomTextField value={departmentForm?.host_id ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>

              <CustomTextField value={departmentForm?.integration_id ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>

              <Switch
                checked={Boolean(departmentForm?.active)}
                onChange={(e) =>
                  setDepartmentForm((prev: any) => ({
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
        <Button onClick={handleCloseDialog} disabled={saving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!departmentForm || saving}
          onClick={handleSaveSlot}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotDialog;
