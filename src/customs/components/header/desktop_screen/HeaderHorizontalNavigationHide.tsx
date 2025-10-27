import { useState } from 'react';
import { Box, Menu, Typography, Button, Divider, Grid2 as Grid } from '@mui/material';
import { Link } from 'react-router';
import { IconChevronDown, IconHelp } from '@tabler/icons-react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';

const HeaderHorizontalNavigationHide = () => {
  return (
    <>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        to="/apps/calendar"
        component={Link}
      >
        Calendar
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        to="/apps/email"
        component={Link}
      >
        Email   
      </Button>
    </>
  );
};

export default HeaderHorizontalNavigationHide;
