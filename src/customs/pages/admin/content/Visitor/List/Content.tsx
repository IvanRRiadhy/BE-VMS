import React, { useState, useEffect, useRef } from 'react';
import { Backdrop, Box, CircularProgress, Grid2 as Grid } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  createBlacklist,
  getListVisitorPagination,
  getVisitorById,
} from 'src/customs/api/admin';

import VisitorDetailDialog from '../Dialog/VisitorDetailDialog';
import { IconUsers } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useDebounce } from 'src/hooks/useDebounce';
import { useNavigate } from 'react-router';
import FilterVisitor from './FilterVisitor';

type VisitorTableRow = {
  id: string;
  identity_id: string;
  name: string;
  visitor_type: string;
  email: string;
  organization: string;
  gender: string;
  phone: string;
  is_vip: string;
  visitor_period_start: string;
  visitor_period_end: string;
  host: string;
  is_blacklist: string;
};

interface VisitorFilters {
  organization_id: string;
  department_id: string;
  district_id: string;
  is_employee: string;
  gender: string;
  is_email_verified: string;
  is_blacklist: string;
}

const Content = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tableCustomVisitor, setTableCustomVisitor] = useState<VisitorTableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const debouncedSearch = useDebounce(searchKeyword, 500);

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);

      try {
        const start = page * rowsPerPage;
        const response = await getListVisitorPagination(
          token,
          start,
          rowsPerPage,
          sortDir,
          debouncedSearch,
          filters,
        );
        // const response = await getListVisitor(token);

        let rows = response.collection.map((item: any) => {
          return {
            id: item.id,
            // visitor_type: item.visitor_type_name || '-',
            name: item.name || '-',
            identity_id: item.identity_id || '-',
            email: item.email || '-',
            is_email_verified: item.is_email_verified || false,
            is_vip: item.is_vip || false,
            // organization: item.organization || '-',
            gender: item.gender || '-',
            phone: item.phone || '-',
            is_employee: item.is_employee || false,
            is_blacklist: item.is_blacklist || false,
          };
        });

        // setTableRowVisitors(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setTableCustomVisitor(rows);
      } catch (err) {
        console.error('Failed to fetch visitor data:', err);
        setTableCustomVisitor([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortDir, refreshTrigger, debouncedSearch]);


  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getVisitorById(token, id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  // jenis aksi yang dikonfirmasi
  type VisitorAction = 'checkin' | 'checkout' | 'deny' | 'block';

  const [confirm, setConfirm] = useState<{
    type: VisitorAction;
    loading: boolean;
  } | null>(null);

  const openConfirm = (type: VisitorAction) => setConfirm({ type, loading: false });

  const [filters, setFilters] = useState<VisitorFilters>({
    organization_id: '',
    department_id: '',
    district_id: '',
    is_employee: '',
    gender: '',
    is_email_verified: '',
    is_blacklist: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBlacklist = async (id: string, isBlacklist?: boolean) => {
    try {
      const isWhitelist = isBlacklist === true;

      const { value: inputReason } = await Swal.fire({
        icon: isWhitelist ? 'question' : 'warning',
        title: isWhitelist ? 'Whitelist Visitor' : 'Blacklist Visitor',
        text: isWhitelist
          ? 'Please provide a reason for whitelist this visitor'
          : 'Please provide a reason for blacklist this visitor',
        input: 'text',
        inputPlaceholder: 'Enter reason...',
        inputAttributes: { maxlength: '200' },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        confirmButtonColor: isWhitelist ? '#16a34a' : '#dc2626',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) {
            return 'Reason must be at least 3 characters long.';
          }
          return null;
        },
      });

      if (!inputReason) return;

      setLoadingData(true);

      const payload = {
        visitor_id: id,
        action: isWhitelist ? 'whitelist' : 'blacklist',
        reason: inputReason.trim(),
      };

      await createBlacklist(token as string, payload);

      showSwal(
        'success',
        isWhitelist ? 'Successfully whitelisted visitor' : 'Successfully blacklisted visitor',
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error?.response?.data?.msg ?? 'Action failed');
    } finally {
      setLoadingData(false);
    }
  };

  const handleResetFilter = () => {
    const empty = {
      organization_id: '',
      department_id: '',
      district_id: '',
      is_employee: '',
      gender: '',
      is_email_verified: '',
      is_blacklist: '',
    };

    setFilters(empty);
    setPage(0);
  };

  return (
    <>
      <PageContainer
        itemDataCustomNavListing={AdminNavListingData}
        itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
      >
        <Container title="List Visitor" description="List Visitor">
          <Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 12 }}>
                <TopCard cardMarginBottom={1} items={cards} size={{ xs: 12, lg: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, lg: 12 }}>
                <DynamicTable
                  loading={loading}
                  isHavePagination={true}
                  overflowX={'auto'}
                  minWidth={2400}
                  stickyHeader={true}
                  data={tableCustomVisitor}
                  totalCount={totalFilteredRecords}
                  selectedRows={selectedRows}
                  rowsPerPageOptions={[10, 20, 50, 100, 500, 999]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  isHaveChecked={true}
                  isHaveVip={true}
                  isHaveSearch={true}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHavePeriod={true}
                  isNoActionTableHead={true}
                  isHaveAction={true}
                  isHaveGender={true}
                  isHaveVisitor={true}
                  isBlacklistAction={true}
                  onBlacklist={(row) => {
                    handleBlacklist(row.id, row.is_blacklist as any);
                  }}
                  isActionVisitor={false}
                  onView={(row) => {
                    handleView(row.id);
                  }}
                  isHaveEmployee={true}
                  isHaveVerified={true}
                  onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onFilterCalenderChange={(ranges) => {
                    if (ranges.startDate && ranges.endDate) {
                      setStartDate(ranges.startDate.toISOString());
                      setEndDate(ranges.endDate.toISOString());
                      setPage(0);
                      setRefreshTrigger((prev) => prev + 1);
                    }
                  }}
                  isHaveFilterMore={true}
                  filterMoreContent={
                    <FilterVisitor
                      filters={filters}
                      setFilters={setFilters}
                      onApplyFilter={handleApplyFilter}
                      onResetFilter={handleResetFilter}
                    />
                  }
                  isBlacklistPage={true}
                  onNavigatePage={() => {
                    navigate('/admin/visitor/blacklist-visitor');
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Container>
        <VisitorDetailDialog
          open={openVisitorDialog}
          loading={visitorLoading}
          error={visitorError}
          detail={visitorDetail}
          onClose={() => setOpenVisitorDialog(false)}
          onConfirm={(action: any) => openConfirm(action)}
        />
      </PageContainer>

      <Backdrop
        open={loadingData}
        sx={{
          color: '#fff',
          zIndex: 999999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </>
  );
};

export default Content;
