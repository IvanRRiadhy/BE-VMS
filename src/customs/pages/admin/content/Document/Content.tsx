import { useCallback, useMemo, useState } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
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
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { getDocumentById } from 'src/customs/api/admin';

const Content = () => {
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDir] = useState('desc');
  const [edittingId, setEdittingId] = useState('');
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

  const cards = useMemo(
    () => [
      {
        title: t('totalDocument'),
        subTitle: `${totalRecords}`,
        icon: IconScript,
        color: 'none',
      },
    ],
    [t, totalRecords],
  );

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

  const handleEdit = async (id: string) => {
    const res = await getDocumentById(id);
    if (isDirty) {
      setPendingEditId(id);
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddDocument(
        CreateDocumentRequestSchema.parse(res.collection || {}),
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
    const confirm = await showConfirmDelete(t('confirmDelete', { name: 'Document' }));

    if (!confirm) return;
    try {
      await remove.mutateAsync({
        id,
      });
      showSwal('success', t('deleteSuccess', { name: 'Document' }));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || t('deleteFailed', { name: 'Document' }));
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(t('confirmDeleteMultiple', { count: rows.length, name: 'Document' }));

    if (confirmed) {
      try {
        await Promise.all(
          rows.map((row) => {
            remove.mutateAsync({
              id: row.id,
            });
          }),
        );

        showSwal('success', t('deleteSuccessMultiple', { count: rows.length, name: 'Document' }));
        setSelectedRows([]);
      } catch (error: any) {
        showSwal('error', error?.response?.data?.msg || t("deleteSuccessMultiple", { count: rows.length, name: 'Document' }));
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
      <GlobalBackdropLoading open={remove.isPending} />
    </PageContainer>
  );
};

export default Content;
