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
  FormControl,
  Select,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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
} from 'src/customs/api/models/Admin/VisitorType';
import { IconArrowLeft, IconArrowRight, IconPencil, IconTrash } from '@tabler/icons-react';
import {
  createVisitorType,
  getAllAccessControl,
  getAllCustomField,
  getAllCustomFieldPagination,
  getAllDocument,
  getAllSite,
  getCameraAnalytics,
  updateVisitorType,
} from 'src/customs/api/admin';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { showSwal } from 'src/customs/components/alerts/alerts';
import RenderDetailRows from './RenderDetailRows';
import {
  createVisitorTypeAccess,
  createVisitorTypeAccessBulk,
  getVisitorTypeAccessByVisitorId,
  updateVisitorTypeAccess,
} from 'src/customs/api/VisitorType/Access';
import {
  createVisitorTypeAnalytics,
  createVisitorTypeAnalyticsBulk,
  getVisitorTypeAnalyticsByVisitorId,
  updateVisitorTypeAnalytics,
} from 'src/customs/api/VisitorType/Analytics';

interface FormVisitorTypeProps {
  formData: CreateVisitorTypeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorTypeRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  initialDocuments?: any[];
}

const FormVisitorType: React.FC<FormVisitorTypeProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  initialDocuments = [],
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');

  const { token } = useSession();
  const [deletedAccessIds, setDeletedAccessIds] = useState<string[]>([]);
  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const isStepSkipped = (step: number) => skipped.has(step);
  const [documents, setDocument] = useState<any[]>([]);
  const [customField, setCustomField] = useState<any[]>([]);
  const [openCustomFieldModal, setOpenCustomFieldModal] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<any | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<
    {
      access_control_id: string;
      early_access: boolean;
      sort: number;
      id?: string;
    }[]
  >([]);

  const [selectedSite, setSelectedSite] = useState<any[]>([]);

  const [siteData, setSiteData] = useState<any[]>([]);
  const [accessData, setAccessData] = useState<any[]>([]);
  const [analyticCctv, setAnalyticCctv] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const numberOnlyFields = ['duration_visit', 'max_time_visit', 'grace_time', 'period'];

    if (numberOnlyFields.includes(id)) {
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  useEffect(() => {
    if (edittingId && initialDocuments.length > 0) {
      setDocumentIdentities(initialDocuments);
    }
  }, [edittingId, initialDocuments]);

  useEffect(() => {
    if (!edittingId || !token || accessData.length === 0) return;

    const fetchVisitorTypeAccess = async () => {
      const res = await getVisitorTypeAccessByVisitorId(edittingId, token);

      setSelectedAccess(
        res.collection.map((a: any) => {
          const access = accessData.find(
            (x) => x.name.trim().toLowerCase() === a.access_control_name.trim().toLowerCase(),
          );

          return {
            id: a.id,
            access_control_id: access?.id ?? '',
            early_access: a.early_access ?? false,
            sort: a.sort ?? 0,
          };
        }),
      );
    };

    fetchVisitorTypeAccess();
  }, [edittingId, token, accessData]);

  useEffect(() => {
    if (!edittingId) return;

    const fetchVisitorTypeAnalytics = async () => {
      const res = await getVisitorTypeAnalyticsByVisitorId(edittingId, token as string);

      const existing = res.collection?.[0];

      if (!existing) {
        setSelectedAnalytics(null);
        return;
      }

      // const matched = analyticCctv.find((a: any) => a.id === existing.integration_id);

      // setSelectedAnalytics(matched ?? null);
      setSelectedAnalytics({
        id: existing.id, // 🔥 visitor_type_analytics.id
        integration_id: existing.integration_id, // 🔥 integration.id
        name: existing.integration_name, // untuk label Autocomplete
      });
    };

    fetchVisitorTypeAnalytics();
  }, [edittingId, token, analyticCctv]);

  const buildUpdateAccessPayload = (visitorTypeId: string) =>
    selectedAccess.map((a, index) => ({
      id: a.id,
      access_control_id: a.access_control_id,
      visitor_type_id: visitorTypeId,
      early_access: a.early_access,
      sort: index,
    }));

  const buildUpdateAnalyticsPayload = (visitorTypeId: string) =>
    selectedAnalytics
      ? [
          {
            id: selectedAnalytics.id,
            integration_id: selectedAnalytics.integration_id,
            visitor_type_id: visitorTypeId,
            sort: 0,
          },
        ]
      : [];

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
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
            document_id: field.document_id ?? null,
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
            document_id: field.document_id ?? null,
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
            document_id: field.document_id ?? null,
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
        visitor_type_documents: documentIdentities.map((doc) => ({
          document_id: doc.document_id,
          identity_type: doc.identity_type ?? null,
        })),
      };

      console.log('Submit data : ', JSON.stringify(data, null, 2));

      const parseData: CreateVisitorTypeRequest = CreateVisitorTypeRequestSchema.parse(data);

      if (edittingId) {
        const res = await updateVisitorType(token, edittingId, parseData);

        console.log('res', res);
        const accessPayloads = buildUpdateAccessPayload(edittingId);
        // console.log('accessPayloads', accessPayloads);

        // await deleteVisitorTypeAccessBulk(edittingId, token);

        for (const payload of accessPayloads) {
          if (payload.id) {
            const resUpdate = await updateVisitorTypeAccess(payload.id, payload, token);
            // console.log('resUpdate', resUpdate);
          } else {
            const resAccess = await createVisitorTypeAccess(payload, token);
            // console.log('resAccess', resAccess);
          }
        }

        const analyticsPayloads = buildUpdateAnalyticsPayload(edittingId);
        for (const payload of analyticsPayloads) {
          if (edittingId) {
            const resUpdate = await updateVisitorTypeAnalytics(payload.id, payload, token);
            console.log('res analytic', resUpdate);
          } else {
            const resUpdate = await createVisitorTypeAnalytics(payload, token);
            console.log('res analytic Create', resUpdate);
          }
        }
        // console.log('analyticsPayloads', analyticsPayloads);

        showSwal(
          'success',
          edittingId ? 'Visitor type updated successfully!' : 'Visitor type updated successfully!',
        );
      } else {
        const res = await createVisitorType(token, parseData);
        // console.log('res', res);
        const visitorTypeId = res.collection?.id;

        if (selectedAccess.length > 0) {
          const accessPayload = buildCreateAccessPayload(visitorTypeId as string);
          await createVisitorTypeAccessBulk(accessPayload, token);
          const accessPayloadAnalytics = buildCreateAnalyticsPayload(visitorTypeId as string);
          await createVisitorTypeAnalyticsBulk(accessPayloadAnalytics, token);
        }
        showSwal('success', 'Visitor type created successfully!');
      }

      setTimeout(() => {
        onSuccess?.();
        setLoading(false);
      }, 600);
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      showSwal('error', err.message ?? 'Failed to create visitor type!');
      setLoading(false);
    }
  };

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
            short_name: short,
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
            remarks: '',
            custom_field_id: '',
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
            return section;
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

    const reorderedSections = reordered.map((sectionName, index) => {
      const matchedSection = sectionsData.find((s) => s.name === sectionName);
      return {
        ...matchedSection!,
        sort: index,
      };
    });

    setSectionsData(reorderedSections);
  };

  const [documentIdentities, setDocumentIdentities] = useState<
    { document_id: string; identity_type: number }[]
  >([]);

  useEffect(() => {
    if (!token) return;

    const fetchSite = async () => {
      try {
        const res = await getAllSite(token);
        setSiteData(res.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch site', err);
      }
    };

    fetchSite();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchAccessControl = async () => {
      try {
        const res = await getAllAccessControl(token);
        setAccessData(res.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch access control', err);
      }
    };

    fetchAccessControl();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchAnalytic = async () => {
      try {
        const res = await getCameraAnalytics(token);
        console.log('res analytic', res.collection);
        setAnalyticCctv(res.collection ?? []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnalytic();
  }, [token]);

  const identityOptions = [
    { value: -1, label: '' },
    { value: 0, label: 'NIK' },
    { value: 1, label: 'KTP' },
    { value: 2, label: 'PASSPORT' },
    { value: 3, label: 'Driver License' },
    { value: 4, label: 'Card Access' },
    { value: 5, label: 'Face' },
  ];

  const handleAddDocument = () => {
    setDocumentIdentities((prev) => [...prev, { document_id: '', identity_type: -1 }]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentIdentities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeDocument = (
    index: number,
    field: 'document_id' | 'identity_type',
    value: string | number,
  ) => {
    setDocumentIdentities((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'identity_type' ? Number(value) : String(value),
      };
      return updated;
    });
  };

  const handleAddAccess = () => {
    setSelectedAccess((prev) => [
      ...prev,
      {
        access_control_id: '',
        early_access: false,
        sort: prev.length,
      },
    ]);
  };

  const handleAddSite = () => {
    setSelectedSite((prev) => [...prev, { id: '', name: '' }]);
  };

  const StepContent = (step: number) => {
    if (step === 0) {
      return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
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
                          need_document: e.target.checked,
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
                <TableContainer component={Paper} sx={{ mt: 1, mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Identity Type</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {documentIdentities.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={row.document_id}
                                onChange={(e) =>
                                  handleChangeDocument(index, 'document_id', e.target.value)
                                }
                              >
                                {documents.map((item) => (
                                  <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>

                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={row.identity_type}
                                onChange={(e) =>
                                  handleChangeDocument(
                                    index,
                                    'identity_type',
                                    Number(e.target.value),
                                  )
                                }
                              >
                                {identityOptions.map((opt) => (
                                  <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>

                          <TableCell align="center">
                            <IconButton color="error" onClick={() => handleRemoveDocument(index)}>
                              <IconTrash size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                      {documentIdentities.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                            No document added yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <Box sx={{ p: 2 }}>
                    <Button onClick={handleAddDocument} color="primary" variant="contained">
                      Add New
                    </Button>
                  </Box>
                </TableContainer>
              )}
            </Grid>
            <Grid size={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Access
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {/* <TableCell>#</TableCell> */}
                      <TableCell>Access</TableCell>
                      <TableCell align="center">Early Access</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedAccess.map((row, index) => (
                      <TableRow key={index}>
                        {/* <TableCell>{index + 1}</TableCell> */}

                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={row.access_control_id ?? ''}
                              onChange={(e) => {
                                const value = e.target.value as string;
                                setSelectedAccess((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, access_control_id: value } : r,
                                  ),
                                );
                              }}
                            >
                              {accessData.map((a) => (
                                <MenuItem
                                  key={a.id}
                                  value={a.id}
                                  disabled={selectedAccess.some(
                                    (x, i) => x.access_control_id === a.id && i !== index,
                                  )}
                                >
                                  {a.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell align="center">
                          <Switch
                            checked={row.early_access}
                            onChange={(e) => {
                              setSelectedAccess((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, early_access: e.target.checked } : r,
                                ),
                              );
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedAccess((prev) => {
                                const removed = prev[index];

                                if (removed?.id) {
                                  setDeletedAccessIds((ids) => [...ids, removed.id!]);
                                }

                                return prev.filter((_, i) => i !== index);
                              });
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {selectedAccess.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                          No access added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* ADD NEW */}
                <Box sx={{ p: 2 }}>
                  <Button variant="contained" onClick={handleAddAccess}>
                    Add New
                  </Button>
                </Box>
              </TableContainer>
            </Grid>
            {/* <Grid size={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
                Site
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Site</TableCell>

                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedSite.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={row.access_control_id ?? ''}
                              onChange={(e) => {
                                const value = e.target.value as string;
                                setSelectedAccess((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, access_control_id: value } : r,
                                  ),
                                );
                              }}
                            >
                              {siteData.map((a) => (
                                <MenuItem
                                  key={a.id}
                                  value={a.id}
                                  disabled={selectedSite.some(
                                    (x, i) => x.id === a.id && i !== index,
                                  )}
                                >
                                  {a.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedSite((prev) => {
                                const removed = prev[index];

                                if (removed?.id) {
                                  setDeletedAccessIds((ids) => [...ids, removed.id!]);
                                }

                                return prev.filter((_, i) => i !== index);
                              });
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {selectedSite.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                          No site added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Box sx={{ p: 2 }}>
                  <Button variant="contained" onClick={handleAddSite}>
                    Add New
                  </Button>
                </Box>
              </TableContainer>
            </Grid> */}
            {formData.can_track_cctv && (
              <Grid size={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  System Analytic
                </Typography>
                <Autocomplete
                  options={analyticCctv}
                  value={selectedAnalytics}
                  getOptionLabel={(option: any) => option.name ?? ''}
                  // onChange={(_, newValue) => {
                  //   setSelectedAnalytics(newValue);
                  // }}
                  onChange={(_, newValue) => {
                    if (!newValue) {
                      setSelectedAnalytics(null);
                      return;
                    }

                    setSelectedAnalytics({
                      id: undefined,
                      integration_id: newValue.integration_id,
                      name: newValue.name,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select analytic system" />
                  )}
                />
              </Grid>
            )}
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
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
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
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
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
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
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
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
              />
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid size={{ xs: 6, xl: 12 }} mt={1}>
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
                      <Tooltip
                        title="Visitor will receive a parking slot and access to the parking area."
                        arrow
                      >
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6, xl: 12 }} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_track_ble || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => {
                          const updated = { ...prev, can_track_ble: checked };
                          return updated;
                        });
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                      Can Tracking
                      <Tooltip
                        title="When turned on, this type will be able to track the visitor's location."
                        arrow
                      >
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6, xl: 12 }} mt={1}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_track_cctv || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => {
                          const updated = { ...prev, can_track_cctv: checked };
                          return updated;
                        });
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                      Can Analytic
                      <Tooltip title="">
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6, xl: 12 }} mt={1}>
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
                        <IconButton size="small">
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
                        <IconButton size="small">
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
                        <IconButton size="small">
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
                    <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                      Direct Visit
                      <Tooltip title="When turned on, visitors can direct visit">
                        <IconButton size="small">
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
                  <Box display="flex" alignItems="center" flexWrap={'wrap'}>
                    Can Notification Arrival
                    <Tooltip title="When turned on, the host will be notified when their visitor arrives.">
                      <IconButton size="small">
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
                        <IconButton size="small">
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
                      <IconButton size="small">
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
                        <IconButton size="small">
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
                        <IconButton size="small">
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
                          <IconButton size="small">
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

    const currentSection = sectionsData[step - 1];
    if (!currentSection) return null;

    const handleReorder = (
      sectionKey: 'visit_form' | 'pra_form' | 'checkout_form',
      newData: any[],
    ) => {
      const newSections = [...sectionsData];
      newSections[step - 1] = {
        ...currentSection,
        [sectionKey]: newData,
      };
      setSectionsData(newSections);
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

        {/* {!currentSection.is_document && !currentSection.can_multiple_used && (
            <>
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
                          <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>

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
                    </Table>
                  </TableContainer>
                  <MuiButton size="small" onClick={() => handleAddDetail('visit_form')}>
                    Add New
                  </MuiButton>
                </Box>
              </Grid>

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
                          <TableCell>Mandatory</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>

                      {renderDetailRows(
                        currentSection.pra_form || [],
                        (i, f, v) => handleDetailChange('pra_form', i, f, v),
                        (i) => handleDeleteDetail('pra_form', i),
                        true,
                        false,
                        false,
                        'pra_form',
                      )}
                    </Table>
                  </TableContainer>
                  <MuiButton size="small" onClick={() => handleAddDetail('pra_form')}>
                    Add New
                  </MuiButton>
                </Box>
              </Grid>

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
                          <TableCell>Mandatory</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>

                      {renderDetailRows(
                        currentSection.checkout_form || [],
                        (i, f, v) => handleDetailChange('checkout_form', i, f, v),
                        (i) => handleDeleteDetail('checkout_form', i),
                        true,
                        false,
                        false,
                        'checkout_form',
                      )}
                    </Table>
                  </TableContainer>
                  <MuiButton size="small" onClick={() => handleAddDetail('checkout_form')}>
                    Add New
                  </MuiButton>
                </Box>
              </Grid>
            </>
          )} */}

        {!currentSection.is_document && !currentSection.can_multiple_used && (
          <>
            {/* Visit Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Visit Form
                </Typography>

                {/* ✅ Komponen drag & drop baru */}
                {/* <RenderDetailRows
                    title="visit_form"
                    data={currentSection.visit_form || []}
                    customField={customField}
                    onChange={(index: any, field: any, value: any) =>
                      handleDetailChange('visit_form', index, field as any, value)
                    }
                    onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                    onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  /> */}

                <RenderDetailRows
                  title="visit_form"
                  data={currentSection.visit_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('visit_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                  onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={false}
                  sectionKey="visit_form"
                />

                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('visit_form')}
                  variant="contained"
                  color="primary"
                >
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
                {/* 
                  <RenderDetailRows
                    title="pra_form"
                    data={currentSection.pra_form || []}
                    customField={customField}
                    onChange={(index: any, field: any, value: any) =>
                      handleDetailChange('pra_form', index, field as any, value)
                    }
                    onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                    onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  /> */}

                <RenderDetailRows
                  title="pra_form"
                  data={currentSection.pra_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('pra_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                  onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={false}
                  sectionKey="pra_form"
                />

                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('pra_form')}
                  variant="contained"
                  color="primary"
                >
                  Add New
                </MuiButton>
              </Box>
            </Grid>

            {/* Checkout Form */}
            <Grid size={12}>
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Checkout Form
                </Typography>

                {/* <RenderDetailRows
                    title="checkout_form"
                    data={currentSection.checkout_form || []}
                    customField={customField}
                    onChange={(index: any, field: any, value: any) =>
                      handleDetailChange('checkout_form', index, field as any, value)
                    }
                    onDelete={(index: any) => handleDeleteDetail('checkout_form', index)}
                    onReorder={(newData: any) => handleReorder('checkout_form', newData)}
                  /> */}

                <RenderDetailRows
                  title="checkout_form"
                  data={currentSection.checkout_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('checkout_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('checkout_form', index)}
                  onReorder={(newData: any) => handleReorder('checkout_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={false}
                  sectionKey="checkout_form"
                />

                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('checkout_form')}
                  variant="contained"
                  color="primary"
                >
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
                <RenderDetailRows
                  title="visit_form"
                  data={currentSection.visit_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('visit_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                  onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={true}
                  sectionKey="visit_form"
                />
                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('visit_form')}
                  variant="contained"
                  color="primary"
                >
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
                <RenderDetailRows
                  title="pra_form"
                  data={currentSection.pra_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('pra_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                  onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={true}
                  sectionKey="pra_form"
                />
                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('pra_form' as const)}
                  variant="contained"
                  color="primary"
                >
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
                {/* <TableContainer component={Paper} sx={{ mb: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>

                          <TableCell>Field Name</TableCell>
                          <TableCell>Display</TableCell>
                          <TableCell>Enabled</TableCell>

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
                  </TableContainer> */}
                <RenderDetailRows
                  title="checkout_form"
                  data={currentSection.checkout_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('checkout_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('checkout_form', index)}
                  onReorder={(newData: any) => handleReorder('checkout_form', newData)}
                  showMandatory={true}
                  isDocument={false}
                  canMultiple={true}
                  sectionKey="checkout_form"
                />
                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('checkout_form')}
                  variant="contained"
                  color="primary"
                >
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
                {/* <TableContainer component={Paper} sx={{ mb: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Field Name</TableCell>
                          <TableCell>Display</TableCell>
                          <TableCell>Enabled</TableCell>
                          <TableCell>Mandatory</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
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
                  </TableContainer> */}
                <RenderDetailRows
                  title="visit_form"
                  data={currentSection.visit_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('visit_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('visit_form', index)}
                  onReorder={(newData: any) => handleReorder('visit_form', newData)}
                  showMandatory={true}
                  isDocument={true}
                  canMultiple={false}
                  sectionKey="visit_form"
                />
                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('visit_form')}
                  variant="contained"
                  color="primary"
                >
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
                {/* <TableContainer component={Paper} sx={{ mb: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Field Name</TableCell>
                          <TableCell>Display</TableCell>
                          <TableCell>Enabled</TableCell>
                        
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
                  </TableContainer> */}
                <RenderDetailRows
                  title="pra_form"
                  data={currentSection.pra_form || []}
                  customField={customField}
                  onChange={(index: any, field: any, value: any) =>
                    handleDetailChange('pra_form', index, field, value)
                  }
                  onDelete={(index: any) => handleDeleteDetail('pra_form', index)}
                  onReorder={(newData: any) => handleReorder('pra_form', newData)}
                  showMandatory={true}
                  isDocument={true}
                  canMultiple={false}
                  sectionKey="pra_form"
                />
                <MuiButton
                  size="small"
                  onClick={() => handleAddDetail('pra_form')}
                  variant="contained"
                  color="primary"
                >
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
                        idx === step - 1 ? { ...section, foreign_id: newVal } : section,
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

            <Grid size={12} sx={{ display: 'none' }}>
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
                        idx === step - 1 ? { ...section, foreign_id: newVal } : section,
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

  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;

  // useEffect(() => {
  //   setDraggableSteps([...dynamicSteps]);
  // }, [dynamicSteps]);

  useEffect(() => {
    setDraggableSteps(sectionsData.map((s) => s.name));
  }, [sectionsData]);

  // Get Document
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const documentRes = await getAllDocument(token);
      setDocument(documentRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

  // Get Custom Field
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      // const customFieldRes = await getAllCustomFieldPagination(token, 0, 99999, 'id');
      const customFieldRes = await getAllCustomField(token);
      setCustomField(customFieldRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem('unsavedVisitorTypeData');
    let parsed = {};
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch {
        parsed = {};
      }
    }
    const updated = {
      ...parsed,
      section_page_visitor_types: sectionsData,
    };
    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(updated));
  }, [sectionsData]);

  useEffect(() => {
    if (formData.visitor_type_documents && documents.length > 0) {
      // Ambil hanya document_id yang masih valid
      const validDocs = formData.visitor_type_documents
        .filter((d) => documents.some((doc) => doc.id === d.document_id))
        .map((d) => ({
          document_id: d.document_id,
          identity_type: d.identity_type ?? -1,
        }));

      console.log(validDocs);

      setFormData((prev) => ({
        ...prev,
        visitor_type_documents: validDocs,
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

  const buildCreateAccessPayload = (visitorTypeId: string) => ({
    data: selectedAccess.map((a, index) => ({
      access_control_id: a.access_control_id,
      visitor_type_id: visitorTypeId,
      early_access: a.early_access,
      sort: index,
    })),
  });

  const buildCreateAnalyticsPayload = (visitorTypeId: string) => ({
    data: selectedAnalytics.map((a: any, index: any) => ({
      integration_id: a.integration_id,
      visitor_type_id: visitorTypeId,
      sort: index,
    })),
  });

  return (
    <>
      <form onSubmit={handleOnSubmit}>
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
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontWeight: activeStep === 0 ? 'bold' : 'normal',
                            color: activeStep === 0 ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                          }}
                        >
                          Visitor Type Info
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenModal(true);
                            }}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: { xs: '14%', sm: '22%' },
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
                      </Box>
                    </Step>

                    {draggableSteps.map((label, index) => (
                      <Draggable key={label} draggableId={label} index={index}>
                        {(provided, snapshot) => {
                          const [editingIndex, setEditingIndex] = useState<number | null>(null);
                          const [editingName, setEditingName] = useState(label);

                          const handleRename = (idx: number, newName: string) => {
                            setDraggableSteps((prev) =>
                              prev.map((l, i) => (i === idx ? newName : l)),
                            );
                            setSectionsData((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, name: newName } : s)),
                            );
                          };

                          const handleDelete = (idx: number) => {
                            setDraggableSteps((prev) => prev.filter((_, i) => i !== idx));
                            setSectionsData((prev) => prev.filter((_, i) => i !== idx));

                            setActiveStep((prev) => (prev > idx ? prev - 1 : 0));
                          };

                          return (
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
                                  color: '#fff',
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 0.5,
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {index + 2}
                              </Box>

                              {editingIndex === index ? (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <TextField
                                    size="small"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => {
                                      handleRename(index, editingName);
                                      setEditingIndex(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleRename(index, editingName);
                                        setEditingIndex(null);
                                      }
                                    }}
                                    autoFocus
                                    sx={{ width: 120 }}
                                  />
                                </Box>
                              ) : (
                                <StepLabel
                                  sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: activeStep === index + 1 ? 'bold' : 'normal',
                                    color:
                                      activeStep === index + 1 ? 'primary.main' : 'text.secondary',
                                    textAlign: 'center',
                                    px: 1,
                                    cursor: 'pointer',
                                    marginLeft: 1.25,
                                    marginTop: -1.25,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  {label}
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.25}
                                    justifyContent={'center'}
                                    sx={{ marginRihgt: { xs: 0, sm: 1 } }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{ p: 0, color: 'primary.main' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingIndex(index);
                                        setEditingName(label);
                                      }}
                                    >
                                      <IconPencil size={18} />
                                    </IconButton>

                                    {/* 🗑️ Delete button */}
                                    <IconButton
                                      size="small"
                                      sx={{ p: 0, color: 'error.main' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(index);
                                      }}
                                    >
                                      <IconTrash size={18} />
                                    </IconButton>
                                  </Box>
                                </StepLabel>
                              )}
                            </Step>
                          );
                        }}
                      </Draggable>
                    ))}
                  </Stepper>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Box mt={1}>{StepContent(activeStep)}</Box>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
              startIcon={<IconArrowLeft size={18} />}
            >
              Back
            </Button>

            {/* Tombol Next / Submit */}
            {isLastStep ? (
              <Button
                color="primary"
                variant="contained"
                onClick={handleOnSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Submit'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setActiveStep((prev) => prev + 1)}
                endIcon={<IconArrowRight size={18} />}
              >
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
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress color="primary" />
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
