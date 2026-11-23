
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import {
    Avatar,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';

import {
    Search,
    Download,
    Refresh,
    // IconCar,
    // Users,
    // ParkingSquare,
    // Building2,
} from '@mui/icons-material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
    AdminCustomSidebarItemsData,
    AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import {
    useReportParking,
    useExportReportParking,
} from 'src/hooks/Report/useReportParking';
import { useUserPagination } from 'src/hooks/User/useUsers';
import { IconBuilding, IconCar, IconDownload, IconParking, IconRefresh, IconUser, IconUsersGroup } from '@tabler/icons-react';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useDebounce } from 'src/hooks/useDebounce';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';



interface ActorOption {
    value: string;
    label: string;
}

interface ParkingVisitor {
    visitor_name: string;
    visitor_code: string;
    host_name: string;
    vehicle_plate: string;
    vehicle_type: string;
    vehicle_name: string;
    parking_area: string;
    parking_slot: string;
    checkin_at: string;
    parking_duration: number;
    visitor_status: string;
    site_name: string;
}

interface ParkingCollection {
    filter: any;

    summary: {
        total_vehicles: number;
        total_visitors_with_vehicle: number;
        total_active_parked: number;
    };

    by_vehicle: {
        vehicle_plate: string;
        vehicle_type_name: string;
        total_visits: number;
    }[];

    by_vehicle_type: {
        vehicle_type: string;
        vehicle_type_name: string;
        total_vehicles: number;
    }[];

    by_visitor_type: {
        visitor_type_id: string;
        visitor_type_name: string;
        total_vehicles: number;
    }[];

    by_site: {
        site_id: string;
        site_name: string;
        total_vehicles: number;
    }[];

    by_visitor: any[];
    data: ParkingVisitor[];
}

interface Props {
    roleAccess?: string;
}

const ParkingReport = ({ roleAccess = 'Admin' }: Props) => {

    // =====================================================
    // FILTER STATE
    // =====================================================

    const [startDate, setStartDate] = useState(
        dayjs().subtract(9, 'day').format('YYYY-MM-DD'),
    );

    const [endDate, setEndDate] = useState(
        dayjs().format('YYYY-MM-DD'),
    );

    const [actorId, setActorId] = useState<string | null>(null);
    const [selectedActor, setSelectedActor] = useState<any | null>(null);
    const [searchActor, setSearchActor] = useState('');

    const [employeeKeyword, setEmployeeKeyword] = useState('');

    const [keyword, setKeyword] = useState('');

    const [report, setReport] = useState<ParkingCollection | null>(
        null,
    );

    const [hasGenerated, setHasGenerated] = useState(false);

    const [isDirty, setIsDirty] = useState(false);

    // =====================================================
    // ACTOR PAGINATION
    // =====================================================

    const {
        data: employeeData,
        isLoading: loadingEmployee,
    } = useUserPagination({
        page: 0,
        rowsPerPage: 10,
        sortDir: 'desc',
        searchKeyword: employeeKeyword,
        'is-employee': true,
    });

    const employees = useMemo(() => {
        const collection =
            employeeData?.collection?.data ??
            employeeData?.data?.collection?.data ??
            employeeData?.data ??
            [];

        return Array.isArray(collection) ? collection : [];
    }, [employeeData]);

    const actorOptions: ActorOption[] = useMemo(
        () =>
            employees.map((item: any) => ({
                value: item.id,
                label: item.name,
            })),
        [employees],
    );


    // =====================================================
    // API MUTATIONS
    // =====================================================

    const {
        mutateAsync: generateReport,
        isPending: loadingGenerate,
    } = useReportParking();

    const {
        mutateAsync: exportReport,
        isPending: loadingExport,
    } = useExportReportParking();

    const loading = loadingGenerate || loadingExport;

    // =====================================================
    // FILTER PAYLOAD
    // =====================================================

    const getPayload = (isExport = false) => ({
        start_date: startDate,
        end_date: endDate,
        actor_id: actorId || null,
        is_export: isExport,
        export_report: 'Excell'
    });

    // =====================================================
    // SEARCH REPORT
    // =====================================================

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
            const response = await generateReport(getPayload(false));

            const collection = response?.collection;

            if (!collection) {
                setReport(null);
                setHasGenerated(true);
                setIsDirty(false);
                return;
            }

            setReport(collection);
            setKeyword('');
            setHasGenerated(true);
            setIsDirty(false);

        } catch (error) {
            console.error('Generate parking report failed:', error);
        }
    };

    // =====================================================
    // EXPORT EXCEL
    // =====================================================

    const handleExport = async () => {

        if (
            !hasGenerated ||
            isDirty ||
            !report?.data?.length
        ) {
            return;
        }

        try {
            const response = await exportReport(getPayload(true));

            const blob = response instanceof Blob
                ? response
                : new Blob(
                    [response?.data ?? response],
                    {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    },
                );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;

            link.download =
                `parking-report-${startDate}-${endDate}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export parking report failed:', error);
        }
    };

    // =====================================================
    // RESET FILTER
    // =====================================================

    const handleReset = () => {
        setStartDate(
            dayjs().subtract(9, 'day').format('YYYY-MM-DD'),
        );

        setEndDate(dayjs().format('YYYY-MM-DD'));
        setActorId(null);
        setSelectedActor(null);
        setSearchActor('');
        setEmployeeKeyword('');
        setKeyword('');

        setReport(null);
        setHasGenerated(false);
        setIsDirty(false);
    };

    // =====================================================
    // FILTER CHANGE
    // =====================================================

    const handleFilterChange = (callback: () => void) => {
        callback();
        setIsDirty(true);
    };

    // =====================================================
    // RESPONSE DATA
    // =====================================================

    const summary = report?.summary ?? {
        total_vehicles: 0,
        total_visitors_with_vehicle: 0,
        total_active_parked: 0,
    };

    const visitors = report?.data ?? [];

    const vehicleData = report?.by_vehicle ?? [];

    const vehicleTypes = report?.by_vehicle_type ?? [];

    const visitorTypes = report?.by_visitor_type ?? [];

    const siteData = report?.by_site ?? [];

    // =====================================================
    // LOCAL SEARCH TABLE
    // =====================================================

    const filteredVisitors = useMemo(() => {

        const search = keyword.toLowerCase().trim();

        if (!search) return visitors;

        return visitors.filter((item) =>
            [
                item.visitor_name,
                item.visitor_code,
                item.host_name,
                item.vehicle_plate,
                item.vehicle_name,
                item.vehicle_type,
                item.site_name,
                item.parking_area,
                item.parking_slot,
                item.visitor_status,
            ].some((value) =>
                String(value ?? '').toLowerCase().includes(search),
            ),
        );

    }, [visitors, keyword]);

    // =====================================================
    // COMPONENTS
    // =====================================================

    const SummaryCard = ({
        title,
        value,
        icon,
        color,
        description,
    }: {
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
        description: string;
    }) => (
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
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            mt={1}
                        >
                            {value.toLocaleString()}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {description}
                        </Typography>
                    </Box>

                    <Avatar
                        sx={{
                            bgcolor: `${color}15`,
                            color,
                            width: 48,
                            height: 48,
                        }}
                    >
                        {icon}
                    </Avatar>
                </Stack>
            </CardContent>
        </Card>
    );

    const DistributionCard = ({
        title,
        icon,
        data,
        getName,
        getValue,
    }: {
        title: string;
        icon: React.ReactNode;
        data: any[];
        getName: (item: any) => string;
        getValue: (item: any) => number;
    }) => {

        const maxValue = Math.max(
            ...data.map((item) => getValue(item)),
            1,
        );

        return (
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
                        spacing={1}
                        alignItems="center"
                        mb={2.5}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: 'primary.main',
                                color: 'white',
                            }}
                        >
                            {icon}
                        </Avatar>

                        <Typography fontWeight={700}>
                            {title}
                        </Typography>
                    </Stack>

                    {data.length > 0 ? (
                        <Stack spacing={2}>
                            {data.map((item, index) => {
                                const value = getValue(item);

                                return (
                                    <Box key={index}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mb={0.7}
                                        >
                                            <Typography variant="body2">
                                                {getName(item)}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                            >
                                                {value.toLocaleString()}
                                            </Typography>
                                        </Stack>

                                        <Box
                                            sx={{
                                                height: 8,
                                                bgcolor: 'action.hover',
                                                borderRadius: 5,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    height: '100%',
                                                    width: `${(value / maxValue) * 100}%`,
                                                    bgcolor: 'primary.main',
                                                    borderRadius: 5,
                                                    transition: 'width .3s ease',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    ) : (
                        <Box py={4} textAlign="center">
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                No data available
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    };

    const StatusChip = ({ status }: { status: string }) => {

        const normalized = (status ?? '').toLowerCase();

        const color =
            normalized === 'checkin'
                ? 'success'
                : normalized === 'preregis'
                    ? 'default'
                    : normalized === 'checkout'
                        ? 'error'
                        : 'info';

        return (
            <Chip
                size="small"
                label={status || 'Unknown'}
                color={color}
                sx={{ fontWeight: 600 }}
            />
        );
    };



    const debounceSearch = useDebounce(searchActor);

    const { data: userData, isLoading: loadingUsers } = useUserPagination({
        page: 0,
        rowsPerPage: 10,
        sortDir: 'desc',
        searchKeyword: debounceSearch,
    });



    return (
        <PageContainer
            itemDataCustomNavListing={AdminNavListingData}
            itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
        >
            <Container title="Parking Report" description="This is Content Report page">

                <Box sx={{ p: 1.5 }}>

                    {/* HEADER */}

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={2.5}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                        >
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                }}
                            >
                                <IconCar size={25} />
                            </Avatar>

                            <Box>
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    Parking Report
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Monitor visitor vehicles and parking activities.
                                </Typography>
                            </Box>
                        </Stack>
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
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={2}
                        >
                            <Box>
                                <Typography fontWeight={700}>
                                    Report Filters
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Select date range and actor to generate report.
                                </Typography>
                            </Box>
                        </Stack>

                        <Grid container spacing={2}>

                            {/* START DATE */}

                            <Grid item xs={12} sm={6} md={4} >
                                <CustomFormLabel required sx={{ mt: 0 }}>
                                    Start Date
                                </CustomFormLabel>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label=""
                                    value={startDate}
                                    onChange={(e) =>
                                        handleFilterChange(() =>
                                            setStartDate(e.target.value),
                                        )
                                    }
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* END DATE */}

                            <Grid item xs={12} sm={6} md={4}>
                                <CustomFormLabel required sx={{ mt: 0 }}>
                                    End Date
                                </CustomFormLabel>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label=""
                                    value={endDate}
                                    onChange={(e) =>
                                        handleFilterChange(() =>
                                            setEndDate(e.target.value),
                                        )
                                    }
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* ACTOR */}

                            <Grid item xs={12} sm={6} md={4}>
                                <CustomFormLabel sx={{ mt: 0 }}>
                                    Actor
                                </CustomFormLabel>

                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={userData?.collection ?? []}
                                    loading={loadingUsers}
                                    filterOptions={(options) => options}
                                    getOptionLabel={(option: any) => option.fullname ?? ''}
                                    value={selectedActor}
                                    onInputChange={(_, value, reason) => {
                                        if (reason === 'input') {
                                            setSearchActor(value);
                                        }
                                    }}
                                    onChange={(_, value) => {
                                        setSelectedActor(value);
                                        setActorId(value ? String(value.id) : null);
                                    }}
                                    isOptionEqualToValue={(option: any, value: any) =>
                                        String(option.id) === String(value.id)
                                    }
                                    noOptionsText="No User found"
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

                            {/* ACTIONS */}

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
                                    disabled={
                                        !hasGenerated ||
                                        isDirty ||
                                        visitors.length === 0 ||
                                        loading
                                    }
                                    onClick={handleExport}
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

                    {/* INITIAL STATE */}

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
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: 'action.hover',
                                    color: 'text.secondary',
                                }}
                            >
                                <IconCar size={32} />
                            </Avatar>

                            <Typography variant="h6" fontWeight={700}>
                                No Parking Data
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Select your filters and click Search to view
                                parking activities.
                            </Typography>
                        </Paper>

                    ) : (

                        <Stack spacing={2.5}>

                            {/* KPI SUMMARY */}

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    mb={1.5}
                                >
                                    Parking Overview
                                </Typography>

                                <Grid container spacing={2}>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <SummaryCard
                                            title="Total Vehicles"
                                            value={summary.total_vehicles}
                                            icon={<IconCar size={23} />}
                                            color="#2563EB"
                                            description="Total registered vehicles"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <SummaryCard
                                            title="Visitors With Vehicle"
                                            value={summary.total_visitors_with_vehicle}
                                            icon={<IconUsersGroup size={23} />}
                                            color="#059669"
                                            description="Visitors using vehicles"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4}>
                                        <SummaryCard
                                            title="Active Parked"
                                            value={summary.total_active_parked}
                                            icon={<IconParking size={23} />}
                                            color="#D97706"
                                            description="Active parking records"
                                        />
                                    </Grid>

                                </Grid>
                            </Box>

                            {/* DISTRIBUTION */}

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    mb={1.5}
                                >
                                    Parking Distribution
                                </Typography>

                                <Grid container spacing={2}>

                                    <Grid item xs={12} md={6}>
                                        <DistributionCard
                                            title="Vehicle Plate"
                                            icon={<IconCar size={19} />}
                                            data={vehicleData}
                                            getName={(item) =>
                                                `${item.vehicle_plate} (${item.vehicle_type_name})`
                                            }
                                            getValue={(item) => item.total_visits}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <DistributionCard
                                            title="Vehicle Type"
                                            icon={<IconCar size={19} />}
                                            data={vehicleTypes}
                                            getName={(item) => item.vehicle_type_name}
                                            getValue={(item) => item.total_vehicles}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <DistributionCard
                                            title="Visitor Type"
                                            icon={<IconUser size={19} />}
                                            data={visitorTypes}
                                            getName={(item) => item.visitor_type_name}
                                            getValue={(item) => item.total_vehicles}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <DistributionCard
                                            title="Site Distribution"
                                            icon={<IconBuilding size={19} />}
                                            data={siteData}
                                            getName={(item) => item.site_name}
                                            getValue={(item) => item.total_vehicles}
                                        />
                                    </Grid>

                                </Grid>
                            </Box>

                            {/* DETAIL TABLE */}

                            <Card
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            >
                                <CardContent>

                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        alignItems={{ xs: 'stretch', sm: 'center' }}
                                        justifyContent="space-between"
                                        spacing={2}
                                        mb={2}
                                    >
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                mb={1}
                                            >
                                                Parking Details
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Detailed visitor and vehicle information.
                                            </Typography>
                                        </Box>

                                        <TextField
                                            size="small"
                                            placeholder="Search visitor, plate, host..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            sx={{
                                                width: {
                                                    xs: '100%',
                                                    sm: 300,
                                                },
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Stack>

                                    <Divider sx={{ mb: 2 }} />

                                    <TableContainer sx={{ overflowX: 'auto' }}>
                                        <Table
                                            size="small"
                                            sx={{ minWidth: 1150 }}
                                        >
                                            <TableHead>
                                                <TableRow
                                                    sx={{
                                                        '& th': {
                                                            fontWeight: 700,
                                                            whiteSpace: 'nowrap',
                                                            bgcolor: 'action.hover',
                                                        },
                                                    }}
                                                >
                                                    <TableCell>Visitor</TableCell>
                                                    <TableCell>Visitor Code</TableCell>
                                                    <TableCell>Vehicle</TableCell>
                                                    <TableCell>Parking Area</TableCell>
                                                    <TableCell>Parking Slot</TableCell>
                                                    <TableCell>Host</TableCell>
                                                    <TableCell>Check-in</TableCell>
                                                    <TableCell>Duration</TableCell>
                                                    <TableCell>Site</TableCell>
                                                    <TableCell>Status</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>

                                                {filteredVisitors.length > 0 ? (

                                                    filteredVisitors.map((item, index) => (

                                                        <TableRow
                                                            key={`${item.visitor_code}-${index}`}
                                                            hover
                                                        >
                                                            <TableCell>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    {item.visitor_name || '-'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell>
                                                                {item.visitor_code || '-'}
                                                            </TableCell>

                                                            <TableCell>
                                                                <Stack spacing={0.3}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight={700}
                                                                    >
                                                                        {item.vehicle_plate || '-'}
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {item.vehicle_name ||
                                                                            item.vehicle_type ||
                                                                            '-'}
                                                                    </Typography>
                                                                </Stack>
                                                            </TableCell>

                                                            <TableCell>
                                                                {item.parking_area || '-'}
                                                            </TableCell>

                                                            <TableCell>
                                                                {item.parking_slot || '-'}
                                                            </TableCell>

                                                            <TableCell>
                                                                {item.host_name || '-'}
                                                            </TableCell>

                                                            <TableCell>
                                                                {formatDateTime(item.checkin_at) || '-'}
                                                            </TableCell>

                                                            <TableCell>
                                                                {item.parking_duration ?? 0}
                                                            </TableCell>

                                                            <TableCell>
                                                                {item.site_name || '-'}
                                                            </TableCell>

                                                            <TableCell>
                                                                <StatusChip
                                                                    status={item.visitor_status}
                                                                />
                                                            </TableCell>
                                                        </TableRow>

                                                    ))

                                                ) : (

                                                    <TableRow>
                                                        <TableCell colSpan={10}>
                                                            <Box py={4} textAlign="center">
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                >
                                                                    No parking records found.
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>

                                                )}

                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mt={2}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Showing {filteredVisitors.length} of {visitors.length} records
                                        </Typography>
                                        {/* 
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {startDate} - {endDate}
                                        </Typography> */}
                                    </Stack>

                                </CardContent>
                            </Card>

                        </Stack>

                    )}
                </Box>
            </Container>
        </PageContainer>
    );
};

export default ParkingReport;
