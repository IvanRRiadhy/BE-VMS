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
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
} from '@mui/material';
// import * as dropdownData from './data';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';

import { IconBellRinging, IconCheck, IconX } from '@tabler/icons-react';
import { Link } from 'react-router';
import { AppState, dispatch, useSelector } from 'src/store/Store';
import { useMediaQuery } from '@mui/system';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { markAsRead } from 'src/store/apps/notifications/NotificationSlice';

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const notifications = useSelector((state: AppState) => state.notifications.items);
  const unreadCount = useSelector((state: AppState) => state.notifications.unreadCount);
  const lg = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const handleOpenNotification = (notification: any) => {
    dispatch(markAsRead(notification.id));

    setSelectedNotification(notification);

    setOpenDialog(true);
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
        <Badge variant="dot" color="error" badgeContent={unreadCount}>
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
            width: lg ? '385px' : '100%',
          },
        }}
      >
        <Stack direction="row" py={2} px={4} justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notifications</Typography>
          <Chip label={`${unreadCount} new`} color="primary" size="small" />
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
        <Box sx={{ height: '350px', overflowY: 'auto' }}>
          {tab === 0 && (
            <Box>
              {notifications.length === 0 ? (
                <Box p={1} textAlign="center">
                  <Typography variant="subtitle2" color="textSecondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                notifications.map((notification: any) => (
                  <MenuItem
                    key={notification.id}
                    sx={{
                      py: 2,
                      px: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: notification.is_read
                        ? 'transparent'
                        : 'rgba(25,118,210,0.08)',
                    }}
                    onClick={() => handleOpenNotification(notification)}
                  >
                    <Stack direction="row" spacing={2} width="100%">
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: 'primary.main',
                        }}
                      >
                        <IconBellRinging size={20} />
                      </Avatar>

                      <Box width="100%">
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.is_read ? 'Read' : 'Unread'}
                            size="small"
                            color={notification.is_read ? 'success' : 'info'}
                            sx={{
                              height: 22,
                              fontSize: '11px',
                            }}
                          />
                        </Box>

                        <Typography
                          color="textSecondary"
                          variant="body2"
                          mt={1}
                          sx={{
                            whiteSpace: 'normal',
                          }}
                        >
                          {notification.message}
                        </Typography>

                        {/* <Typography variant="caption" color="text.secondary">
                          {notification.site_name}
                        </Typography> */}

                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          mt={0.5}
                        >
                          {notification.remaining_minutes} minute(s) remaining
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))
              )}
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <MenuItem sx={{ py: 2, px: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
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
            </Box>
          )}
          {tab === 2 && (
            <Box>
              <MenuItem sx={{ py: 2, px: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
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
                      <Typography variant="body1">Read</Typography>
                    </Box>
                  </Box>
                </Stack>
              </MenuItem>
            </Box>
          )}
        </Box>
        <Box p={2} pb={1}>
          <Button
            to="/guest/notification"
            variant="outlined"
            component={Link}
            color="primary"
            fullWidth
          >
            See all Notifications
          </Button>
        </Box>
      </Menu>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedNotification?.title}
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2">Message</Typography>

              <Typography variant="body2">{selectedNotification?.message}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2">Visitor Name</Typography>

              <Typography variant="body2">{selectedNotification?.visitor_name}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Visitor Type</Typography>

              <Typography variant="body2">{selectedNotification?.visitor_type}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Site</Typography>

              <Typography variant="body2">{selectedNotification?.site_name}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Remaining Minutes</Typography>

              <Typography variant="body2">
                {selectedNotification?.remaining_minutes} minute(s)
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Visit End</Typography>

              <Typography variant="body2">
                {formatDateTime(selectedNotification?.visit_end)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Notifications;
