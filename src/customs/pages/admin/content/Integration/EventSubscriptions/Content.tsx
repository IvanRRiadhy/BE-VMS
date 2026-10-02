import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import LocalParkingOutlinedIcon from '@mui/icons-material/LocalParkingOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  getIntegrationEventInstance,
  getIntegrationEventInstanceTab,
  getIntegrationInstanceByIntegrationId,
} from 'src/customs/api/Admin/Integration';
import {
  IconCamera,
  IconParking,
  IconPlug,
  IconShield,
  IconShieldFilled,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

/* =========================================================
 * Types
 * ======================================================= */

type IntegrationType = 'honeywell' | 'ipsotek' | 'parking' | 'ble';

interface Integration {
  integration_list_id: string;
  name: string;
  event_type: string[];
  sourceType: string[];
}

interface Server {
  id: string;
  name: string;
  address: string;
  online: boolean;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline';
}

interface EventType {
  code: string;
  name: string;
  category: string;
  estimate: string;
}

/* =========================================================
 * Data
 * ======================================================= */

// const integrations: Integration[] = [
//   {
//     id: 'honeywell',
//     name: 'Honeywell',
//     description: 'Access Control',
//     icon: <StorageOutlinedIcon />,
//     color: '#e53935',
//   },
//   {
//     id: 'ipsotek',
//     name: 'Ipsotek',
//     description: 'Video Analytics',
//     icon: <VideocamOutlinedIcon />,
//     color: '#1976d2',
//   },
//   {
//     id: 'parking',
//     name: 'Parking',
//     description: 'Parking System',
//     icon: <LocalParkingOutlinedIcon />,
//     color: '#f2b300',
//   },
//   {
//     id: 'ble',
//     name: 'BLE Alarm',
//     description: 'BLE Tracking',
//     icon: <SensorsOutlinedIcon />,
//     color: '#19a974',
//   },
// ];

const servers: Server[] = [
  {
    id: 'server-1',
    name: 'Ipsotek - Jakarta',
    address: '192.168.1.100:8080',
    online: true,
  },
  {
    id: 'server-2',
    name: 'Ipsotek - Bandung',
    address: '192.168.2.100:8080',
    online: true,
  },
  {
    id: 'server-3',
    name: 'Ipsotek - Surabaya',
    address: '192.168.3.100:8080',
    online: false,
  },
];

const cameras: Camera[] = [
  {
    id: 'CAM-001',
    name: 'Lobby Entrance',
    location: 'Ground Floor',
    status: 'Online',
  },
  {
    id: 'CAM-002',
    name: 'Main Gate',
    location: 'Outdoor',
    status: 'Online',
  },
  {
    id: 'CAM-003',
    name: 'Parking Area',
    location: 'Parking',
    status: 'Online',
  },
  {
    id: 'CAM-004',
    name: 'Elevator Lobby',
    location: 'Ground Floor',
    status: 'Online',
  },
  {
    id: 'CAM-005',
    name: 'Meeting Room 1',
    location: '5th Floor',
    status: 'Online',
  },
  {
    id: 'CAM-006',
    name: 'Meeting Room 2',
    location: '5th Floor',
    status: 'Offline',
  },
  {
    id: 'CAM-007',
    name: 'Warehouse',
    location: 'B1',
    status: 'Online',
  },
  {
    id: 'CAM-008',
    name: 'Loading Dock',
    location: 'Outdoor',
    status: 'Offline',
  },
];

const eventTypes: EventType[] = [
  {
    code: 'PERSON_DETECTED',
    name: 'Person Detected',
    category: 'Detection',
    estimate: '~ 12,000',
  },
  {
    code: 'FACE_MATCHED',
    name: 'Face Matched',
    category: 'Recognition',
    estimate: '~ 1,200',
  },
  {
    code: 'FACE_UNKNOWN',
    name: 'Face Unknown',
    category: 'Recognition',
    estimate: '~ 3,500',
  },
  {
    code: 'ZONE_ENTER',
    name: 'Zone Entered',
    category: 'Zone',
    estimate: '~ 800',
  },
  {
    code: 'ZONE_EXIT',
    name: 'Zone Exited',
    category: 'Zone',
    estimate: '~ 800',
  },
  {
    code: 'LOITERING',
    name: 'Loitering',
    category: 'Behavior',
    estimate: '~ 300',
  },
  {
    code: 'CROWD',
    name: 'Crowd Detected',
    category: 'Behavior',
    estimate: '~ 200',
  },
  {
    code: 'LINE_CROSSING',
    name: 'Line Crossing',
    category: 'Behavior',
    estimate: '~ 400',
  },
  {
    code: 'OBJECT_DETECTED',
    name: 'Object Detected',
    category: 'Detection',
    estimate: '~ 2,000',
  },
  {
    code: 'TAMPER',
    name: 'Camera Tamper',
    category: 'System',
    estimate: '~ 50',
  },
];

const steps = ['Select Server', 'Select Source', 'Select Event Type', 'Review & Save'];

/* =========================================================
 * Small Components
 * ======================================================= */

const StatusDot = ({ online }: { online: boolean }) => (
  <Stack direction="row" spacing={0.6} alignItems="center">
    <Box
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: online ? '#16a36a' : '#8b95a7',
      }}
    />

    <Typography
      sx={{
        fontSize: 12,
        color: online ? '#159a64' : '#7c8492',
      }}
    >
      {online ? 'Online' : 'Offline'}
    </Typography>
  </Stack>
);

const SectionTitle = ({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle: string;
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 700,
        color: '#1c2733',
      }}
    >
      {number}. {title}
    </Typography>

    <Typography
      sx={{
        fontSize: 12,
        color: '#7c8795',
        mt: 0.25,
      }}
    >
      {subtitle}
    </Typography>
  </Box>
);

const SearchField = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <TextField
    size="small"
    fullWidth
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon
            sx={{
              fontSize: 16,
              color: '#9aa3af',
            }}
          />
        </InputAdornment>
      ),
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        height: 34,
        fontSize: 11,
        borderRadius: 1,
        backgroundColor: '#fff',
      },
    }}
  />
);

const CategoryChip = ({ category }: { category: string }) => {
  const colors: Record<string, any> = {
    Detection: {
      background: '#f0e7ff',
      color: '#7747b7',
    },
    Recognition: {
      background: '#e8e5ff',
      color: '#6252b5',
    },
    Zone: {
      background: '#fff0da',
      color: '#d07c00',
    },
    Behavior: {
      background: '#fff1c9',
      color: '#a87900',
    },
    System: {
      background: '#edf0f3',
      color: '#687382',
    },
  };

  const style = colors[category] || colors.System;

  return (
    <Chip
      label={category}
      size="small"
      sx={{
        height: 20,
        fontSize: 12,
        backgroundColor: style.background,
        color: style.color,
        borderRadius: 0.8,
        '& .MuiChip-label': {
          px: 0.9,
        },
      }}
    />
  );
};

/* =========================================================
 * Main Component
 * ======================================================= */

const Content = () => {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const [selectedServer, setSelectedServer] = useState<string>('server-1');

  const [selectedCameras, setSelectedCameras] = useState<string[]>([
    'CAM-001',
    'CAM-002',
    'CAM-005',
  ]);

  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'PERSON_DETECTED',
    'FACE_MATCHED',
    'ZONE_ENTER',
    'ZONE_EXIT',
  ]);

  const [serverSearch, setServerSearch] = useState('');
  const [cameraSearch, setCameraSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  const [showSelected, setShowSelected] = useState(false);

  const [preset, setPreset] = useState('Custom');

  /* -------------------------------------------------------
   * Filter
   * ----------------------------------------------------- */

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const matchSearch =
        camera.id.toLowerCase().includes(cameraSearch.toLowerCase()) ||
        camera.name.toLowerCase().includes(cameraSearch.toLowerCase());

      const matchSelected = !showSelected || selectedCameras.includes(camera.id);

      return matchSearch && matchSelected;
    });
  }, [cameraSearch, showSelected, selectedCameras]);

  const filteredEvents = useMemo(() => {
    return eventTypes.filter(
      (event) =>
        event.code.toLowerCase().includes(eventSearch.toLowerCase()) ||
        event.name.toLowerCase().includes(eventSearch.toLowerCase()),
    );
  }, [eventSearch]);

  /* -------------------------------------------------------
   * Toggle
   * ----------------------------------------------------- */

  const toggleCamera = (cameraId: string) => {
    setSelectedCameras((current) =>
      current.includes(cameraId) ? current.filter((id) => id !== cameraId) : [...current, cameraId],
    );
  };

  const toggleEvent = (eventCode: string) => {
    setSelectedEvents((current) =>
      current.includes(eventCode)
        ? current.filter((code) => code !== eventCode)
        : [...current, eventCode],
    );
  };

  /* -------------------------------------------------------
   * Render
   * ----------------------------------------------------- */

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoadingIntegrations(true);

        const response = await getIntegrationEventInstanceTab();

        const collection: Integration[] = response?.collection ?? [];

        setIntegrations(collection);

        if (collection.length > 0) {
          setIntegration(collection[0]);
        }
      } catch (error) {
        console.error('Failed to fetch integrations:', error);
      } finally {
        setLoadingIntegrations(false);
      }
    };

    fetchIntegrations();
  }, []);

  const getIntegrationIcon = (name: string) => {
    const value = name.toLowerCase();

    if (value.includes('prowatch')) {
      return <IconShieldFilled size={20} />;
    }

    if (value.includes('ipsptek')) {
      return <IconCamera size={20} />;
    }

    if (value.includes('people tracking')) {
      return <IconUsers size={20} />;
    }

    if (value.includes('parking')) {
      return <IconParking size={20} />;
    }

    return <IconPlug size={20} />;
  };

  const [servers, setServers] = useState<any[]>([]);
  const [loadingServers, setLoadingServers] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoadingServers(true);

        const response = await getIntegrationEventInstance();

        const collection = response?.collection ?? [];

        setServers(collection);

        // if (collection.length > 0) {
        //   setSelectedServer(collection[0].id);
        // }
      } catch (error) {
        console.error('Failed to fetch integration servers:', error);
        setServers([]);
      } finally {
        setLoadingServers(false);
      }
    };

    fetchServers();
  }, []);

  const selectedServerData = servers.find((server) => server.id === selectedServer);

  const selectedCameraData = cameras.filter((camera) => selectedCameras.includes(camera.id));

  const selectedEventData = eventTypes.filter((event) => selectedEvents.includes(event.code));

  /* -------------------------------------------------------
   * Estimated Events
   * ----------------------------------------------------- */

  const estimatedEvents = useMemo(() => {
    const total = selectedEventData.reduce((sum, event) => {
      const value = Number(event.estimate.replace(/[^\d]/g, ''));

      return sum + value;
    }, 0);

    return total;
  }, [selectedEventData]);

  const filteredServers = useMemo(() => {
    return servers.filter((server) =>
      server.name.toLowerCase().includes(serverSearch.toLowerCase()),
    );
  }, [serverSearch]);

  const [openAddServer, setOpenAddServer] = useState(false);

  const [serverForm, setServerForm] = useState({
    source_type: '',
    external_id: '',
    description: '',
    is_active: false,
    integration_event_subscriptions: [] as {
      event_type: string;
      is_active: boolean;
    }[],
  });

  const [integrationInstances, setIntegrationInstances] = useState<any[]>([]);
  const [loadingIntegrationInstances, setLoadingIntegrationInstances] = useState(false);

  useEffect(() => {
    if (!integration?.integration_list_id) {
      setIntegrationInstances([]);
      return;
    }

    const fetchIntegrationInstance = async () => {
      try {
        setLoadingIntegrationInstances(true);

        const response = await getIntegrationInstanceByIntegrationId(
          integration.integration_list_id,
        );

        console.log('Integration Instance:', response);

        setIntegrationInstances(response?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch integration instance:', error);
        setIntegrationInstances([]);
      } finally {
        setLoadingIntegrationInstances(false);
      }
    };

    fetchIntegrationInstance();
  }, [integration]);

  const handleOpenAddServer = () => {
    if (!integration) return;

    const sourceTypeOptions = getSourceTypeOptions(integration);

    setServerForm({
      source_type: sourceTypeOptions[0]?.value ?? '',
      external_id: '',
      description: '',
      is_active: true,
      integration_event_subscriptions:
        integration.event_type?.map((eventType) => ({
          event_type: eventType,
          is_active: true,
        })) ?? [],
    });

    setOpenAddServer(true);
  };

  const handleSubmitAddServer = async () => {
    if (!integration?.integration_list_id) {
      console.error('Integration is not selected');
      return;
    }

    if (!serverForm.source_type) {
      console.error('Source type is required');
      return;
    }

    if (!serverForm.external_id) {
      console.error('External ID is required');
      return;
    }

    const payload = {
      integration_id: integration.integration_list_id,
      is_active: serverForm.is_active,
      integration_event_sources: [
        {
          source_type: serverForm.source_type,
          external_id: serverForm.external_id,
          description: serverForm.description,
          is_active: serverForm.is_active,
          integration_event_subscriptions: serverForm.integration_event_subscriptions,
        },
      ],
    };

    try {
      console.log('Add Server Payload:', payload);

      // TODO: panggil API POST di sini
      // await createIntegrationInstance(payload);

      setOpenAddServer(false);

      // refresh data setelah berhasil
      const response = await getIntegrationInstanceByIntegrationId(integration.integration_list_id);

      setIntegrationInstances(response?.collection ?? []);
    } catch (error) {
      console.error('Failed to add integration server:', error);
    }
  };

  const getSourceTypeOptions = (integration?: Integration | null) => {
    switch (integration?.name) {
      case 'Honeywell Prowatch':
        return [
          {
            label: 'Access Control',
            value: 'AccessControl',
          },
        ];

      case 'Honeywell Ipsptek':
        return [
          {
            label: 'Camera CCTV',
            value: 'CameraCCTV',
          },
        ];

      default:
        return (
          integration?.sourceType?.map((sourceType) => ({
            label: sourceType,
            value: sourceType,
          })) ?? []
        );
    }
  };

  const getEventTypeOptions = (integration?: Integration | null) => {
    switch (integration?.name) {
      case 'Honeywell Prowatch':
        return [
          {
            label: 'Tap Reader',
            value: 'TapReader',
          },
        ];

      case 'Honeywell Ipsptek':
        return [
          {
            label: 'Camera Capture',
            value: 'CameraCapture',
          },
        ];

      default:
        return (
          integration?.event_type?.map((eventType) => ({
            label: eventType,
            value: eventType,
          })) ?? []
        );
    }
  };

  const sourceTypeOptions = getSourceTypeOptions(integration);
  const eventTypeOptions = getEventTypeOptions(integration);
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Integration" description="Integration page">
        <Box
          sx={{
            backgroundColor: '#f7f9fc',
            minHeight: 'calc(100vh - 110px)',
            p: { xs: 1.5, md: 1 },
          }}
        >
          {/* =================================================
              Integration Selector
          ================================================= */}

          <Card
            elevation={0}
            sx={{
              border: '1px solid #e6eaf0',
              borderRadius: 1.5,
              mb: 1.5,
              backgroundColor: '#fff',
            }}
          >
            <CardContent
              sx={{
                p: '10px !important',
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 2,
                  color: '#1d2733',
                }}
              >
                Integration
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr 1fr',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 1,
                }}
              >
                {integrations.map((item) => {
                  const selected = integration?.integration_list_id === item.integration_list_id;

                  return (
                    <Paper
                      key={item.integration_list_id}
                      elevation={0}
                      onClick={() => setIntegration(item)}
                      sx={{
                        height: 80,
                        px: 1.5,
                        cursor: 'pointer',
                        borderRadius: 1,
                        border: selected ? '1px solid #1687d9' : '1px solid #e5e9ef',
                        backgroundColor: selected ? '#f0f8ff' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all .15s ease',
                        '&:hover': {
                          borderColor: '#1687d9',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 0.8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: selected ? '#1687d9' : '#64748b',
                          backgroundColor: selected ? '#e1f3ff' : '#f1f5f9',
                          mr: 1,
                          flexShrink: 0,
                        }}
                      >
                        {getIntegrationIcon(item.name)}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          {/* =================================================
              Stepper
          ================================================= */}

          <Box
            sx={{
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: 12,
                  color: '#8a94a2',
                  mt: '5px !important',
                },

                '& .MuiStepLabel-label.Mui-active': {
                  color: '#4c5665',
                  fontWeight: 600,
                },

                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#4c5665',
                },

                '& .MuiStepIcon-root': {
                  fontSize: 22,
                  color: '#dce2e9',
                },

                '& .MuiStepIcon-root.Mui-active': {
                  color: '#1976d2',
                },

                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#1976d2',
                },

                '& .MuiStepConnector-line': {
                  borderColor: '#dfe4ea',
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* =================================================
              Main Selection Area
          ================================================= */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '0.85fr 1.05fr 1.2fr',
              },
              gap: 1,
              alignItems: 'stretch',
            }}
          >
            {/* =================================================
                1. SERVER
            ================================================= */}

            <Card
              elevation={0}
              sx={{
                border: '1px solid #e4e8ee',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <CardContent
                sx={{
                  p: '12px !important',
                }}
              >
                <SectionTitle
                  number={1}
                  title="Select Server"
                  subtitle="Choose the Ipsotek server to configure."
                />

                <Stack direction="row" spacing={0.7} sx={{ mb: 1 }}>
                  <SearchField
                    placeholder="Search server..."
                    value={serverSearch}
                    onChange={setServerSearch}
                  />

                  <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                    onClick={() => setOpenAddServer(true)}
                    sx={{
                      minWidth: 88,
                      height: 34,
                      textTransform: 'none',
                      fontSize: 10,
                      borderRadius: 0.8,
                      boxShadow: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Add Server
                  </Button>
                </Stack>

                <Stack spacing={0.6}>
                  {filteredServers.map((server) => {
                    const selected = selectedServer === server.id;

                    return (
                      <Paper
                        key={server.id}
                        elevation={0}
                        onClick={() => setSelectedServer(server.id)}
                        sx={{
                          p: 1,
                          minHeight: 54,
                          cursor: 'pointer',
                          border: selected ? '1px solid #8dc4ee' : '1px solid transparent',
                          borderLeft: selected ? '2px solid #1976d2' : '2px solid transparent',
                          backgroundColor: selected ? '#eef7ff' : '#fff',
                          borderRadius: 0.7,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 0.7,
                              backgroundColor: selected ? '#1976d2' : '#e9eef4',
                              color: selected ? '#fff' : '#607080',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <StorageOutlinedIcon sx={{ fontSize: 17 }} />
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {server.name}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 12,
                                color: '#87919f',
                              }}
                            >
                              {server.address}
                            </Typography>
                          </Box>

                          <StatusDot online={server.online} />
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* =================================================
                2. CAMERA
            ================================================= */}

            <Card
              elevation={0}
              sx={{
                border: '1px solid #e4e8ee',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <CardContent
                sx={{
                  p: '12px !important',
                }}
              >
                <SectionTitle
                  number={2}
                  title="Select Camera (Source)"
                  subtitle="Choose cameras from the selected server."
                />

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <SearchField
                      placeholder="Search camera..."
                      value={cameraSearch}
                      onChange={setCameraSearch}
                    />
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => setShowSelected(!showSelected)}
                  >
                    <Checkbox
                      size="small"
                      checked={showSelected}
                      sx={{
                        p: 0.3,
                        mr: 0.3,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: '#6e7785',
                      }}
                    >
                      Show selected only
                    </Typography>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    border: '1px solid #edf0f3',
                    borderRadius: 0.8,
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '34px 0.9fr 1.2fr 1fr 0.7fr',
                      minHeight: 29,
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #edf0f3',
                      px: 0.5,
                    }}
                  >
                    <Checkbox
                      size="small"
                      sx={{ p: 0.3 }}
                      checked={
                        filteredCameras.length > 0 &&
                        filteredCameras.every((camera) => selectedCameras.includes(camera.id))
                      }
                      onChange={() => {
                        const allSelected = filteredCameras.every((camera) =>
                          selectedCameras.includes(camera.id),
                        );

                        if (allSelected) {
                          setSelectedCameras((current) =>
                            current.filter(
                              (id) => !filteredCameras.some((camera) => camera.id === id),
                            ),
                          );
                        } else {
                          setSelectedCameras((current) => [
                            ...new Set([...current, ...filteredCameras.map((camera) => camera.id)]),
                          ]);
                        }
                      }}
                    />

                    {['Camera ID', 'Camera Name', 'Location', 'Status'].map((title) => (
                      <Typography
                        key={title}
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#6e7785',
                        }}
                      >
                        {title}
                      </Typography>
                    ))}
                  </Box>

                  {/* Rows */}
                  {filteredCameras.map((camera) => {
                    const checked = selectedCameras.includes(camera.id);

                    return (
                      <Box
                        key={camera.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '34px 0.9fr 1.2fr 1fr 0.7fr',
                          minHeight: 34,
                          alignItems: 'center',
                          px: 0.5,
                          borderBottom: '1px solid #f0f2f5',
                          backgroundColor: checked ? '#f4faff' : '#fff',
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleCamera(camera.id)}
                          sx={{ p: 0.3 }}
                        />

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#344050',
                          }}
                        >
                          {camera.id}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#344050',
                          }}
                        >
                          {camera.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#667181',
                          }}
                        >
                          {camera.location}
                        </Typography>

                        <StatusDot online={camera.status === 'Online'} />
                      </Box>
                    );
                  })}
                </Box>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#7e8997',
                    }}
                  >
                    {selectedCameras.length} of {cameras.length} selected
                  </Typography>

                  <Stack direction="row" spacing={0.4}>
                    <IconButton
                      size="small"
                      sx={{
                        width: 25,
                        height: 25,
                        border: '1px solid #e0e4e9',
                        borderRadius: 0.7,
                      }}
                    >
                      <ArrowBackIosNewIcon sx={{ fontSize: 10 }} />
                    </IconButton>

                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        minWidth: 25,
                        height: 25,
                        p: 0,
                        fontSize: 12,
                        boxShadow: 'none',
                      }}
                    >
                      1
                    </Button>

                    <Button
                      size="small"
                      sx={{
                        minWidth: 25,
                        height: 25,
                        p: 0,
                        fontSize: 12,
                        color: '#697484',
                      }}
                    >
                      2
                    </Button>

                    <IconButton
                      size="small"
                      sx={{
                        width: 25,
                        height: 25,
                        border: '1px solid #e0e4e9',
                        borderRadius: 0.7,
                      }}
                    >
                      <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
                    </IconButton>
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#667181',
                    }}
                  >
                    10 / page
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* =================================================
                3. EVENT
            ================================================= */}

            <Card
              elevation={0}
              sx={{
                border: '1px solid #e4e8ee',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <CardContent
                sx={{
                  p: '12px !important',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <SectionTitle
                    number={3}
                    title="Select Event Type"
                    subtitle="Choose event types to store for the selected cameras."
                  />

                  <FormControl
                    size="small"
                    sx={{
                      width: 105,
                      mt: -0.2,
                    }}
                  >
                    <InputLabel
                      sx={{
                        fontSize: 12,
                      }}
                    >
                      Select Preset
                    </InputLabel>

                    <Select
                      value={preset}
                      label="Select Preset"
                      onChange={(e) => setPreset(e.target.value)}
                      sx={{
                        height: 31,
                        fontSize: 12,
                        borderRadius: 0.8,
                      }}
                    >
                      <MenuItem value="Custom">Custom</MenuItem>
                      <MenuItem value="Security">Security</MenuItem>
                      <MenuItem value="Recognition">Recognition</MenuItem>
                      <MenuItem value="All">All Events</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Box sx={{ mb: 1 }}>
                  <SearchField
                    placeholder="Search event type..."
                    value={eventSearch}
                    onChange={setEventSearch}
                  />
                </Box>

                <Box
                  sx={{
                    border: '1px solid #edf0f3',
                    borderRadius: 0.8,
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '34px 1.15fr 1.1fr 0.8fr 0.8fr',
                      minHeight: 29,
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      px: 0.5,
                    }}
                  >
                    <Checkbox
                      size="small"
                      sx={{ p: 0.3 }}
                      checked={
                        filteredEvents.length > 0 &&
                        filteredEvents.every((event) => selectedEvents.includes(event.code))
                      }
                      onChange={() => {
                        const allSelected = filteredEvents.every((event) =>
                          selectedEvents.includes(event.code),
                        );

                        if (allSelected) {
                          setSelectedEvents((current) =>
                            current.filter(
                              (code) => !filteredEvents.some((event) => event.code === code),
                            ),
                          );
                        } else {
                          setSelectedEvents((current) => [
                            ...new Set([...current, ...filteredEvents.map((event) => event.code)]),
                          ]);
                        }
                      }}
                    />

                    {['Event Type Code', 'Event Type Name', 'Category', 'Estimate/Day'].map(
                      (title) => (
                        <Typography
                          key={title}
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#6e7785',
                          }}
                        >
                          {title}
                        </Typography>
                      ),
                    )}
                  </Box>

                  {filteredEvents.map((event) => {
                    const checked = selectedEvents.includes(event.code);

                    return (
                      <Box
                        key={event.code}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '34px 1.15fr 1.1fr 0.8fr 0.8fr',
                          minHeight: 34,
                          alignItems: 'center',
                          px: 0.5,
                          borderTop: '1px solid #f0f2f5',
                          backgroundColor: checked ? '#f4faff' : '#fff',
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleEvent(event.code)}
                          sx={{ p: 0.3 }}
                        />

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#344050',
                          }}
                        >
                          {event.code}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#344050',
                          }}
                        >
                          {event.name}
                        </Typography>

                        <CategoryChip category={event.category} />

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#667181',
                          }}
                        >
                          {event.estimate}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#7e8997',
                    }}
                  >
                    {selectedEvents.length} of {eventTypes.length} selected
                  </Typography>

                  <Stack direction="row" spacing={0.4}>
                    <IconButton
                      size="small"
                      sx={{
                        width: 25,
                        height: 25,
                        border: '1px solid #e0e4e9',
                        borderRadius: 0.7,
                      }}
                    >
                      <ArrowBackIosNewIcon sx={{ fontSize: 10 }} />
                    </IconButton>

                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        minWidth: 25,
                        height: 25,
                        p: 0,
                        fontSize: 9,
                        boxShadow: 'none',
                      }}
                    >
                      1
                    </Button>

                    <Button
                      size="small"
                      sx={{
                        minWidth: 25,
                        height: 25,
                        p: 0,
                        fontSize: 9,
                        color: '#697484',
                      }}
                    >
                      2
                    </Button>

                    <IconButton
                      size="small"
                      sx={{
                        width: 25,
                        height: 25,
                        border: '1px solid #e0e4e9',
                        borderRadius: 0.7,
                      }}
                    >
                      <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
                    </IconButton>
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#667181',
                    }}
                  >
                    10 / page
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* =================================================
              4. REVIEW & SAVE
          ================================================= */}

          <Card
            elevation={0}
            sx={{
              mt: 1,
              border: '1px solid #e4e8ee',
              borderRadius: 1.5,
            }}
          >
            <CardContent
              sx={{
                p: '12px !important',
              }}
            >
              <SectionTitle
                number={4}
                title="Review & Save"
                subtitle="Review your subscription configuration before saving."
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    lg: '1.1fr 1.2fr 1.2fr 1fr',
                  },
                  gap: 1,
                }}
              >
                {/* Server */}
                <Paper
                  elevation={0}
                  sx={{
                    minHeight: 78,
                    p: 1,
                    border: '1px solid #e3e7ec',
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.7,
                        backgroundColor: '#e8f4ff',
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StorageOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <Typography
                          sx={{
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {selectedServerData?.name}
                        </Typography>

                        <Chip
                          label="Online"
                          size="small"
                          sx={{
                            height: 17,
                            fontSize: 8,
                            backgroundColor: '#e4f7ee',
                            color: '#13905b',
                          }}
                        />
                      </Stack>

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: '#7d8794',
                          mt: 0.3,
                        }}
                      >
                        {selectedServerData?.address}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Cameras */}
                <Paper
                  elevation={0}
                  sx={{
                    minHeight: 78,
                    p: 1,
                    border: '1px solid #e3e7ec',
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.7,
                        backgroundColor: '#e8f4ff',
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <VideocamOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 700,
                          mb: 0.3,
                        }}
                      >
                        Selected Cameras ({selectedCameras.length})
                      </Typography>

                      {selectedCameraData.slice(0, 3).map((camera) => (
                        <Typography
                          key={camera.id}
                          sx={{
                            fontSize: 12,
                            color: '#727d8b',
                            lineHeight: 1.4,
                          }}
                        >
                          {camera.id} — {camera.name}
                        </Typography>
                      ))}

                      {selectedCameraData.length > 3 && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#1976d2',
                            mt: 0.2,
                          }}
                        >
                          +{selectedCameraData.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>

                {/* Events */}
                <Paper
                  elevation={0}
                  sx={{
                    minHeight: 78,
                    p: 1,
                    border: '1px solid #e3e7ec',
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.7,
                        backgroundColor: '#f0edff',
                        color: '#6554c0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 17 }} />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 700,
                          mb: 0.3,
                        }}
                      >
                        Selected Event Types ({selectedEvents.length})
                      </Typography>

                      {selectedEventData.slice(0, 4).map((event) => (
                        <Typography
                          key={event.code}
                          sx={{
                            fontSize: 12,
                            color: '#727d8b',
                            lineHeight: 1.4,
                          }}
                        >
                          {event.code}
                        </Typography>
                      ))}
                    </Box>
                  </Stack>
                </Paper>

                {/* Estimated */}
                <Paper
                  elevation={0}
                  sx={{
                    minHeight: 78,
                    p: 1,
                    border: '1px solid #e3e7ec',
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.7,
                        backgroundColor: '#edf8f3',
                        color: '#17a36a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BarChartOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        Estimated Events
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: '#263442',
                          lineHeight: 1.2,
                        }}
                      >
                        ~ {estimatedEvents.toLocaleString()}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: '#8a94a1',
                        }}
                      >
                        events/day
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>

              {/* Footer */}
              <Stack direction="row" justifyContent="flex-end" spacing={0.8} sx={{ mt: 1.5 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                  onClick={() => {
                    setSelectedCameras([]);
                    setSelectedEvents([]);
                  }}
                  size="medium"
                  sx={{
                    // height: 34,
                    textTransform: 'none',
                    // fontSize: 10.5,
                    // borderColor: '#d8dde4',
                    // color: '#596474',
                    borderRadius: 0.8,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => {
                    console.log({
                      integration,
                      server: selectedServerData,
                      cameras: selectedCameraData,
                      events: selectedEventData,
                    });
                  }}
                  size="medium"
                  sx={{
                    // height: 34,
                    textTransform: 'none',
                    // fontSize: 10.5,
                    borderRadius: 0.8,
                    boxShadow: 'none',
                    px: 2,
                  }}
                >
                  Save Subscription
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Dialog
          open={openAddServer}
          onClose={() => setOpenAddServer(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle
            sx={{
              fontSize: 18,
              fontWeight: 700,
              pb: 1,
            }}
          >
            Add Server
            <IconButton
              size="small"
              onClick={() => setOpenAddServer(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <CustomFormLabel>Source</CustomFormLabel>
              <TextField
                select
                fullWidth
                size="small"
                value={serverForm.source_type}
                onChange={(e) =>
                  setServerForm((prev) => ({
                    ...prev,
                    source_type: e.target.value,
                  }))
                }
              >
                {sourceTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <CustomFormLabel>External ID</CustomFormLabel>
              <TextField
                size="small"
                fullWidth
                label="External ID"
                placeholder="e.g. CAM-LOBBY"
                value={serverForm.external_id}
                onChange={(e) =>
                  setServerForm((prev) => ({
                    ...prev,
                    external_id: e.target.value,
                  }))
                }
              />

              <CustomFormLabel>Description</CustomFormLabel>

              <TextField
                size="small"
                fullWidth
                label="Description"
                placeholder="e.g. Camera Lobby"
                value={serverForm.description}
                onChange={(e) =>
                  setServerForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <CustomFormLabel>Status</CustomFormLabel>

              <FormControlLabel
                control={
                  <Switch
                    checked={serverForm.is_active}
                    onChange={(e) =>
                      setServerForm((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />
                }
                label="Active"
              />

              <CustomFormLabel>Event Subscriptions</CustomFormLabel>

              <Stack spacing={0.5}>
                {serverForm.integration_event_subscriptions.map((subscription, index) => (
                  <Paper
                    key={subscription.event_type}
                    elevation={0}
                    sx={{
                      px: 1.5,
                      py: 0.7,
                      border: '1px solid #e4e8ee',
                      borderRadius: 0.8,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {subscription.event_type}
                      </Typography>

                      <Switch
                        size="small"
                        checked={subscription.is_active}
                        onChange={(e) => {
                          setServerForm((prev) => ({
                            ...prev,
                            integration_event_subscriptions:
                              prev.integration_event_subscriptions.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      is_active: e.target.checked,
                                    }
                                  : item,
                              ),
                          }));
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setOpenAddServer(false)}
              sx={{
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmitAddServer}
              sx={{
                textTransform: 'none',
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
};

export default Content;
