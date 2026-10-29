import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSites } from 'src/hooks/Sites/useSites';

import { getAssemblyPointById } from 'src/customs/api/Admin/Evacuate/index';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { Box } from '@mui/system';
import GlobalBackdropLoading from '../../../components/GlobalBackdrop';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useAssemblyPointPagination } from 'src/hooks/AssemblyPoint/useAssemblyPointPagination';
import useAssemblyPointMutation from 'src/hooks/AssemblyPoint/useAssemblyPointMutation';
import { useTranslation } from 'react-i18next';

interface AssemblyPointDialogProps {
  open: boolean;
  onClose: () => void;
}

interface AssemblyPointForm {
  site_id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  latitude: number;
  longitude: number;
}

const initialForm: AssemblyPointForm = {
  site_id: '',
  name: '',
  code: '',
  description: '',
  capacity: 0,
  latitude: 0,
  longitude: 0,
};

const AssemblyPointDialog = ({ open, onClose }: AssemblyPointDialogProps) => {
  const { data: sites = [] } = useSites();

  const [loading, setLoading] = useState(false);

  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssemblyPointForm>(initialForm);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data, isLoading, isFetching, error, refetch } = useAssemblyPointPagination({
    page,
    rowsPerPage,
    sortDir: 'desc',
    searchKeyword: search,
  });

  const assemblyPoints = (data?.collection ?? []).map(
    ({ site_name, name, code, description, capacity, latitude, longitude, id }) => ({
      site_name,
      name,
      code,
      description,
      capacity,
      latitude,
      longitude,
      id,
    }),
  );
  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.data?.RecordsFiltered ?? 0;
  const { createMutation, updateMutation, deleteMutation } = useAssemblyPointMutation();
  const handleChange = (field: keyof AssemblyPointForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(initialForm);

    setOpenForm(true);
  };

  const handleEdit = async (id: any) => {
    setLoading(true);

    try {
      const response = await getAssemblyPointById(id);
      const item = response?.collection ?? response?.data?.collection ?? response?.data ?? response;

      setEditingId(id);

      setForm({
        site_id: item.site_id ?? '',
        name: item.name ?? '',
        code: item.code ?? '',
        description: item.description ?? '',
        capacity: item.capacity ?? 0,
        latitude: item.latitude ?? 0,
        longitude: item.longitude ?? 0,
      });

      setOpenForm(true);
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg ?? 'Failed to load assembly point.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: AssemblyPointForm = {
        ...form,
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
        capacity: Number(form.capacity),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setOpenForm(false);
      setEditingId(null);
      setForm(initialForm);

      showSwal(
        'success',
        editingId ? 'Assembly Point updated successfully.' : 'Assembly Point created successfully.',
      );
      refetch();
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg ?? 'Failed to save assembly point.');
    }
  };

  const { t } = useTranslation();

  const handleDelete = async (id: any) => {
    if (!id) {
      //   setError('Assembly Point ID was not found.');
      showSwal('error', 'Assembly Point ID was not found.');
      return;
    }

    const confirmed = showConfirmDelete(t('confirmDelete', { name: 'Assembly Point' }));

    if (!confirmed) return;

    setLoading(true);

    try {
      await deleteMutation.mutateAsync(id);
      showSwal('success', 'Assembly Point deleted successfully.');
      refetch();
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg ?? 'Failed to delete assembly point.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const saving = createMutation.isPending || updateMutation.isPending;
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
        <DialogTitle>
          Assembly Point
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DynamicTable
            loading={isLoading || isFetching}
            data={assemblyPoints}
            isHaveAddData
            onAddData={handleAdd}
            isHaveSearch
            isHavePagination
            isHaveAction
            defaultRowsPerPage={rowsPerPage}
            totalCount={totalRecords}
            rowsPerPageOptions={[10, 50, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            currentPage={page}
            searchKeyword={search}
            onSearch={handleSearch}
            onEdit={(row) => {
              handleEdit(row.id);
            }}
            onDelete={(row) => handleDelete(row.id)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openForm} onClose={() => !saving && setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editingId ? 'Edit Assembly Point' : 'Add Assembly Point'}
          <IconButton
            aria-label="close"
            onClick={() => !saving && setOpenForm(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 0 }}>
              <CustomFormLabel sx={{ mt: 0 }}>
                <Typography variant="h6">Site</Typography>
              </CustomFormLabel>
              <Autocomplete
                options={sites}
                value={
                  sites.find((site: any) => (site.site_id ?? site.id) === form.site_id) ?? null
                }
                onChange={(_, newValue) => {
                  handleChange('site_id', newValue ? newValue.id ?? newValue.id : '');
                }}
                getOptionLabel={(option: any) => option.name ?? option.site_name ?? ''}
                isOptionEqualToValue={(option: any, value: any) =>
                  (option.site_id ?? option.id) === (value.site_id ?? value.id)
                }
                renderInput={(params) => (
                  <TextField {...params} label="" placeholder="Select site" required />
                )}
              />

              <CustomFormLabel>Name</CustomFormLabel>
              <CustomTextField
                label=""
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                fullWidth
                placeholder="Enter  name"
              />
              <CustomFormLabel>Code</CustomFormLabel>
              <CustomTextField
                label=""
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                fullWidth
                placeholder="Enter  code"
              />
              <CustomFormLabel>Description</CustomFormLabel>
              <CustomTextField
                label=""
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              <CustomFormLabel>Capacity</CustomFormLabel>

              <CustomTextField
                label=""
                type="number"
                value={form.capacity}
                onChange={(e) => handleChange('capacity', Number(e.target.value))}
                inputProps={{ min: 0 }}
                fullWidth
              />

              <Stack direction="row" spacing={2} width="100%">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <CustomFormLabel>Latitude</CustomFormLabel>
                  <CustomTextField
                    label=""
                    type="number"
                    value={form.latitude}
                    onChange={(e) =>
                      handleChange('latitude', e.target.value === '' ? '' : Number(e.target.value))
                    }
                    inputProps={{
                      step: 'any',
                      min: -90,
                      max: 90,
                    }}
                    fullWidth
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <CustomFormLabel>Longitude</CustomFormLabel>
                  <CustomTextField
                    label=""
                    type="number"
                    value={form.longitude}
                    onChange={(e) =>
                      handleChange('longitude', e.target.value === '' ? '' : Number(e.target.value))
                    }
                    inputProps={{
                      step: 'any',
                      min: -180,
                      max: 180,
                    }}
                    fullWidth
                  />
                </Box>
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenForm(false)} disabled={saving}>
              Cancel
            </Button>

            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <GlobalBackdropLoading open={saving} />
    </>
  );
};

export default AssemblyPointDialog;
