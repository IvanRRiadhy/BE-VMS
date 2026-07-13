import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
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
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getAllCustomField,
  getAllCustomFieldPagination,
  deleteCustomField,
  getCustomFieldById,
} from 'src/customs/api/admin';
import {
  CreateCustomFieldRequest,
  Item,
  multiOptField,
  FieldType,
  CreateCustomFieldRequestSchema,
} from 'src/customs/api/models/Admin/CustomField';
import { IconSettings } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import CustomFieldDialog from './components/CustomFIeldDialog';

type CustomFieldTableRow = {
  id: string;
  name: string;
  display_text: string;
  field_type: string;
  multiple_option_fields: multiOptField[];
};

const Content = () => {
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<CustomFieldTableRow[]>([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableRowSite, setTableRowSite] = useState<CustomFieldTableRow[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<string | null>(null);
  const [shouldTrackChanges, setShouldTrackChanges] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const responseGet = await getAllCustomField();
        // const response = await getAllCustomFieldPagination(
        //   token,
        //   start,
        //   rowsPerPage,
        //   sortColumn,
        //   sortDir,
        //   searchKeyword,
        // );

        // const rows = responseGet.collection.map((item: Item) => ({
        //   id: item.id,
        //   name: item.short_name,
        //   display_text: item.long_display_text,
        //   field_type: FieldType[item.field_type],
        //   multiple_option_fields: item.multiple_option_fields,
        // }));

        const rows = responseGet.collection
          .filter((item: Item) => {
            if (!search) return true;

            const keyword = search.toLowerCase();

            return (
              item.short_name?.toLowerCase().includes(keyword) ||
              item.long_display_text?.toLowerCase().includes(keyword) ||
              FieldType[item.field_type]?.toLowerCase().includes(keyword)
            );
          })
          .map((item: Item) => ({
            id: item.id,
            name: item.short_name,
            display_text: item.long_display_text,
            remarks: item.remarks,
            field_type: FieldType[item.field_type],
            multiple_option_fields: item.multiple_option_fields,
          }));
        setTableRowSite(rows);
        setTableData(rows);
        setTotalRecords(responseGet.collection.length);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ refreshTrigger, search]);

  const [formDataAddCustomField, setFormDataAddCustomField] = useState<CreateCustomFieldRequest>(
    CreateCustomFieldRequestSchema.parse({}),
  );
  const isFormChanged =
    initialFormSnapshot !== null && JSON.stringify(formDataAddCustomField) !== initialFormSnapshot;

  const cards = [
    {
      title: 'Total Custom Field',
      subTitle: `${totalRecords}`,
      icon: IconSettings,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  const [openCreateCustomField, setOpenCreateCustomField] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const handleOpenDialog = () => {
    setOpenCreateCustomField(true);
  };
  const handleCloseDialog = () => {
    setOpenCreateCustomField(false);
    setInitialFormSnapshot(null);
    setShouldTrackChanges(false);
  };

  const handleAdd = () => {
    const data = CreateCustomFieldRequestSchema.parse({});

    setFormDataAddCustomField(data);
    setInitialFormSnapshot(JSON.stringify(data));
    setEdittingId('');
    handleOpenDialog();

    setTimeout(() => setShouldTrackChanges(true), 100);
  };

  const handleEdit = async (id: string) => {
    // const data = tableData.find((item) => item.id === id) || {};
    const data = await getCustomFieldById(id);

    const parsed = CreateCustomFieldRequestSchema.parse(data.collection);

    setFormDataAddCustomField(parsed);
    setInitialFormSnapshot(JSON.stringify(parsed));
    setEdittingId(id);

    handleOpenDialog();

    setTimeout(() => setShouldTrackChanges(true), 100);
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);

    if (pendingEditId) {
      const data = tableData.find((item) => item.id === pendingEditId);
      setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse(data || {}));
      setEdittingId(pendingEditId);
    } else {
      setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse({}));
      setEdittingId('');
    }

    setPendingEditId(null);
    handleCloseDialog();
  };

  const handleDialogClose = (_event: object, reason: string) => {
    if (reason === 'backdropClick') {
      if (isFormChanged) {
        setConfirmDialogOpen(true);
      } else {
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {


    const confirm = await showConfirmDelete('Are you sure you want to delete this custom field? ');

    if (confirm) {
      setLoading(true);
      try {
        await deleteCustomField(id);
        showSwal('success', 'Custom Field has been deleted.');
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        showSwal('error', 'Failed to delete custom field.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: CustomFieldTableRow[]) => {
    if ( rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteCustomField(row.id)));
        showSwal('success', `${rows.length} items of custom fields have been deleted.`);
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuccess = () => {
    handleCloseDialog();
    setRefreshTrigger(refreshTrigger + 1);
    if (edittingId) {
      showSwal('success', 'Custom Field successfully updated!');
    } else {
      showSwal('success', 'Custom Field successfully created!');
    }
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
      <Container title="Custom Field" description="Custom Field page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                isHavePagination={false}
                data={tableRowSite}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isNoActionTableHead={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                onCheckedChange={(selected) => {
                  setSelectedRows(selected);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
                isHaveObjectData={true}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <CustomFieldDialog
        open={openCreateCustomField}
        editingId={edittingId}
        formData={formDataAddCustomField}
        setFormData={setFormDataAddCustomField}
        isFormChanged={isFormChanged}
        onClose={handleCloseDialog}
        onConfirmClose={() => setConfirmDialogOpen(true)}
        onDialogClose={handleDialogClose}
        onSuccess={handleSuccess}
      />
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onDiscard={handleConfirmEdit}
      />
    </PageContainer>
  );
};

export default Content;
