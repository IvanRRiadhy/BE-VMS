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



interface AreaDialogProps {
  open: boolean;
  districtForm: any;
  setDistrictForm: React.Dispatch<React.SetStateAction<any>>;
  handleCloseDialog: () => void;
  handleSaveArea: () => void;
  saving: boolean;
}

const AreaDialog = ({
  open,
  districtForm,
  setDistrictForm,
  handleCloseDialog,
  handleSaveArea,
  saving,
}: AreaDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={handleCloseDialog} transitionDuration={0}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Edit Area
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
        {!districtForm ? (
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
              <CustomTextField value={districtForm?.uid ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
              <CustomTextField value={districtForm?.name ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Code</CustomFormLabel>
              <CustomTextField value={districtForm?.code ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Type</CustomFormLabel>
              <CustomTextField value={districtForm?.type ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Location</CustomFormLabel>
              <CustomTextField value={districtForm?.location ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
              <CustomTextField value={districtForm?.integration_id ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Need Barier</CustomFormLabel>

              <Switch
                checked={Boolean(districtForm?.need_barier)}
                onChange={(e) =>
                  setDistrictForm((prev: any) => ({
                    ...prev,
                    need_barier: e.target.checked,
                  }))
                }
                color="primary"
                disabled
              />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Need Block</CustomFormLabel>

              <Switch
                checked={Boolean(districtForm?.need_block)}
                onChange={(e) =>
                  setDistrictForm((prev: any) => ({
                    ...prev,
                    need_block: e.target.checked,
                  }))
                }
                color="primary"
                disabled
              />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>

              <Switch
                checked={Boolean(districtForm?.active)}
                onChange={(e) =>
                  setDistrictForm((prev: any) => ({
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
          disabled={!districtForm || saving}
          onClick={handleSaveArea}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AreaDialog;
