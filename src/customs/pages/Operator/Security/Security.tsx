import {
  Avatar,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import {
  IconCamera,
  IconCar,
  IconChevronRight,
  IconCreditCard,
  IconId,
  IconSettings,
  IconUser,
  IconWifi,
} from '@tabler/icons-react';

import { useState } from 'react';

import Container from 'src/components/container/PageContainer';

type AccessCard = {
  id: string;
  cardNumber: string;
  cardBarcode: string;
  cardType: string;
  site: string;
  cardStatus: string;
  issuedBy: string;
  issuedAt: string;
  currentUsed: boolean;
  isBle: boolean;
};

type AnalyticsSettings = {
  log: boolean;
  deviceId: boolean;
  cctv: boolean;
};

const cards: AccessCard[] = [
  {
    id: 'f7fbff62-8d8c-4ce2-824f-5a2ae9547f0c',
    cardNumber: '1769937040',
    cardBarcode: '1769937040',
    cardType: 'Barcode',
    cardStatus: 'Available',
    site: 'Main Building',
    issuedBy: 'Admins',
    issuedAt: '06:36:15',
    currentUsed: true,
    isBle: false,
  },
  {
    id: '2',
    cardNumber: '1769937041',
    cardBarcode: '1769937041',
    cardType: 'Barcode',
    cardStatus: 'Available',
    site: 'Main Building',
    issuedBy: 'Admins',
    issuedAt: '06:38:21',
    currentUsed: false,
    isBle: false,
  },
  {
    id: '3',
    cardNumber: '1769937042',
    cardBarcode: '1769937042',
    cardType: 'BLE',
    cardStatus: 'Available',
    site: 'Main Building',
    issuedBy: 'Security',
    issuedAt: '06:40:12',
    currentUsed: true,
    isBle: true,
  },
  {
    id: '4',
    cardNumber: '1769937043',
    cardBarcode: '1769937043',
    cardType: 'Barcode',
    cardStatus: 'Available',
    site: 'Main Building',
    issuedBy: 'Admins',
    issuedAt: '06:42:10',
    currentUsed: false,
    isBle: false,
  },
  {
    id: '5',
    cardNumber: '1769937044',
    cardBarcode: '1769937044',
    cardType: 'Barcode',
    cardStatus: 'Available',
    site: 'Main Building',
    issuedBy: 'Admins',
    issuedAt: '06:43:31',
    currentUsed: false,
    isBle: false,
  },
  {
    id: '6',
    cardNumber: '1769937045',
    cardBarcode: '1769937045',
    cardType: 'BLE',
    cardStatus: 'Available',
    site: 'Main Building',
    issuedBy: 'Security',
    issuedAt: '06:45:02',
    currentUsed: true,
    isBle: true,
  },
  //   {
  //     id: '7',
  //     cardNumber: '1769937046',
  //     cardBarcode: '1769937046',
  //     cardType: 'Barcode',
  //     cardStatus: 'Available',
  //     issuedBy: 'Admins',
  //     issuedAt: '06:46:17',
  //     currentUsed: false,
  //     isBle: false,
  //   },
  //   {
  //     id: '8',
  //     cardNumber: '1769937047',
  //     cardBarcode: '1769937047',
  //     cardType: 'Barcode',
  //     cardStatus: 'Available',
  //     issuedBy: 'Security',
  //     issuedAt: '06:48:03',
  //     currentUsed: false,
  //     isBle: false,
  //   },
  //   {
  //     id: '9',
  //     cardNumber: '1769937048',
  //     cardBarcode: '1769937048',
  //     cardType: 'BLE',
  //     cardStatus: 'Available',
  //     issuedBy: 'Admins',
  //     issuedAt: '06:49:22',
  //     currentUsed: true,
  //     isBle: true,
  //   },
];

const detections = [
  {
    id: 1,
    type: 'face' as const,
    time: '14:42:21',
    location: 'Main Entrance',
    image: '',
  },
  {
    id: 2,
    type: 'face' as const,
    time: '14:42:18',
    location: 'Main Entrance',
    image: '',
  },
  {
    id: 3,
    type: 'face' as const,
    time: '14:42:15',
    location: 'Lobby',
    image: '',
  },
  {
    id: 4,
    type: 'face' as const,
    time: '14:42:10',
    location: 'Parking Area',
    image: '',
  },

  // PLATE
  {
    id: 5,
    type: 'plate' as const,
    time: '14:42:08',
    location: 'Parking Area',
    image: '',
  },
  {
    id: 6,
    type: 'plate' as const,
    time: '14:42:05',
    location: 'Main Entrance',
    image: '',
  },
  {
    id: 7,
    type: 'plate' as const,
    time: '14:42:01',
    location: 'Parking Area',
    image: '',
  },
  {
    id: 8,
    type: 'plate' as const,
    time: '14:41:58',
    location: 'Lobby',
    image: '',
  },
];

const Security = () => {
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLButtonElement | null>(null);

  const [settings, setSettings] = useState<AnalyticsSettings>({
    log: false,
    deviceId: false,
    cctv: false,
  });

  const handleOpenSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsAnchor(null);
  };

  const handleSettingChange = (key: keyof AnalyticsSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isSettingsOpen = Boolean(settingsAnchor);

  // const [settings, setSettings] = useState({
  //   log: false,
  //   cctv: false,
  // });

  const [logDevice, setLogDevice] = useState('');
  const [cctvDevice, setCctvDevice] = useState('');

  const logDevices = [
    { value: 'device-01', label: 'Device 01' },
    { value: 'device-02', label: 'Device 02' },
    { value: 'device-03', label: 'Device 03' },
  ];

  const cctvDevices = [
    { value: 'cctv-01', label: 'CCTV Main Entrance' },
    { value: 'cctv-02', label: 'CCTV Lobby' },
    { value: 'cctv-03', label: 'CCTV Parking Area' },
  ];

  return (
    <Container title="Security">
      <Box
        sx={{
          minHeight: 'calc(100vh - 90px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pb: 2,
        }}
      >
        {/* ===================================================
         * PAGE HEADER
         * =================================================== */}
        {/* 
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h4" fontWeight={700}>
              Security
            </Typography>

            <Chip
              label="Live Monitoring"
              size="small"
              color="success"
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                fontWeight: 600,
              }}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor access cards and security analytics in real time.
          </Typography>
        </Box> */}

        {/* ===================================================
         * MAIN CONTENT
         * =================================================== */}

        <Grid
          container
          spacing={2}
          sx={{
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* =================================================
           * LEFT SIDE - ACCESS
           * ================================================= */}

          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <AccessPanel cards={cards} />
          </Grid>

          {/* =================================================
           * RIGHT SIDE - ANALYTICS
           * ================================================= */}

          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <AnalyticsPanel settings={settings} />
          </Grid>
        </Grid>

        {/* ===================================================
         * FLOATING SETTINGS BUTTON
         * =================================================== */}

        <IconButton
          onClick={handleOpenSettings}
          aria-label="Security settings"
          sx={{
            position: 'fixed',

            right: 24,
            bottom: 24,

            width: 54,
            height: 54,

            borderRadius: '50%',

            bgcolor: 'primary.main',
            color: '#fff',

            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.18)',

            zIndex: 1300,

            transition: 'transform .2s ease, box-shadow .2s ease',

            '&:hover': {
              bgcolor: 'primary.dark',

              transform: 'translateY(-2px)',

              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
            },

            ...(isSettingsOpen && {
              transform: 'rotate(45deg)',

              '&:hover': {
                transform: 'rotate(45deg)',
                bgcolor: 'primary.dark',
              },
            }),
          }}
        >
          <IconSettings size={23} />
        </IconButton>

        {/* ===================================================
         * SETTINGS POPOVER
         * =================================================== */}

        <Popover
          open={isSettingsOpen}
          anchorEl={settingsAnchor}
          onClose={handleCloseSettings}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                mb: 1.5,

                width: 245,

                borderRadius: 2.5,

                border: '1px solid',
                borderColor: 'divider',

                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',

                overflow: 'hidden',
              },
            },
          }}
        >
          {/* Popover Header */}

          <Box
            sx={{
              px: 2,
              pt: 1.75,
              pb: 1.25,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Display Settings
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Select information to display
            </Typography>
          </Box>

          <Divider />

          {/* Options */}

          <Stack sx={{ py: 0.75 }}>
            {/* LOG DEV */}

            <Box>
              <FormControlLabel
                sx={{
                  mx: 0,
                  px: 1.5,
                  py: 0.5,

                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={settings.log}
                    onChange={() => handleSettingChange('log')}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconId size={17} />

                    <Typography variant="body2">Log Dev</Typography>
                  </Stack>
                }
              />

              {/* LOG DROPDOWN */}

              {settings.log && (
                <Box
                  sx={{
                    px: 5,
                    pb: 1,
                  }}
                >
                  <Select
                    fullWidth
                    size="small"
                    value={logDevice}
                    onChange={(event) => setLogDevice(event.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 1.5,
                      fontSize: 13,
                    }}
                  >
                    <MenuItem value="">Select Log Dev</MenuItem>

                    {logDevices.map((device) => (
                      <MenuItem key={device.value} value={device.value}>
                        {device.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </Box>

            {/* CCTV */}

            <Box>
              <FormControlLabel
                sx={{
                  mx: 0,
                  px: 1.5,
                  py: 0.5,

                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={settings.cctv}
                    onChange={() => handleSettingChange('cctv')}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconCamera size={17} />

                    <Typography variant="body2">CCTV</Typography>
                  </Stack>
                }
              />

              {/* CCTV DROPDOWN */}

              {settings.cctv && (
                <Box
                  sx={{
                    px: 5,
                    pb: 1,
                  }}
                >
                  <Select
                    fullWidth
                    size="small"
                    value={cctvDevice}
                    onChange={(event) => setCctvDevice(event.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 1.5,
                      fontSize: 13,
                    }}
                  >
                    <MenuItem value="">Select CCTV</MenuItem>

                    {cctvDevices.map((device) => (
                      <MenuItem key={device.value} value={device.value}>
                        {device.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </Box>
          </Stack>
        </Popover>
      </Box>
    </Container>
  );
};

type AccessPanelProps = {
  cards: AccessCard[];
};

const AccessPanel = ({ cards }: AccessPanelProps) => {
  return (
    <Card
      sx={{
        height: '100%',

        borderRadius: 2.5,

        border: '1px solid',
        borderColor: 'divider',

        boxShadow: 'none',

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',
      }}
    >
      {/* Header */}

      <CardContent
        sx={{
          pb: 1.5,

          '&:last-child': {
            pb: 1.5,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar
              sx={{
                width: 38,
                height: 38,

                bgcolor: 'primary.light',
                color: 'primary.main',
              }}
            >
              <IconCreditCard size={20} />
            </Avatar>

            <Box>
              <Typography fontWeight={700}>Access</Typography>

              <Typography variant="caption" color="text.secondary">
                Access cards
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${cards.length} Cards`}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 1.5,
            }}
          />
        </Stack>
      </CardContent>

      <Divider />

      {/* Cards */}

      <Box
        sx={{
          p: 1.5,

          flex: 1,

          overflowY: 'auto',

          minHeight: 0,

          '&::-webkit-scrollbar': {
            width: 5,
          },

          '&::-webkit-scrollbar-thumb': {
            borderRadius: 5,
            bgcolor: 'divider',
          },
        }}
      >
        <Grid container spacing={1}>
          {cards.map((card) => (
            <Grid
              key={card.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <AccessCardItem card={card} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
};

/* =========================================================
 * ACCESS CARD ITEM
 * ========================================================= */

type AccessCardItemProps = {
  card: AccessCard;
};

const AccessCardItem = ({ card }: AccessCardItemProps) => {
  return (
    <Card
      sx={{
        height: '100%',

        borderRadius: 2,

        border: '1px solid',

        borderColor: card.currentUsed ? 'primary.main' : 'divider',

        bgcolor: card.currentUsed ? 'primary.50' : 'background.paper',

        boxShadow: 'none',

        cursor: 'pointer',

        transition: 'all .2s ease',

        '&:hover': {
          borderColor: 'primary.main',

          transform: 'translateY(-2px)',

          boxShadow: '0 5px 15px rgba(0,0,0,.08)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 1.5,

          '&:last-child': {
            pb: 1.5,
          },
        }}
      >
        <Stack spacing={1.25}>
          {/* Top */}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,

                bgcolor: card.isBle ? 'secondary.light' : 'grey.100',

                color: card.isBle ? 'secondary.main' : 'text.secondary',
              }}
            >
              {card.isBle ? <IconWifi size={17} /> : <IconCreditCard size={17} />}
            </Avatar>

            {card.currentUsed && (
              <Chip
                label="Active"
                size="small"
                color="success"
                sx={{
                  height: 20,

                  fontSize: 10,

                  fontWeight: 700,
                }}
              />
            )}
          </Stack>

          {/* Card Number */}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Card Number
            </Typography>

            <Typography variant="body2" fontWeight={700} noWrap>
              {card.cardNumber}
            </Typography>
          </Box>

          {/* Type */}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>

            <Typography variant="caption" fontWeight={600}>
              {card.cardType}
            </Typography>
          </Stack>

          {/* Site */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Site
            </Typography>

            <Typography variant="caption" fontWeight={600}>
              {card.site}
            </Typography>
          </Stack>

          {/* Status */}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>

            <Typography variant="caption" fontWeight={600} color="success.main">
              {card.cardStatus}
            </Typography>
          </Stack>

          <Divider />

          {/* Footer */}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Issued by
              </Typography>

              <Typography variant="caption" fontWeight={600} display="block">
                {card.issuedBy}
              </Typography>
            </Box>

            <IconChevronRight size={16} color="#9ca3af" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

/* =========================================================
 * ANALYTICS PANEL
 * ========================================================= */

type AnalyticsPanelProps = {
  settings: AnalyticsSettings;
};

const AnalyticsPanel = ({ settings }: AnalyticsPanelProps) => {
  const [analyticsType, setAnalyticsType] = useState<'face' | 'plate'>('face');
  return (
    <Card
      sx={{
        height: '100%',

        borderRadius: 2.5,

        border: '1px solid',
        borderColor: 'divider',

        boxShadow: 'none',

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <CardContent
        sx={{
          pb: 1.5,

          '&:last-child': {
            pb: 1.5,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          {/* LEFT */}

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: 'secondary.light',
                color: 'secondary.main',
              }}
            >
              <IconCamera size={20} />
            </Avatar>

            <Box>
              <Typography fontWeight={700}>Security Analytics</Typography>

              <Typography variant="caption" color="text.secondary">
                Real-time security detection
              </Typography>
            </Box>
          </Stack>

          {/* RIGHT */}

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Type
            </Typography>

            <Select
              size="small"
              value={analyticsType}
              onChange={(event) => setAnalyticsType(event.target.value)}
              sx={{
                minWidth: 145,
                borderRadius: 1.5,

                '& .MuiSelect-select': {
                  py: 0.75,
                  fontSize: 13,
                  fontWeight: 600,
                },
              }}
            >
              <MenuItem value="face">Face</MenuItem>

              <MenuItem value="plate">Plate Number</MenuItem>
            </Select>
            {/* 
            <Chip
              label="LIVE"
              color="success"
              size="small"
              sx={{
                fontWeight: 700,
              }}
            /> */}
          </Stack>
        </Stack>
      </CardContent>

      <Divider />

      {/* Analytics Content */}

      <Box
        sx={{
          p: 0,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Grid
          container
          spacing={1.5}
          sx={{
            height: '100%',
          }}
        >
          {/* ANALYTICS TYPE */}

          {analyticsType === 'face' && (
            // <Grid
            //   size={12}
            //   sx={{
            //     minHeight: 280,
            //   }}
            // >
            //   <AnalyticsImageCard
            //     title="Face Recognition"
            //     subtitle="Detected Face"
            //     type="face"
            //     icon={<IconUser size={18} />}
            //     large
            //   />
            // </Grid>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                p: 1.5,
              }}
            >
              <Grid container spacing={1.5}>
                {detections
                  .filter((item) => item.type === analyticsType)
                  .map((item) => (
                    <Grid
                      key={item.id}
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <DetectionCard item={item} />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

          {analyticsType === 'plate' && (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                p: 1.5,
              }}
            >
              <Grid container spacing={1.5}>
                {detections
                  .filter((item) => item.type === analyticsType)
                  .map((item) => (
                    <Grid
                      key={item.id}
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <DetectionCard item={item} />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

          {/* CCTV */}

          {settings.cctv && (
            <Grid
              size={12}
              sx={{
                minHeight: 280,
              }}
            >
              <AnalyticsImageCard
                title="CCTV Camera"
                subtitle="Live Camera Feed"
                type="cctv"
                icon={<IconCamera size={18} />}
                large
              />
            </Grid>
          )}

          {/* LOG */}

          {/* {settings.log && (
            <Grid size={12}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={700}>
                    Latest Activity
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    14:42:21 WIB
                  </Typography>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  {analyticsType === 'face'
                    ? 'Face detected at Main Entrance'
                    : 'License plate detected at Main Entrance'}
                </Typography>
              </Box>
            </Grid>
          )} */}
        </Grid>
      </Box>
    </Card>
  );
};

/* =========================================================
 * ANALYTICS IMAGE CARD
 * ========================================================= */

type AnalyticsImageCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  type: 'face' | 'plate' | 'cctv';
  large?: boolean;
};

const AnalyticsImageCard = ({
  title,
  subtitle,
  icon,
  type,
  large = false,
}: AnalyticsImageCardProps) => {
  return (
    <Card
      sx={{
        position: 'relative',

        height: '100%',

        minHeight: large ? 280 : 220,

        borderRadius: 2,

        overflow: 'hidden',

        bgcolor: '#111827',

        boxShadow: 'none',
      }}
    >
      {/* =================================================
       * IMAGE AREA
       * ================================================= */}

      <Box
        sx={{
          position: 'absolute',

          inset: 0,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          background:
            type === 'cctv'
              ? 'linear-gradient(135deg, #111827 0%, #374151 100%)'
              : 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
        }}
      >
        {/* FACE PLACEHOLDER */}

        {type === 'face' && (
          <Box
            sx={{
              width: 100,

              height: 120,

              borderRadius: '50% 50% 45% 45%',

              border: '2px solid rgba(255,255,255,.3)',

              position: 'relative',

              '&::before': {
                content: '""',

                position: 'absolute',

                left: '50%',

                top: '40%',

                transform: 'translate(-50%, -50%)',

                width: 70,

                height: 80,

                borderRadius: '50%',

                border: '1px dashed rgba(255,255,255,.25)',
              },
            }}
          />
        )}

        {/* PLATE PLACEHOLDER */}

        {type === 'plate' && (
          <Box
            sx={{
              width: 190,

              height: 58,

              borderRadius: 1,

              border: '2px solid rgba(255,255,255,.3)',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              color: 'rgba(255,255,255,.7)',

              fontSize: 19,

              fontWeight: 700,

              letterSpacing: 3,
            }}
          >
            B 1234 XYZ
          </Box>
        )}

        {/* CCTV PLACEHOLDER */}

        {type === 'cctv' && (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              color: 'rgba(255,255,255,.55)',
            }}
          >
            <IconCamera size={52} stroke={1.2} />

            <Typography variant="caption" color="inherit">
              CCTV Live Feed
            </Typography>
          </Stack>
        )}
      </Box>

      {/* =================================================
       * TOP OVERLAY
       * ================================================= */}

      <Box
        sx={{
          position: 'absolute',

          top: 0,
          left: 0,
          right: 0,

          p: 1.5,

          background: 'linear-gradient(to bottom, rgba(0,0,0,.75), transparent)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 30,
                height: 30,

                bgcolor: 'rgba(255,255,255,.15)',

                color: '#fff',
              }}
            >
              {icon}
            </Avatar>

            <Box>
              <Typography variant="body2" fontWeight={700} color="#fff">
                {title}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,.65)',
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label="LIVE"
            size="small"
            sx={{
              height: 22,

              bgcolor: 'rgba(255,255,255,.12)',

              color: '#fff',

              fontSize: 10,

              fontWeight: 700,
            }}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          position: 'absolute',

          bottom: 0,
          left: 0,
          right: 0,

          p: 1.5,

          background: 'linear-gradient(to top, rgba(0,0,0,.8), transparent)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,.55)',
              }}
            >
              Detected at
            </Typography>

            <Typography variant="body2" fontWeight={600} color="#fff">
              14:42:21 WIB
            </Typography>
          </Box>

          <Chip
            label="Detected"
            size="small"
            color="success"
            sx={{
              height: 22,

              fontSize: 10,

              fontWeight: 700,
            }}
          />
        </Stack>
      </Box>
    </Card>
  );
};

type DetectionItem = {
  id: number;
  type: 'face' | 'plate';
  time: string;
  location: string;
  image?: string;
};

type DetectionCardProps = {
  item: DetectionItem;
};

const DetectionCard = ({ item }: DetectionCardProps) => {
  const isFace = item.type === 'face';

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 250,
          bgcolor: '#111827',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item.image ? (
          <Box
            component="img"
            src={item.image}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : isFace ? (
          <IconUser size={64} color="rgba(255,255,255,.5)" />
        ) : (
          <Typography fontWeight={700} fontSize={22} letterSpacing={2} color="rgba(255,255,255,.6)">
            B 1234 XYZ
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={700}>
            {isFace ? 'Face Detected' : 'Plate Detected'}
          </Typography>

          <Chip
            label="Detected"
            size="small"
            color="success"
            sx={{
              height: 22,
              fontSize: 10,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
          {item.location}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          {item.time}
        </Typography>
      </Box>
    </Card>
  );
};

export default Security;
