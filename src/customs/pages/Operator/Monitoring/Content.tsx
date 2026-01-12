import React, { useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import MonitoringSidebar from './MonitoringSidebar';
import MonitoringMain from './MonitoringMain';
import FilterMonitoringDialog from './Dialog/FilterMonitoringDialog';
import { Button, Divider, Typography } from '@mui/material';

const Content = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const secdrawerWidth = 320;

  const alarms = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Alarm #${i + 1}`,
    message: `Beacon ${100 + i} memasuki area terlarang.`,
    time: `2025-10-21 ${10 + i}:00`,
    type: i % 2 === 0 ? 'Critical' : 'Warning',
  }));

  const histories = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Name #${i + 1}`,
    message: `Visitor ${200 + i} keluar dari area ${i % 3 === 0 ? 'A1' : 'B2'}.`,
    time: `2025-10-21 ${8 + i}:15`,
  }));

  const agents = Array.from({ length: 7 }).map((_, i) => ({
    id: i + 1,
    name: `Agent ${i + 1}`,
  }));

  const [loading, setLoading] = useState(false);
  const [openDialogFilter, setOpenDialogFilter] = useState(false);
  const [filters, setFilters] = useState({
    visitorName: '',
    activity: '',
    alarm: '',
    operatorLog: '',
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <PageContainer title="Monitoring" description="Monitoring page">
      <Box sx={{ backgroundColor: '#fff' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <MonitoringSidebar alarms={alarms} histories={histories} width={secdrawerWidth} />

          <MonitoringMain
            loading={loading}
            onOpenFilter={() => setOpenDialogFilter(true)}
            onRefresh={handleRefresh} 
          />
        </Box>

        <FilterMonitoringDialog
          open={openDialogFilter}
          onClose={() => setOpenDialogFilter(false)}
          filters={filters}
          onChange={(f, v) => setFilters((p) => ({ ...p, [f]: v }))}
          onSubmit={() => setOpenDialogFilter(false)}
        />
      </Box>
    </PageContainer>
  );
};

export default Content;
