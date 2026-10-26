import { Dialog, DialogContent, Typography, Box } from '@mui/material';
import { IconBellRingingFilled } from '@tabler/icons-react';

interface PendingInvitationDialogProps {
  open: boolean;
  pendingInvitationCount: number;
  onClose: () => void;
}

const PendingInvitationDialog = ({
  open,
  pendingInvitationCount,
  onClose,
}: PendingInvitationDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          py={3}
        >
          <IconBellRingingFilled size={60} color="orange" />

          <Typography variant="h5" mt={2} fontWeight={600}>
            {pendingInvitationCount > 1
              ? `${pendingInvitationCount} invitations must be completed`
              : '1 invitation must be completed'}
          </Typography>

          <Typography variant="body1" color="text.secondary" mt={1}>
            You must complete the invitation before it expires.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PendingInvitationDialog;
