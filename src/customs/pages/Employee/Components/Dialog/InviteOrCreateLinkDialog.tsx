import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';

type InviteOrCreateLinkDialogProps = {
  open: boolean;
  onClose: () => void;
  onPreregister: () => void;
  onCreateLink: () => void;
};

const InviteOrCreateLinkDialog = ({
  open,
  onClose,
  onPreregister,
  onCreateLink,
}: InviteOrCreateLinkDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Invite or Create Link
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          textAlign="center"
          py={3}
        >
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 2 }}
            onClick={onPreregister}
          >
            Preregister
          </Button>

          <Button variant="outlined" color="primary" fullWidth onClick={onCreateLink}>
            Share Link Invitation
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InviteOrCreateLinkDialog;
