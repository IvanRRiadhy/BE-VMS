import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import FormDialogPraregist from '../../Dialog/FormDialogPraregist';

type Props = {
  open: boolean;
  onClose: () => void;
  loadingAccess: boolean;
  selectedInvitationId?: string;
  invitationCode?: any[];
  containerRef?: any;
  fetchRelatedVisitorsByInvitationId: (id: string) => Promise<void>;
  registeredSite?: string;
};

const FillPraregistrationSingle: React.FC<Props> = ({
  open,
  onClose,
  loadingAccess,
  selectedInvitationId,
  invitationCode,
  containerRef,
  fetchRelatedVisitorsByInvitationId,
  registeredSite,
}) => {
  const getTargetId = () => selectedInvitationId ?? invitationCode?.[0]?.id;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" container={containerRef}>
      <DialogTitle>Fill Pra Registration Form</DialogTitle>

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

      {loadingAccess ? (
        <DialogContent
          dividers
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </DialogContent>
      ) : (
        <DialogContent dividers>
          {getTargetId() ? (
            <FormDialogPraregist
              id={getTargetId()}
              onClose={onClose}
              onSubmitted={async (formId?: string) => {
                onClose();

                const targetId = formId ?? getTargetId();

                if (!targetId) return;

                await fetchRelatedVisitorsByInvitationId(targetId);
              }}
              containerRef={containerRef}
              registeredSite={registeredSite}
            />
          ) : (
            <Typography variant="body2" textAlign="center" color="text.secondary">
              No invitation selected.
            </Typography>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default FillPraregistrationSingle;
