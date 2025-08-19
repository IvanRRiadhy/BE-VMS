import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  Button,
  Grid2 as Grid,
  IconButton,
  Skeleton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import { getIntegrationById } from 'src/customs/api/admin';
import { Item } from 'src/customs/api/models/Integration';
import {
  IconAccessPoint,
  IconBuilding,
  IconCode,
  IconRefresh,
  IconScript,
  IconUsersGroup,
} from '@tabler/icons-react';
import CloseIcon from '@mui/icons-material/Close';

const Content = () => {
  const { id } = useParams();
  const { token } = useSession();

  const [totals, setTotals] = useState({
    companies: 0,
    badge_types: 0,
    clear_codes: 0,
    controller_list: 0,
  });

  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState('companies');
  const [openFormType, setOpenFormType] = useState<
    'Companies' | 'Badge Type' | 'Clear Codes' | 'Controller List' | null
  >(null);

  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [searchKeyword, setSearchKeyword] = useState('');

  const cards = [
    {
      title: 'Companies',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Badge Type',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconUsersGroup,
      color: 'none',
    },
    {
      title: 'Clear Codes',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconCode,
      color: 'none',
    },
    {
      title: 'Controller List',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconAccessPoint,
      color: 'none',
    },
    {
      title: 'Sync Data',
      subTitle: '',
      subTitleSetting: 10,
      icon: IconRefresh,
      color: 'none',
      onIconClick: async (item: any) => {
        console.log('Mulai sinkronisasi', item.title);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // simulasi delay
        console.log('Sinkronisasi selesai');
      },
    },
  ];

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getIntegrationById(id as string, token);
        if (response.collection !== null) {
          setTableData([response.collection]);
        }
        if (response) {
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

  const [editDialogType, setEditDialogType] = useState<
    'Companies' | 'Badge Type' | 'Clear Codes' | 'Controller List' | null
  >(null);

  useEffect(() => {
    if (!editingRow) return; // jangan set kalau belum pilih row untuk edit

    let type: typeof editDialogType = null;
    if (selectedType === 'companies') type = 'Companies';
    else if (selectedType === 'badge_types') type = 'Badge Type';
    else if (selectedType === 'clear_codes') type = 'Clear Codes';
    else if (selectedType === 'controller_list') type = 'Controller List';
    setEditDialogType(type);
  }, [selectedType, editingRow]);

  // Function

  const handleCloseDialog = () => {
    setEditDialogType(null);
    setOpenFormType(null);
  };
  return (
    <>
      <PageContainer title="Integration Detail" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3} flexWrap={'wrap'}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>

            {/* column */}
            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                {isDataReady ? (
                  <DynamicTable
                    isHavePagination
                    // totalCount={totalRecords}
                    // defaultRowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    // onPaginationChange={(newPage, newRowsPerPage) => {
                    //   setPage(newPage);
                    //   setRowsPerPage(newRowsPerPage);
                    // }}
                    overflowX={'auto'}
                    data={tableData}
                    // selectedRows={selectedRows}
                    isHaveChecked={true}
                    isHaveAction={false}
                    isHaveActionOnlyEdit={true}
                    isHaveSearch={true}
                    isHaveFilter={false}
                    isHaveExportPdf={false}
                    isHaveExportXlf={false}
                    isHaveFilterDuration={false}
                    isHaveAddData={false}
                    // onBatchEdit={handleBatchEdit}
                    isHaveHeader={true}
                    headerContent={{
                      title: '',
                      // subTitle: formatDate(new Date()),
                      items: [
                        { name: 'companies' },
                        { name: 'badge type' },
                        { name: 'clear codes' },
                        { name: 'controller list' },
                      ],
                    }}
                    defaultSelectedHeaderItem="companies"
                    onHeaderItemClick={(item) => {
                      setSelectedType(item.name);
                    }}
                    onCheckedChange={(selected) => {
                      setSelectedRows(selected);
                    }}
                    onEdit={(row) => {
                      if (selectedType === 'companies') {
                        setEditDialogType('Companies');
                      } else if (selectedType === 'badge_types') {
                        setEditDialogType('Badge Type');
                      } else if (selectedType === 'clear_codes') {
                        setEditDialogType('Clear Codes');
                      } else if (selectedType === 'controller_list') {
                        setEditDialogType('Controller List');
                      }
                      setEditingRow(row);
                    }}
                    // onDelete={(row) => handleDelete(row.id, selectedType)}
                    // onBatchDelete={handleBatchDelete}
                    onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                    // onAddData={() => {
                    //   if (selectedType === 'organization') {
                    //     setOpenFormType('Organizations');
                    //   } else if (selectedType === 'department') {
                    //     setOpenFormType('Departments');
                    //   } else if (selectedType === 'district') {
                    //     setOpenFormType('Districts');
                    //   }
                    // }}
                    onFilterByColumn={(column) => {
                      setSortColumn(column.column);
                    }}
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
          </Grid>
        </Box>
      </PageContainer>
      <Dialog
        open={editDialogType === 'Companies'}
        // onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Companies
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {editDialogType === 'Companies' &&
            // <FormUpdateOrganization
            //   data={editingRow}
            //   isBatchEdit={isBatchEdit}
            //   selectedRows={selectedRows}
            //   enabledFields={enabledFields}
            //   setEnabledFields={setEnabledFields}
            //   onSuccess={() =>
            //     handleSuccess({ entity: 'organization', action: 'update', keepOpen: true })
            //   }
            // />
            null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
