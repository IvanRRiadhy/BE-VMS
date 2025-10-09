import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Skeleton,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Autocomplete,
  Divider,
  IconButton,
  Avatar,
  Paper,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconDownload, IconMail, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import FilterMoreContent from './FilterMoreContent';
import dayjs from 'dayjs';
import {
  getInvitation,
  getInvitationById,
  getInvitationRelatedVisitor,
} from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Download } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { updateExtend } from 'src/customs/api/admin';

// import { VisitorTrx } from 'src/customs/api/models/Visitor';

// export interface VisitorTrx {
//   id: string; // trx_visitor_id
//   visitor_id: string | null; // id master visitor
//   agenda: string | null;
//   host: string | null;
//   group_code: string | null;
//   group_name: string | null;
//   visitor_period_start: string | null;
//   visitor_period_end: string | null;
//   meeting_code: string | null;
//   self_only: boolean;
//   checkin_at: string | null;
//   checkout_at: string | null;
//   deny_at: string | null;
//   block_at: string | null;
//   unblock_at: string | null;
//   checkin_by: string | null;
//   checkout_by: string | null;
//   deny_by: string | null;
//   deny_reason: string | null;
//   block_by: string | null;
//   block_reason: string | null;
//   visitor_status: string; // ← ubah ke string ("PraCheckin", "Checkin", dst.)
//   invitation_created_at: string;
//   visitor_number: string;
//   visitor_code: string;
//   vehicle_plate: string | null; // dari "vehicle_plate_number"
//   vehicle_type: string | null;
//   remarks: string | null;
//   site_place: string | null;
//   parking_id: string | null;
//   identity_image: string | null;
//   selfie_image: string | null;
//   nda: string | null;
//   can_track_ble: boolean | null;
//   can_track_cctv: boolean | null;
//   can_parking: boolean | null;
//   can_access: boolean | null;
//   can_meeting: boolean | null;
//   tz: string | null;
//   is_group: boolean;

//   visitor: {
//     visitor_type: string;
//     identity_id: string;
//     name: string;
//     email: string;
//     organization: string | null;
//     gender: string | null;
//     address: string | null;
//     phone: string | null;
//     is_vip: boolean | null;
//     is_email_verified: boolean;
//     email_verification_send_at: string | null;
//     email_verification_token: string;
//     visitor_period_start: string | null;
//     visitor_period_end: string | null;
//     is_employee: boolean;
//     employee_id: string | null;
//     employee: any | null;
//     id: string;
//   };
// }
const Invitation = () => {
  const { token } = useSession();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tableData, setTableData] = useState<[]>([]);
  const [openExtendVisit, setOpenExtendVisit] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);

  // daftar opsi durasi dalam menit
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];

  // const handleExtend = () => {
  //   if (!selectedMinutes) return;
  //   console.log(`Extend visit by ${selectedMinutes} minutes`);
  //   // onClose();
  // };

  const cards = [
    {
      title: 'Total Invitation',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconMail,
      color: 'none',
    },
  ];

  const [agenda, setAgenda] = useState('');

  const tableDataInvitation = [
    {
      id: 1,
      name: 'Kunjungan',
      phone: '081234567890',
      registered_site: 'Gedung A',
      // is_used : true,
      // status: true,
      day: 'Mon, 14 Jul 2025 09:00 AM',
    },
  ];

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const [filters, setFilters] = useState<any>({
    site_id: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const agendaOptions = [
    'Meeting Tim A',
    'Presentasi Proyek',
    'Training Karyawan',
    'Rapat Bulanan',
  ];

  const [detailVisitorInvitation, setDetailVisitorInvitation] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // hitung tanggal
        const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        const end_date = dayjs().add(0, 'day').format('YYYY-MM-DD'); // +1 hari agar tanggal akhir ikut

        // if (isDataReady) {
        const res = await getInvitation(token as string, start_date, end_date);
        setTableData(res?.collection ?? []);

        // }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  const [invitationDetail, setInvitationDetail] = useState<any>({} as any);
  const [openInvitationDialog, setOpenInvitationDialog] = useState(false);

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenInvitationDialog(true);
    setInvitationDetail({} as any); // reset detail
    setDetailVisitorInvitation([]); // reset related visitor

    try {
      // 1️⃣ Ambil detail utama
      const res = await getInvitationById(id, token);
      setInvitationDetail(res?.collection ?? {});

      // 2️⃣ Ambil related visitor (opsional)
      try {
        const resAnotherVisitor = await getInvitationRelatedVisitor(id, token);
        setDetailVisitorInvitation(resAnotherVisitor?.collection ?? []);
      } catch (relatedErr) {
        console.warn('No related visitor data found or request failed.');
        setDetailVisitorInvitation([]);
      }

      console.log('Invitation Detail:', res?.collection);
    } catch (err: any) {
      console.error(err?.message || 'Failed to fetch invitation detail.');
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    // setErrors({});
    try {
      if (!token) return;
      if (selectedMinutes) {
        const result = await updateExtend(token, {
          id: invitationDetail?.id,
          period: selectedMinutes,
          apply_to_all: false,
        });
        console.log('extend: ', result);
      }
    } catch {
      console.error('Failed to extend visit.');
    }
  };

  return (
    <>
      <PageContainer title="Invitation" description="Invitation Page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* {isDataReady ? ( */}
              <DynamicTable
                overflowX={'auto'}
                data={tableData}
                isHavePagination={true}
                selectedRows={selectedRows}
                // defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
                // onPaginationChange={(page, rowsPerPage) => {
                //   setPage(page);
                //   setRowsPerPage(rowsPerPage);
                // }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveView={true}
                isHaveFilterMore={false}
                onView={(row: { id: string }) => {
                  handleView(row.id);
                }}
                isHaveHeader={false}
                isHavePdf={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
                // onCheckedChange={(selected) => setSelectedRows(selected)}
                // onEdit={(row) => {
                //   handleEdit(row.id);
                //   setEdittingId(row.id);
                // }}
                // onDelete={(row) => handleDelete(row.id)}
                // onBatchDelete={handleBatchDelete}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                // onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
              />
              {/* // ) : (
              //   <Card sx={{ width: '100%' }}>
              //     <Skeleton />
              //     <Skeleton animation="wave" />
              //     <Skeleton animation={false} />
              //   </Card>
              // )} */}
            </Grid>
          </Grid>
        </Box>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Send Invitation</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <Divider />
          <DialogContent>
            <form action="">
              <Stack spacing={2} marginTop={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Agenda
                    </CustomFormLabel>
                    <Autocomplete
                      freeSolo
                      options={agendaOptions}
                      value={agenda}
                      onChange={(_, newValue) => setAgenda(newValue || '')}
                      onInputChange={(_, newInputValue) => setAgenda(newInputValue)}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          id="agenda"
                          name="agenda"
                          placeholder="Choose or input your agenda"
                          fullWidth
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Name
                    </CustomFormLabel>
                    <CustomTextField
                      id="name"
                      name="name"
                      placeholder="Input your name"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Phone
                    </CustomFormLabel>
                    <CustomTextField
                      id="phone"
                      name="phone"
                      placeholder="Input your number phone"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Stack>
              <Button type="submit" variant="contained" sx={{ mt: 3 }} fullWidth>
                <Typography>Send Invitation</Typography>
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Detail */}
        <Dialog
          open={openInvitationDialog}
          onClose={() => setOpenInvitationDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Detail Invitation</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenInvitationDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <Divider />
          <DialogContent>
            <form action="">
              <Stack spacing={2} marginTop={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Visit Start
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.visitor_period_start
                        ? format(
                            new Date(invitationDetail.visitor_period_start),
                            'dd MMM yyyy, HH:mm',
                          )
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Visit End
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.visitor_period_end
                        ? format(
                            new Date(invitationDetail.visitor_period_end),
                            'dd MMM yyyy, HH:mm',
                          )
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Registered Site
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.site_place_name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Group Code
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.group_code}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Vehicle Plate
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.vehicle_plate_number || '-'}{' '}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      PIC Host
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.host_name}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Another Visitor
                    </CustomFormLabel>
                    {/* <Box>
                      <Avatar
                        sx={{ width: 45, height: 45 }}
                        alt="Remy Sharp"
                        src="/static/images/avatar/1.jpg"
                        style={{ marginTop: '10px' }}
                      />
                      <Typography sx={{ mt: 0.5 }} variant="subtitle1">
                        {invitationDetail?.visitor?.name || '-'}
                      </Typography>
                    </Box> */}
                    {detailVisitorInvitation?.length > 0 ? (
                      detailVisitorInvitation.map((visitor: any, index: number) => (
                        <Box key={index} display="flex" alignItems="center" mt={1.5}>
                          <Avatar
                            sx={{ width: 45, height: 45, mr: 1.5 }}
                            alt={visitor.name}
                            src={visitor.visitor_face || '/static/images/avatar/1.jpg'}
                          />
                          <Typography variant="subtitle1">{visitor.name || '-'}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, ml: 0.2 }}>
                        -
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6" sx={{ mt: 0 }} fontWeight={600}>
                        Access Pass
                      </Typography>
                      <IconButton
                        color="primary"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Box>

                    <Box p={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography sx={{ mt: 1 }} variant="subtitle1" fontWeight={500}>
                            Invitation Code
                          </Typography>
                          <Typography sx={{ mt: 0 }} variant="body1" fontWeight={400}>
                            {invitationDetail?.invitation_code}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ mt: 1 }} variant="subtitle1" fontWeight={500}>
                            Card
                          </Typography>
                          <Typography sx={{ mt: 0 }} variant="body1" fontWeight={400}>
                            {invitationDetail?.visitor_card || '-'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="center" mt={3}>
                        <Paper
                          elevation={4}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          {invitationDetail?.visitor_number ? (
                            <>
                              <QRCode
                                value={invitationDetail.visitor_number}
                                size={180}
                                style={{
                                  height: 'auto',
                                  width: '180px',
                                  borderRadius: 8,
                                }}
                              />
                              {/* <Typography
                                sx={{
                                  mt: 1.5,
                                  fontWeight: 600,
                                  fontSize: '0.9rem',
                                  color: 'text.primary',
                                }}
                                textAlign="center"
                              >
                                {invitationDetail.visitor_number}
                              </Typography> */}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              QR code tidak tersedia
                            </Typography>
                          )}
                        </Paper>
                      </Box>

                      <Box display="flex" gap={3} mb={2} mt={2} justifyContent={'center'}>
                        <Typography color="error" textAlign={'center'}>
                          {' '}
                          Tracked
                        </Typography>
                        <Typography color="error" textAlign={'center'}>
                          Low Battery
                        </Typography>
                      </Box>

                      <Typography variant="body2" mb={1} mt={1} textAlign={'center'}>
                        Show this whilte visiting
                      </Typography>
                      <Typography sx={{ mt: 1 }} variant="h6" fontWeight={500} textAlign={'center'}>
                        {invitationDetail?.visitor_code}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
              <Button
                onClick={() => setOpenExtendVisit(true)}
                variant="contained"
                sx={{ mt: 3 }}
                fullWidth
              >
                <Typography>Extend</Typography>
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openExtendVisit}
          onClose={() => setOpenExtendVisit(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Extend Visit</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenExtendVisit(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent dividers>
            <form onSubmit={handleExtend}>
              <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="center" sx={{ mb: 2 }}>
                {durationOptions.map((minutes) => (
                  <Chip
                    key={minutes}
                    label={`${minutes} min`}
                    clickable
                    color={selectedMinutes === minutes ? 'primary' : 'default'}
                    onClick={() => setSelectedMinutes(minutes)}
                    sx={{
                      fontWeight: selectedMinutes === minutes ? 600 : 400,
                      px: 1.5,
                    }}
                  />
                ))}
              </Box>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    Apply to another visitor
                  </Typography>
                }
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                Extend Visit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
};

export default Invitation;
