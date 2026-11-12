import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';

import { IconClock, IconX, IconBellRinging, IconCalendarEvent } from '@tabler/icons-react';

import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface VisitTimeReminderDialogProps {
  open: boolean;
  visitorPeriodEnd?: string;
  onClose: () => void;
}

const VisitTimeReminderDialog: React.FC<VisitTimeReminderDialogProps> = ({
  open,
  visitorPeriodEnd,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: 'warning.lighter',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'warning.light',
              color: 'warning.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClock size={25} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700}>
              Visit Time Reminder
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Your visit is about to end
            </Typography>
          </Box>
        </Box>

        <IconButton aria-label="close" onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Notification Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            mt: 1,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '6px solid',
              borderColor: 'warning.light',
            }}
          >
            <IconBellRinging size={54} stroke={1.7} color="#ED9B24" />
          </Box>
        </Box>

        {/* Reminder Message */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.light',
            mb: 3,
          }}
        >
          <Typography variant="body1" fontWeight={600} mb={0.5}>
            Your visit period will end in 5 minutes.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Please prepare to complete your visit and check out before your scheduled visit period
            ends.
          </Typography>
        </Box>

        {/* Visit Information */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <IconCalendarEvent size={22} color="gray" />

            <Box>
              <Typography variant="body2" color="text.secondary">
                Scheduled Visit End
              </Typography>

              <Typography variant="h6" fontWeight={700}>
                {formatDateTime(visitorPeriodEnd)}
              </Typography>
            </Box>
          </Box>

          <Chip label="Ending Soon" color="warning" size="small" sx={{ fontWeight: 600 }} />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          fullWidth
          size="large"
          sx={{
            borderRadius: 2,
            py: 1.2,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitTimeReminderDialog;
