import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  MenuItem,
  IconButton,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Button as MuiButton,
} from '@mui/material';
import { Box } from '@mui/system';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';

import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  FormVisitorTypes,
  SectionPageVisitorType,
  UpdateVisitorTypeRequest,
  updateVisitorTypeSchmea,
} from 'src/customs/api/models/VisitorType';
import { IconTrash } from '@tabler/icons-react';
import {
  createVisitorType,
  getAllCustomFieldPagination,
  getAllDocument,
  updateVisitorType,
} from 'src/customs/api/admin';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface FormVisitorTypeProps {
  formData: CreateVisitorTypeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorTypeRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
}

const FormVisitorType: React.FC<FormVisitorTypeProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();
  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const isStepSkipped = (step: number) => skipped.has(step);
  const [documents, setDocument] = useState<any[]>([]);
  const [customField, setCustomField] = useState<any[]>([]);
  const [openCustomFieldModal, setOpenCustomFieldModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Daftar field yang hanya boleh angka
    const numberOnlyFields = ['duration_visit', 'max_time_visit', 'grace_time', 'period'];

    if (numberOnlyFields.includes(id)) {
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    } else {
      // Untuk field lain (boleh karakter apa saja)
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleMultipleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;

    const selectedValues = typeof value === 'string' ? value.split(',') : (value as string[]);

    const mapped = selectedValues.map((val) => ({ document_id: val }));

    setFormData((prev) => ({
      ...prev,
      [name!]: mapped,
    }));
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');
        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }

      const transformedSections = sectionsData.map((section) => ({
        sort: section.sort,
        name: section.name,
        status: 1,
        is_document: section.is_document,
        can_multiple_used: section.can_multiple_used,
        foreign_id: section.foreign_id || '',
        visit_form: section.visit_form.map((field) => {
          const matchedField = customField.find((f) => f.id === field.custom_field_id);
          return {
            sort: field.sort ?? 0,
            short_name: field.short_name ?? '',
            long_display_text: field.long_display_text ?? '',
            is_primary: field.is_primary ?? false,
            is_enable: field.is_enable ?? false,
            mandatory: field.mandatory ?? false,
            field_type: field.field_type ?? matchedField?.field_type ?? 0,
            remarks: field.remarks ?? '',
            custom_field_id: field.custom_field_id ?? '',
            multiple_option_fields: matchedField?.multiple_option_fields ?? [],
            visitor_form_type: 1,
            document_id: field.document_id ?? '',
          };
        }),
        pra_form: section.pra_form.map((field) => {
          const matchedField = customField.find((f) => f.id === field.custom_field_id);
          return {
            sort: field.sort ?? 0,
            short_name: field.short_name ?? '',
            long_display_text: field.long_display_text ?? '',
            is_primary: field.is_primary ?? false,
            is_enable: field.is_enable ?? false,
            mandatory: field.mandatory ?? false,
            field_type: field.field_type ?? matchedField?.field_type ?? 0,
            remarks: field.remarks ?? '',
            custom_field_id: field.custom_field_id ?? '',
            multiple_option_fields: field.multiple_option_fields?.length
              ? field.multiple_option_fields
              : matchedField?.multiple_option_fields ?? [],
            visitor_form_type: 0,
            document_id: field.document_id ?? '',
          };
        }),
        checkout_form: section.checkout_form.map((field) => {
          const matchedField = customField.find((f) => f.id === field.custom_field_id);
          return {
            sort: field.sort ?? 0,
            short_name: field.short_name ?? '',
            long_display_text: field.long_display_text ?? '',
            is_primary: field.is_primary ?? false,
            is_enable: field.is_enable ?? false,
            mandatory: field.mandatory ?? false,
            field_type: field.field_type ?? matchedField?.field_type ?? 0,
            remarks: field.remarks ?? '',
            custom_field_id: field.custom_field_id ?? '',
            multiple_option_fields: field.multiple_option_fields?.length
              ? field.multiple_option_fields
              : matchedField?.multiple_option_fields ?? [],
            visitor_form_type: 2,
            document_id: field.document_id ?? '',
          };
        }),
      }));

      const data: CreateVisitorTypeRequest = {
        ...formData,
        duration_visit: Number(formData.duration_visit),
        max_time_visit: Number(formData.max_time_visit),
        grace_time: Number(formData.grace_time),
        period: Number(formData.period),
        section_page_visitor_types: transformedSections,
      };

      console.log('Submit data : ', JSON.stringify(data, null, 2));

      const parseData: CreateVisitorTypeRequest = CreateVisitorTypeRequestSchema.parse(data);

      if (edittingId) {
        const parsedUpdateData: UpdateVisitorTypeRequest = updateVisitorTypeSchmea.parse({
          ...data,
          id: edittingId,
        });

        await updateVisitorType(token, edittingId, parsedUpdateData);
        setAlertType('success');
        setAlertMessage('Visitor type updated successfully!');
      } else {
        await createVisitorType(token, parseData);
        // setSectionsData([]);
        setAlertType('success');
        setAlertMessage('Visitor type created successfully!');
      }

      localStorage.removeItem('unsavedVisitorTypeData');
      // ✅ delay agar user bisa lihat alert dulu
      setTimeout(() => {
        // onSuccess?.(); // Tutup dialog/modal dilakukan di parent saat sukses
        setLoading(false); // Pastikan loading ditutup setelah onSuccess
      }, 1000);
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
      setLoading(false); // ⛔️ penting: jangan taruh di timeout
    }
  };

  // const renderDetailRows = (
  //   details: FormVisitorTypes[] | any,
  //   onChange: (index: number, field: keyof FormVisitorTypes, value: any) => void,
  //   onDelete?: (index: number) => void,
  //   showMandatory = true,
  //   isDocument = false,
  //   canMultiple = false,
  //   sectionKey?: SectionKey, // 🔑 tambahin param sectionKey
  // ) => {
  //   if (!Array.isArray(details)) {
  //     console.error('Expected array for details, but got:', details);
  //     return (
  //       <TableRow>
  //         <TableCell colSpan={5}>Invalid data format</TableCell>
  //       </TableRow>
  //     );
  //   }

  //   // whitelist untuk pra_form
  //   const PRA_FORM_ALLOWED = ['name', 'email', 'phone', 'organization'];

  //   return details.map((item, index) => (
  //     <TableRow key={index}>
  //       <TableCell>
  //         <TextField
  //           select
  //           size="small"
  //           value={item.short_name}
  //           onChange={(e) => {
  //             const selectedShortName = e.target.value;
  //             const matchedField = customField.find((f) => f.short_name === selectedShortName);

  //             onChange(index, 'short_name', selectedShortName);

  //             if (matchedField) {
  //               onChange(index, 'custom_field_id', matchedField.id);
  //               onChange(index, 'remarks', matchedField.remarks);
  //               onChange(index, 'field_type', matchedField.field_type);
  //               onChange(
  //                 index,
  //                 'multiple_option_fields',
  //                 matchedField.multiple_option_fields ?? [],
  //               );
  //             }
  //           }}
  //           placeholder="Select Field"
  //           fullWidth
  //         >
  //           {customField
  //             .filter((field) => {
  //               if (sectionKey === 'pra_form') {
  //                 return PRA_FORM_ALLOWED.includes(field.remarks); // 🔑 batasi hanya name/email/phone/organization
  //               }
  //               if (isDocument) {
  //                 return field.field_type >= 10 && field.field_type <= 12;
  //               } else if (canMultiple) {
  //                 return field.field_type >= 0 && field.field_type <= 12;
  //               } else {
  //                 return field.field_type >= 0 && field.field_type <= 9;
  //               }
  //             })
  //             .map((field) => (
  //               <MenuItem key={field.id} value={field.short_name}>
  //                 {field.short_name}
  //               </MenuItem>
  //             ))}
  //         </TextField>
  //       </TableCell>

  //       <TableCell>
  //         <TextField
  //           size="small"
  //           value={item.long_display_text}
  //           onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
  //           placeholder="Display Text"
  //         />
  //       </TableCell>

  //       <TableCell align="left">
  //         <Switch
  //           checked={!!item.is_enable}
  //           onChange={(_, checked) => onChange(index, 'is_enable', checked)}
  //         />
  //       </TableCell>

  //       {showMandatory && (
  //         <TableCell align="left">
  //           <Switch
  //             checked={!!item.mandatory}
  //             onChange={(_, checked) => onChange(index, 'mandatory', checked)}
  //           />
  //         </TableCell>
  //       )}

  //       {onDelete && (
  //         <TableCell align="center">
  //           <IconButton onClick={() => onDelete(index)} size="small">
  //             <IconTrash fontSize="small" />
  //           </IconButton>
  //         </TableCell>
  //       )}
  //     </TableRow>
  //   ));
  // };

  useEffect(() => {
    if (!formData.can_parking) {
      setSectionsData((prevSections) =>
        prevSections.map((s) => {
          if (
            s.name.toLowerCase().includes('parking') ||
            s.name.toLowerCase().includes('vehicle information')
          ) {
            return {
              ...s,
              visit_form: (s.visit_form || []).filter(
                (f) =>
                  !['Vehicle Type', 'Vehicle Plate', 'Is Driving/Riding'].includes(
                    f.short_name || '',
                  ),
              ),
            };
          }
          return s;
        }),
      );
      return;
    }

    setSectionsData((prevSections) => {
      const updated = [...prevSections];
      const targetIndex = updated.findIndex(
        (s) =>
          s.name.toLowerCase().includes('parking') ||
          s.name.toLowerCase().includes('vehicle information'),
      );

      if (targetIndex === -1) return prevSections;

      const section = { ...updated[targetIndex] };
      section.visit_form = [...(section.visit_form || [])];

      // definisi field yang wajib ada
      const requiredShortNames = ['Vehicle Type', 'Vehicle Plate', 'Is Driving/Riding'];

      for (const short of requiredShortNames) {
        const exists = section.visit_form.some((f) => f.short_name === short);
        if (!exists) {
          // cari dari customField agar field_type, remarks dll sinkron
          const matchedField = customField.find(
            (f) => f.short_name === short || f.remarks === short,
          );

          section.visit_form.push({
            sort: section.visit_form.length,
            short_name: short, // <-- ini penting, field name
            long_display_text: '',
            is_enable: false,
            is_primary: false,
            mandatory: false,
            field_type: matchedField?.field_type ?? 0,
            remarks: matchedField?.remarks ?? short,
            custom_field_id: matchedField?.id ?? '',
            multiple_option_fields: matchedField?.multiple_option_fields ?? [],
          });
        }
      }

      updated[targetIndex] = section;
      return updated;
    });
  }, [formData.can_parking, customField]);

  const renderDetailRows = (
    details: FormVisitorTypes[] | any,
    onChange: (index: number, field: keyof FormVisitorTypes, value: any) => void,
    onDelete?: (index: number) => void,
    showMandatory = true,
    isDocument = false,
    canMultiple = false,
    sectionKey?: SectionKey, // <- penting
    sectionName?: string,
  ) => {
    if (!Array.isArray(details)) {
      console.error('Expected array for details, but got:', details);
      return (
        <TableRow>
          <TableCell colSpan={5}>Invalid data format</TableCell>
        </TableRow>
      );
    }

    // whitelist rules
    const WHITELIST: Record<SectionKey, Record<string, string[]>> = {
      pra_form: {
        'Purpose Visit': [
          'host',
          'agenda',
          'site_place',
          'visitor_period_start',
          'visitor_period_end',
        ],
        default: ['name', 'email', 'phone', 'organization'],
      },
      checkout_form: {
        default: ['visitor_code'],
      },
      visit_form: {
        default: [], // bebas (pakai rules field_type)
      },
    };

    return details.map((item, index) => (
      <TableRow key={index}>
        <TableCell>
          <TextField
            select
            size="small"
            value={item.short_name}
            onChange={(e) => {
              const selectedShortName = e.target.value;
              const matchedField = customField.find((f) => f.short_name === selectedShortName);

              onChange(index, 'short_name', selectedShortName);

              if (matchedField) {
                onChange(index, 'custom_field_id', matchedField.id);
                onChange(index, 'remarks', matchedField.remarks);
                onChange(index, 'field_type', matchedField.field_type);
                onChange(
                  index,
                  'multiple_option_fields',
                  matchedField.multiple_option_fields ?? [],
                );
              }
            }}
            placeholder="Select Field"
            fullWidth
          >
            {customField
              .filter((field) => {
                if (!sectionKey) return true;

                const whitelist =
                  WHITELIST[sectionKey]?.[sectionName ?? ''] ??
                  WHITELIST[sectionKey]?.default ??
                  [];

                if (whitelist.length) {
                  // Cek baik remarks maupun short_name
                  return (
                    whitelist.includes(field.remarks?.toLowerCase()) ||
                    whitelist.includes(field.short_name?.toLowerCase())
                  );
                }

                // fallback rules lama
                if (isDocument) return field.field_type >= 10 && field.field_type <= 12;
                if (canMultiple) return field.field_type >= 0 && field.field_type <= 12;
                return field.field_type >= 0 && field.field_type <= 9;
              })
              .map((field) => (
                <MenuItem key={field.id} value={field.short_name}>
                  {field.short_name}
                </MenuItem>
              ))}
          </TextField>
        </TableCell>

        <TableCell>
          <TextField
            size="small"
            value={item.long_display_text}
            onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
            placeholder="Display Text"
          />
        </TableCell>

        <TableCell align="left">
          <Switch
            checked={!!item.is_enable}
            onChange={(_, checked) => onChange(index, 'is_enable', checked)}
          />
        </TableCell>

        {showMandatory && (
          <TableCell align="left">
            <Switch
              checked={!!item.mandatory}
              onChange={(_, checked) => onChange(index, 'mandatory', checked)}
            />
          </TableCell>
        )}

        {onDelete && (
          <TableCell align="center">
            <IconButton onClick={() => onDelete(index)} size="small">
              <IconTrash fontSize="small" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  type SectionKey = 'visit_form' | 'pra_form' | 'checkout_form';

  const handleAddDetail = (sectionKey: SectionKey) => {
    setSectionsData((prev) =>
      prev.map((section, sectionIndex) => {
        if (sectionIndex === activeStep - 1) {
          const currentDetails = Array.isArray(section[sectionKey]) ? section[sectionKey] : [];
          const sortIndex = currentDetails.length;

          const newItem: FormVisitorTypes = {
            sort: sortIndex,
            short_name: '',
            long_display_text: '',
            is_enable: false,
            is_primary: true,
            field_type: 0,
            remarks: '', // akan diisi setelah short_name dipilih
            custom_field_id: '', // akan diisi setelah short_name dipilih
            multiple_option_fields: [],
            mandatory: false,
          };

          return {
            ...section,
            [sectionKey]: [...currentDetails, newItem],
          };
        }
        return section;
      }),
    );
  };
  const handleDetailChange = (
    sectionKey: SectionKey,
    index: number,
    field: keyof FormVisitorTypes,
    value: any,
  ) => {
    console.log(`Changing [${sectionKey}][${index}].${String(field)} =`, value);
    setSectionsData((prev) =>
      prev.map((section, i) => {
        if (i === activeStep - 1) {
          const originalFields = section[sectionKey];
          if (!Array.isArray(originalFields)) {
            console.error(`Expected array for ${sectionKey}, got:`, originalFields);
            return section; // jangan ubah kalau tidak valid
          }

          const updatedFields = [...originalFields];
          updatedFields[index] = {
            ...updatedFields[index],
            [field]: value,
          };

          return {
            ...section,
            [sectionKey]: updatedFields,
          };
        }
        return section;
      }),
    );
  };

  const handleDeleteDetail = (sectionKey: SectionKey, indexToRemove: number) => {
    setSectionsData((prev) =>
      prev.map((section, index) => {
        if (index === activeStep - 1) {
          const originalFields = section[sectionKey];
          if (!Array.isArray(originalFields)) return section;

          const updatedFields = originalFields.filter((_, idx) => idx !== indexToRemove);

          return {
            ...section,
            [sectionKey]: updatedFields,
          };
        }
        return section;
      }),
    );
  };

  const [newSectionName, setNewSectionName] = useState('');
  const [sectionsData, setSectionsData] = useState<SectionPageVisitorType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [dynamicSteps, setDynamicSteps] = useState<string[]>([]);
  const [draggableSteps, setDraggableSteps] = useState<string[]>([]);

  const handleAddSection = () => {
    if (newSectionName.trim() !== '') {
      const newSection = {
        id: '',
        sort: sectionsData.length,
        name: newSectionName,
        status: 1,
        is_document: false,
        can_multiple_used: false,
        foreign_id: '',
        visit_form: [],
        pra_form: [],
        checkout_form: [],
      };

      const updatedSections = [...sectionsData, newSection];

      // Simpan ke state dan localStorage
      setSectionsData(updatedSections);
      setDynamicSteps((prev) => [...prev, newSectionName]);
      setNewSectionName('');
      setOpenModal(false);

      setTimeout(() => {
        setOpenCustomFieldModal(true);
      }, 300);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(draggableSteps);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setDraggableSteps(reordered);

    // 🔁 Reorder sectionsData sesuai urutan baru draggableSteps
    const reorderedSections = reordered.map((sectionName, index) => {
      const matchedSection = sectionsData.find((s) => s.name === sectionName);
      return {
        ...matchedSection!,
        sort: index, // update nilai sort berdasarkan urutan baru
      };
    });

    setSectionsData(reorderedSections);
  };

  const StepContent = (step: number) => {
    if (step === 0) {
      return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={8}>
            <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Visitor Type
            </Typography>
            <Grid size={12}>
              <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
                Name
              </CustomFormLabel>
              <CustomTextField
                id="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name || ''}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <CustomFormLabel htmlFor="org" sx={{ mt: 1 }}>
                  Document
                </CustomFormLabel>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.need_document}
                      onChange={(e) => {
                        console.log(e.target.checked);
                        setFormData((prev) => ({
                          ...prev,
                          need_document: e.target.checked, // ← ini yang benar
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Need Document
                      <Tooltip title="When activated, this visitor type must present a document">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              {formData.need_document && documents.length > 0 && (
                <CustomSelect
                  id="visitor_type_documents"
                  name="visitor_type_documents"
                  value={(formData.visitor_type_documents ?? []).map((d) => d.document_id)}
                  onChange={handleMultipleChange}
                  fullWidth
                  required
                  multiple
                  variant="outlined"
                  renderValue={(selected: any) =>
                    (selected as string[])
                      .map((id) => documents.find((doc) => doc.id === id)?.name ?? id)
                      .join(', ')
                  }
                >
                  {documents.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              )}
            </Grid>
            <Grid size={12}>
              <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
                Description
              </CustomFormLabel>
              <CustomTextField
                id="description"
                value={formData.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description || ''}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            {/* <Grid size={12}>
              <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
               Prefix
              </CustomFormLabel>
              <CustomTextField
                id="prefix"
                value={formData.prefix}
                onChange={handleChange}
                error={Boolean(errors.prefix)}
                helperText={errors.prefix || ''}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid> */}
            <Grid size={12}>
              <CustomFormLabel
                htmlFor="duration_visit"
                sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
              >
                Minimal Time Visit
                <Tooltip title="The minimum time of the visit in hours.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CustomFormLabel>
              <CustomTextField
                id="duration_visit"
                value={formData.duration_visit}
                onChange={handleChange}
                error={Boolean(errors.duration_visit)}
                helperText={errors.duration_visit || ''}
                fullWidth
                type="text"
                inputProps={{
                  inputMode: 'numeric', // buka keyboard angka
                  pattern: '[0-9]*', // cegah input selain angka
                }}
              />
            </Grid>
            <Grid size={12}>
              <CustomFormLabel
                htmlFor="max_time_visit"
                sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
              >
                Maximal Time Visit
                <Tooltip title="The maximum time of the visit in hours.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CustomFormLabel>
              <CustomTextField
                id="max_time_visit"
                value={formData.max_time_visit}
                onChange={handleChange}
                error={Boolean(errors.max_time_visit)}
                helperText={errors.max_time_visit || ''}
                fullWidth
                type="text"
                inputProps={{
                  inputMode: 'numeric', // buka keyboard angka
                  pattern: '[0-9]*', // cegah input selain angka
                }}
              />
            </Grid>
            <Grid size={12}>
              <CustomFormLabel
                htmlFor="period"
                sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
              >
                Period ({formData.simple_period ? 'minutes' : 'days'})
                <Tooltip
                  title={
                    formData.simple_period
                      ? 'The visit duration will be short and counted in minutes.'
                      : 'If set to 1 day, access will expire at the end of the next day.'
                  }
                >
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CustomFormLabel>
              <CustomTextField
                id="period"
                value={formData.period}
                onChange={handleChange}
                error={Boolean(errors.period)}
                helperText={errors.period || ''}
                fullWidth
                type="text"
                inputProps={{
                  inputMode: 'numeric', // buka keyboard angka
                  pattern: '[0-9]*', // cegah input selain angka
                }}
              />
            </Grid>
            <Grid size={12}>
              <CustomFormLabel
                htmlFor="grace_time"
                sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
              >
                Grace Time
                <Tooltip title="The allowed time for the visitor to leave the premises after the visit duration ends.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CustomFormLabel>
              <CustomTextField
                id="grace_time"
                value={formData.grace_time}
                onChange={handleChange}
                error={Boolean(errors.grace_time)}
                helperText={errors.grace_time || ''}
                fullWidth
                type="text"
                inputProps={{
                  inputMode: 'numeric', // buka keyboard angka
                  pattern: '[0-9]*', // cegah input selain angka
                }}
              />
            </Grid>
          </Grid>
          <Grid size={4}>
            <Grid size={12} mt={1}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Settings
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_parking}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          can_parking: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Can Parking
                      <Tooltip title="Visitor will receive a parking slot and access to the parking area.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.show_in_form}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          show_in_form: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Show In Form
                      <Tooltip title="When turned on, this type will show up and be available for selection in the portal form.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_access}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          can_access: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Can Access
                      <Tooltip title="When turned on, the visitor will get access using a card, QR code, or BLE.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.add_to_menu}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          add_to_menu: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Add To Menu
                      <Tooltip title="When turned on, this visitor type will be shown in the menu page.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.direct_visit}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          direct_visit: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Direct Visit
                      <Tooltip title="When turned on, visitors can walk in and register directly at the kiosk.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={12} mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_notification_arrival}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        can_notification_arrival: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Can Notification Arrival
                    <Tooltip title="When turned on, the host will be notified when their visitor arrives.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
            {/* <Grid size={12} mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_primary}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        is_primary: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Is Primary
                    <Tooltip title="When turned on, this type will be protected from deletion.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Grid> */}
            <Grid size={12} mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_enable}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        is_enable: e.target.checked,
                      }));
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Is Enable
                    <Tooltip title="When turned on, this type will appear on the visitor portal for selection.">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
            <Grid size={3} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.vip}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          vip: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Vip
                      <Tooltip title="When turned on, special features for VIP visitors will be enabled.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>

            <Grid size={12} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.simple_visitor}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          simple_visitor: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Simple Visitor
                      <Tooltip title="When turned on, this visit type is treated as a short or minimal-duration visit.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>

            {formData.simple_visitor && (
              <Grid size={12} mt={1}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.simple_period}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            simple_period: e.target.checked,
                          }));
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        Simple Period
                        <Tooltip title="When enabled, the duration of the visit is considered short and will be calculated in minutes.">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      );
    }

    const currentSection = sectionsData[step - 1]; // dikurangi 1 karena step 0 khusus
    if (!currentSection) return null;

    const handleCustomDocumentChange = (
      e: React.ChangeEvent<{ value: unknown }>,
      formType: 'visit_form' | 'pra_form' | 'checkout_form',
      index: number,
    ) => {
      const selectedDocId = e.target.value as string;

      setSectionsData((prevSections) => {
        const newSections = [...prevSections];
        const currentIndex = step - 1;

        if (!newSections[currentIndex]) return prevSections;

        if (!newSections[currentIndex][formType]) {
          newSections[currentIndex][formType] = [];
        }

        if (!newSections[currentIndex][formType][index]) {
          newSections[currentIndex][formType][index] = {
            sort: index,
            short_name: '',
            long_display_text: '',
            is_enable: false,
            is_primary: formType === 'visit_form',
            field_type: 9,
            remarks: '',
            mandatory: false,
            custom_field_id: '',
            multiple_option_fields: [],
            document_id: selectedDocId, // ✅ simpan document_id
            foreign_id: selectedDocId, // ✅ foreign_id ikut document_id
          };
        } else {
          newSections[currentIndex][formType][index].document_id = selectedDocId;
          newSections[currentIndex][formType][index].foreign_id = selectedDocId;
        }

        return newSections;
      });
    };

    return (
      <div>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={currentSection.is_document}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSectionsData((prev) =>
                    prev.map((section, idx) =>
                      idx === step - 1 ? { ...section, is_document: checked } : section,
                    ),
                  );
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                Is Document
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentSection.can_multiple_used}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSectionsData((prev) =>
                    prev.map((section, idx) =>
                      idx === step - 1 ? { ...section, can_multiple_used: checked } : section,
                    ),
                  );
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                Can Multi Purpose
                <Tooltip title="When enabled, this visit type can be used for multiple purposes">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Box>
        {!currentSection.is_document && !currentSection.can_multiple_used && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        <TableCell>Mandatory</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.visit_form || [],
                        (index, field, value) =>
                          handleDetailChange('visit_form', index, field, value),
                        (index) => handleDeleteDetail('visit_form', index),
                        true,
                        false,
                        false,
                        'visit_form',
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('visit_form')}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>
            {/* Pra Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        {/* <TableCell>Field Type</TableCell> */}
                        {/* <TableCell >Is Primary</TableCell> */}
                        <TableCell>Mandatory</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.pra_form || [],
                        (key, field, value) =>
                          handleDetailChange('pra_form' as const, key, field, value),
                        (key) => handleDeleteDetail('pra_form' as const, key),
                        true,
                        false,
                        false,
                        'pra_form',
                        currentSection.name,
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('pra_form' as const)}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>
            {/*Checkout Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Checkout Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        {/* <TableCell>Field Type</TableCell> */}
                        {/* <TableCell>Is Primary</TableCell> */}
                        <TableCell>Mandatory</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.checkout_form || [],
                        (key, field, value) =>
                          handleDetailChange('checkout_form', key, field, value),
                        (key) => handleDeleteDetail('checkout_form', key),
                        true,
                        false,
                        false,
                        'checkout_form',
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('checkout_form')}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>
          </>
        )}

        {currentSection.can_multiple_used && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        <TableCell>Mandatory</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.visit_form || [],
                        (index, field, value) =>
                          handleDetailChange('visit_form', index, field, value),
                        (index) => handleDeleteDetail('visit_form', index),
                        true,
                        false,
                        true,
                        'visit_form',
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('visit_form')}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>
            {/* Pra Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        {/* <TableCell>Field Type</TableCell> */}
                        {/* <TableCell >Is Primary</TableCell> */}
                        <TableCell>Mandatory</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.pra_form || [],
                        (key, field, value) =>
                          handleDetailChange('pra_form' as const, key, field, value),
                        (key) => handleDeleteDetail('pra_form' as const, key),
                        true,
                        false,
                        true,
                        'pra_form',
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('pra_form' as const)}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>
            {/*Checkout Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Checkout Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        {/* <TableCell>Field Type</TableCell> */}
                        {/* <TableCell>Is Primary</TableCell> */}
                        <TableCell>Mandatory</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.checkout_form || [],
                        (key, field, value) =>
                          handleDetailChange('checkout_form', key, field, value),
                        (key) => handleDeleteDetail('checkout_form', key),
                        true,
                        false,
                        true,
                        'checkout_form',
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('checkout_form')}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>
          </>
        )}

        {currentSection.is_document && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        {/* <TableCell>Field Type</TableCell> */}
                        {/* <TableCell>Is Primary</TableCell> */}
                        <TableCell>Mandatory</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.visit_form || [],
                        (index, field, value) =>
                          handleDetailChange('visit_form', index, field, value),
                        (index) => handleDeleteDetail('visit_form', index),
                        true,
                        true,
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('visit_form')}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>

            {/* pra Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field Name</TableCell>
                        <TableCell>Display</TableCell>
                        <TableCell>Enabled</TableCell>
                        {/* <TableCell>Field Type</TableCell> */}
                        {/* <TableCell>Is Primary</TableCell> */}
                        <TableCell>Mandatory</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderDetailRows(
                        currentSection.pra_form || [],
                        (index, field, value) =>
                          handleDetailChange('pra_form', index, field, value),
                        (index) => handleDeleteDetail('pra_form', index),
                        true,
                        true,
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MuiButton size="small" onClick={() => handleAddDetail('pra_form')}>
                  Add New
                </MuiButton>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box mt={1}>
                {/* <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography> */}
                <Typography variant="subtitle1" fontWeight={600}>
                  Documents Visit Form
                </Typography>
                <CustomSelect
                  id="visitor_type_documents"
                  name="foreign_id"
                  value={String(currentSection.foreign_id || '')}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    const newVal = String(e.target.value);

                    setSectionsData((prev) =>
                      prev.map((section, idx) =>
                        idx === step - 1
                          ? { ...section, foreign_id: newVal } // 🔹 simpan ke foreign_id
                          : section,
                      ),
                    );
                  }}
                  fullWidth
                  required
                  variant="outlined"
                  renderValue={(selected: any) => {
                    const docName = documents.find((d) => String(d.id) === String(selected))?.name;
                    return docName ?? 'Pilih Dokumen Visit Form';
                  }}
                >
                  {(Array.isArray(documents) ? documents : []).map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box mt={1}>
                {/* <Typography variant="subtitle1" fontWeight={600}>
                  Pra Form
                </Typography> */}
                <Typography variant="subtitle1" fontWeight={600}>
                  Documents Pra Form
                </Typography>
                <CustomSelect
                  id="visitor_type_documents"
                  name="foreign_id"
                  value={String(currentSection.pra_form?.[0]?.document_id || '')}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    const newVal = String(e.target.value);

                    setSectionsData((prev) =>
                      prev.map((section, idx) =>
                        idx === step - 1
                          ? { ...section, foreign_id: newVal } // 🔹 simpan ke foreign_id
                          : section,
                      ),
                    );
                  }}
                  fullWidth
                  required
                  variant="outlined"
                  renderValue={(selected: any) => {
                    const docName = documents.find((d) => String(d.id) === String(selected))?.name;
                    return docName ?? 'Pilih Dokumen Pra Registration';
                  }}
                >
                  {(Array.isArray(documents) ? documents : []).map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Grid>
          </>
        )}
      </div>
    );
  };

  // const allSteps = ['Visitor Type Info', ...dynamicSteps];
  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;

  useEffect(() => {
    setDraggableSteps([...dynamicSteps]);
  }, [dynamicSteps]);

  // Get Document
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const documentRes = await getAllDocument(token);
      setDocument(documentRes?.collection ?? []);
    };
    fetchData();

    console.log('🚀 ~ file: FormVisitorType.tsx ~ line 99 ~ useEffect ~ document', document);
  }, [token]);

  // Get Custom Field
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const customFieldRes = await getAllCustomFieldPagination(token, 0, 99999, 'id');
      setCustomField(customFieldRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    // Ambil data lama dari localStorage (jika ada)
    const stored = localStorage.getItem('unsavedVisitorTypeData');
    let parsed = {};
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch {
        parsed = {};
      }
    }
    // Gabungkan dengan section_page_visitor_types terbaru
    const updated = {
      ...parsed,
      section_page_visitor_types: sectionsData,
    };
    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(updated));
  }, [sectionsData]);

  // useEffect(() => {
  //   if (formData.visitor_type_documents && documents.length > 0) {
  //     const validIds = formData.visitor_type_documents
  //       .map((d) => d.document_id)
  //       .filter((id) => documents.some((doc) => doc.id === id));

  //     setFormData((prev) => ({
  //       ...prev,
  //       visitor_type_documents: validIds.map((id) => ({
  //         document_id: id,
  //       })),
  //     }));
  //   }
  // }, [documents]);
  useEffect(() => {
    if (formData.visitor_type_documents && documents.length > 0) {
      const validIds = formData.visitor_type_documents
        .map((d) => d.document_id)
        .filter((id) => documents.some((doc) => doc.id === id));

      setFormData((prev) => ({
        ...prev,
        visitor_type_documents: validIds.map((id) => ({
          document_id: id,
        })),
      }));
    }
  }, [documents]);

  useEffect(() => {
    if (Array.isArray(formData?.section_page_visitor_types)) {
      const mappedSections = formData.section_page_visitor_types.map((section, idx) => {
        const existingSection = sectionsData.find((s) => s.name === section.name);
        return {
          ...section,
          // id: section.id ?? existingSection?.id ?? undefined,
          sort: section.sort ?? idx,
          visit_form: section.visit_form ?? existingSection?.visit_form ?? [],
          pra_form: section.pra_form ?? existingSection?.pra_form ?? [],
          checkout_form: section.checkout_form ?? existingSection?.checkout_form ?? [],
          foreign_id: section.foreign_id ?? existingSection?.foreign_id ?? undefined,
        };
      });

      setSectionsData(mappedSections);

      const stepLabels = mappedSections.map((s) => s.name);
      setDraggableSteps(stepLabels);
      setActiveStep(0);
    }
  }, [formData?.section_page_visitor_types]);

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid size={12}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid>
        <Box width="100%" sx={{ overflow: 'visible' }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="stepper"
              direction="horizontal"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={true}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px 0',
                    overflowX: 'auto',
                  }}
                >
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    sx={{
                      width: '100%',
                      '& .MuiStepLabel-label': {
                        fontSize: '0.875rem',
                      },
                      '& .MuiStepIcon-root.Mui-active': {
                        color: 'primary.main',
                      },
                      '& .MuiStepIcon-root.Mui-completed': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {/* Static Step Pertama */}
                    <Step
                      key="Visitor Type Info"
                      completed={false}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 1,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <StepLabel
                          onClick={() => setActiveStep(0)}
                          sx={{
                            position: 'relative', // penting
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontWeight: activeStep === 0 ? 'bold' : 'normal',
                            color: activeStep === 0 ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                          }}
                        >
                          Visitor Type Info
                          <Button
                            onClick={() => setOpenModal(true)}
                            sx={{
                              position: 'absolute',
                              left:0, // atur jarak nempel kanan teks
                              top: '22%',
                              transform: 'translateY(-50%)',
                              minWidth: 0,
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              p: 0,
                              backgroundColor: 'primary.main',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            }}
                          >
                            <AddCircleOutlineIcon sx={{ fontSize: 20 }} />
                          </Button>
                        </StepLabel>
                        {/* <Button
                          onClick={() => setOpenModal(true)}
                          sx={{
                            minWidth: 0,
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            p: 0,
                            backgroundColor: 'primary.main',
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                          }}
                        >
                          <AddCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </Button> */}
                      </Box>
                    </Step>

                    {/* Dynamic Draggable Steps */}
                    {draggableSteps.map((label, index) => (
                      <Draggable key={label} draggableId={label} index={index}>
                        {(provided, snapshot) => (
                          <Step
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              mx: 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => setActiveStep(index + 1)}
                          >
                            <Box
                              sx={{
                                backgroundColor: snapshot.isDragging
                                  ? '#1976d2'
                                  : activeStep === index + 1
                                  ? 'primary.main'
                                  : '#9e9e9e',
                                color:
                                  snapshot.isDragging || activeStep === index + 1 ? '#fff' : '#fff',
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 0.5,
                                fontWeight: 'bold',
                                // border:
                                //   activeStep === index + 1
                                //     ? '2px solid #1976d2'
                                //     : '1px solid #33393dff',
                                transition: 'all 0.2s ease',
                                marginRight: -2,
                              }}
                            >
                              {index + 2}
                            </Box>
                            <StepLabel
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: activeStep === index + 1 ? 'bold' : 'normal',
                                color: activeStep === index + 1 ? 'primary.main' : 'text.secondary',
                                textAlign: 'center',
                                px: 1,
                                cursor: 'pointer',
                                marginLeft: 1.25,
                                marginTop: -1.25,
                              }}
                            >
                              {label}
                            </StepLabel>
                          </Step>
                        )}
                      </Draggable>
                    ))}
                  </Stepper>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Box mt={3}>{StepContent(activeStep)}</Box>

          <Box mt={3} display="flex" justifyContent="space-between">
            {/* Tombol Back */}
            <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
              Back
            </Button>

            {/* Tombol Next / Submit */}
            {isLastStep ? (
              <Button
                color="success"
                variant="contained"
                onClick={handleOnSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            ) : (
              <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>
      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Section Page</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label=""
            placeholder="Enter Section Name"
            type="text"
            fullWidth
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddSection} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormVisitorType;
