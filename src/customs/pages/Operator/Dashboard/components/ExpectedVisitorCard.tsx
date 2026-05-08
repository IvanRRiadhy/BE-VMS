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

const expectedVisitorsData = [
  {
    id: 1,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Nick Parker',
    status: 'Business',
    time: '03:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=11',
  },
  {
    id: 2,
    name: 'Christian Mad',
    role: 'Service Vendor',
    person: 'Jack Cooper',
    status: 'Meeting',
    time: '10:00 PM',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 3,
    name: 'Jason Statham',
    role: 'Delivery Boy',
    person: 'Kevin Hart',
    status: 'VIP',
    time: '02:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=13',
  },
  {
    id: 4,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Nick Parker',
    status: 'Business',
    time: '03:20 PM',
    avatar: 'https://i.pravatar.cc/100?img=14',
  },
  {
    id: 5,
    name: 'Christian Mad',
    role: 'Service Vendor',
    person: 'Jack Cooper',
    status: 'Meeting',
    time: '10:00 PM',
    avatar: 'https://i.pravatar.cc/100?img=15',
  },
];

const getChipStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'vip':
      return {
        bgcolor: '#E8F5E9',
        color: '#4CAF50',
      };

    case 'meeting':
      return {
        bgcolor: '#E3F2FD',
        color: '#2196F3',
      };

    default:
      return {
        bgcolor: '#FFF4E5',
        color: '#FF9800',
      };
  }
};

export default function ExpectedVisitorsCard() {
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
          Expected Visitors
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
            marginTop: '10px'
          }}
        >
          <IconArrowUpRight size={16} />
        </Box>
      </Box>

      {/* Table */}
      <Table>
        <TableBody>
          {expectedVisitorsData.map((item) => (
            <TableRow
              key={item.id}
              sx={{
                '& td': {
                  borderBottom: 'none',
                  py: 1.2,
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

                <Stack direction="row" spacing={0.7} alignItems="center" mt={0.3}>
                  <Typography variant="caption" color="text.secondary">
                    {item.person}
                  </Typography>

                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '10px',
                      fontWeight: 600,
                      ...getChipStyle(item.status),
                    }}
                  />
                </Stack>
              </TableCell>

              {/* Time */}
              <TableCell align="right" sx={{ pr: 0 }}>
                <Typography fontWeight={600} fontSize={12}>
                  Time
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.time}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
