import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Box,
  Grid,
  Avatar,
  Typography,
  Button,
  Card,
  CircularProgress,
} from '@mui/material';
import {
  IconIdBadge2,
  IconBrandGmail,
  IconPhone,
  IconHome,
  IconGenderMale,
  IconBuildingSkyscraper,
  IconQrcode,
  IconUsersGroup,
  IconUser,
  IconCalendarTime,
  IconCalendarEvent,
  IconNumbers,
  IconTicket,
  IconCheckupList,
  IconCar,
  IconLicense,
  IconCalendarUp,
  IconMapPin,   
  IconUserCheck,
  IconLogin2,
  IconLogout2,
  IconX,
  IconForbid2,
  IconQrcodeOff,
} from '@tabler/icons-react';
import moment from 'moment-timezone';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
interface VisitorDetailDialogProps {
  open: boolean;
  loading: boolean;
  error?: string | null;
  detail?: any;
  onClose: () => void;
  onConfirm: (action: 'checkin' | 'checkout' | 'deny' | 'block') => void;
}

const VisitorDetailDialog: React.FC<VisitorDetailDialogProps> = ({
  open,
  loading,
  error,
  detail,
  onClose,
  onConfirm,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const CDN_BASE = `${axiosInstance2}/cdn`;

  const formatLocalDateTime = (value?: string | null) => {
    if (!value) return '-';
    try {
      // Ambil timezone lokal device
      const localTz = moment.tz.guess();
      // Parse UTC dari backend → konversi ke lokal device
      const localTime = moment.utc(value).tz(localTz);
      return localTime.isValid() ? localTime.format('ddd, DD MMM YYYY HH:mm') : '-';
    } catch {
      return '-';
    }
  };
  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Visitor Detail
        <IconButton onClick={onClose}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {/* 🌀 Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {/* ❌ Error State */}
        {!loading && error && <Card sx={{ p: 2, color: 'error.main' }}>{error}</Card>}

        {/* ✅ Detail */}
        {!loading && !error && detail && (
          <Box>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1.5} mb={2}>
              <Avatar
                src={`${CDN_BASE}${detail.selfie_image}` || ''}
                alt={detail.name || 'visitor'}
                sx={{ width: 100, height: 100 }}
              />
              <Typography variant="h5" textAlign="center" noWrap={false}>
                {detail.visitor_name ?? '-'}
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={(e, newVal) => setTabValue(newVal)}
              variant="fullWidth"
            >
              <Tab label="Info" />
              <Tab label="Visit Information" />
              <Tab label="Purpose Visit" />
            </Tabs>

            {/* Tab Panels */}
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {[
                    { icon: <IconIdBadge2 />, label: 'Name', value: detail.visitor_name },
                    { icon: <IconBrandGmail />, label: 'Email', value: detail.visitor?.email },
                    { icon: <IconPhone />, label: 'Phone', value: detail.visitor_phone },
                    // { icon: <IconHome />, label: 'Address', value: detail.visitor?.address },
                    { icon: <IconGenderMale />, label: 'Gender', value: detail.visitor_gender },
                    {
                      icon: <IconBuildingSkyscraper />,
                      label: 'Organization',
                      value: detail.visitor?.organization,
                    },
                  ].map((item, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Box display="flex" gap={1} alignItems="flex-start">
                        {item.icon}
                        <Box>
                          <CustomFormLabel sx={{ mt: 0 }}>{item.label}</CustomFormLabel>
                          <Typography>{item.value ?? '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {[
                    { icon: <IconQrcode />, label: 'Visitor Code', value: detail.visitor_code },
                    { icon: <IconUsersGroup />, label: 'Group Code', value: detail.group_code },
                    { icon: <IconUser />, label: 'Group Name', value: detail.group_name },
                    {
                      icon: <IconNumbers />,
                      label: 'Visitor Number',
                      value: detail.visitor_number,
                    },
                    {
                      icon: <IconTicket />,
                      label: 'Invitation Code',
                      value: detail.invitation_code,
                    },
                    {
                      icon: <IconCheckupList />,
                      label: 'Visitor Status',
                      value: detail.visitor_status,
                    },
                    { icon: <IconCar />, label: 'Vehicle Type', value: detail.vehicle_type },
                    {
                      icon: <IconLicense />,
                      label: 'Vehicle Plate No.',
                      value: detail.vehicle_plate_number,
                    },
                  ].map((item, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Box display="flex" gap={1} alignItems="flex-start">
                        {item.icon}
                        <Box>
                          <CustomFormLabel sx={{ mt: 0 }}>{item.label}</CustomFormLabel>
                          <Typography>{item.value ?? '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {[
                    { icon: <IconCalendarEvent />, label: 'Agenda', value: detail.agenda },
                    { icon: <IconUserCheck />, label: 'PIC Host', value: detail.host_name },
                    {
                      icon: <IconCalendarTime />,
                      label: 'Period Start',
                      value: formatLocalDateTime(detail.visitor_period_start),
                    },
                    {
                      icon: <IconCalendarUp />,
                      label: 'Period End',
                      value: formatDateTime(
                        detail.visitor_period_end,
                        detail.extend_visitor_period,
                      ),
                    },
                    {
                      icon: <IconMapPin />,
                      label: 'Registered Site',
                      value: detail.site_place_name,
                    },
                  ].map((item, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Box display="flex" gap={1} alignItems="flex-start">
                        {item.icon}
                        <Box>
                          <CustomFormLabel sx={{ mt: 0 }}>{item.label}</CustomFormLabel>
                          <Typography>{item.value ?? '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Action Buttons */}
      {/* <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => onConfirm('checkin')}
          startIcon={<IconLogin2 />}
        >
          Check In
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onConfirm('checkout')}
          startIcon={<IconLogout2 />}
        >
          Check Out
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
          onClick={() => onConfirm('deny')}
          startIcon={<IconX />}
        >
          Deny
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#000' }}
          onClick={() => onConfirm('block')}
          startIcon={<IconForbid2 />}
        >
          Block
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default VisitorDetailDialog;
