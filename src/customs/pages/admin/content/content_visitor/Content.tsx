import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  CircularProgress,
  TextField,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
  Backdrop,
  Button,
  Avatar,
  Typography,
  Portal,
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
import { getAllVisitorPagination, getEmployeeById, getVisitorById } from 'src/customs/api/admin';
import { CreateVisitorRequest } from 'src/customs/api/models/Visitor';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { Scanner } from '@yudiel/react-qr-scanner';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FilterMoreContent from './FilterMoreContent';
import {
  IconBrandGmail,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendarStats,
  IconCards,
  IconClipboard,
  IconForbid2,
  IconGenderBigender,
  IconIdBadge2,
  IconLogin2,
  IconLogout2,
  IconMapPin,
  IconPhone,
  IconQrcode,
  IconUser,
  IconUsers,
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  // mode konfirmasi: "close-add" atau "edit"
  const [discardMode, setDiscardMode] = useState<'close-add' | 'edit' | null>(null);
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
    if (isFormChanged) {
      localStorage.setItem('unsavedVisitorData', JSON.stringify(formDataAddVisitor));
    } else {
      // kalau balik ke default, hapus jejak draft
      localStorage.removeItem('unsavedVisitorData');
    }
  }, [formDataAddVisitor, isFormChanged]);

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: 'Scan QR Visitor',
      icon: IconQrcode,
      subTitle: iconScanQR,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Add New Visitor',
      icon: IconUser,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Add Pre Registration',
      icon: IconClipboard,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
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

  // Qr Scanner
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false); // cegah multi-callback beruntun
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);

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
      try {
        freshForm = JSON.parse(saved);
      } catch {
        freshForm = CreateVisitorRequestSchema.parse({});
      }
    } else {
      // <── penting: pakai parse baru, bukan defaultFormData state lama
      freshForm = CreateVisitorRequestSchema.parse({});
    }

    setEdittingId('');
    setFormDataAddVisitor(freshForm);
    setPendingEditId(null);
    setOpenDialog(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // handleCloseDialog();
  };

  const openDiscardForCloseAdd = () => {
    setDiscardMode('close-add');
    setConfirmDialogOpen(true);
  };

  const openDiscardForEdit = (id: string) => {
    setPendingEditId(id);
    setDiscardMode('edit');
    setConfirmDialogOpen(true);
  };

  const handleCancelDiscard = () => {
    setConfirmDialogOpen(false);
    setDiscardMode(null);
    setPendingEditId(null);
  };

  const resetFormData = () => {
    localStorage.removeItem('unsavedVisitorData');
    setFormDataAddVisitor(defaultFormData);
    setEdittingId('');
  };

  const confirmDiscardAndClose = () => {
    resetFormData();
    setOpenDialog(false);
    setOpenDialogIndex(null);
    setConfirmDialogOpen(false);
    setDiscardMode(null);
  };

  const confirmDiscardAndEdit = () => {
    localStorage.removeItem('unsavedVisitorData');

    if (pendingEditId) {
      const existingData = tableRowVisitors.find((x) => x.id === pendingEditId);
      if (existingData) {
        const parsed = { ...CreateVisitorRequestSchema.parse(existingData), id: pendingEditId };
        setEdittingId(pendingEditId);
        setFormDataAddVisitor(parsed);
        // tidak usah tulis ke localStorage di sini; biarkan useEffect yang atur
        setOpenDialog(true); // buka form untuk edit
      }
    }

    setPendingEditId(null);
    setConfirmDialogOpen(false);
    setDiscardMode(null);
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

  // jenis aksi yang dikonfirmasi
  type VisitorAction = 'checkin' | 'checkout' | 'deny' | 'block';

  const [confirm, setConfirm] = React.useState<{
    type: VisitorAction;
    loading: boolean;
  } | null>(null);

  // label & warna tombol sesuai aksi
  const actionMeta: Record<
    VisitorAction,
    { title: string; ok: string; color: 'success' | 'error' | 'warning' | 'info' }
  > = {
    checkin: { title: 'Confirm Check In', ok: 'Check In', color: 'success' },
    checkout: { title: 'Confirm Check Out', ok: 'Check Out', color: 'error' },
    deny: { title: 'Confirm Deny', ok: 'Deny', color: 'warning' },
    block: { title: 'Confirm Block', ok: 'Block', color: 'info' },
  };

  const openConfirm = (type: VisitorAction) => setConfirm({ type, loading: false });
  const closeConfirm = () => {
    if (!confirm?.loading) setConfirm(null);
  };

  const runConfirmedAction = async () => {
    if (!confirm || !token || !visitorDetail?.id) return;
    setConfirm((c) => (c ? { ...c, loading: true } : c));

    try {
      // TODO: ganti ke API kamu:
      // if (confirm.type === 'checkin')  await checkInVisitor(token, visitorDetail.id);
      // if (confirm.type === 'checkout') await checkOutVisitor(token, visitorDetail.id);
      // if (confirm.type === 'deny')     await denyVisitor(token, visitorDetail.id);
      // if (confirm.type === 'block')    await blockVisitor(token, visitorDetail.id);

      // dummy delay biar kelihatan loading
      await new Promise((r) => setTimeout(r, 400));

      setConfirm(null); // tutup dialog konfirmasi
      setOpenVisitorDialog(false); // tutup dialog detail visitor
      setRefreshTrigger((p) => p + 1); // refresh tabel
    } catch (e) {
      // gagal -> matikan loading, tetap di dialog konfirmasi
      setConfirm((c) => (c ? { ...c, loading: false } : c));
    }
  };

  const [filters, setFilters] = useState<any>({
    visitor_type: '',
    site: '',
    status: '',
    created_at: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
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
                onImageClick={(_, index) => {
                  setOpenDialogIndex(index);
                }}
                size={{ xs: 12, lg: 3 }}
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
                  isHaveExportPdf={false}
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
                  onEmployeeClick={() => {
                    setOpenEmployeeDialog(true);
                  }}
                  isHaveVerified={true}
                  headerContent={{
                    title: '',
                    subTitle: 'Monitoring Data Visitor',
                    items: [
                      { name: 'all' },
                      { name: 'pre registration' },
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
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    handleAdd();
                  }}
                  isHaveFilterMore={true}
                  filterMoreContent={
                    <FilterMoreContent
                      filters={filters}
                      setFilters={setFilters}
                      onApplyFilter={handleApplyFilter}
                    />
                  }
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
      <Dialog fullWidth maxWidth="xl" open={openDialogIndex === 3} onClose={handleDialogClose}>
        <DialogTitle
          display="flex"
          justifyContent={'space-between'}
          alignItems="center"
          sx={{
            background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          }}
        >
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
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          Employee Detail
          <IconButton onClick={handleCloseEmployeeDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 1 }}>
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
        <DialogTitle
          display="flex"
          justifyContent={'space-between'}
          alignItems="center"
          sx={{
            background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          }}
        >
          Add Invitation Visitor
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                openDiscardForCloseAdd(); // <── ini saja
              } else {
                handleCloseDialog(); // aman langsung tutup
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
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openDialogIndex === 1}
        onClose={() => {
          // matikan torch kalau menyala (best-effort)
          try {
            const video = scanContainerRef.current?.querySelector(
              'video',
            ) as HTMLVideoElement | null;
            const stream = video?.srcObject as MediaStream | null;
            const track = stream?.getVideoTracks()?.[0];
            const caps = track?.getCapabilities?.() as any;
            if (track && caps?.torch && torchOn) {
              track.applyConstraints({ advanced: [{ facingMode: 'user' }] });
            }
          } catch {}

          setTorchOn(false);
          setFacingMode('environment');
          setQrMode('manual');
          setHasDecoded(false);
          setQrValue('');
          handleDialogClose();
        }}
      >
        <DialogTitle display="flex">
          Scan QR Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => {
              // matikan torch kalau menyala (best-effort)
              try {
                const video = scanContainerRef.current?.querySelector(
                  'video',
                ) as HTMLVideoElement | null;
                const stream = video?.srcObject as MediaStream | null;
                const track = stream?.getVideoTracks()?.[0];
                const caps = track?.getCapabilities?.() as any;
                if (track && caps?.torch && torchOn) {
                  track.applyConstraints({ advanced: [{ facingMode: 'user' }] });
                }
              } catch {}

              setTorchOn(false);
              setFacingMode('environment');
              setQrMode('manual');
              setHasDecoded(false);
              setQrValue('');
              handleDialogClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent>
          {/* Toggle mode */}
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant={qrMode === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setQrMode('manual')}
              size="small"
            >
              Manual
            </Button>
            <Button
              variant={qrMode === 'scan' ? 'contained' : 'outlined'}
              onClick={() => {
                setHasDecoded(false);
                setQrMode('scan');
              }}
              size="small"
            >
              Scan Kamera
            </Button>
          </Box>

          {/* MODE: MANUAL */}
          {qrMode === 'manual' && (
            <>
              <TextField
                fullWidth
                label="Masukkan Kode QR"
                variant="outlined"
                size="small"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    console.log('Submit manual:', qrValue);
                    // handleDialogClose();
                  }}
                  disabled={!qrValue}
                >
                  Submit
                </Button>
              </Box>
            </>
          )}

          {/* MODE: SCAN */}
          {qrMode === 'scan' && (
            <>
              <Box
                ref={scanContainerRef}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'black',
                  aspectRatio: '3 / 4', // proporsional untuk mobile
                }}
              >
                <Scanner
                  constraints={{ facingMode }}
                  onScan={(result: any) => {
                    if (!result) return;
                    if (hasDecoded) return; // cegah spam callback
                    setHasDecoded(true);
                    setQrValue(typeof result === 'string' ? result : String(result));
                  }}
                  onError={(error: any) => {
                    console.log('QR error:', error?.message || error);
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      border: 'none !important',
                    },
                  }}
                />

                <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {/* Kotak scan di tengah (lubang) */}
                  <Box
                    sx={{
                      // ukuran kotak scan (responsif)
                      '--scanSize': { xs: '70vw', sm: '290px' },

                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 'var(--scanSize)',
                      height: 'var(--scanSize)',
                      transform: 'translate(-50%, -50%)',

                      // ini yang bikin area luar gelap, tengah tetap terang
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                      borderRadius: 2, // 0 jika mau siku
                      outline: '2px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    {/* 4 corner, ditempel di dalam kotak agar selalu pas */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        '& .corner': {
                          position: 'absolute',
                          width: 24,
                          height: 24,
                          border: '3px solid #00e5ff',
                        },
                        '& .tl': { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' },
                        '& .tr': { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' },
                        '& .bl': { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' },
                        '& .br': { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' },
                      }}
                    >
                      <Box className="corner tl" />
                      <Box className="corner tr" />
                      <Box className="corner bl" />
                      <Box className="corner br" />
                    </Box>

                    {/* Laser animasi (bergerak di dalam kotak) */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 10,
                        right: 10,
                        height: 2,
                        top: 0,
                        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                        animation: 'scanLine 2s linear infinite',
                        '@keyframes scanLine': {
                          '0%': { transform: 'translateY(0)' },
                          '100%': { transform: 'translateY(calc(var(--scanSize) - 2px))' },
                        },
                      }}
                    />
                  </Box>
                </Box>
                {/* Kontrol: Flip & Torch */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    onClick={() =>
                      setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))
                    }
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={<FlipCameraAndroidIcon fontSize="small" />}
                  >
                    Flip
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const video = scanContainerRef.current?.querySelector(
                          'video',
                        ) as HTMLVideoElement | null;
                        const stream = video?.srcObject as MediaStream | null;
                        const track = stream?.getVideoTracks()?.[0];
                        const caps = track?.getCapabilities?.() as any;
                        if (track && caps?.torch) {
                          await track.applyConstraints({ advanced: [{ torch: !torchOn }] as any });
                          setTorchOn((t) => !t);
                        } else {
                          console.log('Torch not supported on this device.');
                        }
                      } catch (e) {
                        console.log('Torch toggle error:', e);
                      }
                    }}
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={
                      torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />
                    }
                  >
                    Torch
                  </Button>
                </Box>
              </Box>

              {/* Preview hasil + aksi */}
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Hasil: {qrValue || '-'}
                </Typography>
              </Box>

              <Box mt={2} display="flex" gap={1} justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setHasDecoded(false);
                    setQrValue('');
                  }}
                >
                  Reset
                </Button>
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => {
                      console.log('Submit scan:', qrValue);
                      // handleDialogClose();
                    }}
                    disabled={!qrValue}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </>
          )}
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
            onClick={() => openConfirm('checkin')}
            startIcon={<IconLogin2 />}
          >
            Check In
          </Button>

          {/* check out */}
          <Button
            variant="contained"
            color="error"
            // onClick={handleCheckOut}
            onClick={() => openConfirm('checkout')}
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
            onClick={() => openConfirm('deny')}
            startIcon={<IconX />}
          >
            Deny
          </Button>
          {/* Block */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#000' }}
            // onClick={handleCheckOut}
            onClick={() => openConfirm('block')}
            startIcon={<IconForbid2 />}
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirm */}
      <Dialog open={!!confirm} onClose={closeConfirm} fullWidth>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 0.2 }}>
          <DialogTitle>{confirm ? actionMeta[confirm.type].title : 'Confirm'}</DialogTitle>
          <IconButton onClick={closeConfirm}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            {`Are you sure you want to ${
              confirm ? actionMeta[confirm.type].ok.toLowerCase() : 'proceed'
            } `}
            <b>{visitorDetail?.name ?? 'this visitor'}</b>?
          </Typography>
          {/* btn close */}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={!!confirm?.loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            // color={confirm ? actionMeta[confirm.type].color : 'primary'}
            color="primary"
            onClick={runConfirmedAction}
            disabled={!!confirm?.loading}
            startIcon={confirm?.loading ? <CircularProgress size={16} /> : undefined}
          >
            {/* {confirm ? actionMeta[confirm.type].ok : 'Confirm'} */}
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsaved Changes */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelDiscard} fullWidth maxWidth="sm">
        <DialogTitle>Unsaved Changes</DialogTitle>

        <DialogContent>
          <Typography>Are you sure you want to discard your changes?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDiscard}>Cancel</Button>
          <Button
            onClick={discardMode === 'edit' ? confirmDiscardAndEdit : confirmDiscardAndClose}
            color="primary"
            variant="contained"
          >
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
      {/* <Portal>
        <Backdrop
          sx={{ color: 'primary', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal> */}
    </>
  );
};

export default Content;
