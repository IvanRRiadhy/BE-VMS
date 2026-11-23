import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';
import Container from 'src/components/container/PageContainer';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

import {
  Search,
  Download,
  Refresh,
  PersonOutline,
  AssignmentOutlined,
  History,
  GroupsOutlined,
} from '@mui/icons-material';

import {
  useExportReportApproval,
  useReportApproval,
} from 'src/hooks/Report/useReportApproval';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { useUserPagination } from 'src/hooks/User/useUsers';
import { useDebounce } from 'src/hooks/useDebounce';
import { showSwal } from 'src/customs/components/alerts/alerts';
dayjs.extend(utc);
dayjs.extend(timezonePlugin);

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

type ApprovalActor = {
  approver_name?: string;
  approver_type?: string;
  status?: string;
  approved_at?: string | null;
};

type ApprovalVisitor = {
  agenda?: string;
  visitor_code?: string;
  identity_id?: string;
  visitor_name?: string;
  host_name?: string;
  visitor_period_start?: string;
  visitor_period_end?: string;
  approval_status?: string;
  actors?: ApprovalActor[];
  [key: string]: any;
};

type ApprovalTransaction = {
  transaction_visitor_id?: string;
  agenda?: string;
  workflow_type?: string;
  approval_ticket_name?: string;
  current_step?: string | number;
  visitor_period_start?: string;
  visitor_period_end?: string;
  visitor_total?: number;
  host_name?: string;
  approval_status?: string;
  rejection_reasons?: string;
  data_history_ticket?: any[];
  data_history_visitor?: any[];
  visitors?: ApprovalVisitor[];
  [key: string]: any;
};

type ApprovalReportResponse = {
  collection?: {
    by_transaction_visitor?: {
      summary_total?: {
        pending?: number;
        approved?: number;
        rejected?: number;
      };
      data_visitor?: ApprovalTransaction[];
    };
  };
};

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const getStatusColor = (status?: string) => {
  switch ((status ?? '').toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const formatStatus = (status?: string) => {
  if (!status) return 'Unknown';

  return status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase();
};



const getInitial = (name?: string) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
};

const getTransactionName = (item: ApprovalTransaction) => {
  return (
    item.approval_ticket_name ||
    item.agenda ||
    item.transaction_visitor_id ||
    'Approval Transaction'
  );
};

const getVisitors = (
  item?: ApprovalTransaction | null,
): ApprovalVisitor[] => {
  if (!item) return [];

  return item.data_history_visitor ?? [];
};

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------

const ApprovalReport = () => {
  const today = dayjs().format('YYYY-MM-DD');

  const defaultStartDate = dayjs()
    .subtract(7, 'day')
    .format('YYYY-MM-DD');

  const timezone = dayjs.tz.guess();

  // Filters: only 3 fields
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(today);
  const [actorId, setActorId] = useState(null);
  const [selectedActor, setSelectedActor] = useState<any | null>(null);

  // Report
  const [report, setReport] =
    useState<ApprovalReportResponse | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<ApprovalTransaction | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Local search for result list only
  const [searchResult, setSearchResult] = useState('');

  const {
    mutateAsync: generateReport,
    isPending: loadingGenerate,
  } = useReportApproval();

  const {
    mutateAsync: exportReport,
    isPending: loadingExport,
  } = useExportReportApproval();

  const loading = loadingGenerate || loadingExport;

  // -------------------------------------------------------
  // API
  // -------------------------------------------------------

  const handleSearch = async (isExport = false) => {
    if (!startDate || !endDate) {
      window.alert('Please select start date and end date.');
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
      window.alert('End date cannot be earlier than start date.');
      return;
    }

    // const startDateUtc = dayjs
    //   .tz(startDate, timezone)
    //   .startOf('day')
    //   .utc()
    //   .format('YYYY-MM-DDTHH:mm:ss[Z]');

    // const endDateUtc = dayjs
    //   .tz(endDate, timezone)
    //   .endOf('day')
    //   .utc()
    //   .format('YYYY-MM-DDTHH:mm:ss[Z]');

    const payload = {
      start_date: startDate,
      end_date: endDate,
      timezone,
      is_export: isExport,
      export_report: 'Excell',
      actor_id: actorId || null,
    };

    try {
      if (isExport) {
        const response = await exportReport(payload);

        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download =
          `approval-report-${startDate}-${endDate}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
        return;
      }

      const response = await generateReport(payload);

      setReport(response);

      const transactions =
        response?.collection?.by_transaction_visitor?.data_visitor ?? [];

      setSelectedTransaction(transactions[0] ?? null);
      setSearchResult('');
      setActiveTab(0);
      setHasGenerated(true);
    } catch (error) {
      showSwal("error", isExport
        ? 'Failed to export approval report.'
        : 'Failed to generate approval report.')
    }
  };

  const handleReset = () => {
    setStartDate(defaultStartDate);
    setEndDate(today);
    setActorId(null);
    setSelectedActor(null);
    setSearchActor('');
    setSearchResult('');

    setReport(null);
    setSelectedTransaction(null);
    setHasGenerated(false);
    setActiveTab(0);
  };

  // -------------------------------------------------------
  // Report Data
  // -------------------------------------------------------

  const approvalData =
    report?.collection?.by_transaction_visitor;

  const summary = approvalData?.summary_total ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  const transactions = approvalData?.data_visitor ?? [];

  const filteredTransactions = useMemo(() => {
    const keyword = searchResult.toLowerCase().trim();

    if (!keyword) return transactions;

    return transactions.filter((item) => {
      const searchableValues = [
        item.agenda,
        item.approval_ticket_name,
        item.host_name,
        item.transaction_visitor_id,
        item.workflow_type,
      ];

      return searchableValues.some((value) =>
        String(value ?? '').toLowerCase().includes(keyword),
      );
    });
  }, [transactions, searchResult]);

  const selectedVisitors = useMemo(
    () => getVisitors(selectedTransaction),
    [selectedTransaction],
  );

  const visitorCount =
    selectedTransaction?.visitor_total ??
    selectedVisitors.length;

  // -------------------------------------------------------
  // Reusable Components
  // -------------------------------------------------------

  const StatusChip = ({
    status,
  }: {
    status?: string;
  }) => (
    <Chip
      size="small"
      color={getStatusColor(status) as any}
      label={formatStatus(status)}
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
      }}
    />
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: any;
  }) => (
    <Grid container spacing={1} sx={{ mb: 1.3 }}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Grid>

      <Grid item xs={8}>
        <Typography variant="body2" fontWeight={500}>
          {value === null ||
            value === undefined ||
            value === ''
            ? '-'
            : value}
        </Typography>
      </Grid>
    </Grid>
  );

  const SectionCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Box>

      <CardContent>{children}</CardContent>
    </Card>
  );

  // -------------------------------------------------------
  // Overview
  // -------------------------------------------------------

  const renderOverview = () => {
    if (!selectedTransaction) return null;



    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Approval Information">
            <InfoRow
              label="Approval Ticket"
              value={selectedTransaction.approval_ticket_name}
            />

            <InfoRow
              label="Agenda"
              value={selectedTransaction.agenda}
            />

            <InfoRow
              label="Workflow Type"
              value={selectedTransaction.workflow_type}
            />

            <InfoRow
              label="Current Step"
              value={selectedTransaction.current_step}
            />

            <InfoRow
              label="Host"
              value={selectedTransaction.host_name}
            />

            <InfoRow
              label="Total Visitors"
              value={visitorCount}
            />

            <InfoRow
              label="Visit Start"
              value={formatDateTime(
                selectedTransaction.visitor_period_start,
              )}
            />

            <InfoRow
              label="Visit End"
              value={formatDateTime(
                selectedTransaction.visitor_period_end,
              )}
            />

            <InfoRow
              label="Status"
              value={
                <StatusChip
                  status={selectedTransaction.approval_status}
                />
              }
            />

            {selectedTransaction.rejection_reasons && (
              <InfoRow
                label="Rejection Reason"
                value={selectedTransaction.rejection_reasons}
              />
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="Approval Summary">
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'warning.lighter',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    Pending
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {summary.pending ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'success.lighter',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    Approved
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {summary.approved ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'error.lighter',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    Rejected
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {summary.rejected ?? 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Approval Progress">
            {selectedVisitors.length > 0 ? (
              <Stack spacing={2}>
                {selectedVisitors.map((visitor, index) => (
                  <Box key={visitor.visitor_code ?? index}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {visitor.visitor_name ?? 'Visitor'}
                      </Typography>

                      <StatusChip status={visitor.approval_status} />
                    </Stack>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Visitor Code
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {visitor.visitor_code ?? '-'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No visitor details available.
              </Typography>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    );
  };

  // -------------------------------------------------------
  // Visitors
  // -------------------------------------------------------

  const renderVisitors = () => (
    <SectionCard title={`Visitors (${selectedVisitors.length})`}>
      {selectedVisitors.length > 0 ? (
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 700 }}>
            <Grid
              container
              sx={{
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {[
                'Visitor',
                'Visitor Code',
                'Host',
                'Visit Start',
                'Visit End',
                'Status',
              ].map((title) => (
                <Grid item xs={2} key={title}>
                  <Typography variant="caption" fontWeight={700}>
                    {title}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {selectedVisitors.map((visitor, index) => (
              <Grid
                container
                key={visitor.visitor_code ?? index}
                alignItems="center"
                sx={{
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Grid item xs={2}>
                  <Typography variant="body2" fontWeight={600}>
                    {visitor.visitor_name ?? '-'}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {visitor.identity_id ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {visitor.visitor_code ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {visitor.host_name ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {formatDateTime(visitor.visitor_period_start)}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {formatDateTime(visitor.visitor_period_end)}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <StatusChip status={visitor.approval_status} />
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
      ) : (
        <Typography color="text.secondary" variant="body2">
          No visitor data available.
        </Typography>
      )}
    </SectionCard>
  );

  // -------------------------------------------------------
  // Approval History
  // -------------------------------------------------------

  const renderApprovalHistory = () => {
    if (!selectedTransaction) return null;

    const ticketHistory =
      selectedTransaction.data_history_ticket ?? [];

    const visitorHistory =
      selectedTransaction.data_history_visitor ?? [];

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Ticket Approval History">
            {ticketHistory.length > 0 ? (
              <Stack spacing={2}>
                {ticketHistory.map((history, index) => (
                  <Box key={history.id ?? index}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.light',
                          fontSize: 13,
                        }}
                      >
                        {getInitial(
                          history.approver_name ??
                          history.actor_name,
                        )}
                      </Avatar>

                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {history.approver_name ??
                            history.actor_name ??
                            'Approval Actor'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {history.approver_type ??
                            history.actor_type ??
                            '-'}
                        </Typography>
                      </Box>

                      <StatusChip
                        status={
                          history.status ??
                          history.approval_status
                        }
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 5 }}
                    >
                      {formatDateTime(
                        history.approved_at ??
                        history.created_at,
                      )}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No ticket approval history available.
              </Typography>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="Visitor Approval History">
            {visitorHistory.length > 0 ? (
              <Stack spacing={2}>
                {visitorHistory.map((history, index) => (
                  <Box key={history.id ?? index}>
                    <Typography variant="body2" fontWeight={600}>
                      {history.visitor_name ??
                        history.visitor_code ??
                        'Visitor'}
                    </Typography>

                    {(history.actors ?? []).map(
                      (actor: ApprovalActor, actorIndex: number) => (
                        <Box
                          key={actorIndex}
                          sx={{ mt: 1, ml: 1 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 11,
                              }}
                            >
                              {getInitial(actor.approver_name)}
                            </Avatar>

                            <Box flex={1}>
                              <Typography variant="body2">
                                {actor.approver_name ?? '-'}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {actor.approver_type ?? '-'}
                              </Typography>
                            </Box>

                            <StatusChip status={actor.status} />
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 4.5 }}
                          >
                            {formatDateTime(actor.approved_at)}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No visitor approval history available.
              </Typography>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    );
  };


  const [searchActor, setSearchActor] = useState('');
  const debounceSearch = useDebounce(searchActor);

  const { data: userData, isLoading: loadingUsers } = useUserPagination({
    page: 0,
    rowsPerPage: 10,
    sortDir: 'desc',
    searchKeyword: debounceSearch,
    'is-employee': true,
  });

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Approval Report" description="This is Content Report page">
        <Box sx={{ p: 1.5 }}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            mb={2}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                color: 'white',
              }}
            >
              <Search />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                Approval Report
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Search and investigate visitor approval transactions and histories.
              </Typography>
            </Box>
          </Stack>

          {/* Filter */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
            }}
          >
            <Tabs
              value={0}
              sx={{
                mb: 2,
                minHeight: 40,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 40,
                  textTransform: 'none',
                },
              }}
            >
              <Tab
                icon={<AssignmentOutlined />}
                iconPosition="start"
                label="Approval Report"
              />
            </Tabs>

            <Grid container spacing={1.5}>
              {/* Start Date */}
              <Grid item xs={12} sm={6} md={4}>
                <CustomFormLabel required>
                  Start Date
                </CustomFormLabel>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6} md={4}>
                <CustomFormLabel required>
                  End Date
                </CustomFormLabel>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Actor ID */}
              <Grid item xs={12} sm={6} md={4}>
                <CustomFormLabel>
                  Actor
                </CustomFormLabel>

                <Autocomplete
                  fullWidth
                  size="small"
                  options={userData?.collection ?? []}
                  loading={loadingUsers}
                  filterOptions={(options) => options}
                  getOptionLabel={(option: any) =>
                    option.fullname ?? option.name ?? ''
                  }
                  value={selectedActor}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') {
                      setSearchActor(value);
                    }
                  }}
                  onChange={(_, value) => {
                    setSelectedActor(value);
                    setActorId(value ? String(value.id) : '');
                  }}
                  isOptionEqualToValue={(option: any, value: any) =>
                    String(option.id) === String(value.id)
                  }
                  noOptionsText="No User found"
                  loadingText="Searching user..."
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search user..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingUsers && <CircularProgress size={16} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Actions */}
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={1}
                mt={1}
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    loadingExport
                      ? <CircularProgress size={16} color="inherit" />
                      : <Download />
                  }
                  onClick={() => handleSearch(true)}
                  disabled={
                    !hasGenerated ||
                    filteredTransactions.length === 0 ||
                    loading ||
                    loadingExport
                  }
                >
                  Export Excel
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    loadingGenerate
                      ? <CircularProgress size={16} color="inherit" />
                      : <Search />
                  }
                  onClick={() => handleSearch(false)}
                  disabled={loading}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Results */}
          {!hasGenerated ? (
            <Paper
              variant="outlined"
              sx={{
                p: 5,
                textAlign: 'center',
                borderStyle: 'dashed',
              }}
            >
              <Search
                color="disabled"
                sx={{ fontSize: 40, mb: 1 }}
              />

              <Typography variant="h6">
                No Approval Data
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Select your filters and click Search to investigate approval records.
              </Typography>
            </Paper>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Grid container sx={{ minHeight: 550 }}>
                {/* Left Panel */}
                <Grid
                  item
                  xs={12}
                  md={3}
                  sx={{
                    borderRight: {
                      md: '1px solid #E5E7EB',
                    },
                  }}
                >
                  <Box sx={{ p: 1.5 }}>
                    <Typography fontWeight={700} mb={1}>
                      Search Results ({filteredTransactions.length})
                    </Typography>

                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search approval..."
                      value={searchResult}
                      onChange={(event) =>
                        setSearchResult(event.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Stack
                      direction="row"
                      spacing={0.7}
                      flexWrap="wrap"
                      useFlexGap
                      mt={1.5}
                      mb={1.5}
                    >
                      <Chip
                        size="small"
                        label={`Pending ${summary.pending ?? 0}`}
                        color="warning"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={`Approved ${summary.approved ?? 0}`}
                        color="success"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={`Rejected ${summary.rejected ?? 0}`}
                        color="error"
                        variant="outlined"
                      />
                    </Stack>

                    <Divider sx={{ mb: 1 }} />

                    <Box
                      sx={{
                        maxHeight: 650,
                        overflowY: 'auto',
                        pr: 0.5,
                      }}
                    >
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item, index) => {
                          const isSelected =
                            selectedTransaction?.transaction_visitor_id ===
                            item.transaction_visitor_id;

                          return (
                            <Box
                              key={
                                item.transaction_visitor_id ?? index
                              }
                              onClick={() => {
                                setSelectedTransaction(item);
                                setActiveTab(0);
                              }}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                border: 1,
                                borderColor: isSelected
                                  ? 'primary.main'
                                  : 'transparent',
                                bgcolor: isSelected
                                  ? 'primary.lighter'
                                  : 'transparent',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                {/* <Avatar
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    bgcolor: 'primary.light',
                                    color: 'primary.dark',
                                  }}
                                >
                                  {getInitial(
                                    getTransactionName(item),
                                  )}
                                </Avatar> */}

                                <Box flex={1} minWidth={0}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    noWrap
                                  >
                                    {getTransactionName(item)}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    display="block"
                                  >
                                    {item.host_name ?? '-'}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    display="block"
                                  >
                                    {formatDateTime(item.visitor_period_start) ?? '-'}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    display="block"
                                  >
                                    {formatDateTime(item.visitor_period_end) ?? '-'}
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.7}
                                    mt={0.7}
                                  >
                                    <StatusChip
                                      status={item.approval_status}
                                    />

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {item.total_visitor ?? 0} visitors
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Stack>
                            </Box>
                          );
                        })
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          py={4}
                        >
                          No approval records found.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Right Panel */}
                <Grid item xs={12} md={9}>
                  {selectedTransaction ? (
                    <Box>
                      {/* Selected Header */}
                      <Box sx={{ p: 2 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 46,
                              height: 46,
                              bgcolor: 'primary.light',
                              color: 'primary.dark',
                            }}
                          >
                            {getInitial(
                              getTransactionName(selectedTransaction),
                            )}
                          </Avatar>

                          <Box flex={1} minWidth={0}>
                            <Typography variant="h6" fontWeight={700}>
                              {getTransactionName(selectedTransaction)}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {selectedTransaction.host_name ?? '-'}
                            </Typography>
                          </Box>

                          <StatusChip
                            status={selectedTransaction.approval_status}
                          />
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Detail Tabs */}
                      <Tabs
                        value={activeTab}
                        onChange={(_, value) => setActiveTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          px: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                          '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: 46,
                          },
                        }}
                      >
                        <Tab
                          icon={<PersonOutline />}
                          iconPosition="start"
                          label="Overview"
                        />

                        <Tab
                          icon={<GroupsOutlined />}
                          iconPosition="start"
                          label={`Visitors (${visitorCount})`}
                        />

                        <Tab
                          icon={<History />}
                          iconPosition="start"
                          label="Approval History"
                        />
                      </Tabs>

                      {/* Tab Content */}
                      <Box sx={{ p: 2 }}>
                        {activeTab === 0 && renderOverview()}
                        {activeTab === 1 && renderVisitors()}
                        {activeTab === 2 && renderApprovalHistory()}
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        Select an approval transaction to view details.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ApprovalReport;
