// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState } from 'react';
import { Box, Menu, Avatar, Typography, IconButton, Stack, Tooltip, Fab } from '@mui/material';

import { IconMail, IconPower } from '@tabler/icons-react';

import ProfileImg from 'src/assets/images/profile/user-1.jpg';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
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
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={ProfileImg}
          alt={ProfileImg}
          sx={{
            width: 35,
            height: 35,
          }}
        />
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
            p: 1,
          },
        }}
      >
        <Stack direction="row" py={0.1} px={1} spacing={1.5} alignItems="center">
          <Avatar src={ProfileImg} alt={ProfileImg} sx={{ width: 50, height: 50 }} />

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textPrimary"
              fontWeight={500}
            >
              Mathew Anderson
            </Typography>
            <Typography sx={{ fontSize: '0.8rem' }} variant="subtitle2" color="textSecondary">
              Designer
            </Typography>
            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              info@modernize.com
            </Typography>
          </Box>

          {/* Tooltip akan berada di paling kanan */}
          <Tooltip title="Log out">
            <Fab size="small" aria-label="small-bell">
              <IconPower width={16} />
            </Fab>
          </Tooltip>
        </Stack>
      </Menu>
    </Box>
  );
};

export default Profile;
