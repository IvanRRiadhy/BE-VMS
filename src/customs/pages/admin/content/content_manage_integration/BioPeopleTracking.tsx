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
  Portal,
  Button,
  Grid2 as Grid,
  TextField,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
  Skeleton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import {
  IconBuilding,
  IconDeviceCctv,
  IconRefresh,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react';
import { Item } from 'src/customs/api/models/Integration';

const BioPeopleTracking = ({ id }: { id: string }) => {
  const { token } = useSession();

  const cards = [
    {
      title: 'Organizations',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'District',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Department',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Member',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Card',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Visitor',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconUsers,
      color: 'none',
    },
    {
      title: 'Visitor Blacklist',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconUserOff,
      color: 'none',
    },
    {
      title: 'Building',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Masked Area',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Floor Plan',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Floor',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Floor Plan Device',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Brand',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Access Control',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Ble Reader',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Access CCTV',
      subTitle: '0',
      subTitleSetting: 0,
      icon: IconDeviceCctv,
      color: 'none',
    },
    {
      title: 'Sync Data',
      subTitle: '',
      subTitleSetting: 10,
      icon: IconRefresh,
      color: 'none',
      onIconClick: async () => {},
    },
  ];

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [orgOptions, setOrgOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{
    open: boolean;
    text: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    text: '',
    severity: 'success',
  });

  const [editDialogType, setEditDialogType] = useState<
    | 'Organizations'
    | 'Districts'
    | 'Departments'
    | 'Members'
    | 'Card'
    | 'Visitor'
    | 'Visitor Blacklist'
    | 'Access CCTV'
    | 'Floor Plan'
    | 'Floor Plan Masked Area'
    | 'Floor Plan Device'
    | 'Brand'
    | 'Access Control'
    | 'Floor'
    | 'Building'
    | 'Ble Reader'
    | null
  >(null);
  const [selectedType, setSelectedType] = useState('organizations');
  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const headerMap: Record<string, string> = {
    organizations: 'Organization',
    districts: 'District',
    departments: 'Department',
    members: 'Member',
    card: 'Card',
    visitor: 'Visitor',
    visitor_blacklist: 'Visitor Blacklist',
    access_cctv: 'Access CCTV',
    floor: 'Floor',
    floor_plan: 'Floor Plan',
    floor_plan_masked_area: 'Floor Plan Masked Area',
    floor_plan_device: 'Floor Plan Device',
    brand: 'Brand',
    access_control: 'Access Control',
    building: 'Building',
    ble_reader: 'Ble Reader',
  };

  const TYPE_MAP: Record<
    string,
    | 'Organization'
    | 'District'
    | 'Department'
    | 'Member'
    | 'Card'
    | 'Visitor'
    | 'Visitor Blacklist'
    | 'Access Cctv'
    | 'Floor Plan'
    | 'Floor Plan Masked Area'
    | 'Floor Plan Device'
    | 'Brand'
    | 'Access Control'
    | 'Floor'
    | 'Building'
    | 'Ble Reader'
  > = {
    organizations: 'Organization',
    districts: 'District',
    departments: 'Department',
    members: 'Member',
    card: 'Card',
    visitor: 'Visitor',
    visitor_blacklist: 'Visitor Blacklist',
    access_cctv: 'Access Cctv',
    floor_plan: 'Floor Plan',
    floor_plan_masked_area: 'Floor Plan Masked Area',
    floor_plan_device: 'Floor Plan Device',
    brand: 'Brand',
    access_control: 'Access Control',
    floor: 'Floor',
    building: 'Building',
    ble_reader: 'Ble Reader',
  };

  const loadTotals = async () => {
    if (!token || !id) return;

    //   const [cRes, btRes, ccRes, bsRes] = await Promise.allSettled([
    //     getCompanies(id as string, token),
    //     getBadgeType(id as string, token),
    //     getClearcodes(id as string, token),
    //     getBadgeStatus(id as string, token),
    //   ]);

    //   setTotals({
    //     companies: cRes.status === 'fulfilled' ? getCount(cRes.value) : 0,
    //     badge_type: btRes.status === 'fulfilled' ? getCount(btRes.value) : 0,
    //     clear_codes: ccRes.status === 'fulfilled' ? getCount(ccRes.value) : 0,
    //     badge_status: bsRes.status === 'fulfilled' ? getCount(bsRes.value) : 0,
    //   });

    //   // (opsional) logging biar tau mana yang error
    //   if (cRes.status === 'rejected') console.warn('getCompanies failed:', cRes.reason);
    //   if (btRes.status === 'rejected') console.warn('getBadgeType failed:', btRes.reason);
    //   if (ccRes.status === 'rejected') console.warn('getClearcodes failed:', ccRes.reason);
    //   if (bsRes.status === 'rejected') console.warn('getBadgeStatus failed:', bsRes.reason);
    // };
  };

  useEffect(() => {
    loadTotals();
  }, [id, token]);

  const fetchListByType = async (type: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      // if (type === 'companies') {
      //   const res = await getCompanies(id as string, token);
      //   setListData(res.collection ?? []);
      // } else if (type === 'badge_type' || type === 'badge_types') {
      //   const res = await getBadgeType(id as string, token);
      //   setListData(res.collection ?? []);
      // } else if (type === 'clear_codes') {
      //   const res = await getClearcodes(id as string, token);
      //   setListData(res.collection ?? []);
      // } else if (type === 'badge_status') {
      //   const res = await getBadgeStatus(id as string, token);
      //   setListData(res.collection ?? []);
      // } else {
      //   setListData([]);
      // }
    } catch (e) {
      console.error('Fetch list error:', e);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // pertama kali juga fetch default 'companies'
    fetchListByType(selectedType);
    setIsDataReady(true);
  }, [selectedType, token, id]);

  // useEffect(() => {
  //   if (!editingRow) return;
  //   setEditDialogType(TYPE_MAP[selectedType] ?? null);
  // }, [selectedType, editingRow]);

  useEffect(() => {
    if (!token) return;
  }, [token, editDialogType]);

  return (
    <>
      <PageContainer
        title="Bio People Tracking Integration"
        description="Manage BioPeople Tracking Integration"
      >
        <Box>
          <Grid container spacing={3} flexWrap={'wrap'}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
            </Grid>

            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
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
                  data={listData}
                  selectedRows={selectedRows}
                  isHaveChecked={true}
                  isHaveAction={false}
                  isHaveActionOnlyEdit={true}
                  isHaveSearch={true}
                  isHaveFilter={false}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveAddData={false}
                  isHaveBooleanSwitch={true}
                  // onBatchEdit={handleBatchEdit}
                  isHaveHeader={true}
                  headerContent={{
                    items: Object.keys(headerMap).map((key) => ({
                      name: key,
                      label: headerMap[key],
                    })),
                  }}
                  defaultSelectedHeaderItem="organizations"
                  onHeaderItemClick={(item) => {
                    setSelectedType(item.name);
                  }}
                  onCheckedChange={(selected) => {
                    setSelectedRows(selected);
                  }}
                  // onEdit={handleEditRow}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  // onFilterByColumn={(column) => {
                  //   setSortColumn(column.column);
                  // }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* Organization */}
      {/* <Dialog
        open={editDialogType === 'Organizations'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Organization
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!badgeStatusForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <CustomFormLabel htmlFor="bs_name" sx={{ mt: 0 }}>
                  Name
                </CustomFormLabel>
                <CustomTextField
                  id="bs_name"
                  value={badgeStatusForm.name}
                  onChange={(e: any) =>
                    setBadgeStatusForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                <CustomTextField value={badgeStatusForm.honeywell_id} fullWidth disabled />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!badgeStatusForm || saving}
            onClick={async () => {}}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog> */}

      <Snackbar
        open={syncMsg.open}
        autoHideDuration={3000}
        onClose={() => setSyncMsg((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 9999 }} // di atas overlay saving
      >
        <Alert
          onClose={() => setSyncMsg((p) => ({ ...p, open: false }))}
          severity={syncMsg.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {syncMsg.text}
        </Alert>
      </Snackbar>
      <Portal>
        <Box
          sx={{
            display: saving ? 'flex' : 'none',
            position: 'fixed',
            inset: 0, // top:0,right:0,bottom:0,left:0
            zIndex: 9998, // > dialog (1300) dan drawer, < snackbar
            bgcolor: 'rgba(0,0,0,0.35)', // gelap transparan
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Portal>
      <Backdrop open={syncing} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default BioPeopleTracking;
