// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import Welcome from 'src/layouts/full/shared/welcome/Welcome';
import TopCards from './TopCards';
import Heatmap from '../../../../components/head_map/HeadMap';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import VideoPlayer from 'src/customs/components/videoplayer';

const headMapData = [
  { id: 1, name: 'ABD GOFFAR', createdAt: '2025-06-12T08:30:00Z' },
  { id: 2, name: 'ILHAM MAULANA', createdAt: '2025-06-13T14:45:00Z' },
  { id: 3, name: 'ILHAM MAULANA', createdAt: '2025-06-13T14:30:00Z' },
  { id: 4, name: 'ABD GOFFAR', createdAt: '2025-06-14T08:10:00Z' },
  { id: 5, name: 'ABD GOFFAR', createdAt: '2025-06-14T08:50:00Z' },
];

const tableRowColumn = [
  {
    id: 1,
    Name: 'Andi Prasetyo',
    'Visit Time': '2025-06-13T09:00:00',
    Purpose: 'Meeting',
    'Purpose Person': 'Bapak Joko',
  },
  {
    id: 2,
    Name: 'Siti Aminah',
    'Visit Time': '2025-06-13T10:30:00',
    Purpose: 'Interview',
    'Purpose Person': 'Ibu Rina',
  },
  {
    id: 3,
    Name: 'Budi Santoso',
    'Visit Time': '2025-06-13T11:15:00',
    Purpose: 'Pengantaran Dokumen',
    'Purpose Person': 'Pak Dedi',
  },
  {
    id: 4,
    Name: 'Rina Marlina',
    'Visit Time': '2025-06-13T13:45:00',
    Purpose: 'Audit',
    'Purpose Person': 'Bu Intan',
  },
  {
    id: 5,
    Name: 'Fajar Nugroho',
    'Visit Time': '2025-06-13T15:00:00',
    Purpose: 'Maintenance',
    'purpose Person': 'Pak Wahyu',
  },
  {
    id: 6,
    Name: 'Rina Marlina',
    'Visit Time': '2025-06-13T13:45:00',
    Purpose: 'Audit',
    'Purpose Person': 'Bu Intan',
  },
  {
    id: 7,
    Name: 'Fajar Nugroho',
    'Visit Time': '2025-06-13T15:00:00',
    Purpose: 'Maintenance',
    'purpose Person': 'Pak Wahyu',
  },
  {
    id: 8,
    Name: 'Fajar Nugroho',
    'Visit Time': '2025-06-13T15:00:00',
    Purpose: 'Maintenance',
    'purpose Person': 'Pak Wahyu',
  },
  {
    id: 9,
    Name: 'Rina Marlina',
    'Visit Time': '2025-06-13T13:45:00',
    Purpose: 'Audit',
    'Purpose Person': 'Bu Intan',
  },
  {
    id: 10,
    Name: 'Fajar Nugroho',
    'Visit Time': '2025-06-13T15:00:00',
    Purpose: 'Maintenance',
    'purpose Person': 'Pak Wahyu',
  },
];

const videoJsOptions = {
  autoplay: true,
  controls: true,
  responsive: true,
  fluid: false, // pastikan false
  width: 2300,
  height: 2500,
  sources: [
    {
      src: 'http://192.168.1.218:8083/stream/27aec28e-6181-4753-9acd-0456a75f0289/channel/0/hlsll/live/index.m3u8',
      type: 'application/x-mpegURL',
    },
  ],
  html5: {
    hls: {
      overrideNative: true,
    },
  },
};

const Content = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard page">
      <Box>
        <Grid container spacing={3}>
          {/* column */}
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCards />
          </Grid>
          {/* column */}
          <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
            <Grid size={{ xs: 12, lg: 3 }}>
              <Heatmap dataCreated={headMapData} title=" Visitors In This Week" />
            </Grid>
            <Grid size={{ xs: 12, lg: 9 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableRowColumn}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveHeader={false}
                headerContent={{
                  title: 'Dashboard',
                  subTitle: 'Monitoring all visitor data',
                  items: [{ name: 'department' }, { name: 'employee' }, { name: 'project' }],
                }}
                onHeaderItemClick={(item) => {
                  console.log('Item diklik:', item.name);
                }}
                onCheckedChange={(selected) => console.log('Checked:', selected)}
                onEdit={(row) => console.log('Edit:', row)}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => {
                  console.log('Range filtered:', ranges);
                }}
                isHaveFilterMore={true}
              />{' '}
            </Grid>
          </Grid>
        </Grid>
        {/* Welcome Alert In Header view */}
        <Welcome />
      </Box>
      {/* <VideoPlayer options={videoJsOptions} /> */}
    </PageContainer>
  );
};

export default Content;
