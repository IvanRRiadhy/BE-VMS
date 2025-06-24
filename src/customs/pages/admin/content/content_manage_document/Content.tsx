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

  const [openFormAddDocument, setOpenFormAddDocument] = React.useState(false);
  const handleOpenDialog = () => {
    setOpenFormAddDocument(true);
  };
  const handleCloseDialog = () => setOpenFormAddDocument(false);

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
                onEdit={(row) => console.log('Edit:', row)}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleOpenDialog();
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
            onSuccess={() => {
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
