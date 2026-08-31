import React from 'react';
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
  TableRow,
  Typography,
} from '@mui/material';
import { IconArrowUpRight, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useUpcomingVisitors } from 'src/hooks/Operator/useUpcomingVisitors';
import { axiosInstance2 } from 'src/customs/api/interceptor';

export default function ExpectedVisitorsCard() {
  const liveVisitorQuery = useUpcomingVisitors({
    page: 0,
    rowsPerPage: 5,
    sortDir: 'desc',
    allVisitorType: true,
  });

  const upcomingVisitors = liveVisitorQuery.data?.collection ?? [];

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        p: 2.5,
        boxShadow: 3,
        height: '100%',
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={700} fontSize={17}>
          Upcoming Visitors
        </Typography>

        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: '#4B5CFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          <IconArrowUpRight size={16} />
        </Box>
      </Box>

      {/* Table */}
      <Table>
        <TableBody>
          {liveVisitorQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography fontSize={13} color="text.secondary" py={3}>
                  Loading visitors...
                </Typography>
              </TableCell>
            </TableRow>
          ) : upcomingVisitors.length === 0 ? (
            <TableRow sx={{ height: '100%' }}>
              <TableCell colSpan={3} align="center">
                <Typography fontSize={13} color="text.secondary" py={3}>
                  No expected visitors
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            upcomingVisitors.slice(0, 5).map((item: any) => {
              const visitorName = item.name || '-';
              const visitorType = item.visitor_type || '-';
              const hostName = item.host || '-';

              // const time = item.visitor_period_start
              //   ? dayjs(item.visitor_period_start).format('hh:mm A')
              //   : '-';

              return (
                <TableRow
                  key={item.id || item.transaction_visitor_id}
                  sx={{
                    '& td': {
                      borderBottom: 'none',
                      py: 1.2,
                    },
                  }}
                >
                  {/* Visitor */}
                  <TableCell sx={{ pl: 0 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={`${axiosInstance2.defaults.baseURL}/cdn${item.selfie_image}` || ''}
                        alt={visitorName}
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: '#EEF2FF',
                          color: '#4B5CFF',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                        imgProps={{
                          onError: (e) => {
                            e.currentTarget.style.display = 'none';
                          },
                        }}
                      >
                        {visitorName !== '-' ? (
                          visitorName.charAt(0).toUpperCase()
                        ) : (
                          <IconUser size={21} />
                        )}
                      </Avatar>

                      <Box>
                        <Typography
                          fontWeight={600}
                          fontSize={13}
                          sx={{
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {visitorName}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {visitorType}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize={12}>
                      Agenda
                    </Typography>

                    <Stack direction="row" spacing={0.7} alignItems="center" mt={0.3}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.agenda}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize={12}>
                      Destination
                    </Typography>

                    <Stack direction="row" spacing={0.7} alignItems="center" mt={0.3}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.site_place_name}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Person to Meet */}
                  <TableCell>
                    <Typography fontWeight={600} fontSize={12}>
                      Host
                    </Typography>

                    <Stack direction="row" spacing={0.7} alignItems="center" mt={0.3}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {hostName}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Time */}
                  <TableCell align="left" sx={{ pr: 0 }}>
                    <Typography fontWeight={600} fontSize={12}>
                      Time
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {item.visitor_period_start} - {item.visitor_period_end}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
