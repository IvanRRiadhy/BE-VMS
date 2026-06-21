import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import { Box } from '@mui/system';
import BI_LOGO from 'src/assets/images/logos/BI_Logo.png';
import { IconBan, IconCheck, IconScript, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import FilterMoreContent from '../Dashboard/FilterMoreContent';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import {
  approveMeetingHost,
  approveTicket,
  getApprovalTicket,
  getVisitorByTickedId,
  rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface Filters {
  is_action: boolean | null | undefined;
  start_date: string;
  end_date: string;
  site_approval: number | null;
  approval_type: string;
}

const Approval = () => {
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [openVisitorApproval, setOpenVisitorApproval] = useState(false);

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
  ];

  const [filters, setFilters] = useState<Filters>({
    is_action: undefined,
    start_date: '',
    end_date: '',
    site_approval: 0,
    approval_type: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

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
          keyword: searchKeyword,
          approval_status: selectedType === 'All' ? '' : selectedType,
        });

        const rows = res.collection.map((item: any) => ({
          id: item.approval_ticket_id,
          agenda: item.agenda,
          host: item.host_name,
          approval_actor_status: item.approval_actor_status,
          approval_workflow_type: item.approval_workflow_type,
          approval_status: item.approval_status,
          current_step: item.current_step,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end),
        }));
        setApprovalData(rows);

        setTotalFilteredRecords(res.RecordsFiltered);
        setTotalRecords(res.RecordsTotal);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger, page, rowsPerPage, searchKeyword, sortDir]);

  const [dataVisitor, setDataVisitor] = useState<any[]>([]);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>('');

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    if (!id || !token) return;

    try {
      const res = await getVisitorByTickedId(token, id);
      setSelectedApprovalId(id);
      setDataVisitor(
        (res?.collection || []).map((item: any) => ({
          id: item.id,
          agenda: item.agenda,
          site_name: item.site_place_name,
          name: item.visitor_name,
          organization_name: item.visitor_organization_name,
          identity_id: item.visitor_identity_id,
          visitor_phone: item.visitor_phone,
          email: item.visitor_email,
          visitor_period_start: formatDateTime(item.visitor_period_start),
          visitor_period_end: formatDateTime(item.visitor_period_end),
        })),
      );

      if (res?.status_code === 400 || res?.status_code === 403) {
        const confirm = await Swal.fire({
          title: `Do you want to ${action === 'Approve' ? 'Approve' : 'Reject'} this approval?`,
          icon: 'question',
          // imageUrl: BI_LOGO,
          imageWidth: 100,
          imageHeight: 100,
          showCancelButton: true,
          confirmButtonText: action === 'Approve' ? 'Yes' : 'No',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
          confirmButtonColor: action === 'Approve' ? '#4caf50' : '#f44336',
          customClass: {
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-text-custom',
          },
        });

        if (!confirm.isConfirmed) return;

        // setLoadingAction(true);

        if (action === 'Approve') {
          await approveTicket(token, id);
        } else {
          await rejectTicket(token, id);
        }

        showSwal(
          'success',
          `Data Approval ${action === 'Approve' ? 'approved' : 'denied'} successfully.`,
        );

        setRefreshTrigger((prev) => prev + 1);
        return;
      }

      // const confirm = await Swal.fire({
      //   title: `Do you want to ${action === 'Approve' ? 'Approve' : 'Reject'} this approval?`,
      //   icon: 'question',
      //   // imageUrl: BI_LOGO,
      //   imageWidth: 100,
      //   imageHeight: 100,
      //   showCancelButton: true,
      //   confirmButtonText: action === 'Approve' ? 'Yes' : 'No',
      //   cancelButtonText: 'Cancel',
      //   reverseButtons: true,
      //   confirmButtonColor: action === 'Approve' ? '#4caf50' : '#f44336',
      //   customClass: {
      //     title: 'swal2-title-custom',
      //     htmlContainer: 'swal2-text-custom',
      //   },
      // });

      // if (!confirm.isConfirmed) return;

      // setLoadingAction(true);

      // // const res = await createApproval(token, { action }, id);
      // if (action === 'Approve') await approveTicket(token, id);
      // if (action === 'Reject') await rejectTicket(token, id);

      // setTimeout(() => {

      // }, 400);
      setTriggerCheckAll((prev) => !prev);
      setOpenVisitorApproval(true);
      // setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      setTimeout(() => setLoadingAction(false), 800);
      showSwal(
        'error',
        error.response.data.msg ?? 'Something went wrong while processing approval.',
      );
    }
  };

  const [selectedType, setSelectedType] = useState<
    'All' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  >('All');

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setPage(0);
    setSearchInput(keyword);
    setSearchKeyword(keyword);
  }, []);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const handleApproveMeetingHost = async (id: string) => {
    console.log('id', id);
    try {
      setLoadingAction(true);

      const payload = {
        list_trx_visitor_id: selectedRows.map((item: any) => item.id),
      };

      console.log('payload', payload);

      const response = await approveMeetingHost(token, id, payload);
      console.log('response', response);

      const res = await approveTicket(token as string, id);
      console.log('res', res);

      showSwal('success', response?.msg || 'Approve meeting host successfully.');

      setSelectedRows([]);
      setOpenVisitorApproval(false);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed approve meeting host.');
    } finally {
      setLoadingAction(false);
    }
  };

  const [triggerCheckAll, setTriggerCheckAll] = useState(false);

  const filteredApprovalData = useMemo(() => {
    if (selectedType === 'All') return approvalData;

    return approvalData.filter((item) => item.approval_status === selectedType);
  }, [approvalData, selectedType]);

  return (
    <>
      <PageContainer title="Approval" description="Approval page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={filteredApprovalData}
                isHavePagination={true}
                // selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHavePeriod={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                // isHaveBooleanSwitch={true}
                isHaveAddData={false}
                isHaveApproval={true}
                // isHaveView={true}
                onAccept={(row: { id: string }) => {
                  handleActionApproval(row.id, 'Approve');
                }}
                onDenied={(row: { id: string }) => handleActionApproval(row.id, 'Reject')}
                isHaveHeader={true}
                headerContent={{
                  title: '',
                  subTitle: 'Monitoring Data Visitor',
                  items: [
                    { name: 'All' },
                    { name: 'Pending' },
                    { name: 'Approved' },
                    { name: 'Rejected' },
                    { name: 'Cancelled' },
                  ],
                }}
                onHeaderItemClick={(item) => {
                  if (
                    item.name === 'All' ||
                    item.name === 'Approved' ||
                    item.name === 'Rejected' ||
                    item.name === 'Cancelled' ||
                    item.name === 'Pending'
                  ) {
                    setSelectedType(item.name as any);
                    setPage(0);
                  }
                }}
                defaultSelectedHeaderItem="All"
                isHaveFilterMore={false}
                searchKeyword={searchInput}
                onSearch={handleSearch}
                onSearchKeywordChange={handleSearchKeywordChange}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      <Dialog
        open={openVisitorApproval}
        onClose={() => setOpenVisitorApproval(false)}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: { width: '100vw' },
        }}
      >
        <DialogTitle sx={{ position: 'relative' }}>
          Visitor Group
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            onClick={() => setOpenVisitorApproval(false)}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ padding: '0px !important' }}>
          <DynamicTable
            loading={loading}
            data={dataVisitor}
            selectedRows={selectedRows}
            onCheckedChange={setSelectedRows}
            setSelectedRows={setSelectedRows as any}
            triggerCheckAll={triggerCheckAll}
            isHaveChecked={true}
            titleHeader="Select visitors for approval or rejection"
            isHaveHeaderTitle={true}
            isNoActionTableHead={true}
          />
        </DialogContent>

        <DialogActions>
          <Button
            fullWidth
            color="error"
            variant="contained"
            // onClick={() => selectedId && onReject(selectedId)}
            onClick={() => handleActionApproval(selectedApprovalId, 'Reject')}
          >
            Reject
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={() => handleApproveMeetingHost(selectedApprovalId)}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
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
