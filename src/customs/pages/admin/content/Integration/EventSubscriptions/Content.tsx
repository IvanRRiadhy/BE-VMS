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
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  createIntegrationEventInstance,
  getIntegrationEventInstance,
  getIntegrationEventInstanceTab,
  getIntegrationInstanceByIntegrationId,
  getSourceIpsotek,
  getSourceHoneywell,
  getSourceParking,
  getSourceTrackingBle,
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
import { showSwal } from 'src/customs/components/alerts/alerts';
import AddServerDialog from './components/AddServerDialog';

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

const eventTypes: EventType[] = [];

const steps = ['Select Server', 'Select Source', 'Select Event Type', 'Review & Save'];

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

  const [selectedServer, setSelectedServer] = useState<string>('');

  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'PERSON_DETECTED',
    'FACE_MATCHED',
    'ZONE_ENTER',
    'ZONE_EXIT',
  ]);

  const resetServerForm = () => {
    const sourceTypeOptions = getSourceTypeOptions(integration);

    setServerForm({
      source_type: sourceTypeOptions[0]?.value ?? '',
      external_id: '',
      description: '',
      is_active: true,
      integration_event_subscriptions:
        integration?.event_type?.map((eventType) => ({
          event_type: eventType,
          is_active: true,
        })) ?? [],
    });
  };

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
    const value = name.toLowerCase().trim();

    if (value.includes('prowatch')) {
      return <IconShieldFilled size={20} />;
    }

    if (value.includes('ipsotek') || value.includes('ipsptek')) {
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
  const [integrationInstances, setIntegrationInstances] = useState<any[]>([]);
  const [loadingIntegrationInstances, setLoadingIntegrationInstances] = useState(false);
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
    return integrationInstances
      .flatMap((instance) =>
        (instance.integration_event_sources ?? []).map((source: any) => ({
          id: source.id,
          instance_id: instance.id,
          name: source.description,
          address: source.external_id,
          source_type: source.source_type,
          is_active: source.is_active,
        })),
      )
      .filter((server) => {
        const search = serverSearch.toLowerCase();

        return (
          server.name?.toLowerCase().includes(search) ||
          server.address?.toLowerCase().includes(search)
        );
      });
  }, [integrationInstances, serverSearch]);

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

  // useEffect(() => {
  //   // if (!integration?.integration_list_id) {
  //   //   setIntegrationInstances([]);
  //   //   return;
  //   // }

  //   const fetchIntegrationInstance = async () => {
  //     try {
  //       setLoadingIntegrationInstances(true);

  //       // const response = await getIntegrationInstanceByIntegrationId(
  //       //   integration.integration_list_id,
  //       // );

  //       const response = await getIntegrationEventInstance();

  //       console.log('Integration Instance:', response);

  //       setIntegrationInstances(response?.collection ?? []);
  //     } catch (error) {
  //       console.error('Failed to fetch integration instance:', error);
  //       setIntegrationInstances([]);
  //     } finally {
  //       setLoadingIntegrationInstances(false);
  //     }
  //   };

  //   fetchIntegrationInstance();
  // }, []);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoadingServers(true);

        const response = await getIntegrationEventInstance();

        const collection = response?.collection ?? [];

        setIntegrationInstances(collection);
      } catch (error) {
        console.error('Failed to fetch integration servers:', error);
      } finally {
        setLoadingServers(false);
      }
    };

    fetchServers();
  }, []);

  useEffect(() => {
    if (!openAddServer || !integration) return;

    setServerForm((prev) => ({
      ...prev,
      integration_event_subscriptions: (integration.event_type ?? []).map((eventType) => ({
        event_type: eventType,
        is_active: true,
      })),
    }));
  }, [openAddServer, integration]);

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
    const integrationInstance = integrationInstances[0];
    if (!serverForm.source_type) {
      console.error('Source type is required');
      return;
    }

    if (!serverForm.external_id) {
      console.error('External ID is required');
      return;
    }

    const selectedIntegrationInstance = integrationInstances.find(
      (item) => item.id === selectedServer,
    );
    console.log('selectedIntegrationInstance', selectedIntegrationInstance);

    const payload = {
      integration_id: integrationInstance.id,
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
      await createIntegrationEventInstance(payload);
      const response = await getIntegrationInstanceByIntegrationId(integration.integration_list_id);

      setIntegrationInstances(response?.collection ?? []);

      // Reset form
      setServerForm({
        source_type: '',
        external_id: '',
        description: '',
        is_active: true,
        integration_event_subscriptions: [],
      });

      // Tutup dialog
      setOpenAddServer(false);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to add integration server');
    }
  };

  const handleCloseAddServer = () => {
    setOpenAddServer(false);
    resetServerForm();
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

      case 'Honeywell Ipsptek' || 'Honeywell Ipsotek':
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

  const parkingGroupTypeOptions = [
    { label: 'Employee', value: 'employee' },
    { label: 'Resident', value: 'resident' },
    { label: 'Visitor', value: 'visitor' },
    { label: 'Vendor', value: 'vendor' },
  ];

  const sourceColumns = useMemo(() => {
    const keys = new Set<string>();

    cameras.forEach((camera) => {
      Object.keys(camera ?? {}).forEach((key) => {
        keys.add(key);
      });
    });

    return Array.from(keys);
  }, [cameras]);

  const getSourceId = (source: any) => {
    return String(source?.id ?? source?.external_id ?? '');
  };

  const selectedSourceServer = useMemo(() => {
    return filteredServers.find((server) => server.id === selectedServer);
  }, [filteredServers, selectedServer]);

  useEffect(() => {
    const loadSource = async () => {
      if (!selectedSourceServer?.instance_id || !integration?.name) {
        setCameras([]);
        return;
      }

      const integrationName = integration.name.toLowerCase();
      const instanceId = selectedSourceServer.instance_id;

      try {
        setLoadingCameras(true);

        let response;

        if (integrationName.includes('ipsotek') || integrationName.includes('ipsptek')) {
          response = await getSourceIpsotek(instanceId);
        } else if (integrationName.includes('prowatch')) {
          response = await getSourceHoneywell(instanceId);
        } else if (integrationName.includes('parking')) {
          response = await getSourceParking(instanceId);
        } else if (integrationName.includes('people tracking')) {
          response = await getSourceTrackingBle(instanceId);
        } else {
          setCameras([]);
          return;
        }

        console.log('SOURCE:', response);

        setCameras(response?.collection ?? []);
      } catch (error) {
        console.error('Failed get source:', error);
        setCameras([]);
      } finally {
        setLoadingCameras(false);
      }
    };

    loadSource();
  }, [selectedSourceServer, integration?.name]);

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
                <Stack
                  spacing={0.6}
                  sx={{
                    maxHeight: 330,
                    overflowY: 'auto',
                    pr: 0.3,

                    '&::-webkit-scrollbar': {
                      width: 5,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#d5dbe2',
                      borderRadius: 5,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
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

                          <StatusDot online={server.is_active} />
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

            {/* <Card
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
                  <Box
                    sx={{
                      minHeight: 450,
                      overflowY: 'auto',
                    }}
                  >

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
            </Card> */}

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
                      gridTemplateColumns: `34px repeat(${sourceColumns.length}, minmax(140px, 1fr))`,
                      minHeight: 29,
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #edf0f3',
                      px: 0.5,
                      overflowX: 'auto',
                    }}
                  >
                    {filteredCameras.length > 0 && (
                      <Checkbox
                        size="small"
                        sx={{ p: 0.3 }}
                        checked={filteredCameras.every((camera) =>
                          selectedCameras.includes(getSourceId(camera)),
                        )}
                        indeterminate={
                          filteredCameras.some((camera) =>
                            selectedCameras.includes(getSourceId(camera)),
                          ) &&
                          !filteredCameras.every((camera) =>
                            selectedCameras.includes(getSourceId(camera)),
                          )
                        }
                        onChange={() => {
                          const allSelected = filteredCameras.every((camera) =>
                            selectedCameras.includes(getSourceId(camera)),
                          );

                          if (allSelected) {
                            setSelectedCameras((current) =>
                              current.filter(
                                (id) =>
                                  !filteredCameras.some((camera) => getSourceId(camera) === id),
                              ),
                            );
                          } else {
                            setSelectedCameras((current) => [
                              ...new Set([
                                ...current,
                                ...filteredCameras.map((camera) => getSourceId(camera)),
                              ]),
                            ]);
                          }
                        }}
                      />
                    )}

                    {/* Dynamic Columns */}
                    {sourceColumns.map((column) => (
                      <Typography
                        key={column}
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#6e7785',
                          px: 0.5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {column}
                      </Typography>
                    ))}
                  </Box>

                  {/* Rows */}
                  <Box
                    sx={{
                      minHeight: 450,
                      maxHeight: 450,
                      overflow: 'auto',
                    }}
                  >
                    {filteredCameras.length === 0 ? (
                      <Box
                        sx={{
                          minHeight: 450,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#8a94a3',
                          }}
                        >
                          No camera source found.
                        </Typography>
                      </Box>
                    ) : (
                      filteredCameras.map((camera, index) => {
                        const cameraId = getSourceId(camera);
                        const checked = selectedCameras.includes(cameraId);

                        return (
                          <Box
                            key={cameraId || index}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: `34px repeat(${sourceColumns.length}, minmax(140px, 1fr))`,
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
                              onChange={() => toggleCamera(cameraId)}
                              sx={{ p: 0.3 }}
                            />

                            {sourceColumns.map((column) => {
                              const value = camera?.[column];

                              return (
                                <Typography
                                  key={column}
                                  sx={{
                                    fontSize: 12,
                                    color: '#344050',
                                    px: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={
                                    value === null || value === undefined
                                      ? '-'
                                      : typeof value === 'object'
                                      ? JSON.stringify(value)
                                      : String(value)
                                  }
                                >
                                  {value === null || value === undefined
                                    ? '-'
                                    : typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </Typography>
                              );
                            })}
                          </Box>
                        );
                      })
                    )}
                  </Box>
                </Box>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 12,
                    color: '#7e8997',
                  }}
                >
                  {selectedCameras.length} of {cameras.length} selected
                </Typography>
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

                  <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
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
                </Box>

                {/* <Stack
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
                </Stack> */}
              </CardContent>
            </Card>
          </Box>

          {/* =================================================
              4. REVIEW & SAVE
          ================================================= */}
          {/* 
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

       
             
            </CardContent>
          </Card> */}

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
        </Box>

        <AddServerDialog
          open={openAddServer}
          serverForm={serverForm}
          sourceTypeOptions={sourceTypeOptions}
          parkingGroupTypeOptions={parkingGroupTypeOptions}
          isParking={integration?.name === 'Bio Parking System'}
          onClose={handleCloseAddServer}
          onChange={setServerForm}
          onSubmit={handleSubmitAddServer}
        />
      </Container>
    </PageContainer>
  );
};

export default Content;
