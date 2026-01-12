import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Autocomplete,
  CardActions,
  Button,
  DialogActions,
  Portal,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { IconCategory, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  createIpsotekCategory,
  deleteIpsotekCategory,
  getAllIntegration,
  getAllVisitorType,
  getIntegrationIpsotekCategory,
  updateIpsotekCategory,
} from 'src/customs/api/admin';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
const Ipsotek = ({ id: string }: any) => {
  const { token } = useSession();
  const { id } = useParams();
  const [categoryAll, setCategoryAll] = useState<any[]>([]);
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [integration, setIntegration] = useState<any[]>([]);
  const [openDialogCategory, setOpenDialogCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formCategory, setFormCategory] = useState({
    category: '',
    visitor_type_id: '',
    integration_id: '',
    active: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const cards = [
    {
      title: 'Category',
      subTitle: categoryAll.length.toString(),
      subTitleSetting: 1,
      icon: IconCategory,
      color: 'none',
    },
  ];
  const visitorTypeMap = React.useMemo(() => {
    const map = new Map<string, string>();
    visitorType.forEach((v) => {
      map.set(v.id, v.name);
    });
    return map;
  }, [visitorType]);

  const integrationMap = React.useMemo(() => {
    const map = new Map<string, string>();
    integration.forEach((v) => {
      map.set(v.id, v.name);
    });
    return map;
  }, [integration]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getIntegrationIpsotekCategory(token as string);

        // const mapped = (res.collection ?? []).map((item: any) => ({
        //   ...item,
        //   visitor_type_id: visitorTypeMap.get(item.visitor_type_id) || '-',
        //   integration_id: integrationMap.get(item.integration_id) || '-',
        // }));

        // setCategoryAll(mapped);
        setCategoryAll(res.collection ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllVisitorType(token as string);
        setVisitorType(res.collection ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllIntegration(token as string);
        setIntegration(res.collection ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  const handleCloseDialogCategory = () => {
    setOpenDialogCategory(false);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure you want to delete this category?');

    if (confirmed) {
      setLoading(true);
      try {
        await deleteIpsotekCategory(id, token);
        showSwal('success', 'Successfully deleted integration!');
        setOpenDialogCategory(false);
      } catch (error) {
        console.error(error);
        showSwal('error', 'Failed to delete integration.');
      } finally {
        setTimeout(() => setLoading(false), 500);
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

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setFormCategory({
      category: row.category ?? '',
      visitor_type_id: row.visitor_type_id ?? '',
      integration_id: row.integration_id ?? '',
      active: row.active ?? true,
    });
    setOpenDialogCategory(true);
  };
  const handleOnSubmit = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const payload = {
        category: formCategory.category,
        visitor_type_id: formCategory.visitor_type_id,
        integration_id: formCategory.integration_id,
        active: formCategory.active,
      };

      if (editingId) {
        await updateIpsotekCategory(editingId, payload, token);
        showSwal('success', 'Category successfully updated');
      } else {
        await createIpsotekCategory(payload, id as string, token);
        showSwal('success', 'Category successfully created');
      }

      setOpenDialogCategory(false);

      // refresh list
      const res = await getIntegrationIpsotekCategory(token);
      setCategoryAll(res.collection ?? []);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Ipsotek">
      <Box>
        <Grid container spacing={2} flexWrap={'wrap'}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              loading={loading}
              data={categoryAll}
              isHaveChecked={true}
              isHaveAction={true}
              isHaveHeaderTitle={true}
              titleHeader="Category"
              isDataVerified={true}
              isHaveAddData={true}
              onDelete={(row) => handleDelete(row.id.toString())}
              onAddData={() => {
                handleAdd();
              }}
              onEdit={(row) => handleEdit(row)}
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
                value={visitorType.find((v) => v.id === formCategory.visitor_type_id) || null}
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
                value={integration.find((i) => i.id === formCategory.integration_id) || null}
                onChange={(_, newValue: any) =>
                  setFormCategory((prev) => ({
                    ...prev,
                    integration_id: newValue ? newValue.id : '',
                  }))
                }
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
          <Button variant="contained" color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleOnSubmit} disabled={loading}>
            {editingId ? 'Submit' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (t) => 99999,
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Ipsotek;
