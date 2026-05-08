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
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { IconArrowUpRight } from '@tabler/icons-react';

const lastVisitsData = [
  {
    id: 1,
    name: 'Adela Parkson',
    role: 'Creative Director',
    person: 'Vipul Gupta',
    checkin: '01:20 PM',
    checkout: '03:05 PM',
    date: '24/04/2024',
    visitorType: 'Client',
    grantedBy: 'Christian Mad',
    status: 'VIP',
    avatar: 'https://i.pravatar.cc/100?img=31',
  },
  {
    id: 2,
    name: 'Jason Statham',
    role: 'Creative Director',
    person: 'Vipul Gupta',
    checkin: '01:20 PM',
    checkout: '03:05 PM',
    date: '24/04/2024',
    visitorType: 'Client',
    grantedBy: 'Christian Mad',
    status: 'Interview',
    avatar: 'https://i.pravatar.cc/100?img=32',
  },
];

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'vip':
      return {
        bgcolor: '#E8F5E9',
        color: '#2E7D32',
      };

    case 'interview':
      return {
        bgcolor: '#FFF3E0',
        color: '#EF6C00',
      };

    default:
      return {
        bgcolor: '#ECEFF1',
        color: '#455A64',
      };
  }
};

export default function LastVisitsCard() {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: '20px',
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2.5}>
        <Typography fontWeight={700} fontSize={17}>
          Last Visits
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
          }}
        >
          <IconArrowUpRight size={16} />
        </Box>
      </Box>

      {/* Table */}
      <Table>
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
            <TableCell>Visitor's Name</TableCell>
            <TableCell>Person to Meet</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Check-in</TableCell>
            <TableCell>Check-out</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Visitor Type</TableCell>
            <TableCell>Granted by</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lastVisitsData.map((item) => (
            <TableRow
              key={item.id}
              sx={{
                '& td': {
                  borderBottom: '1px solid #F5F5F5',
                  py: 2,
                  fontSize: '13px',
                  color: '#374151',
                  whiteSpace: 'nowrap',
                },
              }}
            >
              {/* Visitor */}
              <TableCell>
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

              {/* Person */}
              <TableCell>{item.person}</TableCell>

              {/* Department */}
              <TableCell>—</TableCell>

              {/* Checkin */}
              <TableCell>{item.checkin}</TableCell>

              {/* Checkout */}
              <TableCell>{item.checkout}</TableCell>

              {/* Date */}
              <TableCell>{item.date}</TableCell>

              {/* Visitor Type */}
              <TableCell>{item.visitorType}</TableCell>

              {/* Granted By */}
              <TableCell>{item.grantedBy}</TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  label={item.status}
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
        </TableBody>
      </Table>
    </TableContainer>
  );
}
