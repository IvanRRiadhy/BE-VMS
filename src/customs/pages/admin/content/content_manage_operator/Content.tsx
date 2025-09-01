import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormWizardAddOpeator from './FormWizardAddOpeator';
import CloseIcon from '@mui/icons-material/Close';
import { IconUser } from '@tabler/icons-react';

const Content = () => {
  const tableRowOperators = [
    {
      id: 1,
      Name: 'Abd Goffar',
      Username: 'abd.goffar',
      Role: 'Admin',
      'Organization/Company': 'PT. Nusantara Teknologi',
      CreateAt: '2025-06-10T08:00:00Z',
    },
    {
      id: 2,
      Name: 'Ilham Maulana',
      Username: 'ilham.mln',
      Role: 'Staff',
      'Organization/Company': 'PT. Nusantara Teknologi',
      CreateAt: '2025-06-11T09:15:00Z',
    },
    {
      id: 3,
      Name: 'Nadia Putri',
      Username: 'nadia.putri',
      Role: 'Manager',
      'Organization/Company': 'CV. Digital Solusi',
      CreateAt: '2025-06-11T10:45:00Z',
    },
    {
      id: 4,
      Name: 'Danang Pratama',
      Username: 'danang.prtm',
      Role: 'Supervisor',
      'Organization/Company': 'PT. Indo Karya',
      CreateAt: '2025-06-12T07:30:00Z',
    },
    {
      id: 5,
      Name: 'Siti Aisyah',
      Username: 'aisyah.siti',
      Role: 'HR',
      'Organization/Company': 'PT. Mitra Sejahtera',
      CreateAt: '2025-06-12T12:00:00Z',
    },
    {
      id: 6,
      Name: 'Yusuf Ramadhan',
      Username: 'yusuf.rmd',
      Role: 'Admin',
      'Organization/Company': 'PT. Nusantara Teknologi',
      CreateAt: '2025-06-13T08:40:00Z',
    },
    {
      id: 7,
      Name: 'Fauzan Arif',
      Username: 'fauzan.arif',
      Role: 'IT Support',
      'Organization/Company': 'CV. Solusi Mandiri',
      CreateAt: '2025-06-13T11:00:00Z',
    },
    {
      id: 8,
      Name: 'Rina Amelia',
      Username: 'rina.amelia',
      Role: 'Finance',
      'Organization/Company': 'PT. Indo Karya',
      CreateAt: '2025-06-14T09:25:00Z',
    },
  ];

  const cards = [
    { title: 'Total Operator', subTitle: '10', subTitleSetting: 10, icon: IconUser, color: 'none' },
  ];

  // Create Employee state management
  const [openFormCreateEmployee, setOpenFormCreateEmployee] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenFormCreateEmployee(true);
  };
  const handleCloseModalCreateEmployee = () => setOpenFormCreateEmployee(false);

  // --------------
  return (
    <>
      <PageContainer title="Manage Operator" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableRowOperators}
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
                  handleOpenDialog();
                }}
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog
        open={openFormCreateEmployee}
        onClose={handleCloseModalCreateEmployee}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Operator
          <IconButton
            aria-label="close"
            onClick={handleCloseModalCreateEmployee}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormWizardAddOpeator />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
