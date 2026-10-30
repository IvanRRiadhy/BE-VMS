import {
  Avatar,
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  IconClock,
  IconDotsVertical,
  IconEye,
  IconTimeDuration0,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useProfile } from 'src/hooks/Profile/useProfile';

function VisitorRow({
  visitor,
  index,
  selectedVisitor,
  setSelectedVisitor,
  handleRemoveVisitor,
  handleExtend,
  handleViewDetail,
}: {
  visitor: any;
  index: number;
  selectedVisitor?: any;
  setSelectedVisitor?: any;
  handleRemoveVisitor?: () => void;
  handleExtend?: () => void;
  handleViewDetail?: (visitor: any) => void;
}) {
  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d', // hijau
    Checkout: '#F44336', // merah
    Block: '#000000', // hitam
    Deny: '#8B0000', // merah tua
    Approve: '#21c45d', // hijau
    Pracheckin: '#21c45d', // hijau
  };
  const statusLabelMap: Record<string, string> = {
    Checkin: 'Check In',
    Checkout: 'Check Out',
    Block: 'Blocked',
    Deny: 'Denied',
    Approve: 'Approved',
    Cancelled: 'Canceled',
    Pracheckin: 'Precheckin',
  };
  const { data: profile } = useProfile();
  const isAdmin = profile?.group_name === 'Admin';
  const canExtend = ['Preregis', 'Checkin', 'Available'].includes(visitor.visitor_status);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <TableRow>
        <TableCell>
          <Checkbox
            checked={selectedVisitor?.id === visitor.id}
            onChange={() => setSelectedVisitor(selectedVisitor?.id === visitor.id ? null : visitor)}
          />
        </TableCell>

        <TableCell
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '13px',
            width: '100%',
            mt: 0.7,
          }}
        >
          {' '}
          <Avatar src={`${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`} />{' '}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {' '}
            <span>{visitor.visitor_name}</span>{' '}
            {visitor.is_host === true && (
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#E3F2FD',
                  color: '#1565C0',
                  whiteSpace: 'nowrap',
                }}
              >
                Host
              </Box>
            )}{' '}
          </Box>{' '}
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
              width: '100px',
              borderRadius: 2,
              textAlign: 'center',
              color: '#fff',
              fontWeight: 600,
              backgroundColor: statusBgMap[visitor.visitor_status] ?? '#757575',
            }}
          >
            {statusLabelMap[visitor.visitor_status] || visitor.visitor_status}
          </Box>
        </TableCell>

        {/* <TableCell
          sx={{
            verticalAlign: 'middle',
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              minHeight: 50,
            }}
          >
            {isAdmin && visitor.visitor_status !== 'Canceled' && (
              <Tooltip title="Remove Visitor" arrow>
                <span>
                  <IconButton
                    color="error"
                    onClick={handleRemoveVisitor}
                    disabled={!selectedVisitor}
                  >
                    <IconTrash size={26} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="Extend Time" arrow>
              <Button
                variant="contained"
                startIcon={<IconClock size={25} />}
                onClick={handleExtend}
                disabled={!canExtend}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  // boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                  background: 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',
                  backgroundColor: 'primary.main',
                  zIndex: 999,
                  width: '100px',
                  height: '40px',
                  '&.Mui-disabled': {
                    background: '#E0E0E0',
                    color: '#9E9E9E',
                    boxShadow: 'none',
                  },
                  p: 0,
                }}
              >
                Extend
              </Button>
            </Tooltip>
          </Box>
        </TableCell> */}
        <TableCell
          sx={{
            verticalAlign: 'middle',
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 50,
            }}
          >
            <Tooltip title="More actions" arrow>
              <IconButton onClick={handleMenuOpen} size="small">
                <IconDotsVertical size={24} />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleViewDetail?.(visitor);
                }}
                sx={{ gap: 1 }}
              >
                <IconEye size={20} />
                Detail
              </MenuItem>
              {isAdmin && visitor.visitor_status !== 'Canceled' && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleRemoveVisitor?.();
                  }}
                  disabled={!selectedVisitor}
                  sx={{ color: 'error.main', gap: 1 }}
                >
                  <IconTrash size={20} />
                  Remove Visitor
                </MenuItem>
              )}

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleExtend?.();
                }}
                disabled={!canExtend}
                sx={{ gap: 1 }}
              >
                <IconClock size={20} />
                Extend Time
              </MenuItem>
            </Menu>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}

export default VisitorRow;
