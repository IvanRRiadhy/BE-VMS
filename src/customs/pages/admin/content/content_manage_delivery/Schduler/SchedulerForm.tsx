import React, { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete,
  Grid2 as Grid,
  Button,
  Portal,
  Backdrop,
  CircularProgress,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { Box } from '@mui/system';
import Swal from 'sweetalert2';
import { IconX } from '@tabler/icons-react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
interface Site {
  id: string;
  name: string;
  parent?: string | null;
  level?: number;
}

interface SchedulerFormProps {
  timezoneData: any[];
  visitorTypeQuery: any[];
  siteDataQuery: any[];
  hostDataQuery: any[];
  onSubmit: (data: any) => Promise<void>;
  defaultValue?: any;
  mode?: 'add' | 'edit';
}

const SchedulerForm: React.FC<SchedulerFormProps> = ({
  timezoneData,
  visitorTypeQuery,
  siteDataQuery,
  hostDataQuery,
  onSubmit,
  defaultValue,
  mode = 'add',
}) => {
  const [form, setForm] = useState({
    name: '',
    time_access: null as any,
    visitor_type: null as any,
    // site: null as any,
    site: [] as Site[],
    host: null as any,
    question_page: [] as any[],
  });

  const [originalVisitorTypeId, setOriginalVisitorTypeId] = useState<string | null>(null);
  useEffect(() => {
    if (defaultValue) {
      setOriginalVisitorTypeId(defaultValue.visitor_type_id ?? defaultValue.VisitorTypeId);
    }
  }, [defaultValue]);

  // console.log('site', siteDataQuery);
  const buildTreeOptions = (data: Site[]) => {
    const result: (Site & { level: number })[] = [];
    const validIds = new Set(data.map((x) => x.id));

    const walk = (parentId: string | null, level: number) => {
      data
        .filter((x) => {
          if (parentId === null) {
            return !x.parent || !validIds.has(x.parent);
          }
          return x.parent === parentId;
        })
        .forEach((x) => {
          result.push({ ...x, level });
          walk(x.id, level + 1);
        });
    };

    walk(null, 0);
    return result;
  };

  const [selectedSites, setSelectedSites] = useState<Site[]>([]);
  const [checkedSiteIds, setCheckedSiteIds] = useState<string[]>([]);

  const treeSiteOptions = useMemo(() => buildTreeOptions(siteDataQuery ?? []), [siteDataQuery]);

  useEffect(() => {
    if (defaultValue) {
      const matchedTimeAccess =
        timezoneData.find(
          (x) =>
            (x.id ?? x.Id)?.toLowerCase() ===
            (defaultValue.time_access_id ?? defaultValue.TimeAccessId)?.toLowerCase(),
        ) ?? null;

      const matchedVisitorType =
        visitorTypeQuery.find(
          (x) =>
            (x.id ?? x.Id)?.toLowerCase() ===
            (defaultValue.visitor_type_id ?? defaultValue.VisitorTypeId)?.toLowerCase(),
        ) ?? null;

      // const matchedSite =
      //   siteDataQuery.find(
      //     (x) =>
      //       (x.id ?? x.Id)?.toLowerCase() ===
      //       (defaultValue.site_id ?? defaultValue.SiteId)?.toLowerCase(),
      //   ) ?? null;
      const siteIds =
        typeof defaultValue.site_id === 'string'
          ? defaultValue.site_id.split(',').map((x: string) => x.trim())
          : [];

      const matchedSites = treeSiteOptions.filter((x) => siteIds.includes(x.id));

      const matchedSite = matchedSites.length > 0 ? matchedSites : null;

      const matchedHost =
        hostDataQuery.find(
          (x) =>
            (x.id ?? x.Id)?.toLowerCase() ===
            (defaultValue.host_id ?? defaultValue.HostId)?.toLowerCase(),
        ) ?? null;

      console.log('✅ matchedSite', matchedSite);

      setForm({
        name: defaultValue.name ?? '',
        time_access: matchedTimeAccess,
        visitor_type: matchedVisitorType,
        // site: matchedSite,
        site: matchedSites,
        host: matchedHost,
        question_page: defaultValue.question_page ?? [],
      });
    }
  }, [defaultValue, timezoneData, visitorTypeQuery, siteDataQuery, hostDataQuery, treeSiteOptions]);
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (
        mode === 'edit' &&
        originalVisitorTypeId &&
        originalVisitorTypeId !== form.visitor_type?.id
      ) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Visitor Type Changed',
          text: 'Changing the visitor type will remove all existing schedule configurations related to this visitor type. Do you want to continue?',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          reverseButtons: true,
          cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;
      }
      const payload = {
        // id: defaultValue?.id,
        // id: form.id,
        name: form.name,
        time_access_id: form.time_access?.id,
        visitor_type_id: form.visitor_type?.id,
        // site_id: form.site?.id,
        site_id: form.site.map((s) => s.id).join(','),
        host_id: form.host?.id,
        question_page: form.question_page ?? [],
      };

      console.log('📦 Payload to submit:', payload);
      await onSubmit(payload);

      if (mode === 'add') {
        setForm({
          name: '',
          time_access: null,
          visitor_type: null,
          site: [] as Site[],
          host: null,
          question_page: [],
        });
        localStorage.removeItem('unsavedSchedulerData');
      }
    } catch (error: any) {
      const backendMessage = error.msg || error.collection;

      showSwal('error', backendMessage);
    }
  };

  useEffect(() => {
    localStorage.setItem('unsavedSchedulerData', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (!form.visitor_type) return;

    const selectedType = visitorTypeQuery.find((v) => v.id === form.visitor_type.id);

    if (selectedType?.section_page_visitor_types?.length) {
      const mappedQuestionPage = selectedType.section_page_visitor_types.map((section: any) => ({
        id: section.Id,
        sort: section.sort ?? 0,
        name: section.name,
        status: 0,
        is_document: section.is_document ?? false,
        can_multiple_used: section.can_multiple_used ?? false,
        self_only: false,
        foreign_id: section.foreign_id ?? '',
        form: (section.visit_form ?? []).map((f: any, i: number) => ({
          sort: f.sort ?? i,
          short_name: f.short_name,
          long_display_text: f.long_display_text,
          field_type: f.field_type,
          is_primary: f.is_primary ?? false,
          is_enable: f.is_enable ?? false,
          mandatory: f.mandatory ?? false,
          remarks: f.remarks ?? '',
          multiple_option_fields: f.multiple_option_fields ?? [],
          visitor_form_type: f.visitor_form_type ?? 1,
          answer_text: null,
          answer_datetime: null,
          answer_file: null,
        })),
      }));

      setForm((prev) => ({
        ...prev,
        question_page: mappedQuestionPage,
      }));
    } else {
      setForm((prev) => ({ ...prev, question_page: [] }));
    }
  }, [form.visitor_type]);

  const dummySites = [
    { id: 'site-1', name: 'Gedung SINERGI' },
    { id: 'site-2', name: 'Gedung Visitor' },
    { id: 'site-3', name: 'Gedung B' },
  ];

  const [sites, setSites] = useState<{ site_id: string }[]>([]);
  const handleAddSite = () => {
    setSites((prev) => [...prev, { site_id: '' }]);
  };

  const handleRemoveSite = (index: number) => {
    setSites((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeSite = (index: number, value: string) => {
    setSites((prev) => prev.map((row, i) => (i === index ? { site_id: value } : row)));
  };
  const [inputValue, setInputValue] = useState('');
  const [selectedSiteParentIds, setSelectedSiteParentIds] = useState<string[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [siteTree, setSiteTree] = useState<any[]>([]);

  const siteParentOptions = useMemo(() => {
    return siteDataQuery.filter((s) => !s.parent || !siteDataQuery.some((x) => x.id === s.parent));
  }, [siteDataQuery]);

  const renderTree = (node: any, onChange: any) => {
    const checked = selectedSiteIds.includes(node.id);

    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <FormControlLabel
            control={
              <Checkbox checked={checked} onChange={(e) => onChange(node, e.target.checked)} />
            }
            label={node.name}
          />
        }
      >
        {node.children?.map((child: any) => renderTree(child, onChange))}
      </TreeItem>
    );
  };

  const buildSiteTree = (sites: Site[], parentId: string): any[] => {
    return sites
      .filter((s) => s.parent?.toLowerCase() === parentId.toLowerCase())
      .map((s) => ({
        id: s.id,
        name: s.name,
        children: buildSiteTree(sites, s.id),
      }));
  };

  const buildSiteTreeWithParent = (sites: Site[], parentId: string) => {
    const parent = sites.find((s) => s.id.toLowerCase() === parentId.toLowerCase());
    if (!parent) return [];

    return [
      {
        id: parent.id,
        name: parent.name,
        children: buildSiteTree(sites, parentId),
      },
    ];
  };

  // const handleSitePlaceChange = (node: any, checked: boolean) => {
  //   const childIds = collectAllChildIds(node);

  //   setSelectedSiteIds((prev) => {
  //     if (checked) {
  //       return Array.from(new Set([...prev, node.id, ...childIds]));
  //     }
  //     return prev.filter((id) => id !== node.id && !childIds.includes(id));
  //   });
  // };

  const handleSitePlaceChange = (node: any, checked: boolean) => {
    setSelectedSiteIds((prev) => {
      if (checked) {
        return [...prev, node.id];
      }
      return prev.filter((id) => id !== node.id);
    });
  };

  const collectAllChildIds = (node: any): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((c: any) => [c.id, ...collectAllChildIds(c)]);
  };

  useEffect(() => {
    if (selectedSiteIds.length === 0) {
      setForm((prev) => ({ ...prev, site: [] }));
      return;
    }

    const selectedSites = siteDataQuery.filter((s) => selectedSiteIds.includes(s.id));

    setForm((prev) => ({
      ...prev,
      site: selectedSites,
    }));
  }, [selectedSiteIds, siteDataQuery]);

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
            Name
          </CustomFormLabel>
          <CustomTextField
            id="name"
            fullWidth
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </Grid>
        {/* Time Access */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="time_access">Time Access</CustomFormLabel>
          <Autocomplete
            id="time_access"
            options={timezoneData ?? []}
            getOptionLabel={(option) => option.name ?? ''}
            value={form.time_access}
            onChange={(_, newValue) => handleChange('time_access', newValue)}
            renderInput={(params) => <CustomTextField {...params} />}
          />
        </Grid>

        {/* Visitor Type */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="visitor_type">Visitor Type</CustomFormLabel>
          <Autocomplete
            id="visitor_type"
            options={visitorTypeQuery ?? []}
            getOptionLabel={(option) => option.name ?? ''}
            value={form.visitor_type}
            onChange={(_, newValue) => handleChange('visitor_type', newValue)}
            renderInput={(params) => <CustomTextField {...params} />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="site">Site</CustomFormLabel>
          <Autocomplete
            multiple
            size="small"
            options={siteParentOptions}
            getOptionLabel={(option) => option.name}
            inputValue={inputValue}
            onInputChange={(_, newValue, reason) => {
              if (reason !== 'input') return;
              setInputValue(newValue);
            }}
            filterOptions={(opts, state) => {
              if (state.inputValue.length < 3) return [];
              return opts.filter((opt) =>
                opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
              );
            }}
            noOptionsText={
              inputValue.length < 3 ? 'Enter at least 3 characters to search' : 'Not found'
            }
            value={siteParentOptions.filter((opt) => selectedSiteParentIds.includes(opt.id))}
            onChange={(_, newValues) => {
              const parentIds = newValues.map((v) => v.id);

              setSelectedSiteParentIds(parentIds);
              setInputValue('');

              const trees = parentIds.flatMap((pid) => buildSiteTreeWithParent(siteDataQuery, pid));
              setSiteTree(trees);
              setSelectedSiteIds((prev) =>
                prev.filter((id) =>
                  trees.some((t) => [t.id, ...collectAllChildIds(t)].includes(id)),
                ),
              );
            }}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Enter at least 3 characters to search"
                fullWidth
              />
            )}
          />
          {siteTree.length > 0 && (
            <Box mt={1}>
              <SimpleTreeView>
                {siteTree.map((node) => renderTree(node, handleSitePlaceChange))}
              </SimpleTreeView>
            </Box>
          )}
        </Grid>

        {/* Host */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="host">Host</CustomFormLabel>
          <Autocomplete
            id="host"
            options={hostDataQuery ?? []}
            getOptionLabel={(option) => option.name ?? ''}
            value={form.host}
            onChange={(_, newValue) => handleChange('host', newValue)}
            renderInput={(params) => <CustomTextField {...params} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }}></Grid>
      </Grid>
      <Divider sx={{ mt: 1 }} />
      <Box
        mt={1}
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          // disabled={loading}
          sx={{ px: 3, textTransform: 'none' }}
        >
          {/* {loading ? <CircularProgress size={20} /> : 'Submit'} */}
          Submit
        </Button>
      </Box>
    </>
  );
};

export default SchedulerForm;
