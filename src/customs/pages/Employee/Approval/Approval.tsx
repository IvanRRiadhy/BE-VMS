import { Grid2 as Grid, useMediaQuery } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { IconBan, IconCheck, IconClock, IconScript, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import { showSwal } from 'src/customs/components/alerts/alerts';
import {
  getVisitorByTickedId,
  rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import { getVisitorTransactionByIds } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import VisitorApprovalDialog from './components/VisitorApprovalDialog';
import VisitorRow from './components/VisitorRow';
import { exportVisitorExcel, exportVisitorPdf } from '../Invitation/components/VisitorExport';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'src/hooks/useDebounce';
import ApprovalSidebar from './components/ApprovalSidebar';
import Swal from 'sweetalert2';
import GroupVisitorTable from './components/GroupVisitorTable';
import { useApprovalPagination } from 'src/hooks/Approval/useApprovalPagination';
import { useApprovalMutation } from 'src/hooks/Approval/useApprovalMutation';
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';

type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Approval = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const secdrawerWidth = 300;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState(true);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [groupHeader, setGroupHeader] = useState<any | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const debouncedKeyword = useDebounce(searchKeyword, 500);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isFetching,
  } = useApprovalPagination({
    page,
    rowsPerPage,
    search: debouncedKeyword,
    sortDir,
  });

  const approvalData = data?.collection ?? [];
  const totalRecords = data?.totalRecords ?? 0;
  const totalFilteredRecords = data?.totalFiltered ?? 0;

  const hasMore = approvalData.length < totalFilteredRecords;
  const getApprovalCounts = () => {
    const counts = {
      total: approvalData.length,
      approve: 0,
      reject: 0,
      pending: 0,
    };

    approvalData.forEach((item: any) => {
      const status = item.approval_status;

      if (status === 'Approved' || status === 'Accept') {
        counts.approve++;
      } else if (status === 'Reject' || status === 'Deny') {
        counts.reject++;
      } else {
        counts.pending++;
      }
    });

    return counts;
  };


  const { total, approve, reject, pending } = getApprovalCounts();
  const cards = useMemo(
    () => [
      {
        title: t('totalApproval'),
        subTitle: `${totalFilteredRecords}`,
        icon: IconScript,
        color: 'none',
      },
      {
        title: t("totalApprove"),
        subTitle: `${approve}`,
        icon: IconCheck,
        color: 'none',
      },
      {
        title: t("totalReject"),
        subTitle: `${reject}`,
        icon: IconBan,
        color: 'none',
      },
      {
        title: t("totalPending"),
        subTitle: `${pending}`,
        icon: IconClock,
        color: 'none',
      },
    ],
    [totalFilteredRecords, approve, reject, pending, t]
  );

  const {
    approveMutation,
    rejectMutation,
    approveMeetingHostMutation,
  } = useApprovalMutation();

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {

    try {
      if (action === 'Reject') {
        const confirm = await Swal.fire({
          title: 'Reject Approval?',
          text: 'Do you want to reject this approval?',
          icon: 'warning',
          reverseButtons: true,
          showCancelButton: true,
          confirmButtonText: 'Reject',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#f44336',
          customClass: {
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-text-custom',
          },
        });

        if (!confirm.isConfirmed) return;
      }
      // await createApproval(token, { action }, id);
      if (action === 'Approve') await approveMutation.mutateAsync(id);
      if (action === 'Reject') await rejectMutation.mutateAsync(id);

      showSwal(
        'success',
        `Data Approval ${action === 'Approve' ? 'approved' : 'denied'} successfully.`,
      );

      setOpenDialog(false);
    } catch (error: any) {
      showSwal('error', error.response.data.msg || 'Failed action approval.');
    }
  };


  const handleApproveMeetingHost = async (id: string) => {
    try {
      const payload = {
        list_trx_visitor_id: selectedRows.map((item: any) => item.id),
      };

      // console.log('payload', payload);
      const response = await approveMeetingHostMutation.mutateAsync({
        id,
        payload: {
          list_trx_visitor_id: selectedRows.map((item) => item.id),
        },
      });
      const res = await handleActionApproval(id, 'Approve');
      showSwal('success', response?.msg || 'Approve meeting host successfully.');

      setSelectedRows([]);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed approve meeting host.');
    }
  };

  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchDetail = async () => {
      setGroupDetailLoading(true);
      try {
        // const res = await getVisitorTransactionByIds(token, selectedGroupId);
        const res = await getVisitorByTickedId(selectedGroupId);
        setGroupHeader(res.collection[0]);
        setGroupVisitors(res.collection);
      } catch (e) {
        setGroupVisitors([]);
      } finally {
        setGroupDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedGroupId]);

  const visitorTableData = groupVisitors.map((item: any) => ({
    id: item.id,
    name: item.visitor_name,
    agenda: item.agenda,
    site_name: item.site_place_name,
    organization_name: item.visitor_organization_name,
    identity_id: item.visitor_identity_id,
    visitor_phone: item.visitor_phone,
    email: item.visitor_email,
    site_place: item.site_place_name,
    visitor_period_start: formatDateTime(item.visitor_period_start),
    visitor_period_end: formatDateTime(item.visitor_period_end),
  }));

  const [triggerCheckAll, setTriggerCheckAll] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTriggerCheckAll(false);
  };

  const fetchGroupDetail = useCallback(async () => {
    if (!selectedGroupId) return;

    setGroupDetailLoading(true);
    try {
      const res = await getVisitorByTickedId(selectedGroupId);
      setGroupHeader(res.collection[0]);
      setGroupVisitors(res.collection);
    } catch {
      setGroupVisitors([]);
    } finally {
      setGroupDetailLoading(false);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    fetchGroupDetail();
  }, [fetchGroupDetail]);

  const handleOpenApprovalDialog = async (
    e: React.MouseEvent,
    group: any,
    action: 'Approve' | 'Reject',
  ) => {
    e.stopPropagation();

    // Reject langsung eksekusi
    if (action === 'Reject') {
      await handleActionApproval(group.approval_ticket_id, 'Reject');
      return;
    }

    // Approve
    setSelectedGroup(group);
    setSelectedId(group.approval_ticket_id);
    setGroupVisitors([]);
    setGroupDetailLoading(true);
    setOpenDialog(true);

    try {
      const res = await getVisitorTransactionByIds(group.entity_id);

      setGroupHeader(res.collection[0]);
      setGroupVisitors(res.collection);

      setSelectedRows(res.collection);
      setTriggerCheckAll(false);

      setTimeout(() => {
        setTriggerCheckAll(true);
      }, 0);
    } catch (err) {
      console.error(err);
    } finally {
      setGroupDetailLoading(false);
    }
  };

  return (
    <>
      <PageContainer title="Approval" description="Approval page">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
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
                {/* Left */}
                <ApprovalSidebar
                  mdUp={mdUp}
                  secdrawerWidth={secdrawerWidth}
                  loading={isLoading}
                  approvalData={approvalData}
                  selectedId={selectedId}
                  searchKeyword={searchKeyword}
                  setSearchKeyword={setSearchKeyword}
                  hasMore={hasMore}
                  setPage={setPage}
                  onSelectGroup={(group) => {
                    setSelectedGroup(group);
                    setSelectedGroupId(group.ticket_id);
                    setSelectedId(group.approval_ticket_id);
                  }}
                  onOpenApprovalDialog={handleOpenApprovalDialog}
                />
                {/* Right */}
                <GroupVisitorTable
                  selectedGroupId={selectedGroupId}
                  openGroup={openGroup}
                  setOpenGroup={setOpenGroup}
                  groupHeader={groupHeader}
                  groupVisitors={groupVisitors}
                  groupDetailLoading={groupDetailLoading}
                  exportVisitorPdf={exportVisitorPdf}
                  exportVisitorExcel={exportVisitorExcel}
                  formatDateTime={formatDateTime}
                  VisitorRow={VisitorRow}
                  bgNoData={bg_nodata}
                  t={t}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      <VisitorApprovalDialog
        open={openDialog}
        onClose={handleCloseDialog}
        groupName={groupHeader?.group_name}
        loading={groupDetailLoading}
        visitorTableData={visitorTableData ?? []}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        triggerCheckAll={triggerCheckAll}
        selectedId={selectedId ?? undefined}
        onReject={async (id) => {
          await handleActionApproval(id, 'Reject');
          await fetchGroupDetail();
          setOpenDialog(false);
        }}
        onApprove={async (id) => {
          await handleApproveMeetingHost(id);
          await fetchGroupDetail();
          setOpenDialog(false);
        }}
      />
      <GlobalBackdropLoading open={approveMutation.isPending || rejectMutation.isPending || approveMeetingHostMutation.isPending} />
    </>
  );
};

export default Approval;
