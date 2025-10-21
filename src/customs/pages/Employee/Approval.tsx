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
import { IconScript, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { createApproval, getAllApprovalDT, getApprovalById } from 'src/customs/api/employee';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import FilterMoreContent from './FilterMoreContent';
import Swal from 'sweetalert2';
import { showErrorAlert, showSuccessAlert } from 'src/customs/components/alerts/alerts';
import { Item } from 'src/customs/api/models/Employee/Approval';

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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loadingAction, setLoadingAction] = useState(false);
  const cards = [
    {
      title: 'Total Approval',
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      icon: IconScript,
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

        const res = await getAllApprovalDT(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword, // 🚀 hapus spasi di awal/akhir
          filters.start_date || undefined,
          filters.end_date || undefined,
          filters.is_action ?? undefined,
          filters.site_approval ?? undefined,
          filters.approval_type || undefined,
        );

        setApprovalData(
          res.collection.map((item: any) => {
            const trx = item.trx_visitor || {};

            let status = '';
            if (item.is_action === true) status = 'Accept';
            else if (item.is_action === false) status = 'Deny';
            else status = '-';

            return {
              id: item.id,
              visitor_name: trx.visitor?.name || '-',
              site_place_name: trx.site_place_name || '-',
              agenda: trx.agenda || '-',
              visitor_period_start: trx.visitor.visitor_period_start || '-',
              visitor_period_end: trx.visitor.visitor_period_end || '-',
              action_by: item.action_by || '-',
              status: item.action || false,
            };
          }),
        );
        setTotalRecords(res.collection.length);
        // console.log(totalRecords);
        setTotalFilteredRecords(res.RecordsFiltered);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    token,
    refreshTrigger,
    page,
    rowsPerPage,
    sortColumn,
    searchKeyword,
    filters.start_date,
    filters.end_date,
    filters.is_action,
    filters.site_approval,
    filters.approval_type,
  ]);

  const handleView = async (id: string) => {
    if (!id || !token) return;

    // setOpenInvitationDialog(true);
    // setInvitationDetail([]); // reset detail
    // setDetailVisitorInvitation([]); // reset related visitor

    try {
      // 1️⃣ Ambil detail utama
      const res = await getApprovalById(id, token);
      setApprovalDataDetail([]);
    } catch (err: any) {
      console.error(err?.message || 'Failed to fetch invitation detail.');
    }
  };

  // const handleActionApproval = async (id: string, action: 'Accept' | 'Deny') => {
  //   if (!id || !token) return;

  //   try {
  //     const confirm = await Swal.fire({
  //       title: `${action === 'Accept' ? 'Approve' : 'Deny'} this request?`,
  //       icon: 'question',
  //       showCancelButton: true,
  //       confirmButtonText: action === 'Accept' ? 'Yes, Approve' : 'Yes, Deny',
  //       cancelButtonText: 'Cancel',
  //       confirmButtonColor: action === 'Accept' ? '#4caf50' : '#f44336',
  //     });

  //     if (!confirm.isConfirmed) return;

  //     // ✅ Baru mulai loading setelah user konfirmasi
  //     setTimeout(() => setLoading(true), 200);

  //     await createApproval(token, { action }, id);

  //     // ⏱ delay biar Swal close dulu
  //     await new Promise((resolve) => setTimeout(resolve, 300));

  //     await showSuccessAlert(
  //       'Success',
  //       `Data Approval ${action === 'Accept' ? 'approved' : 'denied'} successfully.`,
  //     );

  //     setRefreshTrigger((prev) => prev + 1);
  //   } catch (error) {
  //     console.error('Approval action error:', error);
  //     await Swal.fire('Error', 'Something went wrong while processing approval.', 'error');
  //   } finally {
  //     // kasih sedikit delay agar transisi smooth
  //     setTimeout(() => setLoading(false), 400);
  //   }
  // };

  const handleActionApproval = async (id: string, action: 'Accept' | 'Deny') => {
    if (!id || !token) return;

    try {
      const confirm = await Swal.fire({
        title: `Do you want to ${action === 'Accept' ? 'Accept' : 'Deny'} this approval?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: action === 'Accept' ? 'Yes' : 'Yes',
        cancelButtonText: 'Cancel',
        confirmButtonColor: action === 'Accept' ? '#4caf50' : '#f44336',
        customClass: {
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-text-custom',
        },
      });

      if (!confirm.isConfirmed) return;

      // ✅ Start loading setelah konfirmasi
      setTimeout(() => setLoadingAction(true), 800);

      await createApproval(token, { action }, id);

      // ✅ Tampilkan alert sukses dan tunggu sampai selesai
      setTimeout(() => {
        showSuccessAlert(
          'Success',
          `Data Approval ${action === 'Accept' ? 'approved' : 'denied'} successfully.`,
        );
      }, 1000);

      // ✅ Sekarang tutup loading
      setTimeout(() => setLoadingAction(false), 200);

      // 🔄 Refresh data
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Approval action error:', error);
      setTimeout(() => setLoadingAction(false), 800);
      setTimeout(
        () => showErrorAlert('Error', 'Something went wrong while processing approval.'),
        1000,
      );
    }
  };

  return (
    <>
      <PageContainer title="Approval" description="Approval page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* {isDataReady ? ( */}
              <DynamicTable
                overflowX={'auto'}
                data={approvalData}
                isHavePagination={true}
                // selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                // isHaveBooleanSwitch={true}
                isHaveAddData={false}
                isHaveApproval={true}
                isHavePeriod={true}
                // isHaveView={true}
                onView={(row: { id: string }) => {
                  handleView(row.id);
                }}
                onAccept={(row: { id: string }) => handleActionApproval(row.id, 'Accept')}
                onDenied={(row: { id: string }) => handleActionApproval(row.id, 'Deny')}
                isHaveFilterMore={true}
                isHaveHeader={false}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
              />
              {/* ) : (
              <Card sx={{ width: '100%' }}>
                <Skeleton />
                <Skeleton animation="wave" />
                <Skeleton animation={false} />
              </Card>
            )} */}
            </Grid>
          </Grid>
        </Box>

        <Dialog open={false} onClose={() => {}} fullWidth maxWidth="sm">
          <DialogTitle>Approval Detail</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => {}}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent dividers>
            <Typography gutterBottom> Name</Typography>
            <Typography gutterBottom> Email</Typography>
            <Typography gutterBottom> Phone</Typography>
            <Typography gutterBottom> Company</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {}} color="error" variant="contained">
              Deny
            </Button>
            <Button
              // onClick={() => handleActionApproval(approvalDataDetail?.id || '')}
              color="primary"
              variant="contained"
            >
              Accept
            </Button>
          </DialogActions>
        </Dialog>
        {/* <Portal> */}

        {/* </Portal> */}
      </PageContainer>
      <Backdrop
        open={loadingAction}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </>
  );
};

export default Approval;
