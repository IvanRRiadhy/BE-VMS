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
  Tooltip,
  IconButton,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  IconEye,
  IconKey,
  IconKeyOff,
} from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import moment from 'moment-timezone';
import VisitorTracker from './DetailTabs/VisitorTracker';
import VisitorInformationTab from './DetailTabs/VisitorInformationTab';
interface Props {
  invitationCode: any[];
  handleChooseCard: () => void;
  activeVisitor: any;
  tabValue: number;
  onTabChange: (value: number) => void;
  onOpenRelatedVisitors?: any;
  onExtendAccess?: (card: any, visitor: any) => void;
  onRevokeAccess?: (card: any, visitor: any) => void;
  onDetailAccess?: (card: any, visitor: any) => void;
  visitorTrackerData?: any;
}

const VisitorDetailTabs: React.FC<Props> = ({
  invitationCode,
  handleChooseCard,
  activeVisitor,
  tabValue,
  onTabChange,
  onOpenRelatedVisitors,
  onExtendAccess,
  onRevokeAccess,
  onDetailAccess,
  visitorTrackerData
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
    Canceled: 'gray',
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
    Canceled: 'Canceled',
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
          {/* <Tab label="Purpose Visit" /> */}
          <Tab label="Card Information" />
          <Tab label="Visitor Tracker" />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateAreas: '"content"',
          mt: 2,
        }}
      >
        {/* TAB 1 — VISIT INFORMATION */}
        {tabValue === 0 && (
          <VisitorInformationTab
            data={data}
            onOpenRelatedVisitors={onOpenRelatedVisitors}
            statusBgMap={statusBgMap}
            statusLabelMap={statusLabelMap}
            formatDateTime={formatDateTime}
          />

        )}

        {/* TAB 3 — PURPOSE VISIT */}
        {/* {tabValue === 1 && (
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
      )} */}

        {tabValue === 1 && (
          <Box
            sx={{
              gridArea: 'content',
              position: 'relative',
              mt: 2,
            }}
          >
            <Grid container spacing={2}>
              {/* {invitationCode?.[0]?.card?.map((card: any) => ( */}
              {/* {invitationCode?.[0]?.card
                ?.filter((card: any) => card.current_used)
                .map((card: any) => ( */}
              {invitationCode?.[0]?.card?.map((card: any) => (
                <Grid
                  key={card.id}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%',
                      p: 1.5,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: card.current_used ? 'primary.main' : 'divider',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                            {card.card_mac || '-'}
                          </Typography>
                        </Box>
                      </Box>

                      {card.current_used && (
                        <Chip
                          icon={<IconCheck size={16} />}
                          label="Current Card"
                          color="primary"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 999,
                          }}
                        />
                      )}
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography color="text.secondary">Status</Typography>

                      <Chip
                        label={
                          card.card_status === 'Revoked' ? 'Revoked Access' : card.card_status
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            card.card_status === 'Issued'
                              ? '#21c45d'
                              : card.card_status === 'Returned'
                                ? '#e0e0e0'
                                : card.card_status === 'Revoked'
                                  ? 'red'
                                  : 'gray',
                          color: card.card_status === 'Returned' ? '#333333' : '#ffffff',
                        }}
                      />
                    </Stack>

                    {/* Issued */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        mt: 2,
                        justifyContent: 'space-between',
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                      }}
                    >
                      {card.issued_at && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconCalendarEvent size={22} color="#1976d2" />
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Issued
                            </Typography>

                            <Typography fontWeight={600} variant="body2">
                              {formatDateTime(card.issued_at)}
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                      {/* {card.current_used && (
                        <Button
                          variant="contained"
                          startIcon={<IconKey size={18} />}
                          size='small'
                          color="primary"
                          onClick={() => onDetailAccess?.(card, activeVisitor)}
                        >
                          Detail Access
                        </Button>
                        )} */}
                    </Box>

                    {/* {card.current_used && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<IconKey size={18} />}
                            onClick={() => onExtendAccess?.(card, activeVisitor)}
                          >
                            Extend Access
                          </Button>
                     
                          <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<IconKeyOff size={18} />}
                            onClick={() => onRevokeAccess?.(card, activeVisitor)}
                          >
                            Revoke Access
                          </Button>
                        </Box>
                      )} */}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {tabValue === 2 && (
          <Box
            sx={{
              gridArea: 'content',
              position: 'relative',
              minHeight: 0,
            }}
          >
            <VisitorTracker
              visitor={visitorTrackerData}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default VisitorDetailTabs;
