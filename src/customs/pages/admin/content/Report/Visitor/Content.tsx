
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  IconRefresh,
  IconUser,
  IconUsers,
  IconCalendar,
  IconShield,
  IconBell,
  IconBan,
  IconLogin,
  IconLogout,
} from '@tabler/icons-react';

import {
  Download,
  Refresh,
  Search,
} from '@mui/icons-material';

import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

import {
  useReportVisitor,
  useExportReportVisitor,
} from 'src/hooks/Report/useReportVisitor';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface VisitorProfile {
  visitor_id?: string | number;
  name?: string;
  identity_id?: string;
  email?: string;
  phone_number?: string;
  company?: string;
  is_employee?: boolean;
  is_blacklist?: boolean;
  is_block?: boolean;
  total_invitations_received?: number;
  total_invitations_created?: number;
}

interface InvitationSummary {
  total_invited?: number;
  total_checkin?: number;
  total_checkout?: number;
  total_rejected?: number;
}

interface InvitesSummary {
  total_transactions_created?: number;
  total_guests_invited?: number;
  total_guests_attended?: number;
}

interface VisitorInvitation {
  trx_visitor_id?: string | number;
  transaction_visitor_id?: string | number;
  visitor_code?: string;
  agenda?: string;
  host_name?: string;
  site_name?: string;
  start_date?: string;
  end_date?: string;
  checkin_at?: string;
  visitor_status?: string;
  [key: string]: any;
}

interface VisitorBehaviorData {
  profile?: VisitorProfile;
  by_invitation?: {
    summary?: InvitationSummary;
    data?: VisitorInvitation[];
  };
  by_invites?: {
    summary?: InvitesSummary;
    transaction_visitor?: any[];
  };
  by_block?: any[];
  by_blacklist?: any[];
  by_alarm?: any[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  color = 'primary.main',
}: StatCardProps) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 2,
    }}
  >
    <CardContent>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            mt={1}
          >
            {value ?? 0}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const VisitorBehaviorReport = () => {
  // ==========================================
  // FILTER
  // ==========================================

  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  );

  const [endDate, setEndDate] = useState(
    dayjs().format('YYYY-MM-DD'),
  );

  const [keyword, setKeyword] = useState('');

  // ==========================================
  // REPORT STATE
  // ==========================================

  const [reportData, setReportData] =
    useState<VisitorBehaviorData | null>(null);

  const [hasGenerated, setHasGenerated] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ==========================================
  // MUTATIONS
  // ==========================================

  const {
    mutateAsync: generateReport,
    isPending: loadingGenerate,
  } = useReportVisitor();

  const {
    mutateAsync: exportReport,
    isPending: loadingExport,
  } = useExportReportVisitor();

  const loading = loadingGenerate || loadingExport;

  // ==========================================
  // RESPONSE DATA
  // ==========================================

  const profile = reportData?.profile;

  const invitationSummary =
    reportData?.by_invitation?.summary ?? {};

  const invitationData =
    reportData?.by_invitation?.data ?? [];

  const invitesSummary =
    reportData?.by_invites?.summary ?? {};

  const invitesData =
    reportData?.by_invites?.transaction_visitor ?? [];

  const blockData = reportData?.by_block ?? [];

  const blacklistData = reportData?.by_blacklist ?? [];

  const alarmData = reportData?.by_alarm ?? [];

  // ==========================================
  // PAYLOAD
  // ==========================================

  const getPayload = (isExport = false) => ({
    start_date: startDate,
    end_date: endDate,
    keyword: keyword.trim() || null,
    is_export: isExport,
    export_report: 'Excell',
  });

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      window.alert('Please select start date and end date.');
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
      window.alert('End date cannot be earlier than start date.');
      return;
    }

    try {
      setErrorMessage('');

      const response = await generateReport(getPayload(false));

      const data = response?.collection?.data;

      if (!data) {
        setReportData(null);
      } else {
        setReportData(data);
      }

      setHasGenerated(true);
      setIsDirty(false);
    } catch (error: any) {
      console.error(
        'Failed to generate visitor behavior report:',
        error,
      );

      setErrorMessage(
        error?.response?.data?.msg ||
        'Failed to generate visitor behavior report.',
      );
    }
  };

  // ==========================================
  // EXPORT EXCEL
  // ==========================================

  const handleExport = async () => {
    if (!hasGenerated || isDirty || !reportData) {
      return;
    }

    try {
      setErrorMessage('');

      const response = await exportReport(getPayload(true));

      const blob =
        response instanceof Blob
          ? response
          : new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      link.download = `visitor-behavior-report-${startDate}-${endDate}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        'Failed to export visitor behavior report:',
        error,
      );

      setErrorMessage('Failed to export visitor behavior report.');
    }
  };


  const handleReset = () => {
    setStartDate(
      dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    );

    setEndDate(dayjs().format('YYYY-MM-DD'));
    setKeyword('');
    setReportData(null);
    setHasGenerated(false);
    setIsDirty(false);
    setErrorMessage('');
  };


  const invitationTableData = useMemo(() => {
    return invitationData.map((item) => ({
      visitor_code: item.visitor_code,
      agenda: item.agenda,
      host_name: item.host_name,
      site_name: item.site_name,
      start_date: item.start_date
        ? formatDateTime(item.start_date)
        : '-',
      end_date: item.end_date
        ? formatDateTime(item.end_date)
        : '-',
      checkin_at: item.checkin_at
        ? formatDateTime(item.checkin_at)
        : '-',
      visitor_status: item.visitor_status,
    }));
  }, [invitationData]);

  const invitesTableData = useMemo(() => {
    return invitesData.map((item: any) => {
      const {
        transaction_visitor_id,
        checkin_at,
        invited,
        ...rest
      } = item;

      return {
        ...rest,
        start_date: item.start_date
          ? formatDateTime(item.start_date)
          : item.start_date,
        end_date: item.end_date
          ? formatDateTime(item.end_date)
          : item.end_date,

      };
    });
  }, [invitesData]);

  const blockTableData = useMemo(() => {
    return blockData.map((item: any) => ({
      action: item.action,
      timestamp: item.timestamp
        ? formatDateTime(item.timestamp)
        : '-',
      reason: item.reason,
      actor: item.actor,
      site_name: item.site_name,
    }));
  }, [blockData]);

  const blacklistTableData = useMemo(() => {
    return blacklistData.map((item: any) => ({
      action: item.action,
      timestamp: item.timestamp
        ? formatDateTime(item.timestamp)
        : '-',
      reason: item.reason,
      actor: item.actor,
      site_name: item.site_name,
    }));
  }, [blacklistData]);

  const alarmTableData = useMemo(() => {
    return alarmData.map((item: any) => ({
      event_type: item.event_type,
      event_name: item.event_name,
      timestamp: item.timestamp
        ? formatDateTime(item.timestamp)
        : '-',
      site_name: item.site_name,
      location: item.location,
      message: item.message,
      severity: item.severity,
    }));
  }, [alarmData]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container
        title="Visitor Behavior Report"
        description="This is Visitor Behavior Report page"
      >
        <Box sx={{ p: 1.5 }}>
          {/* HEADER */}

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            mb={2.5}
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
              <IconUser />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                Visitor Report
              </Typography>

              <Typography variant="body2" color="text.secondary">
                View and export visitor behavior records.
              </Typography>
            </Box>
          </Stack>

          {/* FILTER */}

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 2,
            }}
          >
            <Typography fontWeight={700} mb={0.5}>
              Report Filters
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mb={2}
            >
              Select a date range and keyword to generate your visitor behavior report.
            </Typography>

            <Grid container spacing={2}>
              {/* START DATE */}

              <Grid item xs={12} md={4}>
                <CustomFormLabel required>
                  Start Date
                </CustomFormLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label=""
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setIsDirty(true);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* END DATE */}

              <Grid item xs={12} md={4}>
                <CustomFormLabel required>
                  End Date
                </CustomFormLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label=""
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setIsDirty(true);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* KEYWORD */}

              <Grid item xs={12} md={4}>
                <CustomFormLabel >
                  Search
                </CustomFormLabel>
                <FormControl fullWidth size="small">


                  <CustomTextField
                    fullWidth
                    size="small"
                    placeholder="Name, Identity ID, or Email"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setIsDirty(true);
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        mt: 0,
                      },
                    }}
                  />
                </FormControl>
              </Grid>

              {/* ACTION BUTTONS */}

              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={1}
                mt={1}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    loadingExport ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Download />
                    )
                  }
                  onClick={handleExport}
                  disabled={
                    !hasGenerated ||
                    isDirty ||
                    !reportData ||
                    loading
                  }
                >
                  Export Excel
                </Button>


                {/* FOOTER REFRESH */}

                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}
                >


                  <Button
                    variant="contained"
                    startIcon={<IconRefresh />}
                    onClick={handleSearch}
                    disabled={loading || !hasGenerated}
                  >
                    Refresh
                  </Button>
                </Stack>
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
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={
                    loadingGenerate ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Search />
                    )
                  }
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* ERROR */}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* REPORT CONTENT */}

          {!hasGenerated ? (
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2,
                borderStyle: 'dashed',
              }}
            >
              <IconUser size={42} color="gray" />

              <Typography
                variant="h6"
                fontWeight={700}
                mt={1.5}
              >
                No Visitor Report
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={0.5}
              >
                Select the date range and enter a keyword if needed,
                then click Search to view visitor behavior records.
              </Typography>
            </Paper>
          ) : !reportData ? (
            <Paper
              variant="outlined"
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 2,
              }}
            >
              <Typography fontWeight={600}>
                No Visitor Data Found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={0.5}
              >
                There is no visitor data within the selected filter.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {/* PROFILE */}

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack
                    direction={{
                      xs: 'column',
                      sm: 'row',
                    }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={1.5}
                      >
                        <IconUser size={21} />

                        <Typography variant="h6" fontWeight={700}>
                          Visitor Profile
                        </Typography>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography variant="h5" fontWeight={700}>
                          {profile?.name ?? '-'}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" mt={1}>
                          Identity ID: {profile?.identity_id ?? '-'}
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                          Email: {profile?.email ?? '-'}
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                          Phone: {profile?.phone_number ?? '-'}
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                          Organization: {profile?.company ?? '-'}
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      alignItems="flex-start"
                    >
                      <Chip
                        size="small"
                        label={
                          profile?.is_employee
                            ? 'Employee'
                            : 'Visitor'
                        }
                        color={profile?.is_employee ? 'info' : 'default'}
                      />

                      <Chip
                        size="small"
                        label={
                          profile?.is_blacklist
                            ? 'Blacklisted'
                            : 'Not Blacklisted'
                        }
                        color={
                          profile?.is_blacklist ? 'error' : 'success'
                        }
                      />

                      <Chip
                        size="small"
                        label={
                          profile?.is_block
                            ? 'Blocked'
                            : 'Not Blocked'
                        }
                        color={
                          profile?.is_block ? 'error' : 'success'
                        }
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* INVITATION RECEIVED SUMMARY */}

              <Box>
                <Typography variant="h6" fontWeight={700} mb={1.5}>
                  Invitation Received Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Invited"
                      value={invitationSummary.total_invited ?? 0}
                      icon={<IconUsers />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Check-in"
                      value={invitationSummary.total_checkin ?? 0}
                      icon={<IconLogin />}
                      color="success.main"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Check-out"
                      value={invitationSummary.total_checkout ?? 0}
                      icon={<IconLogout />}
                      color="warning.main"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Rejected"
                      value={invitationSummary.total_rejected ?? 0}
                      icon={<IconBan />}
                      color="error.main"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* INVITATION RECEIVED TABLE */}

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    px={1}
                    py={1}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Invitation Received
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Total {invitationTableData.length} records
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {invitationTableData.length > 0 ? (
                    <DynamicTable
                      data={invitationTableData}
                      loading={loadingGenerate}
                      overflowX="auto"
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No invitation received.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* INVITATION CREATED SUMMARY */}

              <Box>
                <Typography variant="h6" fontWeight={700} mb={1.5}>
                  Invitation Created Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Transactions Created"
                      value={
                        invitesSummary.total_transactions_created ?? 0
                      }
                      icon={<IconCalendar />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Guests Invited"
                      value={invitesSummary.total_guests_invited ?? 0}
                      icon={<IconUsers />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Guests Attended"
                      value={invitesSummary.total_guests_attended ?? 0}
                      icon={<IconLogin />}
                      color="success.main"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* INVITATION CREATED TABLE */}

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="h6" fontWeight={700} px={1} py={1}>
                    Invitation Created
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {invitesTableData.length > 0 ? (
                    <DynamicTable
                      data={invitesTableData}
                      loading={loadingGenerate}
                      overflowX="auto"
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No invitation created.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* BLOCK HISTORY */}

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    px={1}
                    py={1}
                  >
                    <IconBan color="red" />

                    <Typography variant="h6" fontWeight={700}>
                      Block / Unblock History
                    </Typography>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {blockTableData.length > 0 ? (
                    <DynamicTable
                      data={blockTableData}
                      loading={loadingGenerate}
                      overflowX="auto"
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No block history.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* BLACKLIST HISTORY */}

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    px={1}
                    py={1}
                  >
                    <IconShield color="red" />

                    <Typography variant="h6" fontWeight={700}>
                      Blacklist History
                    </Typography>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {blacklistTableData.length > 0 ? (
                    <DynamicTable
                      data={blacklistTableData}
                      loading={loadingGenerate}
                      overflowX="auto"
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No blacklist history.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* ALARM HISTORY */}

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    px={1}
                    py={1}
                  >
                    <IconBell color="orange" />

                    <Typography variant="h6" fontWeight={700}>
                      Alarm / Event History
                    </Typography>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {alarmTableData.length > 0 ? (
                    <DynamicTable
                      data={alarmTableData}
                      loading={loadingGenerate}
                      overflowX="auto"
                    />
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No alarm or event history.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>


            </Stack>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default VisitorBehaviorReport;
