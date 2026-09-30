import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Switch,
} from '@mui/material';
import { IconCategory, IconX } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import {
  createIpsotekCategory,
  deleteIpsotekCategory,
  getAllIntegration,
  getAllVisitorType,
  getIntegrationById,
  getIntegrationIpsotekById,
  getIntegrationIpsotekCategory,
  getIntegrationIpsotekCategoryById,
  updateIpsotekCategory,
} from 'src/customs/api/admin';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useVisitorType } from 'src/hooks/VisitorType/useVisitorType';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useTranslation } from 'react-i18next';
const Ipsotek = ({ id: string, integrationName }: any) => {
  const { id } = useParams();
  const [categoryAll, setCategoryAll] = useState<any[]>([]);
  const [integration, setIntegration] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [openDialogCategory, setOpenDialogCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const { t } = useTranslation();
  const [formCategory, setFormCategory] = useState({
    category: '',
    visitor_type_id: '',
    integration_id: '',
    active: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const cards = useMemo(
    () => [
      // {
      //   title: 'Integration',
      //   subTitle: integrationName || '-',
      //   subTitleSetting: 1,
      //   icon: IconCategory,
      //   color: 'none',
      // },
      {
        title: 'Category',
        subTitle: '' + categoryAll.length,
        subTitleSetting: 1,
        icon: IconCategory,
        color: 'none',
      },
    ],
    [categoryAll.length],
  );

  const { visitorType } = useVisitorType();
  // const { data: integration = [] } = useIntegration();

  // const integrationMap = React.useMemo(() => {
  //   const map = new Map<string, string>();
  //   integration?.forEach((v) => {
  //     map.set(v.id, v.name);
  //   });
  //   return map;
  // }, [integration]);

  const fetchCategories = async () => {
    try {
      setLoadingData(true);

      const res = await getIntegrationIpsotekCategoryById(id);

      const data = (res.collection ?? []).map((item: any) => {
        const visitor = visitorType.find(
          (v: any) => String(v.id).toLowerCase() === String(item.visitor_type_id).toLowerCase(),
        );

        const { integration_id, visitor_type_id, active, ...rest } = item;

        return {
          ...rest,
          visitor_type: visitor?.name ?? '-',
          active,
        };
      });

      setCategoryAll(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllIntegration();
        setIntegration(res.collection ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleCloseDialogCategory = () => {
    setOpenDialogCategory(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(t('confirmDelete', { name: 'category' }));

    if (confirmed) {
      setLoading(true);
      try {
        await deleteIpsotekCategory(id);
        showSwal('success', t('deleteSuccess', { name: 'category' }));
        await fetchCategories();
        setOpenDialogCategory(false);
      } catch (error: any) {
        showSwal('error', error?.response?.data?.msg || 'Failed to delete integration.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormCategory({
      category: '',
      visitor_type_id: '',
      integration_id: '',
      active: false,
    });
    setOpenDialogCategory(true);
  };

  const handleEdit = async (row: any) => {
    try {
      setEditingId(row.id);
      setLoading(true);

      const edit = await getIntegrationIpsotekById(id as string, String(row.id));

      const data = edit?.collection ?? edit;

      setFormCategory({
        category: data?.category ?? '',
        visitor_type_id: data?.visitor_type_id ?? '',
        integration_id: data?.integration_id ?? id ?? '',
        active: data?.active ?? true,
      });

      setOpenDialogCategory(true);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error?.response?.data?.msg || 'Failed to get category detail');
    } finally {
      setLoading(false);
    }
  };

  const handleOnSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        category: formCategory.category,
        visitor_type_id: formCategory.visitor_type_id,
        integration_id: id,
        active: formCategory.active,
      };

      if (editingId) {
        await updateIpsotekCategory(editingId, payload);
        showSwal('success', 'Category successfully updated');
      } else {
        await createIpsotekCategory(payload, id as string);
        showSwal('success', 'Category successfully created');
      }
      await fetchCategories();
      setOpenDialogCategory(false);
    } catch (error: any) {
      showSwal('error', error?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/manage/integration');
  };

  const handleCopy = async (row: any) => {
    try {
      const value = row.id;

      if (!value) {
        showSwal('error', 'ID not found');
        return;
      }

      await navigator.clipboard.writeText(String(value));

      showSwal('success', 'Successfully copied ID');
    } catch (error) {
      showSwal('error', 'Failed to copy ID');
    }
  };

  const handleBooleanSwitchChange = async (rowId: string, field: string, value: boolean) => {
    const prev = categoryAll;

    // Optimistic update
    setCategoryAll((prevData) =>
      prevData.map((item) =>
        String(item.id).toLowerCase() === String(rowId).toLowerCase()
          ? { ...item, [field]: value }
          : item,
      ),
    );

    try {
      const payload = {
        [field]: value,
      };

      await updateIpsotekCategory(String(rowId), payload);

      showSwal('success', 'Successfully updated Ipsotek.');
    } catch (e: any) {
      // rollback kalau API gagal
      setCategoryAll(prev);

      showSwal('error', e?.response?.data?.msg || 'Failed to update status.');
    }
  };

  return (
    <PageContainer title="Ipsotek">
      <Box>
        {/* <Box mb={2}>
          <CustomFormLabel sx={{ mb: 0.5 }}>Integration</CustomFormLabel>

          <Box
            sx={{
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            {integrationName || 'Ipsotek'}
          </Box>
        </Box> */}
        <Grid container spacing={2} flexWrap={'wrap'}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              loading={loadingData}
              data={categoryAll}
              isHaveChecked={true}
              isHaveAction={true}
              isHaveBack={true}
              onBack={handleBack}
              isTitleIntegration={`${integrationName || 'Ipsotek'}`}
              isHaveHeaderTitle={true}
              titleHeader="Category"
              isHaveAddData={true}
              onDelete={(row) => handleDelete(row.id.toString())}
              onAddData={() => {
                handleAdd();
              }}
              onEdit={(row) => handleEdit(row)}
              isHaveBooleanSwitch={true}
              onCheckedChange={(selected) => {
                setSelectedRows(selected);
              }}
              onBooleanSwitchChange={handleBooleanSwitchChange}
              isCopy={true}
              onCopy={(row) => {
                handleCopy(row);
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialogCategory} onClose={handleCloseDialogCategory} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseDialogCategory}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers sx={{ padding: 2, paddingTop: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name">
                Category Name
              </CustomFormLabel>
              <CustomTextField
                id="category"
                value={formCategory.category}
                onChange={(e) => setFormCategory((prev) => ({ ...prev, category: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name">
                Visitor Type
              </CustomFormLabel>
              <Autocomplete
                options={visitorType}
                getOptionLabel={(opt: any) => opt.name || ''}
                value={
                  visitorType.find(
                    (v: any) =>
                      String(v.id).toLowerCase() ===
                      String(formCategory.visitor_type_id).toLowerCase(),
                  ) || null
                }
                onChange={(_, newValue: any) =>
                  setFormCategory((prev) => ({
                    ...prev,
                    visitor_type_id: newValue ? newValue.id : '',
                  }))
                }
                renderInput={(params) => (
                  <CustomTextField {...params} placeholder="Select Visitor Type" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name">
                Integration
              </CustomFormLabel>
              <Autocomplete
                options={integration}
                getOptionLabel={(opt: any) => opt.name || ''}
                value={integration.find((item: any) => item.id === id) || null}
                disabled
                renderInput={(params) => (
                  <CustomTextField {...params} placeholder="Select Integration" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name">
                Status (Inactive/ Active)
              </CustomFormLabel>
              <Switch
                checked={formCategory.active}
                onChange={(e) => setFormCategory((prev) => ({ ...prev, active: e.target.checked }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleOnSubmit} disabled={loading}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <GlobalBackdropLoading open={loading} />
    </PageContainer>
  );
};

export default Ipsotek;
