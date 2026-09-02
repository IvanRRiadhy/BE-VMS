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

import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconMail,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';

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

const formatLabel = (value?: string) => {
  if (!value) return '-';

  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
};

const getActorName = (item: Activity) => {
  if (!item.description) return item.actorType || 'Unknown';

  if (item.description.startsWith('You ')) {
    return 'You';
  }

  const match = item.description.match(
    /^(.+?)\s+(assigned|approved|rejected|created|updated|deleted)\b/i,
  );

  return match?.[1] || item.actorType || 'Unknown';
};

const getActivityDescription = (item: Activity) => {
  switch (item.action?.toLowerCase()) {
    case 'invite':
      return 'Assigned you as the host';

    case 'approve':
      return 'Approved the visit request';

    case 'reject':
      return 'Rejected the visit request';

    default:
      return item.description || formatLabel(item.action);
  }
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
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  const getActivityStyle = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'invite':
        return {
          bgcolor: '#E8F5E9',
          color: '#22A06B',
          icon: <IconUserCheck size={18} />,
        };

      case 'approve':
        return {
          bgcolor: '#E8F5E9',
          color: '#22A06B',
          icon: <IconCheck size={18} />,
        };

      case 'reject':
        return {
          bgcolor: '#FFEBEE',
          color: '#E53935',
          icon: <IconX size={18} />,
        };

      default:
        return {
          bgcolor: '#EEF4FF',
          color: '#1554B8',
          icon: <IconClock size={18} />,
        };
    }
  };

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        boxShadow: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2.5}
        py={2}
        flexShrink={0}
        mt={1.2}
      >
        <Typography fontWeight={700} fontSize={16}>
          Real-time Activity
        </Typography>

        <Box
          onClick={!refreshing ? onRefresh : undefined}
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: refreshing ? 'default' : 'pointer',
            opacity: refreshing ? 0.6 : 1,

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
            <IconRefresh size={20} />
            
          </Box>
        </Box>
      </Box>

      {/* Scrollable Activity List */}
      <Box
        ref={scrollRef}
        sx={{
          px: 2,
          maxHeight: 420,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {loading ? (
          <Typography fontSize={13} color="text.secondary" textAlign="center" py={3}>
            Loading activities...
          </Typography>
        ) : activites.length === 0 ? (
          <Typography fontSize={13} color="text.secondary" textAlign="center" py={3}>
            No recent activity
          </Typography>
        ) : (
          <>
            {activites.map((item) => {
              const style = getActivityStyle(item.action);
              const actorName = getActorName(item);

              return (
                <Box
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  py={1.2}
                  sx={{
                    borderBottom: '1px solid #F3F4F6',

                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  {/* Activity Icon */}
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      minWidth: 38,
                      borderRadius: '50%',
                      bgcolor: style.bgcolor,
                      color: style.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {style.icon}
                  </Box>

                  {/* Activity Content */}
                  <Box flex={1} minWidth={0}>
                    <Typography fontSize={13} fontWeight={600} color="#374151" noWrap>
                      {actorName}
                    </Typography>

                    <Typography
                      fontSize={11.5}
                      color="text.secondary"
                      noWrap
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {formatLabel(item.action)} · {getActivityDescription(item)}
                    </Typography>
                  </Box>

                  {/* Time */}
                  <Typography fontSize={10.5} color="text.secondary" whiteSpace="nowrap">
                    {/* {dayjs(item.actionAt).format('DD MMMM YYYY HH:mm')} */}
                    {item.actionAt}
                  </Typography>
                </Box>
              );
            })}

            {/* Load More Sentinel */}
            {hasNextPage && (
              <Box
                ref={loadMoreRef}
                sx={{
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loadingMore && (
                  <Typography fontSize={11} color="text.secondary">
                    Loading more...
                  </Typography>
                )}
              </Box>
            )}

            {!hasNextPage && activites.length > 0 && (
              <Typography fontSize={11} color="text.secondary" textAlign="center" py={1.5}>
                No more activities
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
