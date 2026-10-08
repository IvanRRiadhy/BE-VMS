import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
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
  getIntegrationInstanceByIntegrationId,
  getSourceIpsotek,
  getSourceHoneywell,
} from 'src/customs/api/Admin/Integration';
import {
  IconCamera,
  IconChartBar,
  IconParking,
  IconPlug,
  IconShield,
  IconShieldFilled,
  IconSquareCheckFilled,
  IconUsers,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import AddServerDialog from './components/AddServerDialog';
import GlobalBackdropLoading from '../../../components/GlobalBackdrop';
import {
  useCreateIntegrationEventInstance,
  useIntegrationInstances,
  useIntegrationList,
  useLogdevs,
} from 'src/hooks/EventSubscriptions';
import { getVisitorTypeParking } from 'src/customs/api/types/ParkingIntegration';

interface Integration {
  integration_list_id: string;
  name: string;
  event_type: string[];
  sourceType: string[];
}

const steps = ['Select Server', 'Select Source', 'Select Event Type', 'Review & Save'];

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

const Content = () => {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const [selectedServer, setSelectedServer] = useState<string>('');

  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [selectedEventsBySource, setSelectedEventsBySource] = useState<Record<string, string[]>>(
    {},
  );

  const toggleEvent = (sourceId: string, eventName: string) => {
    setSelectedEventsBySource((prev) => {
      const currentEvents = prev[sourceId] ?? [];

      const updatedEvents = currentEvents.includes(eventName)
        ? currentEvents.filter((name) => name !== eventName)
        : [...currentEvents, eventName];

      return {
        ...prev,
        [sourceId]: updatedEvents,
      };
    });
  };

  const resetServerForm = () => {
    const sourceTypeOptions = getSourceTypeOptions(integration);

    setServerForm({
      integration_id: '',
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

  const toggleCamera = (cameraId: string) => {
    setSelectedCameras((current) =>
      current.includes(cameraId) ? current.filter((id) => id !== cameraId) : [...current, cameraId],
    );
  };

  const { data: integrations = [], isLoading: loadingIntegrations } = useIntegrationList();

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

  const { data: integrationInstances = [], isLoading: loadingServers } = useIntegrationInstances();

  const filteredServers = useMemo(() => {
    return integrationInstances
      .map((instance: any) => ({
        id: instance.id,
        instance_id: instance.id,
        integration_id: instance.integration_id,
        name: instance.integration?.name ?? instance.integration_id,
        address: '',
        source_type: '',
        is_active: instance.is_active,
      }))
      .filter((server: any) => {
        const search = serverSearch.toLowerCase();

        return (
          server.name?.toLowerCase().includes(search) ||
          server.address?.toLowerCase().includes(search) ||
          server.integration_id?.toLowerCase().includes(search)
        );
      });
  }, [integrationInstances, serverSearch]);

  const [openAddServer, setOpenAddServer] = useState(false);

  const [serverForm, setServerForm] = useState({
    integration_id: '',
    source_type: '',
    external_id: '',
    description: '',
    is_active: false,
    integration_event_subscriptions: [] as {
      event_type: string;
      is_active: boolean;
    }[],
  });

  const [addIntegrationOptions, setAddIntegrationOptions] = useState<any[]>([]);
  const [loadingAddIntegrationOptions, setLoadingAddIntegrationOptions] = useState(false);

  const fetchIntegrationInstance = async () => {
    if (!integration?.integration_list_id) {
      setAddIntegrationOptions([]);
      return;
    }

    try {
      setLoadingAddIntegrationOptions(true);

      const response = await getIntegrationInstanceByIntegrationId(integration.integration_list_id);

      setAddIntegrationOptions(response?.collection ?? []);
    } catch (error) {
      console.error('Failed to fetch integration options:', error);
      setAddIntegrationOptions([]);
    } finally {
      setLoadingAddIntegrationOptions(false);
    }
  };

  useEffect(() => {
    fetchIntegrationInstance();
  }, [integration?.integration_list_id]);

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

  const { mutateAsync: createIntegrationEventInstance, isPending: isSubmitting } =
    useCreateIntegrationEventInstance();

  const handleSubmitAddServer = async () => {
    if (!serverForm.integration_id) {
      showSwal('error', 'Integration is required');
      return;
    }

    const payload = {
      integration_id: serverForm.integration_id,
      is_active: serverForm.is_active,
    };

    try {
      await createIntegrationEventInstance(payload);
      showSwal('success', 'Successfully added integration server');

      setServerForm({
        integration_id: '',
        source_type: '',
        external_id: '',
        description: '',
        is_active: true,
        integration_event_subscriptions: [],
      });
      await fetchIntegrationInstance();
      setOpenAddServer(false);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to add integration server');
    }
  };

  const resetForm = () => {
    setSelectedServer('');
    setSelectedEventsBySource({});
    setServerSearch('');
    setCameraSearch('');
  };

  const getSourceExternalId = (source: any) => {
    const integrationName = integration?.name?.toLowerCase() ?? '';

    if (integrationName.includes('parking')) {
      return String(source?.uid ?? '');
    }

    if (integrationName.includes('prowatch')) {
      return String(source?.log_dev_id ?? '');
    }

    if (integrationName.includes('ipsotek')) {
      return String(source?.external_id ?? '');
    }

    return String(source?.external_id ?? source?.id ?? '');
  };

  const handleSaveSubscription = async () => {
    if (!selectedServerData?.integration_id) {
      showSwal('error', 'Integration server is not selected');
      return;
    }

    const integrationId = selectedServerData.integration_id;

    const integrationEventSources = selectedCameraData.map((camera) => {
      const sourceId = getSourceId(camera);
      const selectedEvents = selectedEventsBySource[sourceId] ?? [];
      const isPeopleTracking = integration?.name?.toLowerCase().includes('people tracking');
      return {
        source_type: isPeopleTracking ? 'PersonCategory' : (integration?.sourceType?.[0] ?? ''),
        external_id: integration?.name?.toLowerCase().includes('parking')
          ? camera.uid
          : getSourceExternalId(camera),
        description: camera.description ?? camera.name,
        is_active: true,
        integration_event_subscriptions: selectedEvents.map((eventName) => ({
          event_type: eventName,
          is_active: true,
        })),
      };
    });

    const payload = {
      integration_id: integrationId,
      is_active: selectedServerData.is_active ?? true,
      integration_event_sources: integrationEventSources,
    };
    try {
      await createIntegrationEventInstance(payload);

      showSwal('success', 'Successfully created integration subscription');
      resetForm();
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to create integration subscription');
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

  const sourceColumns = useMemo(() => {
    if (integration?.name?.toLowerCase().includes('prowatch')) {
      return ['name', 'log_dev_id'];
    }

    if (integration?.name?.toLowerCase().includes('parking')) {
      return ['name'];
    }

    if (integration?.name?.toLowerCase().includes('tracking')) {
      return ['name'];
    }

    if (integration?.name?.toLowerCase().includes('ipsptek')) {
      return ['name'];
    }

    const keys = new Set<string>();

    cameras.forEach((camera) => {
      Object.keys(camera ?? {}).forEach((key) => {
        keys.add(key);
      });
    });

    return Array.from(keys);
  }, [cameras, integration]);

  const getSourceId = (source: any) => {
    if (integration?.name?.toLowerCase().includes('prowatch')) {
      return String(source?.log_dev_id ?? '');
    }

    if (integration?.name?.toLowerCase().includes('parking')) {
      return String(source?.uid ?? '');
    }

    return String(source?.id ?? source?.external_id ?? '');
  };

  const cameraId = getSourceId(cameras);
  const selectedEvents = selectedEventsBySource[cameraId] ?? [];

  const selectedServerData = useMemo(() => {
    return filteredServers.find((server: any) => server.id === selectedServer);
  }, [filteredServers, selectedServer]);

  const selectedSourceServer = useMemo(() => {
    return filteredServers.find((server: any) => server.id === selectedServer);
  }, [filteredServers, selectedServer]);

  const selectedSourceData = useMemo(() => {
    if (!selectedServerData) return [];

    const instance = integrationInstances.find(
      (item: any) => item.id === selectedServerData.instance_id,
    );

    if (!instance) return [];

    return instance.integration_event_sources ?? [];
  }, [integrationInstances, selectedServerData]);

  const getCameraExternalId = (camera: any) =>
    String(camera?.external_id ?? camera?.log_dev_id ?? camera?.id ?? '');

  const isMatchingSource = (camera: any, source: any) => {
    if (!source) return false;

    const cameraExternalId = getCameraExternalId(camera);

    return (
      cameraExternalId === String(source.external_id ?? '') &&
      (!camera?.source_type || camera.source_type === source.source_type)
    );
  };

  const loadSource = async () => {
    if (!selectedSourceServer?.instance_id) {
      setCameras([]);
      setSelectedCameras([]);
      setSelectedEventsBySource({});
      return;
    }

    const integrationName = integration?.name?.toLowerCase() ?? '';

    const instanceId = selectedServerData?.integration_id ?? selectedSourceServer?.integration_id;

    try {
      setLoadingCameras(true);

      if (integrationName.includes('ipsotek') || integrationName.includes('ipsptek')) {
        const savedSources = selectedSourceData ?? [];

        const sourceList = savedSources.map((source: any) => ({
          ...source,
          id: source.id ?? source.external_id,
          name: source.name ?? source.description,
          external_id: source.external_id,
          description: source.description,
        }));

        setCameras(sourceList);

        const selectedSourceIds = sourceList.map((source: any) => getSourceId(source));

        setSelectedCameras(selectedSourceIds);

        const eventsBySource: Record<string, string[]> = {};

        sourceList.forEach((source: any) => {
          const sourceId = getSourceId(source);

          const existingEvents =
            source.integration_event_subscriptions
              ?.filter((item: any) => item.is_active)
              ?.map((item: any) => item.event_type) ?? [];

          eventsBySource[sourceId] = existingEvents;
        });

        setSelectedEventsBySource(eventsBySource);

        return;
      }

      let response;

      if (integrationName.includes('prowatch')) {
        response = await getSourceHoneywell(instanceId);
      } else if (integrationName.includes('parking')) {
        response = await getVisitorTypeParking(instanceId);
      } else if (integrationName.includes('people tracking')) {
        setCameras([
          {
            id: 'Member',
            name: 'Member',
          },
          {
            id: 'Visitor',
            name: 'Visitor',
          },
          {
            id: 'Security',
            name: 'Security',
          },
        ]);

        setSelectedCameras([]);
        setSelectedEventsBySource({});

        return;
      } else {
        setCameras([]);
        setSelectedCameras([]);
        setSelectedEventsBySource({});

        return;
      }

      const sourceCollection = response?.collection ?? [];

      setCameras(sourceCollection);

      const savedSources = selectedSourceData ?? [];

      if (savedSources.length === 0) {
        setSelectedCameras([]);
        setSelectedEventsBySource({});
        return;
      }

      const matchedSources = sourceCollection.filter((camera: any) => {
        const cameraId = String(camera?.external_id ?? camera?.log_dev_id ?? camera?.id ?? '');

        return savedSources.some(
          (savedSource: any) => cameraId === String(savedSource.external_id ?? ''),
        );
      });

      const selectedSourceIds = matchedSources.map((camera: any) => getSourceId(camera));

      setSelectedCameras(selectedSourceIds);

      const eventsBySource: Record<string, string[]> = {};

      matchedSources.forEach((camera: any) => {
        const sourceId = getSourceId(camera);

        const savedSource = savedSources.find(
          (source: any) =>
            String(source.external_id ?? '') ===
            String(camera?.external_id ?? camera?.log_dev_id ?? camera?.id ?? ''),
        );

        const existingEvents =
          savedSource?.integration_event_subscriptions
            ?.filter((item: any) => item.is_active)
            ?.map((item: any) => item.event_type) ?? [];

        eventsBySource[sourceId] = existingEvents;
      });

      setSelectedEventsBySource(eventsBySource);
    } catch (error) {
      console.error('Failed get source:', error);

      setCameras([]);
      setSelectedCameras([]);
      setSelectedEventsBySource({});
    } finally {
      setLoadingCameras(false);
    }
  };

  useEffect(() => {
    loadSource();
  }, [
    selectedSourceServer?.id,
    selectedSourceServer?.integration_id,
    integration?.name,
    selectedSourceData,
  ]);

  const selectedCameraData = cameras.filter((camera) =>
    selectedCameras.includes(getSourceId(camera)),
  );
  const filteredCameras = useMemo(() => {
    const search = cameraSearch.trim().toLowerCase();

    return cameras.filter((camera: any) => {
      const sourceId = getSourceId(camera);

      const searchableValues = [
        camera?.name,
        camera?.log_dev_id,
        camera?.id,
        camera?.external_id,
        camera?.description,
        camera?.location,
      ];

      const matchSearch =
        !search ||
        searchableValues.some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(search),
        );

      const matchSelected = !showSelected || selectedCameras.includes(sourceId);

      return matchSearch && matchSelected;
    });
  }, [cameras, cameraSearch, showSelected, selectedCameras, integration]);

  const sourceGridTemplate = '40px minmax(140px, 1fr) minmax(0, 1.5fr)';
  const PEOPLE_TRACKING_EVENT_GROUPS = [
    {
      label: 'Action',
      values: [
        'Idle',
        'Acknowledged',
        'Dispatched',
        'Accepted',
        'DoneInvestigated',
        'Done',
        'PostponeInvestigated',
      ],
    },
    {
      label: 'Alarm Status',
      values: [
        'CardAccess',
        'Wrongzone',
        'Geofence',
        'LowBattery',
        'Blacklist',
        'Block',
        'Expired',
        'Help',
      ],
    },
    {
      label: 'Alarm Priority',
      values: ['Critical', 'High', 'Medium', 'Low'],
    },
  ];

  const filteredEvents = useMemo(() => {
    const integrationName = integration?.name?.toLowerCase() ?? '';

    let events: string[];

    if (integrationName.includes('people tracking')) {
      events = [
        'Idle',
        'Acknowledged',
        'Dispatched',
        'Accepted',
        'DoneInvestigated',
        'Done',
        'PostponeInvestigated',
      ];
    } else {
      events = integration?.event_type ?? [];
    }

    return events
      .filter((eventType) => eventType.toLowerCase().includes(eventSearch.toLowerCase()))
      .map((eventType) => ({
        code: eventType,
        name: eventType,
      }));
  }, [integration?.name, integration?.event_type, eventSearch]);

  const selectedEventData = selectedCameraData.flatMap((camera) => {
    const sourceId = getSourceId(camera);
    const selectedEvents = selectedEventsBySource[sourceId] ?? [];

    return selectedEvents.map((eventName) => ({
      sourceId,
      sourceName: camera.name ?? camera.description ?? camera.external_id ?? camera.log_dev_id,
      name: eventName,
    }));
  });

  const [openAddSource, setOpenAddSource] = useState(false);

  const [manualSourceForm, setManualSourceForm] = useState({
    external_id: '',
    description: '',
  });

  const handleAddManualSource = async () => {
    const externalId = manualSourceForm.external_id.trim();
    const description = manualSourceForm.description.trim();

    if (!externalId) {
      showSwal('error', 'External ID is required');
      return;
    }

    if (!description) {
      showSwal('error', 'Description is required');
      return;
    }

    if (!selectedServerData?.integration_id) {
      showSwal('error', 'Please select a server first');
      return;
    }

    const payload = {
      integration_id: selectedServerData.integration_id,
      is_active: selectedServerData.is_active ?? true,
      integration_event_sources: [
        {
          source_type: 'CameraCCTV',
          external_id: externalId,
          description,
          is_active: true,
          integration_event_subscriptions: [
            {
              event_type: 'CameraCapture',
              is_active: true,
            },
          ],
        },
      ],
    };

    try {
      await createIntegrationEventInstance(payload);

      showSwal('success', 'Successfully added source');

      setManualSourceForm({
        external_id: '',
        description: '',
      });

      setOpenAddSource(false);

      await fetchIntegrationInstance();

      await loadSource();
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.msg ?? error?.response?.data?.message ?? 'Failed to add source',
      );
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Event Subscriptions" description="Integration page">
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
                {integrations.map((item: any) => {
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
                  {filteredServers.map((server: any) => {
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

                          {/* <StatusDot online={server.is_active} /> */}
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
            {/* =================================================
                2. Source
            ================================================= */}
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e4e8ee',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: '12px !important' }}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <SectionTitle
                    number={2}
                    title="Select Source"
                    subtitle="Choose source from the selected server."
                  />
                  {integration?.name?.toLowerCase().includes('ipsptek') && (
                    <Button
                      onClick={() => {
                        setManualSourceForm({
                          external_id: '',
                          description: '',
                        });
                        setOpenAddSource(true);
                      }}
                      variant="contained"
                    >
                      Add Source
                    </Button>
                  )}
                </Box>

                {/* Search + Show Selected */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <SearchField
                      placeholder="Search..."
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
                    onClick={() => setShowSelected((prev) => !prev)}
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

                {/* TABLE */}
                <Box
                  sx={{
                    border: '1px solid #edf0f3',
                    borderRadius: 0.8,
                    overflow: 'hidden',
                  }}
                >
                  {/* ================= HEADER ================= */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: sourceGridTemplate,
                      minHeight: 36,
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #edf0f3',
                      px: 0.5,
                    }}
                  >
                    {/* Select All */}
                    <Box>
                      {filteredCameras.length > 0 && (
                        <Checkbox
                          size="small"
                          sx={{
                            p: 0.3,
                          }}
                          checked={
                            filteredCameras.length > 0 &&
                            filteredCameras.every((camera) =>
                              selectedCameras.includes(getSourceId(camera)),
                            )
                          }
                          indeterminate={
                            filteredCameras.some((camera) =>
                              selectedCameras.includes(getSourceId(camera)),
                            ) &&
                            !filteredCameras.every((camera) =>
                              selectedCameras.includes(getSourceId(camera)),
                            )
                          }
                          onChange={() => {
                            const allSelected =
                              filteredCameras.length > 0 &&
                              filteredCameras.every((camera) =>
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
                    </Box>

                    {/* Dynamic Header */}
                    {sourceColumns.map((column) => (
                      <Typography
                        key={column}
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#344050',
                          px: 1,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {column === 'name'
                          ? 'Name'
                          : column === 'log_dev_id'
                            ? 'Log Dev Id'
                            : column === 'external_id'
                              ? 'External Id'
                              : column}
                      </Typography>
                    ))}
                  </Box>

                  {/* ================= BODY ================= */}
                  <Box
                    sx={{
                      minHeight: 450,
                      maxHeight: 450,
                      overflowY: 'auto',
                      overflowX: 'hidden',
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
                              gridTemplateColumns: sourceGridTemplate,
                              minHeight: 36,
                              alignItems: 'center',
                              px: 0.5,
                              borderBottom: '1px solid #f0f2f5',
                              backgroundColor: checked ? '#f4faff' : '#fff',
                            }}
                          >
                            {/* Checkbox */}
                            <Box>
                              <Checkbox
                                size="small"
                                checked={checked}
                                onChange={() => toggleCamera(cameraId)}
                                sx={{
                                  p: 0.3,
                                }}
                              />
                            </Box>

                            {/* Dynamic Columns */}
                            {sourceColumns.map((column) => {
                              const value = camera?.[column];

                              const displayValue =
                                value === null || value === undefined
                                  ? '-'
                                  : typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value);

                              return (
                                <Typography
                                  key={column}
                                  sx={{
                                    fontSize: 12,
                                    color: '#344050',
                                    px: 1,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={displayValue}
                                >
                                  {displayValue}
                                </Typography>
                              );
                            })}
                          </Box>
                        );
                      })
                    )}
                  </Box>
                </Box>

                {/* Selected Count */}
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
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  p: '12px !important',
                  minHeight: 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <SectionTitle
                    number={3}
                    title="Select Event Type"
                    subtitle="Choose event types to store for the selected source."
                  />
                </Stack>

                <Box sx={{ mb: 1 }}>
                  <SearchField
                    placeholder="Search event type..."
                    value={eventSearch}
                    onChange={setEventSearch}
                  />
                </Box>

                <Stack spacing={1.5}>
                  {selectedCameraData.map((camera) => {
                    const sourceId = getSourceId(camera);

                    const selectedEvents = selectedEventsBySource[sourceId] ?? [];

                    return (
                      <Box
                        key={sourceId}
                        sx={{
                          border: '1px solid #edf0f3',
                          borderRadius: 0.8,
                          overflow: 'hidden',
                        }}
                      >
                        {/* SOURCE HEADER */}
                        <Box
                          sx={{
                            px: 1,
                            py: 0.7,
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #edf0f3',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#344050',
                            }}
                          >
                            {camera.name ?? camera.description ?? camera.external_id}
                          </Typography>
                          {/* 
                          <Typography
                            sx={{
                              fontSize: 10,
                              color: '#8a94a3',
                            }}
                          >
                            {camera.external_id ?? camera.log_dev_id}
                          </Typography> */}
                        </Box>

                        {/* EVENT HEADER */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '34px 1fr',
                            minHeight: 29,
                            alignItems: 'center',
                            px: 0.5,
                            backgroundColor: '#fff',
                          }}
                        >
                          {/* <Checkbox
                            size="small"
                            sx={{ p: 0.3 }}
                            checked={
                              filteredEvents.length > 0 &&
                              filteredEvents.every((event) => selectedEvents.includes(event.name))
                            }
                            indeterminate={
                              filteredEvents.some((event) => selectedEvents.includes(event.name)) &&
                              !filteredEvents.every((event) => selectedEvents.includes(event.name))
                            }
                            onChange={() => {
                              const allSelected =
                                filteredEvents.length > 0 &&
                                filteredEvents.every((event) =>
                                  selectedEvents.includes(event.name),
                                );

                              setSelectedEventsBySource((prev) => ({
                                ...prev,
                                [sourceId]: allSelected
                                  ? selectedEvents.filter(
                                      (name) =>
                                        !filteredEvents.some((event) => event.name === name),
                                    )
                                  : [
                                      ...new Set([
                                        ...selectedEvents,
                                        ...filteredEvents.map((event) => event.name),
                                      ]),
                                    ],
                              }));
                            }}
                          /> */}
                          <Box></Box>

                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#6e7785',
                            }}
                          >
                            Event Type
                          </Typography>
                        </Box>

                        {/* EVENTS */}
                        {/* EVENTS */}
                        <Box
                          sx={{
                            maxHeight: 500,
                            overflow: 'auto',
                          }}
                        >
                          {integration?.name?.toLowerCase().includes('people tracking')
                            ? PEOPLE_TRACKING_EVENT_GROUPS.map((group) => {
                                const filteredValues = group.values.filter((value) =>
                                  value.toLowerCase().includes(eventSearch.toLowerCase()),
                                );

                                if (filteredValues.length === 0) {
                                  return null;
                                }

                                return (
                                  <Box key={group.label}>
                                    {/* GROUP HEADER */}
                                    <Box
                                      sx={{
                                        px: 1,
                                        py: 0.7,
                                        backgroundColor: '#f8fafc',
                                        borderTop: '1px solid #edf0f3',
                                        borderBottom: '1px solid #edf0f3',
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color: '#667181',
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        {group.label}
                                      </Typography>
                                    </Box>

                                    {/* GROUP VALUES */}
                                    {filteredValues.map((value) => {
                                      const checked = selectedEvents.includes(value);

                                      return (
                                        <Box
                                          key={value}
                                          sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '34px 1fr',
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
                                            onChange={() => toggleEvent(sourceId, value)}
                                            sx={{ p: 0.3 }}
                                          />

                                          <Typography
                                            sx={{
                                              fontSize: 12,
                                              color: '#344050',
                                            }}
                                          >
                                            {value}
                                          </Typography>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                );
                              })
                            : filteredEvents.map((event) => {
                                const checked = selectedEvents.includes(event.name);

                                return (
                                  <Box
                                    key={event.name}
                                    sx={{
                                      display: 'grid',
                                      gridTemplateColumns: '34px 1fr',
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
                                      onChange={() => toggleEvent(sourceId, event.name)}
                                      sx={{ p: 0.3 }}
                                    />

                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        color: '#344050',
                                      }}
                                    >
                                      {event.name}
                                    </Typography>
                                  </Box>
                                );
                              })}
                        </Box>
                      </Box>
                    );
                  })}
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
                        width: 50,
                        height: 50,
                        borderRadius: 0.7,
                        backgroundColor: '#e8f4ff',
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StorageOutlinedIcon sx={{ fontSize: 25 }} />
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
                        width: 50,
                        height: 50,
                        borderRadius: 0.7,
                        backgroundColor: '#e8f4ff',
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconVideo size={25} />
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
                          {camera.name}
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
                        width: 50,
                        height: 50,
                        borderRadius: 0.7,
                        backgroundColor: '#f0edff',
                        color: '#6554c0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconSquareCheckFilled size={25} />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 700,
                          mb: 0.3,
                        }}
                      >
                        Selected Event Types ({selectedEventData.length})
                      </Typography>

                      {selectedEventData.slice(0, 4).map((event, index) => (
                        <Typography
                          key={`${event.sourceId}-${event.name}-${index}`}
                          sx={{
                            fontSize: 12,
                            color: '#727d8b',
                            lineHeight: 1.4,
                          }}
                        >
                          {event.name}
                        </Typography>
                      ))}

                      {selectedEventData.length > 4 && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#6554c0',
                            lineHeight: 1.4,
                            fontWeight: 600,
                          }}
                        >
                          +{selectedEventData.length - 4} more
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </CardContent>
          </Card>

          <Stack direction="row" justifyContent="flex-end" spacing={0.8} sx={{ mt: 1.5 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
              onClick={() => {
                setSelectedCameras([]);
                // setSelectedEvents([]);
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
              onClick={handleSaveSubscription}
              size="medium"
              sx={{
                textTransform: 'none',
                borderRadius: 0.8,
                boxShadow: 'none',
                px: 2,
              }}
            >
              Save Subscription
            </Button>
          </Stack>
        </Box>

        <Dialog
          open={openAddSource}
          onClose={() => setOpenAddSource(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Add Source
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
              onClick={() => setOpenAddSource(false)}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="External ID"
                value={manualSourceForm.external_id}
                onChange={(e) =>
                  setManualSourceForm((prev) => ({
                    ...prev,
                    external_id: e.target.value,
                  }))
                }
              />

              <TextField
                fullWidth
                size="small"
                label="Description"
                value={manualSourceForm.description}
                onChange={(e) =>
                  setManualSourceForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenAddSource(false)}>Cancel</Button>

            <Button variant="contained" onClick={handleAddManualSource}>
              Add Source
            </Button>
          </DialogActions>
        </Dialog>

        <AddServerDialog
          open={openAddServer}
          serverForm={serverForm}
          // sourceTypeOptions={sourceTypeOptions}
          // parkingGroupTypeOptions={parkingGroupTypeOptions}
          // logdevOptions={logdevs}
          // isParking={integration?.name === 'Bio Parking System'}
          // isProwatch={integration?.name === 'Honeywell Prowatch'}
          // loadingLogdevs={loadingLogdevs}
          integrationOptions={addIntegrationOptions}
          loadingIntegrationOptions={loadingAddIntegrationOptions}
          onClose={handleCloseAddServer}
          onChange={setServerForm}
          onSubmit={handleSubmitAddServer}
        />
      </Container>
      <GlobalBackdropLoading open={isSubmitting} />
    </PageContainer>
  );
};

export default Content;
