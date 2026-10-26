import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';

interface AssignTrackingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;

  availableAccounts: any[];
  assignedAccounts: any[];

  selectedAvailable: any;
  selectedAssigned: any;

  setSelectedAvailable: (value: any) => void;
  setSelectedAssigned: (value: any) => void;

  moveToAssigned: () => void;
  moveToUnassigned: () => void;
}

const AssignTrackingDialog = ({
  open,
  onClose,
  onSubmit,
  availableAccounts,
  assignedAccounts,
  selectedAvailable,
  selectedAssigned,
  setSelectedAvailable,
  setSelectedAssigned,
  moveToAssigned,
  moveToUnassigned,
}: AssignTrackingDialogProps) => {
  const handleClose = () => {
    onClose();
    setSelectedAvailable(null);
    setSelectedAssigned(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Assign Account Tracking
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} alignItems="center">
          {/* LEFT */}
          <Grid size={{ xs: 5 }}>
            <Box textAlign="center" mb={1}>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 4,
                  borderRadius: 2,
                  bgcolor: 'warning.light',
                  border: '1px solid',
                  borderColor: 'warning.main',
                }}
              >
                <Typography variant="subtitle1" sx={{ py: 1, fontWeight: 600 }}>
                  Unassign
                </Typography>
              </Box>
            </Box>

            <Paper variant="outlined">
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableAccounts.map((item) => (
                  <ListItemButton
                    key={item.id}
                    selected={selectedAvailable?.id === item.id}
                    onClick={() => setSelectedAvailable(item)}
                  >
                    <ListItemText primary={item.trackingSystemName} secondary={item.username} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* CENTER */}
          <Grid
            size={{ xs: 2 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mt={5}
            gap={2}
          >
            <Button variant="outlined" disabled={!selectedAvailable} onClick={moveToAssigned}>
              <IconArrowRight />
            </Button>

            <Button variant="outlined" disabled={!selectedAssigned} onClick={moveToUnassigned}>
              <IconArrowLeft />
            </Button>
          </Grid>

          {/* RIGHT */}
          <Grid size={{ xs: 5 }}>
            <Box
              sx={{
                width: 180,
                mx: 'auto',
                borderRadius: 2,
                bgcolor: 'success.light',
                border: '1px solid',
                borderColor: 'success.main',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" textAlign="center" sx={{ py: 1, fontWeight: 600 }}>
                Assigned
              </Typography>
            </Box>

            <Paper variant="outlined">
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {assignedAccounts.map((item) => (
                  <ListItemButton
                    key={item.tracking_ble_account_id}
                    selected={
                      selectedAssigned?.tracking_ble_account_id === item.tracking_ble_account_id
                    }
                    onClick={() => setSelectedAssigned(item)}
                  >
                    <ListItemText primary={item.link_type} secondary={item.tracking_ble_username} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTrackingDialog;
