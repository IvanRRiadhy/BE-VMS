// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack,
} from '@mui/material';
// import * as dropdownData from './data';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';

import { IconBellRinging, IconCheck, IconX } from '@tabler/icons-react';
import { Link } from 'react-router';

const Notifications = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const [tab, setTab] = useState(0);

  const handleChangeTab = (_: any, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? 'primary.main' : 'text.secondary',
        }}
        onClick={handleClick2}
      >
        <Badge variant="dot" color="primary">
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
          },
        }}
      >
        <Stack direction="row" py={2} px={4} justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notifications</Typography>
          <Chip label="5 new" color="primary" size="small" />
        </Stack>

        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab label="General" />
          <Tab label="Approval" />
          <Tab label="System" />
        </Tabs>
        <Scrollbar sx={{ height: '385px' }}>
          {/* {dropdownData.notifications.map((notification: any, index: any) => ( */}

          {/* ))} */}
          {tab === 0 && (
            <Box>
              <MenuItem sx={{ py: 2, px: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    // src={notification.avatar}
                    // alt={notification.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      fontWeight={600}
                      noWrap
                      sx={{
                        width: '200px',
                      }}
                    >
                      {/* {notification.title} */}
                      Title
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: '200px',
                      }}
                      noWrap
                    >
                      Description
                      {/* {notification.subtitle} */}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
              <MenuItem sx={{ py: 2, px: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    // src={notification.avatar}
                    // alt={notification.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="textPrimary"
                        fontWeight={600}
                        noWrap
                        sx={{
                          width: '200px',
                        }}
                      >
                        {/* {notification.title} */}
                        Title
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        sx={{
                          width: '200px',
                        }}
                        noWrap
                      >
                        Description
                        {/* {notification.subtitle} */}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ color: 'success.main' }}>
                        <IconCheck />
                      </Box>
                      <Box sx={{ color: 'error.main' }}>
                        <IconX />
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </MenuItem>
              <MenuItem sx={{ py: 2, px: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    // src={notification.avatar}
                    // alt={notification.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />
                  <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="textPrimary"
                        fontWeight={600}
                        noWrap
                        sx={{
                          width: '200px',
                        }}
                      >
                        {/* {notification.title} */}
                        Title
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        sx={{
                          width: '200px',
                        }}
                        noWrap
                      >
                        Description
                        {/* {notification.subtitle} */}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: '#13DEB9',
                        color: '#fff',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography variant='body1'>Read</Typography>
                    </Box>
                  </Box>
                </Stack>
              </MenuItem>
            </Box>
          )}

          {tab === 1 && <Box></Box>}
          {tab === 2 && <Box></Box>}
        </Scrollbar>
        <Box p={3} pb={1}>
          <Button to="/apps/email" variant="outlined" component={Link} color="primary" fullWidth>
            See all Notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;
