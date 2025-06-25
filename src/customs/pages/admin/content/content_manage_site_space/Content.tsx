import React, { useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormSite from './FormSite';
import CloseIcon from '@mui/icons-material/Close';
import {
  CreateSiteRequest,
  CreateSiteRequestSchema,
  Item,
  generateKeyCode,
} from 'src/customs/api/models/Sites';
import { uniqueId } from 'lodash';

type SiteTableRow = {
  id: string;
  siteName: string;
  address: string;
  status: string;
};

const Content = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const siteData: Item[] = [
    {
      id: '123',
      siteName: 'Museum Nasional',
      address: 'Sebuah Jalan',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      zipCode: '12345',
      timeZone: userTimeZone,
      code: generateKeyCode(),
      policyConfig: {
        consentType: 'explicit',
        document: '',
        period: 0,
      },
      settings: {
        facialRecog: false,
        signOutEnable: false,
        autoSignOutVisitor: false,
        autoSignOutEmployee: false,
        watchlistCheck: false,
        contactlessSignin: false,
        employeeSignEnable: false,
        status: true,
        reviewUnregistered: false,
        restrictHost: false,
        deliveryDropOff: false,
      },
    },
  ];
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

  const [formDataAddSite, setFormDataAddSite] = React.useState<CreateSiteRequest>(() => {
    const saved = localStorage.getItem('unsavedSiteForm');
    return saved ? JSON.parse(saved) : CreateSiteRequestSchema.parse({});
  });
  useEffect(() => {
    localStorage.setItem('unsavedSiteForm', JSON.stringify(formDataAddSite));
  }, [formDataAddSite]);

  const [tableRowSite, setTableRowSite] = React.useState<SiteTableRow[]>([]);

  useEffect(() => {
    console.log('siteData', siteData);
    const rows = siteData.map((item) => ({
      id: item.id,
      siteName: item.siteName,
      address: item.address,
      status: item.settings.status === true ? 'Active' : 'Inactive',
    }));

    setTableRowSite(rows);
  }, []);

  const cards = [{ title: 'Total Site', subTitle: '10', subTitleSetting: 10, color: 'none' }];

  // Create Site space state management
  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = React.useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenFormCreateSiteSpace(true);
  };
  const handleCloseModalCreateSiteSpace = () => setOpenFormCreateSiteSpace(false);

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedSiteForm');
    if (editing) {
      // If editing exists, show confirmation dialog for add
      setPendingEditId(null); // null means it's an add, not edit
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddSite(CreateSiteRequestSchema.parse({}));
      handleOpenDialog();
    }
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedSiteForm');
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
      setFormDataAddSite(
        siteData.find((item) => item.id === id) || CreateSiteRequestSchema.parse({}),
      );
      handleOpenDialog();
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      // Edit existing site
      setFormDataAddSite(
        siteData.find((item) => item.id === pendingEditId) || CreateSiteRequestSchema.parse({}),
      );
    } else {
      // Add new site
      setFormDataAddSite(CreateSiteRequestSchema.parse({}));
    }
    handleOpenDialog();
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  // --------------
  return (
    <>
      <PageContainer title="Manage Site Space" description="Site page">
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
                data={tableRowSite}
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
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
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
        maxWidth="lg"
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
          <FormSite
            formData={formDataAddSite}
            setFormData={setFormDataAddSite}
            onSuccess={handleCloseModalCreateSiteSpace}
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
