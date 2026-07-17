import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  Tooltip,
  useTheme,
  Skeleton,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import { deleteTimezone, getAllTimezone, getTimezoneById } from 'src/customs/api/admin';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import FormTimezone from './FormTimezone';
import { useDebounce } from 'src/hooks/useDebounce';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import { IconClock } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useTranslation } from 'react-i18next';
import { useTimezone } from 'src/hooks/Timezone/useTimezone';
import { useTimezoneMutation } from 'src/hooks/Timezone/useTimezoneMutation';
import { IconSearch } from '@tabler/icons-react';
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



const Content = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const secdrawerWidth = 260;
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  // const [timezoneData, setTimezoneData] = useState<Item[] | null>([]);
  const { t } = useTranslation();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await getAllTimezone();
  //       setTimezoneData(res.collection ?? []);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [refreshTrigger]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTimezone({
    search: debounceSearch,
  });

  // const filtered = data?.filter((v) =>
  //   v.name.toLowerCase().includes(debounceSearch.toLowerCase()),
  // );

  const timezoneData =
    data?.pages.flatMap((page) => page.collection) ?? [];

  const [selectedTimezone, setSelectedTimezone] = useState<any | null>(null);

  const { deleteMutation } = useTimezoneMutation();

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete('Are you sure you want to delete this time access?');
    if (confirmed) {

      try {
        // await deleteTimezone(id);
        await deleteMutation.mutateAsync(id);

        showSwal('success', 'Time Access has been deleted.');
        setSelectedTimezone(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSelect = async (id: string) => {
    try {
      const res = await getTimezoneById(id);
      const mapped = mapApiToDaySchedule(res.collection);
      setSelectedTimezone(mapped);
      setMode('edit');
      setShowForm(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Time Access" description="Manage Timezone">
        <Box
          sx={{
            display: 'flex',
            flexDirection: mdUp ? 'row' : 'column',
            bgcolor: 'background.paper',
            height: {
              xs: 'auto',
              md: 'calc(100vh - 140px)',
            },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: mdUp ? secdrawerWidth : '100%',
              borderRight: '1px solid #eee',
              p: 2,
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontSize="1rem">
                {t('navigation.timeaccess')}
              </Typography>
              <Tooltip title="Add Time Access" arrow>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setMode('create');
                    setSelectedTimezone(null);
                    setShowForm(true);
                  }}
                  startIcon={<IconPlus />}
                >
                  {t('add')}
                </Button>
              </Tooltip>
            </Box>
            <CustomTextField
              fullWidth
              size="small"
              placeholder={t('searchTimeAccess') + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                pr: 1,
                maxHeight: {
                  xs: 320,
                  sm: 400,
                  md: 'calc(100vh - 220px)',
                },
              }}
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Skeleton variant="circular" width={36} height={36} />

                      <Box flex={1}>
                        <Skeleton width="60%" height={22} />
                        <Skeleton width="90%" height={18} />
                      </Box>

                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </Box>
                ))
              ) : timezoneData && timezoneData.length > 0 ? (
                timezoneData.map((v) => {
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
                        backgroundColor: isActive ? 'primary.main' : 'background.paper',
                        color: isActive ? '#fff' : 'inherit',
                        '&:hover': {
                          backgroundColor: isActive ? 'primary.dark' : '#f5f5f5',
                        },
                        boxShadow: (theme) => theme.shadows[10],
                      }}
                      onClick={() => handleSelect(v.id)}
                    >
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box display="flex" alignItems="center">
                            <IconClock size={20} color={isActive ? '#fff' : '#000'} />
                          </Box>

                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {v.name}
                            </Typography>
                            <Typography variant="body2">{v.description}</Typography>
                          </Box>
                        </Box>
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
                        <Tooltip title={t('delete')} arrow>
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
              {hasNextPage && (
                <Box display="flex" justifyContent="center" py={2}>
                  <Button
                    variant="outlined"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    fullWidth
                  >
                    {isFetchingNextPage ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1 }} />

                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </Box>
              )}
              {/* {!hasNextPage && timezoneData.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  textAlign="center"
                  py={2}
                >
                  No more data
                </Typography>
              )} */}
            </Box>
          </Box>

          <Box flexGrow={1} p={3} sx={{ overflow: 'hidden', height: { xs: 'auto', xl: '88vh' } }}>
            {showForm ? (
              <FormTimezone
                key={mode === 'edit' ? selectedTimezone?.id : 'create'}
                mode={mode}
                initialData={mode === 'edit' ? selectedTimezone : null}
                onSuccess={() => {

                }}
              />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="text.secondary">
                  Select a Time Access or click <b>Add</b> to create a new one.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;

function mapApiToDaySchedule(apiData: any) {
  if (!apiData) return null;

  return {
    id: apiData.id,
    name: apiData.name,
    description: apiData.description,
    days: daysOfWeek.map((day) => {
      const key = dayKeyMap[day];
      const start = apiData[key];
      const end = apiData[key + '_end'];

      if (typeof start !== 'string' || typeof end !== 'string') {
        return {
          id: `day-${day}`,
          day,
          hours: [],
        };
      }

      return {
        id: `day-${day}`,
        day,
        hours: [
          {
            id: `block-${day}`,
            startTime: start.substring(0, 5),
            endTime: end.substring(0, 5),
          },
        ],
      };
    }),
  };
}