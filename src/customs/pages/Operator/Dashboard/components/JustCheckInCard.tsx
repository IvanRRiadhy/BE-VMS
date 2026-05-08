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
import { IconArrowUpRight } from '@tabler/icons-react';

const checkinData = [
  {
    id: 1,
    name: 'Adela Parkson',
    role: 'Manager',
    person: 'Kevin Hart',
    status: 'Business',
    time: '09:25 PM',
    duration: '2h 25m',
    avatar: 'https://i.pravatar.cc/100?img=1',
  },
  {
    id: 2,
    name: 'Christian Mad',
    role: 'Service Vendor',
    person: 'Jack Cooper',
    status: 'Meeting',
    time: '10:00 PM',
    duration: '1h 40m',
    avatar: 'https://i.pravatar.cc/100?img=2',
  },
  {
    id: 3,
    name: 'Jason Statham',
    role: 'Delivery',
    person: 'Kevin Hart',
    status: 'Business',
    time: '11:10 PM',
    duration: '3h 10m',
    avatar: 'https://i.pravatar.cc/100?img=3',
  },
  {
    id: 4,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Nick Parker',
    status: 'Business',
    time: '03:20 PM',
    duration: '2h 00m',
    avatar: 'https://i.pravatar.cc/100?img=4',
  },
  {
    id: 5,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Nick Parker',
    status: 'Business',
    time: '03:20 PM',
    duration: '2h 00m',
    avatar: 'https://i.pravatar.cc/100?img=4',
  },
];

export default function JustCheckInCard() {
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        p: 3,
        boxShadow: 3,
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={700} fontSize={18}>
          Just Checked-in
        </Typography>

        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: '#4B5CFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <IconArrowUpRight size={18} />
        </Box>
      </Box>

      {/* Table */}
      <Table>
        <TableBody>
          {checkinData.map((item) => (
            <TableRow
              key={item.id}
              sx={{
                '& td': {
                  borderBottom: 'none',
                  py: 1.5,
                },
              }}
            >
              {/* User */}
              <TableCell sx={{ pl: 0 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={item.avatar} />

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
                <Typography fontWeight={600} fontSize={13}>
                  Person to Meet
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {item.person}
                  </Typography>

                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '10px',
                      bgcolor: '#FFF4E5',
                      color: '#FF9800',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </TableCell>

              {/* Time */}
              <TableCell align="right">
                <Typography fontWeight={600} fontSize={13}>
                  Time
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.time}
                </Typography>
              </TableCell>

              {/* Duration */}
              <TableCell align="right" sx={{ pr: 0 }}>
                <Chip
                  label={item.duration}
                  sx={{
                    bgcolor: '#4B5CFF',
                    color: '#fff',
                    fontWeight: 600,
                    borderRadius: '20px',
                    fontSize: '11px',
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
