import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Typography,
  Stack,
  Divider,
  Box,
  Avatar,
  Paper,
  Button,
} from '@mui/material';
import moment from 'moment';
import { Download } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface InvitationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  invitationDetail: any;
  detailVisitorInvitation: any[];
  finalEndTime?: string;
  onExtend: () => void;
}

const InvitationDetailDialog: React.FC<InvitationDetailDialogProps> = ({
  open,
  onClose,
  invitationDetail,
  detailVisitorInvitation,
  finalEndTime,
  onExtend,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detail Invitation</DialogTitle>

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

      <DialogContent dividers sx={{ pt: 0 }}>
        <Stack spacing={2} mt={1}>
          {/* ===== INFO ===== */}
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <CustomFormLabel sx={{ mt: 0 }}>Visit Start</CustomFormLabel>
              <Typography>
                {invitationDetail?.visitor_period_start
                  ? moment
                      .utc(invitationDetail.visitor_period_start)
                      .local()
                      .format('dddd, DD MMMM YYYY, HH:mm')
                  : '-'}
              </Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <CustomFormLabel sx={{ mt: 0 }}>Visit End</CustomFormLabel>
              <Typography>
                {finalEndTime ? moment(finalEndTime).format('dddd, DD MMMM YYYY, HH:mm') : '-'}
              </Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <CustomFormLabel>Registered Site</CustomFormLabel>
              <Typography>{invitationDetail?.site_place_name || '-'}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <CustomFormLabel>Group Code</CustomFormLabel>
              <Typography>{invitationDetail?.group_code || '-'}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <CustomFormLabel>Vehicle Type</CustomFormLabel>
              <Typography>{invitationDetail?.vehicle_type || '-'}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <CustomFormLabel>Vehicle Plate</CustomFormLabel>
              <Typography>{invitationDetail?.vehicle_plate_number || '-'}</Typography>
            </Grid>

            <Grid xs={12} md={6}>
              <CustomFormLabel>PIC Host</CustomFormLabel>
              <Typography>{invitationDetail?.host_name || invitationDetail?.host || '-'}</Typography>
            </Grid>
          </Grid>

          <Divider />

          {/* ===== ANOTHER VISITOR ===== */}
          <Box>
            <CustomFormLabel sx={{ mb: 1, mt: 0 }}>Another Visitor</CustomFormLabel>
            <Box display="flex" gap={0.5} overflow="auto">
              {detailVisitorInvitation?.length ? (
                detailVisitorInvitation.map((v, i) => (
                  <Box key={i} minWidth={70} textAlign="center">
                    <Avatar
                      sx={{ width: 45, height: 45, mb: 0.5, mx: 'auto' }}
                      src={v.visitor_face || '/static/images/avatar/1.jpg'}
                    />
                    <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
                      {v.visitor?.name || '-'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* ===== ACCESS PASS ===== */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Access Pass
              </Typography>
              <IconButton
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <Download />
              </IconButton>
            </Box>

            <Box mt={2}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">Invitation Code</Typography>
                  <Typography>{invitationDetail?.invitation_code}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Card</Typography>
                  <Typography>{invitationDetail?.card?.[0]?.card_number || '-'}</Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="center" mt={3}>
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                  {invitationDetail?.visitor_number ? (
                    <QRCode value={invitationDetail.visitor_number} size={180} />
                  ) : (
                    <Typography color="text.secondary">QR code tidak tersedia</Typography>
                  )}
                </Paper>
              </Box>

              <Typography mt={2} textAlign="center">
                ID : {invitationDetail?.visitor_code}
              </Typography>
            </Box>
          </Box>

          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={onExtend}>
            Extend
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationDetailDialog;
