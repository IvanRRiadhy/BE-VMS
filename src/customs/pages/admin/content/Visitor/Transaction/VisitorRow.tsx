import {
  Avatar,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { axiosInstance2 } from 'src/customs/api/interceptor';

function VisitorRow({ visitor, index }: { visitor: any; index: number }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <TableRow
        sx={{
          backgroundColor: index % 2 === 0 ? '#fff' : '#f7faff',
        }}
      >
        <TableCell width={50}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Agenda
            </Typography>
            <Typography variant="body1">{visitor.agenda}</Typography>
          </Box>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Visitor Type
            </Typography>
            <Typography variant="body1">{visitor.visitor_type_name}</Typography>
          </Box>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Visit Start
            </Typography>
            <Typography variant="body1">{formatDateTime(visitor.visitor_period_start)}</Typography>
          </Box>
        </TableCell>
        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Visit End
            </Typography>
            <Typography variant="body1">{formatDateTime(visitor.visitor_period_end)}</Typography>
          </Box>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0 }}>
          <Collapse in={open}>
            <Box p={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {/* <TableCell>No</TableCell> */}
                    {/* <TableCell>Gambar</TableCell> */}
                    <TableCell sx={{ fontSize: '14px' }}>Visitor Name</TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>Email</TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>Phone</TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>Organization</TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>Host</TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>Site</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {/* <TableCell>{visitor.index +1}</TableCell> */}

                    <TableCell
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '13px',
                      }}
                    >
                      <Avatar
                        src={`${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`}
                      />
                      {visitor.visitor_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{visitor.visitor_email}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{visitor.visitor_phone}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>
                      {visitor.visitor_organization_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{visitor.host_name}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{visitor.site_place_name}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default VisitorRow;
