import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Card,
  Box,
  Avatar,
  Typography,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import {
  IconIdBadge2,
  IconPhone,
  IconBrandGmail,
  IconGenderBigender,
  IconCards,
  IconBuildingSkyscraper,
  IconBuilding,
  IconMapPin,
  IconCheck,
  IconCalendarStats,
} from '@tabler/icons-react';
import { axiosInstance2 } from 'src/customs/api/interceptor';

interface EmployeeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  employeeDetail: any;
  employeeLoading: boolean;
  employeeError: string | null;
}

const BASE_URL = axiosInstance2.defaults.baseURL;

const EmployeeDetailDialog: React.FC<EmployeeDetailDialogProps> = ({
  open,
  onClose,
  employeeDetail,
  employeeLoading,
  employeeError,
}) => {
  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Detail PIC Host
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 1 }}>
        {/* {!employeeLoading && employeeError && (
          <Box>
            <Card sx={{ p: 2, color: 'error.main' }}>{employeeError}</Card>
          </Box>
        )} */}

        {/* {!employeeLoading && !employeeError && employeeDetail && ( */}
          <Box>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              {/* Avatar */}
              <Grid size={12} display="flex" justifyContent="center" alignItems="center">
                <Avatar
                  alt={employeeDetail?.name || 'Employee'}
                  src={
                    `${BASE_URL}/cdn${employeeDetail?.faceimage}` ||
                    employeeDetail?.photo ||
                    employeeDetail?.avatar ||
                    '/static/images/avatar/1.jpg'
                  }
                  onError={(e: any) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/static/images/avatar/1.jpg';
                  }}
                  sx={{ width: 120, height: 120, my: 2 }}
                />
              </Grid>

              {/* Info Grid */}
              {[
                { icon: <IconIdBadge2 />, label: 'Name', value: employeeDetail?.name },
                { icon: <IconPhone />, label: 'Phone', value: employeeDetail?.phone || '-' },
                { icon: <IconBrandGmail />, label: 'Email', value: employeeDetail?.email || '-' },
                {
                  icon: <IconGenderBigender />,
                  label: 'Gender',
                  value: employeeDetail?.gender || '-',
                },
                { icon: <IconCards />, label: 'Address', value: employeeDetail?.address || '-' },
                {
                  icon: <IconBuildingSkyscraper />,
                  label: 'Organization',
                  value: employeeDetail?.organization?.name || '-',
                },
                {
                  icon: <IconBuilding />,
                  label: 'Department',
                  value: employeeDetail?.department?.name || '-',
                },
                {
                  icon: <IconMapPin />,
                  label: 'District',
                  value: employeeDetail?.district?.name || '-',
                },
                {
                  icon: <IconCheck />,
                  label: 'Status',
                  value: employeeDetail?.status_employee || '-',
                },
                {
                  icon: <IconCalendarStats />,
                  label: 'Birth Date',
                  value: employeeDetail?.birth_date || '-',
                },
                {
                  icon: <IconCalendarStats />,
                  label: 'Join Date',
                  value: employeeDetail?.join_date || '-',
                },
                {
                  icon: <IconCalendarStats />,
                  label: 'Exit Date',
                  value: employeeDetail?.exit_date || '-',
                },
              ].map((field, idx) => (
                <Grid
                  key={idx}
                  size={{ xs: 12, md: 6 }}
                  display="flex"
                  flexDirection="column"
                  alignItems="start"
                >
                  <Box display="flex" alignItems="start" gap={1}>
                    {field.icon}
                    <Box>
                      <CustomFormLabel htmlFor={field.label} sx={{ marginTop: 0 }}>
                        {field.label}
                      </CustomFormLabel>
                      <Typography variant="body1">{field.value}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        {/* )} */}

        {employeeLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <Typography variant="body2">Loading...</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(EmployeeDetailDialog);
