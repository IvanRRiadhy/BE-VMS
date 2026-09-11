import React, { useCallback, useState } from 'react';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Container from 'src/components/container/PageContainer';
import { Box, Grid2 as Grid } from '@mui/material';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useShareLinkPagination } from 'src/hooks/Visitor/useShareLinkPagination';
import { getShareLinkById } from 'src/customs/api/Admin/ShareLink';
import { useShareLinkMutation } from 'src/hooks/Visitor/useShareLinkMutation';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import TopCard from 'src/customs/components/cards/TopCard';
import { IconLink, IconUsers } from '@tabler/icons-react';
import SendEmailDialog from '../../admin/content/Visitor/Trx/components/Dialog/SendEmailDialog';
import DetailLinkDialog from '../../admin/content/Visitor/Trx/components/Dialog/DetailLinkDialog';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';
import CreateLinkDialog from '../../admin/content/Visitor/Trx/components/Dialog/CreateLinkDialog';
const Content = () => {
  // const [page, setPage] = useState(0);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  const { data, isLoading } = useShareLinkPagination({
    page,
    rowsPerPage,
    search: searchKeyword,
    sortDir,
  });

  const shareLinkList = data?.collection ?? [];

  const totalFilterRecords = data?.RecordsFiltered ?? 0;

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const cards = [
    {
      title: 'Total Share Link',
      icon: IconLink,
      subTitle: `${totalFilterRecords}`,
      color: 'none',
    },
  ];

  const [selectedShareLink, setSelectedShareLink] = useState(null);
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);

  const handleOpenInviteDialog = async (row: any) => {
    const res = await getShareLinkById(row.id);
    setSelectedShareLink(res.collection);
    setSelectedShareLinkId(row.id);
    setGeneratedLink(row.shorten_url || row.url);
    setExpiredAt(row.expired_at);
    setOpenInviteViaLinkEmail(true);
  };

  const handleAddShareLink = () => {
    setOpenCreateLink(true);
  };

  const { createMutation, deleteMutation, sendEmailMutation } = useShareLinkMutation();
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const isGenerating =
    createMutation.isPending || sendEmailMutation.isPending || deleteMutation.isPending;
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const { t } = useTranslation();

  const handleCreateLink = async (payload: any) => {
    try {
      await createMutation.mutateAsync(payload);
      setOpenCreateLink(false);
      showSwal('success', 'Share link created successfully');
    } catch (err: any) {
      showSwal('error', err?.response.data.message || 'Failed to create share link');
    }
  };

  const handleSendEmail = async (emails: string[]) => {
    try {
      const finalPayload = {
        ...pendingPayload,
        emails: emails,
      };
      // await createShareLink(finalPayload);
      await createMutation.mutateAsync(finalPayload);
      setOpenSendEmail(false);
      setOpenCreateLink(false);
      showSwal('success', t('successSendShareLink'));
    } catch (err: any) {
      showSwal('error', err?.response.data.message || 'Failed to send share link');
    }
  };
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };

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

      await deleteMutation.mutateAsync(id);
      showSwal('success', 'Successfully deleted link.');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message ?? 'Failed to delete link.');
    }
  };

  const getExpireText = () => {
    if (!expiredAt) return '';

    const cleanDate = expiredAt.replace(/\.\d+/, '') + 'Z';
    const expireDate = new Date(cleanDate);

    if (isNaN(expireDate.getTime())) return '';

    const now = new Date();
    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} left`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  };

  const handleSendInvitation = async (emails: string[]) => {
    const validEmails = emails.filter((email: any) => email?.trim() !== '');

    if (!validEmails.length || !selectedShareLinkId) {
      showSwal('error', t('pleaseSendAtleastOneEmail'));
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        id: selectedShareLinkId,
        payload: {
          emails: validEmails,
        },
      });
      showSwal('success', t('successSendInvitation'));
      // setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response.data.msg || 'Failed to send invitation');
    }
  };

  return (
    <Container title="Share Link" description="Manage Share Link">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              data={shareLinkList}
              loading={isLoading}
              isHaveHeaderTitle={false}
              isHaveSearch={true}
              onSearch={handleSearch}
              isHaveChecked={true}
              isNoActionTableHead={true}
              currentPage={page}
              // titleHeader="Share Link"
              isCopyLink={true}
              isHavePagination={true}
              defaultRowsPerPage={rowsPerPage}
              totalCount={totalFilterRecords}
              rowsPerPageOptions={[10, 50, 100]}
              onPaginationChange={(newPage: any, newRowsPerPage: any) => {
                setPage(newPage);
                setRowsPerPage(newRowsPerPage);
              }}
              onCopyLink={(row: any) => handleOpenInviteDialog(row)}
              onDetailLink={(row: any) => handleDetailLink(row.shorten_url || row.url)}
              onDelete={(row: any) => handleDeleteLink(row.id)}
              isHaveAddData={true}
              onAddData={handleAddShareLink}
            />
          </Grid>
        </Grid>
      </Box>
      <CreateLinkDialog
        open={openCreateLink}
        onClose={() => setOpenCreateLink(false)}
        onCreateLink={handleCreateLink}
        onSendEmail={(payload) => {
          setPendingPayload(payload);
          setOpenSendEmail(true);
        }}
        loading={isGenerating}
      />
      <SendEmailDialog
        open={openSendEmail}
        onClose={() => setOpenSendEmail(false)}
        onSend={handleSendEmail}
        loading={isGenerating}
      />

      <DetailLinkDialog
        open={openDetailLink}
        onClose={() => setOpenDetailLink(false)}
        dataVisitor={[]}
      />
      <InvitationShareDialog
        open={openInviteViaLinkEmail}
        onClose={() => setOpenInviteViaLinkEmail(false)}
        generatedLink={generatedLink}
        getExpireText={getExpireText}
        expiredAt={expiredAt}
        handleCopyLink={handleCopyLink}
        handleSendInvitation={handleSendInvitation}
        shareLinkData={selectedShareLink}
        loading={isGenerating}
      />
    </Container>
  );
};

export default Content;
