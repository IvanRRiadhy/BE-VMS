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
  Card,
  Skeleton,
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
import { deleteDocument, getAllDocumentPagination } from 'src/customs/api/admin';
import FormAddDocument from './FormAddDocument';
import { IconScript } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';

const Content = () => {
  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const cards = [
    {
      title: 'Total Document',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconScript,
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
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setIsDirty(false);
    setOpenFormAddDocument(true);
  };
  const handleCloseDialog = () => {
    setOpenFormAddDocument(false);
    localStorage.removeItem('unsavedDocumentData');
  };
  const defaultDoc = CreateDocumentRequestSchema.parse({});

  const isEmptyDoc = (doc: any) => {
    if (!doc || typeof doc !== 'object') return true;
    try {
      return JSON.stringify(doc) === JSON.stringify(defaultDoc);
    } catch {
      return false;
    }
  };

  const hasUnsaved = () => {
    const raw = localStorage.getItem('unsavedDocumentData');
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return !isEmptyDoc(parsed); // hanya true kalau beda dengan default
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    if (hasUnsaved()) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddDocument(CreateDocumentRequestSchema.parse({}));
      setOpenFormAddDocument(true);
    }
  };

  const handleEdit = (id: string) => {
    if (hasUnsaved()) {
      const parsed = JSON.parse(localStorage.getItem('unsavedDocumentData') as string);
      if (parsed?.id === id) {
        setOpenFormAddDocument(true);
      } else {
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddDocument(
        CreateDocumentRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
      );
      setOpenFormAddDocument(true);
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      setFormDataAddDocument(
        tableData.find((item) => item.id === pendingEditId) ||
          CreateDocumentRequestSchema.parse({}),
      );
    } else {
      setFormDataAddDocument(CreateDocumentRequestSchema.parse({}));
    }
    setOpenFormAddDocument(true);
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  useEffect(() => {
    if (!openFormAddDocument) return;
    localStorage.setItem('unsavedDocumentData', JSON.stringify({ ...formDataAddDocument }));
  }, [formDataAddDocument, openFormAddDocument]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      await deleteDocument(id, token);
      setRefreshTrigger((prev) => prev + 1);
      showSuccessAlert('Deleted!', 'Item has been deleted.');
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Failed to delete item.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Batch Delete
  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteDocument(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        setSelectedRows([]); // reset selected rows
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <PageContainer title="Manage Document" description="Document page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  overflowX={'auto'}
                  data={tableData}
                  selectedRows={selectedRows}
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
                  onCheckedChange={(selected) => setSelectedRows(selected)}
                  onEdit={(row) => {
                    handleEdit(row.id);
                    setEdittingId(row.id);
                  }}
                  onDelete={(row) => handleDelete(row.id)}
                  onBatchDelete={handleBatchDelete}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    handleAdd();
                  }}
                  htmlFields={['document_text']}
                  htmlClampLines={4}
                  htmlMaxWidth={500}
                />
              ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog open={openFormAddDocument} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
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
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormAddDocument
            formData={formDataAddDocument}
            setFormData={setFormDataAddDocument}
            edittingId={edittingId}
            onSuccess={() => {
              // handleCloseDialog();
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
