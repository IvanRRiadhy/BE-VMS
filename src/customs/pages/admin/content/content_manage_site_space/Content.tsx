import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Divider, Grid2 as Grid, IconButton } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormWizardAddSiteSpace from './FormWizardAddSiteSpace';
import CloseIcon from '@mui/icons-material/Close';

const Content = () => {
  const tableRowSiteSpace = [
    {
      id: 1,
      name: 'Museum Nasional',
      description: 'Museum bersejarah di Jakarta',
      type: 'Museum',
      visited: true,
    },
    {
      id: 2,
      name: 'Monas',
      description: 'Monumen Nasional Indonesia',
      type: 'Monumen',
      visited: true,
    },
    {
      id: 3,
      name: 'Kebun Raya Bogor',
      description: 'Taman botani terbesar di Indonesia',
      type: 'Taman',
      visited: false,
    },
    {
      id: 4,
      name: 'Candi Borobudur',
      description: 'Candi Buddha terbesar di dunia',
      type: 'Candi',
      visited: true,
    },
    {
      id: 5,
      name: 'Pantai Kuta',
      description: 'Pantai terkenal di Bali',
      type: 'Pantai',
      visited: false,
    },
    {
      id: 6,
      name: 'Taman Mini Indonesia Indah',
      description: 'Taman budaya miniatur Indonesia',
      type: 'Taman Budaya',
      visited: true,
    },
    {
      id: 7,
      name: 'Gunung Bromo',
      description: 'Gunung berapi aktif yang populer untuk wisata',
      type: 'Gunung',
      visited: false,
    },
    {
      id: 8,
      name: 'Danau Toba',
      description: 'Danau vulkanik terbesar di Asia Tenggara',
      type: 'Danau',
      visited: false,
    },
  ];

  const cards = [{ title: 'Total Site', subTitle: '10', subTitleSetting: 10, color: 'none' }];

  // Create Site space state management
  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenFormCreateSiteSpace(true);
  };
  const handleCloseModalCreateSiteSpace = () => setOpenFormCreateSiteSpace(false);

  // --------------
  return (
    <>
      <PageContainer title="Manage Site Space" description="this is Dashboard page">
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
                data={tableRowSiteSpace}
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
      {/* Dialog create employee */}
      <Dialog
        open={openFormCreateSiteSpace}
        onClose={handleCloseModalCreateSiteSpace}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Site Space
          <IconButton
            aria-label="close"
            onClick={handleCloseModalCreateSiteSpace}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
                <Divider /> 
        <DialogContent>
          <br />
          <FormWizardAddSiteSpace />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
