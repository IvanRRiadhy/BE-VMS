
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
    CircularProgress,
    Chip,
    Tooltip,
    IconButton,
} from '@mui/material';



import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
    AdminCustomSidebarItemsData,
    AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';


import {
    useReportSecurityIncident,
    useExportReportSecurityIncident,
} from 'src/hooks/Report/useReportSecurityIncident';
import { IconRefresh, IconShield } from '@tabler/icons-react';
import { Download, Refresh, Search } from '@mui/icons-material';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface SecurityIncident {
    id?: string;
    incident_id?: string;
    incident_code?: string;
    incident_name?: string;
    incident_type?: string;
    incident_category?: string;
    description?: string;
    location?: string;
    site_name?: string;
    reported_by?: string;
    actor_name?: string;
    status?: string;
    severity?: string;
    created_at?: string;
    incident_date?: string;
    [key: string]: any;
}

const SecurityIncidentReport = () => {

    // ==========================================
    // FILTER
    // ==========================================

    const [startDate, setStartDate] = useState(
        dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    );

    const [endDate, setEndDate] = useState(
        dayjs().format('YYYY-MM-DD'),
    );

    const [reportData, setReportData] = useState<
        SecurityIncident[]
    >([]);

    const [hasGenerated, setHasGenerated] = useState(false);

    const [isDirty, setIsDirty] = useState(false);

    // ==========================================
    // MUTATIONS
    // ==========================================

    const {
        mutateAsync: generateReport,
        isPending: loadingGenerate,
    } = useReportSecurityIncident();

    const {
        mutateAsync: exportReport,
        isPending: loadingExport,
    } = useExportReportSecurityIncident();

    const loading = loadingGenerate || loadingExport;

    // ==========================================
    // PAYLOAD
    // ==========================================

    const getPayload = (isExport = false) => ({
        start_date: startDate,
        end_date: endDate,
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
            window.alert(
                'End date cannot be earlier than start date.',
            );
            return;
        }

        try {
            const response = await generateReport(getPayload(false));

            const collection = response?.collection;

            // Support collection.data or collection as array
            const rows = Array.isArray(collection)
                ? collection
                : Array.isArray(collection?.data)
                    ? collection.data
                    : [];

            setReportData(rows);
            setHasGenerated(true);
            setIsDirty(false);

        } catch (error) {
            console.error(
                'Failed to generate security incident report:',
                error,
            );
        }
    };

    // ==========================================
    // EXPORT EXCEL
    // ==========================================

    const handleExport = async () => {

        if (
            !hasGenerated ||
            isDirty ||
            reportData.length === 0
        ) {
            return;
        }

        try {
            const response = await exportReport(getPayload(true));

            const blob = response instanceof Blob
                ? response
                : new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;

            link.download =
                `security-incident-report-${startDate}-${endDate}.xlsx`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(
                'Failed to export security incident report:',
                error,
            );
        }
    };

    // ==========================================
    // RESET
    // ==========================================

    const handleReset = () => {
        setStartDate(
            dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        );

        setEndDate(dayjs().format('YYYY-MM-DD'));

        setReportData([]);

        setHasGenerated(false);

        setIsDirty(false);
    };

    // ==========================================
    // TABLE DATA
    // ==========================================

    const tableData = useMemo(() => {
        return reportData.map((item, index) => ({
            // no: index + 1,
            // incident_code: item.incident_code,
            // incident_name: item.incident_name,
            incident_type: item.incident_type,
            source_type: item.source_type,
            // location: item.location,
            site_name: item.site_name,
            is_alarm: item.is_alarm,
            status: item.status,
            time: formatDateTime(item.time),
            message: item.message,
        }));
    }, [reportData]);
    // ==========================================
    // TABLE COLUMNS
    // ==========================================



    // ==========================================
    // UI
    // ==========================================

    return (
        <PageContainer
            itemDataCustomNavListing={AdminNavListingData}
            itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
        >
            <Container title="Security Incident Report" description="This is Content Report page">

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
                            <IconShield />
                        </Box>

                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Security Incident Report
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                View and export security incident records.
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
                            Select a date range to generate your incident report.
                        </Typography>

                        <Grid container spacing={2}>

                            {/* START DATE */}

                            <Grid item xs={12} sm={6} md={6}>
                                <CustomFormLabel required sx={{ mt: 0 }}>
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

                            <Grid item xs={12} sm={6} md={6}>
                                <CustomFormLabel required sx={{ mt: 0 }}>
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

                            {/* ACTION BUTTONS */}

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
                                    onClick={handleExport}
                                    disabled={
                                        !hasGenerated ||
                                        isDirty ||
                                        reportData.length === 0 ||
                                        loading
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
                                    onClick={handleSearch}
                                    disabled={loading}
                                    startIcon={
                                        loadingGenerate
                                            ? <CircularProgress size={16} color="inherit" />
                                            : <Search />
                                    }
                                >
                                    Search
                                </Button>
                            </Grid>


                        </Grid>
                    </Paper>

                    {/* REPORT TABLE */}

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
                            <IconShield
                                size={42}
                                color="gray"
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                mt={1.5}
                            >
                                No Incident Report
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Select the start date and end date,
                                then click Search to view incident records.
                            </Typography>
                        </Paper>

                    ) : (

                        <Card
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            <CardContent sx={{ p: 1 }}>

                                <Stack
                                    direction={{
                                        xs: 'column',
                                        sm: 'row',
                                    }}
                                    alignItems={{
                                        xs: 'flex-start',
                                        sm: 'center',
                                    }}
                                    justifyContent="space-between"
                                    spacing={1}
                                    mb={2}
                                >
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            Incident Records
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Total {reportData.length} incident records
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Chip
                                            label={`${dayjs(startDate).format('DD MMM YYYY')} - ${dayjs(endDate).format('DD MMM YYYY')}`}
                                            variant="outlined"
                                            size="small"
                                        />

                                        <Tooltip title="Refresh data">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{ borderRadius: 2 }}
                                                startIcon={<IconRefresh />}
                                                onClick={handleSearch}
                                                disabled={loading}
                                            >
                                                Refresh
                                            </Button>
                                        </Tooltip>
                                    </Stack>
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                {reportData.length > 0 ? (

                                    <DynamicTable
                                        data={tableData}
                                        // columns={columns}
                                        loading={loadingGenerate}
                                        // isHavePagination={true}
                                        // defaultRowsPerPage={10}
                                        // rowsPerPageOptions={[10, 50, 100]}
                                        overflowX={'auto'}
                                    />

                                ) : (

                                    <Box
                                        textAlign="center"
                                        py={5}
                                    >
                                        <IconShield
                                            size={38}
                                            color="gray"
                                        />

                                        <Typography
                                            fontWeight={600}
                                            mt={1}
                                        >
                                            No Incident Found
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 2 }}
                                        >
                                            There are no security incidents
                                            within the selected date range.
                                        </Typography>
                                    </Box>

                                )}

                            </CardContent>
                        </Card>

                    )}

                </Box>
            </Container>
        </PageContainer>
    );
};

export default SecurityIncidentReport;
