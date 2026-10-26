import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { IconCalendarEvent, IconCalendarTime, IconPlus } from '@tabler/icons-react';
import { IconFilterFilled } from '@tabler/icons-react';
import { IconSearch } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

type TransactionVisitorListProps = {
  mdUp: boolean;
  secdrawerWidth: number;
  loading: boolean;
  loadingMore: boolean;
  searchAgenda: string;
  setSearchAgenda: (value: string) => void;
  filteredVisitors: any[];
  selectedGroup: any;
  setSelectedGroup: (group: any) => void;
  setSelectedGroupId: any;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  handleCancel: (id: string) => void;
  setShowDrawerFilterMore?: any;
  profile?: any;
  handleAdd?: any;
};

const TransactionVisitorList = ({
  mdUp,
  secdrawerWidth,
  loading,
  loadingMore,
  searchAgenda,
  setSearchAgenda,
  filteredVisitors,
  selectedGroup,
  setShowDrawerFilterMore,
  setSelectedGroup,
  setSelectedGroupId,
  hasMore,
  handleCancel,
  isFetchingNextPage,
  fetchNextPage,
  profile,
  handleAdd,
}: TransactionVisitorListProps) => {
  return (
    <Box
      sx={{
        width: mdUp ? secdrawerWidth : '100%',
        borderRight: '1px solid #eee',
        p: 2,
        pt: 2,
        overflow: 'auto',
        height: { xs: '100%', md: '80vh' },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontSize="1rem">
          Transaction Visitor
        </Typography>
      </Box>

      <CustomTextField
        fullWidth
        size="small"
        placeholder="Search Transaction"
        value={searchAgenda}
        onChange={(e) => setSearchAgenda(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch color="gray" size={18} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={() => setShowDrawerFilterMore(true)}>
                <IconFilterFilled size={18} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {loading
        ? Array.from({ length: 10 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                p: 1.5,
                mb: 1,
              }}
            >
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          ))
        : filteredVisitors.map((group) => (
            <Box
              key={group.id}
              sx={{
                backgroundColor: selectedGroup?.id === group.id ? '#e3f2fd' : '#fff',
                border: '1px solid',
                borderColor: selectedGroup?.id === group.id ? '#90caf9' : '#e0e7ef',
                borderLeft: selectedGroup?.id === group.id ? '4px solid #1976d2' : '',
                borderRadius: 2,
                p: 1.5,
                cursor: 'pointer',
                mb: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: selectedGroup?.id === group.id ? '#e3f2fd' : '#f5f9ff',
                },
              }}
              onClick={() => {
                setSelectedGroup(group);
                setSelectedGroupId(group.id);
              }}
            >
              <Typography fontWeight="bold" variant="h6">{group.agenda}</Typography>

              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography>{group.visitor_type}</Typography>
                <Typography>{group.host_name}</Typography>
              </Box>
              <Stack spacing={0.75} sx={{ mt: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconCalendarEvent size={18} color="#1976d2" stroke={1.8} />
                  <Typography variant="body1" color="text.secondary">
                    Start: {group.visitor_period_start}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconCalendarTime size={18} color="#1976d2" stroke={1.8} />
                  <Typography variant="body1" color="text.secondary">
                    End: {group.visitor_period_end}
                  </Typography>
                </Stack>
              </Stack>
              {group.invited_by === profile?.user_id &&
                group.transaction_status !== 'Canceled' &&
                group.transaction_status !== 'Expired' && (
                  <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1}>
                    <Tooltip title="Add" arrow>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(group);
                        }}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        <IconPlus size={20} />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(group.id);
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
            </Box>
          ))}

      {hasMore && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="outlined"
            fullWidth
            disabled={loadingMore}
            onClick={() => fetchNextPage()}
          >
            {loadingMore ? <CircularProgress size={18} /> : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TransactionVisitorList;
