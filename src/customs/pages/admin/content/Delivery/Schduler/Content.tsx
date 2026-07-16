import {
  Backdrop,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Portal,
} from '@mui/material';
import { IconCalendarFilled, IconClock, IconX } from '@tabler/icons-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import {
  getAllTimezone,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useQuery } from '@tanstack/react-query';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import {
  getSchedulerDeliveryById,
} from 'src/customs/api/Delivery/Scheduler';

import SchedulerForm from './SchedulerForm';
import FilterMoreContent from './FilterMoreContent';
import ConfirmUnsavedDialog from '../../../components/ConfirmUnsavedDialog';
import SchedulerErrorDialog from './Dialog/SchedulerErrorDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useSites } from 'src/hooks/useSites';
import { useVisitorType } from 'src/hooks/useVisitorType';
import { useVisitorEmployees } from 'src/hooks/useVisitorEmployees';
import { useSchedulerPagination } from 'src/hooks/Scheduler/useSchedulerPagination';
import { useSchedulerMutation } from 'src/hooks/Scheduler/useSchedulerMutation';

interface Filters {
  visitor_type_id: string | null;
  host_id: string | null;
  site_id: string | null;
  time_access_id: string | null;
}

const Content = () => {
  const [openDialogScheduler, setOpenDialogScheduler] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [edittingId, setEdittingId] = useState('');
  const [sortDir, setSortDir] = useState<string>('desc');
  const handleOpenDialog = () => setOpenDialogScheduler(true);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [selectedScheduler, setSelectedScheduler] = useState<any>(null);
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogRows, setErrorDialogRows] = useState<any[]>([]);
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    visitor_type_id: '',
    host_id: '',
    site_id: '',
    time_access_id: '',
  });

  const handleAdd = () => {
    setFormMode('add');
    setSelectedScheduler(null);
    handleOpenDialog();
  };

  const handleView = async (id?: string) => {
    if (!id) return;

    try {
      navigate(`/admin/visitor/scheduler/detail/${id}`);
    } catch (error) {
      showSwal('error', 'Failed to view scheduler.');
    }
  };


  const { data: timezoneData, isLoading: loadingTimezone } = useQuery({
    queryKey: ['timezones'],
    queryFn: async () => {
      const res = await getAllTimezone();
      return res.collection;
    },

  });


  const { allVisitorEmployee: hostDataQuery } = useVisitorEmployees();
  const { sites: siteDataQuery } = useSites();
  const { visitorType: visitorTypeQuery } = useVisitorType();
  // const [rawSchedulerData, setRawSchedulerData] = useState<any[]>([]);

  const { data, isLoading } = useSchedulerPagination({
    page,
    rowsPerPage,
    sortColumn,
    sortDir,
    search,
    filters,
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
  } = useSchedulerMutation();

  const rawSchedulerData = data?.collection ?? [];

  const schedulerData =
    rawSchedulerData.map((item: any) => ({
      id: item.id,
      name: item.name,
      time: item.time_access_name,
      visitor_type: item.visitor_type_name,
      site: item.site_name,
      host: item.host_name,
    })) ?? [];

  const totalRecords =
    data?.RecordsTotal ?? 0;

  const totalFilteredRecords =
    data?.RecordsFiltered ?? 0;

  const cards = [
    {
      title: t('totalScheduler'),
      icon: IconCalendarFilled,
      subTitle: `${totalRecords}`,
      subTitleSetting: 0,
      color: 'none',
    },
  ];

  const handleSubmitScheduler = async (payload: any) => {
    setLoadingData(true);
    try {

      if (formMode === 'edit' && edittingId) {
        await updateMutation.mutateAsync({
          id: selectedScheduler.id,
          data: payload,
        });
        showSwal('success', 'Scheduler updated successfully!');
      } else {
        await createMutation.mutateAsync(payload);
        showSwal('success', 'Scheduler added successfully!');
      }

      setOpenDialogScheduler(false);

    } catch (error: any) {
      const errData = error?.response?.data;

      if (errData?.collection && Array.isArray(errData.collection)) {
        showSwal('error', errData.collection.join(','));
      } else if (errData?.message) {
        showSwal('error', errData.message);
      } else {
        showSwal('error', 'Failed to create schedule');
      }

      throw error;
    } finally {
      setTimeout(() => setLoadingData(false), 500);
    }
  };

  const handleDeleteSchduler = async (id: string) => {
    const confirmed = await showConfirmDelete('Are you sure to delete this scheduler?');
    if (!confirmed) return;
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id);

        showSwal('success', 'Successfully deleted scheduler!');
      } catch (error) {
        showSwal('error', 'Failed to delete scheduler.');
      }
    }
  };

  const handleEdit = async (id: string) => {
    const data = await getSchedulerDeliveryById(id);
    setSelectedScheduler(data.collection);
    setFormMode('edit');
    setOpenDialogScheduler(true);
  };

  const handleApplyFilter = () => {
    setPage(0);

  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const handleCloseScheduler = (_: any, reason?: string) => {
    if (isDirty) {
      setConfirmDialogOpen(true);
      return;
    }

    setOpenDialogScheduler(false);
    setSelectedScheduler(null);
    setFormMode('add');
    setEdittingId('');
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setConfirmDialogOpen(false);
    setOpenDialogScheduler(false);

    setSelectedScheduler(null);
    setFormMode('add');
    setEdittingId('');
    setIsDirty(false);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Scheduler" description="this is scheduler page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <DynamicTable
              loading={isLoading}
              overflowX={'auto'}
              data={schedulerData ?? []}
              isNoActionTableHead={true}
              totalCount={totalFilteredRecords}
              isHaveChecked={true}
              isHaveAction={true}
              isActionEmployee={false}
              currentPage={page}
              isHaveSearch={true}
              isHaveFilter={false}
              isHaveExportPdf={false}
              isHavePagination={true}
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 50, 100]}
              onPaginationChange={(page, rowsPerPage) => {
                setPage(page);
                setRowsPerPage(rowsPerPage);
              }}
              isHaveAddData={true}
              isActionVisitor={false}
              isHaveView={false}
              isHaveViewAndAction={true}
              onView={(row) => {
                handleView(row.id);
              }}
              isHaveFilterMore={true}
              filterMoreContent={
                <FilterMoreContent
                  filters={filters}
                  setFilters={setFilters}
                  onApplyFilter={handleApplyFilter}
                  visitorTypeData={visitorTypeQuery || []}
                  siteData={siteDataQuery || []}
                  hostData={hostDataQuery || []}
                  timeAccessData={timezoneData || []}
                />
              }
              onEdit={(row) => {
                handleEdit(row.id);
              }}
              onDelete={(row) => handleDeleteSchduler(row.id)}
              searchKeyword={search}
              onSearch={handleSearch}
              onAddData={handleAdd}
            />
          </Grid>
        </Box>
        <Dialog open={openDialogScheduler} onClose={handleCloseScheduler} fullWidth maxWidth="md">
          <DialogTitle>
            {formMode === 'add' ? 'Add Delivery Scheduler' : 'Edit Delivery Scheduler'}
            <IconButton
              aria-label="close"
              onClick={() => {
                if (isDirty) {
                  setConfirmDialogOpen(true);
                } else {
                  setOpenDialogScheduler(false);
                }
              }}
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
            <SchedulerForm
              key={`${formMode}-${selectedScheduler?.id ?? 'new'}`}
              timezoneData={timezoneData ?? []}
              visitorTypeQuery={visitorTypeQuery ?? []}
              siteDataQuery={siteDataQuery ?? []}
              hostDataQuery={hostDataQuery ?? []}
              defaultValue={selectedScheduler}
              mode={formMode}
              onSubmit={handleSubmitScheduler}
              onDirtyChange={(dirty) => setIsDirty(dirty)}
            />
          </DialogContent>
        </Dialog>

        <SchedulerErrorDialog
          open={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          rows={errorDialogRows}
        />

        <ConfirmUnsavedDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onDiscard={handleDiscard}
        />

        <Portal>
          <Backdrop
            open={loadingData}
            sx={{
              color: '#fff',
              zIndex: 999999,
            }}
          >
            <CircularProgress color="primary" />
          </Backdrop>
        </Portal>
      </Container>
    </PageContainer>
  );
};

export default Content;
