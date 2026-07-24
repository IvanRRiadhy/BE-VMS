import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Portal,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/components/container/PageContainer';
import iconAdd from '../../../..//assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import CloseIcon from '@mui/icons-material/Close';
import {
  CreateVisitorRequestSchema,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllVisitorPagination,
  getEmployeeById,
  getVisitorTransactionByIds,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { IconBolt, IconClipboard, IconSearch, IconShare, IconUsers } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Praregist from './Praregist';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import EmployeeDetailDialog from '../Components/Dialog/EmployeeDetailDialog';
import {
  getInvitationSite,
  getInvitationVisitorEmployee,
  getInvitationVisitorType,
} from 'src/customs/api/Admin/InvitationData';
import {
  getShareLinkById,
} from 'src/customs/api/Admin/ShareLink';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import CreateLinkDialog from '../Components/Dialog/CreateLinkDialog';
import DetailLinkDialog from '../Components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../Components/Dialog/SendEmailDialog';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import RelatedInvitationDialog from '../Components/Dialog/RelatedInvitationDialog';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';
import ShareLinkDialog from '../../admin/content/Visitor/Trx/components/ShareLinkDialog';
import ConfirmUnsavedDialog from 'src/customs/pages/admin/components/ConfirmUnsavedDialog';
import { QuickAccessDialog } from '../Components/Dialog/QuickAccessDialog';
import useInvitationVisitorType from 'src/hooks/Invitation/useInvitationVisitorType';
import { useDebounce } from 'src/hooks/useDebounce';
import { useInvitationVisitorEmployee } from 'src/hooks/Invitation/useInvitationVisitorEmployee';
import { cancelVisitor } from 'src/customs/api/users';
import VisitorDetailPanel from './components/VisitorDetailPanel';
import VisitorListTable from './components/VisitorListTable';
import { useTranslation } from 'react-i18next';
import { useQuickAccessPagination } from 'src/hooks/Visitor/useQuickAccessPagination';
import { useQuickAccessMutation } from 'src/hooks/Visitor/useQuickAccesMutation';
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';
import { useShareLinkMutation } from 'src/hooks/Visitor/useShareLinkMutation';
import { useTransactionVisitorPagination } from 'src/hooks/Visitor/Transaction/useTransactionPagination';
import { useTransactionVisitorDetail } from 'src/hooks/Visitor/Transaction/useTransactionVisitorDetail';
import TransactionVisitorList from './components/TransactionVisitorList';
type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Content = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const defaultFormData = useMemo(() => CreateVisitorRequestSchema.parse({}), []);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState(defaultFormData);
  const [selectedShareLink, setSelectedShareLink] = useState<any>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);
  const [tab, setTab] = useState(0);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any[]>([]);
  const [openRelatedInvitation, setOpenRelatedInvitation] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [generatedLink, setGeneratedLink] = useState('');
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const [tableRowVisitors, setTableRowVisitors] = useState<any[]>([]);
  const { t } = useTranslation();
  const resetRegisteredFlow = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
  };
  const handleDialogClose = () => {
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    resetRegisteredFlow();
  };

  const [selected, setSelected] = useState<number[]>([]);
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const secdrawerWidth = 300;
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);

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
      const res = await getEmployeeById(selectedEmployeeId!);
      return res.collection ?? [];
    },
    enabled: !!selectedEmployeeId,
    retry: 1,
  });

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    // setEmployeeDetail(null);
    setEmployeeError(null);
  };
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [searchHost, setSearchHost] = useState<any>('');
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

  const queryClient = useQueryClient();
  const [sortDir, setSortDir] = useState<string>('desc');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchAgenda, setSearchAgenda] = useState('');
  const debouncedSearchAgenda = useDebounce(searchAgenda, 500);
  const [openGroup, setOpenGroup] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDirty, setIsDirty] = useState(false);


  const {
    data: tableTransaction,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactionVisitorPagination({
    rowsPerPage,
    sortDir,
    search: debouncedSearchAgenda,
    filters: appliedFilters,
  });


  const tableRowVisitors = useMemo(() => {
    return (
      tableTransaction?.pages.flatMap((page) =>
        page.collection.map((item: any) => ({
          id: item.id,
          agenda: item.agenda || '-',
          visitor_type_id: item.visitor_type_id,
          visitor_type: item.visitor_type_name || '-',
          site_id: item.site_id,
          host_name: item.host_name || '-',
          visitor_period_start: formatDateTime(item.visitor_period_start),
          visitor_period_end: formatDateTime(item.visitor_period_end),
          invited_by: item.invited_by || '-',
        })),
      ) ?? []
    );
  }, [tableTransaction]);

  const totalFilteredRecords =
    tableTransaction?.pages[0]?.RecordsFiltered ?? 0;
  const totalRecords =
    tableTransaction?.pages[0]?.RecordsTotal ?? 0;

  const {
    data: detailData,
    isLoading: groupDetailLoading,
  } = useTransactionVisitorDetail(selectedGroupId as string);

  useEffect(() => {
    if (detailData?.collection) {
      setGroupVisitors(detailData.collection);
    } else {
      setGroupVisitors([]);
    }
  }, [detailData]);

  const groupHeader =
    detailData?.collection?.[0] ?? null;


  const [quickSearch, setQuickSearch] = useState('');
  const [quickPage, setQuickPage] = useState(0);
  const [quickRowsPerPage, setQuickRowsPerPage] = useState(10);

  const {
    data: quickAccessResult,
    isLoading: isLoadingQuickAccess,
  } = useQuickAccessPagination({
    page: quickPage,
    rowsPerPage: quickRowsPerPage,
    search: quickSearch,
  });

  const { createMutation: createQuickAccess } = useQuickAccessMutation();

  const processedQuickAccessData = useMemo(() => {
    if (!quickAccessResult?.collection) return [];

    return quickAccessResult.collection
      .map((item: any) => {
        const isExpired =
          item.visitor_period_end && dayjs(item.visitor_period_end).isBefore(dayjs(), 'day');

        return {
          id: item.id,
          visitor_type: item.visitor_type_name || '-',
          name: item.visitor_name || '-',
          // identity_id: item.visitor_identity_id || '-',
          email: item.visitor_email || '-',
          organization: item.visitor_organization_name || '-',
          receiver_name: item.receiver_name || '-',
          invitation_code: item.invitation_code || '-',
          phone: item.visitor_phone || '-',
          visitor_period_start: item.visitor_period_start || '-',
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          invitation_created_at: item.invitation_created_at,
          host: item.host ?? '-',
          visitor_status: isExpired ? 'Expired' : item.visitor_status || '-',
        };
      })
      .sort((a: any, b: any) => {
        const dateA = a.invitation_created_at ?? a.visitor_period_start;
        const dateB = b.invitation_created_at ?? b.visitor_period_start;

        return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
      })
      .map(({ invitation_created_at, ...rest }: any) => rest);
  }, [quickAccessResult]);

  const visitorTableData = {
    // data: visitorDataAll,
    dataQuickAccess: processedQuickAccessData,
    // RecordsFiltered: processedData.length,
    // RecordsTotal: processedData.length,
  };

  const cards = [
    {
      title: 'Total ' + t('visitor'),
      icon: IconUsers,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: t('add') + ' Pre Registration',
      icon: IconClipboard,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Share Link',
      icon: IconShare,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Quick Access',
      icon: IconBolt,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
  ];

  const handleCloseDialog = () => {
    setSelectedSite(null);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    handleDialogClose();
  };

  const handleAdd = () => {
    setEdittingId('');
    setFormDataAddVisitor(defaultFormData);
    setSelectedSite(null);
    setPendingEditId(null);
    setIsDirty(false);
    setOpenPreRegistration(true);
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
    setIsDirty(false);
    queryClient.invalidateQueries({ queryKey: ['visitors'] });
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
    setIsDirty(false);
  };

  const confirmDiscardAndClose = () => {
    resetFormData();
    setWizardKey((k) => k + 1);
    setConfirmDialogOpen(false);
    handleCloseDialog();
  };

  const handleView = async (id: string) => {
    if (!id) return;

    setOpenRelatedInvitation(true);

    try {
      const res = await getVisitorTransactionByIds(id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  const selectedVisitorData = useMemo(() => {
    return visitorDetail
      .filter((_, index) => selected.includes(index))
      .map((v, i) => ({
        id: v.id,
        name: v.visitor_name,
        phone: v.visitor_phone,
        email: v.visitor_email,
        agenda: v.agenda,
        visitor_period_start: formatDateTime(v.visitor_period_start),
        visitor_period_end: formatDateTime(v.visitor_period_end, v.extend_visitor_period),
        vehicle_type: v.vehicle_type,
        vehicle_plate_number: v.vehicle_plate_number || '-',
        site: v.site_place_name || '-',
        visitor_status: v.visitor_status,
      }));
  }, [visitorDetail, selected]);

  const handleCloseRelation = () => {
    setOpenRelatedInvitation(false);
    setVisitorDetail([]);
    setSelected([]);
    setVisitorError(null);
  };

  const [vtLoading, setVtLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const debounceSearch = useDebounce(searchHost, 400);
  const { data: allVisitorEmployee = [], isLoading: isLoadingEmployee } =
    useInvitationVisitorEmployee({
      search: debounceSearch,
      start: 0,
      length: 10,
    });

  const { visitorType } = useInvitationVisitorType();
  const { deleteMutation, createMutation, sendEmailMutation } = useShareLinkMutation();

  useEffect(() => {
    const fetchSecondaryData = async () => {
      const [employeeResult, siteResult] = await Promise.allSettled([
        getInvitationVisitorEmployee(),
        getInvitationSite(),
      ]);

      if (employeeResult.status === 'fulfilled') {
        setEmployee(employeeResult.value?.collection ?? []);
      } else {
        console.error('Error fetching employee:', employeeResult.reason);
        setEmployee([]);
      }

      if (siteResult.status === 'fulfilled') {
        setSites(siteResult.value?.collection ?? []);
      } else {
        console.error('Error fetching site:', siteResult.reason);
        setSites([]);
      }
    };

    fetchSecondaryData();
  }, []);


  const handleDeleteLink = async (id: string) => {
    try {
      const confirm = showConfirmDelete(t("confirmDelete", { name: 'Share Link' }));
      if (!confirm) return;

      // await deleteShareLink(id);
      await deleteMutation.mutateAsync(id);
      showSwal('success', t("deleteSuccess", { name: 'Share Link' }));
    } catch (error: any) {
      showSwal('error', error?.response.data.message || t("deleteFailed", { name: 'Share Link' }));
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };


  const handleAddShareLink = () => {
    setOpenCreateLink(true);
  };

  const getExpireText = () => {
    if (!expiredAt) return '';

    const now = new Date();
    const expireDate = new Date(expiredAt);

    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) return '0';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  };

  const handleSendInvitation = async (emails: any) => {
    const validEmails = emails.filter((email: any) => email?.trim() !== '');

    if (!validEmails.length || !selectedShareLinkId) {
      showSwal('error', t("pleaseSendAtleastOneEmail"));
      return;
    }
    try {
      const payload = {
        emails: emails,
      };

      await sendEmailMutation.mutateAsync({
        id: selectedShareLinkId,
        payload: {
          emails: validEmails,
        },
      });
      showSwal('success', t("successSendInvitation"));
    } catch (error: any) {
      showSwal('error', error?.response.data.message || 'Failed to send invitation');
    }
  };

  const handleOpenInviteDialog = async (row: any) => {
    const res = await getShareLinkById(row.id);
    setSelectedShareLink(res.collection);

    setSelectedShareLinkId(row.id);
    setGeneratedLink(row.shorten_url || row.url);
    setExpiredAt(row.expired_at);
    setOpenInviteViaLinkEmail(true);
  };

  const handleSendEmail = async (emails: string[]) => {
    try {
      const finalPayload = {
        ...pendingPayload,
        emails: emails,
      };
      await createMutation.mutateAsync(finalPayload);
      setOpenSendEmail(false);
      setOpenCreateLink(false);
      showSwal('success', t("successSendShareLink"));
    } catch (err) {
      showSwal('error', 'Failed to send share link');
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      await createMutation.mutateAsync(payload);

      setOpenCreateLink(false);
      showSwal('success', t("createSuccess", { name: 'Share Link' }));
    } catch (err: any) {
      showSwal('error', err.response.data.message ?? t("createFailed", { name: 'Share Link' }));
    }
  };

  const handleCreateQuickAccess = async (payload: any) => {
    try {
      await createQuickAccess.mutateAsync(payload);

      showSwal('success', t("createSuccess", { name: 'Quick Access' }));

      setOpenQuickAccess(false);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || t("createFailed", { name: 'Quick Access' }));
      throw error;
    }
  };

  const handleQuickSearch = useCallback((keyword: string) => {
    setQuickPage(0);
    setQuickSearch(keyword);
  }, []);

  const filteredVisitors = tableRowVisitors.filter((item) => {
    const keyword = searchAgenda.trim().toLowerCase();

    return (
      item.agenda?.toLowerCase().includes(keyword) ||
      item.host_name?.toLowerCase().includes(keyword)
    );
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelVisitor(id);

      showSwal('success', 'Transaction successfully cancelled');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to cancel visitor');
    }
  };

  const requestCloseDialog = () => {
    if (isFormChanged) {
      openDiscardForCloseAdd();
    } else {
      handleCloseDialog();
    }
  };

  return (
    <>
      <PageContainer title="Invitation" description="invitation page">
        <Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(_, index) => {
                  if (index === 1) {
                    setFlowTarget('preReg');
                    handleAdd();
                  } else if (index === 2) {
                    setOpenDetailShareLink(true);
                  } else if (index === 3) {
                    setOpenQuickAccess(true);
                  }
                }}
                size={{ xs: 12, lg: 3 }}
              />
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexDirection: mdUp ? 'row' : 'column',
                backgroundColor: '#fff',
                height: '100%',
                width: '100%',
                // overflow: 'hidden',
                marginTop: '5px',
              }}
            >
              <TransactionVisitorList
                mdUp={mdUp}
                secdrawerWidth={secdrawerWidth}
                loading={loading}
                loadingMore={loadingMore}
                searchAgenda={searchAgenda}
                setSearchAgenda={setSearchAgenda}
                filteredVisitors={filteredVisitors}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                setSelectedGroupId={setSelectedGroupId}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />
              <Box
                p={2}
                sx={{
                  height: { xs: 'auto', xl: '78vh' },
                  overflow: 'auto',
                  display: 'flex',
                  width: '100%',
                  flexDirection: {
                    xs: 'column',
                    md: 'row',
                  },
                  gap: 2,
                }}
              >
                {/* List */}
                <VisitorListTable
                  selectedGroupId={selectedGroupId}
                  groupHeader={groupHeader}
                  groupVisitors={groupVisitors}
                  groupDetailLoading={groupDetailLoading}
                  selectedVisitor={selectedVisitor}
                  setSelectedVisitor={setSelectedVisitor}
                  openGroup={openGroup}
                  setOpenGroup={setOpenGroup}
                />
                {/* Detail From List */}
                <VisitorDetailPanel selectedVisitor={selectedVisitor} tab={tab} setTab={setTab} />
              </Box>
            </Box>
          </Grid>
        </Box>
      </PageContainer>
      {/* Add Pre registration */}
      <Dialog
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
        open={openPreRegistration}
        onClose={requestCloseDialog}
      >
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          {t('add')} Pra Registration
          <IconButton aria-label="close" onClick={requestCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '10px' }} dividers>
          <Praregist
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            visitorType={visitorType}
            sites={sites}
            employee={allVisitorEmployee}
            allVisitorEmployee={allVisitorEmployee}
            vtLoading={vtLoading}
            search={setSearchHost}
            isLoadingEmployee={isLoadingEmployee}
          />
        </DialogContent>
      </Dialog>

      <QuickAccessDialog
        open={openQuickAccess}
        onClose={() => setOpenQuickAccess(false)}
        visitorTableData={visitorTableData.dataQuickAccess}
        loading={isLoadingQuickAccess}
        handleEmployeeClick={handleEmployeeClick}
        onSubmit={handleCreateQuickAccess}
        page={quickPage}
        setPage={setQuickPage}
        setRowsPerPage={setQuickRowsPerPage}
        searchKeyword={quickSearch}
        onSearch={handleQuickSearch}
        totalCount={quickAccessResult?.RecordsFiltered ?? 0}
      />

      {/* Employee Detail */}
      <EmployeeDetailDialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        employeeDetail={employeeDetail}
        employeeLoading={employeeLoading}
        employeeError={employeeError}
        axiosInstance2={axiosInstance2}
      />

      {/* Related Visitor */}
      <RelatedInvitationDialog
        open={openRelatedInvitation}
        onClose={handleCloseRelation}
        visitorDetail={visitorDetail}
        selected={selected}
        setSelected={setSelected}
        disabledIndexes={disabledIndexes}
        selectedVisitorData={selectedVisitorData}
      />

      {/* Share Link */}
      <ShareLinkDialog
        open={openDetailShareLink}
        onClose={() => setOpenDetailShareLink(false)}
        onCopyLink={(row) => handleOpenInviteDialog(row)}
        onDetailLink={handleDetailLink}
        onDelete={handleDeleteLink}
        onAddData={handleAddShareLink}
      />

      {/* Dialog Invite via link & invite via email */}
      <InvitationShareDialog
        open={openInviteViaLinkEmail}
        onClose={() => setOpenInviteViaLinkEmail(false)}
        generatedLink={generatedLink}
        getExpireText={getExpireText}
        expiredAt={expiredAt}
        handleCopyLink={handleCopyLink}
        handleSendInvitation={handleSendInvitation}
        shareLinkData={selectedShareLink}
      />

      <CreateLinkDialog
        open={openCreateLink}
        onClose={() => setOpenCreateLink(false)}
        onCreateLink={handleCreateLink}
        onSendEmail={(payload) => {
          setPendingPayload(payload);
          setOpenSendEmail(true);
        }}
      />

      <DetailLinkDialog
        open={openDetailLink}
        onClose={() => setOpenDetailLink(false)}
        dataVisitor={[]}
      />

      <SendEmailDialog
        open={openSendEmail}
        onClose={() => setOpenSendEmail(false)}
        onSend={handleSendEmail}
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
      <GlobalBackdropLoading open={createQuickAccess.isPending || createMutation.isPending || sendEmailMutation.isPending || deleteMutation.isPending} />
    </>
  );
};

export default Content;
