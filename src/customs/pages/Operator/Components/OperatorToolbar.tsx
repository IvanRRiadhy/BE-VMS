import { Button, IconButton, Menu, MenuItem, Select, Tooltip } from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
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
  onOpenVehicle: () => void;
  onOpenInfo: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  containerRef?: React.RefObject<HTMLElement>;
  registeredSite?: any[];
  selectedSite?: any;
  onChangeSite?: any;
}

const OperatorToolbar = ({
  onClear,
  onOpenList,
  onOpenBlacklist,
  onOpenVehicle,
  onOpenInfo,
  isFullscreen,
  onToggleFullscreen,
  containerRef,
  registeredSite,
  selectedSite,
  onChangeSite,
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
  const lg = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));

  return (
    <Box
      display="flex"
      gap={0.5}
      alignItems="center"
      // sx={{
      //   mb: { xs: 2, md: '2px' },
      //   flexWrap: { xs: 'wrap', xl: 'nowrap' },
      //   width: '100%',
      //   px: '5px',
      // }}
      sx={{
        width: '100%',
        flexWrap: 'nowrap',
      }}
    >
      <Select
        value={selectedSite ?? ''}
        onChange={(e) => onChangeSite?.(e.target.value)}
        displayEmpty
        size="medium"
        // disabled={(registeredSite?.length ?? 0) === 1}
        sx={{
          width: {
            xs: '100%',
            md: 150,
            lg: 200,
          },
          backgroundColor: '#fff'
        }}
      >
        <MenuItem value="" disabled>
          Select Site
        </MenuItem>

        {registeredSite?.map((item: any) => (
          <MenuItem key={item.id} value={item.id}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
      <Tooltip title="Visitor Menu" {...tooltipProps}>
        <Button
          variant="contained"
          startIcon={<IconUser size={18} />}
          onClick={handleClick}
          endIcon={<IconCaretDownFilled size={18} />}
          // sx={{ width: '30%' }}
          size="medium"
          sx={{
            maxWidth: {
              sm: 250,
              md: 150,
              lg: 200,
            },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
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
      <Tooltip title="Information Guide Operator" {...tooltipProps}>
        <Button variant="contained" onClick={onOpenInfo} sx={{ width: 18, height: 36, p: 0.7 }}>
          <IconInfoCircle size={25} />
        </Button>
      </Tooltip>

      <Tooltip title="Tap to toggle Fullscreen" {...tooltipProps}>
        <IconButton
          onClick={onToggleFullscreen}
          sx={{
            backgroundColor:'primary.main',
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
