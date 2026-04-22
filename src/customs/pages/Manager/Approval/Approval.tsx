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
  Portal,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import BI_LOGO from 'src/assets/images/logos/BI_Logo.png';
import { IconBan, IconCheck, IconScript, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { createApproval, getAllApprovalDT, getApprovalById } from 'src/customs/api/employee';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import FilterMoreContent from '../Dashboard/FilterMoreContent';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { get } from 'lodash';
import {
  approveTicket,
  getApprovalTicket,
  rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';

interface Filters {
  is_action: boolean | null | undefined;
  start_date: string;
  end_date: string;
  site_approval: number | null;
  approval_type: string;
}

const Approval = () => {
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [approvalDataDetail, setApprovalDataDetail] = useState<any[]>([]);
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
      title: 'Total Approval Ticket',
      subTitle: `${totalRecords}`,
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

        const res = await getApprovalTicket(token, start, rowsPerPage, sortDir, searchKeyword);
        const rows = res.collection.map((item: any) => ({
          approval_ticket_id: item.approval_ticket_id,
          approval_actor_status: item.approval_actor_status,
          approval_workflow_type: item.approval_workflow_type,
          approval_status: item.approval_status,
          current_step: item.current_step,
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

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    if (!id || !token) return;

    try {
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

      setTimeout(() => setLoadingAction(true), 800);

      // const res = await createApproval(token, { action }, id);
      if (action === 'Approve') await approveTicket(token, id);
      if (action === 'Reject') await rejectTicket(token, id);

      // setTimeout(() => {
      showSwal(
        'success',
        `Data Approval ${action === 'Approve' ? 'approved' : 'denied'} successfully.`,
      );
      // }, 400);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      setTimeout(() => setLoadingAction(false), 800);
      showSwal('error', 'Something went wrong while processing approval.');
    } finally {
      setLoadingAction(false);
    }
  };

  const [selectedType, setSelectedType] = useState<'All' | 'Pending' | 'Approved' | 'Reject'>(
    'All',
  );

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

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
                data={approvalData}
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

                onAccept={(row: { approval_ticket_id: string }) =>
                  handleActionApproval(row.approval_ticket_id, 'Approve')
                }
                onDenied={(row: { approval_ticket_id: string }) =>
                  handleActionApproval(row.approval_ticket_id, 'Reject')
                }
                isHaveHeader={true}
                headerContent={{
                  title: '',
                  subTitle: 'Monitoring Data Visitor',
                  items: [
                    { name: 'All' },
                    { name: 'Pending' },
                    { name: 'Approved' },
                    { name: 'Reject' },
                  ],
                }}
                onHeaderItemClick={(item) => {
                  if (
                    item.name === 'All' ||
                    item.name === 'Approved' ||
                    item.name === 'Reject' ||
                    item.name === 'Pending'
                  ) {
                    setSelectedType(item.name);
                    setPage(0);
                  }
                }}
                defaultSelectedHeaderItem="All"
                isHaveFilterMore={false}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
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
