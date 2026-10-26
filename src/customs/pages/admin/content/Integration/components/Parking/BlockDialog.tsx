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

interface BlockDialogProps {
  open: boolean;
  saving: boolean;
  memberForm: any;
  onClose: () => void;
  onSubmit: () => void;
  setMemberForm: React.Dispatch<React.SetStateAction<any>>;
}

const BlockDialog = ({
  open,
  saving,
  memberForm,
  onClose,
  onSubmit,
  setMemberForm,
}: BlockDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onClose} transitionDuration={0}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Edit Block
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={saving}
          sx={{ color: (t) => t.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }} dividers>
        {!memberForm ? (
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
              <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
              <CustomTextField value={memberForm?.name ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Block Code</CustomFormLabel>
              <CustomTextField value={memberForm?.block_code ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Serial</CustomFormLabel>
              <CustomTextField value={memberForm?.serial ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Area Id</CustomFormLabel>
              <CustomTextField value={memberForm?.area_id ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
              <CustomTextField value={memberForm?.integration_id ?? ''} fullWidth disabled />
            </Box>

            <Box>
              <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>

              <Switch
                checked={Boolean(memberForm?.active)}
                onChange={(e) =>
                  setMemberForm((prev: any) => ({
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
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!memberForm || saving}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockDialog;
