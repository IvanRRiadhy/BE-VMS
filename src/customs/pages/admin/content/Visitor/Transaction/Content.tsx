import { useState, useEffect, useRef, use } from 'react';
import {
  Box,
  Grid2 as Grid,
  Portal,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import iconScanQR from 'src/assets/images/svgs/scan-qr.svg';
import iconAdd from 'src/assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  Item,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import { getVisitorTransactionByIds, getVisitorTransactionPagination } from 'src/customs/api/admin';
import { IconClipboard, IconQrcode, IconUser, IconUsers } from '@tabler/icons-react';

import { getInvitationCode } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import DetailVisitorDialog from 'src/customs/pages/Operator/Dialog/DetailVisitorDialog';
import { useDebounce } from 'src/hooks/useDebounce';
import FilterTransaction from './FilterMoreContent';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import ConfirmUnsavedDialog from '../../../components/ConfirmUnsavedDialog';
import QrScannerDialog from '../Trx/components/Dialog/QrScannerDialog';
import RegisteredSiteDialog from '../Trx/components/Dialog/RegisteredSiteDialog';
import { useVisitorType } from 'src/hooks/useVisitorType';
import { useSites } from 'src/hooks/useSites';
import { useVisitorEmployees } from 'src/hooks/useVisitorEmployees';
import InvitationVisitorDialog from '../Trx/components/InvitationVisitorDialog';
import PreRegistrationDialog from '../Trx/components/PreRegistrationDialog';
import { useRegisteredSite } from 'src/hooks/useRegisteredSite';
import { useEmployeePagination } from 'src/hooks/useEmployeePagination';
import { cancelVisitor, getProfile } from 'src/customs/api/users';
import { useProfile } from 'src/hooks/useProfile';
import { useTranslation } from 'react-i18next';
import {
  exportVisitorExcel,
  exportVisitorPdf,
} from 'src/customs/pages/Employee/Invitation/components/VisitorExport';
import TransactionVisitorDetail from './components/TransactionVisitorDetail';
import TransactionVisitorList from './components/TransactionVisitorList';

dayjs.extend(utc);
dayjs.extend(timezone);

type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Content = () => {
  const { roleAccess } = useSession();
  const isOperatorAdmin = roleAccess === 'OperatorAdmin';
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [tableRowVisitors, setTableRowVisitors] = useState<any[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const defaultFormData = CreateVisitorRequestSchema.parse({});

  const [formDataAddVisitor, setFormDataAddVisitor] =
    useState<CreateVisitorRequest>(defaultFormData);
  const { t } = useTranslation();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const cards = [
    {
      title: t('totalVisitor'),
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: 'Scan QR ' + t('navigation.visitor'),
      icon: IconQrcode,
      subTitle: iconScanQR,
      subTitleSetting: 'image',
      color: 'none',
    },
    ...(!isOperatorAdmin
      ? [
          {
            title: t('add') + ' Invitation',
            icon: IconUser,
            subTitle: iconAdd,
            subTitleSetting: 'image',
            color: 'none',
          },
          {
            title: t('add') + ' Pre Registration',
            icon: IconClipboard,
            subTitle: iconAdd,
            subTitleSetting: 'image',
            color: 'none',
          },
        ]
      : []),
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

  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  // Qr Scanner
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const secdrawerWidth = 300;
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [openGroup, setOpenGroup] = useState(true);
  const [showDrawerFilterMore, setShowDrawerFilterMore] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [groupHeader, setGroupHeader] = useState<any | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState<
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block'
  >('All');

  const statusMap: Record<string, string> = {
    All: 'All',
    Preregis: 'Preregis',
    Checkin: 'Checkin',
    Checkout: 'Checkout',
    Denied: 'Denied',
    Block: 'Block',
  };

  const [searchAgenda, setSearchAgenda] = useState('');
  const debouncedSearchAgenda = useDebounce(searchAgenda, 2000);

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

  const fetchData = async (append = false) => {
    if ( isFetchingRef.current) return;

    isFetchingRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const start = append ? tableRowVisitors.length : 0;

      const isEmergencyParam =
        appliedFilters.emergency_situation === ''
          ? undefined
          : appliedFilters.emergency_situation === 'true';

      const isBlockParam =
        appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';

      const res = await getVisitorTransactionPagination(
        start,
        rowsPerPage,
        sortDir,
        debouncedSearchAgenda || undefined,
        appliedFilters.start_date || undefined,
        appliedFilters.end_date || undefined,
        appliedFilters.visitor_status || undefined,
        appliedFilters.data_filter,
        appliedFilters.transaction_status || undefined,
        appliedFilters.site_id || undefined,
        appliedFilters.visitor_role || undefined,
        isEmergencyParam,
        isBlockParam,
        appliedFilters.host_id || undefined,
      );

      const newRows = res.collection.map((item: any) => ({
        id: item.id,
        agenda: item.agenda || '-',
        visitor_type_id: item.visitor_type_id,
        visitor_type: item.visitor_type_name || '-',
        site_id: item.site_id,
        host_name: item.host_name || '-',
        visitor_period_start: formatDateTime(item.visitor_period_start),
        visitor_period_end: formatDateTime(item.visitor_period_end),
        invited_by: item.invited_by || '-',
      }));

      if (append) {
        setTableRowVisitors((prev) => [...prev, ...newRows]);
      } else {
        setTableRowVisitors(newRows);
      }

      setHasMore(start + newRows.length < res.RecordsFiltered);

      setTotalRecords(res.RecordsTotal);
      setTotalFilteredRecords(res.RecordsFiltered);
    } catch {
      setTableRowVisitors([]);
      setTotalRecords(0);
      setTotalFilteredRecords(0);
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const isFetchingRef = useRef(false);

  useEffect(() => {


    setSelectedGroupId(null);
    setGroupVisitors([]);

    fetchData(false);
  }, [ page, rowsPerPage, sortDir, appliedFilters, debouncedSearchAgenda]);

  const { data: siteData } = useRegisteredSite();
  const { data: profile } = useProfile();

  const resetRegisteredFlow = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
  };
  const handleDialogClose = () => {
    setOpenDialogIndex(null);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setDuplicateData(null);

    // reset edit mode
    setEdittingId('');

    // reset wizard
    setWizardKey((prev) => prev + 1);

    // reset form
    setFormDataAddVisitor({
      visitor_type: '',
      is_group: false,
      registered_site: '',
    } as any);
    resetRegisteredFlow();
  };

  const handleCloseDialog = () => {
    setSelectedSite(null);
    setOpenDialog(false);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setDuplicateData(null);

    // reset edit mode
    setEdittingId('');

    // reset wizard
    setWizardKey((prev) => prev + 1);

    // reset form
    setFormDataAddVisitor({
      visitor_type: '',
      is_group: false,
      registered_site: '',
    } as any);
    handleDialogClose();
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    // setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
  };

  const openDiscardForCloseAdd = () => {
    setConfirmDialogOpen(true);
  };

  const handleCancelDiscard = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const resetFormData = () => {
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
    handleDialogClose();
  };

  const handleSubmitQRCode = async (value: string) => {
    try {
      setLoading(true);
      const res = await getInvitationCode(value);
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

  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchDetail = async () => {
      setGroupDetailLoading(true);
      try {
        const res = await getVisitorTransactionByIds( selectedGroupId);
        setGroupHeader(res.collection[0]);
        setGroupVisitors(res.collection);
      } catch (e) {
        // setGroupVisitors([]);
      } finally {
        setGroupDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedGroupId]);

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

    setSearch('');
    setSelectedType('All');
    setPage(0);
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      status: selectedType === 'All' ? undefined : statusMap[selectedType],
      ...filters,
    });

    setPage(0);
    setSelectedGroupId(null);
    setGroupVisitors([]);
    // setShowDrawerFilterMore(false);
  };

  const [hostSearch, setHostSearch] = useState('');

  const debouncedSearch = useDebounce(hostSearch, 800);

  const { visitorType } = useVisitorType();
  const { sites } = useSites();
  const { data, isLoading: isLoadingEmployee } = useEmployeePagination( {
    'search[value]': debouncedSearch,
    sortDir: 'desc',
  });

  const employeeData = data?.collection ?? [];
  const { allVisitorEmployee } = useVisitorEmployees();
  const [vtLoading, setVtLoading] = useState(false);

  const handleSelectSite = (site: any) => {
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: site.id,
    }));

    setOpenDialogIndex(null);

    if (flowTarget === 'invitation') {
      setOpenInvitationVisitor(true);
    } else if (flowTarget === 'preReg') {
      setOpenPreRegistration(true);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelVisitor(id);

      showSwal('success', 'Transaction successfully cancelled');

      fetchData();
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to cancel visitor');
    }
  };

  const filteredVisitors = tableRowVisitors.filter((item) => {
    const keyword = searchAgenda.trim().toLowerCase();

    return (
      item.agenda?.toLowerCase().includes(keyword) ||
      item.host_name?.toLowerCase().includes(keyword)
    );
  });

  const [duplicateData, setDuplicateData] = useState<any>(null);

  const handleDuplicate = async (group: any) => {
    try {
      const res = await getVisitorTransactionByIds( group.id);

      const visitors = res.collection;

      const isGroup = visitors.length > 1;

      setDuplicateData({
        group,
        visitors,
      });

      setFormDataAddVisitor({
        visitor_type: group.visitor_type_id,
        is_group: isGroup,
        registered_site: group.site_id,
      } as any);

      if (isGroup) {
        setGroupVisitors([
          {
            id: crypto.randomUUID(),
            group_name: visitors[0]?.group_name || '',
            group_code: visitors[0]?.visitor_code || '',
            // data_visitor: [],
          },
        ]);
      }

      setOpenPreRegistration(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Transaction Visitor" description="this is transaction visitor page">
        <Box>
          <Grid container spacing={2}>
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
          </Grid>
          <Box
            sx={{
              display: 'flex',
              flexDirection: mdUp ? 'row' : 'column',
              backgroundColor: '#fff',
              // bgcolor: 'background.paper',
              height: '100%',
              width: '100%',
              // overflow: 'hidden',
              marginTop: '5px',
            }}
          >
            {/* Left */}
            <TransactionVisitorList
              mdUp={mdUp}
              secdrawerWidth={secdrawerWidth}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              profile={profile}
              searchAgenda={searchAgenda}
              setSearchAgenda={setSearchAgenda}
              setShowDrawerFilterMore={setShowDrawerFilterMore}
              filteredVisitors={filteredVisitors}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              setSelectedGroupId={setSelectedGroupId}
              handleDuplicate={handleDuplicate}
              handleCancel={handleCancel}
              fetchData={fetchData}
            />
            {/* Right */}
            <TransactionVisitorDetail
              selectedGroupId={selectedGroupId}
              openGroup={openGroup}
              setOpenGroup={setOpenGroup}
              groupHeader={groupHeader}
              groupVisitors={groupVisitors}
              groupDetailLoading={groupDetailLoading}
              exportVisitorPdf={exportVisitorPdf}
              exportVisitorExcel={exportVisitorExcel}
              t={t}
            />
          </Box>
        </Box>
      </Container>

      <InvitationVisitorDialog
        open={openInvitationVisitor}
        onClose={handleDialogClose}
        handleDialogClose={handleDialogClose}
        handleCloseDialog={handleCloseDialog}
        openDiscardForCloseAdd={openDiscardForCloseAdd}
        isFormChanged={isFormChanged}
        wizardKey={wizardKey}
        formDataAddVisitor={formDataAddVisitor}
        setFormDataAddVisitor={setFormDataAddVisitor}
        edittingId={edittingId}
        handleSuccess={handleSuccess}
        visitorType={visitorType}
        sites={sites}
        employee={employeeData}
        allVisitorEmployee={allVisitorEmployee}
        vtLoading={vtLoading}
        search={setHostSearch}
        isLoadingEmployee={isLoadingEmployee}
      />

      <PreRegistrationDialog
        open={openPreRegistration}
        handleDialogClose={handleDialogClose}
        handleCloseDialog={handleCloseDialog}
        openDiscardForCloseAdd={openDiscardForCloseAdd}
        isFormChanged={isFormChanged}
        wizardKey={wizardKey}
        formDataAddVisitor={formDataAddVisitor}
        setFormDataAddVisitor={setFormDataAddVisitor}
        edittingId={edittingId}
        handleSuccess={handleSuccess}
        visitorType={visitorType}
        sites={sites}
        employee={employeeData}
        allVisitorEmployee={allVisitorEmployee}
        vtLoading={vtLoading}
        search={setHostSearch}
        isLoadingEmployee={isLoadingEmployee}
        duplicateData={duplicateData}
      />

      {/* Select Registered Site */}
      <RegisteredSiteDialog
        open={openDialogIndex === 2}
        siteData={siteData as any[]}
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
        onSubmit={handleSelectSite}
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

      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
      />
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelDiscard}
        onDiscard={confirmDiscardAndClose}
      />
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
      <FilterTransaction
        open={showDrawerFilterMore}
        onClose={() => setShowDrawerFilterMore(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />
    </PageContainer>
  );
};

export default Content;
