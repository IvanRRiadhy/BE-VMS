import React, { useEffect, useState } from 'react';
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
import { useSession } from 'src/customs/contexts/SessionContext';
import { getAllSitePagination } from 'src/customs/api/admin';

type SiteTableRow = {
  id: string;
  name: string;
  description: string;
};

const Content = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [tableData, setTableData] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableRowSite, setTableRowSite] = React.useState<SiteTableRow[]>([]);

  const siteData: Item[] = [
    {
      id: '123',
      type: 0,
      name: 'Museum Nasional',
      description: 'Sebuah Jalan',
      image: '/site/aa7aebf1-24da-49de-b53f-edbb7d6f62c1.png',
      can_visited: true,
      need_approval: false,
      type_approval: 0,
      can_signout: true,
      auto_signout: true,
      signout_time: '12:00:00',
      timezone: userTimeZone,
      map_link: '',
      can_contactless_login: true,
      need_document: false,
    },
  ];
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      console.log('Fetching data...');
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllSitePagination(token, start, rowsPerPage, sortColumn);
        console.log('Response from API:', response);
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setIsDataReady(true);
        console.log('Table data:', tableData);
        const rows = response.collection.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          // status: item.settings.status === true ? 'Active' : 'Inactive',
        }));

        setTableRowSite(rows);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);

  const [formDataAddSite, setFormDataAddSite] = React.useState<CreateSiteRequest>(() => {
    const saved = localStorage.getItem('unsavedSiteForm');
    return saved ? JSON.parse(saved) : CreateSiteRequestSchema.parse({});
  });
  useEffect(() => {
    localStorage.setItem('unsavedSiteForm', JSON.stringify(formDataAddSite));
  }, [formDataAddSite]);

  useEffect(() => {
    console.log('siteData', tableData);
  }, []);

  const cards = [{ title: 'Total Site', subTitle: `${totalFilteredRecords}`, subTitleSetting: 10, color: 'none' }];

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
        CreateSiteRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
      );
      handleOpenDialog();
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      console.log("Data: ", tableData);
      console.log('Edit ID:', tableData.find((item) => item.id === pendingEditId));
      // Edit existing site
      setFormDataAddSite(
        tableData.find((item) => item.id === pendingEditId) || CreateSiteRequestSchema.parse({}),
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
              isHavePagination={true}
              totalCount={totalFilteredRecords}
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              onPaginationChange={(page, rowsPerPage) => {
                setPage(page);
                setRowsPerPage(rowsPerPage);
              }}
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
