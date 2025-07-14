import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
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
  visitor_Type: string;
  documents: string[];
  is_Active: boolean;
  need_Photo: boolean;
  print_Badge: boolean;
  show_Ipad: boolean;
};

const Content = () => {
  const visitorTypeData: Item[] = [
    {
      id: '123',
      is_Active: true,
      visitor_Type: 'Contractor',
      document: '{KTP}',
      need_Photo: true,
      print_Badge: false,
      wifiCred: true,
      captureVisitorId: true,
      show_Ipad: true,
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
      is_Active: true,
      visitor_Type: 'Family Member',
      document: '{Kartu Keluarga, KTP}',
      need_Photo: true,
      print_Badge: false,
      wifiCred: true,
      captureVisitorId: true,
      show_Ipad: false,
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
      is_Active: true,
      visitor_Type: 'Tukang',
      document: '{KTP}',
      need_Photo: true,
      print_Badge: false,
      wifiCred: false,
      captureVisitorId: false,
      show_Ipad: false,
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
      const saved = localStorage.getItem('unsavedVisitorTypeData');
      return saved ? JSON.parse(saved) : CreateVisitorTypeRequestSchema.parse({});
    },
  );
  useEffect(() => {
    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(formDataAddVisitorType));
  }, [formDataAddVisitorType]);

  const [tableRowVisitorType, setTableRowVisitorType] = React.useState<VisitorTypeTableRow[]>([]);

  useEffect(() => {
    const rows = visitorTypeData.map((item) => ({
      id: item.id,
      visitor_Type: item.visitor_Type,
      documents: item.document
        .replace(/[{}]/g, '')
        .split(',')
        .map((doc) => doc.trim())
        .filter(Boolean),
      is_Active: item.is_Active,
      need_Photo: item.need_Photo,
      print_Badge: item.print_Badge,
      show_Ipad: item.show_Ipad,
    }));
    setTableRowVisitorType(rows);
  }, []);

  const [openFormCreateVisitorType, setOpenFormCreateVisitorType] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = React.useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    setOpenFormCreateVisitorType(false);
  };

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedVisitorTypeData');
    if (editing) {
      // If editing exists, show confirmation dialog for add
      setPendingEditId(null); // null means it's an add, not edit
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddVisitorType(CreateVisitorTypeRequestSchema.parse({}));
      handleOpenDialog();
    }
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedVisitorTypeData');
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id === id) {
        handleOpenDialog();
      } else {
        console.log('ID tidak cocok');
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddVisitorType(
        visitorTypeData.find((item) => item.id === id) || CreateVisitorTypeRequestSchema.parse({}),
      );
      handleOpenDialog();
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      // Edit existing site
      setFormDataAddVisitorType(
        visitorTypeData.find((item) => item.id === pendingEditId) ||
          CreateVisitorTypeRequestSchema.parse({}),
      );
    } else {
      // Add new site
      setFormDataAddVisitorType(CreateVisitorTypeRequestSchema.parse({}));
    }
    handleOpenDialog();
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleBooleanSwitch = (rowId: string, col: keyof VisitorTypeTableRow, checked: boolean) => {
    setTableRowVisitorType((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [col]: checked } : row)),
    );
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
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
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
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another site. Are you sure you want to discard them and edit
          this site?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Content;
