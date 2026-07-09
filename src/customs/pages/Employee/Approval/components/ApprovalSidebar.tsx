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

  onSelectGroup: (group: any) => void;

  onOpenApprovalDialog: (
    e: React.MouseEvent<HTMLButtonElement>,
    group: any,
    action: 'Approve' | 'Reject',
  ) => void;
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
  onSelectGroup,
  onOpenApprovalDialog,
}: ApprovalSidebarProps) => {
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontSize="1rem">
          Transaction Visitor
        </Typography>
      </Box>

      <CustomTextField
        fullWidth
        size="small"
        placeholder="Search Transaction"
        value={searchKeyword}
        onChange={(e: any) => setSearchKeyword(e.target.value)}
        sx={{
          mb: 2,
          paddingLeft: '0px !important',
        }}
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
              borderRadius: '8px',
              padding: '10px',
              mb: 1,
            }}
          >
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        ))
      ) : (
        <>
          {approvalData
            .filter((group: any) =>
              group.agenda?.toLowerCase().includes(searchKeyword.toLowerCase()),
            )
            .map((group: any) => (
              <Box
                key={group.approval_ticket_id}
                sx={{
                  backgroundColor: selectedId === group.approval_ticket_id ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
                onClick={() => onSelectGroup(group)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      width: '150px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {group.agenda}
                  </Typography>

                  {group.approval_status === 'Pending' && (
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Approve" arrow>
                        <IconButton
                          sx={{
                            backgroundColor: '#4CAF50',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: '#388E3C',
                              color: '#fff',
                            },
                          }}
                          onClick={(e) => onOpenApprovalDialog(e, group, 'Approve')}
                        >
                          <IconCheck size={16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Reject" arrow>
                        <IconButton
                          sx={{
                            backgroundColor: '#f44336',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                              color: '#fff',
                            },
                          }}
                          onClick={(e) => onOpenApprovalDialog(e, group, 'Reject')}
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
                    px: 1.2,
                    py: 0.3,
                    marginLeft: 'auto',
                    marginTop: '5px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    ...(group.approval_status === 'Pending' && {
                      backgroundColor: '#E0E0E0',
                      color: '#616161',
                    }),
                    ...(group.approval_status === 'Approved' && {
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                    }),
                    ...(group.approval_status === 'Rejected' && {
                      backgroundColor: '#f44336',
                      color: '#fff',
                    }),
                  }}
                >
                  {group.approval_status}
                </Typography>
              </Box>
            ))}

          {hasMore && (
            <Box mt={2} textAlign="center">
              <Button
                variant="outlined"
                disabled={loading}
                onClick={() => setPage((prev) => prev + 1)}
                fullWidth
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
