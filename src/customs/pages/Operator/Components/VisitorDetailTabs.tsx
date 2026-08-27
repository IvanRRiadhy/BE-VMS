import {
  Box,
  Tabs,
  Tab,
  Grid2 as Grid,
  Typography,
  Button,
  Divider,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  IconBrandGmail,
  IconPhone,
  IconHome,
  IconGenderMale,
  IconBuildingSkyscraper,
  IconCards,
  IconUsersGroup,
  IconUser,
  IconNumbers,
  IconTicket,
  IconCheckupList,
  IconCar,
  IconLicense,
  IconCalendarEvent,
  IconUserCheck,
  IconCalendarTime,
  IconMapPin,
  IconIdBadge2,
  IconBluetooth,
  IconBarcode,
  IconCheck,
  IconRefresh,
} from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import moment from 'moment-timezone';
interface Props {
  invitationCode: any[];
  handleChooseCard: () => void;
  activeVisitor: any;
  tabValue: number;
  onTabChange: (value: number) => void;
}

const VisitorDetailTabs: React.FC<Props> = ({
  invitationCode,
  handleChooseCard,
  activeVisitor,
  tabValue,
  onTabChange,
}) => {
  // const [tabValue, setTabValue] = useState(0);
  // const data = invitationCode?.[0];
  const data = activeVisitor;

  const formatDateTime = (dateStr?: string, extendMinutes?: number) => {
    if (!dateStr) return '-';

    const baseTime = moment.utc(dateStr);

    // Tambahkan menit hanya kalau ada extend
    if (extendMinutes && extendMinutes > 0) {
      baseTime.add(extendMinutes, 'minutes');
    }

    return baseTime.tz(moment.tz.guess()).format('DD MMMM YYYY, HH:mm');
  };

  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d',
    Checkout: '#F44336',
    Block: '#000000',
    Deny: '#8B0000',
    Approve: '#21c45d',
    Pracheckin: '#21c45d',
    Preregis: '#a5a5a5ff',
    Waiting: '#4abfd4',
    Available: 'gray',
  };

  const statusLabelMap: Record<string, string> = {
    Checkin: 'Check In',
    Checkout: 'Check Out',
    Block: 'Block',
    Deny: 'Deny',
    Approve: 'Approve',
    Pracheckin: 'Precheckin',
    Preregis: 'Preregis',
    Waiting: 'Waiting',
    Available: 'Available',
  };

  return (
    <>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => onTabChange(newValue)}
          variant="fullWidth"
          sx={{
            minHeight: 44,

            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',

              '&:last-of-type': {
                borderRight: 'none',
              },
            },

            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 700,
              backgroundColor: 'action.hover',
            },

            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          <Tab label="Visit Information" />
          <Tab label="Purpose Visit" />
          <Tab label="Card Information" />
          <Tab label="Visitor Tracker" />
        </Tabs>
      </Box>

      {/* TAB 1 — VISIT INFORMATION */}
      {tabValue === 0 && (
        <Box
          sx={{
            position: 'relative',
            mt: 2,
            minHeight: '280px',
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
              '& > :nth-of-type(odd)': {
                pr: 4,
              },
              '& > :nth-of-type(even)': {
                pl: 4,
              },
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
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Invited By</CustomFormLabel>
                  <Typography>{data?.invited_by_name || '-'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconUser />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Name</CustomFormLabel>
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
              </>
            )}
          </Grid>
        </Box>
      )}

      {/* TAB 3 — PURPOSE VISIT */}
      {tabValue === 1 && (
        <Box
          sx={{
            position: 'relative',
            mt: 2,
            minHeight: '280px',
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
            rowSpacing={3}
            columnSpacing={2}
            sx={{
              '& > :nth-of-type(odd)': {
                pr: 4,
              },
              '& > :nth-of-type(even)': {
                pl: 4,
              },
            }}
          >
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
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visit Period Start</CustomFormLabel>
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
          </Grid>
        </Box>
      )}

      {/* Card */}
      {tabValue === 2 && (
        <Box
          sx={{
            position: 'relative',
            mt: 2,
            minHeight: '280px',
          }}
        >
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: 2,
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              pb: 1,
            }}
          >
            {invitationCode?.[0]?.card?.map((card: any) => (
              <Paper
                key={card.id}
                elevation={0}
                sx={{
                  flex: {
                    xs: '0 0 100%',
                    md: '0 0 calc(50% - 8px)',
                  },

                  width: 0,
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box',

                  scrollSnapAlign: 'start',

                  p: 1.5,
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: card.current_used ? 'primary.main' : 'divider',
                }}
              >
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="">
                    {/* <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.card_type?.toLowerCase() === 'ble' ? (
                        <IconBluetooth size={30} color="#1976d2" />
                      ) : (
                        <IconBarcode size={30} color="#1976d2" />
                      )}
                    </Box> */}

                    <Box>
                      <Box>
                        <Typography>Card Number</Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          lineHeight={1.1}
                          sx={{
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                          }}
                        >
                          {card.card_number}
                        </Typography>
                      </Box>

                      <Box mt={0.5}>
                        <Typography>BLE Number</Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          lineHeight={1.1}
                          sx={{
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                          }}
                        >
                          {card.mac ?? '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {card.current_used && (
                    <Chip
                      icon={<IconCheck size={16} />}
                      label="Current Card"
                      // color="success"
                      color="primary"
                      sx={{
                        fontWeight: 700,
                        borderRadius: 999,
                      }}
                    />
                  )}
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Status</Typography>

                  <Chip
                    label={card.card_status === 'Revoked' ? 'Revoked Access' : card.card_status}
                    color={
                      card.card_status === 'Issued'
                        ? 'success'
                        : card.card_status === 'Returned'
                          ? 'default'
                          : card.card_status === 'Revoked'
                            ? 'error'
                            : 'secondary'
                    }
                    size="small"
                  />
                </Stack>

                {card.issued_at && (
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconCalendarEvent size={22} color="#1976d2" />
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Issued
                      </Typography>

                      <Typography fontWeight={600}>{formatDateTime(card.issued_at)}</Typography>
                    </Box>
                  </Stack>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}
      {tabValue === 3 && (
        <Box
          sx={{
            position: 'relative',
            mt: 2,
            minHeight: '280px',
          }}
        ></Box>
      )}
    </>
  );
};

export default VisitorDetailTabs;
