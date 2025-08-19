import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  Paper,
  CircularProgress,
  TextField,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
  Button,
  Avatar,
  Typography,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import iconScanQR from '../../../../../assets/images/svgs/scan-qr.svg';
import iconAdd from '../../../../../assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from './FormWizardAddInvitation';
import FormWizardAddVisitor from './FormWizardAddVisitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateVisitorRequestSchema, Item } from 'src/customs/api/models/Visitor';
import Swal from 'sweetalert2';
import {
  getAllVisitorPagination,
  deleteVisitor,
  getEmployeeById,
  getVisitorById,
} from 'src/customs/api/admin';
import { CreateVisitorRequest } from 'src/customs/api/models/Visitor';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import {
  IconBadge,
  IconBrandGmail,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendarStats,
  IconCards,
  IconCheck,
  IconForbid2,
  IconGenderBigender,
  IconIdBadge2,
  IconLogin2,
  IconLogout,
  IconLogout2,
  IconMapPin,
  IconPhone,
  IconX,
} from '@tabler/icons-react';

type VisitorTableRow = {
  id: string;
  identity_id: string;
  name: string;
  visitor_type: string;
  email: string;
  organization: string;
  gender: string;
  address: string;
  phone: string;
  is_vip: string;
  // is_email_verified: string;
  // email_verification_send_at: string;
  visitor_period_start: string;
  visitor_period_end: string;
  employee_id: string;
};

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [tableRowVisitors, setTableRowVisitors] = useState<Item[]>([]);
  const [tableCustomVisitor, setTableCustomVisitor] = useState<VisitorTableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const defaultFormData = CreateVisitorRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (Object.keys(formDataAddVisitor).length > 0) {
      localStorage.setItem('unsavedVisitorData', JSON.stringify(formDataAddVisitor));
    }
  }, [formDataAddVisitor]);

  const cards = [
    { title: 'Total Visitor', subTitle: `${totalRecords}`, subTitleSetting: 10, color: 'none' },
    { title: 'Scan QR Visitor', subTitle: iconScanQR, subTitleSetting: 'image', color: 'none' },
    { title: 'Add New Visitor', subTitle: iconAdd, subTitleSetting: 'image', color: 'primary' },
    { title: 'Add Pre Registration', subTitle: iconAdd, subTitleSetting: 'image', color: 'none' },
  ];

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any>(null);

  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any>(null);

  // bikin CDN base dari baseURL axios
  const CDN_BASE = `${axiosInstance2?.defaults?.baseURL?.replace(/\/+$/, '') ?? ''}/cdn`;
  const resolveImg = (v?: string) => {
    if (!v) return '';
    // sudah absolute (http/https, data URL, blob)
    if (/^(https?:)?\/\/|^data:image\/|^blob:/.test(v)) return v;

    // bereskan path agar tidak dobel /cdn dan tidak double slash
    const path = v.replace(/^\/+/, '').replace(/^cdn\//, '');
    return `${CDN_BASE}/${path}`;
  };

  const handleDialogClose = () => {
    setOpenDialogIndex(null);
  };

  const handleEmployeeClick = async (employeeId: string) => {
    if (!employeeId) return;
    if (!token) return;

    setOpenEmployeeDialog(true);
    setEmployeeLoading(true);
    setEmployeeError(null);
    setEmployeeDetail(null);

    try {
      const res = await getEmployeeById(employeeId, token);
      // asumsi payload: { collection: {...employee} }
      setEmployeeDetail(res?.collection ?? null);
    } catch (err: any) {
      setEmployeeError(err?.message || 'Failed to fetch employee details.');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    setEmployeeDetail(null);
    setEmployeeError(null);
  };

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      const start = page * rowsPerPage;
      const response = await getAllVisitorPagination(
        token,
        start,
        rowsPerPage,
        sortColumn,
        searchKeyword,
      );
      setTableRowVisitors(response.collection);
      setTotalRecords(response.collection.length);
      setTotalFilteredRecords(response.RecordsFiltered);
      setIsDataReady(true);
      const rows = response.collection.map((item: any) => ({
        id: item.id,
        name: item.name,
        identity_id: item.identity_id,
        visitor_type: item.visitor_type.name,
        email: item.email,
        organization: item.organization,
        gender: item.gender,
        address: item.address,
        phone: item.phone,
        is_vip: item.is_vip,
        // is_email_verified: item.is_email_verified,
        visitor_period_start: item.visitor_period_start,
        visitor_period_end: item.visitor_period_end,
        employee_id: item.employee_id,
      }));

      if (rows) {
        setTableCustomVisitor(rows);
        setIsDataReady(true);
      }
      try {
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleDialogClose();
  };
  const handleAdd = () => {
    const saved = localStorage.getItem('unsavedVisitorData');
    let freshForm;
    if (saved) {
      freshForm = JSON.parse(saved);
    } else {
      freshForm = CreateVisitorRequestSchema.parse({});
      localStorage.setItem('unsavedVisitorData', JSON.stringify(freshForm));
    }
    setEdittingId('');
    setFormDataAddVisitor(freshForm);
    setPendingEditId('');
    handleOpenDialog();
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // handleCloseDialog();
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getVisitorById(token, id);
      // backend kamu ada yang taruh di res.collection, ada juga langsung body
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  const handleCloseVisitorDialog = () => {
    setOpenVisitorDialog(false);
    setVisitorDetail(null);
    setVisitorError(null);
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedVisitorData');

    if (pendingEditId) {
      const existingData = tableRowVisitors.find((item) => item.id === pendingEditId);
      if (existingData) {
        const parsedData = { ...CreateVisitorRequestSchema.parse(existingData), id: pendingEditId };
        setEdittingId(pendingEditId);
        setFormDataAddVisitor(parsedData);

        localStorage.setItem('unsavedVisitorData', JSON.stringify(parsedData));
        setPendingEditId(null);
        handleOpenDialog();
      } else {
        setFormDataAddVisitor(CreateVisitorRequestSchema.parse({}));
        setEdittingId('');
      }
    }
    setPendingEditId(null);
    handleCloseDialog();
    handleDialogClose();
  };

  return (
    <>
      <PageContainer title="Visitor" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(item, index) => {
                  setOpenDialogIndex(index);
                }}
              />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  isHavePagination={true}
                  overflowX={'auto'}
                  minWidth={2400}
                  stickyHeader={true}
                  data={tableCustomVisitor}
                  selectedRows={selectedRows}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveImage={true}
                  isHaveSearch={true}
                  isHaveFilter={true}
                  isHaveExportPdf={true}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={true}
                  isHaveVip={true}
                  // isVip={(row) => row.is_vip === true}
                  isHaveAddData={false}
                  isHaveHeader={true}
                  isHaveGender={true}
                  isHaveVisitor={true}
                  isActionVisitor={true}
                  stickyVisitorCount={2}
                  isHaveEmployee={true}
                  onEmployeeClick={
                    //   (employeeId) => {
                    //   console.log('employee_id diklik:', employeeId);
                    //   handleEmployeeClick(employeeId);
                    // }
                    () => {
                      setOpenEmployeeDialog(true);
                    }
                  }
                  isHaveVerified={true}
                  headerContent={{
                    title: '',
                    subTitle: 'Monitoring Data Visitor',
                    items: [
                      { name: 'all' },
                      { name: 'pre registration' },
                      { name: 'district' },
                      { name: 'checkin' },
                      { name: 'checkout' },
                      { name: 'denied' },
                      { name: 'blocked' },
                    ],
                  }}
                  defaultSelectedHeaderItem="all"
                  onHeaderItemClick={(item) => {
                    console.log('Item diklik:', item.name);
                  }}
                  onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                  onView={(row) => {
                    handleView(row.id);
                  }}
                  onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    handleAdd();
                  }}
                />
              ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* Add Pre registration */}
      <Dialog fullWidth maxWidth="lg" open={openDialogIndex === 3} onClose={handleDialogClose}>
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          Add Pra Registration
          <IconButton aria-label="close" onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: '0px' }}>
          <br />
          <FormWizardAddInvitation
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Employee Detail */}
      <Dialog fullWidth maxWidth="sm" open={openEmployeeDialog} onClose={handleCloseEmployeeDialog}>
        {/* <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          Employee Detail
          <IconButton onClick={handleCloseEmployeeDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle> */}
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {employeeLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress />
            </Box>
          )}

          {!employeeLoading && employeeError && (
            <Box>
              <Card sx={{ p: 2, color: 'error.main' }}>{employeeError}</Card>
            </Box>
          )}

          {!employeeLoading && !employeeError && employeeDetail && (
            <Box display="grid" gridTemplateColumns="110px 1fr" gap={2}>
              {/* Avatar / Foto */}
              <Box gridColumn="1 / 2">
                <Box
                  component="img"
                  src={
                    resolveImg(
                      employeeDetail.faceimage || employeeDetail.photo || employeeDetail.avatar,
                    ) || undefined
                  }
                  alt="employee"
                  onError={(e: any) => (e.currentTarget.style.display = 'none')}
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid #eee',
                  }}
                />
              </Box>

              {/* Info utama */}
              {/* <Box gridColumn="2 / 3">
                <Box fontWeight={700} fontSize={18} mb={0.5}>
                  {employeeDetail.name ?? '-'}
                </Box>
                <Box color="text.secondary" fontSize={14}>
                  {(employeeDetail.position || employeeDetail.job_title || '-') +
                    (employeeDetail.department?.name ? ` • ${employeeDetail.department.name}` : '')}
                </Box>
                <Box
                  mt={1.5}
                  display="grid"
                  gridTemplateColumns="140px 1fr"
                  rowGap={0.75}
                  columnGap={2}
                >
                  <Box color="text.secondary">Email</Box>
                  <Box>{employeeDetail.email ?? '-'}</Box>

                  <Box color="text.secondary">Phone</Box>
                  <Box>{employeeDetail.phone ?? employeeDetail.mobile ?? '-'}</Box>

                  <Box color="text.secondary">Employee ID</Box>
                  <Box>{employeeDetail.id ?? '-'}</Box>

                  <Box color="text.secondary">Company</Box>
                  <Box>
                    {employeeDetail.company?.name ?? employeeDetail.organization?.name ?? '-'}
                  </Box>

                  <Box color="text.secondary">Gender</Box>
                  <Box>
                    {employeeDetail.gender === 1
                      ? 'Male'
                      : employeeDetail.gender === 0
                      ? 'Female'
                      : employeeDetail.gender ?? '-'}
                  </Box>

                  {employeeDetail.address && (
                    <>
                      <Box color="text.secondary">Address</Box>
                      <Box>{employeeDetail.address}</Box>
                    </>
                  )}
                </Box>
              </Box> */}
            </Box>
          )}
          <Box>
            <Grid
              container
              spacing={2}
              justifyContent="center" // horizontal center
              alignItems="center" // vertical center
            >
              <Grid size={12} display="flex" justifyContent="center" alignItems="center">
                {/* avatar */}
                <Avatar
                  alt="Remy Sharp"
                  src="/static/images/avatar/1.jpg"
                  sx={{ width: 120, height: 120, my: 2 }}
                />
              </Grid>

              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconIdBadge2 />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Name
                    </CustomFormLabel>
                    <Typography variant="body1">Kurnia</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconBuildingSkyscraper />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Organization
                    </CustomFormLabel>
                    <Typography variant="body1">Kurnia</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconPhone />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Phone
                    </CustomFormLabel>
                    <Typography variant="body1">+62 81234567890</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconBrandGmail />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Email
                    </CustomFormLabel>
                    <Typography variant="body1">kurnia@gmail.com</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconGenderBigender />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Gender
                    </CustomFormLabel>
                    <Typography variant="body1">Male</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconCards />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Identity ID
                    </CustomFormLabel>
                    <Typography variant="body1">167305068920</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconBuildingSkyscraper />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Organization
                    </CustomFormLabel>
                    <Typography variant="body1">kurnia@gmail.com</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconBuilding />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Department
                    </CustomFormLabel>
                    <Typography variant="body1">kurnia@gmail.com</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconMapPin />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      District
                    </CustomFormLabel>
                    <Typography variant="body1">kurnia@gmail.com</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconCalendarStats />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Birth Date
                    </CustomFormLabel>
                    <Typography variant="body1">08/08/2023</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconCalendarStats />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Join Date
                    </CustomFormLabel>
                    <Typography variant="body1">08/08/2023</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                flexDirection="column"
                alignItems="start"
              >
                <Box display="flex" alignItems="start" gap={1}>
                  <IconCalendarStats />
                  <Box>
                    <CustomFormLabel htmlFor="name" sx={{ marginTop: 0 }}>
                      Exit Date
                    </CustomFormLabel>
                    <Typography variant="body1">08/08/2023</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Grid lain sama konsepnya */}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add New Visitor */}
      <Dialog
        fullWidth
        maxWidth="xl"
        open={openDialogIndex === 2}
        onClose={handleDialogClose}
        keepMounted
      >
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          Add New Visitor
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true); // ada perubahan, tampilkan dialog konfirmasi
              } else {
                handleCloseDialog(); // tidak ada perubahan, langsung tutup
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormWizardAddVisitor
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* QR Code */}
      <Dialog fullWidth maxWidth="xs" open={openDialogIndex === 1} onClose={handleDialogClose}>
        <DialogTitle display="flex">
          Scan QR Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleDialogClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TextField fullWidth label="Masukkan Kode QR" variant="outlined" size="small" />
          {/* button submit */}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Visitor Detail Dialog */}
      <Dialog fullWidth maxWidth="sm" open={openVisitorDialog} onClose={handleCloseVisitorDialog}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          Visitor Detail
          <IconButton onClick={handleCloseVisitorDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {visitorLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress />
            </Box>
          )}

          {!visitorLoading && visitorError && (
            <Card sx={{ p: 2, color: 'error.main' }}>{visitorError}</Card>
          )}

          {!visitorLoading && !visitorError && visitorDetail && (
            <Box>
              {/* Header foto + nama */}
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar
                  src={
                    resolveImg(
                      visitorDetail.faceimage || visitorDetail.photo || visitorDetail.avatar,
                    ) || undefined
                  }
                  alt={visitorDetail.name || 'visitor'}
                  sx={{ width: 72, height: 72 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {visitorDetail.name ?? '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {visitorDetail.visitor_type?.name ?? visitorDetail.visitor_type ?? '-'}
                  </Typography>
                </Box>
              </Box>

              {/* Grid info ringkas */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconIdBadge2 />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Identity ID</CustomFormLabel>
                      <Typography>{visitorDetail.identity_id ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconBrandGmail />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Email</CustomFormLabel>
                      <Typography>{visitorDetail.email ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconPhone />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Phone</CustomFormLabel>
                      <Typography>{visitorDetail.phone ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconBuildingSkyscraper />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Organization</CustomFormLabel>
                      <Typography>{visitorDetail.organization ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconGenderBigender />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Gender</CustomFormLabel>
                      <Typography>
                        {visitorDetail.gender === 1
                          ? 'Male'
                          : visitorDetail.gender === 0
                          ? 'Female'
                          : visitorDetail.gender ?? '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconMapPin />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>
                      <Typography>{visitorDetail.address ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconCalendarStats />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Visit Start</CustomFormLabel>
                      <Typography>{visitorDetail.visitor_period_start ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <IconCalendarStats />
                    <Box>
                      <CustomFormLabel sx={{ mt: 0 }}>Visit End</CustomFormLabel>
                      <Typography>{visitorDetail.visitor_period_end ?? '-'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {/* check in */}
          <Button
            variant="contained"
            color="success"
            // onClick={handleCheckIn}
            startIcon={<IconLogin2 />}
          >
            Check In
          </Button>
          {/* check out */}

          <Button
            variant="contained"
            color="error"
            // onClick={handleCheckOut}
            startIcon={<IconLogout2 />}
          >
            Check Out
          </Button>
          {/* Denied */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#f44336',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
            // onClick={handleCheckOut}
            startIcon={<IconX />}
          >
            Denied
          </Button>
          {/* Block */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#000' }}
            // onClick={handleCheckOut}
            startIcon={<IconForbid2 />}
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsaved Changes */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another site. Are you sure you want to discard them and edit
          this site?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 20000,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </>
  );
};

export default Content;
