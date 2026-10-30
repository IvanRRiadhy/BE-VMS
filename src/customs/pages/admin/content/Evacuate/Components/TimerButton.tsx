import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  List,
  Divider,
  ListItem,
  ListItemAvatar,
  Avatar,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
} from '@mui/material';
import { AppDispatch, useDispatch } from 'src/store/Store';
import { setEvacuationState } from 'src/store/customizer/CustomizerSlice';
import { useMediaQuery } from '@mui/system';
import { IconX } from '@tabler/icons-react';
import { endEvacuate, startEvacuate } from 'src/customs/api/Admin/Evacuate';
import { useSites } from 'src/hooks/Sites/useSites';
import GlobalBackdropLoading from '../../../components/GlobalBackdrop';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { useAssemblyPointPagination } from 'src/hooks/AssemblyPoint/useAssemblyPointPagination';

const STORAGE_KEY = 'evac-timer-state';

type EvacState = 'idle' | 'running' | 'finished';

interface PersistedState {
  evacState: EvacState;
  ms: number; // For finished state
  startTime: number | null; // Timestamp when running started
  pausedMs?: number; // For future: support pause/resume
}
const evacuatedVisitors = [
  {
    id: 1,
    name: 'John Doe',
    cardNumber: '12567890',
    faceUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
    evacuatedArea: 'Assembly Point A',
    timestamp: '2025-07-27 08:51:32',
  },
  {
    id: 2,
    name: 'Ayu Putri',
    cardNumber: '87893421',
    faceUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    evacuatedArea: 'Assembly Point B',
    timestamp: '2025-07-27 08:50:58',
  },
  {
    id: 3,
    name: 'John Doe',
    cardNumber: '12567890',
    faceUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
    evacuatedArea: 'Assembly Point A',
    timestamp: '2025-07-27 08:51:32',
  },
  {
    id: 4,
    name: 'Ayu Putri',
    cardNumber: '87893421',
    faceUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    evacuatedArea: 'Assembly Point B',
    timestamp: '2025-07-27 08:50:58',
  },
  {
    id: 5,
    name: 'John Doe',
    cardNumber: '12567890',
    faceUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
    evacuatedArea: 'Assembly Point A',
    timestamp: '2025-07-27 08:51:32',
  },
  {
    id: 6,
    name: 'Ayu Putri',
    cardNumber: '87893421',
    faceUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    evacuatedArea: 'Assembly Point B',
    timestamp: '2025-07-27 08:50:58',
  },
  {
    id: 7,
    name: 'John Doe',
    cardNumber: '12567890',
    faceUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
    evacuatedArea: 'Assembly Point A',
    timestamp: '2025-07-27 08:51:32',
  },
  {
    id: 8,
    name: 'Ayu Putri',
    cardNumber: '87893421',
    faceUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    evacuatedArea: 'Assembly Point B',
    timestamp: '2025-07-27 08:50:58',
  },
  {
    id: 9,
    name: 'John Doe',
    cardNumber: '12567890',
    faceUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
    evacuatedArea: 'Assembly Point A',
    timestamp: '2025-07-27 08:51:32',
  },
  {
    id: 10,
    name: 'Ayu Putri',
    cardNumber: '87893421',
    faceUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    evacuatedArea: 'Assembly Point B',
    timestamp: '2025-07-27 08:50:58',
  },
  {
    id: 11,
    name: 'John Doe',
    cardNumber: '12567890',
    faceUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
    evacuatedArea: 'Assembly Point A',
    timestamp: '2025-07-27 08:51:32',
  },
  {
    id: 12,
    name: 'Ayu Putri',
    cardNumber: '87893421',
    faceUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
    evacuatedArea: 'Assembly Point B',
    timestamp: '2025-07-27 08:50:58',
  },
];

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    // HH:MM:SS:MS (always 2 digit)
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}:${centis.toString().padStart(2, '0')}`;
  } else {
    // MM:SS:MS (always 2 digit)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${centis
      .toString()
      .padStart(2, '0')}`;
  }
};

const TimerButton: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [evacState, setEvacState] = useState<EvacState>('idle');
  const [ms, setMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  // const { data: sites } = useSites();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const {
    data: sites,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAssemblyPointPagination({
    page,
    rowsPerPage,
    sortDir: 'desc',
    searchKeyword: search,
  });

  // Restore from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved: PersistedState = JSON.parse(raw);
        if (saved.evacState === 'running' && saved.startTime) {
          setStartTime(saved.startTime);
          setEvacState('running');
        } else {
          setMs(saved.ms || 0);
          setEvacState(saved.evacState);
        }
      } catch (e) {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (evacState === 'running') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ evacState, startTime, ms: 0 }));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ evacState, startTime: null, ms }));
    }
  }, [evacState, ms, startTime]);

  // Core timer: always use system time
  useEffect(() => {
    let animationFrame: number;

    const update = () => {
      if (evacState === 'running' && startTime) {
        setMs(Date.now() - startTime);
        animationFrame = requestAnimationFrame(update);
      }
    };

    if (evacState === 'running' && startTime) {
      animationFrame = requestAnimationFrame(update);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [evacState, startTime]);

  const handleButtonClick = () => {
    if (evacState === 'idle') {
      setOpenConfirm(true);
    } else if (evacState === 'running') {
      setOpenFinishDialog(true);
    }
  };
  // const handleConfirmEvacuate = () => {
  //   const now = Date.now();
  //   setStartTime(now);
  //   setMs(0);
  //   setEvacState('running');
  //   setOpenConfirm(false);
  //   dispatch(setEvacuationState('running'));
  // };
  const handleCancelEvacuate = () => {
    setOpenConfirm(false);
  };

  const handleReset = () => {
    setEvacState('idle');
    setMs(0);
    setStartTime(null);

    localStorage.removeItem(STORAGE_KEY);
  };

  const theme = useTheme();
  const lg = useMediaQuery(theme.breakpoints.up('lg'));

  // const [evacuatedVisitors, setEvacuatedVisitors] = useState<any[]>([]);

  const [evacuateForm, setEvacuateForm] = useState({
    site_id: '',
    emergency_type: '',
    initial_notes: '',
  });

  const [loadingEvacuate, setLoadingEvacuate] = useState(false);

  const handleEvacuateChange = (field: keyof typeof evacuateForm, value: string) => {
    setEvacuateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [evacuateEventId, setEvacuateEventId] = useState<string | null>(null);

  const handleConfirmEvacuate = async () => {
    try {
      setLoadingEvacuate(true);

      const payload = {
        ...(evacuateForm.site_id && {
          site_id: evacuateForm.site_id,
        }),
        emergency_type: evacuateForm.emergency_type,
        initial_notes: evacuateForm.initial_notes,
      };

      const response = await startEvacuate(payload);
      const eventId = response.collection?.event_id;
      const now = Date.now();

      setStartTime(now);
      setMs(0);
      setEvacuateEventId(eventId);
      setEvacState('running');
      dispatch(setEvacuationState('running'));

      setOpenConfirm(false);

      setEvacuateForm({
        site_id: '',
        emergency_type: '',
        initial_notes: '',
      });

      // Jika diperlukan, tampilkan notifikasi sukses
      // enqueueSnackbar('Evacuation alarm triggered successfully', {
      //   variant: 'success',
      // });
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message ?? 'Failed to start evacuate');
      // Tampilkan notifikasi error jika menggunakan Snackbar
    } finally {
      setLoadingEvacuate(false);
    }
  };

  const [openFinishDialog, setOpenFinishDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [finishForm, setFinishForm] = useState({
    resolved_by_name: '',
    emergency_type: '',
    summary_notes: '',
  });

  const emergencyTypes = [
    'Evacuate',
    'FireAlarm',
    'Earthquake',
    'Flood',
    'GasLeak',
    'BombThreat',
    'PowerOutage',
    'MedicalEmergency',
    'Drill',
    'Other',
  ];

  const handleFinishEvacuation = async () => {
    // if (!evacuateEventId) {
    //   showSwal('error', 'Evacuation event ID not found');
    //   return;
    // }

    // if (!finishForm.resolved_by_name.trim()) {
    //   showSwal('warning', 'Please enter the resolved by name');
    //   return;
    // }

    try {
      setIsSubmitting(true);

      const payload = {
        evacuate_event_id: evacuateEventId,
        resolved_by_name: finishForm.resolved_by_name,
        emergency_type: finishForm.emergency_type,
        summary_notes: finishForm.summary_notes,
      };

      await endEvacuate(payload);

      setMs(startTime ? Date.now() - startTime : ms);
      setStartTime(null);
      setEvacState('finished');
      dispatch(setEvacuationState('finished'));

      setOpenFinishDialog(false);
      showSwal('success', 'Evacuation successfully completed');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message ?? 'Failed to complete evacuation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSite = useMemo(
    () => sites?.collection?.find((site) => site.id === evacuateForm.site_id) ?? null,
    [sites?.collection, evacuateForm.site_id],
  );

  return (
    <>
      {evacState === 'running' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'alarmFlash 0.8s infinite alternate',

            background: `
        radial-gradient(circle at top left, rgba(255,0,0,0.35), transparent 45%),
        radial-gradient(circle at top center, rgba(255,0,0,0.35), transparent 45%),
        radial-gradient(circle at top right, rgba(255,0,0,0.35), transparent 45%),
        radial-gradient(circle at bottom left, rgba(255,0,0,0.35), transparent 45%),
        radial-gradient(circle at bottom center, rgba(255,0,0,0.35), transparent 45%),
        radial-gradient(circle at bottom right, rgba(255,0,0,0.35), transparent 45%)
      `,

            '@keyframes alarmFlash': {
              from: { opacity: 0.3 },
              to: { opacity: 0.8 },
            },
          }}
        />
      )}

      <Card
        sx={{
          // minWidth: 340,
          maxWidth: lg ? '340' : '100%',
          minHeight: '100vh',
          // maxWidth: '100vh',
          overflow: 'hidden',
          p: 3,
          borderRadius: 4,
          boxShadow: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#fff',
          // mx: 2,
        }}
      >
        <CardContent sx={{ width: '100%', textAlign: 'center', pb: 0 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            mb={5}
            sx={{
              fontSize: '4rem',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              // width: '14ch',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 2,

              userSelect: 'none',
              mx: 'auto',
            }}
          >
            {formatTime(ms)}
          </Typography>
          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              onClick={handleButtonClick}
              sx={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                fontSize: 25,
                fontWeight: 700,
                background:
                  evacState === 'idle'
                    ? '#1976d2'
                    : evacState === 'running'
                      ? '#ff5252'
                      : '#43a047',
                color: '#fff',
                boxShadow: 4,
                '&:hover': {
                  background:
                    evacState === 'idle'
                      ? '#1565c0'
                      : evacState === 'running'
                        ? '#e53935'
                        : '#388e3c',
                },
              }}
              disabled={evacState === 'finished'}
            >
              {evacState === 'idle' ? 'Evacuate' : evacState === 'running' ? 'Finish' : 'Finished'}
            </Button>
            {evacState === 'finished' && (
              <Button
                onClick={handleReset}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  fontSize: 18,
                  fontWeight: 700,
                  background: '#757575',
                  color: '#fff',
                  boxShadow: 2,
                  alignSelf: 'center',
                  '&:hover': {
                    background: '#424242',
                  },
                }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </CardContent>
        {/* Warning Dialog */}

        {/* Warning Dialog */}
        <Dialog open={openConfirm} onClose={handleCancelEvacuate} fullWidth maxWidth="sm">
          <DialogTitle>
            Start Evacuation?
            <IconButton
              aria-label="close"
              onClick={handleCancelEvacuate}
              disabled={loadingEvacuate}
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
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Please provide the details below before starting the evacuation alarm.
              </Typography>

              {/* Site */}
              <FormControl fullWidth required>
                <Autocomplete
                  options={sites?.collection ?? []}
                  value={selectedSite}
                  getOptionLabel={(option) => option.site_name ?? ''}
                  isOptionEqualToValue={(option, value) => option.site_id === value.site_id}
                  onChange={(_, newValue) =>
                    handleEvacuateChange('site_id', newValue?.site_id ?? '')
                  }
                  renderInput={(params) => <TextField {...params} placeholder="Select site" />}
                />
              </FormControl>

              {/* Emergency Type */}
              <FormControl fullWidth>
                <InputLabel id="evacuate-type-label">Emergency Type</InputLabel>
                <Select
                  labelId="evacuate-type-label"
                  id="evacuate-type"
                  value={evacuateForm.emergency_type}
                  label="Emergency Type"
                  onChange={(event) => handleEvacuateChange('emergency_type', event.target.value)}
                >
                  <MenuItem value="FireAlarm">Fire Alarm</MenuItem>
                  <MenuItem value="Earthquake">Earthquake</MenuItem>
                  <MenuItem value="Flood">Flood</MenuItem>
                  <MenuItem value="GasLeak">Gas Leak</MenuItem>
                  <MenuItem value="BombThreat">Bomb Threat</MenuItem>
                  <MenuItem value="PowerOutage">Power Outage</MenuItem>
                  <MenuItem value="MedicalEmergency">Medical Emergency</MenuItem>
                  <MenuItem value="Drill">Drill</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              {/* Initial Notes */}
              <TextField
                label="Initial Notes"
                placeholder="Enter evacuation details or additional information..."
                value={evacuateForm.initial_notes}
                onChange={(event) => handleEvacuateChange('initial_notes', event.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCancelEvacuate}
              variant="outlined"
              color="inherit"
              disabled={loadingEvacuate}
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirmEvacuate}
              color="error"
              variant="contained"
              disabled={loadingEvacuate}
            >
              {loadingEvacuate ? 'Starting...' : 'Yes, Start Evacuation'}
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 2, width: '100%' }}>
          <List disablePadding sx={{ width: '100%', border: '1px solid #ccc', borderRadius: 2 }}>
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ px: 2, mb: 1, textAlign: 'left' }}
              >
                Confirmed Evacuated Visitor
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                  maxHeight: { xs: '100%', lg: '630px' },
                  overflow: 'auto',
                }}
              >
                <Table size="small" stickyHeader aria-label="evacuated visitor table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left" sx={{ fontWeight: 700, width: 140 }}>
                        Visitor
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 140 }}>
                        Evacuated Area
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evacuatedVisitors.map((visitor) => (
                      <TableRow key={visitor.id} hover>
                        <TableCell
                          align="left"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRight: '1px solid #eee',
                          }}
                        >
                          <Avatar
                            src={visitor.faceUrl}
                            alt={visitor.name}
                            sx={{ width: 38, height: 38, mr: 1 }}
                          />
                          <Box>
                            <Typography fontWeight={700} fontSize={16} align="left">
                              {visitor.name}
                            </Typography>
                            <Typography fontSize={12} color="text.secondary" align="left">
                              Card #{visitor.cardNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ width: 140 }}>
                          <Typography fontSize={15} fontWeight={500} color="primary.main">
                            {visitor.evacuatedArea}
                          </Typography>
                          <Typography fontSize={12} color="text.disabled">
                            {visitor.timestamp}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {evacuatedVisitors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: 'text.disabled' }}>
                          No confirmed evacuated visitors.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </List>
        </Box>
        <Dialog
          open={openFinishDialog}
          onClose={() => setOpenFinishDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Complete Evacuation
            <IconButton
              aria-label="close"
              onClick={() => setOpenFinishDialog(false)}
              disabled={loadingEvacuate}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  placeholder="Enter your name"
                  value={finishForm.resolved_by_name}
                  onChange={(e) =>
                    setFinishForm((prev) => ({
                      ...prev,
                      resolved_by_name: e.target.value,
                    }))
                  }
                />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Type Emergency</CustomFormLabel>
                <CustomTextField
                  select
                  fullWidth
                  label=""
                  value={finishForm.emergency_type}
                  onChange={(e) =>
                    setFinishForm((prev) => ({
                      ...prev,
                      emergency_type: e.target.value,
                    }))
                  }
                  required
                >
                  {emergencyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Notes (Optional)</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Summary Notes"
                  placeholder="Enter evacuation summary or notes..."
                  value={finishForm.summary_notes}
                  onChange={(e) =>
                    setFinishForm((prev) => ({
                      ...prev,
                      summary_notes: e.target.value,
                    }))
                  }
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setOpenFinishDialog(false)}
              color="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleFinishEvacuation}
              disabled={isSubmitting || !finishForm.resolved_by_name.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Evacuation'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
      <GlobalBackdropLoading open={loadingEvacuate || isSubmitting} />
    </>
  );
};

export default TimerButton;
