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
import { IconFilterFilled } from '@tabler/icons-react';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { IconPdf } from '@tabler/icons-react';
import VisitorRow from '../../admin/content/Visitor/Transaction/VisitorRow';
import { getVisitorTransactionByIds } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import VisitorApprovalDialog from './components/VisitorApprovalDialog';

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

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;

        const res = await getApprovalTicket(token, {
          sort_dir: sortDir,
          keyword: searchKeyword,
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
  }, [token, refreshTrigger, searchKeyword, sortDir]);

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

      console.log('payload', payload);

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
                    placeholder="Search Transaksi"
                    value={searchAgenda}
                    onChange={(e) => setSearchAgenda(e.target.value)}
                    sx={{ mb: 2 }}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">
                    //       <IconButton edge="end" onClick={() => setShowDrawerFilterMore(true)}>
                    //         <IconFilterFilled />
                    //       </IconButton>
                    //     </InputAdornment>
                    //   ),
                    // }}
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
                                key={group.ticket_id}
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
                                  setSelectedGroupId(group.ticket_id);
                                  setSelectedId(group.approval_ticket_id);
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
                                          onClick={async (e: any) => {
                                            e.stopPropagation();

                                            setSelectedGroup(group);
                                            setSelectedId(group.approval_ticket_id);
                                            setGroupVisitors([]);
                                            setGroupDetailLoading(true);
                                            setOpenDialog(true);

                                            try {
                                              const res = await getVisitorTransactionByIds(
                                                token as string,
                                                group.entity_id,
                                              );

                                              setGroupHeader(res.collection[0]);
                                              setGroupVisitors(res.collection);
                                              setSelectedRows(res.collection);
                                              setTriggerCheckAll(false);

                                              setTimeout(() => {
                                                setTriggerCheckAll(true);
                                              }, 0);
                                            } catch (err) {
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
                                          onClick={async (e: any) => {
                                            e.stopPropagation();

                                            setSelectedGroup(group);
                                            setSelectedId(group.approval_ticket_id);
                                            setGroupVisitors([]);
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
                                              // setGroupVisitors([]);
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
                                    ...(group.approval_status === 'Rejected' && {
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
                {/* Right */}
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
                          <TableRow
                            sx={{
                              backgroundColor: '#f7faff',
                            }}
                          >
                            <TableCell width={50}>
                              <IconButton size="small" onClick={() => setOpenGroup(!openGroup)}>
                                {openGroup ? (
                                  <KeyboardArrowUpOutlined />
                                ) : (
                                  <KeyboardArrowDownOutlined />
                                )}
                              </IconButton>
                            </TableCell>

                            <TableCell component="th" scope="row">
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  Agenda
                                </Typography>

                                <Typography variant="body1">{groupHeader?.agenda}</Typography>
                              </Box>
                            </TableCell>

                            <TableCell component="th" scope="row">
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  Visitor Type
                                </Typography>

                                <Typography variant="body1">
                                  {groupHeader?.visitor_type_name}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell component="th" scope="row">
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  Visit Start
                                </Typography>

                                <Typography variant="body1">
                                  {formatDateTime(groupHeader?.visitor_period_start)}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell component="th" scope="row">
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  Visit End
                                </Typography>

                                <Typography variant="body1">
                                  {formatDateTime(groupHeader?.visitor_period_end)}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
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
        onReject={(id) => {
          handleActionApproval(id, 'Reject');
          setOpenDialog(false);
        }}
        onApprove={(id) => {
          handleApproveMeetingHost(id);
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
