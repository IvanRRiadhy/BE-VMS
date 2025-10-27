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
import FormWizardAddOpeator from './FormScheduler';
import CloseIcon from '@mui/icons-material/Close';
import { IconUser } from '@tabler/icons-react';

const Content = () => {
  const tableRowOperators = [
    {
      id: 1,
      visitor_type: 'Employee',
      employee: 'John Doe',
      period_start: '2023-01-01',
      period_end: '2023-01-01',
      status: 'Active',
    },
  ];

  const cards = [
    {
      title: 'Total Scheduler',
      subTitle: '10',
      subTitleSetting: 10,
      icon: IconUser,
      color: 'none',
    },
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
      <PageContainer title="Manage Scheduler" description="this is Dashboard page">
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
                isHaveFilter={false}
                isHaveExportPdf={false}
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
