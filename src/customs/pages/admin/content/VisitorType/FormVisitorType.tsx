import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Box,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  FormVisitorTypes,
  SectionPageVisitorType,
} from 'src/customs/api/models/Admin/VisitorType';
import { IconArrowLeft, IconArrowRight, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import {
  createVisitorType,
  getAllAccessControl,
  getAllCustomField,
  getAllDocument,
  getAllSite,
  getCameraAnalytics,
  updateVisitorType,
} from 'src/customs/api/admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { showSwal } from 'src/customs/components/alerts/alerts';
import RenderDetailRows from './RenderDetailRows';
import {
  createVisitorTypeAccess,
  createVisitorTypeAccessBulk,
  deleteVisitorTypeAccess,
  getVisitorTypeAccessByVisitorId,
  updateVisitorTypeAccess,
} from 'src/customs/api/VisitorType/Access';
import {
  createVisitorTypeAnalytics,
  createVisitorTypeAnalyticsBulk,
  getVisitorTypeAnalyticsByVisitorId,
  updateVisitorTypeAnalytics,
} from 'src/customs/api/VisitorType/Analytics';
import StepComponent from './components/StepComponent';

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
  const [documents, setDocument] = useState<any[]>([]);
  const [customField, setCustomField] = useState<any[]>([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState<any | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<
    {
      access_control_id: string;
      early_access: boolean;
      sort: number;
      id?: string;
    }[]
  >([]);

  // const [siteData, setSiteData] = useState<any[]>([]);
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
    if (!edittingId) {
      setSelectedAnalytics(null);
      return;
    }

    const fetchVisitorTypeAnalytics = async () => {
      try {
        const res = await getVisitorTypeAnalyticsByVisitorId(edittingId, token as string);

        const existing = res?.collection?.[0];

        if (!existing) {
          setSelectedAnalytics(null);
          return;
        }

        setSelectedAnalytics({
          id: existing.id,
          integration_id: existing.integration_id,
          name: existing.integration_name,
        });
      } catch (error) {
        console.error('Failed fetch visitor type analytics:', error);
        setSelectedAnalytics(null);
      }
    };

    fetchVisitorTypeAnalytics();
  }, [edittingId, token]);

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
              : (matchedField?.multiple_option_fields ?? []),
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
              : (matchedField?.multiple_option_fields ?? []),
            visitor_form_type: 2,
            document_id: field.document_id ?? null,
          };
        }),
      }));

      const data: CreateVisitorTypeRequest = {
        ...localForm,
        duration_visit: Number(localForm.duration_visit),
        max_time_visit: Number(localForm.max_time_visit),
        grace_time: Number(localForm.grace_time),
        period: Number(localForm.period),
        section_page_visitor_types: transformedSections,
        visitor_type_documents: documentIdentities.map((doc) => ({
          document_id: doc.document_id,
          identity_type: doc.identity_type ?? null,
        })),
      };

      console.log('Submit data : ', JSON.stringify(data, null, 2));

      const parseData: CreateVisitorTypeRequest = CreateVisitorTypeRequestSchema.parse(data);

      if (edittingId) {
        await updateVisitorType(token, edittingId, parseData);

        // 1️⃣ Delete removed access
        if (deletedAccessIds.length > 0) {
          await Promise.all(deletedAccessIds.map((id) => deleteVisitorTypeAccess(id, token)));
        }

        // 2️⃣ Update / Create remaining
        const accessPayloads = buildUpdateAccessPayload(edittingId);

        for (const payload of accessPayloads) {
          if (payload.id) {
            await updateVisitorTypeAccess(payload.id, payload, token);
          } else {
            await createVisitorTypeAccess(payload, token);
          }
        }

        setDeletedAccessIds([]);

        const analyticsPayloads = buildUpdateAnalyticsPayload(edittingId);
        for (const payload of analyticsPayloads) {
          if (edittingId) {
            await updateVisitorTypeAnalytics(payload.id, payload, token);
          } else {
            await createVisitorTypeAnalytics(payload, token);
          }
        }

        showSwal(
          'success',
          edittingId ? 'Visitor type updated successfully!' : 'Visitor type updated successfully!',
        );
      } else {
        const res = await createVisitorType(token, parseData);

        const visitorTypeId = res.collection?.id;

        if (selectedAccess.length > 0) {
          const accessPayload = buildCreateAccessPayload(visitorTypeId as string);
          await createVisitorTypeAccessBulk(accessPayload, token);
        }

        if (formData.can_track_cctv && selectedAnalytics) {
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

  // useEffect(() => {
  //   if (!formData.can_parking) {
  //     setSectionsData((prevSections) =>
  //       prevSections.map((s) => {
  //         if (
  //           s.name.toLowerCase().includes('parking') ||
  //           s.name.toLowerCase().includes('vehicle information')
  //         ) {
  //           return {
  //             ...s,
  //             visit_form: (s.visit_form || []).filter(
  //               (f) =>
  //                 !['Vehicle Type', 'Vehicle Plate', 'Is Driving/Riding'].includes(
  //                   f.short_name || '',
  //                 ),
  //             ),
  //           };
  //         }
  //         return s;
  //       }),
  //     );
  //     return;
  //   }

  //   setSectionsData((prevSections) => {
  //     const updated = [...prevSections];
  //     const targetIndex = updated.findIndex(
  //       (s) =>
  //         s.name.toLowerCase().includes('parking') ||
  //         s.name.toLowerCase().includes('vehicle information'),
  //     );

  //     if (targetIndex === -1) return prevSections;

  //     const section = { ...updated[targetIndex] };
  //     section.visit_form = [...(section.visit_form || [])];

  //     const requiredShortNames = ['Vehicle Type', 'Vehicle Plate', 'Is Driving/Riding'];

  //     for (const short of requiredShortNames) {
  //       const exists = section.visit_form.some((f) => f.short_name === short);
  //       if (!exists) {
  //         const matchedField = customField.find(
  //           (f) => f.short_name === short || f.remarks === short,
  //         );

  //         section.visit_form.push({
  //           sort: section.visit_form.length,
  //           short_name: short,
  //           long_display_text: '',
  //           is_enable: false,
  //           is_primary: false,
  //           mandatory: false,
  //           field_type: matchedField?.field_type ?? 0,
  //           remarks: matchedField?.remarks ?? short,
  //           custom_field_id: matchedField?.id ?? '',
  //           multiple_option_fields: matchedField?.multiple_option_fields ?? [],
  //         });
  //       }
  //     }

  //     updated[targetIndex] = section;
  //     return updated;
  //   });
  // }, [formData.can_parking, customField]);

  const generateUUIDv4 = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [...bytes]
      .map((b, i) =>
        [4, 6, 8, 10].includes(i)
          ? '-' + b.toString(16).padStart(2, '0')
          : b.toString(16).padStart(2, '0'),
      )
      .join('');
  };

  type SectionKey = 'visit_form' | 'pra_form' | 'checkout_form';

  const handleAddDetail = (sectionKey: SectionKey) => {
    setSectionsData((prev) =>
      prev.map((section, sectionIndex) => {
        if (sectionIndex === activeStep - 1) {
          const currentDetails = Array.isArray(section[sectionKey]) ? section[sectionKey] : [];
          const sortIndex = currentDetails.length;

          const newItem: any = {
            id: null,
            dnd_id: generateUUIDv4(),
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
  const [localForm, setLocalForm] = useState(formData);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setFormData(localForm);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localForm]);
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

  // useEffect(() => {
  //   if (!token) return;

  //   const fetchSite = async () => {
  //     try {
  //       const res = await getAllSite(token);
  //       setSiteData(res.collection ?? []);
  //     } catch (err) {
  //       console.error('Failed to fetch site', err);
  //     }
  //   };

  //   fetchSite();
  // }, [token]);

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
    // if (!formData.can_track_cctv) return;

    const fetchAnalytic = async () => {
      try {
        const res = await getCameraAnalytics(token);
        setAnalyticCctv(res.collection ?? []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnalytic();
  }, [token]);

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

  const options = [
    { label: 'SPU', value: 'SPU' },
    { label: 'DC', value: 'DC' },
  ];

  const handleReorder = (key: string, newData: any[]) => {
    setSectionsData((prev: any[]) =>
      prev.map((section, idx) =>
        idx === activeStep - 1
          ? {
              ...section,
              [key]: newData,
            }
          : section,
      ),
    );
  };

  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;

  useEffect(() => {
    setDraggableSteps(sectionsData.map((s) => s.name));
  }, [sectionsData]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const documentRes = await getAllDocument(token);
      setDocument(documentRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
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
      const validDocs = formData.visitor_type_documents
        .filter((d) => documents.some((doc) => doc.id === d.document_id))
        .map((d) => ({
          document_id: d.document_id,
          identity_type: d.identity_type ?? -1,
        }));

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

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

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

          <Box mt={1}>
            <StepComponent
              activeStep={activeStep}
              formData={localForm}
              setFormData={setLocalForm}
              errors={errors}
              sectionsData={sectionsData}
              setSectionsData={setSectionsData}
              customField={customField}
              selectedAccess={selectedAccess}
              selectedAnalytics={selectedAnalytics}
              accessData={accessData}
              documents={documents}
              documentIdentities={documentIdentities}
              analyticCctv={analyticCctv}
              handleChange={handleChange}
              handleAddDetail={handleAddDetail}
              handleDetailChange={handleDetailChange}
              handleDeleteDetail={handleDeleteDetail}
              handleReorder={handleReorder}
              handleChangeDocument={handleChangeDocument}
              handleRemoveDocument={handleRemoveDocument}
              handleAddDocument={handleAddDocument}
              handleAddAccess={handleAddAccess}
              setSelectedAccess={setSelectedAccess}
              setSelectedAnalytics={setSelectedAnalytics}
              setDeletedAccessIds={setDeletedAccessIds}
            />
          </Box>

          {/* <Box mt={1}>{StepContent(activeStep)}</Box> */}

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
                Submit
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
          zIndex: 999999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          New Section Page
          <IconButton
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
            onClick={() => setOpenModal(false)}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
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
