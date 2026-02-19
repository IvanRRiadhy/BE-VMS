import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Box,
  Grid,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Card,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean;
  onClose: () => void;
  employeeDetail: any;
  employeeLoading: boolean;
  employeeError?: string | null;
  axiosInstance2: any;
};

const EmployeeDetailDialog: React.FC<Props> = ({
  open,
  onClose,
  employeeDetail,
  employeeLoading,
  employeeError,
  axiosInstance2,
}) => {
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Detail PIC Host
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 1 }}>
        {employeeLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              {/* Avatar */}
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar
                  alt={employeeDetail?.name || 'Employee'}
                  src={
                    `${axiosInstance2.defaults.baseURL}/cdn${employeeDetail?.faceimage}` ||
                    '/static/images/avatar/1.jpg'
                  }
                  onError={(e: any) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/static/images/avatar/1.jpg';
                  }}
                  sx={{ width: 120, height: 120, my: 2 }}
                />
              </Grid>

              {/* Reusable Field */}
              {renderField('Name', employeeDetail?.name)}
              {renderField('Phone', employeeDetail?.phone)}
              {renderField('Email', employeeDetail?.email)}
              {renderField('Gender', employeeDetail?.gender)}
              {renderField('Address', employeeDetail?.address)}
              {renderField('Organization', employeeDetail?.organization_id)}
              {renderField('Department', employeeDetail?.department_id)}
              {renderField('District', employeeDetail?.district_id)}
              {renderField('Status', employeeDetail?.status_employee)}
              {renderField('Birth Date', employeeDetail?.birth_date)}
              {renderField('Join Date', employeeDetail?.join_date)}
              {renderField('Exit Date', employeeDetail?.exit_date)}
            </Grid>
          </Box>
        )}

        {!employeeLoading && employeeError && (
          <Box mt={2}>
            <Card sx={{ p: 2, color: 'error.main' }}>{employeeError}</Card>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const renderField = (label: string, value: any) => (
  <Grid item xs={12} md={6}>
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  </Grid>
);

export default EmployeeDetailDialog;
