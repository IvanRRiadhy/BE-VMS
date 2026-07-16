import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Skeleton,
  Typography,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { IconFilterFilled } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface TransactionVisitorListProps {
  mdUp: boolean;
  secdrawerWidth: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;

  profile: any;

  searchAgenda: string;
  setSearchAgenda: (value: string) => void;
  setShowDrawerFilterMore: (value: boolean) => void;

  filteredVisitors: any[];
  selectedGroup: any;
  setSelectedGroup: (group: any) => void;
  setSelectedGroupId: (id: string) => void;

  handleDuplicate: (group: any) => void;
  handleCancel: (id: string) => void;
  fetchNextPage?: any;
}

const TransactionVisitorList = ({
  mdUp,
  secdrawerWidth,
  loading,
  loadingMore,
  hasMore,
  profile,
  searchAgenda,
  setSearchAgenda,
  setShowDrawerFilterMore,
  filteredVisitors,
  selectedGroup,
  setSelectedGroup,
  setSelectedGroupId,
  handleDuplicate,
  handleCancel,
  fetchNextPage
}: TransactionVisitorListProps) => {
  return (
    <Box
      sx={{
        width: mdUp ? secdrawerWidth : '100%',
        borderRight: '1px solid #eee',
        p: 2,
        pt: 2,
        overflow: 'auto',
        height: { xs: '100%', md: '75vh' },
      }}
    >
      <Typography variant="h5" mb={2}>
        Transaction Visitor
      </Typography>

      <CustomTextField
        fullWidth
        size="small"
        placeholder="Search Transaction"
        value={searchAgenda}
        onChange={(e) => setSearchAgenda(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={() => setShowDrawerFilterMore(true)}>
                <IconFilterFilled />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box>
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
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
        ) : (
          <>
            {filteredVisitors.map((group: any) => (
              <Box
                key={group.id}
                sx={{
                  backgroundColor: selectedGroup?.id === group.id ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: 2,
                  p: 1.5,
                  cursor: 'pointer',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedGroupId(group.id);
                }}
              >
                <Typography fontWeight="bold">{group.agenda}</Typography>

                <Box display="flex" justifyContent="space-between">
                  <Typography>{group.visitor_type}</Typography>
                  <Typography>{group.host_name}</Typography>
                </Box>

                <Typography>Start : {group.visitor_period_start}</Typography>

                <Typography>End : {group.visitor_period_end}</Typography>

                <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1}>
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor: 'gray',
                      color: 'white',
                    }}
                    startIcon={<ContentCopy />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(group);
                    }}
                  >
                    Duplicate
                  </Button>

                  {group.invited_by === profile?.user_id && (
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
                  )}
                </Box>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default TransactionVisitorList;
