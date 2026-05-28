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
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0 }}>
          <Collapse in={open}>
            <Box p={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="10%">Visitor Name</TableCell>
                    <TableCell width="15%">Email</TableCell>
                    <TableCell width="15%">Phone</TableCell>
                    <TableCell width="15%">Organization</TableCell>
                    <TableCell width="15%">Host</TableCell>
                    <TableCell width="15%">Site</TableCell>
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
