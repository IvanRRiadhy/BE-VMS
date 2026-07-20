import {
  Avatar,
  Checkbox,
  TableCell,
  TableRow,
} from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useProfile } from 'src/hooks/Profile/useProfile';

function VisitorRow({
  visitor,
  index,
  selectedVisitor,
  setSelectedVisitor,
}: {
  visitor: any;
  index: number;
  selectedVisitor?: any;
  setSelectedVisitor?: any;
}) {
  const [open, setOpen] = useState(true);
  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d', // hijau
    Checkout: '#F44336', // merah
    Block: '#000000', // hitam
    Deny: '#8B0000', // merah tua
    Approve: '#21c45d', // hijau
    Pracheckin: '#21c45d', // hijau
  };
  const { data: profile } = useProfile();
  const isAdmin = profile?.group_name === 'Admin';
  return (
    <>
      {/* <TableRow>
        <TableCell colSpan={6} sx={{ p: 0 }}>
          <Collapse in={open}>
            <Box p={2}>
              <Table size="small"> */}
      {/* <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell width="10%">Visitor Name</TableCell>
                    <TableCell width="15%">Email</TableCell>
                    <TableCell width="15%">Phone</TableCell>
                    <TableCell width="15%">Organization</TableCell>
                    <TableCell width="15%">Host</TableCell>
                    <TableCell width="15%">Site</TableCell>
                    <TableCell width="15%">Status</TableCell>
                  </TableRow>
                </TableHead> */}
      {/* <TableBody> */}
      <TableRow>
        {isAdmin && <TableCell>{index + 1}</TableCell>}
        {!isAdmin && (
          <TableCell>
            <Checkbox
              checked={selectedVisitor?.id === visitor.id}
              onChange={() => setSelectedVisitor(visitor)}
            />
          </TableCell>
        )}
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
        <TableCell sx={{ fontSize: '13px' }}>{visitor.invitation_code}</TableCell>

        <TableCell sx={{ fontSize: '13px' }}>
          {visitor.visitor_organization_name}
        </TableCell>
        <TableCell sx={{ fontSize: '13px' }}>{visitor.host_name}</TableCell>
        <TableCell sx={{ fontSize: '13px' }}>{visitor.site_place_name}</TableCell>
        <TableCell sx={{ fontSize: '13px' }}>
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              color: '#fff',
              fontWeight: 600,
              backgroundColor: statusBgMap[visitor.visitor_status] ?? '#757575',
            }}
          >
            {visitor.visitor_status}
          </Box>
        </TableCell>
      </TableRow>
      {/* </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}
    </>
  );
}

export default VisitorRow;
