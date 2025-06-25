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

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import {
  CreateDocumentRequest,
  CreateDocumentRequestSchema,
  Item,
} from 'src/customs/api/models/Document';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getAllDocumentPagination } from 'src/customs/api/admin';
import FormAddDocument from './FormAddDocument';

const Content = () => {
  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formDataAddDocument, setFormDataAddDocument] = useState<CreateDocumentRequest>(() => {
    const saved = localStorage.getItem('unsavedDocumentData');
    return saved ? JSON.parse(saved) : CreateDocumentRequestSchema.parse({});
  });

  const cards = [
    {
      title: 'Total Document',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllDocumentPagination(token, page, rowsPerPage, sortColumn);
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);
  useEffect(() => {
    localStorage.setItem('unsavedDocumentData', JSON.stringify(formDataAddDocument));
  }, [formDataAddDocument]);

  const [openFormAddDocument, setOpenFormAddDocument] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = React.useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenFormAddDocument(true);
  };
  const handleCloseDialog = () => setOpenFormAddDocument(false);

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedDocumentData');
    if (editing) {
      // If editing exists, show confirmation dialog for add
      setPendingEditId(null); // null means it's an add, not edit
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddDocument(CreateDocumentRequestSchema.parse({}));
      handleOpenDialog();
    }
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedDocumentData');
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
      setFormDataAddDocument(
        CreateDocumentRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
      );
      handleOpenDialog();
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      // Edit existing site
      setFormDataAddDocument(
        tableData.find((item) => item.id === pendingEditId) ||
          CreateDocumentRequestSchema.parse({}),
      );
    } else {
      // Add new site
      setFormDataAddDocument(CreateDocumentRequestSchema.parse({}));
    }
    handleOpenDialog();
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  return (
    <>
      <PageContainer title="Manage Document" description="this is Dashboard page">
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
                data={tableData}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveFilterMore={false}
                isHaveHeader={false}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog open={openFormAddDocument} onClose={handleCloseDialog} fullWidth maxWidth="md">
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
          <FormAddDocument
            formData={formDataAddDocument}
            setFormData={setFormDataAddDocument}
            edittingId={edittingId}
            onSuccess={() => {
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
            }}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Document. Are you sure you want to discard them and
          edit this Document?
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
