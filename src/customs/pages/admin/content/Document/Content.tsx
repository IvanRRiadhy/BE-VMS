import { useCallback, useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Grid2 as Grid, IconButton } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  CreateDocumentRequest,
  CreateDocumentRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/Document';
import { useSession } from 'src/customs/contexts/SessionContext';
import { IconScript } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import PdfViewerDialog from './components/PdfViewerDialog';
import FormAddDocumentDialog from './components/FormDocumentDialog';
import { useDocumentPagination } from 'src/hooks/Documents/useDocumentPagination';
import { useDocumentMutation } from 'src/hooks/Documents/useDocumentMutation';

const Content = () => {
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDir] = useState('desc');
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [isDirty, setIsDirty] = useState(false);
  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [formDataAddDocument, setFormDataAddDocument] = useState<CreateDocumentRequest>(
    CreateDocumentRequestSchema.parse({}),
  );
  const { t } = useTranslation();
  const documentQuery = useDocumentPagination({
    page,
    rowsPerPage,
    sortDir,
    search,
  });

  const tableData = documentQuery.data?.collection ?? [];
  const totalRecords = documentQuery.data?.RecordsTotal ?? 0;
  const loading = documentQuery.isPending;
  const { remove } = useDocumentMutation();

  const cards = [
    {
      title: t('totalDocument'),
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      icon: IconScript,
      color: 'none',
    },
  ];

  const handleCloseDialog = () => {
    if (isDirty) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
      return;
    }

    setOpenFormAddDocument(false);
  };

  const handleAdd = useCallback(() => {
    if (isDirty) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddDocument(CreateDocumentRequestSchema.parse({}));
      setOpenFormAddDocument(true);
    }
  }, [isDirty]);

  const handleEdit = (id: string) => {
    if (isDirty) {
      setPendingEditId(id);
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddDocument(
        CreateDocumentRequestSchema.parse(tableData.find((item: any) => item.id === id) || {}),
      );
      setOpenFormAddDocument(true);
    }
  };

  const handleConfirmEdit = () => {
    setIsDirty(false);
    setConfirmDialogOpen(false);

    if (pendingEditId) {
      setFormDataAddDocument(
        tableData.find((item: any) => item.id === pendingEditId) ||
          CreateDocumentRequestSchema.parse({}),
      );

      setOpenFormAddDocument(false);
    } else {
      setFormDataAddDocument(CreateDocumentRequestSchema.parse({}));
      setOpenFormAddDocument(false);
    }

    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {
    const confirm = await showConfirmDelete('Are you sure you want to delete this document?');

    if (!confirm) return;
    try {
      await remove.mutateAsync({
        id,
      });
      showSwal('success', 'Successfully deleted document!');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showSwal('error', 'Failed to delete document.');
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      try {
        await Promise.all(
          rows.map((row) => {
            remove.mutateAsync({
              id: row.id,
            });
          }),
        );
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
      }
    }
  };

  const handleFileClick = (row: Item) => {
    if (!row.file) return;

    const fileUrl = row.file.startsWith('http')
      ? row.file
      : `${axiosInstance2.defaults.baseURL}/cdn/${row.file}`;

    setPdfUrl(fileUrl);
    setOpenPdfDialog(true);
  };

  const handleSuccess = () => {
    setIsDirty(false);
    setOpenFormAddDocument(false);
    setRefreshTrigger((prev) => prev + 1);
    setEdittingId('');
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Document" description="Document page">
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
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveAddData={true}
                isHavePdf={true}
                onFileClick={(row) => handleFileClick(row)}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                searchKeyword={search}
                onSearch={handleSearch}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={handleAdd}
                htmlFields={['document_text']}
                htmlClampLines={4}
                htmlMaxWidth={500}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <FormAddDocumentDialog
        open={openFormAddDocument}
        onClose={handleCloseDialog}
        initialData={formDataAddDocument}
        edittingId={edittingId}
        onSuccess={handleSuccess}
        onDirty={() => setIsDirty(true)}
      />

      <PdfViewerDialog
        open={openPdfDialog}
        onClose={() => setOpenPdfDialog(false)}
        pdfUrl={pdfUrl}
      />
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
    </PageContainer>
  );
};

export default Content;
