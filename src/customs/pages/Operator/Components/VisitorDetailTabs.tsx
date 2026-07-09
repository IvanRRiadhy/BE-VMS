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

    return baseTime.tz(moment.tz.guess()).format('DD MMM YYYY, HH:mm');
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

  return (
    <>
      <Tabs value={tabValue} onChange={(_, newValue) => onTabChange(newValue)} variant="fullWidth">
        {/* <Tab label="Info" /> */}
        <Tab label="Visit Information" />
        <Tab label="Purpose Visit" />
        <Tab label="Card" />
        {/* <Tab label="Parking" /> */}
        <Tab label="History" />
        {/* <Tab label="Barcode" /> */}
      </Tabs>

      {/* TAB 1 — INFO */}
      {/* {tabValue === 0 && (
        <Box sx={{ mt: 2 }}>
          <Grid container rowSpacing={4} columnSpacing={2} mt={1}>
  
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconBrandGmail />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Email</CustomFormLabel>
                  <Typography
                    sx={{
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'normal',
                    }}
                  >
                    {data?.email || '-'}
                  </Typography>
                </Box>
              </Box>
            </Grid>


            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconPhone />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Phone</CustomFormLabel>
                  <Typography>{data?.phone || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconGenderMale />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Gender</CustomFormLabel>
                  <Typography>{data?.gender || '-'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconTicket />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Invitation Code</CustomFormLabel>
                  <Typography>{data?.invitation_code || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconBuildingSkyscraper />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Organization</CustomFormLabel>
                  <Typography>{data?.organization || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

  
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" gap={2} alignItems={'center'}>
                  <IconCards />
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>
                </Box>

                <Box>
                  {currentCard?.card_number?.trim() && (
                    <Typography fontWeight={600}>{currentCard.card_number}</Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )} */}

      {/* TAB 2 — VISIT INFORMATION */}
      {tabValue === 0 && (
        <Box sx={{ position: 'relative', mt: 2 }}>
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
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Identity ID</CustomFormLabel>
                  <Typography>{data?.visitor_identity_id || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconUser />
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
                    <Typography>{data?.visitor_status || '-'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

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
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Vehicle Plate No.</CustomFormLabel>
                  <Typography>{data?.vehicle_plate_number || '-'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 3 — PURPOSE VISIT */}
      {tabValue === 1 && (
        <Box sx={{ position: 'relative', mt: 2, height: '230px', display: 'flex' }}>
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

      {tabValue === 2 && (
        <Box sx={{ mt: 2, height: '230px' }}>
          <Grid container spacing={2}>
            {invitationCode?.[0]?.card?.map((card: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={card.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: card.current_used ? 'primary.main' : 'divider',
                    transition: 'all .25s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
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
                      </Box>

                      <Box>
                        <Typography variant="h5" fontWeight={700} lineHeight={1.1}>
                          {card.card_number}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {card.card_type}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1} alignItems="flex-end">
                      {card.current_used && (
                        <Chip
                          icon={<IconCheck size={16} />}
                          label="Current Card"
                          color="success"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 999,
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Status */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">Status</Typography>

                    <Chip
                      label={card.card_status}
                      color={
                        card.card_status === 'Issued'
                          ? 'success'
                          : card.card_status === 'Returned'
                            ? 'default'
                            : 'warning'
                      }
                      size="small"
                      variant="filled"
                    />
                  </Stack>

                  {/* Issued */}
                  {card.issued_at && (
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
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
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {tabValue === 3 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', height: '230px' }}></Box>
      )}
    </>
  );
};

export default VisitorDetailTabs;
