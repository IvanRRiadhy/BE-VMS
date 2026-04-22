import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Portal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { IconCalendarFilled, IconClock, IconX } from '@tabler/icons-react';
import Paper from '@mui/material/Paper';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import {
  getAllSite,
  getAllTimezone,
  getAllVisitorType,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useQuery } from '@tanstack/react-query';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import {
  createSchedulerDelivery,
  deleteSchedulerDelivery,
  getSchedulerDeliveryPagination,
  updateSchedulerDelivery,
} from 'src/customs/api/Delivery/Scheduler';
import {
  CreateSchedulerRequest,
  CreateSchedulerRequestSchmea,
} from 'src/customs/api/models/Admin/Scheduler';
import SchedulerForm from './SchedulerForm';
import FilterMoreContent from './FilterMoreContent';

interface Filters {
  visitor_type_id: string | null;
  host_id: string | null;
  site_id: string | null;
  time_access_id: string | null;
}

const Content = () => {
  const { token } = useSession();
  const [openDialogScheduler, setOpenDialogScheduler] = useState(false);
  const [schedulerData, setSchedulerData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [sortDir, setSortDir] = useState<string>('desc');
  const handleOpenDialog = () => setOpenDialogScheduler(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedScheduler, setSelectedScheduler] = useState<any>(null);
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataScheduler, setFormDataScheduler] = useState<CreateSchedulerRequest>(() => {
    const saved = localStorage.getItem('unsavedSchedulerData');

    try {
      const parsed = saved ? JSON.parse(saved) : {};
      return CreateSchedulerRequestSchmea.parse(parsed);
    } catch (e) {
      return CreateSchedulerRequestSchmea.parse({});
    }
  });

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
  const cards = [
    {
      title: 'Total Scheduler',
      icon: IconCalendarFilled,
      subTitle: `${totalRecords}`,
      subTitleSetting: 0,
      color: 'none',
    },
  ];

  const { data: timezoneData, isLoading: loadingTimezone } = useQuery({
    queryKey: ['timezones', token],
    queryFn: async () => {
      const res = await getAllTimezone(token as string);
      return res.collection;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  });

  const { data: hostDataQuery, isLoading: loadingHost } = useQuery({
    queryKey: ['hosts', token],
    queryFn: async () => {
      const res = await getVisitorEmployee(token as string);
      return res.collection;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  });

  const { data: siteDataQuery, isLoading: loadingSite } = useQuery({
    queryKey: ['sites', token],
    queryFn: async () => {
      const res = await getAllSite(token as string);
      return res.collection;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  });

  const { data: visitorTypeQuery, isLoading: loadingVisitorType } = useQuery({
    queryKey: ['visitorTypes', token],
    queryFn: async () => {
      const res = await getAllVisitorType(token as string);
      return res.collection;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  });

  const [rawSchedulerData, setRawSchedulerData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDataSchduler = async () => {
      setLoading(true);

      try {
        setSchedulerData([]);
        setRawSchedulerData([]);

        const start = page * rowsPerPage;
        const res = await getSchedulerDeliveryPagination(
          token as string,
          start,
          rowsPerPage,
          sortColumn,
          sortDir,
          searchKeyword,
          filters.visitor_type_id ?? undefined,
          filters.host_id ?? undefined,
          filters.time_access_id ?? undefined,
          filters.site_id ?? undefined,
        );

        const collection = res?.collection ?? [];

        // if (!collection.length) {
        //   setSchedulerData([]);
        //   setRawSchedulerData([]);
        //   setTotalFilteredRecords(0);
        //   setTotalRecords(0);
        //   return;
        // }

        const rows = collection.map((item: any) => ({
          id: item.id,
          name: item.name,
          time: item.time_access_name,
          visitor_type: item.visitor_type_name,
          site: item.site_name,
          host: item.host_name,
        }));

        setRawSchedulerData(collection);
        setSchedulerData(rows);
        setTotalFilteredRecords(res.RecordsFiltered ?? collection.length);
        setTotalRecords(res.RecordsTotal ?? collection.length);
      } catch (error) {
        // setSchedulerData([]);
        // setRawSchedulerData([]);
        // setTotalFilteredRecords(0);
        // setTotalRecords(0);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDataSchduler();
  }, [token, page, rowsPerPage, sortColumn, sortDir, searchKeyword, refreshTrigger, filters]);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogRows, setErrorDialogRows] = useState<any[]>([]);

  const handleSubmitScheduler = async (payload: any) => {
    setLoadingData(true);
    try {
      console.log('📤 Submitting payload:', JSON.stringify(payload, null, 2));

      if (formMode === 'edit' && edittingId) {
        await updateSchedulerDelivery(token as string, edittingId, payload);
        showSwal('success', 'Scheduler updated successfully!');
      } else {
        await createSchedulerDelivery(token as string, payload);
        showSwal('success', 'Scheduler added successfully!');
      }

      setOpenDialogScheduler(false);
      setRefreshTrigger((prev) => prev + 1);
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
    // setLoading(true);

    const confirmed = await showConfirmDelete('Are you sure to delete this scheduler?');
    if (!confirmed) return;
    if (confirmed) {
      try {
        await deleteSchedulerDelivery(token as string, id);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Successfully deleted scheduler!');
      } catch (error) {
        showSwal('error', 'Failed to delete scheduler.');
      } finally {
        // setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

  const handleEdit = (id: string) => {
    const data = rawSchedulerData.find((item) => item.id === id);
    setSelectedScheduler(data);
    setFormMode('edit');
    setOpenDialogScheduler(true);
  };

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

  const handleCloseScheduler = (_: any, reason?: string) => {
    if (isDirty) {
      setConfirmDialogOpen(true);
      return;
    }

    setOpenDialogScheduler(false);
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
              loading={loading}
              overflowX={'auto'}
              data={schedulerData ?? []}
              // selectedRows={selectedRows}
              isNoActionTableHead={true}
              totalCount={totalFilteredRecords}
              isHaveChecked={true}
              isHaveAction={true}
              isActionEmployee={false}
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
                // setEdittingId(row.id);
              }}
              onDelete={(row) => handleDeleteSchduler(row.id)}
              searchKeyword={searchInput}
              onSearch={handleSearch}
              onSearchKeywordChange={handleSearchKeywordChange}
              onAddData={() => {
                handleAdd();
              }}
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

        <Dialog
          open={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle>This Required Fields on visitor type</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setErrorDialogOpen(false)}
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
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
              <Table size="small" sx={{ minWidth: 650 }}>
                {/* TABLE HEAD */}
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell
                      colSpan={errorDialogRows.length}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        textAlign: 'start',
                      }}
                    >
                      Missing Field
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {errorDialogRows.length > 0 ? (
                    <TableRow
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '& td': { paddingY: 1.5 },
                      }}
                    >
                      {errorDialogRows.map((item, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{
                            borderLeft: '1px solid #eee',
                            borderRight:
                              index === errorDialogRows.length - 1 ? 'none' : '1px solid #eee',
                            paddingX: 2,
                            fontSize: '0.95rem',
                          }}
                        >
                          {item.short_name}
                        </TableCell>
                      ))}
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={errorDialogRows.length + 1}
                        align="center"
                        sx={{ padding: 3, fontStyle: 'italic', color: 'text.secondary' }}
                      >
                        No missing field details.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>

        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Unsaved Changes
            <IconButton
              aria-label="close"
              onClick={() => setConfirmDialogOpen(false)}
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
            You have unsaved changes. Do you want to discard them?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                localStorage.removeItem('unsavedSchedulerData');
                setConfirmDialogOpen(false);
                setOpenDialogScheduler(false);
              }}
              color="primary"
              variant="contained"
            >
              Yes, Discard and Continue
            </Button>
          </DialogActions>
        </Dialog>

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
