import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  IconButton,
  Grid2 as Grid,
  MenuItem,
  Typography,
  Autocomplete,
  Checkbox,
} from '@mui/material';
import { Box } from '@mui/system';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useHost } from 'src/hooks/useHost';
import { useSites } from 'src/hooks/useSites';
import { useVisitorType } from 'src/hooks/useVisitorType';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreateLink: (payload: any) => void;
  onSendEmail: (payload: any) => void;
}

type FieldKey =
  | 'visitorType'
  | 'agenda'
  | 'visitStart'
  | 'visitEnd'
  | 'expiredLink'
  | 'visitorQuota'
  | 'site'
  | 'host';

const CreateLinkDialog = ({ open, onClose, onSendEmail, onCreateLink }: Props) => {
  const { data: host = [] } = useHost();
  const { data: sites = [] } = useSites();
  const { data: visitorType = [] } = useVisitorType();

  const initialEnabledState = {
    visitorType: false,
    agenda: false,
    visitStart: false,
    visitEnd: false,
    expiredLink: false,
    visitorQuota: false,
    site: false,
    host: false,
  };

  const initialFormState = {
    host: null,
    site_id: null,
    visitor_type_id: null,
    agenda: '',
    visitor_period_start: null,
    visitor_period_end: null,
    expired_number: 0,
    max_usage: 0,
    is_single_use: false,
  };

  const [form, setForm] = useState({
    host: null as any,
    site_id: null as any,
    visitor_type_id: null as any,
    agenda: '',
    visitor_period_start: null as string | null,
    visitor_period_end: null as string | null,
    expired_number: 0,
    max_usage: 0,
    is_single_use: false,
  });

  const [enabled, setEnabled] = useState(initialEnabledState);

  const resetState = () => {
    setEnabled(initialEnabledState);
    setForm(initialFormState);
    setSelectedSiteParentIds([]);
    setSelectedSiteIds([]);
    setSiteTree([]);
  };

  const handleToggle = (key: FieldKey, checked: boolean) => {
    setEnabled((prev) => ({ ...prev, [key]: checked }));
  };

  const buildPayload = () => {
    return {
      host: enabled.host ? (form.host?.id ?? null) : null,
      agenda: enabled.agenda ? form.agenda : null,
      visitor_type_id: enabled.visitorType ? (form.visitor_type_id?.id ?? null) : null,
      site_id: enabled.site ? form.site_id : null,
      visitor_period_start: enabled.visitStart ? form.visitor_period_start : null,
      visitor_period_end: enabled.visitEnd ? form.visitor_period_end : null,
      // link_active_at: new Date().toISOString(),
      expired_number: enabled.expiredLink ? form.expired_number : 0,
      max_usage: enabled.visitorQuota ? form.max_usage : 0,
      is_single_use: form.is_single_use,
      // tz: 'Asia/Jakarta',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };

  const handleCreateLink = (sendEmail: boolean) => {
    const payload = buildPayload();

    if (sendEmail) {
      onSendEmail(payload);
    } else {
      onCreateLink(payload);
    }

    resetState();
    onClose();
  };

  const [selectedSiteParentIds, setSelectedSiteParentIds] = useState<string[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [siteTree, setSiteTree] = useState<any[]>([]);

  const buildSiteTree = (
    sites: any[],
    parentId: string | null,
  ): {
    id: string;
    name: string;
    children?: {
      id: string;
      name: string;
      children?: { id: string; name: string; children?: any[] }[];
    }[];
  }[] => {
    return sites
      .filter((s) => {
        const siteParent = s.parent ? s.parent.toLowerCase() : null;
        const target = parentId ? parentId.toLowerCase() : null;
        return siteParent === target;
      })
      .map((s) => ({
        id: s.id,
        name: s.name,
        children: buildSiteTree(sites, s.id),
      }));
  };
  const rootTree = useMemo(() => buildSiteTree(sites, null), [sites]);

  const buildSiteTreeWithParent = (sites: any[], parentId: string) => {
    const parent = sites.find((s) => s.id === parentId);
    if (!parent) return [];

    return [{ id: parent.id, name: parent.name, children: buildSiteTree(sites, parentId) }];
  };

  // const renderTreeSite = (node: any) => {
  //   const checked = selectedSiteIds.includes(node.id);

  //   return (
  //     <TreeItem
  //       key={node.id}
  //       itemId={node.id}
  //       label={
  //         <Box display="flex" alignItems="center" gap={1}>
  //           <Checkbox
  //             size="small"
  //             checked={checked}
  //             onMouseDown={(e) => e.stopPropagation()}
  //             onClick={(e) => e.stopPropagation()}
  //             onChange={(e) => {
  //               const isChecked = e.target.checked;

  //               setSelectedSiteIds((prev) => {
  //                 let updated = [...prev];

  //                 if (isChecked) {
  //                   if (!updated.includes(node.id)) {
  //                     updated.push(node.id);
  //                   }
  //                 } else {
  //                   updated = updated.filter((id) => id !== node.id);
  //                 }

  //                 // simpan ke form sebagai CSV
  //                 setForm((prevForm) => ({
  //                   ...prevForm,
  //                   site_id: updated.join(','),
  //                 }));

  //                 return updated;
  //               });
  //             }}
  //           />
  //           <Typography variant="body2">{node.name}</Typography>
  //         </Box>
  //       }
  //     >
  //       {node.children?.map((child: any) => renderTreeSite(child))}
  //     </TreeItem>
  //   );
  // };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Link Invitation</DialogTitle>

      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* HOST */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Host</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.host}
                onChange={(e) => handleToggle('host', e.target.checked)}
              />
            </Stack>
            <Autocomplete
              disabled={!enabled.host}
              options={host}
              getOptionLabel={(option: any) => option.name ?? ''}
              value={form.host}
              onChange={(_, value) => setForm((prev) => ({ ...prev, host: value }))}
              renderInput={(params) => <CustomTextField {...params} placeholder="Select Host" />}
            />
          </Grid>

          {/* SITE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Site</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.site}
                onChange={(e) => handleToggle('site', e.target.checked)}
              />
            </Stack>

            {/* PARENT SELECTOR */}
            <Autocomplete
              // multiple
              size="small"
              disabled={!enabled.site}
              // options={sites.filter((s) => !s.parent)} // hanya parent
              options={sites}
              getOptionLabel={(option: any) => option.name ?? ''}
              // value={sites.filter((s) => selectedSiteParentIds.includes(s.id))}
              // value={form.site_id}
              value={sites.find((s) => s.id === form.site_id) || null}
              // onChange={(_, newValues) => {
              //   const parentIds = newValues.map((v: any) => v.id);
              //   setSelectedSiteParentIds(parentIds);

              //   const trees = parentIds.flatMap((pid) => buildSiteTreeWithParent(sites, pid));

              //   setSiteTree(trees);
              // }}
              // onlly one site no parant
              onChange={(_, value) => {
                setForm((prev) => ({ ...prev, site_id: value?.id }));
              }}
              renderInput={(params) => (
                <CustomTextField {...params} placeholder="Select Site" fullWidth />
              )}
            />

            {/* TREE */}
            {/* {enabled.site && siteTree.length > 0 && (
              <Box mt={2}>
                <SimpleTreeView>{siteTree.map((node) => renderTreeSite(node))}</SimpleTreeView>
              </Box>
            )} */}
          </Grid>

          {/* VISITOR TYPE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Type</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitorType}
                onChange={(e) => handleToggle('visitorType', e.target.checked)}
              />
            </Stack>

            <Autocomplete
              disabled={!enabled.visitorType}
              options={visitorType}
              getOptionLabel={(option: any) => option.name ?? ''}
              value={form.visitor_type_id}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  visitor_type_id: value,
                }))
              }
              renderInput={(params) => (
                <CustomTextField {...params} placeholder="Select Visitor Type" sx={{ mt: 1 }} />
              )}
            />
          </Grid>

          {/* AGENDA */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Agenda</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.agenda}
                onChange={(e) => handleToggle('agenda', e.target.checked)}
              />
            </Stack>

            <CustomTextField
              fullWidth
              disabled={!enabled.agenda}
              sx={{ mt: 1 }}
              placeholder="Enter your agenda"
              value={form.agenda}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  agenda: e.target.value,
                }))
              }
            />
          </Grid>

          {/* VISIT START */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visit Start</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitStart}
                onChange={(e) => handleToggle('visitStart', e.target.checked)}
              />
            </Stack>

            <CustomTextField
              type="datetime-local"
              fullWidth
              disabled={!enabled.visitStart}
              sx={{ mt: 1 }}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  visitor_period_start: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                }))
              }
            />
          </Grid>

          {/* VISIT END */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visit End</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitEnd}
                onChange={(e) => handleToggle('visitEnd', e.target.checked)}
              />
            </Stack>

            <CustomTextField
              type="datetime-local"
              fullWidth
              disabled={!enabled.visitEnd}
              sx={{ mt: 1 }}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  visitor_period_end: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                }))
              }
            />
          </Grid>

          {/* EXPIRED */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Expired Link</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.expiredLink}
                onChange={(e) => handleToggle('expiredLink', e.target.checked)}
              />
            </Stack>

            <CustomSelect
              fullWidth
              disabled={!enabled.expiredLink}
              sx={{
                mt: 1,
                '&.Mui-disabled': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              value={form.expired_number}
              onChange={(e: any) =>
                setForm((prev) => ({
                  ...prev,
                  expired_number: Number(e.target.value),
                }))
              }
            >
              <MenuItem value={0}>No Expired</MenuItem>
              <MenuItem value={30}>30 Min</MenuItem>
              <MenuItem value={60}>1 Hour</MenuItem>
              <MenuItem value={300}>5 Hour</MenuItem>
              <MenuItem value={1440}>1 Day</MenuItem>
              <MenuItem value={10080}>7 Days</MenuItem>
              <MenuItem value={43200}>30 Days</MenuItem>
              <MenuItem value={129600}>3 Month</MenuItem>
              <MenuItem value={259200}>6 Month</MenuItem>
              <MenuItem value={525600}>1 Year</MenuItem>
            </CustomSelect>
          </Grid>

          {/* QUOTA */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Quota Limit</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitorQuota}
                onChange={(e) => handleToggle('visitorQuota', e.target.checked)}
              />
            </Stack>

            <CustomTextField
              type="text"
              fullWidth
              disabled={!enabled.visitorQuota}
              sx={{
                mt: 1,
                '&.Mui-disabled': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              value={form.max_usage}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  max_usage: Number(e.target.value),
                }))
              }
            />

            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Enter the maximum number of visitors allowed. Use 0 for no limit.
            </Typography>
          </Grid>
        </Grid>
        {/* is single of use */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={form.is_single_use}
                onChange={(e) => setForm((prev) => ({ ...prev, is_single_use: e.target.checked }))}
              />
            }
            label="Single Use Link"
          />
          <br />
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Enable this option to allow the link to be used only once. After the first use, the link
            will become inactive.
          </Typography>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" fullWidth onClick={() => handleCreateLink(false)}>
          Create Link
        </Button>

        <Button variant="outlined" fullWidth onClick={() => handleCreateLink(true)}>
          Create Link And Send Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLinkDialog;
