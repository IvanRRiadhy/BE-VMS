import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
} from '@mui/material';
import { IconX, IconUserX, IconClock } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import Swal from 'sweetalert2';

export default function BlacklistVisitorDialog({ open, onClose }: any) {
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      site: 'PT Alpha Tower',
      blacklist_at: '2025-01-10 14:32',
      blacklist_reason: 'Melanggar aturan keamanan',
      blacklist_by: 'Security Admin',
      status: 'active',
      blacklist: true,
    },
    {
      id: 2,
      name: 'Sarah Smith',
      site: 'Mega Plaza',
      blacklist_at: '2025-01-08 10:15',
      blacklist_reason: 'Perilaku tidak kooperatif',
      blacklist_by: 'Building Manager',
      status: 'inactive',
      blacklist: false,
    },
  ];

  // ===== Summary Count =====
  const totalBlacklist = dummyData.filter((x) => x.status === 'active').length;
  const totalPending = dummyData.filter((x) => x.status === 'inactive').length;

  const handleActionBlacklist = async (row: any) => {
    if (!row.blacklist) {
      await Swal.fire({
        icon: 'warning',
        title: 'Blacklist Visitor',
        text: 'Blacklist action is not allowed for this visitor.',
        confirmButtonText: 'OK',
      });
      return;
    }

    await handleBlacklistStatus(row.id);
  };

  const handleBlacklistStatus = async (id: number) => {
    if (!id) {
      showSwal('error', 'Visitor ID not found.');
      return;
    }

    try {
      const res = await Swal.fire({
        icon: 'warning',
        title: 'Blacklist Visitor',
        text: 'Are you sure you want to blacklist this visitor?',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        reverseButtons: true,
        confirmButtonColor: '#16a34a',
        customClass: {
          title: 'swal2-title-custom',
          popup: 'swal-popup-custom',
          closeButton: 'swal-close-red',
        },
      });

      if (!res.isConfirmed) return;

      // await blacklistVisitor(token, id);

      showSwal('success', 'Visitor has been successfully blacklisted.');
    } catch (err) {
      showSwal('error', 'Failed to blacklist visitor.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Blacklist Visitor</DialogTitle>

      <IconButton
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
        onClick={onClose}
      >
        <IconX />
      </IconButton>

      <Divider />

      <DialogContent>
        {/* ===== Summary Card ===== */}
        <Grid container spacing={3} mb={2}>
          <Grid size={6}>
            <Card sx={{ borderRadius: 3, bgcolor: 'error.light' }}>
              <CardContent sx={{ p: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      backgroundColor: 'error.light',
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <IconUserX color="red" />
                  </Box>

                  <Box>
                    <Typography variant="h6" color="text.secondary" fontWeight={'semibold'}>
                      Active Blacklist
                    </Typography>

                    <Typography variant="h5" fontWeight={600}>
                      {totalBlacklist}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={6}>
            <Card sx={{ borderRadius: 3, bgcolor: 'warning.light' }}>
              <CardContent sx={{ p: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      backgroundColor: 'warning.light',
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <IconClock color="orange" />
                  </Box>

                  <Box>
                    <Typography variant="h6" color="text.secondary" fontWeight={'semibold'}>
                      Non Active Blacklist
                    </Typography>

                    <Typography variant="h5" fontWeight={600}>
                      {totalPending}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <DynamicTable
          data={dummyData}
          isHaveSearch
          isBlacklistAction
          isHaveAction
          onBlacklist={handleActionBlacklist}
          isHaveChecked
          isNoActionTableHead
        />
      </DialogContent>
    </Dialog>
  );
}
