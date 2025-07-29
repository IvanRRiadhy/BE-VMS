import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  FormControlLabel,
  Radio,
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
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  Button as MuiButton,
} from '@mui/material';
import { Box, width } from '@mui/system';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import CloseIcon from '@mui/icons-material/Close';
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
  getAllDocumentPagination,
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

interface CustomFieldItem {
  id: number;
  short_name: string;
  long_display_text: string;
  field_type: keyof typeof fieldTypeMap;
  is_enable: boolean;
  is_primary?: boolean;
  mandatory: boolean;
  remarks?: string;
  multiple_option_fields?: any[];
  custom_field_id?: string | null;
}

const fieldTypeMap = {
  text: 0,
  number: 1,
  email: 2,
  dropdown: 3,
  datepicker: 4,
  radio: 5,
  checkbox: 6,
};

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
  const [document, setDocument] = useState<any[]>([]);

  const [openCustomFieldModal, setOpenCustomFieldModal] = useState(false);

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...dynamicSteps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);

    const updatedSections = [...sectionsData];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);

    const reSortedSections = updatedSections.map((section, idx) => ({
      ...section,
      sort: idx,
    }));

    setDynamicSteps(updatedSteps);
    setSectionsData(reSortedSections);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { id, value } = e.target;
  //   console.log(id, value);
  //   setFormData((prev) => ({ ...prev, [id]: value }));
  // };

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
  // Get Document
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const documentRes = await getAllDocumentPagination(token, 0, 99, 'id');
      setDocument(documentRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

  const [customField, setCustomField] = useState<any[]>([]);

  const [newCustomField, setNewCustomField] = useState<CustomFieldItem | null>(null);

  // Get Custom Field
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const customFieldRes = await getAllCustomFieldPagination(token, 0, 99, 'id');
      setCustomField(customFieldRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

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
        visit_form: section.visit_form.map((field) => {
          const matchedField = customField.find((f) => f.id === field.custom_field_id);
          return {
            sort: field.sort ?? 0,
            short_name: field.short_name ?? '',
            long_display_text: field.long_display_text ?? '',
            is_primary: field.is_primary ?? false,
            is_enable: field.is_enable ?? false,
            mandatory: field.mandatory ?? false,
            field_type: fieldTypeMap[(matchedField?.type as keyof typeof fieldTypeMap) ?? 'text'],
            remarks: field.remarks ?? '',
            custom_field_id: field.custom_field_id ?? '',
            multiple_option_fields: field.multiple_option_fields || [],
            visitor_form_type: 1, // ✅ visit_form
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
            field_type: fieldTypeMap[(matchedField?.type as keyof typeof fieldTypeMap) ?? 'text'],
            remarks: field.remarks ?? '',
            custom_field_id: field.custom_field_id ?? '',
            multiple_option_fields: field.multiple_option_fields ?? [],
            visitor_form_type: 0, // ✅ pra_form
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
            field_type: fieldTypeMap[(matchedField?.type as keyof typeof fieldTypeMap) ?? 'text'],
            remarks: field.remarks ?? '',
            custom_field_id: field.custom_field_id ?? '',
            multiple_option_fields: field.multiple_option_fields ?? [],
            visitor_form_type: 2, // ✅ checkout_form
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

      // ✅ Cek data hasil akhir
      console.log('Final data to submit:', data);

      const parseData: CreateVisitorTypeRequest = CreateVisitorTypeRequestSchema.parse(data);

      if (edittingId && edittingId !== '') {
        const parsedUpdateData: UpdateVisitorTypeRequest = updateVisitorTypeSchmea.parse({
          ...data,
          id: edittingId,
        });

        await updateVisitorType(token, edittingId, parsedUpdateData);
        setAlertType('success');
        setAlertMessage('Visitor type updated successfully!');
      } else {
        await createVisitorType(token, parseData);
        setAlertType('success');
        setAlertMessage('Visitor type created successfully!');
      }
      // Opsional: reset form atau kasih notifikasi berhasil

      // navigate('/visitor-type');
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
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  const fieldTypeOptions = [
    { value: 0, label: 'Text' },
    { value: 1, label: 'Number' },
    { value: 2, label: 'Email' },
    { value: 3, label: 'Dropdown' },
    { value: 4, label: 'Datepicker' },
    { value: 5, label: 'Radio' },
    { value: 6, label: 'Checkbox' },
  ];

  const renderDetailRows = (
    details: FormVisitorTypes[] | any,
    onChange: (index: number, field: keyof FormVisitorTypes, value: any) => void,
    onDelete?: (index: number) => void,
    showMandatory = true,
  ) => {
    if (!Array.isArray(details)) {
      console.error('Expected array for details, but got:', details);
      return (
        <TableRow>
          <TableCell colSpan={5}>Invalid data format</TableCell>
        </TableRow>
      );
    }

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
              onChange(index, 'remarks', selectedShortName); // samakan remarks
              if (matchedField) {
                onChange(index, 'custom_field_id', matchedField.id); // ambil ID-nya
                onChange(
                  index,
                  'field_type',
                  fieldTypeMap[(matchedField?.type as keyof typeof fieldTypeMap) ?? 'text'],
                ); // tambahkan ini
              }
            }}
            placeholder="Select Field"
            fullWidth
          >
            {customField.map((field) => (
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
        <TableCell align="center" sx={{ marginRight: '10px' }}>
          <Switch
            checked={!!item.is_enable}
            onChange={(_, checked) => onChange(index, 'is_enable', checked)}
          />
        </TableCell>
        {/* <TableCell>
          <TextField
            size="small"
            defaultValue=""
            value={item.field_type}
            onChange={(e) => onChange(index, 'field_type', e.target.value)}
          > */}
        {/* {fieldTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>2
                {option.label}
              </MenuItem>
            ))} */}
        {/* </TextField>
        </TableCell> */}

        {showMandatory && (
          <TableCell align="center">
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

  // const handleAddDetail = (sectionKey: SectionKey) => {
  //   const newItem = {
  //     sort: 0,
  //     short_name: '',
  //     long_display_text: '',
  //     is_enable: false,
  //     is_primary: false,
  //     field_type: 0,
  //     remarks: '',
  //     custom_field_id: '',
  //     multiple_option_fields: [],
  //     mandatory: false,
  //   };

  //   setSectionsData((prev) =>
  //     prev.map((section, index) => {
  //       if (index === activeStep - 1) {
  //         const currentDetails = Array.isArray(section[sectionKey]) ? section[sectionKey] : [];

  //         return {
  //           ...section,

  //           [sectionKey]: [...currentDetails, newItem],
  //         };
  //       }
  //       return section;
  //     }),
  //   );
  // };

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

  const handleDeleteDetail = (sectionKey: SectionKey, key: any) => {
    setSectionsData((prev) =>
      prev.map((section, index) => {
        if (index === activeStep - 1) {
          const updated = { ...section[sectionKey] };
          delete updated[key];
          return {
            ...section,
            [sectionKey]: updated,
          };
        }
        return section;
      }),
    );
  };

  const [newSectionName, setNewSectionName] = useState('');
  const [sectionsData, setSectionsData] = useState<SectionPageVisitorType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const handleAddSection = () => {
    if (newSectionName.trim() !== '') {
      const newSection = {
        sort: sectionsData.length,
        name: newSectionName,
        status: 1,
        visit_form: [],
        pra_form: [],
        checkout_form: [],
      };

      setSectionsData((prev) => [...prev, newSection]);
      setDynamicSteps((prev) => [...prev, newSectionName]);
      setOpenModal(false); // tutup modal section
      setNewSectionName('');

      setTimeout(() => {
        setOpenCustomFieldModal(true); // buka custom field SETELAH modal ditutup
      }, 300); // beri delay supaya transisi smooth
    }
  };
  const staticStep = 'Visitor Type Info';
  const [dynamicSteps, setDynamicSteps] = useState<string[]>([]);
  const [draggableSteps, setDraggableSteps] = useState<string[]>([]);

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

  useEffect(() => {
    if (formData.visitor_type_documents && document.length > 0) {
      const validIds = formData.visitor_type_documents
        .map((d) => d.document_id)
        .filter((id) => document.some((doc) => doc.id === id));

      setFormData((prev) => ({
        ...prev,
        visitor_type_documents: validIds.map((id) => ({
          document_id: id,
        })),
      }));
    }
  }, [document]);

  const StepContent = (step: number) => {
    if (step === 0) {
      return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={8}>
            <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Visitor Type
            </Typography>
            <Grid size={12}>
              <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }} required>
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
              {formData.need_document && (
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
                      .map((id) => document.find((doc) => doc.id === id)?.name ?? id)
                      .join(', ')
                  }
                >
                  {document?.map((item: any) => (
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

    return (
      <div>
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
                    <TableCell>Is Enable</TableCell>
                    {/* <TableCell>Field Type</TableCell> */}
                    {/* <TableCell>Is Primary</TableCell> */}
                    <TableCell>Mandatory</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailRows(
                    currentSection.visit_form || [],
                    (index, field, value) => handleDetailChange('visit_form', index, field, value),
                    (index) => handleDeleteDetail('visit_form', index),
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
                    <TableCell>Is Enable</TableCell>
                    {/* <TableCell>Field Type</TableCell> */}
                    {/* <TableCell >Is Primary</TableCell> */}
                    <TableCell>Mandatory</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailRows(
                    currentSection.pra_form || [],
                    (key, field, value) =>
                      handleDetailChange('pra_form' as const, key, field, value),
                    (key) => handleDeleteDetail('pra_form' as const, key),
                    true,
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
                    <TableCell>Is Enable</TableCell>
                    {/* <TableCell>Field Type</TableCell> */}
                    {/* <TableCell>Is Primary</TableCell> */}
                    <TableCell>Mandatory</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailRows(
                    currentSection.checkout_form || [],
                    (key, field, value) => handleDetailChange('checkout_form', key, field, value),
                    (key) => handleDeleteDetail('checkout_form', key),
                    true,
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <MuiButton size="small" onClick={() => handleAddDetail('checkout_form')}>
              Add New
            </MuiButton>
          </Box>
        </Grid>
      </div>
    );
  };

  const allSteps = ['Visitor Type Info', ...dynamicSteps];
  const isFinalStep = activeStep === allSteps.length - 1;
  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;

  useEffect(() => {
    setDraggableSteps([...dynamicSteps]);
  }, [dynamicSteps]);

  useEffect(() => {
    if (Array.isArray(formData?.section_page_visitor_types)) {
      const mappedSections = formData.section_page_visitor_types.map((s, idx) => ({
        ...s,
        sort: s.sort ?? idx,
        visit_form: s.visit_form || [],
        pra_form: s.pra_form || null,
        checkout_form: s.checkout_form || null,
      }));

      setSectionsData(mappedSections);

      const stepLabels = mappedSections.map((s) => s.name);
      setDraggableSteps(stepLabels);
      setActiveStep(0);
    }
  }, [formData?.section_page_visitor_types]);

  // if (!draggableSteps || draggableSteps.length === 0) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
  //       <CircularProgress size={32} />
  //     </Box>
  //   );
  // }

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid size={12}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid>
        <Box width="100%">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="stepper"
              direction="horizontal"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px 0',
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
                        mx: 1,
                      }}
                    >
                      <StepLabel
                        onClick={() => setActiveStep(0)}
                        sx={{
                          fontWeight: activeStep === 0 ? 'bold' : 'normal',
                          color: activeStep === 0 ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        Visitor Type Info
                      </StepLabel>
                      <Button
                        onClick={() => setOpenModal(true)}
                        startIcon={null} // hapus startIcon biar tidak ada jarak
                        sx={{
                          minWidth: 0,
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          padding: 0,
                          marginTop: -3.85,
                          marginLeft: -1,
                          backgroundColor: 'primary.main',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        <AddCircleOutlineIcon />
                      </Button>
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
                                backgroundColor: snapshot.isDragging ? '#1976d2' : '#e3f2fd',
                                color: snapshot.isDragging ? '#fff' : '#000',
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 0.5,
                                fontWeight: 'bold',
                                border: snapshot.isDragging
                                  ? '2px solid #1976d2'
                                  : '1px solid #33393dff',
                                transition: 'all 0.2s ease',
                                marginRight: -2,
                              }}
                            >
                              {index + 2}
                            </Box>
                            <StepLabel
                              // onClick={() => setActiveStep(index + 1)}
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: activeStep === index + 1 ? 'bold' : 'bold',
                                color: activeStep === index + 1 ? 'primary.main' : 'text.secondary',
                                textAlign: 'center',
                                px: 1,
                                cursor: 'pointer', // <-- tambahkan agar terasa clickable
                                marginLeft: 1.25,
                                // margintop important
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
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Section Page Visitor Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Section Name"
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
