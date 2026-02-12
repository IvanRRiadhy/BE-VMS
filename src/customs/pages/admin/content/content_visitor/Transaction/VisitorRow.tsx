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
  const [open, setOpen] = useState(false);
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
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Agenda
            </Typography>
            <Typography variant="body2">{visitor.agenda}</Typography>
          </Box>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Visitor Type
            </Typography>
            <Typography variant="body2">{visitor.visitor_type_name}</Typography>
          </Box>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Visit Start
            </Typography>
            <Typography variant="body2">{formatDateTime(visitor.visitor_period_start)}</Typography>
          </Box>
        </TableCell>
        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Visit End
            </Typography>
            <Typography variant="body2">{formatDateTime(visitor.visitor_period_end)}</Typography>
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
                    <TableCell>Visitor Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Host</TableCell>
                    <TableCell>Site</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {/* <TableCell>{visitor.index +1}</TableCell> */}

                    <TableCell sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={`${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`}
                      />
                      {visitor.visitor_name}
                    </TableCell>
                    <TableCell>{visitor.visitor_email}</TableCell>
                    <TableCell>{visitor.visitor_phone}</TableCell>
                    <TableCell>{visitor.visitor_organization_name}</TableCell>
                    <TableCell>{visitor.host_name}</TableCell>
                    <TableCell>{visitor.site_place_name}</TableCell>
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
