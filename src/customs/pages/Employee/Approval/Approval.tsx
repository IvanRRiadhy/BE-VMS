import {
  Backdrop,
  Button,
  CircularProgress,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { IconBan, IconCheck, IconClock, IconScript, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import BI_LOGO from 'src/assets/images/logos/BI_Logo.png';
import FilterMoreContent from '../Dashboard/FilterMoreContent';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import {
  approveTicket,
  getApprovalTicket,
  rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import { IconFilterFilled } from '@tabler/icons-react';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { IconPdf } from '@tabler/icons-react';
import VisitorRow from '../../admin/content/Visitor/Transaction/VisitorRow';
import { getVisitorTransactionByIds } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface Filters {
  is_action: boolean | null | undefined;
  start_date: string;
  end_date: string;
  site_approval: number | null;
  approval_type: string;
}

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
  const [searchInput, setSearchInput] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchAgenda, setSearchAgenda] = useState('');
  const [showDrawerFilterMore, setShowDrawerFilterMore] = useState(false);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState(true);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [groupHeader, setGroupHeader] = useState<any | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
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
          visitor_type_name: item.visitor_type_name,
          agenda: item.agenda,
          host_name: item.host_name,
          entity_id: item.entity_id,
          approval_actor_status: item.approval_actor_status,
          approval_workflow_type: item.approval_workflow_type,
          approval_status: item.approval_status,
          current_step: item.current_step,
          visitor_period_start: formatDateTime(item.visitor_period_start),
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

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    if (!id || !token) return;

    try {
      const confirm = await Swal.fire({
        title: `Do you want to ${action === 'Approve' ? 'Approve' : 'Reject'} this approval?`,
        icon: 'question',
        // imageUrl: BI_LOGO,
        imageWidth: 100,
        imageHeight: 100,
        reverseButtons: true,
        showCancelButton: true,
        confirmButtonText: action === 'Approve' ? 'Yes' : 'No',
        cancelButtonText: 'Cancel',
        confirmButtonColor: action === 'Approve' ? '#4caf50' : '#f44336',
        customClass: {
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-text-custom',
        },
      });

      if (!confirm.isConfirmed) return;

      setLoadingAction(true);

      // await createApproval(token, { action }, id);
      if (action === 'Approve') await approveTicket(token, id);
      if (action === 'Reject') await rejectTicket(token, id);

      showSwal(
        'success',
        `Data Approval ${action === 'Approve' ? 'approved' : 'denied'} successfully.`,
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      setTimeout(() => setLoadingAction(false), 800);
      showSwal('error', 'Something went wrong while processing approval.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

  useEffect(() => {
    if (!selectedGroupId || !token) return;

    const fetchDetail = async () => {
      setGroupDetailLoading(true);
      try {
        const res = await getVisitorTransactionByIds(token, selectedGroupId);

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
    agenda: item.agenda,
    site_name: item.site_place_name,
    name: item.visitor_name,
    organization_name: item.visitor_organization_name,
    identity_id: item.visitor_identity_id,
    visitor_phone: item.visitor_phone,
    email: item.visitor_email,
    visitor_period_start: formatDateTime(item.visitor_period_start),
    visitor_period_end: formatDateTime(item.visitor_period_end),
  }));

  return (
    <>
      <PageContainer title="Approval" description="Approval page">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* <DynamicTable
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
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveApproval={true}
                isHavePeriod={true}
                onAccept={(row: { approval_ticket_id: string }) =>
                  handleActionApproval(row.approval_ticket_id, 'Approve')
                }
                onDenied={(row: { approval_ticket_id: string }) =>
                  handleActionApproval(row.approval_ticket_id, 'Reject')
                }
                isHaveFilterMore={true}
                isHaveHeader={false}
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
              /> */}

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
                <Box
                  sx={{
                    width: mdUp ? secdrawerWidth : '100%',
                    borderRight: '1px solid #eee',
                    p: 2,
                    pt: 2,
                    overflow: 'auto',
                    height: { xs: '100%', md: '75vh' },
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontSize="1rem">
                      Transaction Visitor
                    </Typography>
                  </Box>

                  {/* Search */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search Agenda"
                    value={searchAgenda}
                    onChange={(e) => setSearchAgenda(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowDrawerFilterMore(true)}>
                            <IconFilterFilled />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box>
                    <Box>
                      {loading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                padding: '10px',
                                mb: 1,
                              }}
                            >
                              <Skeleton variant="text" width="60%" height={24} />
                              <Skeleton variant="text" width="40%" height={20} />
                            </Box>
                          ))
                        : approvalData
                            .filter((group: any) =>
                              group.agenda?.toLowerCase().includes(searchAgenda.toLowerCase()),
                            )
                            .map((group: any) => (
                              <Box
                                key={group.entity_id}
                                sx={{
                                  backgroundColor:
                                    selectedId === group.approval_ticket_id ? '#e3f2fd' : '#f5f5f5',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  cursor: 'pointer',
                                  mb: 1,
                                  '&:hover': {
                                    backgroundColor: '#eee',
                                  },
                                }}
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setSelectedGroupId(group.entity_id);
                                  setSelectedId(group.approval_ticket_id);
                                  // setOpenGroup(true);
                                  setOpenDialog(true);
                                }}
                              >
                                <Box
                                  display={'flex'}
                                  justifyContent={'space-between'}
                                  alignItems={'center'}
                                >
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{
                                      width: '150px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {group.agenda}
                                  </Typography>

                                  {group.approval_status === 'Pending' && (
                                    <Box display={'flex'} gap={0.5}>
                                      <Tooltip title="Approve" arrow>
                                        <IconButton
                                          sx={{
                                            backgroundColor: '#4CAF50',
                                            borderRadius: '50%',
                                            width: 30,
                                            height: 30,
                                            color: '#fff',
                                            '&:hover': {
                                              backgroundColor: '#388E3C',
                                              color: '#fff',
                                            },
                                          }}
                                          // onClick={(e: any) => {
                                          //   e.stopPropagation();
                                          //   handleActionApproval(
                                          //     group.approval_ticket_id,
                                          //     'Approve',
                                          //   );
                                          // }}
                                          onClick={async (e: any) => {
                                            e.stopPropagation();

                                            setSelectedGroup(group);
                                            setSelectedId(group.approval_ticket_id);
                                            setGroupVisitors([]); // reset biar ga flicker
                                            setGroupDetailLoading(true);
                                            setOpenDialog(true);

                                            try {
                                              const res = await getVisitorTransactionByIds(
                                                token as string,
                                                group.entity_id,
                                              );

                                              setGroupHeader(res.collection[0]);
                                              setGroupVisitors(res.collection);
                                            } catch (err) {
                                              setGroupVisitors([]);
                                            } finally {
                                              setGroupDetailLoading(false);
                                            }
                                          }}
                                        >
                                          <IconCheck size={16} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Reject" arrow>
                                        <IconButton
                                          sx={{
                                            backgroundColor: '#f44336',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: 30,
                                            height: 30,
                                            '&:hover': {
                                              backgroundColor: '#d32f2f',
                                              color: '#fff',
                                            },
                                          }}
                                          // onClick={(e: any) => {
                                          //   e.stopPropagation();
                                          //   handleActionApproval(
                                          //     group.approval_ticket_id,
                                          //     'Reject',
                                          //   );
                                          // }}
                                          onClick={async (e: any) => {
                                            e.stopPropagation();

                                            setSelectedGroup(group);
                                            setSelectedId(group.approval_ticket_id);
                                            setGroupVisitors([]); // reset biar ga flicker
                                            setGroupDetailLoading(true);
                                            setOpenDialog(true);

                                            try {
                                              const res = await getVisitorTransactionByIds(
                                                token as string,
                                                group.entity_id,
                                              );

                                              setGroupHeader(res.collection[0]);
                                              setGroupVisitors(res.collection);
                                            } catch (err) {
                                              setGroupVisitors([]);
                                            } finally {
                                              setGroupDetailLoading(false);
                                            }
                                          }}
                                        >
                                          <IconX size={16} />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  )}
                                </Box>

                                <Box display={'flex'} justifyContent={'space-between'}>
                                  <Typography>{group.visitor_type_name}</Typography>
                                  <Typography>{group.host_name}</Typography>
                                </Box>
                                <Typography>Start : {group.visitor_period_start}</Typography>
                                <Typography>End : {group.visitor_period_end}</Typography>
                                <Typography
                                  sx={{
                                    width: 'fit-content',
                                    px: 1.2,
                                    py: 0.3,
                                    marginLeft: 'auto',
                                    marginTop: '5px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    ...(group.approval_status === 'Pending' && {
                                      backgroundColor: '#E0E0E0',
                                      color: '#616161',
                                    }),
                                    ...(group.approval_status === 'Approved' && {
                                      backgroundColor: '#4CAF50',
                                      color: '#fff',
                                    }),
                                    ...(group.approval_status === 'Reject' && {
                                      backgroundColor: '#f44336',
                                      color: '#fff',
                                    }),
                                  }}
                                >
                                  {group.approval_status}
                                </Typography>
                              </Box>
                            ))}
                    </Box>
                  </Box>
                </Box>
                <Box
                  flexGrow={1}
                  p={2}
                  sx={{ height: { xs: 'auto', xl: '78vh' }, overflow: 'auto' }}
                >
                  {selectedGroupId ? (
                    <TableContainer component={Paper} sx={{ border: '1px solid #d6d6d6ff' }}>
                      <Table aria-label="collapsible table">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: 50 }}>
                              <IconButton size="small" onClick={() => setOpenGroup(!openGroup)}>
                                {openGroup ? (
                                  <KeyboardArrowUpOutlined />
                                ) : (
                                  <KeyboardArrowDownOutlined />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell colSpan={5}>
                              <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                              >
                                <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                                  {groupHeader?.group_name ?? '-'}
                                </Typography>
                                <Box display={'flex'} gap={0.5}>
                                  <Tooltip title="Export PDF" arrow>
                                    <Button variant="contained" color="error">
                                      <IconPdf />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Export Excel" arrow>
                                    <Button variant="contained" color="success">
                                      <IconFileSpreadsheet />
                                    </Button>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupDetailLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <CircularProgress size={24} />
                              </TableCell>
                            </TableRow>
                          ) : groupVisitors.length > 0 ? (
                            groupVisitors.map((visitor: any, index: number) => (
                              <VisitorRow key={visitor.id} visitor={visitor} index={index} />
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography color="text.secondary">No visitor data</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      height="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                    >
                      <img src={bg_nodata} width={150} />
                      <Typography color="text.secondary" mt={2} variant="h5">
                        Select a group from the list.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
      >
        <DialogTitle>
          {groupHeader?.group_name ?? 'Visitor Group'}
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            onClick={() => setOpenDialog(false)}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ padding: '0px !important' }}>
          <DynamicTable
            data={visitorTableData ?? []}
            selectedRows={[]}
            isHaveChecked={true}
            titleHeader="Select visitors for approval or rejection"
            isHaveHeaderTitle={true}
            isNoActionTableHead={true}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} fullWidth color="error" variant="contained">
            Reject
          </Button>
          <Button onClick={() => setOpenDialog(false)} variant="contained" fullWidth>
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
