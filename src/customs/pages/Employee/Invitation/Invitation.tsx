import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  MenuItem,
  Checkbox,
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import iconScanQR from '../../../../assets/images/svgs/scan-qr.svg';
import iconAdd from '../../../..//assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from './FormInvitation';
import FormWizardAddVisitor from './Praregist';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  Item,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllDepartments,
  getAllDistricts,
  getAllOrganizations,
  getAllVisitorPagination,
  getAllVisitorType,
  getEmployeeById,
  getRegisteredSite,
  getVisitorById,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
// import FilterMoreContent from './FilterMoreContent';
import {
  IconBrandGmail,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCalendarStats,
  IconCar,
  IconCards,
  IconCheck,
  IconClipboard,
  IconGenderBigender,
  IconIdBadge2,
  IconMapPin,
  IconPhone,
  IconUsers,
} from '@tabler/icons-react';
import FormInvitation from './FormInvitation';
import dayjs from 'dayjs';
import Praregist from './Praregist';
import {
  getInvitation,
  getInvitationById,
  getInvitationRelatedVisitor,
  getInvitations,
} from 'src/customs/api/visitor';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import EmployeeDetailDialog from '../Components/Dialog/EmployeeDetailDialog';
import SelectRegisteredSiteDialog from '../Components/Dialog/SelectRegisteredSiteDialog';

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
  visitor_period_start: string;
  visitor_period_end: string;
  host: string;
  visitor_status: string;
};

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  // mode konfirmasi: "close-add" atau "edit"
  const [discardMode, setDiscardMode] = useState<'close-add' | 'edit' | null>(null);
  const [tableRowVisitors, setTableRowVisitors] = useState<any[]>([]);
  const [tableCustomVisitor, setTableCustomVisitor] = useState<VisitorTableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

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

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
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

  const employeeId = useSelector((state: any) => state.userReducer.data?.employee_id);

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  // const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  // const [employeeDetail, setEmployeeDetail] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any[]>([]);
  const [openRelatedInvitation, setOpenRelatedInvitation] = useState(false);

  // Registered Site
  const [siteData, setSiteData] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [wizardKey, setWizardKey] = useState(0);

  const CDN_BASE = `${axiosInstance2?.defaults?.baseURL?.replace(/\/+$/, '') ?? ''}/cdn`;
  const resolveImg = (v?: string) => {
    if (!v) return '';
    // sudah absolute (http/https, data URL, blob)
    if (/^(https?:)?\/\/|^data:image\/|^blob:/.test(v)) return v;

    // bereskan path agar tidak dobel /cdn dan tidak double slash
    const path = v.replace(/^\/+/, '').replace(/^cdn\//, '');
    return `${CDN_BASE}/${path}`;
  };

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

  // const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setOpenEmployeeDialog(true);
  };

  const {
    data: employeeDetail,
    isLoading: employeeLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['employee', selectedEmployeeId],
    queryFn: async () => {
      const res = await getEmployeeById(selectedEmployeeId!, token as string);
      return res.collection; // ✅ hanya ambil object karyawan
    },
    enabled: !!selectedEmployeeId && !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // const handleEmployeeClick = async (employeeId: string) => {
  //   if (!token) return;

  //   console.log('Employee Clicked:', employeeId);
  //   setOpenEmployeeDialog(true);
  //   setEmployeeLoading(true);
  //   setEmployeeError(null);
  //   setEmployeeDetail(null);

  //   try {
  //     const res = await getEmployeeById(employeeId, token);
  //     // asumsi payload: { collection: {...employee} }
  //     setEmployeeDetail(res?.collection ?? null);
  //     console.log('Employee Detail:', res);
  //   } catch (err: any) {
  //     setEmployeeError(err?.message || 'Failed to fetch employee details.');
  //   } finally {
  //     setEmployeeLoading(false);
  //   }
  // };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    // setEmployeeDetail(null);
    setEmployeeError(null);
  };

  const [visitorTypes, setVisitorTypes] = useState<{ [key: string]: string }>({});

  const [selectedType, setSelectedType] = useState<
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block'
  >('All');

  // useEffect(() => {
  //   const fetchVisitorTypes = async () => {
  //     const res = await getAllVisitorType(token as string); // API master visitor type
  //     // ubah array ke object dictionary { id: name }
  //     const dict: { [key: string]: string } = {};
  //     res.collection.forEach((vt) => {
  //       dict[vt.id] = vt.name;
  //     });
  //     setVisitorTypes(dict);
  //   };
  //   fetchVisitorTypes();
  // }, [token]);

  const statusMap: Record<string, string> = {
    All: 'All',
    Preregis: 'Preregis', // 👈 mapping fix
    Checkin: 'Checkin',
    Checkout: 'Checkout',
    Denied: 'denied',
    Block: 'Block',
  };

  // const [rowsPerPage, setRowsPerPage] = useState(10);

  // useEffect(() => {
  //   if (!token) return;
  //   const fetchData = async () => {
  //     setLoading(true);
  //     const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  //     const end_date = dayjs().format('YYYY-MM-DD'); // ✅ hanya sampai hari ini

  //     // if (isDataReady) {
  //     const response = await getInvitations(token as string, start_date, end_date);

  //     let rows = response.collection.map((item: any) => {
  //       const isEmployeeHost = item.host === employeeId?.toUpperCase();

  //       return {
  //         id: item.id,
  //         visitor_type: visitorTypes[item.visitor_type] || item.visitor_type,
  //         name: item.visitor.name,
  //         identity_id: item.visitor.identity_id,
  //         email: item.visitor.email,
  //         organization: item.visitor.organization,
  //         gender: item.visitor.gender,
  //         address: item.visitor.address,
  //         phone: item.visitor.phone,
  //         is_vip: item.visitor.is_vip,
  //         visitor_period_start: item.visitor_period_start,
  //         visitor_period_end: item.visitor_period_end,
  //         host: item.host ?? '-',
  //         employee: isEmployeeHost ?? '-',
  //         visitor_status: item.visitor_status,
  //       };
  //     });

  //     if (searchKeyword.trim()) {
  //       const keyword = searchKeyword.toLowerCase();
  //       rows = rows.filter((r: any) =>
  //         [r.name, r.email, r.phone, r.organization, r.identity_id].some((val) =>
  //           String(val || '')
  //             .toLowerCase()
  //             .includes(keyword),
  //         ),
  //       );
  //     }

  //     if (selectedType !== 'All') {
  //       const apiStatus = statusMap[selectedType]; // ambil versi backend
  //       rows = rows.filter((r: any) => r.visitor_status === apiStatus);
  //     }

  //     // setTableRowVisitors(response.collection);
  //     setTotalRecords(response.collection.length);
  //     // setTotalFilteredRecords(response.RecordsFiltered);
  //     setTableCustomVisitor(rows);
  //     setIsDataReady(true);
  //     setLoading(false);
  //   };
  //   fetchData();
  // }, [token, refreshTrigger, searchKeyword, startDate, endDate, employeeId, selectedType]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      const end_date = dayjs().format('YYYY-MM-DD');

      const response = await getInvitations(token as string, start_date, end_date);

      let mapped = response.collection.map((item: any) => {
        const isEmployeeHost = item.host === employeeId?.toUpperCase();

        return {
          id: item.id,
          visitor_type: item.visitor_type_name || '-',
          name: item.visitor_name || '-',
          identity_id: item.visitor_identity_id || '-',
          email: item.visitor_email || '-',
          organization: item.visitor_organization_name || '-',
          gender: item.visitor_gender || '-',
          // address: item.visitor_address || '-',
          phone: item.visitor_phone || '-',
          is_vip: item.visitor_is_vip || '-',
          visitor_period_start: item.visitor_period_start || '-',
          visitor_period_end: item.visitor_period_end || '-',
          host: item.host ?? '-',
          employee: isEmployeeHost ?? '-',
          visitor_status: item.visitor_status || '-',
        };
      });

      if (selectedType !== 'All') {
        const apiStatus = statusMap[selectedType]; // ambil versi backend
        mapped = mapped.filter((r: any) => r.visitor_status === apiStatus);
      }
      setTableRowVisitors(mapped);
      setTableCustomVisitor(mapped);

      setTotalRecords(mapped.length);
      setLoading(false);
    };

    fetchData();
  }, [token, refreshTrigger, startDate, endDate, employeeId, selectedType]);

  useEffect(() => {
    if (!tableRowVisitors.length) return;

    let filtered = [...tableRowVisitors];

    const keyword = searchKeyword.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter((r) =>
        [r.name, r.email, r.phone, r.organization, r.identity_id].some((val) =>
          String(val || '')
            .toLowerCase()
            .includes(keyword),
        ),
      );
    }

    // 🔹 Filter status (tab)
    if (selectedType !== 'All') {
      const apiStatus = statusMap[selectedType];
      filtered = filtered.filter((r) => r.visitor_status === apiStatus);
    }

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    setTableCustomVisitor(paginated);
    setTotalFilteredRecords(filtered.length);
  }, [tableRowVisitors, searchKeyword, selectedType, page, rowsPerPage]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRegisteredSite(token as string);
      setSiteData(response.collection);
    };
    fetchData();
  }, [token]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedSite(null);
    // setFormDataAddVisitor((prev) => ({
    //   ...prev,
    //   registered_site: '',
    // }));
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
      registered_site: '', // reset registered site
    }));
    setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
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
    setWizardKey((k) => k + 1);
    setOpenDialog(false);
    setOpenDialogIndex(null);
    setFormDataAddVisitor(defaultFormData);
    setConfirmDialogOpen(false);
    setDiscardMode(null);
    handleDialogClose();
  };

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenRelatedInvitation(true);
    // setVisitorLoading(true);
    // setVisitorError(null);
    // setVisitorDetail(null);

    try {
      const res = await getInvitationRelatedVisitor(id, token);
      setVisitorDetail(res?.collection ?? res ?? null);
      console.log('Visitor Detail:', res);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  // const handleCloseVisitorDialog = () => {
  //   setOpenVisitorDialog(false);
  //   setVisitorDetail(null);
  //   setVisitorError(null);
  // };

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

  const [selected, setSelected] = useState<number[]>([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);

  const selectedVisitorData = useMemo(() => {
    return visitorDetail
      .filter((_, index) => selected.includes(index))
      .map((v, i) => ({
        id: v.id,
        name: v.visitor.name,
        vehicle_plate_number: v.vehicle_plate_number,
        visitor_status: v.visitor_status,
      }));
  }, [visitorDetail, selected]);

  const handleCloseRelation = () => {
    setOpenRelatedInvitation(false);
    setVisitorDetail([]);
    setVisitorError(null);
  };

  return (
    <>
      <PageContainer title="Invitation" description="invitation page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(_, index) => {
                  if (index === 2) {
                    setFlowTarget('invitation');
                    // setOpenDialogIndex(2);
                    setOpenInvitationVisitor(true);
                  } else if (index === 1) {
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
                defaultRowsPerPage={rowsPerPage}
                totalCount={totalFilteredRecords}
                selectedRows={selectedRows}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveImage={true}
                isHaveSearch={true}
                // isHaveFilter={true}
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
                stickyVisitorCount={2}
                isActionEmployee={true}
                isHaveEmployee={true}
                onEmployeeClick={(row) => {
                  handleEmployeeClick(row.host as string);
                }}
                isHaveVerified={true}
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
                  ],
                }}
                onHeaderItemClick={(item) => {
                  if (
                    item.name === 'All' ||
                    item.name === 'Checkin' ||
                    item.name === 'Checkout' ||
                    item.name === 'Preregis' ||
                    item.name === 'Denied' ||
                    item.name === 'Block'
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
                    setPage(0); // reset ke halaman pertama
                    setRefreshTrigger((prev) => prev + 1); // trigger fetch
                  }
                }}
                onAddData={() => {
                  handleAdd();
                }}
                isHaveFilterMore={false}
                // isHaveFilter={true}
                // filterMoreContent={
                //   <FilterMoreContent
                //     filters={filters}
                //     setFilters={setFilters}
                //     onApplyFilter={handleApplyFilter}
                //   />
                // }
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* Add New Invitation Visitor */}
      <Dialog
        fullWidth
        maxWidth="xl"
        open={openInvitationVisitor}
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
          <FormInvitation
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
      {/* Add Pre registration */}
      <Dialog fullWidth maxWidth="xl" open={openPreRegistration} onClose={handleDialogClose}>
        <DialogTitle
          display="flex"
          justifyContent={'space-between'}
          alignItems="center"
          // sx={{
          //   background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          // }}
        >
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
          <Praregist
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
      {/* Employee Detail */}
      <EmployeeDetailDialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        employeeDetail={employeeDetail}
        employeeLoading={employeeLoading}
        employeeError={employeeError}
        axiosInstance2={axiosInstance2}
      />

      {/* Select Registered Site */}
      {/* <Dialog open={openDialogIndex === 2} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle
          display="flex"
          justifyContent={'space-between'}
          alignItems="center"
          sx={{
            background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          }}
        >
          Select Registered Site
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
          <CustomFormLabel sx={{ marginTop: 0 }}>Registered Site</CustomFormLabel>
          <Autocomplete
            fullWidth
            options={siteData}
            getOptionLabel={(o) => o.name || ''}
            value={selectedSite}
            onChange={(_, nv) => {
              setSelectedSite(nv);
              setFormDataAddVisitor((prev) => ({
                ...prev,
                registered_site: nv?.id || '',
              }));
            }}
            isOptionEqualToValue={(option, value) => option.id === value?.id} // penting
            renderInput={(params) => <TextField {...params} label="" />}
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              onClick={() => {
                if (!selectedSite) {
                  toast('Minimal pilih 1 Registered Site.', 'warning');
                  return;
                }
                setFormDataAddVisitor((prev) => ({
                  ...prev,
                  registered_site: selectedSite.id,
                }));
                setOpenDialogIndex(null); // tutup Registered Site
                if (flowTarget === 'invitation') {
                  setOpenInvitationVisitor(true);
                } else if (flowTarget === 'preReg') {
                  setOpenPreRegistration(true);
                }
              }}
              color="primary"
            >
              Next
            </Button>
          </Box>
        </DialogContent>
      </Dialog> */}
      <SelectRegisteredSiteDialog
        open={openDialogIndex === 2}
        siteData={siteData}
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
        isFormChanged={isFormChanged}
        onDiscard={openDiscardForCloseAdd}
        onClose={handleCloseDialog}
        onNext={(site: any) => {
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

      {/* Related Visitor */}
      <Dialog open={openRelatedInvitation} onClose={handleCloseRelation} fullWidth maxWidth="xl">
        <DialogTitle>Related Visitor Invitation</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseRelation}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers>
          <Grid container spacing={2} alignItems={'stretch'}>
            {/* Kiri: daftar avatar visitor */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  overflowX: 'auto',
                  p: 1,
                  maxWidth: '100%',
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 3,
                  },
                }}
              >
                {visitorDetail.length === 0 ? (
                  <Typography color="text.secondary">No related visitors found</Typography>
                ) : (
                  visitorDetail.map((v: any, index: any) => {
                    const isDisabled = disabledIndexes.includes(index);
                    const isSelected = selected.includes(index);

                    return (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.4 : 1,
                          textAlign: 'center',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease',
                          flex: '0 0 auto',
                          '&:hover': { transform: isDisabled ? 'none' : 'scale(1.05)' },
                        }}
                        onClick={() => {
                          if (isDisabled) return;
                          setSelected((prev) =>
                            prev.includes(index)
                              ? prev.filter((i) => i !== index)
                              : [...prev, index],
                          );
                        }}
                      >
                        <Avatar
                          src={`${axiosInstance2.defaults.baseURL}/cdn` + v.selfie_image}
                          alt={v.name}
                          sx={{ width: 60, height: 60 }}
                        />
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            bgcolor: 'white',
                            borderRadius: '50%',
                            p: 0.2,
                            '& .MuiSvgIcon-root': { fontSize: 16 },
                          }}
                        />
                        <Typography mt={1} fontSize={14} noWrap width={60}>
                          {v.visitor.name}
                        </Typography>
                      </Box>
                    );
                  })
                )}
              </Box>

              {/* Tombol select/unselect */}
              {/* <Box display="flex" justifyContent="flex-start" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setSelected(
                      visitorDetail.map((_, i) => i).filter((i) => !disabledIndexes.includes(i)),
                    )
                  }
                  disabled={visitorDetail.length === 0}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => setSelected([])}
                  disabled={selected.length === 0}
                >
                  Unselect All
                </Button>
              </Box> */}

              <Divider sx={{ mt: 2, mb: 2 }} />

              {/* Tabel visitor terpilih */}
              <DynamicTable
                data={selectedVisitorData}
                isHaveChecked={false}
                isHavePagination={false}
                isHaveHeaderTitle={true}
                titleHeader="Selected Visitor"
              />

              {/* Dropdown Action + Apply */}
              {/* <Box display="flex" alignItems="center" gap={2} mt={2}>
                <CustomSelect
                  sx={{ width: '20%' }}
                  value={selectedAction}
                  onChange={(e: any) => {
                    const action = e.target.value;
                    setSelectedAction(action);

                    // Kalau belum pilih, reset semua
                    if (!action) {
                      setDisabledIndexes([]);
                      setSelected([]);
                      return;
                    }

                    const newDisabledIndexes = visitorDetail
                      .map((v, i) => {
                        const status = (v.visitor_status || '').trim();

                        if (status === 'Block' && action !== 'Unblock') {
                          return i;
                        }

                        switch (action) {
                          case 'Checkin':
                            return status === 'Checkin' || status === 'Checkout' ? i : null;

                          case 'Checkout':
                            return status !== 'Checkin' ? i : null;

                          case 'Block':
                            return status === 'Block' ? i : null;

                          case 'Unblock':
                            return status !== 'Block' ? i : null;

                          default:
                            return null;
                        }
                      })
                      .filter((x) => x !== null);

                    // console.log('🎯 Action:', action);
                    // console.log('🚫 Disabled indexes:', newDisabledIndexes);

                    // Update state
                    setDisabledIndexes(newDisabledIndexes);

                    // Pastikan selected tidak mengandung index yang baru di-disable
                    setSelected((prev) => prev.filter((i) => !newDisabledIndexes.includes(i)));
                  }}
                  displayEmpty
                >
                  <MenuItem value="">Select Action</MenuItem>
                  <MenuItem value="Checkin">Check In</MenuItem>
                  <MenuItem value="Checkout">Check Out</MenuItem>
                  <MenuItem value="Block">Block</MenuItem>
                  <MenuItem value="Unblock">Unblock</MenuItem>
                </CustomSelect>

                <Button
                  sx={{ width: '10%' }}
                  variant="contained"
                  color="primary"
                  disabled={
                    !selectedAction ||
                    visitorDetail.length === 0 ||
                    disabledIndexes.length === visitorDetail.length ||
                    selected.length === 0
                  }
                  onClick={() => confirmMultipleAction(selectedAction as any)}
                >
                  Apply
                </Button>
              </Box> */}
            </Grid>
          </Grid>
        </DialogContent>
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
          sx={{ zIndex: 2000 }}
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
    </>
  );
};

export default Content;
