import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { getVisitorById } from 'src/customs/api/admin';

import VisitorDetailDialog from '../Dialog/VisitorDetailDialog';
import { IconUsers } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { useNavigate } from 'react-router';
import FilterVisitor from './FilterVisitor';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useListVisitorPagination } from 'src/hooks/Visitor/useListVisitorPagination';
import { useListVisitorMutation } from 'src/hooks/Visitor/useListVisitorMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import VisitorEditDialog from './components/VisitorEditDialog';

interface VisitorFilters {
  organization_id: string;
  department_id: string;
  district_id: string;
  is_employee: string;
  gender: string;
  is_email_verified: string;
  is_blacklist: boolean | null;
}

const Content = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loadingData, setLoadingData] = useState(false);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [visitorEdit, setVisitorEdit] = useState<any>(null);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [filters, setFilters] = useState<VisitorFilters>({
    organization_id: '',
    department_id: '',
    district_id: '',
    is_employee: '',
    gender: '',
    is_email_verified: '',
    is_blacklist: null,
  });

  const { data, isLoading } = useListVisitorPagination({
    page,
    rowsPerPage,
    sortDir,
    sort_column: 'created_at',
    search,
    filters,
  });

  const { blacklistMutation, updateVisitorMutation, deleteVisitorMutation } =
    useListVisitorMutation();

  const tableCustomVisitor =
    data?.collection.map((item: any) => ({
      id: item.id,
      name: item.name || '-',
      identity_id: item.identity_id || '-',
      email: item.email || '-',
      is_email_verified: item.is_email_verified || false,
      phone: item.phone || '-',
      // is_vip: item.is_vip || false,
      is_employee: item.is_employee || false,
      is_blacklist: item.is_blacklist,
    })) ?? [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;
  const vipCount = data?.collection.filter((visitor: any) => visitor.is_vip).length ?? 0;

  const cards = useMemo(
    () => [
      {
        title: t('totalVisitor'),
        icon: IconUsers,
        subTitle: `${totalRecords}`,
        color: 'none',
      },
      // {
      //   title: 'VIP',
      //   icon: IconUsers,
      //   subTitle: `${vipCount}`,
      //   color: 'none',
      // },
    ],
    [totalRecords, t],
  );

  const handleView = async (id: string) => {
    if (!id) return;

    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getVisitorById(id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  type VisitorAction = 'checkin' | 'checkout' | 'deny' | 'block';

  const [confirm, setConfirm] = useState<{
    type: VisitorAction;
    loading: boolean;
  } | null>(null);

  const openConfirm = (type: VisitorAction) => setConfirm({ type, loading: false });

  const handleApplyFilter = () => {
    setPage(0);
  };

  const handleBlacklist = async (id: string, isBlacklist?: boolean) => {
    try {
      const isBlacklistAction = !isBlacklist;

      const { value: inputReason } = await Swal.fire({
        icon: isBlacklistAction ? 'warning' : 'question',
        title: isBlacklistAction ? 'Blacklist Visitor' : 'Whitelist Visitor',
        text: isBlacklistAction
          ? 'Please provide a reason for blacklist this visitor'
          : 'Please provide a reason for whitelist this visitor',
        input: 'text',
        inputPlaceholder: 'Enter reason...',
        inputAttributes: { maxlength: '200' },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        confirmButtonColor: isBlacklistAction ? '#dc2626' : '#16a34a',
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
        action: isBlacklistAction ? 'blacklist' : 'whitelist',
        reason: inputReason.trim(),
      };
      // await createBlacklist(payload);
      await blacklistMutation.mutateAsync(payload);

      showSwal(
        'success',
        isBlacklistAction ? 'Successfully blacklisted visitor' : 'Successfully whitelisted visitor',
      );
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg ?? 'Failed to blacklist or whitelist visitor.');
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
      is_blacklist: null,
    };

    setFilters(empty);
    setPage(0);
  };

  const handlePaginationChange = useCallback((page: number, rowsPerPage: number) => {
    setPage(page);
    setRowsPerPage(rowsPerPage);
  }, []);

  const handleBlacklistMemo = useCallback((row: any) => {
    handleBlacklist(row.id, Boolean(row.is_blacklist));
  }, []);

  const handleViewMemo = useCallback((row: any) => {
    handleView(row.id);
  }, []);

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const filterContent = useMemo(
    () => (
      <FilterVisitor
        filters={filters}
        setFilters={setFilters}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />
    ),
    [filters],
  );

  const handleDelete = async (id: string) => {
    const confirm = await showConfirmDelete(t('confirmDelete', { name: 'visitor' }));

    if (!confirm) return;

    try {
      setLoadingData(true);

      await deleteVisitorMutation.mutateAsync(id);

      showSwal('success', t('deleteSuccess', { name: 'visitor' }));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || t('deleteFailed', { name: 'visitor' }));
    } finally {
      setLoadingData(false);
    }
  };
  const handleEdit = async (id: string) => {
    try {
      setLoadingData(true);

      const res = await getVisitorById(id);

      setVisitorDetail(res.collection);
      setOpenEditDialog(true);
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || t('fetchFailed', { name: 'visitor' }));
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdate = async (payload: any) => {
    try {
      setLoadingData(true);

      await updateVisitorMutation.mutateAsync({
        id: visitorEdit.id,
        data: payload,
      });

      showSwal('success', 'Visitor updated successfully');

      setOpenEditDialog(false);
      setVisitorEdit(null);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg ?? 'Failed to update visitor');
    } finally {
      setLoadingData(false);
    }
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
                  loading={isLoading}
                  isHavePagination={true}
                  overflowX={'auto'}
                  minWidth={2400}
                  stickyHeader={true}
                  data={tableCustomVisitor}
                  totalCount={totalFilteredRecords}
                  searchPlaceholder="Search Visitor..."
                  selectedRows={selectedRows}
                  rowsPerPageOptions={[10, 50, 100]}
                  onPaginationChange={handlePaginationChange}
                  onBlacklist={handleBlacklistMemo}
                  onView={handleViewMemo}
                  // onSearchKeywordChange={handleSearchKeywordChange}
                  currentPage={page}
                  searchKeyword={search}
                  onSearch={handleSearch}
                  // onSearchKeywordChange={handleSearchKeywordChange}
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
                  // onBlacklist={(row) => {
                  //   handleBlacklist(row.id, Boolean(row.is_blacklist));
                  // }}
                  isActionVisitor={false}
                  // onView={(row) => {
                  //   handleView(row.id);
                  // }}
                  isHaveEmployee={true}
                  isHaveVerified={true}
                  onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                  // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onFilterCalenderChange={(ranges) => {
                    if (ranges.startDate && ranges.endDate) {
                      setStartDate(ranges.startDate.toISOString());
                      setEndDate(ranges.endDate.toISOString());
                      setPage(0);
                    }
                  }}
                  isHaveFilterMore={true}
                  filterMoreContent={filterContent}
                  isBlacklistPage={true}
                  onNavigatePage={() => {
                    navigate('/admin/visitor/blacklist-visitor');
                  }}
                  onEdit={(row) => {
                    handleEdit(row.id);
                    // setEdittingId(row.id);
                  }}
                  onDelete={(row) => handleDelete(row.id)}
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

        <VisitorEditDialog
          open={openEditDialog}
          detail={visitorEdit}
          onClose={() => {
            setOpenEditDialog(false);
            setVisitorEdit(null);
          }}
          onSave={handleUpdate}
        />
      </PageContainer>

      <GlobalBackdropLoading open={loadingData} />
    </>
  );
};

export default Content;
