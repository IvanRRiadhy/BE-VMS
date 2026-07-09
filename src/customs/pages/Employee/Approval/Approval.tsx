import {
  Backdrop,
  Button,
  CircularProgress,
  Grid2 as Grid,
  useMediaQuery,
} from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { IconBan, IconCheck, IconClock, IconScript, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { useSession } from 'src/customs/contexts/SessionContext';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import { showSwal } from 'src/customs/components/alerts/alerts';
import {
  approveMeetingHost,
  approveTicket,
  getApprovalTicket,
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

type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Approval = () => {
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const secdrawerWidth = 300;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);
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
  const { t } = useTranslation();
  const getApprovalCounts = () => {
    const counts = {
      total: approvalData.length,
      approve: 0,
      reject: 0,
      pending: 0,
    };

    approvalData.forEach((item) => {
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
  const cards = [
    {
      title: 'Total Approval',
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      icon: IconScript,
      color: 'none',
    },
    {
      title: 'Total Approve',
      subTitle: `${approve}`,
      subTitleSetting: 10,
      icon: IconCheck,
      color: 'none',
    },
    {
      title: 'Total Reject',
      subTitle: `${reject}`,
      subTitleSetting: 10,
      icon: IconBan,
      color: 'none',
    },
    {
      title: 'Total Pending',
      subTitle: `${pending}`,
      subTitleSetting: 10,
      icon: IconClock,
      color: 'none',
    },
  ];

  const hasMore = approvalData.length < totalFilteredRecords;

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;

        const res = await getApprovalTicket(token, {
          start,
          length: rowsPerPage,
          sort_dir: sortDir,
          keyword: debouncedKeyword,
          entity_type: 'Invitation',
        });

        const rows = res.collection.map((item: any) => ({
          approval_ticket_id: item.approval_ticket_id,
          visitor_type_name: item.visitor_type_name,
          agenda: item.agenda,
          host_name: item.host_name,
          entity_id: item.entity_id,
          ticket_id: item.ticket_id,
          approval_actor_status: item.approval_actor_status,
          approval_workflow_type: item.approval_workflow_type,
          approval_status: item.approval_status,
          current_step: item.current_step,
          visitor_period_start: formatDateTime(item.visitor_period_start),
          visitor_period_end: formatDateTime(item.visitor_period_end),
        }));
        // setApprovalData(rows);
        setApprovalData((prev) => (page === 0 ? rows : [...prev, ...rows]));

        setTotalFilteredRecords(res.RecordsFiltered);
        setTotalRecords(res.RecordsTotal);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger, debouncedKeyword, sortDir, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, sortDir]);

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    // if (!id || !token) return;
    // console.log('id', id);

    try {
      // const confirm = await Swal.fire({
      //   title: `Do you want to ${action === 'Approve' ? 'Approve' : 'Reject'} this approval?`,
      //   icon: 'question',
      //   // imageUrl: BI_LOGO,
      //   imageWidth: 100,
      //   imageHeight: 100,
      //   reverseButtons: true,
      //   showCancelButton: true,
      //   confirmButtonText: action === 'Approve' ? 'Yes' : 'No',
      //   cancelButtonText: 'Cancel',
      //   confirmButtonColor: action === 'Approve' ? '#4caf50' : '#f44336',
      //   customClass: {
      //     title: 'swal2-title-custom',
      //     htmlContainer: 'swal2-text-custom',
      //   },
      // });
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

      // if (!confirm.isConfirmed) return;

      setLoadingAction(true);
      // console.log('Performing action:', action, 'on approval ticket ID:', id);

      // await createApproval(token, { action }, id);
      if (action === 'Approve') await approveTicket(token as string, id);
      if (action === 'Reject') await rejectTicket(token as string, id);

      showSwal(
        'success',
        `Data Approval ${action === 'Approve' ? 'approved' : 'denied'} successfully.`,
      );

      setRefreshTrigger((prev) => prev + 1);
      setOpenDialog(false);
    } catch (error: any) {
      setTimeout(() => setLoadingAction(false), 800);
      showSwal('error', error.response.data.msg || 'Failed action approval.');
    } finally {
      setLoadingAction(false);
    }
  };

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const handleApproveMeetingHost = async (id: string) => {
    // console.log('id', id);
    try {
      setLoading(true);

      const payload = {
        list_trx_visitor_id: selectedRows.map((item: any) => item.id),
      };

      // console.log('payload', payload);

      const response = await approveMeetingHost(token, id, payload);
      // console.log('response', response);

      const res = await handleActionApproval(id, 'Approve');
      // console.log('res', res);

      showSwal('success', response?.msg || 'Approve meeting host successfully.');

      setSelectedRows([]);
      // setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed approve meeting host.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedGroupId || !token) return;

    const fetchDetail = async () => {
      setGroupDetailLoading(true);
      try {
        // const res = await getVisitorTransactionByIds(token, selectedGroupId);
        const res = await getVisitorByTickedId(token, selectedGroupId);
        setGroupHeader(res.collection[0]);
        setGroupVisitors(res.collection);
      } catch (e) {
        setGroupVisitors([]);
      } finally {
        setGroupDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedGroupId, token]);

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
    if (!selectedGroupId || !token) return;

    setGroupDetailLoading(true);
    try {
      const res = await getVisitorByTickedId(token, selectedGroupId);
      setGroupHeader(res.collection[0]);
      setGroupVisitors(res.collection);
    } catch {
      setGroupVisitors([]);
    } finally {
      setGroupDetailLoading(false);
    }
  }, [selectedGroupId, token]);

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
      const res = await getVisitorTransactionByIds(token as string, group.entity_id);

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
                  loading={loading}
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
      <Backdrop
        open={loadingAction}
        sx={{
          color: '#fff',
          zIndex: 99999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </>
  );
};

export default Approval;
