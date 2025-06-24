import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Grid2 as Grid, IconButton } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormAddUSer from './FormAddUser';
import { useNavigate } from 'react-router';

const Content = () => {
  const navigate = useNavigate();
  const tableRowUsers = [
    {
      id: 1,
      Name: 'Ahmad Rizky',
      Username: 'ahmad.rizky',
      Role: 'ADMIN',
      CreateAt: '2025-06-01T10:15:00Z',
      Organization: 'PT Nusantara Teknologi',
    },
    {
      id: 2,
      Name: 'Siti Aminah',
      Username: 'siti.aminah',
      Role: 'USER',
      CreateAt: '2025-05-20T08:45:00Z',
      Organization: 'CV Maju Jaya',
    },
    {
      id: 3,
      Name: 'Budi Santoso',
      Username: 'budi.santoso',
      Role: 'MODERATOR',
      CreateAt: '2025-04-12T13:30:00Z',
      Organization: 'Komunitas Dev Indonesia',
    },
    {
      id: 4,
      Name: 'Linda Hartati',
      Username: 'linda.hartati',
      Role: 'USER',
      CreateAt: '2025-06-10T09:00:00Z',
      Organization: 'Startup Kita',
    },
    {
      id: 5,
      Name: 'Joko Widodo',
      Username: 'joko.widodo',
      Role: 'ADMIN',
      CreateAt: '2025-03-18T11:20:00Z',
      Organization: 'PT Solusi Digital',
    },
    {
      id: 6,
      Name: 'Dewi Ayu',
      Username: 'dewi.ayu',
      Role: 'USER',
      CreateAt: '2025-06-14T15:10:00Z',
      Organization: 'Freelancer',
    },
    {
      id: 7,
      Name: 'Rudi Hermawan',
      Username: 'rudi.hermawan',
      Role: 'MODERATOR',
      CreateAt: '2025-02-25T16:40:00Z',
      Organization: 'Forum Pemrograman',
    },
    {
      id: 8,
      Name: 'Melati Sari',
      Username: 'melati.sari',
      Role: 'USER',
      CreateAt: '2025-05-30T12:00:00Z',
      Organization: 'Universitas Indonesia',
    },
  ];

  const cards = [{ title: 'Total Users', subTitle: '10', subTitleSetting: 10, color: 'none' }];

  return (
    <>
      <PageContainer title="Setting User" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableRowUsers}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => console.log('Edit:', row)}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  navigate('/admin/setting/users/add-user');
                }}
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default Content;
