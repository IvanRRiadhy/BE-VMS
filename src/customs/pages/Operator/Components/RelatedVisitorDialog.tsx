import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { IconUser, IconUsersGroup, IconX } from '@tabler/icons-react';

interface RelatedVisitorsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedVisitor: any;
  relatedVisitors: any[];
  formatDateTime: (value: any) => string;
}

const RelatedVisitorsDialog = ({
  open,
  onClose,
  selectedVisitor,
  relatedVisitors,
  formatDateTime,
}: RelatedVisitorsDialogProps) => {
  const [selectedRelatedVisitor, setSelectedRelatedVisitor] = useState<any>(null);

  useEffect(() => {
    if (!open) {
      setSelectedRelatedVisitor(null);
    }
  }, [open]);

  const otherVisitors =
    relatedVisitors?.filter(
      (visitor: any) => visitor.visitor_number !== selectedVisitor?.visitor_number,
    ) || [];

  const renderStatus = (status?: string) => {
    const label =
      status === 'Checkin'
        ? 'Check In'
        : status === 'Checkout'
          ? 'Check Out'
          : status === 'Block'
            ? 'Block'
            : status || '-';

    return (
      <Chip
        size="small"
        label={label}
        color={status === 'Checkin' ? 'success' : status === 'Checkout' ? 'error' : 'default'}
        sx={{
          ...(status === 'Checkin' && {
            backgroundColor: '#21c45d',
            color: '#fff',
          }),
          ...(status === 'Block' && {
            backgroundColor: '#000',
            color: '#fff',
          }),
        }}
      />
    );
  };

  const renderInfo = (label: string, value: any) => (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography fontWeight={600}>{value || '-'}</Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      transitionDuration={0}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: 'primary.main',
                color: '#fff',
              }}
            >
              <IconUsersGroup size={22} />
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={700}>
                Related Visitors
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedVisitor?.group_name || '-'}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          backgroundColor: 'grey.50',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            p: 2.5,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {selectedVisitor?.visitor_name || selectedVisitor?.name || '-'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedVisitor?.visitor_number || '-'}
              </Typography>
            </Box>

            {renderStatus(selectedVisitor?.visitor_status)}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{renderInfo('Agenda', selectedVisitor?.agenda)}</Grid>

            <Grid size={{ xs: 12, md: 6 }}>{renderInfo('Host', selectedVisitor?.host_name)}</Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {renderInfo('Visit Start', formatDateTime(selectedVisitor?.visitor_period_start))}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {renderInfo('Visit End', formatDateTime(selectedVisitor?.visitor_period_end))}
            </Grid>
          </Grid>
        </Box>

        {otherVisitors.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Related Visitors
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1,
              }}
            >
              {otherVisitors.map((visitor: any) => {
                const isSelected =
                  visitor.visitor_number === selectedRelatedVisitor?.visitor_number;

                return (
                  <Box
                    key={visitor.id || visitor.visitor_number}
                    onClick={() => setSelectedRelatedVisitor(visitor)}
                    sx={{
                      flexShrink: 0,
                      width: 75,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        mx: 'auto',
                        mb: 0.7,
                        bgcolor: isSelected ? 'primary.main' : 'grey.200',
                        color: isSelected ? 'primary.contrastText' : 'text.secondary',
                        border: '3px solid',
                        borderColor: isSelected ? 'primary.light' : 'transparent',
                        transition: 'all .15s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <IconUser size={23} />
                    </Avatar>

                    <Typography
                      variant="caption"
                      fontWeight={isSelected ? 700 : 500}
                      noWrap
                      display="block"
                    >
                      {visitor.visitor_name || visitor.name || '-'}
                    </Typography>

                    {visitor.is_host && (
                      <Typography variant="caption" color="primary" fontSize={10} display="block">
                        Host
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {selectedRelatedVisitor && (
          <Box
            mt={2}
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
              p: 2.5,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedRelatedVisitor.visitor_name || selectedRelatedVisitor.name || '-'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {selectedRelatedVisitor.visitor_number || '-'}
                </Typography>
              </Box>

              {renderStatus(selectedRelatedVisitor.visitor_status)}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo(
                  'Name',
                  selectedRelatedVisitor.visitor_name || selectedRelatedVisitor.name,
                )}
              </Grid> */}

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo(
                  'Phone',
                  selectedRelatedVisitor.phone || selectedRelatedVisitor.phone_number,
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo('Email', selectedRelatedVisitor.email)}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo(
                  'Organization',
                  selectedRelatedVisitor.organization || selectedRelatedVisitor.organization_name,
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo('Invited By', selectedRelatedVisitor.invited_by_name)}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo('Vehicle Type', selectedRelatedVisitor.vehicle_type)}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo('License Plate Number', selectedRelatedVisitor.vehicle_plate_number)}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo('Parking Slot', selectedRelatedVisitor.parking_slot)}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderInfo('Parking Area', selectedRelatedVisitor.parking_are)}
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RelatedVisitorsDialog;
