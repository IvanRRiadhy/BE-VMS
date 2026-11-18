
import {
    Box,
    Divider,
    Grid2 as Grid,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';

import {
    IconUsersGroup,
    IconIdBadge2,
    IconUser,
    IconEye,
    IconNumbers,
    IconCheckupList,
    IconCar,
    IconLicense,
    IconCalendarEvent,
    IconUserCheck,
    IconCalendarTime,
    IconMapPin,
} from '@tabler/icons-react';

// Sesuaikan import dengan lokasi project kamu
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface VisitorInformationProps {
    data: any;
    onOpenRelatedVisitors: () => void;
    statusBgMap: Record<string, string>;
    statusLabelMap: Record<string, string>;
    formatDateTime: (date?: any, extendPeriod?: any) => string;
}

const VisitorInformationTab = ({
    data,
    onOpenRelatedVisitors,
    statusBgMap,
    statusLabelMap,
    formatDateTime,
}: VisitorInformationProps) => {
    return (
        <Box
            sx={{
                gridArea: 'content',
                position: 'relative',
            }}
        >
            <Divider
                orientation="vertical"
                flexItem
                sx={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    transform: 'translateX(-50%)',
                }}
            />

            <Grid
                container
                rowSpacing={2}
                columnSpacing={2}
                sx={{
                    '& > :nth-of-type(odd)': { pr: 4 },
                    '& > :nth-of-type(even)': { pl: 4 },
                }}
            >
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconUsersGroup />
                        <Box>
                            <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visitor Code</CustomFormLabel>
                            <Typography>{data?.visitor_code || '-'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconIdBadge2 />
                        <Box>
                            <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Invitation Code</CustomFormLabel>
                            <Typography>{data?.invitation_code || '-'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconIdBadge2 />
                        <Box>
                            <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Invited By</CustomFormLabel>
                            <Typography>{data?.invited_by_name || '-'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconUser />
                        <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <CustomFormLabel sx={{ mt: 0 }}>Group Name</CustomFormLabel>
                                {data?.group_name && (
                                    <Tooltip title="View related visitors">
                                        <IconButton
                                            size="small"
                                            onClick={onOpenRelatedVisitors}
                                            sx={{
                                                p: 0.5,
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <IconEye size={18} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                            <Typography>{data?.group_name || '-'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconUser />
                        <Box>
                            <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group</CustomFormLabel>
                            <Typography>{data?.is_group ? 'Yes' : 'No'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconNumbers />
                        <Box>
                            <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visitor Number</CustomFormLabel>
                            <Typography>{data?.visitor_number || '-'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                    <Box display="flex" gap={2}>
                        <IconCheckupList />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visitor Status</CustomFormLabel>
                            <Box
                                sx={{
                                    backgroundColor: statusBgMap[data?.visitor_status],
                                    borderRadius: '999px',
                                    color: '#fff',
                                    px: 1.5,
                                    py: 0.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Typography>
                                    {' '}
                                    {statusLabelMap[data?.visitor_status] || data?.visitor_status || '-'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {!data?.is_host && (
                    <>
                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconCar />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Vehicle Type</CustomFormLabel>
                                    <Typography>{data?.vehicle_type || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconLicense />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                        License Plate Number
                                    </CustomFormLabel>
                                    <Typography>{data?.vehicle_plate_number || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconCar />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Parking Slot</CustomFormLabel>
                                    <Typography>{data?.parking?.parking_slot || '-'}</Typography>
                                    {/* {data && <Typography>1A</Typography>} */}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconCar />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Parking Area</CustomFormLabel>
                                    <Typography>{data?.parking?.parking_area_name || '-'}</Typography>
                                    {/* {data && <Typography>Area Parkir</Typography>} */}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconCalendarEvent />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Agenda</CustomFormLabel>
                                    <Typography>{data?.agenda || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconUserCheck />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>PIC Host</CustomFormLabel>
                                    <Typography>{data?.host_name || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconCalendarTime />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                        Visit Period Start
                                    </CustomFormLabel>
                                    {formatDateTime(data?.visitor_period_start) || '-'}
                                </Box>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconCalendarEvent />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visit Period End</CustomFormLabel>
                                    <Typography>
                                        {formatDateTime(data?.visitor_period_end, data?.extend_visitor_period)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 6, md: 6 }}>
                            <Box display="flex" gap={2}>
                                <IconMapPin />
                                <Box>
                                    <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Site</CustomFormLabel>
                                    <Typography>{data?.site_place_name || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </>
                )}

            </Grid>
        </Box>
    );
};

export default VisitorInformationTab;
