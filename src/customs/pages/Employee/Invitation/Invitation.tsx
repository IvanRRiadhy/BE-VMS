import React, { useState, useEffect,  useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  Grid2 as Grid,
  IconButton,
  Button,
  Typography,
  Portal,
  Snackbar,
  Alert,
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/components/container/PageContainer';
import iconAdd from '../../../..//assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getEmployeeById,
  getFormEmployee,
  getRegisteredSite,
  getVisitorById,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { IconClipboard, IconLink, IconShare, IconUsers, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Praregist from './Praregist';
import {
  getInvitationRelatedVisitor,
  getInvitations,
  getOngoingInvitation,
} from 'src/customs/api/visitor';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import EmployeeDetailDialog from '../Components/Dialog/EmployeeDetailDialog';
import SelectRegisteredSiteDialog from '../Components/Dialog/SelectRegisteredSiteDialog';
import { getInvitationSite, getInvitationVisitorType } from 'src/customs/api/Admin/InvitationData';
import {
  createShareLink,
  createShareLinkByEmail,
  createShareLinkByEmailById,
  deleteShareLink,
  getShareLinkByDt,
} from 'src/customs/api/ShareLink';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CreateLinkDialog from '../Components/Dialog/CreateLinkDialog';
import DetailLinkDialog from '../Components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../Components/Dialog/SendEmailDialog';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import RelatedInvitationDialog from '../Components/Dialog/RelatedInvitationDialog';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';

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
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
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
    {
      title: 'Share Link',
      icon: IconShare,
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
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any[]>([]);
  const [openRelatedInvitation, setOpenRelatedInvitation] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  // Registered Site
  const [siteData, setSiteData] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [generatedLink, setGeneratedLink] = useState('');
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortDir, setSortDir] = useState<string>('desc');
  const queryClient = useQueryClient();
  const [expiredAt, setExpiredAt] = useState<string | null>(null);

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
  const [emailInput, setEmailInput] = useState('');
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);

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
      return res.collection ?? [];
    },
    enabled: !!selectedEmployeeId && !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    // setEmployeeDetail(null);
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
    Denied: 'denied',
    Block: 'Block',
    Waiting: 'Waiting',
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);

      const start = page * rowsPerPage;

      try {
        // const response = await getInvitations(token as string, start_date, end_date);
        const response = await getOngoingInvitation(token as string);
        // const response = await getAllVisitorPagination(token as string, start, -1);

        let mapped = response.collection
          .map((item: any) => {
            const isEmployeeHost = item.host?.toLowerCase() === employeeId?.toLowerCase();

            return {
              id: item.id,
              visitor_type: item.visitor_type_name || '-',
              name: item.visitor_name || '-',
              identity_id: item.visitor_identity_id || '-',
              email: item.visitor_email || '-',
              organization: item.visitor_organization_name || '-',
              gender: item.visitor_gender || '-',
              phone: item.visitor_phone || '-',
              is_vip: item.visitor_is_vip || '-',
              visitor_period_start: item.visitor_period_start || '-',
              visitor_period_end:
                formatDateTime(item.visitor_period_end, item.extend_visitor_period) || '-',
              host: item.host ?? '-',
              employee: isEmployeeHost ?? '-',
              visitor_status: item.visitor_status || '-',

              // 👇 hanya untuk sorting (sementara)
              invitation_created_at: item.invitation_created_at,
            };
          })
          .sort(
            (a: any, b: any) =>
              dayjs(b.invitation_created_at).valueOf() - dayjs(a.invitation_created_at).valueOf(),
          )
          .map(({ invitation_created_at, ...rest }: any) => rest); 

        if (selectedType !== 'All') {
          const apiStatus = statusMap[selectedType];
          mapped = mapped.filter((r: any) => r.visitor_status === apiStatus);
        }
        setTableRowVisitors(mapped);
        setTableCustomVisitor(mapped);

        setTotalRecords(mapped.length);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setTableCustomVisitor([]);
        setTableRowVisitors([]);
      }
    };

    fetchData();
  }, [token, refreshTrigger, selectedType]);

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
      registered_site: '', // reset registered site
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
    if (!id || !token) return;

    setOpenRelatedInvitation(true);

    try {
      const res = await getInvitationRelatedVisitor(id, token);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  const [selected, setSelected] = useState<number[]>([]);
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

  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [vtLoading, setVtLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchSecondaryData = async () => {
      try {
        const [employeeRes, allEmployeeRes, siteRes] = await Promise.all([
          // getAllCustomField(token),
          getFormEmployee(token),
          getVisitorEmployee(token),
          getInvitationSite(token),
        ]);

        // setCustomField(customFieldRes?.collection ?? []);
        setEmployee(employeeRes?.collection ?? []);
        setAllVisitorEmployee(allEmployeeRes?.collection ?? []);
        setSites(siteRes?.collection ?? []);
      } catch (error) {
        console.error('Error fetching secondary data:', error);
      }
    };

    fetchSecondaryData();
  }, [token]);

  const fetchVisitorType = async () => {
    try {
      setVtLoading(true);
      const res = await getInvitationVisitorType(token as string);
      // const res = await getAllVisitorType(token as string);
      setVisitorType(res?.collection || []);
    } catch (err) {
      console.error(err);
    } finally {
      setVtLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorType();
  }, [token]);

  const handleDeleteLink = async (id: string) => {
    try {
      const confirm = await Swal.fire({
        title: 'Do you want to delete this link?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        confirmButtonColor: '#4caf50',
        customClass: {
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-text-custom',
        },
      });

      if (!confirm.isConfirmed) return;

      await deleteShareLink(token as string, id);
      await queryClient.invalidateQueries({
        queryKey: ['share-links'],
      });
      showSwal('success', 'Link deleted successfully.');
    } catch (error) {
      console.error('Delete link error:', error);
      showSwal('error', 'Something went wrong while deleting link.');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };

  const [pageSharelink, setPageSharelink] = useState(0);
  const [rowsPerPageSharelink, setRowsPerPageSharelink] = useState(10);
  const [searchKeywordSharelink, setSearchKeywordSharelink] = useState('');
  const [sortDirSharelink, setSortDirSharelink] = useState('desc');

  const startShareLink = pageSharelink * rowsPerPageSharelink;

  const {
    data,
    isLoading: isLoadingSharelink,
    isFetching,
  } = useQuery({
    queryKey: [
      'share-links',
      pageSharelink,
      rowsPerPageSharelink,
      searchKeywordSharelink,
      sortDirSharelink,
    ],
    queryFn: async () => {
      const res = await getShareLinkByDt(
        token as string,
        startShareLink,
        rowsPerPageSharelink,
        searchKeywordSharelink,
        sortDirSharelink,
      );

      return res;
    },

    staleTime: 1000 * 60 * 5,
    enabled: !!token,
    gcTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });

  const shareLinkList =
    data?.collection?.map((item: any) => ({
      id: item.id,
      agenda: item.agenda,
      url: item.url,
      max_usage: item.max_usage,
      visitor_period_start: formatDateTime(item.visitor_period_start),
      visitor_period_end: formatDateTime(item.visitor_period_end),
      expired_at: (() => {
        const date = new Date(item.expired_at + 'Z');

        const formattedDate = date
          .toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
          .replace(/\//g, '-');

        const formattedTime = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        return `${formattedDate}, ${formattedTime}`;
      })(),
      link_status: item.link_status,
    })) || [];

  const totalFilterRecords = data?.RecordsFiltered || 0;

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

  const handleSendInvitation = async () => {
    let finalEmails = [...emails];

    if (emailInput.trim() !== '') {
      finalEmails.push(emailInput.trim());
    }

    if (!finalEmails.length || !selectedShareLinkId) {
      showSwal('error', 'Please enter at least one email');
      return;
    }

    try {
      const payload = {
        emails: finalEmails,
      };

      // console.log('payload', payload);
      await createShareLinkByEmailById(token as string, payload, selectedShareLinkId);
      showSwal('success', 'Invitation sent successfully');

      setEmails([]);
      setEmailInput('');
    } catch (error) {
      console.error(error);
      showSwal('error', 'Failed to send invitation');
    }
  };

  const handleOpenInviteDialog = (id: string, link: string, expired_at: string) => {
    setSelectedShareLinkId(id);
    setGeneratedLink(link);
    setExpiredAt(expired_at);
    setTabValue(0);
    setOpenInviteViaLinkEmail(true);
  };

  const handleSendEmail = async (emails: string[]) => {
    try {
      setIsGenerating(true);

      const finalPayload = {
        ...pendingPayload,
        emails: emails,
      };

      await createShareLink(token as string, finalPayload);

      await queryClient.invalidateQueries({
        queryKey: ['share-links'],
      });

      setOpenSendEmail(false);
      setOpenCreateLink(false);

      showSwal('success', 'Share link sent successfully');
    } catch (err) {
      console.error(err);
      showSwal('error', 'Failed to send share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      setIsGenerating(true);

      await createShareLink(token as string, payload);

      await queryClient.invalidateQueries({
        queryKey: ['share-links'],
      });

      setOpenCreateLink(false);
      showSwal('success', 'Share link created successfully');
    } catch (err) {
      console.error(err);
      showSwal('error', 'Failed to create share link');
    } finally {
      setIsGenerating(false);
    }
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
                  if (index === 1) {
                    setFlowTarget('preReg');
                    setOpenPreRegistration(true);
                  } else if (index === 2) {
                    setOpenDetailShareLink(true);
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
                    setPage(0);
                    setRefreshTrigger((prev) => prev + 1);
                  }
                }}
                onAddData={() => {
                  handleAdd();
                }}
                isHaveFilterMore={false}
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* Add Pre registration */}
      <Dialog fullWidth maxWidth="xl" open={openPreRegistration} onClose={handleDialogClose}>
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
        <DialogContent sx={{ paddingTop: '10px' }}>
          <Praregist
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            visitorType={visitorType}
            sites={sites}
            employee={employee}
            allVisitorEmployee={allVisitorEmployee}
            // customField={customField}
            vtLoading={vtLoading}
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
      <Dialog
        open={openDetailShareLink}
        onClose={() => setOpenDetailShareLink(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>
          List Share Link
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenDetailShareLink(false);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DynamicTable
            loading={isLoadingSharelink}
            data={shareLinkList}
            isHaveHeaderTitle
            isHaveChecked={true}
            isNoActionTableHead={true}
            titleHeader="Share Link"
            isCopyLink={true}
            isHavePagination={true}
            totalCount={totalFilterRecords}
            rowsPerPageOptions={[10, 50, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            onCopyLink={(row: any) => handleOpenInviteDialog(row.id, row.url, row.expired_at)}
            onDetailLink={(row: any) => handleDetailLink(row)}
            onDelete={(row: any) => handleDeleteLink(row.id)}
            isHaveAddData={true}
            onAddData={handleAddShareLink}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Invite via link & invite via email */}
      <InvitationShareDialog
        open={openInviteViaLinkEmail}
        onClose={() => setOpenInviteViaLinkEmail(false)}
        generatedLink={generatedLink}
        getExpireText={getExpireText}
        handleCopyLink={handleCopyLink}
        handleSendInvitation={handleSendInvitation}
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
