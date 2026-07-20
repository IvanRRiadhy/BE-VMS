import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { Item } from 'src/customs/api/models/Admin/Document';
import { useSession } from 'src/customs/contexts/SessionContext';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import FormApprove from './FormApprove';
import { deleteApprovalWorkflow } from 'src/customs/api/Admin/ApprovalWorkflow';
import {
  CreateApprovalWorkflowRequest,
  CreateApprovalWorkflowSchema,
} from 'src/customs/api/models/Admin/ApprovalWorfklow';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import useApprovalWorkflowMutation from 'src/hooks/ApprovalWorkflow/useApprovalWorkflowMutation';
import { useTranslation } from 'react-i18next';

const Content = ({
  tableData,
  loading,
  searchKeyword,
  setSearchKeyword,
  page,
  setPage,
}: any) => {
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  // const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [edittingId, setEdittingId] = useState('');
  const defaultApprovalWorkflow: CreateApprovalWorkflowRequest = {
    name: '',
    description: '',
    root_logic: 'AND',
    type: '',
    conditions: [],
  };
  const {
    deleteMutation,
  } = useApprovalWorkflowMutation();
  const [isDirty, setIsDirty] = useState(false);
  const [formAddApprovalWorkflow, setFormAddApprovalWorkflow] =
    useState<CreateApprovalWorkflowRequest>(defaultApprovalWorkflow);
  const { t } = useTranslation();

  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleCloseDialog = () => {
    if (isDirty) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
      return;
    }

    setOpenFormAddDocument(false);
    setEdittingId('');
    setIsDirty(false);
  };

  const handleAdd = useCallback(() => {
    if (isDirty) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
      return;
    }

    setEdittingId('');
    setFormAddApprovalWorkflow(defaultApprovalWorkflow);
    setOpenFormAddDocument(true);
  }, [isDirty]);

  const handleEdit = (id: string) => {
    if (isDirty) {
      setPendingEditId(id);
      setConfirmDialogOpen(true);
      return;
    }

    setEdittingId(id);
    setIsDirty(false);
    setOpenFormAddDocument(true);
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    setIsDirty(false);

    // discard dari tombol close
    if (!pendingEditId) {
      setOpenFormAddDocument(false);
      setEdittingId('');
      setFormAddApprovalWorkflow(defaultApprovalWorkflow);
      return;
    }

    // discard lalu pindah edit item lain
    setEdittingId(pendingEditId);
    setOpenFormAddDocument(true);
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {
    const confirm = await showConfirmDelete(
      t("confirmDelete", { name: "Approval Workflow" }),
    );

    if (!confirm) return;
    try {
      // await deleteApprovalWorkflow(id);
      await deleteMutation.mutateAsync(id);
      showSwal('success', t('deleteSuccess', { name: "Approval Workflow" }));
    } catch (error: any) {
      showSwal('error', error?.response.data.msg ?? t('deleteFailed', { name: "Approval Workflow" }));
    }

  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {

      try {
        await Promise.all(
          rows.map(row => deleteMutation.mutateAsync(row.id))
        );

        showSwal('success', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
      }
    }
  };


  const handleSuccessApprovalWorkflow = async () => {
    setIsDirty(false);
    setOpenFormAddDocument(false);
    setEdittingId('');
    setFormAddApprovalWorkflow(defaultApprovalWorkflow);
    await showSwal(
      'success',
      edittingId
        ? t('updateSuccess', { name: "Approval Workflow" })
        : t('createSuccess', { name: "Approval Workflow" }),
    );
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearchKeyword(keyword);
    },
    [setPage, setSearchKeyword],
  );

  return (
    <Container title="Approval Workflow" description="Approval Workflow">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              loading={loading}
              overflowX={'auto'}
              data={tableData}
              isHavePagination={true}
              selectedRows={selectedRows}
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 50, 100]}
              onPaginationChange={(page, rowsPerPage) => {
                setPage(page);
                setRowsPerPage(rowsPerPage);
              }}
              isHaveChecked={true}
              isHaveAction={true}
              isHaveSearch={true}
              currentPage={page}
              isHaveFilter={false}
              isHaveExportPdf={false}
              isHaveExportXlf={false}
              isHaveFilterDuration={false}
              isHaveAddData={true}
              isHaveFilterMore={false}
              isNoActionTableHead={true}
              isHaveHeader={false}
              onCheckedChange={(selected) => setSelectedRows(selected)}
              onEdit={(row) => handleEdit(row.id)}
              onDelete={(row) => handleDelete(row.id)}
              onBatchDelete={handleBatchDelete}
              searchKeyword={searchKeyword}
              onSearch={handleSearch}
              // onSearchKeywordChange={handleSearchKeywordChange}
              onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
              onAddData={handleAdd}
            />
          </Grid>
        </Grid>
      </Box>
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
            formData={formAddApprovalWorkflow}
            setFormData={setFormAddApprovalWorkflow}
            edittingId={edittingId}
            onSuccess={handleSuccessApprovalWorkflow}
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
    </Container>
  );
};

export default Content;
