import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { IconCheck, IconSearch, IconX } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { getVisitorTransactionByIds } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

type ApprovalSidebarProps = {
  mdUp: boolean;
  secdrawerWidth: number;
  loading: boolean;
  approvalData: any[];
  selectedId: string | null;
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  hasMore: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;

  setSelectedGroup: (group: any) => void;
  setSelectedGroupId: (id: string) => void;
  setSelectedId: (id: string) => void;

  setGroupVisitors: (rows: any[]) => void;
  setGroupHeader: (header: any) => void;
  setGroupDetailLoading: (loading: boolean) => void;
  setOpenDialog: (open: boolean) => void;

  setSelectedRows: (rows: any[]) => void;
  setTriggerCheckAll: (value: boolean) => void;
};

const ApprovalSidebar = ({
  mdUp,
  secdrawerWidth,
  loading,
  approvalData,
  selectedId,
  searchKeyword,
  setSearchKeyword,
  hasMore,
  setPage,
  setSelectedGroup,
  setSelectedGroupId,
  setSelectedId,
  setGroupVisitors,
  setGroupHeader,
  setGroupDetailLoading,
  setOpenDialog,
  setSelectedRows,
  setTriggerCheckAll,
}: ApprovalSidebarProps) => {
  const { token } = useSession();
  const handleOpenDialog = async (group: any, isApprove: boolean) => {
    setSelectedGroup(group);
    setSelectedId(group.approval_ticket_id);
    setGroupVisitors([]);
    setGroupDetailLoading(true);
    setOpenDialog(true);

    try {
      const res = await getVisitorTransactionByIds(token as string, group.entity_id);

      setGroupHeader(res.collection[0]);
      setGroupVisitors(res.collection);

      if (isApprove) {
        setSelectedRows(res.collection);
        setTriggerCheckAll(false);

        setTimeout(() => {
          setTriggerCheckAll(true);
        }, 0);
      }
    } finally {
      setGroupDetailLoading(false);
    }
  };

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
        value={searchKeyword}
        onChange={(e: any) => setSearchKeyword(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch color="gray" size={18} />
            </InputAdornment>
          ),
        }}
      />

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
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </Box>
        ))
      ) : (
        <>
          {approvalData.map((group) => (
            <Box
              key={group.approval_ticket_id}
              sx={{
                backgroundColor: selectedId === group.approval_ticket_id ? '#e3f2fd' : '#f5f5f5',
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
                setSelectedGroupId(group.ticket_id);
                setSelectedId(group.approval_ticket_id);
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold" noWrap sx={{ width: 150 }}>
                  {group.agenda}
                </Typography>

                {group.approval_status === 'Pending' && (
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Approve">
                      <IconButton
                        sx={{
                          bgcolor: '#4CAF50',
                          color: '#fff',
                          width: 30,
                          height: 30,
                          '&:hover': { bgcolor: '#388E3C' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(group, true);
                        }}
                      >
                        <IconCheck size={16} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reject">
                      <IconButton
                        sx={{
                          bgcolor: '#f44336',
                          color: '#fff',
                          width: 30,
                          height: 30,
                          '&:hover': { bgcolor: '#d32f2f' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(group, false);
                        }}
                      >
                        <IconX size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography>{group.visitor_type_name}</Typography>
                <Typography>{group.host_name}</Typography>
              </Box>

              <Typography>Start : {group.visitor_period_start}</Typography>

              <Typography>End : {group.visitor_period_end}</Typography>

              <Typography
                sx={{
                  width: 'fit-content',
                  ml: 'auto',
                  mt: 1,
                  px: 1.2,
                  py: 0.3,
                  borderRadius: 3,
                  fontWeight: 600,
                  ...(group.approval_status === 'Pending' && {
                    bgcolor: '#E0E0E0',
                    color: '#616161',
                  }),
                  ...(group.approval_status === 'Approved' && {
                    bgcolor: '#4CAF50',
                    color: '#fff',
                  }),
                  ...(group.approval_status === 'Rejected' && {
                    bgcolor: '#f44336',
                    color: '#fff',
                  }),
                }}
              >
                {group.approval_status}
              </Typography>
            </Box>
          ))}

          {hasMore && (
            <Box mt={2}>
              <Button
                fullWidth
                variant="outlined"
                disabled={loading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ApprovalSidebar;
