
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { IconArrowUpRight, IconCheck, IconX } from '@tabler/icons-react';

const pendingVisitsData = [
  {
    id: 1,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Vipul Gupta',
    time: '01:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=21',
  },
  {
    id: 2,
    name: 'Christian Mad',
    role: 'Service Vendor',
    person: 'Amit Kumar',
    time: '01:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=22',
  },
  {
    id: 3,
    name: 'Jason Statham',
    role: 'Delivery Boy',
    person: 'Kevin Hart',
    time: '01:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=23',
  },
  {
    id: 4,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Nitin Pathak',
    time: '01:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=24',
  },
  {
    id: 5,
    name: 'Christian Mad',
    role: 'Service Vendor',
    person: 'Vipul Gupta',
    time: '01:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=25',
  },
];

export default function PendingVisitsCard() {
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
          Pending Visits
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
          {pendingVisitsData.map((item) => (
            <TableRow
              key={item.id}
              sx={{
                '& td': {
                  borderBottom: 'none',
                  py: 1.3,
                },
              }}
            >
              {/* User */}
              <TableCell sx={{ pl: 0 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={item.avatar}
                    sx={{
                      width: 42,
                      height: 42,
                    }}
                  />

                  <Box>
                    <Typography fontWeight={600} fontSize={13}>
                      {item.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {item.role}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>

              {/* Person to Meet */}
              <TableCell>
                <Typography fontWeight={600} fontSize={12}>
                  Person to Meet
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.person}
                </Typography>
              </TableCell>

              {/* Time */}
              <TableCell>
                <Typography fontWeight={600} fontSize={12}>
                  Time
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.time}
                </Typography>
              </TableCell>

              {/* Actions */}
              <TableCell align="right" sx={{ pr: 0 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {/* Approve */}
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: '#37C871',
                      color: '#fff',
                      width: 30,
                      height: 30,
                      '&:hover': {
                        bgcolor: '#2fb867',
                      },
                    }}
                  >
                    <IconCheck size={16} />
                  </IconButton>

                  {/* Reject */}
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: '#F44336',
                      color: '#fff',
                      width: 30,
                      height: 30,
                      '&:hover': {
                        bgcolor: '#e53935',
                      },
                    }}
                  >
                    <IconX size={16} />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
