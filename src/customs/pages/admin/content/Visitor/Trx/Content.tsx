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
  Button,
  Avatar,
  Typography,
  Portal,
  Autocomplete,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import type { AlertColor } from '@mui/material/Alert';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import iconScanQR from 'src/assets/images/svgs/scan-qr.svg';
import iconAdd from 'src/assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from './FormWizardAddInvitation';
import FormWizardAddVisitor from './FormWizardAddVisitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  Item,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllSite,
  getAllVisitorPagination,
  getAllVisitorType,
  getEmployeeById,
  getRegisteredSite,
  getVisitorById,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import FilterMoreContent from './FilterMoreContent';
import {
  IconArrowRight,
  IconCamera,
  IconClipboard,
  IconQrcode,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import EmployeeDetailDialog from '../Dialog/EmployeeDetailDialog';
import VisitorDetailDialog from '../Dialog/VisitorDetailDialog';
import { getInvitationCode } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import DetailVisitorDialog from 'src/customs/pages/Operator/Dialog/DetailVisitorDialog';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useNavigate } from 'react-router';
import RegisteredSiteDialog from './components/Dialog/RegisteredSiteDialog';
import QrScannerDialog from './components/Dialog/QrScannerDialog';

type VisitorTableRow = {
  id: string;
  identity_id: string;
  name: string;
  visitor_type: string;
  email: string;
  organization: string;
  gender: string;
  phone: string;
  // is_vip: string;
  visitor_period_start: string;
  visitor_period_end: string;
  host: string;
};

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [discardMode, setDiscardMode] = useState<'close-add' | 'edit' | null>(null);
  const [tableRowVisitors, setTableRowVisitors] = useState<Item[]>([]);
  const [tableCustomVisitor, setTableCustomVisitor] = useState<VisitorTableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
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
      title: 'Add Invitation',
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

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const defaultFormData = CreateVisitorRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (isFormChanged) {
      localStorage.setItem('unsavedVisitorData', JSON.stringify(formDataAddVisitor));
    } else {
      localStorage.removeItem('unsavedVisitorData');
    }
  }, [formDataAddVisitor, isFormChanged]);

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [visitorType, setVisitorType] = useState<any[]>([]);
  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any>(null);
  const navigate = useNavigate();
  // Registered Site
  const [siteData, setSiteData] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  // Qr Scanner
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [vtLoading, setVTLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const fetchVisitorType = async () => {
    try {
      setVTLoading(true);
      const res = await getAllVisitorType(token as string);
      setVisitorType(res?.collection || []);
    } catch (err) {
      console.error(err);
    } finally {
      setVTLoading(false);
    }
  };

  const fetchAllSites = async () => {
    try {
      const res = await getAllSite(token as string);
      setSites(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVisitorEmployee = async () => {
    try {
      const res = await getVisitorEmployee(token as string);
      setAllVisitorEmployee(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVisitorType();
      fetchAllSites();
      fetchVisitorEmployee();
    }
  }, [token]);

  const resetRegisteredFlow = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
  };
  const handleDialogClose = () => {
    setOpenDialogIndex(null);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    resetRegisteredFlow();
  };
  const handleEmployeeClick = async (employeeId: string) => {
    if (!token) return;

    setOpenEmployeeDialog(true);
    setEmployeeLoading(true);
    setEmployeeError(null);
    setEmployeeDetail(null);

    try {
      const res = await getEmployeeById(employeeId, token);
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

  const [selectedType, setSelectedType] = useState<
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block' | 'Waiting'
  >('All');

  const statusMap: Record<string, string> = {
    All: 'All',
    Preregis: 'Preregis',
    Checkin: 'Checkin',
    Checkout: 'Checkout',
    Denied: 'Denied',
    Block: 'Block',
    Waiting: 'Waiting',
  };

  const [filters, setFilters] = useState<any>({
    status: undefined,
    visitor_type: '',
    visitor_role: '',
    host_id: '',
    site_id: '',
    is_employee: '',
    is_block: '',
    transaction_status: '',
    emergency_situation: '',
    start_date: '',
    end_date: '',
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    status: undefined,
    visitor_status: '',
    visitor_type: '',
    visitor_role: '',
    host_id: '',
    site_id: '',
    is_block: '',
    transaction_status: '',
    emergency_situation: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);

      try {
        const start = page * rowsPerPage;
        const status = selectedType === 'All' ? undefined : statusMap[selectedType];
        const isEmergencyParam =
          appliedFilters.emergency_situation === ''
            ? undefined
            : appliedFilters.emergency_situation === 'true';

        const isBlockParam =
          appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';
        const response = await getAllVisitorPagination(
          token,
          start,
          rowsPerPage,
          sortDir,
          searchKeyword || undefined,
          appliedFilters.start_date
            ? dayjs(appliedFilters.start_date).utc().toISOString()
            : undefined,
          appliedFilters.end_date ? dayjs(appliedFilters.end_date).utc().toISOString() : undefined,
          appliedFilters.visitor_status || undefined,
          appliedFilters.data_filter,
          appliedFilters.site_id || undefined,
          appliedFilters.visitor_role || undefined,
          isEmergencyParam,
          isBlockParam,
          appliedFilters.host_id || undefined,
        );
        let rows = response.collection.map((item: any) => {
          return {
            id: item.id,
            visitor_type: item.visitor_type_name || '-',
            name: item.visitor_name || '-',
            identity_id: item.visitor_identity_id || '-',
            email: item.visitor_email || '-',
            organization: item.visitor_organization_name || '-',
            gender: item.visitor_gender || '-',
            phone: item.visitor_phone || '-',
            // is_vip: item.is_vip || '-',
            visitor_period_start: item.visitor_period_start || '-',
            visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
            host: item.host ?? '-',
            visitor_status: item.visitor_status || '-',
          };
        });

        if (selectedType !== 'All') {
          const apiStatus = statusMap[selectedType];
          rows = rows.filter((r) => r.visitor_status === apiStatus);
        }

        setTableRowVisitors(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setTableCustomVisitor(rows);
      } catch (err) {
        setTableCustomVisitor([]);
        setTotalRecords(0);
        setTotalFilteredRecords(0);
        setTableRowVisitors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    token,
    page,
    rowsPerPage,
    sortDir,
    refreshTrigger,
    searchKeyword,
    dateRange,
    selectedType,
    appliedFilters,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRegisteredSite(token as string);
      setSiteData(response.collection);
    };
    fetchData();
  }, [token]);

  const handleCloseDialog = () => {
    setSelectedSite(null);
    setOpenDialog(false);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
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
      freshForm = CreateVisitorRequestSchema.parse({});
    }

    setEdittingId('');
    setFormDataAddVisitor(freshForm);
    setSelectedSite(null);
    setPendingEditId(null);
    setOpenDialog(true);
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
  };

  const openDiscardForCloseAdd = () => {
    setDiscardMode('close-add');
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
    setWizardKey((k) => k + 1);
    setOpenDialog(false);
    setOpenDialogIndex(null);
    setFormDataAddVisitor(defaultFormData);
    setConfirmDialogOpen(false);
    setDiscardMode(null);
    handleDialogClose();
  };

  const handleView = async (id: string) => {
    if (!token) return;

    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getVisitorById(token, id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  type VisitorAction = 'checkin' | 'checkout' | 'deny' | 'block';

  const [confirm, setConfirm] = React.useState<{
    type: VisitorAction;
    loading: boolean;
  } | null>(null);

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
      // dummy delay biar kelihatan loading
      await new Promise((r) => setTimeout(r, 400));

      setConfirm(null);
      setOpenVisitorDialog(false);
      setRefreshTrigger((p) => p + 1);
    } catch (e) {
      setConfirm((c) => (c ? { ...c, loading: false } : c));
    }
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      status: selectedType === 'All' ? undefined : statusMap[selectedType],
      ...filters,
    });

    setPage(0);
  };

  const handleSubmitQRCode = async (value: string) => {
    try {
      setLoading(true);
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];

      setVisitorData(data);
      setOpenDetail(true);

      if (data.length === 0) {
        showSwal('error', 'Your code does not exist.');
        return;
      }
    } catch (error) {
      showSwal('error', 'Failed to fetch visitor data.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    const empty = {
      visitor_status: '',
      visitor_type: '',
      visitor_role: '',
      host_id: '',
      site_id: '',
      is_block: '',
      transaction_status: '',
      emergency_situation: '',
      start_date: '',
      end_date: '',
    };

    setFilters(empty);
    setAppliedFilters({
      status: undefined,
      ...empty,
    });

    setSelectedType('All');
    setPage(0);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Live Visitor" description="this is live visitor page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(_, index) => {
                  if (index === 2) {
                    setFlowTarget('invitation');
                    setOpenDialogIndex(2);
                  } else if (index === 3) {
                    setFlowTarget('preReg');
                    setOpenPreRegistration(true);
                  } else {
                    setOpenDialogIndex(index);
                  }
                }}
                size={{ xs: 12, lg: 3 }}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                isHavePagination={true}
                overflowX={'auto'}
                minWidth={2400}
                stickyHeader={true}
                data={tableCustomVisitor}
                totalCount={totalFilteredRecords}
                isNoActionTableHead={true}
                selectedRows={selectedRows}
                rowsPerPageOptions={[10, 50, 100, 500]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveImage={true}
                isHaveSearch={true}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveVip={true}
                isHavePeriod={true}
                // isVip={(row) => row.is_vip === true}
                isHaveAddData={false}
                isHaveHeader={true}
                isHaveGender={true}
                isHaveVisitor={true}
                isActionVisitor={true}
                isActionEmployee={true}
                stickyVisitorCount={2}
                isBlacklistPage={true}
                onNavigatePage={() => {
                  navigate('/admin/visitor/blacklist-visitor');
                }}
                isHaveEmployee={true}
                onEmployeeClick={(row) => {
                  handleEmployeeClick(row.host as string);
                }}
                isHaveVerified={false}
                headerContent={{
                  title: '',
                  subTitle: 'Monitoring Data Visitor',
                  items: [
                    { name: 'All' },
                    { name: 'Preregis' },
                    { name: 'Checkin' },
                    { name: 'Checkout' },
                    { name: 'Block' },
                    { name: 'Denied' },
                    { name: 'Waiting' },
                  ],
                }}
                onHeaderItemClick={(item) => {
                  if (
                    item.name === 'All' ||
                    item.name === 'Checkin' ||
                    item.name === 'Checkout' ||
                    item.name === 'Preregis' ||
                    item.name === 'Denied' ||
                    item.name === 'Block' ||
                    item.name === 'Waiting'
                  ) {
                    setSelectedType(item.name);
                  }
                }}
                defaultSelectedHeaderItem="All"
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onView={(row) => {
                  handleView(row.id);
                }}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => {
                  if (ranges.startDate && ranges.endDate) {
                    setStartDate(ranges.startDate.toISOString());
                    setEndDate(ranges.endDate.toISOString());
                    // setStartDate(ranges.startDate);
                    // setEndDate(ranges.endDate);
                    setPage(0);
                    setRefreshTrigger((prev) => prev + 1);
                  }
                }}
                onAddData={() => {
                  handleAdd();
                }}
                isHaveFilterMore={true}
                // isHaveFilter={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    onResetFilter={handleResetFilter}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      {/* Add New Invitation Visitor */}
      <Dialog
        fullWidth
        // maxWidth="xl"
        open={openInvitationVisitor}
        onClose={handleDialogClose}
        keepMounted
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
      >
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          Add Invitation Visitor
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                openDiscardForCloseAdd();
              } else {
                handleCloseDialog();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {/* <br /> */}
          <FormWizardAddVisitor
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            visitorType={visitorType}
            sites={sites}
            employee={employee}
            allVisitorEmployee={allVisitorEmployee}
            vtLoading={vtLoading}
          />
        </DialogContent>
      </Dialog>
      {/* Add Pre registration */}
      <Dialog
        fullWidth
        // maxWidth="xl"
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
        open={openPreRegistration}
        onClose={handleDialogClose}
      >
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          Add Pra Registration
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                openDiscardForCloseAdd();
              } else {
                handleCloseDialog();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: '0px' }}>
          <br />
          <FormWizardAddInvitation
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            visitorType={visitorType}
            sites={sites}
            employee={employee}
            allVisitorEmployee={allVisitorEmployee}
            vtLoading={vtLoading}
          />
        </DialogContent>
      </Dialog>

      <EmployeeDetailDialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        employeeDetail={employeeDetail}
        employeeLoading={employeeLoading}
        employeeError={employeeError}
      />

      <RegisteredSiteDialog
        open={openDialogIndex === 2}
        siteData={siteData}
        selectedSite={selectedSite}
        setSelectedSite={(nv) => {
          setSelectedSite(nv);
          setFormDataAddVisitor((prev) => ({
            ...prev,
            registered_site: nv?.id || '',
          }));
        }}
        isFormChanged={isFormChanged}
        onDiscard={openDiscardForCloseAdd}
        onClose={handleCloseDialog}
        toast={toast as any}
        onSubmit={(site) => {
          setFormDataAddVisitor((prev) => ({
            ...prev,
            registered_site: site.id,
          }));

          setOpenDialogIndex(null);

          if (flowTarget === 'invitation') {
            setOpenInvitationVisitor(true);
          } else if (flowTarget === 'preReg') {
            setOpenPreRegistration(true);
          }
        }}
      />

      {/* QR Code */}
      <QrScannerDialog
        open={openDialogIndex === 1}
        onClose={handleDialogClose}
        qrMode={qrMode}
        setQrMode={setQrMode}
        qrValue={qrValue}
        setQrValue={setQrValue}
        loading={loading}
        onSubmit={handleSubmitQRCode}
        scanContainerRef={scanContainerRef as any}
        facingMode={facingMode}
        setFacingMode={setFacingMode}
        torchOn={torchOn}
        setTorchOn={setTorchOn}
        hasDecoded={hasDecoded}
        setHasDecoded={setHasDecoded}
      />

      <VisitorDetailDialog
        open={openVisitorDialog}
        loading={visitorLoading}
        error={visitorError}
        detail={visitorDetail}
        onClose={() => setOpenVisitorDialog(false)}
        onConfirm={(action: any) => openConfirm(action)}
      />

      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
      />

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
          <Button onClick={confirmDiscardAndClose} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ zIndex: 99999 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </PageContainer>
  );
};

export default Content;
