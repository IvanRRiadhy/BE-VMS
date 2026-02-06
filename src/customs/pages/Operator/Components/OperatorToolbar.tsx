import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import {
  IconArrowsMaximize,
  IconCar,
  IconCaretDownFilled,
  IconInfoCircle,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

interface OperatorToolbarProps {
  onClear: () => void;
  onOpenList: () => void;
  onOpenBlacklist: () => void;
  onOpenInfo: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const OperatorToolbar = ({
  onClear,
  onOpenList,
  onOpenBlacklist,
  onOpenInfo,
  isFullscreen,
  onToggleFullscreen,
  containerRef,
}: OperatorToolbarProps) => {
  const tooltipProps = {
    arrow: true,
    slotProps: {
      popper: { container: containerRef?.current },
      tooltip: { sx: { fontSize: '0.75rem', padding: '8px 14px' } },
    },
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      display="flex"
      gap={0.5}
      alignItems="center"
      sx={{ mb: { xs: 2, md: '1px' }, flexWrap: { xs: 'wrap', xl: 'nowrap' }, width: '100%' }}
    >
      <Tooltip title="Clear data information" {...tooltipProps}>
        <Button variant="outlined" color="error" startIcon={<IconX size={18} />} onClick={onClear}>
          Clear
        </Button>
      </Tooltip>
      {/* 
      <Tooltip title="List Visitor" {...tooltipProps}>
        <Button
          onClick={onOpenList}
          startIcon={<IconUser size={18} />}
          variant="contained"
          // sx={{ backgroundColor: 'gray', '&:hover': { backgroundColor: 'gray' } }}
        >
          <IconUser size={25} style={{ color: '#fff' }} /> 
          Visitor
        </Button>
      </Tooltip>

      <Tooltip title="Blacklist Visitor" {...tooltipProps}>
        <Button
          onClick={onOpenBlacklist}
          sx={{ backgroundColor: '#000', '&:hover': { backgroundColor: '#000' }, color: '#fff' }}
          startIcon={<IconUser size={18} style={{ color: '#fff' }} />}
        >
          Blacklist
        </Button>
      </Tooltip> */}

      <Tooltip title="Visitor Menu" {...tooltipProps}>
        <Button
          variant="contained"
          startIcon={<IconUser size={18} />}
          onClick={handleClick}
          endIcon={<IconCaretDownFilled size={18} />}
          // sx={{ width: '30%' }}
        >
          Visitor Site
        </Button>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            onOpenList();
          }}
        >
          List Visitor
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onOpenBlacklist();
          }}
        >
          Blacklist Visitor
        </MenuItem>
      </Menu>
      <Tooltip title="Vehicle" {...tooltipProps}>
        <Button variant="contained" color="secondary" startIcon={<IconCar size={18} />}>
          Vehicle
        </Button>
      </Tooltip>

      <Tooltip title="Information Guide Operator" {...tooltipProps}>
        <Button variant="contained" onClick={onOpenInfo} sx={{ width: 36, height: 36, p: 0.7 }}>
          <IconInfoCircle size={25} />
        </Button>
      </Tooltip>

      <Tooltip title="Tap to toggle Fullscreen" {...tooltipProps}>
        <IconButton
          onClick={onToggleFullscreen}
          sx={{
            backgroundColor: '#5D87FF',
            color: '#fff',
            width: 36,
            height: 36,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#5D87FF',
              opacity: 0.9,
            },
          }}
        >
          <IconArrowsMaximize
            size={20}
            style={{
              transform: isFullscreen ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.3s ease',
              color: '#fff',
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
export default OperatorToolbar;
