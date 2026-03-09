import {
  Autocomplete,
  Backdrop,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Portal,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  IconClipboard,
  IconDetails,
  IconScript,
  IconTrash,
  IconX,
  IconUsers,
  IconLink,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import {
  createShareLink,
  createShareLinkByEmail,
  createShareLinkByEmailById,
  deleteShareLink,
  getShareLinkByDt,
} from 'src/customs/api/ShareLink';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import CreateLinkDialog from '../../Employee/Components/Dialog/CreateLinkDialog';
import { showSwal } from 'src/customs/components/alerts/alerts';
import DetailLinkDialog from '../../Employee/Components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../../Employee/Components/Dialog/SendEmailDialog';
import iconAdd from '../../../..//assets/images/svgs/add-circle.svg';
import { getAllEmployee, getAllVisitorPagination, getAllVisitorType } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import FormWizardAddInvitation from '../Invitation/FormWizardAddInvitation';
import {
  CreateVisitorRequest,
  CreateVisitorRequestSchema,
} from 'src/customs/api/models/Admin/Visitor';
import Swal from 'sweetalert2';
import { getInvitationSite, getInvitationVisitorEmployee } from 'src/customs/api/InvitationData';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';
import moment from 'moment';

const Visitor = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [sortDir, setSortDir] = useState('desc');
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const start = page * rowsPerPage;
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [resetStep, setResetStep] = useState(0);
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [vtLoading, setVTLoading] = useState(false);


  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['share-links', page, rowsPerPage, searchKeyword, sortDir],
    queryFn: async () => {
      const res = await getShareLinkByDt(
        token as string,
        start,
        rowsPerPage,
        searchKeyword,
        sortDir,
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
      current_usage: item.current_usage,
      max_usage: item.max_usage,
      visitor_period_start: formatDateTime(item.visitor_period_start),
      visitor_period_end: formatDateTime(item.visitor_period_end),
      expired_at: new Date(item.expired_at + 'Z').toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      link_status: item.link_status,
    })) || [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;

  const {
    data: dataPreRegistration,
    isLoading: isLoadingPreRegistration,
    isFetching: isFetchingPreRegistration,
  } = useQuery({
    queryKey: ['visitor', page, rowsPerPage, searchKeyword, sortDir],
    queryFn: async () => {
      //   const res = await getInvitationVisitor(token as string);
      const res = await getAllVisitorPagination(
        token as string,
        start,
        rowsPerPage,
        searchKeyword,
        sortDir,
      );

      return res;
    },

    staleTime: 1000 * 60 * 5,
    enabled: !!token,
    gcTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });

  const visitorList =
    dataPreRegistration?.collection?.map((item: any) => ({
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
    })) || [];

  const cards = [
    {
      title: 'Total Visitor',
      subTitle: `0`,
      subTitleSetting: 10,
      icon: IconUsers,
      color: 'none',
    },
    {
      title: 'Add Pra Registration',
      icon: IconClipboard,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Share Link',
      //   subTitle: `${totalRecords}`,
      subTitle: iconAdd,
      icon: IconLink,
      color: 'none',
      //   onclick: handleOpenLink,
      subTitleSetting: 'image',
    },
  ];

  const handleAdd = () => {
    setOpenCreateLink(true);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseDialog = () => {
    localStorage.removeItem('unsavedVisitorData');
    setFormDataAddVisitor(CreateVisitorRequestSchema.parse({}));
    setResetStep((prev) => prev + 1);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setOpenDialogIndex(null);
    setWizardKey((k) => k + 1);
  };

  const handleSuccess = async () => {
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    handleCloseDialog();
  };

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

  useEffect(() => {
    if (token) {
      fetchVisitorType();
    }
  }, [token]);

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => getInvitationSite(token as string),
    enabled: !!token,
    staleTime: 1000 * 60 * 30,
  });

  const { data: employee = [] } = useQuery({
    queryKey: ['employee'],
    queryFn: () => getAllEmployee(token as string),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });

  const { data: allVisitorEmployee = [] } = useQuery({
    queryKey: ['all-visitor-employee'],
    queryFn: () => getInvitationVisitorEmployee(token as string),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });

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

      console.log('payload', payload);
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

  return (
    <PageContainer title="Visitor" description="Visitor page">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard
              cardMarginBottom={1}
              items={cards}
              onImageClick={(_, index) => {
                if (index === 1) {
                  setOpenPreRegistration(true);
                } else if (index === 2) {
                  setOpenDetailShareLink(true);
                } else {
                  setOpenDialogIndex(index);
                }
              }}
              size={{ xs: 12, lg: 4 }}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              loading={isFetchingPreRegistration}
              overflowX={'auto'}
              data={visitorList}
              isHavePagination={true}
              // selectedRows={selectedRows}
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 50, 100]}
              onPaginationChange={(page, rowsPerPage) => {
                setPage(page);
                setRowsPerPage(rowsPerPage);
              }}
              isHaveChecked={true}
              isHaveAction={false}
              isHaveSearch={true}
              isHaveFilter={false}
              isHaveFilterDuration={false}
              isHaveAddData={false}
              isHaveFilterMore={false}
              isHaveHeader={false}
              isHavePdf={false}
              onAddData={() => {
                handleAdd();
              }}
            />
          </Grid>

          {/* Dialog Invite via link & invite via email */}
          <InvitationShareDialog
            open={openInviteViaLinkEmail}
            onClose={() => setOpenInviteViaLinkEmail(false)}
            generatedLink={generatedLink}
            getExpireText={getExpireText}
            handleCopyLink={handleCopyLink}
            handleSendInvitation={handleSendInvitation}
          />

          {/* Share Link */}
          <CreateLinkDialog
            open={openCreateLink}
            onClose={() => setOpenCreateLink(false)}
            onCreateLink={async (payload) => {
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
            }}
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
            onSend={async (emails: string[]) => {
              try {
                setIsGenerating(true);

                const finalPayload = {
                  ...pendingPayload,
                  emails: emails,
                };

                await createShareLinkByEmail(token as string, finalPayload);
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
            }}
          />

          {/* List Share Link */}
          <Dialog
            open={openDetailShareLink}
            onClose={() => setOpenDetailShareLink(false)}
            fullWidth
            maxWidth="lg"
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
                data={shareLinkList}
                isHaveHeaderTitle
                isHaveChecked={true}
                isNoActionTableHead={true}
                titleHeader="Share Link"
                isCopyLink={true}
                onCopyLink={(row: any) => handleOpenInviteDialog(row.id, row.url, row.expired_at)}
                onDetailLink={(row: any) => handleDetailLink(row)}
                onDelete={(row: any) => handleDeleteLink(row.id)}
                isHaveAddData={true}
                onAddData={handleAdd}
              />
            </DialogContent>
          </Dialog>

          {/* Praregistration */}
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
            onClose={handleCloseDialog}
          >
            <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
              Add Pra Registration
              <IconButton
                aria-label="close"
                onClick={() => {
                  handleCloseDialog();
                }}
              >
                <IconX />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ paddingTop: '0px' }}>
              <br />
              <FormWizardAddInvitation
                key={wizardKey}
                formData={formDataAddVisitor}
                setFormData={setFormDataAddVisitor}
                onSuccess={handleSuccess}
                containerRef={null}
                visitorType={visitorType}
                sites={sites}
                employee={employee}
                allVisitorEmployee={allVisitorEmployee}
                vtLoading={vtLoading}
              />
            </DialogContent>
          </Dialog>
        </Grid>
      </Box>
      <Portal>
        <Backdrop
          sx={{
            zIndex: 99999,
            position: 'fixed',
            margin: '0 auto',
            color: 'primary',
          }}
          open={isGenerating}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Visitor;
