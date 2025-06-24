import React, { useEffect, useState } from 'react';
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

import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  Item,
} from 'src/customs/api/models/VisitorType';
import FormVisitorType from './FormVisitorType';

type VisitorTypeTableRow = {
  id: string;
  visitorType: string;
  documents: string[];
  isActive: boolean;
  needPhoto: boolean;
  printBadge: boolean;
  showIpad: boolean;
};

const Content = () => {
  const visitorTypeData: Item[] = [
    {
      id: '123',
      isActive: true,
      visitorType: 'Contractor',
      document: '{KTP}',
      needPhoto: true,
      printBadge: false,
      wifiCred: true,
      captureVisitorId: true,
      showIpad: true,
      videoURL: '',
      welcomeMessage: 'Welcome to Bio Experience',
      watchlistMessage: 'Ngapain Hayoo??!?',
      customBadge: '',
      signinDetails: {
        fullName: {
          display: 'Enter Your Full Name',
          status: true,
          mandatory: true,
        },
        email: {
          display: 'Enter Your Email',
          status: true,
          mandatory: true,
        },
        host: {
          display: 'Who is inviting you?',
          status: true,
          mandatory: true,
        },
        company: {
          display: 'Enter Your Company Name',
          status: true,
          mandatory: true,
        },
        phoneNumber: {
          display: 'Enter Your Phone Number',
          status: true,
          mandatory: true,
        },
      },
      signOutDetails: {},
      adminFields: {},
    },
    {
      id: '124',
      isActive: true,
      visitorType: 'Family Member',
      document: '{Kartu Keluarga, KTP}',
      needPhoto: true,
      printBadge: false,
      wifiCred: true,
      captureVisitorId: true,
      showIpad: false,
      videoURL: '',
      welcomeMessage: 'Welcome to Bio Experience',
      watchlistMessage: 'Ngapain Hayoo??!?',
      customBadge: '',
      signinDetails: {
        fullName: {
          display: 'Enter Your Full Name',
          status: true,
          mandatory: true,
        },
        email: {
          display: 'Enter Your Email',
          status: true,
          mandatory: true,
        },
        host: {
          display: 'Which Employee is your family?',
          status: true,
          mandatory: true,
        },
        company: {
          display: 'Enter Your Company Name',
          status: true,
          mandatory: true,
        },
        phoneNumber: {
          display: 'Enter Your Phone Number',
          status: true,
          mandatory: true,
        },
      },
      signOutDetails: {},
      adminFields: {},
    },
    {
      id: '125',
      isActive: true,
      visitorType: 'Tukang',
      document: '{KTP}',
      needPhoto: true,
      printBadge: false,
      wifiCred: false,
      captureVisitorId: false,
      showIpad: false,
      videoURL: '',
      welcomeMessage: 'Welcome to Bio Experience',
      watchlistMessage: 'Ngapain Hayoo??!?',
      customBadge: '',
      signinDetails: {
        fullName: {
          display: 'Enter Your Full Name',
          status: true,
          mandatory: true,
        },
        email: {
          display: 'Enter Your Email',
          status: true,
          mandatory: true,
        },
        host: {
          display: 'Who is inviting you?',
          status: true,
          mandatory: true,
        },
        company: {
          display: 'Enter Your Company Name',
          status: true,
          mandatory: true,
        },
        phoneNumber: {
          display: 'Enter Your Phone Number',
          status: true,
          mandatory: true,
        },
      },
      signOutDetails: {},
      adminFields: {},
    },
  ];
  const [formDataAddVisitorType, setFormDataAddVisitorType] = useState<CreateVisitorTypeRequest>(
    () => {
      const saved = localStorage.getItem('unsavedDocumentData');
      return saved ? JSON.parse(saved) : CreateVisitorTypeRequestSchema.parse({});
    },
  );
  const [tableRowVisitorType, setTableRowVisitorType] = React.useState<VisitorTypeTableRow[]>([]);

  const handleBooleanSwitch = (rowId: string, col: keyof VisitorTypeTableRow, checked: boolean) => {
    setTableRowVisitorType((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [col]: checked } : row)),
    );
  };

  useEffect(() => {
    const rows = visitorTypeData.map((item) => ({
      id: item.id,
      visitorType: item.visitorType,
      documents: item.document
        .replace(/[{}]/g, '')
        .split(',')
        .map((doc) => doc.trim())
        .filter(Boolean),
      isActive: item.isActive,
      needPhoto: item.needPhoto,
      printBadge: item.printBadge,
      showIpad: item.showIpad,
    }));
    setTableRowVisitorType(rows);
  }, []);

  const [openFormCreateVisitorType, setOpenFormCreateVisitorType] = React.useState(false);
  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    setOpenFormCreateVisitorType(false);
  };

  return (
    <>
      <PageContainer title="Manage Visitor Type" description="Visitor Type Page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            {/* <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid> */}
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableRowVisitorType}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                isHaveBooleanSwitch={true}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => console.log('Edit:', row)}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleOpenDialog();
                }}
                onBooleanSwitchChange={(row, col, checked) =>
                  handleBooleanSwitch(row, col as keyof VisitorTypeTableRow, checked)
                }
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog open={openFormCreateVisitorType} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Document
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormVisitorType
            formData={formDataAddVisitorType}
            setFormData={setFormDataAddVisitorType}
            onSuccess={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
