import React, { useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { IconActivity, IconArrowUpRight, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';

interface Activity {
  userId: string;
  actorType: string;
  action: string;
  entityName: string;
  description: string;
  newValues?: string;
  metadata?: string;
  actionAt: string;
  applicationId: string;
  id: string;
  status: number;
  createdBy: string;
  createdAt: string;
}

// const getStatusStyle = (status: string) => {
//   switch (status.toLowerCase()) {
//     case 'vip':
//       return {
//         bgcolor: '#E8F5E9',
//         color: '#2E7D32',
//       };

//     case 'interview':
//       return {
//         bgcolor: '#FFF3E0',
//         color: '#EF6C00',
//       };

//     default:
//       return {
//         bgcolor: '#ECEFF1',
//         color: '#455A64',
//       };
//   }
// };

interface LastVisitsCardProps {
  activites: Activity[];
  loading?: boolean;
  loadingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const getStatusStyle = (status: number) => {
  if (status === 1) {
    return {
      bgcolor: '#E8F5E9',
      color: '#2E7D32',
    };
  }

  return {
    bgcolor: '#FFEBEE',
    color: '#C62828',
  };
};

const formatAction = (action: string) => {
  return action?.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ') || '-';
};

const formatEntityName = (entityName: string) => {
  return entityName?.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ') || '-';
};

export default function LastVisitsCard({
  activites = [],
  loading = false,
  loadingMore = false,
  hasNextPage = false,
  onLoadMore,
  onRefresh,
  refreshing = false,
}: LastVisitsCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const target = loadMoreRef.current;

    if (!container || !target) return;
    if (!hasNextPage || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && hasNextPage && !loadingMore) {
          onLoadMore?.();
        }
      },
      {
        root: container,
        rootMargin: '100px',
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, loadingMore, onLoadMore, activites.length]);

  const loadMoreRef = useRef<HTMLTableRowElement>(null);
  return (
    <Paper
      sx={{
        borderRadius: '20px',
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2.5}>
        <Typography fontWeight={700} fontSize={17}>
          Recent Activity
        </Typography>

        <Box
          onClick={!refreshing ? onRefresh : undefined}
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: '#4B5CFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: refreshing ? 'default' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
            transition: '0.2s',

            '&:hover': {
              opacity: refreshing ? 0.6 : 0.85,
            },

            '@keyframes refresh-spin': {
              from: {
                transform: 'rotate(0deg)',
              },
              to: {
                transform: 'rotate(360deg)',
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: refreshing ? 'refresh-spin 0.8s linear infinite' : 'none',
            }}
          >
            <IconRefresh size={16} />
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box
        ref={scrollRef}
        sx={{
          maxHeight: 420,
          overflowY: 'auto',
          overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: '#FAFAFA',
                '& th': {
                  borderBottom: '1px solid #F1F1F1',
                  fontWeight: 700,
                  color: '#6B7280',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <TableCell>No</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Description</TableCell>
              {/* <TableCell>Actor</TableCell> */}
              <TableCell>Action At</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography fontSize={13} color="text.secondary" py={3}>
                    Loading activities...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : activites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography fontSize={13} color="text.secondary" py={3}>
                    No activities found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {activites.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '& td': {
                        borderBottom: '1px solid #F5F5F5',
                        py: 1.8,
                        fontSize: '13px',
                        color: '#374151',
                      },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {/* <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#EEF2FF',
                            color: '#4B5CFF',
                          }}
                        >
                          <IconActivity size={19} />
                        </Avatar> */}

                        <Typography fontWeight={600} fontSize={13} whiteSpace="nowrap">
                          {formatAction(item.action)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13} fontWeight={500} whiteSpace="nowrap">
                        {formatEntityName(item.entityName)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item.description}
                      >
                        {item.description || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13} whiteSpace="nowrap">
                        {dayjs(item.actionAt).format('DD MMMM YYYY HH:mm')}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.status === 1 ? 'Success' : 'Failed'}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '11px',
                          ...getStatusStyle(item.status),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {hasNextPage && (
                  <TableRow ref={loadMoreRef}>
                    <TableCell colSpan={6} align="center">
                      {loadingMore ? (
                        <Typography fontSize={12} color="text.secondary" py={1}>
                          Loading more activities...
                        </Typography>
                      ) : (
                        <Typography fontSize={12} color="text.secondary" py={1}>
                          Scroll for more
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
