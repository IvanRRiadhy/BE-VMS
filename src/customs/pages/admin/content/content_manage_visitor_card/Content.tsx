import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Divider, Grid2 as Grid, IconButton } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormWizardAddVisitorCard from './FormWizardAddVisitorCard';

const Content = () => {
  const cards = [
    { title: 'Total Card', subTitle: '9', subTitleSetting: 9, color: 'none' },
    { title: 'Total Check In', subTitle: '7', subTitleSetting: 7, color: 'none' },
    { title: 'Total  Card Active', subTitle: '10', subTitleSetting: 10, color: 'none' },
    { title: 'Total Card Non Active', subTitle: '52', subTitleSetting: 52, color: 'none' },
  ];

  const tableRowVisitorCard = [
    {
      id: 1,
      Name: 'ABD GOFFAR',
      Tags: 'VIP, Investor',
      'Card No.': 'CARD-001',
      'Card QR': 'QR-001-ABDGOFFAR',
      Visitor: 'Yes',
      'Checkin By': 'RECEPTIONIST-01',
      'Checkout By': 'RECEPTIONIST-02',
      Status: 'Checked Out',
    },
    {
      id: 2,
      Name: 'ILHAM MAULANA',
      Tags: 'Guest, Partner',
      'Card No.': 'CARD-002',
      'Card QR': 'QR-002-ILHAM',
      Visitor: 'Yes',
      'Checkin By': 'RECEPTIONIST-03',
      'Checkout By': null,
      Status: 'Checked In',
    },
    {
      id: 3,
      Name: 'NADIA PUTRI',
      Tags: 'Vendor',
      'Card No.': 'CARD-003',
      'Card QR': 'QR-003-NADIA',
      Visitor: 'Yes',
      'Checkin By': 'RECEPTIONIST-02',
      'Checkout By': null,
      Status: 'Checked In',
    },
    {
      id: 4,
      Name: 'DANANG PRATAMA',
      Tags: 'Consultant',
      'Card No.': 'CARD-004',
      'Card QR': 'QR-004-DANANG',
      Visitor: 'No',
      'Checkin By': 'SECURITY-01',
      'Checkout By': 'SECURITY-01',
      Status: 'Checked Out',
    },
    {
      id: 5,
      Name: 'SITI AISYAH',
      Tags: 'Intern',
      'Card No.': 'CARD-005',
      'Card QR': 'QR-005-AISYAH',
      Visitor: 'Yes',
      'Checkin By': 'RECEPTIONIST-01',
      'Checkout By': null,
      Status: 'Checked In',
    },
  ];

  // Create Visitor card state management
  const [openFormCreateVisitorCard, setOpenFormCreateVisitorCard] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorCard(true);
  };
  const handleCloseModalCreateVisitorCard = () => setOpenFormCreateVisitorCard(false);
  // --------------

  return (
    <>
      <PageContainer title="Manage Visitor Card" description="this is Dashboard page">
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
                data={tableRowVisitorCard}
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
        open={openFormCreateVisitorCard}
        onClose={handleCloseModalCreateVisitorCard}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add VisitorCard
          <IconButton
            aria-label="close"
            onClick={handleCloseModalCreateVisitorCard}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
                <Divider /> 
        <DialogContent>
          <br />
          <FormWizardAddVisitorCard />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
