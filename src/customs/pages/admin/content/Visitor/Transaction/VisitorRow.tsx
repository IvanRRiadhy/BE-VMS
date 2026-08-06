import { Avatar, Button, Checkbox, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useProfile } from 'src/hooks/Profile/useProfile';

function VisitorRow({
  visitor,
  index,
  selectedVisitor,
  setSelectedVisitor,
  handleRemoveVisitor,
}: {
  visitor: any;
  index: number;
  selectedVisitor?: any;
  setSelectedVisitor?: any;
  handleRemoveVisitor: () => void;
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
      <TableRow>
        <TableCell>
          <Checkbox
            checked={selectedVisitor?.id === visitor.id}
            onChange={() => setSelectedVisitor(visitor)}
          />
        </TableCell>

        <TableCell
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '13px',
          }}
        >
          <Avatar src={`${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`} />
          {visitor.visitor_name}
        </TableCell>
        <TableCell sx={{ fontSize: '13px' }}>{visitor.visitor_email}</TableCell>
        <TableCell sx={{ fontSize: '13px' }}>{visitor.visitor_phone}</TableCell>
        <TableCell sx={{ fontSize: '13px' }}>{visitor.invitation_code}</TableCell>

        <TableCell sx={{ fontSize: '13px' }}>{visitor.visitor_organization_name}</TableCell>
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
        <TableCell>
          <Tooltip title="Remove Visitor" arrow>
            <span>
              <IconButton color="error" disabled={!selectedVisitor} onClick={handleRemoveVisitor}>
                <IconTrash size={26} />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
    </>
  );
}

export default VisitorRow;
