import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import InvitationShareDialog from '../../Trx/components/Dialog/InvitationShareDialog';
import CreateLinkDialog from '../../Trx/components/Dialog/CreateLinkDialog';
import DetailLinkDialog from '../../Trx/components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../../Trx/components/Dialog/SendEmailDialog';
import { useShareLinkPagination } from 'src/hooks/Visitor/useShareLinkPagination';
import { getShareLinkById } from 'src/customs/api/Admin/ShareLink';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useTranslation } from 'react-i18next';
import { useShareLinkMutation } from 'src/hooks/Visitor/useShareLinkMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
interface ShareLinkProps {
  open: boolean;
  onClose: () => void;
}
const ShareLink = ({ open, onClose }: ShareLinkProps) => {
  const [shareLinkDialogPage, setShareLinkDialogPage] = useState(0);
  const [shareLinkDialogRowsPerPage, setShareLinkDialogRowsPerPage] = useState(10);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const { t } = useTranslation();
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const [selectedShareLink, setSelectedShareLink] = useState<any>(null);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: shareLinkDialogData, isLoading: isLoadingShareLinkDialog } = useShareLinkPagination(
    {
      page: shareLinkDialogPage,
      rowsPerPage: shareLinkDialogRowsPerPage,
      search: searchKeyword,
      sortDir,
    },
  );
  const shareLinkDialogList = shareLinkDialogData?.collection ?? [];
  const totalFilteredRecords = shareLinkDialogData?.RecordsFiltered ?? 0;
  const { deleteMutation, createMutation, sendEmailMutation } = useShareLinkMutation();
  const handleAddShareLink = () => {
    // setOpenShareLinkList(false);
    setOpenCreateLink(true);
  };
  const handleDetailLink = (link: string) => {
    // window.open(link, '_blank');
    setOpenDetailLink(true);
  };
  const handleOpenInviteDialog = async (row: any) => {
    const res = await getShareLinkById(row.id);
    setSelectedShareLink(res.collection);
    setSelectedShareLinkId(row.id);
    setGeneratedLink(row.shorten_url || row.url);
    setExpiredAt(row.expired_at);
    setOpenInviteViaLinkEmail(true);
  };
  const handleDeleteLink = async (id: string) => {
    try {
      const confirm = await showSwal('confirm', t('confirmDelete', { name: 'Share Link' }));

      if (!confirm.isConfirmed) return;
      await deleteMutation.mutateAsync(id);
      showSwal('success', t('deleteSuccess', { name: 'Share Link' }));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to delete share link');
    }
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

  const handleCopyLink = async (link: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement('textarea');

        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const copied = document.execCommand('copy');

        document.body.removeChild(textArea);

        if (!copied) {
          throw new Error('Failed to copy');
        }
      }

      showSwal('success', 'Link copied to clipboard.');
    } catch (error) {
      showSwal('error', 'Failed to copy link.');
    }
  };

  const handleSendInvitation = async (emails: any) => {
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
    } catch (error: any) {
      showSwal('error', error?.response.data.message || 'Failed to send invitation');
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      setIsGenerating(true);

      await createMutation.mutateAsync(payload);
      setOpenCreateLink(false);
      showSwal('success', t('createSuccess', { name: 'Share Link' }));
    } catch (err: any) {
      showSwal('error', err.response.data.message ?? 'Failed to create share link');
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSendEmail = async (emails: string[]) => {
    try {
      setIsGenerating(true);
      const finalPayload = {
        ...pendingPayload,
        emails: emails,
      };
      await createMutation.mutateAsync(finalPayload);
      setOpenSendEmail(false);
      setOpenCreateLink(false);
      showSwal('success', t('successSendShareLink'));
    } catch (err: any) {
      showSwal('error', err.response.data.message ?? 'Failed to send share link');
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <Box>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
        <DialogTitle>
          Share Link
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DynamicTable
            loading={isLoadingShareLinkDialog}
            data={shareLinkDialogList}
            overflowX="auto"
            isHaveChecked={true}
            titleHeader="Link Share Visitor"
            isHaveHeaderTitle={true}
            isCopyLink={true}
            isNoActionTableHead={true}
            isHaveAddData={true}
            isHavePagination
            currentPage={shareLinkDialogPage}
            totalCount={totalFilteredRecords}
            isDetailLink={true}
            defaultRowsPerPage={shareLinkDialogRowsPerPage}
            rowsPerPageOptions={[10, 50, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setShareLinkDialogPage(page);
              setShareLinkDialogRowsPerPage(rowsPerPage);
            }}
            onCopyLink={(row: any) => handleOpenInviteDialog(row)}
            onDetailLink={(row: any) => handleDetailLink(row)}
            onDelete={(row: any) => handleDeleteLink(row.id)}
            onAddData={handleAddShareLink}
          />
        </DialogContent>
      </Dialog>

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
      <GlobalBackdropLoading open={isGenerating || deleteMutation.isPending} />
    </Box>
  );
};

export default ShareLink;
