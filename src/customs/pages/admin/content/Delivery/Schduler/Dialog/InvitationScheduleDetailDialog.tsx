import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Grid2 as Grid,
  Avatar,
} from '@mui/material';
import { BASE_URL } from 'src/customs/api/interceptor';
import {
  IconUser,
  IconMail,
  IconClipboardText,
  IconUserCheck,
  IconCalendarTime,
  IconCalendarCheck,
  IconX,
} from '@tabler/icons-react';

import dayjs from 'dayjs';
import { Stack } from '@mui/system';

interface InvitationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  data?: any;
}

export default function InvitationScheduleDetailDialog({
  open,
  onClose,
  data,
}: InvitationDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Detail Calendar Invitation
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10 }}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {data ? (
          <Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }} display="flex" justifyContent="center">
                <Avatar
                  src={
                    `${BASE_URL}/cdn${data.selfie_image}` ||
                    `${BASE_URL}/cdn/${data.identity_image}`
                  }
                  alt={data.visitor_name}
                  sx={{ width: 130, height: 130, marginBottom: 2 }}
                />
              </Grid>
              {/* Name */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconUser size={20} />
                  <Box>
                    <Typography fontWeight={600}>Name</Typography>
                    <Typography>{data.visitor_name}</Typography>
                  </Box>
                </Stack>
              </Grid>
              {/* Email */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconMail size={20} />
                  <Box>
                    <Typography fontWeight={600}>Email</Typography>
                    <Typography>{data.visitor_email}</Typography>
                  </Box>
                </Stack>
              </Grid>
              {/* Agenda */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconClipboardText size={20} />
                  <Box>
                    <Typography fontWeight={600}>Agenda</Typography>
                    <Typography>{data.agenda}</Typography>
                  </Box>
                </Stack>
              </Grid>
              {/* Host */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconUserCheck size={20} />
                  <Box>
                    <Typography fontWeight={600}>Host</Typography>
                    <Typography>{data.host_name}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconUserCheck size={20} />
                  <Box>
                    <Typography fontWeight={600}>Status</Typography>
                    <Typography>{data.visitor_status}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconUserCheck size={20} />
                  <Box>
                    <Typography fontWeight={600}>Site</Typography>
                    <Typography>{data.tracking_ble?.[0]?.site_name || '-'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              {/* Parking slot */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconUserCheck size={20} />
                  <Box>
                    <Typography fontWeight={600}>Parking Slot</Typography>
                    <Typography>{data.parking_slot || '-'}</Typography>
                  </Box>
                </Stack>
              </Grid>{' '}
              {/* Parking Area */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconUserCheck size={20} />
                  <Box>
                    <Typography fontWeight={600}>Parking Area</Typography>
                    <Typography>{data.parking_area || '-'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              {/* Visit Start */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconCalendarTime size={20} />
                  <Box>
                    <Typography fontWeight={600}>Visit Start</Typography>
                    <Typography>
                      {dayjs
                        .utc(data.visitor_period_start)
                        .local()
                        .format('ddd, DD MMM YYYY HH:mm')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              {/* Visit End */}
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack direction="row" alignItems="start" spacing={1}>
                  <IconCalendarCheck size={20} />
                  <Box>
                    <Typography fontWeight={600}>Visit End</Typography>
                    <Typography>
                      {dayjs.utc(data.visitor_period_end).local().format('ddd, DD MMM YYYY HH:mm')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Typography>No data available</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
