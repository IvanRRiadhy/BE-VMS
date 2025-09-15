import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  TextField,
  DialogActions,
  Typography,
  useMediaQuery,
  Tooltip,
  useTheme,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CloseIcon from '@mui/icons-material/Close';
import TimeGridSelector from 'src/customs/components/GridSelector/TimeGridSelector';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Item } from 'src/customs/api/models/Timezone';
import { deleteTimezone, getAllTimezone, getTimezoneById } from 'src/customs/api/admin';
import { IconTrash } from '@tabler/icons-react';
import { showConfirmDelete, showSuccessAlert } from 'src/customs/components/alerts/alerts';
import FormTimezone from './FormTimezone';
import { useDebounce } from 'src/hooks/useDebounce';
import bg_nodata from '../../../../../assets/images/backgrounds/bg_nodata.svg';
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const dayKeyMap: Record<string, string> = {
  Sun: 'sunday',
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
  Sat: 'saturday',
};

function mapApiToDaySchedule(apiData: any) {
  if (!apiData) return null;

  return {
    id: apiData.id,
    name: apiData.name,
    description: apiData.description,
    days: daysOfWeek.map((day) => {
      const key = dayKeyMap[day]; // "sunday", "monday", dst
      const start = apiData[key];
      const end = apiData[key + '_end'];

      // console.log('Mapping', day, '->', key, start, end); // DEBUG

      return {
        id: `day-${day}`,
        day,
        hours:
          start !== null && end !== null
            ? [
                {
                  id: `block-${day}`,
                  startTime: start.substring(0, 5), // "00:00"
                  endTime: end.substring(0, 5), // "06:00"
                },
              ]
            : [],
      };
    }),
  };
}

const Content = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const secdrawerWidth = 260;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

  const { token } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [timezoneData, setTimezoneData] = useState<Item[] | null>([]);

  useEffect(() => {
    if (!token) return;

    try {
      setLoading(true);
      const fetchData = async () => {
        const res = await getAllTimezone(token);
        setTimezoneData(res.collection ?? []);
      };

      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [token, refreshTrigger]);

  const filtered = timezoneData?.filter((v) =>
    v.name.toLowerCase().includes(debounceSearch.toLowerCase()),
  );

  const [selectedTimezone, setSelectedTimezone] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('selectedTimezone');
    if (saved) {
      try {
        setSelectedTimezone(JSON.parse(saved));
      } catch (err) {
        console.error('Parse failed:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedTimezone) {
      localStorage.setItem('selectedTimezone', JSON.stringify(selectedTimezone));
    } else {
      localStorage.removeItem('selectedTimezone');
    }
  }, [selectedTimezone]);

  // useEffect(() => {
  //   const savedTz = localStorage.getItem('selectedTimezone');
  //   const savedSearch = localStorage.getItem('timezoneSearch');
  //   if (savedTz) setSelectedTimezone(JSON.parse(savedTz));
  //   if (savedSearch) setSearch(savedSearch);
  // }, []);

  // // save
  // useEffect(() => {
  //   if (selectedTimezone) {
  //     localStorage.setItem('selectedTimezone', JSON.stringify(selectedTimezone));
  //   } else {
  //     localStorage.removeItem('selectedTimezone');
  //   }
  //   localStorage.setItem('timezoneSearch', search);
  // }, [selectedTimezone, search]);

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure you want to delete this timezone?');
    if (confirmed) {
      setLoading(true);
      try {
        await deleteTimezone(token, id);
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', 'Time Access has been deleted.');
        setSelectedTimezone(null);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleSelect = async (id: string) => {
    if (!token) return;
    try {
      const res = await getTimezoneById(token, id);
      const mapped = mapApiToDaySchedule(res.collection);
      setSelectedTimezone(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <PageContainer title="Timezone" description="Manage Timezone">
        <Box
          sx={{
            display: 'flex',
            flexDirection: mdUp ? 'row' : 'column', // 👉 row di desktop, column di mobile
            backgroundColor: '#fff',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* LEFT SIDEBAR (kecil) */}
          <Box
            sx={{
              width: mdUp ? secdrawerWidth : '100%', // fixed kecil
              borderRight: '1px solid #eee',
              p: 2,
              pt: 4,
              overflow: 'auto',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontSize="1rem">
                Time Access
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setSelectedTimezone(null);
                  localStorage.removeItem('timezoneFormDraft'); // ❌ hapus draft ketika klik add
                  setRefreshTrigger((x) => x + 1);
                }}
              >
                + Add
              </Button>
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search time access..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box>
              {filtered && filtered.length > 0 ? (
                filtered.map((v) => {
                  const isActive = selectedTimezone?.id === v.id;
                  return (
                    <Box
                      key={v.id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p={1}
                      mb={1}
                      border="1px solid"
                      borderColor={isActive ? 'primary.main' : '#ddd'}
                      borderRadius={1}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? '#fff' : 'inherit',
                        '&:hover': {
                          backgroundColor: isActive ? 'primary.dark' : '#f5f5f5',
                        },
                      }}
                      onClick={() => handleSelect(v.id)}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {v.name}
                        </Typography>
                        <Typography variant="body2">{v.description}</Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(v.id);
                        }}
                        sx={{
                          color: 'red',
                          backgroundColor: 'white !important',
                          '&:hover': { color: 'red !important' },
                        }}
                      >
                        <Tooltip title="Delete">
                          <IconTrash size={18} />
                        </Tooltip>
                      </IconButton>
                    </Box>
                  );
                })
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
                  <img src={bg_nodata} alt="No Data" style={{ width: '80px', height: '80px' }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                    No Data Found
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* RIGHT CONTENT (besar) */}
          <Box flexGrow={1} p={3} sx={{ overflow: 'auto' }}>
            {selectedTimezone ? (
              <FormTimezone
                key={selectedTimezone.id}
                mode="edit"
                initialData={selectedTimezone}
                onSuccess={() => setRefreshTrigger((x) => x + 1)}
              />
            ) : (
              <FormTimezone
                key={'create'}
                mode="create"
                onSuccess={() => setRefreshTrigger((x) => x + 1)}
              />
            )}
          </Box>
        </Box>
      </PageContainer>

      {/* Dialog Add Timezone */}
      {/* <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="xl">
        <DialogTitle>
          Add Timezone
          <IconButton
            aria-label="close"
            onClick={() => setOpenForm(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 3 }}>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name">
                  Name
                </CustomFormLabel>
                <CustomTextField type="text" id="name" fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 1 }} htmlFor="description">
                  Description
                </CustomFormLabel>
                <CustomTextField type="text" id="description" fullWidth />
              </Grid>
            </Grid>
            <Grid size={{ xs: 9 }}>
              <TimeGridSelector onSelectionChange={() => {}} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={() => setOpenForm(false)} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default Content;
