
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid2 as Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
} from '@mui/lab';
import {
    IconMapPin,
    IconCalendarEvent,
    IconCar,
    IconClock,
    IconActivity,
    IconShieldCheck,
    IconCamera,
    IconInfoCircle,
    IconX,
} from '@tabler/icons-react';

import dayjs from 'dayjs';
import { useInvestigateVisitor } from 'src/hooks/Operator/useInvestigateVisitor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useState } from 'react';

interface Props {
    visitor?: any;
}



const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
        case 'completed':
        case 'granted':
        case 'checked in':
        case 'active':
        case 'parked':
            return 'success';

        case 'expected':
            return 'info';
        case 'pending':
            return 'default';


        case 'denied':
        case 'failed':
        case 'alarm':
            return 'error';

        default:
            return 'default';
    }
};

const SectionTitle = ({
    icon,
    title,
    count,
}: {
    icon: React.ReactNode;
    title: string;
    count?: number;
}) => (
    <Stack direction="row" alignItems="center" spacing={1} >
        {icon}
        <Typography variant="h6" fontWeight={600}>
            {title}
        </Typography>
        {count !== undefined && (
            <Chip size="small" label={count} />
        )}
    </Stack>
);

const VisitorTracker = ({ visitor }: Props) => {


    if (!visitor) {
        return <Alert severity="info">Please select a visitor.</Alert>;
    }


    if (!visitor) {
        return (
            <Alert severity="info">
                No visitor tracker data available.
            </Alert>
        );
    }

    const visitors = visitor?.visitor_info;
    const timeline = visitor?.visit_timeline ?? [];
    const movements = visitor?.movements ?? [];
    const accessLogs = visitor?.access_logs ?? [];
    const vehicleRecords = visitor?.vehicle_records ?? [];
    // const captureImages = collection.capture_images ?? [];

    const [openDialogDetail, setOpenDialogDetail] = useState(false);

    return (
        <Stack spacing={3}>


            <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <SectionTitle
                            icon={<IconCalendarEvent size={21} />}
                            title="Visit Timeline"
                            count={timeline.length}
                        />
                        <Button variant='contained' color="primary" startIcon={<IconInfoCircle size={20} />} onClick={() => setOpenDialogDetail(true)}> View All Details</Button>
                    </Box>
                    {timeline.length === 0 ? (
                        <Typography color="text.secondary">
                            No timeline records available.
                        </Typography>
                    ) : (
                        <Timeline
                            position="right"
                            sx={{
                                p: 0,
                                m: 0,
                                '& .MuiTimelineItem-root:before': {
                                    flex: 0,
                                    padding: 0,
                                },
                            }}
                        >
                            {timeline.map((item: any, index: number) => (
                                <TimelineItem key={item.id || index}>
                                    <TimelineOppositeContent
                                        sx={{
                                            flex: 0.2,
                                            maxWidth: 110,
                                            px: 2,
                                            py: 1,
                                            textAlign: 'left',
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDateTime(item.timestamp)}
                                        </Typography>
                                    </TimelineOppositeContent>

                                    <TimelineSeparator>
                                        <TimelineDot
                                            color={getStatusColor(item.status) as any}
                                            variant="filled"
                                            sx={{ boxShadow: 'none' }}
                                        />

                                        {index !== timeline.length - 1 && (
                                            <TimelineConnector />
                                        )}
                                    </TimelineSeparator>

                                    <TimelineContent sx={{ py: 1, px: 2, pb: 3 }}>
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            spacing={1}
                                        >
                                            <Box>
                                                <Typography fontWeight={600}>
                                                    {item.title || '-'}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary">
                                                    {item.subtitle || item.location || '-'}
                                                </Typography>

                                                {item.description && (
                                                    <Typography variant="body2" mt={0.5}>
                                                        {item.description}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Chip
                                                size="small"
                                                label={item.status || '-'}
                                                color={getStatusColor(item.status) as any}
                                                sx={{ alignSelf: 'flex-start' }}
                                            />
                                        </Stack>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    )}
                </CardContent>
            </Card>
            {/* Dialog Detail */}
            <Dialog open={openDialogDetail} onClose={() => setOpenDialogDetail(false)} maxWidth="md" fullWidth>
                <DialogTitle>Details Visitor Tracker
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenDialogDetail(false)}
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
                    {/* Movement History */}
                    <Card variant="outlined">
                        <CardContent>
                            <SectionTitle
                                icon={<IconActivity size={21} />}
                                title="Movement History"
                                count={movements.length}
                            />

                            {movements.length === 0 ? (
                                <Typography color="text.secondary">
                                    No movement records available.
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Area</TableCell>
                                                <TableCell>Building</TableCell>
                                                <TableCell>Event</TableCell>
                                                <TableCell>Remarks</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {movements.map((item: any, index: number) => (
                                                <TableRow key={item.id || index}>
                                                    <TableCell>
                                                        {formatDateTime(item.timestamp)}
                                                    </TableCell>
                                                    <TableCell>{item.area_name || '-'}</TableCell>
                                                    <TableCell>{item.building_name || '-'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={item.event_type || '-'}
                                                            color={getStatusColor(item.event_type)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.remarks || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Access Control History */}
                    <Card variant="outlined">
                        <CardContent>
                            <SectionTitle
                                icon={<IconShieldCheck size={21} />}
                                title="Access Control History"
                                count={accessLogs.length}
                            />

                            {accessLogs.length === 0 ? (
                                <Typography color="text.secondary">
                                    No access logs available.
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Access Point</TableCell>
                                                <TableCell>Card Number</TableCell>
                                                <TableCell>Direction</TableCell>
                                                <TableCell>Result</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {accessLogs.map((item: any, index: number) => (
                                                <TableRow key={item.id || index}>
                                                    <TableCell>
                                                        {formatDateTime(item.timestamp)}
                                                    </TableCell>
                                                    <TableCell>{item.access_point || '-'}</TableCell>
                                                    <TableCell>{item.card_number || '-'}</TableCell>
                                                    <TableCell>{item.direction || '-'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={item.access_status || item.result || '-'}
                                                            color={getStatusColor(item.access_status)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                    {/* Vehicle History */}
                    <Card variant="outlined">
                        <CardContent>
                            <SectionTitle
                                icon={<IconCar size={21} />}
                                title="Vehicle & Parking History"
                                count={vehicleRecords.length}
                            />

                            {vehicleRecords.length === 0 ? (
                                <Typography color="text.secondary">
                                    No vehicle records available.
                                </Typography>
                            ) : (
                                vehicleRecords.map((item: any, index: number) => (
                                    <Box key={item.id || index}>
                                        {index > 0 && <Divider sx={{ my: 2 }} />}

                                        <Grid container spacing={2} mt={2}>
                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    License Plate
                                                </Typography>
                                                <Typography fontWeight={600}>
                                                    {item.plate_number || '-'}
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Vehicle Type
                                                </Typography>
                                                <Typography>{item.vehicle_type || '-'}</Typography>
                                            </Grid>

                                            {/* <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Parking Status
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={item.parking_status || '-'}
                                                    color={getStatusColor(item.parking_status)}
                                                />
                                            </Grid> */}


                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Parking Area
                                                </Typography>
                                                <Typography>{item.parking_area || '-'}</Typography>
                                            </Grid>

                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Parking Slot
                                                </Typography>
                                                <Typography>{item.parking_slot || '-'}</Typography>
                                            </Grid>

                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Gate
                                                </Typography>
                                                <Typography>{item.gate_in_name || '-'}</Typography>
                                            </Grid>

                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Gate Access
                                                </Typography>
                                                <Typography>{item.gate_access_info || '-'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Duration
                                                </Typography>
                                                <Typography>{item.duration || '-'}</Typography>
                                            </Grid>


                                            <Grid size={{ xs: 6, md: 3 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Entry Time
                                                </Typography>
                                                <Typography>
                                                    {formatDateTime(item.entry_time)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>

                </DialogContent>
            </Dialog>
        </Stack>
    );
};

export default VisitorTracker;
