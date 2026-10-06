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
  updateIntegrationEventInstance,
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
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
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

  const [preset, setPreset] = useState('Custom');

  /* -------------------------------------------------------
   * Filter
   * ----------------------------------------------------- */

  // const filteredEvents = useMemo(() => {
  //   return eventTypes.filter(
  //     (event) =>
  //       event.code.toLowerCase().includes(eventSearch.toLowerCase()) ||
  //       event.name.toLowerCase().includes(eventSearch.toLowerCase()),
  //   );
  // }, [eventSearch]);

  /* -------------------------------------------------------
   * Toggle
   * ----------------------------------------------------- */

  const toggleCamera = (cameraId: string) => {
    setSelectedCameras((current) =>
      current.includes(cameraId) ? current.filter((id) => id !== cameraId) : [...current, cameraId],
    );
  };

  // const toggleEvent = (eventCode: string) => {
  //   setSelectedEvents((current) =>
  //     current.includes(eventCode)
  //       ? current.filter((code) => code !== eventCode)
  //       : [...current, eventCode],
  //   );
  // };

  /* -------------------------------------------------------
   * Render
   * ----------------------------------------------------- */

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
      .flatMap((instance: any) => {
        const sources = instance.integration_event_sources ?? [];

        if (sources.length === 0) {
          return [
            {
              id: instance.id,
              instance_id: instance.id,
              integration_id: instance.integration_id,
              name: instance.integration?.name ?? instance.integration_id,
              address: '',
              source_type: '',
              is_active: instance.is_active,
            },
          ];
        }

        return sources.map((source: any) => ({
          id: source.id,
          instance_id: instance.id,
          integration_id: instance.integration_id,
          name: source.description,
          address: source.external_id,
          source_type: source.source_type,
          is_active: source.is_active,
        }));
      })
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

  useEffect(() => {
    if (!integration?.integration_list_id) {
      setAddIntegrationOptions([]);
      return;
    }

    const fetchIntegrationInstance = async () => {
      try {
        setLoadingAddIntegrationOptions(true);

        const response = await getIntegrationInstanceByIntegrationId(
          integration.integration_list_id,
        );

        setAddIntegrationOptions(response?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch integration options:', error);
        setAddIntegrationOptions([]);
      } finally {
        setLoadingAddIntegrationOptions(false);
      }
    };

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

  // const handleSubmitAddServer = async () => {
  //   if (!integration?.integration_list_id) {
  //     console.error('Integration is not selected');
  //     return;
  //   }
  //   if (!serverForm.source_type) {
  //     console.error('Source type is required');
  //     return;
  //   }

  //   if (!serverForm.external_id) {
  //     console.error('External ID is required');
  //     return;
  //   }

  //   const payload = {
  //     integration_id: selectedServerData.integration_id ?? selectedServerData.id,
  //     is_active: serverForm.is_active,
  //     integration_event_sources: [
  //       {
  //         source_type: serverForm.source_type,
  //         external_id: serverForm.external_id,
  //         description: serverForm.description,
  //         is_active: serverForm.is_active,
  //         integration_event_subscriptions: serverForm.integration_event_subscriptions,
  //       },
  //     ],
  //   };

  //   setLoadingIntegrationInstances(true);
  //   try {
  //     await createIntegrationEventInstance(payload);

  //     setServerForm({
  //       source_type: '',
  //       external_id: '',
  //       description: '',
  //       is_active: true,
  //       integration_event_subscriptions: [],
  //     });

  //     // Tutup dialog
  //     setOpenAddServer(false);
  //   } catch (error: any) {
  //     showSwal('error', error?.response?.data?.msg || 'Failed to add integration server');
  //   } finally {
  //     setLoadingIntegrationInstances(false);
  //   }
  // };

  const handleSubmitAddServer = async () => {
    // if (!integration?.integration_list_id) {
    //   console.error('Integration is not selected');
    //   showSwal('error', 'Please select an integration');
    //   return;
    // }

    // if (!serverForm.source_type) {
    //   console.error('Source type is required');
    //   showSwal('error', 'Source type is required');
    //   return;
    // }

    // if (!serverForm.external_id) {
    //   console.error('External ID is required');
    //   showSwal('error', 'External ID is required');
    //   return;
    // }

    const payload = {
      integration_id: serverForm.integration_id,
      is_active: serverForm.is_active,
      // integration_event_sources: [
      //   {
      //     source_type: serverForm.source_type,
      //     external_id: serverForm.external_id,
      //     description: serverForm.description,
      //     is_active: serverForm.is_active,
      //     integration_event_subscriptions: serverForm.integration_event_subscriptions,
      //   },
      // ],
    };

    try {
      await createIntegrationEventInstance(payload);
      showSwal('success', 'Integration server added successfully');

      setServerForm({
        integration_id: '',
        source_type: '',
        external_id: '',
        description: '',
        is_active: true,
        integration_event_subscriptions: [],
      });

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

  const handleSaveSubscription = async () => {
    if (!selectedServerData?.integration_id) {
      showSwal('error', 'Integration server is not selected');
      return;
    }

    const integrationId = selectedServerData.integration_id;

    const integrationEventSources = selectedCameraData.map((camera) => {
      const sourceId = getSourceId(camera);

      const selectedEvents = selectedEventsBySource[sourceId] ?? [];

      return {
        // source_type: camera.source_type || selectedServerData.source_type || '',
        source_type: integration?.sourceType?.[0] ?? '',
        external_id: camera.external_id ?? camera.log_dev_id,
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

    console.log('CREATE PAYLOAD:', payload);

    try {
      await createIntegrationEventInstance(payload);

      showSwal('success', 'Integration subscription created successfully');
      resetForm();
    } catch (error: any) {
      console.error(error);

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

  const getEventTypeOptions = (integration?: Integration | null) => {
    const integrationName = integration?.name?.toLowerCase() ?? '';

    if (integrationName.includes('prowatch')) {
      return [
        {
          label: 'Tap Reader',
          value: 'TapReader',
        },
      ];
    }

    if (integrationName.includes('ipsotek') || integrationName.includes('ipsptek')) {
      return [
        {
          label: 'Camera Capture',
          value: 'CameraCapture',
        },
      ];
    }

    if (integrationName.includes('people tracking')) {
      return [
        { label: 'Idle', value: 'Idle' },
        { label: 'Ack', value: 'Ack' },
        { label: 'Dispatch', value: 'Dispatch' },
        { label: 'Accepted', value: 'Accepted' },
        { label: 'Done', value: 'Done' },
      ];
    }

    return (
      integration?.event_type?.map((eventType) => ({
        label: eventType,
        value: eventType,
      })) ?? []
    );
  };

  const sourceTypeOptions = getSourceTypeOptions(integration);
  const eventTypeOptions = getEventTypeOptions(integration);

  const parkingGroupTypeOptions = [
    { label: 'Employee', value: 'employee' },
    { label: 'Resident', value: 'resident' },
    { label: 'Visitor', value: 'visitor' },
    { label: 'Vendor', value: 'vendor' },
  ];

  // const sourceColumns = useMemo(() => {
  //   const keys = new Set<string>();

  //   cameras.forEach((camera) => {
  //     Object.keys(camera ?? {}).forEach((key) => {
  //       keys.add(key);
  //     });
  //   });

  //   return Array.from(keys);
  // }, [cameras]);

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

  useEffect(() => {
    const loadSource = async () => {
      if (!selectedSourceServer?.instance_id) {
        setCameras([]);
        return;
      }

      const integrationName = integration.name.toLowerCase();
      const instanceId = selectedServerData?.integration_id ?? selectedSourceServer?.integration_id;

      try {
        setLoadingCameras(true);

        let response;

        if (integrationName.includes('ipsotek') || integrationName.includes('ipsptek')) {
          response = await getSourceIpsotek(instanceId);
        } else if (integrationName.includes('prowatch')) {
          response = await getSourceHoneywell(instanceId);
        } else if (integrationName.includes('parking')) {
          // response = await getSourceParking(instanceId);
          response = await getVisitorTypeParking(instanceId);
        } else if (integrationName.includes('people tracking')) {
          // response = await getSourceTrackingBle(instanceId);
          // response = await getSourceTrackingBle(instanceId);

          // const collection = response?.collection ?? [];

          // setCameras(
          //   collection.filter((item: any) =>
          //     ['Member', 'Visitor', 'Security'].includes(item.name),
          //   ),
          // );

          setCameras([
            {
              id: 'Member',
              name: 'Member',
              // external_id: 'Member',
              // source_type: 'Event',
            },
            {
              id: 'Visitor',
              name: 'Visitor',
              // external_id: 'Visitor',
              // source_type: 'Event',
            },
            {
              id: 'Security',
              name: 'Security',
              // external_id: 'Security',
              // source_type: 'Event',
            },
          ]);

          return;
        } else {
          setCameras([]);
          return;
        }

        // console.log('SOURCE:', response);

        setCameras(response?.collection ?? []);
      } catch (error) {
        console.error('Failed get source:', error);
        setCameras([]);
      } finally {
        setLoadingCameras(false);
      }
    };

    loadSource();
  }, [selectedSourceServer?.integration_id, integration?.name]);

  // const { data: logdevs = [], isLoading: loadingLogdevs } = useLogdevs(
  //   selectedServerData?.integration_id,
  //   integration?.name === 'Honeywell Prowatch',
  // );
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
      values: ['Idle', 'Ack', 'Dispatch', 'Accepted', 'Done'],
    },
    {
      label: 'Alarm',
      values: ['Card Access', 'Wrong Zone'],
    },
    {
      label: 'Priority',
      values: ['High', 'Critical'],
    },
  ];

  const filteredEvents = useMemo(() => {
    const integrationName = integration?.name?.toLowerCase() ?? '';

    let events: string[];

    if (integrationName.includes('people tracking')) {
      events = ['Idle', 'Ack', 'Dispatch', 'Accepted', 'Done'];
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

  const eventTypes = useMemo(() => {
    return (integration?.event_type ?? []).map((eventType) => ({
      name: eventType,
    }));
  }, [integration?.event_type]);

  const selectedEventData = selectedCameraData.flatMap((camera) => {
    const sourceId = getSourceId(camera);
    const selectedEvents = selectedEventsBySource[sourceId] ?? [];

    return selectedEvents.map((eventName) => ({
      sourceId,
      sourceName: camera.name ?? camera.description ?? camera.external_id ?? camera.log_dev_id,
      name: eventName,
    }));
  });

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

                          <StatusDot online={server.is_active} />
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* =================================================
                2. Source Type
            ================================================= */}
            {/*      <Stack
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
                </Stack>  */}

            <Card
              elevation={0}
              sx={{
                border: '1px solid #e4e8ee',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: '12px !important' }}>
                <SectionTitle
                  number={2}
                  title="Select Camera (Source)"
                  subtitle="Choose cameras from the selected server."
                />

                {/* Search + Show Selected */}
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
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: '12px !important' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <SectionTitle
                    number={3}
                    title="Select Event Type"
                    subtitle="Choose event types to store for the selected cameras."
                  />

                  {/* <FormControl
                    size="small"
                    sx={{
                      width: 105,
                      mt: -0.2,
                    }}
                  >
                    <InputLabel sx={{ fontSize: 12 }}>Select Preset</InputLabel>

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
                  </FormControl> */}
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
                            maxHeight: 320,
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

                        {/* <Chip
                          label="Online"
                          size="small"
                          sx={{
                            height: 17,
                            fontSize: 8,
                            backgroundColor: '#e4f7ee',
                            color: '#13905b',
                          }}
                        /> */}
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
