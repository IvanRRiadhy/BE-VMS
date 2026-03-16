import React, { useCallback, useEffect, useState } from 'react';
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
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import {
  CreateDocumentRequest,
  CreateDocumentRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/Document';
import { useSession } from 'src/customs/contexts/SessionContext';
import { deleteDocument, getAllDocumentPagination } from 'src/customs/api/admin';
// import FormAddDocument from './FormAddDocument';
import { IconCheck, IconScript } from '@tabler/icons-react';
import { showConfirmDelete, showErrorAlert, showSwal } from 'src/customs/components/alerts/alerts';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import FormApprove from './FormApprove';
import {
  deleteApprovalWorkflow,
  getApprovalWorkflowByDt,
  getApprovalWorkflowById,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import {
  CreateApprovalWorkflowRequest,
  CreateApprovalWorkflowSchema,
} from 'src/customs/api/models/Admin/ApprovalWorfklow';
import { set } from 'lodash';

const Content = () => {
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortDir, setSortDir] = useState('desc');
  const defaultApprovalWorkflow: CreateApprovalWorkflowRequest = {
    name: '',
    description: '',
    root_logic: 'AND',
    type: '',
    conditions: [],
  };
  const [formDataAddDocument, setFormDataAddDocument] = useState<CreateApprovalWorkflowRequest>(
    () => {
      const saved = localStorage.getItem('unsavedApprovalWorkflow');
      return saved ? JSON.parse(saved) : defaultApprovalWorkflow;
    },
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const cards = [
    {
      title: 'Total Approval Workflow',
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      icon: IconCheck,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getApprovalWorkflowByDt(
          token,
          start,
          rowsPerPage,
          sortDir,
          searchKeyword,
        );
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTableData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, sortDir, refreshTrigger, searchKeyword]);

  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleCloseDialog = () => {
    setOpenFormAddDocument(false);
    localStorage.removeItem('unsavedApprovalWorkflow');
    setEdittingId('');
  };
  const defaultDoc = defaultApprovalWorkflow;

  const isEmptyDoc = (doc: any) => {
    if (!doc || typeof doc !== 'object') return true;
    try {
      return JSON.stringify(doc) === JSON.stringify(defaultDoc);
    } catch {
      return false;
    }
  };

  const hasUnsaved = useCallback(() => {
    const raw = localStorage.getItem('unsavedApprovalWorkflow');
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.id && parsed.id === edittingId) return false;

      return !isEmptyDoc(parsed);
    } catch {
      return false;
    }
  }, [edittingId]);

  const handleAdd = useCallback(() => {
    if (hasUnsaved()) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddDocument(defaultApprovalWorkflow);
      setOpenFormAddDocument(true);
    }
  }, [hasUnsaved]);
  const handleEdit = (id: string) => {
    if (hasUnsaved()) {
      const parsed = JSON.parse(localStorage.getItem('unsavedApprovalWorkflow') as string);

      if (parsed?.id === id) {
        setOpenFormAddDocument(true);
        return;
      }

      setPendingEditId(id);
      setConfirmDialogOpen(true);
      return;
    }

    setEdittingId(id); // kirim id ke form
    setOpenFormAddDocument(true);
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);

    const item = tableData.find((item: any) => item.id === pendingEditId);
    if (item) {
      setFormDataAddDocument(CreateApprovalWorkflowSchema.parse(item));
    } else {
      setFormDataAddDocument(defaultApprovalWorkflow);
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
    localStorage.setItem('unsavedApprovalWorkflow', JSON.stringify({ ...formDataAddDocument }));
  }, [formDataAddDocument, openFormAddDocument]);

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirm = await showConfirmDelete(
      'Are you sure you want to delete this approval workflow?',
    );

    if (!confirm) return;
    try {
      setLoading(true);
      await deleteApprovalWorkflow(token, id);
      showSwal('success', 'Successfully deleted approval workflow!');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      showSwal('error', 'Failed to delete approval workflow.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteApprovalWorkflow(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        console.error(error);
        showSwal('error', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Approval Workflow" description="Approval Workflow">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableData}
                isHavePagination={true}
                selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveFilterMore={false}
                isHaveHeader={false}
                // onFileClick={(row) => handleFileClick(row)}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => handleAdd()}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog open={openFormAddDocument} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
          {edittingId ? 'Edit Approval Workflow' : 'Add Approval Workflow'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormApprove
            formData={formDataAddDocument}
            setFormData={setFormDataAddDocument}
            edittingId={edittingId}
            onSuccess={() => {
              localStorage.removeItem('unsavedApprovalWorkflow');
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
              setEdittingId('');
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
    </PageContainer>
  );
};

export default Content;
