import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Grid2 as Grid,
  Button,
  Portal,
  Backdrop,
  CircularProgress,
  Divider,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { Box } from '@mui/system';
import Swal from 'sweetalert2';

interface SchedulerFormProps {
  timezoneData: any[];
  visitorTypeQuery: any[];
  siteDataQuery: any[];
  hostDataQuery: any[];
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  defaultValue?: any; // 👈 data untuk edit
  mode?: 'add' | 'edit'; // 👈 mode form
}

const SchedulerForm: React.FC<SchedulerFormProps> = ({
  timezoneData,
  visitorTypeQuery,
  siteDataQuery,
  hostDataQuery,
  onSubmit,
  loading = false,
  defaultValue,
  mode = 'add',
}) => {
  const [form, setForm] = useState({
    name: '',
    time_access: null as any,
    visitor_type: null as any,
    site: null as any,
    host: null as any,
    question_page: [] as any[],
  });

  const [originalVisitorTypeId, setOriginalVisitorTypeId] = useState<string | null>(null);
  useEffect(() => {
    if (defaultValue) {
      setOriginalVisitorTypeId(defaultValue.visitor_type_id ?? defaultValue.VisitorTypeId);
    }
  }, [defaultValue]);

  // 👇 Saat defaultValue berubah (misalnya user klik Edit), isi ulang form
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

      const matchedSite =
        siteDataQuery.find(
          (x) =>
            (x.id ?? x.Id)?.toLowerCase() ===
            (defaultValue.site_id ?? defaultValue.SiteId)?.toLowerCase(),
        ) ?? null;

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
        site: matchedSite,
        host: matchedHost,
        question_page: defaultValue.question_page ?? [],
      });
    }
  }, [defaultValue, timezoneData, visitorTypeQuery, siteDataQuery, hostDataQuery]);
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
        site_id: form.site?.id,
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
          site: null,
          host: null,
          question_page: [],
        });
        localStorage.removeItem('unsavedSchedulerData');
      }
    } catch (error: any) {
      // console.log(error);
      // console.log(error.response);
      // const backendMessage = error.msg || error.collection;

      // showSwal('error', backendMessage);
      
    }
  };

  // Simpan sementara ke localStorage
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

  return (
    <>
      <Grid container spacing={1}>
        {/* Name */}
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
        {/* Site */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel htmlFor="site">Site</CustomFormLabel>
          <Autocomplete
            id="site"
            options={siteDataQuery ?? []} // ✅ map langsung ke objek site
            getOptionLabel={(option) => option.name ?? ''}
            // isOptionEqualToValue={(option, value) => option.id === value?.id}
            value={form.site}
            onChange={(_, newValue) => handleChange('site', newValue)}
            renderInput={(params) => <CustomTextField {...params} />}
          />
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
          disabled={loading}
          sx={{ px: 3, textTransform: 'none' }}
        >
          {loading ? 'Saving...' : 'Submit'}
        </Button>
      </Box>
    </>
  );
};

export default SchedulerForm;
