import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TableHead,
  MenuItem,
  Grid2 as Grid,
  FormLabel,
  Dialog,
  Checkbox,
  TableRow,
  TableCell,
  Button,
  FormGroup,
  TextField,
  Radio,
  Button as MuiButton,
  CircularProgress,
  Autocomplete,
  Accordion,
  AccordionSummary,
  TableContainer,
  AccordionDetails,
  Paper,
  IconButton,
  FormControlLabel,
  Table,
  TableBody,
  FormControl,
  Card,
  Skeleton,
  RadioGroup,
  Divider,
  Tooltip,
  Switch,
} from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import $, { data } from 'jquery';
import 'select2'; // Select2 secara otomatis akan attach ke jQuery global
import 'select2/dist/css/select2.min.css';
import { IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import PageContainer from 'src/components/container/PageContainer';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import ParentCard from 'src/components/shared/ParentCard';
import Webcam from 'react-webcam';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useSession } from 'src/customs/contexts/SessionContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  CreateVisitorRequest,
  CreateVisitorRequestSchema,
  Item,
  SectionPageVisitor,
} from 'src/customs/api/models/Visitor';
import {
  createVisitor,
  getAllCustomFieldPagination,
  getAllEmployee,
  getAllSite,
  getAllVisitor,
  getAllVisitorType,
  getVisitorById,
  getVisitorTypeById,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { SectionPageVisitorType } from 'src/customs/api/models/VisitorType';
import { FormVisitor } from 'src/customs/api/models/Visitor';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisitorSelect from 'src/customs/components/select2/VisitorSelect';

import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/id';
import { DateTimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { IconX } from '@tabler/icons-react';

interface FormVisitorTypeProps {
  formData: CreateVisitorRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  formKey?: 'visit_form' | 'pra_form';
}

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');

type GroupedPages = {
  single_page: any[];
  batch_page: Record<string, any>;
};

const FormWizardAddVisitor: React.FC<FormVisitorTypeProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  formKey = 'visit_form',
}) => {
  const FORM_KEY: 'visit_form' | 'pra_form' = formKey;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [customField, setCustomField] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const { token } = useSession();

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [visitorPhotoFile, setVisitorPhotoFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [vtLoading, setVtLoading] = useState(true);
  const [visitorType, setVisitorType] = useState<any[]>([]);
  // const visitor type by id

  const [dynamicSteps, setDynamicSteps] = useState<string[]>([]);
  const [draggableSteps, setDraggableSteps] = useState<string[]>([]);
  const [sectionsData, setSectionsData] = useState<SectionPageVisitorType[]>([]);
  const [dataVisitor, setDataVisitor] = useState<{ question_page: SectionPageVisitor[] }[]>([]);
  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;
  const [isSingle, setIsSingle] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [visitorDatas, setVisitorDatas] = useState<Item[]>([]);
  // (opsional) jika mau pilih group yang sedang diedit
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  // Duplikat Question Page
  const [groupForms, setGroupForms] = useState<Record<number, FormVisitor[][]>>({});
  const [removing, setRemoving] = React.useState<Record<string, boolean>>({});

  const formsOf = (section: any) => (Array.isArray(section?.[FORM_KEY]) ? section[FORM_KEY] : []);

  const updateSectionForm = (sec: any, updater: (arr: any[]) => any[]) => ({
    ...sec,
    [FORM_KEY]: updater(formsOf(sec)),
  });

  const [pvDlg, setPvDlg] = React.useState<{ open: boolean; rowIdx: number | null; forms: any[] }>({
    open: false,
    rowIdx: null,
    forms: [],
  });

  // end PV

  useEffect(() => {
    if (!isGroup || sectionsData.length === 0) return;

    const templateQP: SectionPageVisitor[] = sectionsData.map((s, sIdx) => ({
      sort: s.sort ?? sIdx,
      name: s.name,
      status: 0,
      is_document: s.is_document ?? false,
      can_multiple_used: s.can_multiple_used ?? false,
      self_only: s.self_only ?? false,
      foreign_id: s.foreign_id ?? '',
      // Penting: pakai visit_form sebagai "form" untuk payload
      form: formsOf(s).map((f, fIdx) => ({
        ...f,
        sort: f.sort ?? fIdx,
        answer_text: '',
        answer_datetime: '',
        answer_file: '',
      })),
    }));

    setDataVisitor([{ question_page: templateQP }]);
    setActiveGroupIdx(0);
  }, [isGroup, sectionsData]);

  useEffect(() => {
    if (!sectionsData?.length) return;

    setGroupForms((prev) => {
      const next = { ...prev };
      sectionsData.forEach((section, secIdx) => {
        if (section.can_multiple_used) {
          const template = formsOf(section).map((f) => ({
            ...f,
            answer_text: '',
            answer_datetime: '',
            answer_file: '',
          }));
          // kalau belum ada, seed dengan 1 lembar
          // if (!next[secIdx] || next[secIdx].length === 0) {
          //   next[secIdx] = [template];
          // }
        }
      });
      return next;
    });
  }, [sectionsData]);

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
    const fetchVisitorTypeDetails = async () => {
      if (!formData.visitor_type || !token) return;

      setVtLoading(true); // mulai skeleton
      const minLoadingTime = 500; // ms, minimal loading terlihat
      const startTime = Date.now();

      try {
        const res = await getVisitorTypeById(token, formData.visitor_type);
        const selectedType = res?.collection;

        if (selectedType && selectedType.section_page_visitor_types) {
          const sections = selectedType.section_page_visitor_types;
          setDraggableSteps(sections.map((s: any) => s.name));
          setSectionsData(sections);
        } else {
          setDraggableSteps([]);
          setSectionsData([]);
        }
      } catch (error) {
        console.error('Failed to fetch visitor type details', error);
        setDraggableSteps([]);
        setSectionsData([]);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(minLoadingTime - elapsed, 0);
        setTimeout(() => setVtLoading(false), remaining);
      }
    };

    fetchVisitorTypeDetails();
  }, [formData.visitor_type, token]);
  const rawCount = vtLoading ? visitorType?.length || 6 : 0;

  // bikin genap
  const skeletonCount = rawCount % 2 === 0 ? rawCount : rawCount + 1;

  // const getSectionType = (section: any) => {
  //   if (
  //     section.visit_form.some((field: any) => field.remarks === 'vehicle_plate') &&
  //     !section.is_document &&
  //     !section.can_multiple_used
  //   )
  //     return 'parking';
  //   else if (
  //     section.visit_form.some((field: any) => field.remarks === 'host') &&
  //     !section.is_document &&
  //     section.can_multiple_used
  //   )
  //     return 'purpose_visit';
  //   else if (
  //     section.visit_form.some((field: any) => field.remarks === 'nda') &&
  //     section.is_document &&
  //     !section.can_multiple_used
  //   )
  //     return 'nda';
  //   else if (
  //     section.visit_form.some((field: any) => field.remarks === 'identity_image') &&
  //     section.is_document &&
  //     !section.can_multiple_used
  //   )
  //     return 'identity_image';
  //   else if (
  //     section.visit_form.some((field: any) => field.remarks === 'selfie_image') &&
  //     section.is_document &&
  //     !section.can_multiple_used
  //   )
  //     return 'selfie_image';
  //   else if (!section.is_document && !section.can_multiple_used) return 'visitor_information';
  //   else if (!section.is_document && section.can_multiple_used) return 'visitor_information_group';
  // };

  const getSectionType = (section: any) => {
    const f = formsOf(section);
    if (
      f.some((x: any) => x.remarks === 'vehicle_plate') &&
      !section.is_document &&
      !section.can_multiple_used
    )
      return 'parking';
    if (
      f.some((x: any) => x.remarks === 'host') &&
      !section.is_document &&
      section.can_multiple_used
    )
      return 'purpose_visit';
    if (
      f.some((x: any) => x.remarks === 'nda') &&
      section.is_document &&
      !section.can_multiple_used
    )
      return 'nda';
    if (
      f.some((x: any) => x.remarks === 'identity_image') &&
      section.is_document &&
      !section.can_multiple_used
    )
      return 'identity_image';
    if (
      f.some((x: any) => x.remarks === 'selfie_image') &&
      section.is_document &&
      !section.can_multiple_used
    )
      return 'selfie_image';
    if (!section.is_document && !section.can_multiple_used) return 'visitor_information';
    if (!section.is_document && section.can_multiple_used) return 'visitor_information_group';
  };

  const handleSteps = (step: number) => {
    const hasVisitorTypes = (visitorType?.length ?? 0) > 0;
    const showVTListSkeleton = vtLoading || !hasVisitorTypes;
    if (step == 0) {
      return (
        <Box>
          <Grid container spacing={2}>
            <Grid sx={{ mt: 0 }} size={{ xs: 12, sm: 12 }}>
              {/* <Alert severity="info">Complete the following data properly and correctly</Alert> */}
              <Divider />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
                Visitor Type
              </CustomFormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={formData.visitor_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      visitor_type: e.target.value,
                    }))
                  }
                >
                  <Grid container spacing={1}>
                    {showVTListSkeleton
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <Grid size={{ xs: 6, sm: 6 }} key={`sk-${i}`}>
                            <Card sx={{ width: '100%', p: 1 }}>
                              <Skeleton />
                              <Skeleton animation="wave" />
                              <Skeleton animation={false} />
                            </Card>
                          </Grid>
                        ))
                      : visitorType.map((type) => (
                          <Grid size={{ xs: 6, sm: 6 }} key={type.id}>
                            <FormControlLabel
                              value={type.id}
                              control={<Radio sx={{}} />}
                              sx={{ m: 0, width: '100%' }}
                              label={
                                <Paper
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    textAlign: 'center',
                                    fontWeight: formData.visitor_type === type.id ? 600 : 400,
                                    border: '1px solid',
                                    borderColor:
                                      formData.visitor_type === type.id
                                        ? 'primary.main'
                                        : 'divider',
                                    bgcolor:
                                      formData.visitor_type === type.id
                                        ? 'primary.light'
                                        : 'background.paper',
                                  }}
                                >
                                  {type.name}
                                </Paper>
                              }
                            />
                          </Grid>
                        ))}
                    {/* {visitorType.map((type) => (
                      <Grid size={{ xs: 6, sm: 6 }} key={type.id}>
                        <FormControlLabel
                          value={type.id}
                          control={<Radio sx={{}} />} // sembunyikan bulatan radio
                          label={
                            <Paper
                              sx={{
                                px: 2,
                                py: 1,
                                cursor: 'pointer',
                                transition: '0.3s',
                                fontWeight: formData.visitor_type === type.id ? 600 : 400,
                                minWidth: '100px',
                                textAlign: 'center',
                              }}
                            >
                              {type.name}
                            </Paper>
                          }
                        />
                      </Grid>
                    ))} */}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
                Select Status Visitor
              </CustomFormLabel>
              {formData.visitor_type && (
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={isSingle}
                        value={formData.is_group}
                        onChange={() => {
                          setIsSingle(true);
                          setIsGroup(false);
                          setFormData((prev) => ({
                            ...prev,
                            is_group: false, // ubah nilainya jadi false
                          }));
                        }}
                      />
                    }
                    label="Single"
                  />

                  <FormControlLabel
                    control={
                      <Radio
                        checked={isGroup}
                        value={formData.is_group}
                        onChange={() => {
                          setIsSingle(false);
                          setIsGroup(true);
                          setFormData((prev) => ({
                            ...prev,
                            is_group: true, // ubah nilainya jadi true
                          }));
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        Group
                        <Tooltip title="When activated, you can add more than one visitor">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      );
    }
    const currentSection = sectionsData[step - 1]; // dikurangi 1 karena step 0 khusus
    // console.log('Current section:', currentSection);
    if (!currentSection) return null;

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

    const handleDetailChange = (
      sectionKey: SectionKey,
      index: number,
      field: keyof FormVisitor,
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

    return (
      <>
        {isSingle && (
          <Grid>
            {(() => {
              const section = sectionsData[activeStep - 1];
              const sectionType = getSectionType(section);

              if (sectionType === 'visitor_information') {
                return (
                  <>
                    <VisitorSelect
                      token={token as string}
                      onSelect={(visitor) => {
                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item) =>
                                    item.remarks === 'host'
                                      ? {
                                          ...item,
                                          value: JSON.stringify({
                                            id: visitor.id,
                                            name: visitor.name,
                                            email: visitor.email,
                                            phone: visitor.phone,
                                            faceimage: visitor.faceimage,
                                          }),
                                        }
                                      : item,
                                  ),
                                ),
                          ),
                        );
                      }}
                    />
                    <Accordion key={activeStep} expanded sx={{ mt: 2 }}>
                      <AccordionSummary onClick={(e) => e.stopPropagation()}>
                        <Typography fontWeight={600}>{section.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ paddingTop: 0 }}>
                        <Table>
                          <TableBody>
                            {renderDetailRows(formsOf(section), (index, field, value) => {
                              setSectionsData((prev) =>
                                prev.map((s, sIdx) =>
                                  sIdx !== activeStep - 1
                                    ? s
                                    : updateSectionForm(s, (arr) =>
                                        arr.map((item, i) =>
                                          i === index ? { ...item, [field]: value } : item,
                                        ),
                                      ),
                                ),
                              );
                            })}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </>
                );
              } else if (sectionType === 'parking') {
                return (
                  <Table>
                    <TableBody>
                      {renderDetailRows(formsOf(section), (index, field, value) => {
                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item, i) =>
                                    i === index ? { ...item, [field]: value } : item,
                                  ),
                                ),
                          ),
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              } else if (sectionType === 'purpose_visit') {
                return (
                  <Table>
                    <TableBody>
                      {renderDetailRows(formsOf(section), (index, field, value) => {
                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item, i) =>
                                    i === index ? { ...item, [field]: value } : item,
                                  ),
                                ),
                          ),
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              } else if (sectionType === 'nda') {
                return (
                  <Table>
                    <TableBody>
                      {renderDetailRows(formsOf(section), (index, field, value) => {
                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item, i) =>
                                    i === index ? { ...item, [field]: value } : item,
                                  ),
                                ),
                          ),
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              } else if (sectionType === 'identity_image') {
                return (
                  <Table>
                    <TableBody>
                      {renderDetailRows(formsOf(section), (index, field, value) => {
                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item, i) =>
                                    i === index ? { ...item, [field]: value } : item,
                                  ),
                                ),
                          ),
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              } else if (sectionType === 'selfie_image') {
                return (
                  <Table>
                    <TableBody>
                      {renderDetailRows(formsOf(section), (index, field, value) => {
                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item, i) =>
                                    i === index ? { ...item, [field]: value } : item,
                                  ),
                                ),
                          ),
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              }

              return null;
            })()}
          </Grid>
        )}
        {isGroup && (
          <Grid>
            {(() => {
              const section = sectionsData[activeStep - 1];
              console.log('section', section);
              const sectionType = getSectionType(section);

              if (sectionType === 'visitor_information_group') {
                return (
                  <Grid>
                    <Box>
                      <TableContainer component={Paper} sx={{ mb: 1 }}>
                        <Table
                          size="small"
                          sx={{
                            minWidth: 1000, // paksa lebar minimal biar bisa scroll kalau banyak kolom
                            tableLayout: 'auto',
                            '& th, & td': { whiteSpace: 'nowrap' }, // jangan wrap supaya header 1 baris
                          }}
                        >
                          <TableHead>
                            <TableRow>
                              {(dataVisitor[0]?.question_page[activeStep - 1]?.form || []).map(
                                (f, i) => (
                                  <TableCell key={f.custom_field_id || i}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      // sx={{ textAlign: 'center' }}
                                    >
                                      {f.long_display_text}
                                    </Typography>
                                  </TableCell>
                                ),
                              )}
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                  Actions
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                  On Self
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody sx={{ overflow: 'auto' }}>
                            {dataVisitor.length > 0 ? (
                              dataVisitor.map((group, gIdx) => {
                                const page = group.question_page[activeStep - 1];
                                if (!page) return null;

                                return (
                                  <TableRow key={gIdx}>
                                    {page.form?.map((field, fIdx) => (
                                      //   <TableCell key={field.custom_field_id || `${gIdx}-${fIdx}`}>
                                      //   {(() => {
                                      //     const batchKeys = Object.keys(groupedPages.batch_page);
                                      //     const formKey = batchKeys[fIdx];
                                      //     const shared = formKey
                                      //       ? groupedPages.batch_page[formKey]
                                      //       : undefined;

                                      //     // ambil hanya jawaban yang relevan dari groupedPages
                                      //     const pickAns = (f: any) => {
                                      //       const out: any = {};
                                      //       if (f?.answer_text != null)
                                      //         out.answer_text = f.answer_text;
                                      //       if (f?.answer_datetime != null)
                                      //         out.answer_datetime = f.answer_datetime;
                                      //       if (f?.answer_file != null)
                                      //         out.answer_file = f.answer_file;
                                      //       return out;
                                      //     };

                                      //     // proxy: struktur dari "field" + nilai jawaban dari groupedPages
                                      //     const proxyField = shared
                                      //       ? { ...field, ...pickAns(shared) }
                                      //       : field;

                                      //     return renderFieldInput(
                                      //       proxyField as FormVisitor,
                                      //       fIdx,
                                      //       // onChange: update groupedPages (dengan deep clone yang benar)
                                      //       (idx, fieldKey, value) => {
                                      //         setGroupedPages((prev) => {
                                      //           const next = {
                                      //             ...prev,
                                      //             batch_page: { ...prev.batch_page },
                                      //           };
                                      //           const bKeys = Object.keys(next.batch_page);
                                      //           const k = bKeys[fIdx];
                                      //           if (k) {
                                      //             next.batch_page[k] = {
                                      //               ...next.batch_page[k],
                                      //               [fieldKey]: value,
                                      //             };
                                      //           }
                                      //           return next;
                                      //         });
                                      //       },
                                      //       undefined,
                                      //       {
                                      //         showLabel: false,
                                      //         uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                      //       },
                                      //     );
                                      //   })()}
                                      // </TableCell>

                                      // <TableCell key={field.custom_field_id || `${gIdx}-${fIdx}`}>
                                      //   {(() => {
                                      //     // cari entry batch yang match field ini (bukan berdasarkan index)
                                      //     const matchedKey = Object.keys(
                                      //       groupedPages.batch_page || {},
                                      //     ).find((k) =>
                                      //       sameField(groupedPages.batch_page[k], field),
                                      //     );
                                      //     const shared = matchedKey
                                      //       ? groupedPages.batch_page[matchedKey]
                                      //       : undefined;

                                      //     // proxy untuk display
                                      //     const proxyField = shared
                                      //       ? { ...field, ...pickAns(shared) }
                                      //       : field;

                                      //     return renderFieldInput(
                                      //       proxyField as FormVisitor,
                                      //       fIdx,
                                      //       (idx, fieldKey, value) => {
                                      //         setGroupedPages((prev) => {
                                      //           const bp = prev.batch_page || {};
                                      //           const key =
                                      //             Object.keys(bp).find((k) =>
                                      //               sameField(bp[k], field),
                                      //             ) ||
                                      //             // optional: kalau belum ada, buat entri baru dengan identitas field
                                      //             field.custom_field_id ||
                                      //             field.remarks ||
                                      //             String(idx);

                                      //           return {
                                      //             ...prev,
                                      //             batch_page: {
                                      //               ...bp,
                                      //               [key]: {
                                      //                 ...(bp[key] || {
                                      //                   // seed identitas supaya matching berikutnya konsisten
                                      //                   custom_field_id: field.custom_field_id,
                                      //                   remarks: field.remarks,
                                      //                   field_type: field.field_type,
                                      //                 }),
                                      //                 [fieldKey]: value,
                                      //               },
                                      //             },
                                      //           };
                                      //         });
                                      //       },
                                      //       undefined,
                                      //       {
                                      //         showLabel: false,
                                      //         uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                      //       },
                                      //     );
                                      //   })()}
                                      // </TableCell>
                                      <TableCell key={field.custom_field_id || `${gIdx}-${fIdx}`}>
                                        {(() => {
                                          // cari default kolom (template)
                                          const matchedKey = Object.keys(
                                            groupedPages.batch_page || {},
                                          ).find((k) =>
                                            sameField(groupedPages.batch_page[k], field),
                                          );
                                          const shared = matchedKey
                                            ? groupedPages.batch_page[matchedKey]
                                            : undefined;

                                          // TAMPIL: pakai nilai baris kalau sudah ada, kalau kosong baru fallback ke default kolom
                                          const proxyField = hasAns(field)
                                            ? field
                                            : shared
                                            ? { ...field, ...pickAns(shared) }
                                            : field;

                                          return renderFieldInput(
                                            proxyField as FormVisitor,
                                            fIdx,
                                            // SIMPAN: tulis ke dataVisitor (baris & kolom yg aktif)
                                            (idx, fieldKey, value) => {
                                              setDataVisitor((prev) => {
                                                const next = [...prev];
                                                const s = activeStep - 1;
                                                if (!next[gIdx]?.question_page?.[s]?.form?.[fIdx])
                                                  return prev;
                                                next[gIdx].question_page[s].form[fIdx] = {
                                                  ...next[gIdx].question_page[s].form[fIdx],
                                                  [fieldKey]: value,
                                                };
                                                return next;
                                              });
                                            },
                                            undefined,
                                            {
                                              showLabel: false,
                                              uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                            },
                                          );
                                        })()}
                                      </TableCell>
                                    ))}

                                    <TableCell align="right" key={gIdx}>
                                      {dataVisitor.length > 1 && (
                                        <IconButton
                                          aria-label="delete-row"
                                          onClick={() => handleDeleteGroupRow(gIdx)}
                                          size="small"
                                        >
                                          <IconTrash />
                                        </IconButton>
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {dataVisitor.length > 1 && (
                                        <Switch
                                          checked={hasRowPv(gIdx)}
                                          onChange={(e) => {
                                            if (e.target.checked) openPvDialog(gIdx);
                                            else clearRowPv(gIdx);
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={12} align="center">
                                  No visitor data. Click "Add New" to start.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>

                          {/* Tombol Add New pakai handler yang baru */}
                          <MuiButton
                            size="small"
                            onClick={handleAddDetails}
                            sx={{ mx: 1, my: 1 }}
                            variant="contained"
                          >
                            Add New
                          </MuiButton>
                        </Table>
                        {/* Dialog On Self */}
                        <Dialog
                          open={pvDlg.open}
                          onClose={() => setPvDlg({ open: false, rowIdx: null, forms: [] })}
                          maxWidth="md"
                          fullWidth
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              display={'flex'}
                              justifyContent="space-between"
                              alignItems={'center'}
                            >
                              <Typography variant="h6" sx={{ mb: 2 }}>
                                Purpose Visit (This Person Only)
                              </Typography>
                              <IconButton
                                onClick={() => setPvDlg({ open: false, rowIdx: null, forms: [] })}
                              >
                                <IconX />
                              </IconButton>
                            </Box>

                            <Table size="small">
                              <TableBody>
                                {pvDlg.forms.map((f, i) => (
                                  <TableRow key={f.custom_field_id ?? f.remarks ?? i}>
                                    <TableCell>
                                      {/* Reuse renderer milikmu */}
                                      {renderFieldInput(
                                        f,
                                        i,
                                        (idx, key, val) =>
                                          setPvDlg((d) => {
                                            const cp = [...d.forms];
                                            cp[idx] = { ...cp[idx], [key]: val };
                                            return { ...d, forms: cp };
                                          }),
                                        undefined,
                                        { showLabel: true, uniqueKey: `pv:${pvDlg.rowIdx}:${i}` },
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            <Box
                              sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}
                            >
                              <Button
                                onClick={() => setPvDlg({ open: false, rowIdx: null, forms: [] })}
                              >
                                Cancel
                              </Button>
                              <Button variant="contained" onClick={savePvDialog}>
                                Save
                              </Button>
                            </Box>
                          </Box>
                        </Dialog>
                      </TableContainer>
                    </Box>
                  </Grid>
                );
              } else if (sectionType === 'purpose_visit') {
                // helper (pakai punyamu kalau sudah ada)
                const pickAns = (f: any) => {
                  const out: any = {};
                  if (f?.answer_text != null) out.answer_text = f.answer_text;
                  if (f?.answer_datetime != null) out.answer_datetime = f.answer_datetime;
                  if (f?.answer_file != null) out.answer_file = f.answer_file;
                  return out;
                };
                const sameField = (a: any, b: any) =>
                  (a?.custom_field_id &&
                    b?.custom_field_id &&
                    a.custom_field_id === b.custom_field_id) ||
                  (a?.remarks && b?.remarks && a.remarks === b.remarks);

                // gabungkan nilai dari groupedPages.single_page ke visit_form (untuk value di input)
                const mergedVisitForm = formsOf(section).map((f: any) => {
                  const shared = groupedPages.single_page.find((sf) => sameField(sf, f));
                  return shared ? { ...f, ...pickAns(shared) } : f;
                });

                return (
                  <Table>
                    <TableBody>
                      {renderDetailRows(mergedVisitForm, (idx, fieldKey, value) => {
                        setGroupedPages((prev) => {
                          const next = { ...prev, single_page: [...prev.single_page] };

                          // field “dasar” berdasarkan index kolom di section ini
                          const base = formsOf(section)[idx];
                          const found = next.single_page.findIndex((sf) => sameField(sf, base));

                          // pastikan foreign_id ikut terset (kalau belum)
                          const resolvedForeign =
                            base?.foreign_id ??
                            section?.foreign_id ??
                            base?.custom_field_id ??
                            null;

                          const payload = {
                            ...(found >= 0 ? next.single_page[found] : base),
                            foreign_id:
                              found >= 0
                                ? next.single_page[found].foreign_id ?? resolvedForeign
                                : resolvedForeign,
                            [fieldKey]: value,
                          };

                          if (found >= 0) next.single_page[found] = payload;
                          else next.single_page.push(payload);

                          return next;
                        });

                        // ❌ tidak perlu setSectionsData di sini (hindari 2 sumber state)
                      })}
                    </TableBody>
                  </Table>
                );
              }

              return null;
            })()}
          </Grid>
        )}
      </>
    );
  };

  type SectionKey = 'visit_form' | 'pra_form' | 'checkout_form';

  const handleAddDetail = (sectionKey: SectionKey) => {
    setSectionsData((prev) =>
      prev.map((section, sectionIndex) => {
        if (sectionIndex === activeStep - 1) {
          const currentDetails = Array.isArray(section[sectionKey]) ? section[sectionKey] : [];
          const sortIndex = currentDetails.length;

          const newItem: FormVisitor = {
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
            answer_datetime: '',
            answer_text: '',
            answer_file: '',
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

  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
  };

  const handleDeleteGroupRow = async (rowIdx: number) => {
    try {
      const page = dataVisitor[rowIdx]?.question_page?.[activeStep - 1];

      // kumpulkan semua URL CDN di baris ini
      const urls: string[] =
        (page?.form ?? [])
          .map((f: any) => f?.answer_file)
          .filter((u: any) => typeof u === 'string' && u.trim().length > 0) || [];

      // hapus file CDN satu per satu
      await Promise.all(
        urls.map((u) =>
          axiosInstance2
            .delete(`/cdn${u}`)
            .then(() => {
              console.log(`✅ Berhasil hapus file CDN: ${u}`);
            })
            .catch((err) => {
              console.warn(`⚠️ Gagal hapus file CDN ${u}:`, err);
            }),
        ),
      );

      // setelah file dihapus, hapus row di state
      setDataVisitor((prev) => prev.filter((_, i) => i !== rowIdx));

      // atur ulang index aktif kalau perlu
      setActiveGroupIdx((prevIdx) => {
        if (rowIdx < prevIdx) return prevIdx - 1;
        if (rowIdx === prevIdx) return Math.max(0, prevIdx - 1);
        return prevIdx;
      });
    } catch (e) {
      console.error('❌ Failed to delete row:', e);
    }
  };

  const fieldKey = (f: any) => f?.custom_field_id || sanitize(f?.remarks) || '';
  const [uploadNames, setUploadNames] = React.useState<Record<string, string>>({});

  const renderFieldInput = (
    field: FormVisitor,
    index: number,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
    onDelete?: (index: number) => void,
    opts?: { showLabel?: boolean; uniqueKey?: string },
  ) => {
    const showLabel = opts?.showLabel ?? true;

    const renderInput = () => {
      // const [uploadMethod, setUploadMethod] = React.useState('file'); // default file upload
      const key = opts?.uniqueKey ?? String(index);
      switch (field.field_type) {
        case 0: // Text
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter text"
              fullWidth
              // sx={{ width: 200, maxWidth: '100%' }}
            />
          );

        case 1: // Number
          return (
            <TextField
              type="number"
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter number"
              fullWidth
            />
          );

        case 2: // Email
          return (
            <TextField
              type="email"
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter email"
              fullWidth
              sx={{ width: 150 }}
            />
          );

        case 3: {
          let options: { value: string; name: string }[] = [];

          if (field.remarks === 'host') {
            options = employee.map((emp: any) => ({ value: emp.id, name: emp.name }));
          } else if (field.remarks === 'site_place') {
            options = sites.map((site: any) => ({ value: site.id, name: site.name }));
          } else {
            options = (field.multiple_option_fields || []).map((opt: any) =>
              typeof opt === 'object' ? opt : { value: opt, name: opt },
            );
          }

          return (
            <TextField
              select
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              fullWidth
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        case 4: // Date
          return (
            <TextField
              type="date"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 5: // Radio
          if (field.remarks === 'gender') {
            return (
              <TextField
                select
                size="small"
                value={field.answer_text || ''}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                fullWidth
                sx={{ width: 100 }}
              >
                {field.multiple_option_fields?.map((opt) => (
                  <MenuItem key={opt.id} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (field.remarks === 'vehicle_type') {
            return (
              <TextField
                select
                size="small"
                value={field.answer_text || ''}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                fullWidth
              >
                {field.multiple_option_fields?.map((opt) => (
                  <MenuItem key={opt.id} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            );
          }
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter text"
              fullWidth
            />
          );

        case 6: // Checkbox
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter text"
              fullWidth
            />
          );

        case 8: // Time
          return (
            <TextField
              type="time"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        // case 9: // DateTime
        //   return (
        //     <TextField
        //       type="datetime-local"
        //       size="small"
        //       value={field.answer_datetime}
        //       onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
        //       fullWidth
        //     />
        //   );
        case 9:
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                value={field.answer_datetime ? dayjs(field.answer_datetime) : null}
                ampm={false}
                onChange={(newValue) => {
                  if (newValue) {
                    const utc = newValue.utc().format(); // hasil: 2025-08-05T10:00:00Z
                    onChange(index, 'answer_datetime', utc);
                  }
                }}
                format="ddd, DD - MMM - YYYY, HH:mm"
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          );

        case 10: // Camera
          return (
            <CameraUpload
              value={field.answer_file}
              onChange={(url) => onChange(index, 'answer_file', url)}
            />
          );

        case 11: {
          // File upload (PDF / NDA)
          // const inputId = `pdf-${opts?.uniqueKey ?? index}`;
          const key = opts?.uniqueKey ?? String(index);
          const fileUrl = (field as any).answer_file as string | undefined;
          return (
            <Box>
              <label htmlFor={key}>
                <Box
                  sx={{
                    border: '2px dashed #90caf9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    borderRadius: 2,
                    p: 0.5,
                    textAlign: 'center',
                    backgroundColor: '#f5faff',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                  <Typography variant="subtitle1">Upload File</Typography>
                </Box>
              </label>

              <input
                id={key}
                type="file"
                accept="*"
                hidden
                // onChange={handlePDFUploadFor(index, onChange)
                onChange={(e) =>
                  handleFileChangeForField(
                    e as React.ChangeEvent<HTMLInputElement>,
                    (url) => onChange(index, 'answer_file', url),
                    key,
                  )
                }
              />

              {fileUrl && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" noWrap>
                    {/* {fileUrl.split('/').pop()} */}
                    {uploadNames[key] ?? ''}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleRemoveFileForField(
                        (field as any).answer_file,
                        (url) => onChange(index, 'answer_file', url), // kosongkan state
                        key, // reset <input id=key>
                      )
                    }
                  >
                    <IconX size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        }

        case 12: {
          const key = opts?.uniqueKey ?? String(index);
          return (
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={1}
              width={'380px'}
            >
              {/* Pilihan metode upload */}
              <TextField
                select
                size="small"
                value={uploadMethods[key] || 'file'}
                onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                fullWidth
                sx={{ width: '200px' }}
              >
                <MenuItem value="file">Choose File</MenuItem>
                <MenuItem value="camera">Take Photo</MenuItem>
              </TextField>

              {/* Render sesuai metode yang dipilih */}
              {(uploadMethods[key] || 'file') === 'camera' ? (
                <CameraUpload
                  value={field.answer_file}
                  onChange={(url) => onChange(index, 'answer_file', url)}
                />
              ) : (
                // <TextField
                //   size="small"
                //   type="file"
                //   fullWidth
                //   sx={{ width: '250px' }}
                //   onChange={(e) =>
                //     handleFileChangeForField(e as React.ChangeEvent<HTMLInputElement>, (url) =>
                //       onChange(index, 'answer_file', url),
                //     )
                //   }
                // />
                <Box>
                  <label htmlFor={key}>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        borderRadius: 2,
                        p: 0.5,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                      <Typography variant="subtitle1">Upload File</Typography>
                    </Box>
                  </label>

                  <input
                    id={key}
                    type="file"
                    accept="*"
                    hidden
                    onChange={(e) =>
                      handleFileChangeForField(e as React.ChangeEvent<HTMLInputElement>, (url) =>
                        onChange(index, 'answer_file', url),
                      )
                    }
                  />

                  {/* INFO + REMOVE */}
                  {!!(field as any).answer_file && (
                    <Box sx={{ paddingTop: '5px' }} display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {String((field as any).answer_file)
                          .split('/')
                          .pop()}
                      </Typography>

                      <IconButton
                        size="small"
                        color="error"
                        disabled={!!removing[key]}
                        onClick={() =>
                          handleRemoveFileForField(
                            (field as any).answer_file,
                            (url) => onChange(index, 'answer_file', url), // kosongkan state
                            key, // reset <input id=key>
                          )
                        }
                      >
                        <IconX size={16} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        }

        default:
          return (
            <TextField
              size="small"
              value={field.long_display_text}
              onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
              placeholder="Enter value"
              fullWidth
            />
          );
      }
    };

    return (
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        {showLabel && (
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {field.long_display_text}
          </Typography>
        )}
        {renderInput()}
      </Box>
    );
  };

  // Upload Image && file
  const [siteImageFile, setSiteImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ [index: number]: string | null }>({});
  const [openCamera, setOpenCamera] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const webcamRef = useRef<Webcam>(null);

  const clearFileForField = (setAnswerFile: (url: string) => void) => {
    setScreenshot(null);
    setPreviewUrl(null);
    setOpenCamera(false);
    setAnswerFile(''); // kosongkan answer_file di field aktif
  };

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');

    try {
      const response = await axios.post('http://192.168.1.116:8000/cdn/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = response.data?.collection?.file_url;
      console.log('CDN Response File URL:', fileUrl);

      if (!fileUrl) return null;

      // Tambahkan protokol jika belum ada
      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleCaptureForField = async (setAnswerFile: (url: string) => void) => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const path = await uploadFileToCDN(blob);
    if (!path) return;

    setScreenshot(imageSrc);
    setPreviewUrl(imageSrc);
    setAnswerFile(path); // << simpan ke field ini
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      console.warn('Hanya file PDF yang diperbolehkan.');
      return;
    }

    const path = await uploadFileToCDN(file);
    if (!path) return;

    // Simpan URL ke dalam answer_file untuk field_type 11 (NDA)
    onChangesByFieldTypes('answer_file', path, 11);
  };

  const handlePDFUploadFor =
    (idx: number, onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // if (file.type !== 'application/pdf') {
      //   console.warn('Hanya file PDF yang diperbolehkan.');
      //   e.target.value = '';
      //   return;
      // }
      const path = await uploadFileToCDN(file);
      // kalau sukses, kirim balik ke onChange (akan update groupedPages di caller kamu)
      if (path) onChange(idx, 'answer_file', path);
      // reset supaya pilih file yg sama masih trigger onChange
      e.target.value = '';
    };

  const onChangesByFieldTypes = (key: keyof FormVisitor, value: any, targetFieldType: number) => {
    setSectionsData((prev) =>
      prev.map((sec) =>
        updateSectionForm(sec, (arr) =>
          arr.map((form) =>
            form.field_type === targetFieldType ? { ...form, [key]: value } : form,
          ),
        ),
      ),
    );

    // (opsional) sinkronisasi tambahan kamu tetap bisa lanjut di bawah ini
    setGroupedPages((prev) => {
      const pvSection = sectionsData.find(isPurposeVisit);
      if (!pvSection) return prev;
      return {
        ...prev,
        single_page: prev.single_page.map((f) =>
          f.field_type === targetFieldType ? { ...f, [key]: value } : f,
        ),
      };
    });
  };

  const resetFileInput = (inputId: string) => {
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) el.value = '';
  };

  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string,
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        // API kamu: DELETE langsung ke URL file
        await axiosInstance2.delete(`/cdn${currentUrl}`);
        console.log('✅ Berhasil hapus file CDN:', currentUrl);
      }
      setAnswerFile(''); // kosongkan di state form
      resetFileInput(inputId); // supaya bisa upload file yg sama lagi
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving((s) => ({ ...s, [inputId]: false }));
    }
  };
  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
    }
    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);
  };

  // const handlePDFUploads = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   ctx?: { mode: 'single' | 'group'; groupIdx?: number; sectionIdx?: number; formIdx?: number },
  // ) => {
  //   const input = e.target;
  //   const file = input.files?.[0];
  //   if (!file) return;

  //   if (file.type !== 'application/pdf') {
  //     console.warn('[PDF] hanya PDF');
  //     input.value = '';
  //     return;
  //   }

  //   try {
  //     console.log('[PDF] mulai upload:', file.name);
  //     const url = await uploadFileToCDN(file);
  //     if (!url) {
  //       console.warn('[PDF] upload gagal');
  //       input.value = '';
  //       return;
  //     }
  //     console.log('[PDF] sukses upload:', url);

  //     if (ctx?.mode === 'group') {
  //       // update langsung ke dataVisitor pada baris/kolom yg benar
  //       setDataVisitor((prev) => {
  //         const next = [...prev];
  //         const g = ctx.groupIdx ?? 0;
  //         const s = ctx.sectionIdx ?? activeStep - 1;
  //         const f = ctx.formIdx ?? 0;
  //         if (!next[g]?.question_page?.[s]?.form?.[f]) return prev; // guard
  //         (next[g].question_page[s].form[f] as any).answer_file = url;
  //         return next;
  //       });
  //       console.log('[PDF] state dataVisitor ter‑update (group)');
  //     } else {
  //       // single
  //       onChangesByFieldType('answer_file', url, 11);
  //       console.log('[PDF] state sectionsData ter‑update (single)');
  //     }
  //   } finally {
  //     // reset supaya pilih file yg sama tetap memicu onChange
  //     input.value = '';
  //   }
  // };

  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
  const renderDetailRows = (
    details: FormVisitor[] | any,
    onChange: (index: number, field: keyof FormVisitor, value: any) => void,
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
        {/* Display Text (label) */}
        <TableCell>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {item.long_display_text}
            {item.mandatory && (
              <Typography component="span" color="error" sx={{ ml: 0.5, lineHeight: 1 }}>
                *
              </Typography>
            )}
          </Typography>
          {/* Render sesuai field_type */}
          {(() => {
            switch (item.field_type) {
              case 0: // Text
                return (
                  <TextField
                    size="small"
                    value={item.answer_text}
                    onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                    placeholder="Enter text"
                    fullWidth
                  />
                );
              case 1: // Number
                return (
                  <TextField
                    type="number"
                    size="small"
                    value={item.answer_text}
                    onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                    placeholder="Enter number"
                    fullWidth
                  />
                );
              case 2: // Email
                return (
                  <TextField
                    type="email"
                    size="small"
                    value={item.answer_text}
                    onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                    placeholder="Enter email"
                    fullWidth
                  />
                );
              case 3: {
                let options: { value: string; name: string }[] = [];

                if (item.remarks === 'host') {
                  options = employee.map((emp: any) => ({
                    value: emp.id,
                    name: emp.name,
                  }));
                } else if (item.remarks === 'site_place') {
                  options = sites
                    .filter((site: any) => site.can_visited === true)
                    .map((site: any) => ({
                      value: site.id,
                      name: site.name,
                    }));
                } else {
                  options = (item.multiple_option_fields || []).map((opt: any) =>
                    typeof opt === 'object' ? opt : { value: opt, name: opt },
                  );
                }

                return (
                  <Autocomplete
                    size="small"
                    options={options}
                    getOptionLabel={(option) => option.name}
                    inputValue={inputValues[index] || ''}
                    onInputChange={(_, newInputValue) =>
                      setInputValues((prev) => ({ ...prev, [index]: newInputValue }))
                    }
                    filterOptions={(opts, state) => {
                      if (state.inputValue.length < 3) return [];
                      return opts.filter((opt) =>
                        opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                      );
                    }}
                    noOptionsText={
                      (inputValues[index] || '').length < 3
                        ? 'Ketik minimal 3 karakter untuk mencari'
                        : 'Tidak ditemukan'
                    }
                    value={options.find((opt) => opt.value === item.answer_text) || null}
                    onChange={(_, newValue) =>
                      onChange(index, 'answer_text', newValue ? newValue.value : '')
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pilih opsi"
                        placeholder="Ketik minimal 3 karakter"
                        fullWidth
                      />
                    )}
                  />
                );
              }
              case 4: // Datepicker
                return (
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                    <DateTimePicker
                      value={startTime}
                      ampm={false}
                      onChange={setStartTime}
                      format="ddd, DD - MMM - YYYY, HH:mm"
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                );
              case 5: // Radio
                return (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={item.answer_text}
                      onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                      sx={{
                        flexDirection: 'row', // tampil horizontal
                        flexWrap: 'wrap', // bisa pindah baris
                        gap: 1, // beri jarak antar item (opsional)
                      }}
                    >
                      {(item.multiple_option_fields || []).map((opt: any, idx: number) => (
                        <FormControlLabel
                          key={idx}
                          value={typeof opt === 'object' ? opt.value : opt}
                          control={<Radio />}
                          label={typeof opt === 'object' ? opt.name : opt}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                );

              case 6: // Checkbox
                return (
                  <FormGroup>
                    {(item.multiple_option_fields || []).map((opt: any, idx: number) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            checked={item.answer_text?.includes(
                              typeof opt === 'object' ? opt.value : opt,
                            )}
                            onChange={(e) => {
                              const val = typeof opt === 'object' ? opt.value : opt;
                              const newValue = e.target.checked
                                ? [...(item.answer_text || []), val]
                                : (item.answer_text || []).filter((v: string) => v !== val);
                              onChange(index, 'answer_text', newValue);
                            }}
                          />
                        }
                        label={typeof opt === 'object' ? opt.name : opt}
                      />
                    ))}
                  </FormGroup>
                );

              case 8: // TimePicker
                return (
                  <TextField
                    type="time"
                    size="small"
                    value={item.answer_datetime}
                    onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
                    fullWidth
                  />
                );
              case 9:
                return (
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                    <DateTimePicker
                      value={item.answer_datetime ? dayjs(item.answer_datetime) : null}
                      ampm={false}
                      onChange={(newValue) => {
                        if (newValue) {
                          const utc = newValue.utc().format(); // hasil: 2025-08-05T10:00:00Z
                          onChange(index, 'answer_datetime', utc);
                        }
                      }}
                      format="ddd, DD - MMM - YYYY, HH:mm"
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                );

              case 10: // TakePicture (Assuming image capture from device camera)
                return (
                  <Box>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        borderRadius: 2,
                        padding: 4,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                        pointerEvents: 'auto',
                        opacity: 1,
                      }}
                      // onClick={() => !isBatchEdit && fileInputRef.current?.click()}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          p: 2,
                        }}
                        onClick={() => setOpenCamera(true)} // Bisa langsung dibuka saat klik semua bagian
                      >
                        {/* <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} /> */}
                        <PhotoCameraIcon sx={{ fontSize: 48, color: '#42a5f5', mr: 0.5 }} />
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            component="span"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          >
                            Use Camera
                          </Typography>
                        </Box>
                      </Box>
                      <input
                        type="file"
                        accept="*"
                        hidden
                        ref={fileInputRef}
                        onChange={(e) =>
                          handleFileChangeForField(e, (url) => onChange(index, 'answer_file', url))
                        }
                      />
                    </Box>

                    {previewUrl && (
                      <Box
                        mt={2}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <img
                          src={previewUrl}
                          alt="preview"
                          style={{
                            width: 200,
                            height: 200,
                            borderRadius: 12,
                            objectFit: 'cover',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          }}
                        />

                        <MuiButton
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 2, minWidth: 120 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFileForField((url) => onChange(index, 'answer_file', url));
                          }}
                          startIcon={<IconTrash />}
                        >
                          Remove
                        </MuiButton>
                      </Box>
                    )}

                    <Dialog
                      open={openCamera}
                      onClose={() => setOpenCamera(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                          Take Photo From Camera
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: 'environment' }}
                              style={{
                                width: '100%',
                                borderRadius: 8,
                                border: '2px solid #ccc',
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            {screenshot ? (
                              <img
                                src={screenshot}
                                alt="Captured"
                                style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  border: '2px dashed #ccc',
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minHeight: 240,
                                }}
                              >
                                <Typography color="text.secondary">
                                  No Photos Have Been Taken Yet
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ textAlign: 'right' }}>
                          <MuiButton
                            onClick={() =>
                              clearFileForField((url) => onChange(index, 'answer_file', url))
                            }
                            color="warning"
                            sx={{ mr: 2 }}
                          >
                            Clear Foto
                          </MuiButton>
                          <MuiButton
                            variant="contained"
                            onClick={() =>
                              handleCaptureForField((url) => onChange(index, 'answer_file', url))
                            }
                          >
                            Take Foto
                          </MuiButton>
                          <MuiButton onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
                            Submit
                          </MuiButton>
                        </Box>
                      </Box>
                    </Dialog>
                  </Box>
                );

              case 11: // FileUpload
                return (
                  <Box>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        borderRadius: 2,
                        padding: 4,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                        pointerEvents: 'auto',
                        opacity: 1,
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        Upload File
                      </Typography>

                      <Typography variant="caption" color="textSecondary">
                        Supports: PDF, DOCX, JPG, PNG
                      </Typography>

                      <input
                        type="file"
                        accept="*"
                        hidden
                        ref={fileInputRef}
                        onChange={handlePDFUpload}
                      />
                    </Box>
                  </Box>
                );

              case 12:
                return (
                  <Box>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        borderRadius: 2,
                        padding: 4,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                        pointerEvents: 'auto',
                        opacity: 1,
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        Upload File
                      </Typography>

                      <Typography variant="caption" color="textSecondary">
                        Supports: PDF, DOCX, JPG, PNG
                      </Typography>

                      <Typography
                        variant="subtitle1"
                        component="span"
                        color="primary"
                        sx={{ fontWeight: 600, ml: 1, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCamera(true);
                        }}
                      >
                        Use Camera
                      </Typography>

                      <input
                        type="file"
                        accept="*"
                        hidden
                        ref={fileInputRef}
                        onChange={(e) =>
                          handleFileChangeForField(e, (url) => onChange(index, 'answer_file', url))
                        }
                      />
                    </Box>

                    <Dialog
                      open={openCamera}
                      onClose={() => setOpenCamera(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                          Take Photo From Camera
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: 'environment' }}
                              style={{
                                width: '100%',
                                borderRadius: 8,
                                border: '2px solid #ccc',
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            {screenshot ? (
                              <img
                                src={screenshot}
                                alt="Captured"
                                style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  border: '2px dashed #ccc',
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minHeight: 240,
                                }}
                              >
                                <Typography color="text.secondary">
                                  No Photos Have Been Taken Yet
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ textAlign: 'right' }}>
                          <MuiButton
                            onClick={() =>
                              clearFileForField((url) => onChange(index, 'answer_file', url))
                            }
                            color="warning"
                            sx={{ mr: 2 }}
                          >
                            Clear Foto
                          </MuiButton>
                          <MuiButton
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCaptureForField((url) => onChange(index, 'answer_file', url));
                            }}
                          >
                            Take Foto
                          </MuiButton>
                          <MuiButton onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
                            Close
                          </MuiButton>
                        </Box>
                      </Box>
                    </Dialog>
                  </Box>
                );
              default:
                return (
                  <TextField
                    size="small"
                    value={item.long_display_text}
                    onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
                    placeholder="Enter value"
                    fullWidth
                  />
                );
            }
          })()}
        </TableCell>
      </TableRow>
    ));
  };
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const min = 500; // ms biar skeleton minimal kelihatan

    (async () => {
      const t0 = Date.now();
      setVtLoading(true);
      try {
        const [customFieldRes, visitorTypeRes, EmployeeRes, siteSpaceRes, visitorRes] =
          await Promise.all([
            getAllCustomFieldPagination(token, 0, 99, 'id'),
            getAllVisitorType(token), // << daftar VT
            getAllEmployee(token),
            getAllSite(token),
            getAllVisitor(token),
          ]);

        if (cancelled) return;
        setCustomField(customFieldRes?.collection ?? []);
        setVisitorType(visitorTypeRes?.collection ?? []); // << penting
        setEmployee(EmployeeRes?.collection ?? []);
        setSites(siteSpaceRes?.collection ?? []);
        setVisitorDatas(visitorRes?.collection ?? []);
      } finally {
        const elapsed = Date.now() - t0;
        const wait = Math.max(0, min - elapsed);
        setTimeout(() => {
          if (!cancelled) setVtLoading(false);
        }, wait);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // helpers
  const sanitize = (v?: string | null) => (v ?? '').trim().toLowerCase();

  const DEFAULT_VFT = FORM_KEY === 'pra_form' ? 0 : 1;

  const mapFieldOut = (tpl: any, sortIdx: number, src?: any) => ({
    remarks: tpl.remarks ?? '',
    visitor_form_type: tpl.visitor_form_type ?? DEFAULT_VFT,
    field_type: tpl.field_type ?? 0,
    sort: tpl.sort ?? sortIdx,
    short_name: tpl.short_name ?? '',
    long_display_text: tpl.long_display_text ?? '',
    custom_field_id: tpl.custom_field_id ?? null,
    // properti ekstra yang diminta contoh lama:
    form_visitor_type_id: '',

    ...pickAns(src ?? {}),
  });

  const indexBy = (arr: any[]) => {
    const byRemarks = new Map<string, any>();
    const byCF = new Map<string, any>();
    for (const f of arr) {
      const r = sanitize(f?.remarks);
      const cf = f?.custom_field_id;

      if (r) byRemarks.set(r, f);
      if (cf) byCF.set(cf, f);
    }
    return { byRemarks, byCF };
  };

  // kumpulkan semua form (apapun section-nya) dari satu row dataVisitor
  const flattenRowForms = (row: any) =>
    (row?.question_page ?? []).flatMap((p: any) => (Array.isArray(p.form) ? p.form : []));

  // kalau rows kosong, fallback nilai row dari groupedPages.batch_page (satu baris)
  const fakeRowFromBatchPage = (batch_page: Record<string, any>) => ({
    question_page: [
      { form: Object.values(batch_page || {}) }, // cukup biar flattenRowForms dapat sumber nilai
    ],
  });

  // function buildFinalPayload(
  //   rawSections: any[],
  //   groupedPages: {
  //     single_page: any[];
  //     batch_page: Record<string, any>;
  //     batch_rows?: Record<string, any>[];
  //   },
  //   meta: { visitor_type: string; is_group: boolean; type_registered: number },
  // ) {
  //   const sharedPVIdx = indexBy(groupedPages.single_page || []);
  //   const tplBatchArr = Object.values(groupedPages.batch_page || {});
  //   const tplBatchIdx = indexBy(tplBatchArr);

  //   const rows =
  //     groupedPages.batch_rows && groupedPages.batch_rows.length ? groupedPages.batch_rows : [{}]; // minimal satu baris

  //   const outRows = rows.map((rowMap) => {
  //     // bentuk index dari jawaban row ini (berdasarkan remarks/custom_field_id)
  //     const rowVals = Object.values(rowMap || {});
  //     const rowIdx = indexBy(rowVals);

  //     const question_page = rawSections.map((section: any, sIdx: number) => {
  //       const formsTpl = Array.isArray(section?.visit_form) ? section.visit_form : [];
  //       const isPV = isPurposeVisit(section);

  //       const form = formsTpl.map((tpl: any, fIdx: number) => {
  //         const r = sanitize(tpl?.remarks);
  //         const cf = tpl?.custom_field_id;

  //         // PV → ambil dari single_page (shared)
  //         // Non-PV → ambil dari rowIdx dulu, baru fallback ke template batch
  //         const pick = isPV
  //           ? (r && sharedPVIdx.byRemarks.get(r)) || (cf && sharedPVIdx.byCF.get(cf)) || undefined
  //           : (r && rowIdx.byRemarks.get(r)) ||
  //             (cf && rowIdx.byCF.get(cf)) ||
  //             (r && tplBatchIdx.byRemarks.get(r)) ||
  //             (cf && tplBatchIdx.byCF.get(cf)) ||
  //             undefined;

  //         return mapFieldOut(tpl, fIdx, pick);
  //       });

  //       return {
  //         sort: section.sort ?? sIdx,
  //         name: section.name ?? `Page ${sIdx + 1}`,
  //         is_document: !!section.is_document,
  //         can_multiple_used: !!section.can_multiple_used,
  //         self_only: !!section.self_only,
  //         foreign_id: asStr(section.foreign_id),
  //         form,
  //       };
  //     });

  //     return { question_page };
  //   });

  //   return {
  //     visitor_type: meta.visitor_type,
  //     is_group: !!meta.is_group,
  //     type_registered: meta.type_registered ?? 0,
  //     data_visitor: outRows,
  //   };
  // }

  // True
  // function buildFinalPayload(
  //   rawSections: any[],
  //   groupedPages: { single_page: any[]; batch_page: Record<string, any> },
  //   rows: Array<{ question_page: any[] }>, // ← sumber baris sekarang
  //   meta: { visitor_type: string; is_group: boolean; type_registered: number },
  // ) {
  //   const sharedPVIdx = indexBy(groupedPages.single_page || []);
  //   const batchIdx = indexBy(Object.values(groupedPages.batch_page || {}));

  //   // kalau benar-benar kosong, masih boleh fallback satu baris “kosong”
  //   const materialRows = rows?.length ? rows : [fakeRowFromBatchPage(groupedPages.batch_page)];

  //   const outRows = materialRows.map((row) => {
  //     const rowForms = flattenRowForms(row);
  //     const rowIdx = indexBy(rowForms);

  //     const question_page = rawSections.map((section: any, sIdx: number) => {
  //       const formsTpl = Array.isArray(section?.visit_form) ? section.visit_form : [];

  //       const form = formsTpl.map((tpl: any, fIdx: number) => {
  //         const r = sanitize(tpl?.remarks);
  //         const cf = tpl?.custom_field_id;

  //         const pick = isPurposeVisit(section)
  //           ? (r && sharedPVIdx.byRemarks.get(r)) || (cf && sharedPVIdx.byCF.get(cf)) || undefined
  //           : (r && rowIdx.byRemarks.get(r)) ||
  //             (cf && rowIdx.byCF.get(cf)) ||
  //             // fallback: kalau dataVisitor belum isi, pakai template batch_page
  //             (r && batchIdx.byRemarks.get(r)) ||
  //             (cf && batchIdx.byCF.get(cf)) ||
  //             undefined;

  //         return mapFieldOut(tpl, fIdx, pick);
  //       });

  //       return {
  //         sort: section.sort ?? sIdx,
  //         name: section.name ?? `Page ${sIdx + 1}`,
  //         is_document: !!section.is_document,
  //         can_multiple_used: !!section.can_multiple_used,
  //         self_only: !!section.self_only,
  //         foreign_id: asStr(section.foreign_id),
  //         form,
  //       };
  //     });

  //     return { question_page };
  //   });

  //   return {
  //     visitor_type: meta.visitor_type,
  //     is_group: !!meta.is_group,
  //     type_registered: meta.type_registered ?? 0,
  //     data_visitor: outRows,
  //   };
  // }

  function buildFinalPayload(
    rawSections: any[],
    groupedPages: { single_page: any[]; batch_page: Record<string, any> },
    rows: Array<{ question_page: any[] }>,
    meta: { visitor_type: string; is_group: boolean; type_registered: number },
  ) {
    const sharedPVIdx = indexBy(groupedPages.single_page || []);
    const batchIdx = indexBy(Object.values(groupedPages.batch_page || {}));

    const materialRows = rows?.length ? rows : [fakeRowFromBatchPage(groupedPages.batch_page)];

    const outRows = materialRows.map((row) => {
      const rowForms = flattenRowForms(row);
      const rowIdx = indexBy(rowForms);

      const question_page = rawSections.map((section: any, sIdx: number) => {
        const formsTpl = formsOf(section);

        const rowPV = row?.question_page?.[pvIndex];
        const pvSelfOnly = !!rowPV?.self_only;

        // const form = formsTpl.map((tpl: any, fIdx: number) => {
        //   const r = sanitize(tpl?.remarks);
        //   const cf = tpl?.custom_field_id;

        //   let pick: any;
        //   if (sIsPV) {
        //     // PRIORITAS: override baris -> shared
        //     pick =
        //       (rowPvSelfOnly && ((r && rowIdx.byRemarks.get(r)) || (cf && rowIdx.byCF.get(cf)))) ||
        //       (r && sharedPVIdx.byRemarks.get(r)) ||
        //       (cf && sharedPVIdx.byCF.get(cf)) ||
        //       undefined;
        //   } else {
        //     // non-PV: row -> template batch
        //     pick =
        //       (r && rowIdx.byRemarks.get(r)) ||
        //       (cf && rowIdx.byCF.get(cf)) ||
        //       (r && batchIdx.byRemarks.get(r)) ||
        //       (cf && batchIdx.byCF.get(cf)) ||
        //       undefined;
        //   }

        //   return mapFieldOut(tpl, fIdx, pick);
        // });
        const form = formsTpl.map((tpl: any, fIdx: number) => {
          const r = sanitize(tpl?.remarks);
          const cf = tpl?.custom_field_id;

          // ==== KUNCI: kalau section ini PV, ambil dari override baris dulu ====
          let pick: any;
          if (isPurposeVisit(section)) {
            const rowOverride = (rowPV?.form || []).find((f: any) => sameField(f, tpl));
            pick =
              rowOverride ||
              (r && sharedPVIdx.byRemarks.get(r)) ||
              (cf && sharedPVIdx.byCF.get(cf)) ||
              undefined;
          } else {
            pick =
              (r && rowIdx.byRemarks.get(r)) ||
              (cf && rowIdx.byCF.get(cf)) ||
              (r && batchIdx.byRemarks.get(r)) ||
              (cf && batchIdx.byCF.get(cf)) ||
              undefined;
          }

          return mapFieldOut(tpl, fIdx, pick);
        });
        return {
          sort: section.sort ?? sIdx,
          name: section.name ?? `Page ${sIdx + 1}`,
          is_document: !!section.is_document,
          can_multiple_used: !!section.can_multiple_used,
          self_only: isPurposeVisit(section) ? pvSelfOnly : !!section.self_only, // << penting
          foreign_id: asStr(section.foreign_id),
          form,
        };
      });

      return { question_page };
    });

    return {
      visitor_type: meta.visitor_type,
      is_group: !!meta.is_group,
      type_registered: meta.type_registered ?? 0,
      data_visitor: outRows,
    };
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!token) return;

    try {
      let data: CreateVisitorRequest;

      const mapField = (field: FormVisitor, sortIdx: number) => {
        const base: any = {
          sort: field.sort ?? sortIdx,
          short_name: field.short_name ?? '',
          long_display_text: field.long_display_text ?? '',
          field_type: field.field_type ?? 0,
          is_primary: field.is_primary ?? false,
          is_enable: field.is_enable ?? false,
          mandatory: field.mandatory ?? false,
          remarks: field.remarks ?? '',
          custom_field_id: field.custom_field_id ?? '',
          multiple_option_fields: field.multiple_option_fields ?? [],
          visitor_form_type: field.visitor_form_type ?? DEFAULT_VFT,
        };
        if (typeof field.answer_text === 'string' && field.answer_text.trim()) {
          base.answer_text = field.answer_text;
        }
        if (
          [10, 11, 12].includes(base.field_type) &&
          typeof field.answer_file === 'string' &&
          field.answer_file.trim()
        ) {
          base.answer_file = field.answer_file;
        }
        if (
          base.field_type === 9 &&
          typeof field.answer_datetime === 'string' &&
          field.answer_datetime.trim()
        ) {
          base.answer_datetime = field.answer_datetime;
        }
        return base;
      };

      if (isGroup) {
        if (!dataVisitor.length) {
          setErrors({ submit: 'Minimal tambah 1 visitor dulu.' });
          return;
        }

        const data_visitor = buildGroupedDataVisitor(
          dataVisitor, // boleh kosong, builder akan tetap bikin 1 row
          groupedPages, // ← ini kunci: merge nilai dari sini
          sectionsData,
        );

        console.log('data_visitor test:', JSON.stringify(data_visitor, null, 2));
        const data = buildFinalPayload(
          rawSections, // dari API
          groupedPages, // PV shared + template + banyak baris
          dataVisitor,
          {
            visitor_type: formData.visitor_type!,
            is_group: true,
            type_registered: formData.type_registered ?? 0,
          },
        );
        console.log('data:', JSON.stringify(data, null, 2));
        const parsed = CreateVisitorRequestSchema.parse(data);
        await createVisitor(token, parsed);
        onSuccess?.();
        return;
      } else {
        // SINGLE (pakai sectionsData)
        const question_page = sectionsData.map((section, sIdx) => ({
          sort: section.sort ?? sIdx,
          name: section.name,
          status: 0,
          is_document: section.is_document ?? false,
          can_multiple_used: section.can_multiple_used ?? false,
          foreign_id: section.foreign_id ?? '',
          self_only: section.self_only ?? false,
          form: formsOf(section).map((f, fIdx) => mapField(f as FormVisitor, fIdx)),
        }));

        data = {
          visitor_type: formData.visitor_type ?? '',
          type_registered: formData.type_registered ?? 0,
          is_group: false,
          data_visitor: [{ question_page }],
        };
        const parsed = CreateVisitorRequestSchema.parse(data);
        await createVisitor(token, parsed);
        onSuccess?.();
      }

      // Debug kalau mau cek payload
      // console.log('payload:', JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error(err);
      if (err?.errors) {
        setErrors(err.errors);
      } else if (err?.name === 'ZodError') {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((z: any) => (fieldErrors[z.path.join('.')] = z.message));
        setErrors(fieldErrors);
      }
    }
  };

  useEffect(() => {
    setDraggableSteps([...dynamicSteps]);
  }, [dynamicSteps]);

  const handleAddDetails = () => {
    if (!isGroup) {
      // fallback ke add field biasa kalau single
      handleAddDetail(FORM_KEY);
      return;
    }

    setDataVisitor((prev) => {
      if (prev.length === 0) return prev;

      // Clone dari group pertama sebagai template
      const clone = JSON.parse(JSON.stringify(prev[0])) as { question_page: SectionPageVisitor[] };

      // Kosongkan semua jawaban di clone
      clone.question_page.forEach((page) => {
        (page.form ?? []).forEach((f) => {
          f.answer_text = '';
          f.answer_datetime = '';
          f.answer_file = '';
        });
      });

      const next = [...prev, clone];
      setActiveGroupIdx(next.length - 1); // opsional: fokus ke group baru
      return next;
    });
  };

  const [rawSections, setRawSections] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('unsavedVisitorData');
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      const sameType = saved?.visitor_type === formData.visitor_type;
      const sameMode = !!saved?.is_group === !!isGroup;
      if (!sameType || !sameMode) return;

      if (isGroup) {
        setDataVisitor(Array.isArray(saved.rows) ? saved.rows : []);
        if (saved.grouped_pages) setGroupedPages(saved.grouped_pages);
        if (rawSections.length) {
          const groupSections = buildGroupSections(rawSections);
          setSectionsData(groupSections);
          setDraggableSteps(groupSections.map((s) => s.name));
        }
      } else {
        const qp = saved?.data_visitor?.[0]?.question_page ?? [];
        setSectionsData(qp);
        setDraggableSteps(qp.map((s: any) => s.name));
      }
    } catch {}
  }, [formData.visitor_type, isGroup, rawSections]);

  const [groupedPages, setGroupedPages] = useState<GroupedPages>({
    single_page: [],
    batch_page: {},
    // batch_rows: [{}],
  });

  useEffect(() => {
    if (!formData.visitor_type) return;
    const draft = isGroup
      ? {
          visitor_type: formData.visitor_type,
          is_group: true,
          type_registered: 1,
          grouped_pages: groupedPages, // ✅ pola + jawaban shared
          data_visitor: dataVisitor, // ✅ jawaban per-baris
        }
      : {
          visitor_type: formData.visitor_type,
          is_group: false,
          type_registered: 1,
          data_visitor: [{ question_page: sectionsData }], // single tetap sama
        };
    localStorage.setItem('unsavedVisitorData', JSON.stringify(draft));
  }, [formData.visitor_type, isGroup, dataVisitor, sectionsData, groupedPages]);

  const asStr = (v: any) => (v == null ? '' : String(v));
  // Aman untuk forms yang mungkin undefined/null
  const cloneForms = (forms?: any[]) =>
    Array.isArray(forms)
      ? forms.map((f, idx) => ({
          ...f,
          sort: f.sort ?? idx,
          foreign_id: asStr(f.foreign_id),
          answer_text: '',
          answer_datetime: '',
          answer_file: '',
          multiple_option_fields: Array.isArray(f.multiple_option_fields)
            ? f.multiple_option_fields.map((opt: any) =>
                typeof opt === 'object' ? { ...opt } : opt,
              )
            : [],
        }))
      : [];

  const DOC_REMARKS = new Set(['selfie_image', 'identity_image', 'nda']);

  const sanitizeRemarks = (r?: string | null) => {
    const v = (r ?? '').trim().toLowerCase();
    return v === 'indentity_id' ? 'identity_id' : v;
  };

  // clone form + kosongkan jawaban
  const cloneFormWithEmptyAnswers = (f: any, idx: number) => ({
    ...f,
    sort: f.sort ?? idx,
    remarks: sanitizeRemarks(f.remarks),
    foreign_id: asStr(f.foreign_id),
    answer_text: '',
    answer_datetime: '',
    answer_file: '',
    multiple_option_fields: Array.isArray(f.multiple_option_fields)
      ? f.multiple_option_fields.map((opt: any) => (typeof opt === 'object' ? { ...opt } : opt))
      : [],
  });

  const REQUIRED_VI = ['name', 'email', 'organization'] as const;
  const hasVIFields = (s?: any) => {
    const r = new Set(
      formsOf(s)
        .map((f: any) => sanitizeRemarks(f?.remarks))
        .filter(Boolean),
    );
    return REQUIRED_VI.every((x) => r.has(x));
  };

  const getBatchKey = (sectionId?: string, formId?: string) =>
    `${sectionId ?? 'section'}-${formId ?? 'field'}`;

  const isPurposeVisit = (section: any) => {
    if (section?.is_document) return false;
    const forms = formsOf(section);
    const PV = new Set([
      'host',
      'agenda',
      'site_place',
      'visitor_period_start',
      'visitor_period_end',
    ]);
    return forms.some((f: any) => PV.has((f?.remarks ?? '').trim().toLowerCase()));
  };

  // index section Purpose Visit
  // const pvIndex = sectionsData.findIndex((s) => isPurposeVisit(s));
  const pvIndex = React.useMemo(() => sectionsData.findIndex(isPurposeVisit), [sectionsData]);
  const hasAns = (f: any) => !!(f?.answer_text || f?.answer_datetime || f?.answer_file);
  // ada override PV di baris?
  const hasRowPv = (rowIdx: number) => !!dataVisitor[rowIdx]?.question_page?.[pvIndex]?.self_only;

  // buka dialog PV utk row tertentu
  const openPvDialog = (rowIdx: number) => {
    if (pvIndex < 0) return;

    const tpl = sectionsData[pvIndex];
    const base = formsOf(tpl).map((f: any, i: number) => ({
      ...f,
      sort: f.sort ?? i,
    }));

    // prefill dari shared
    const prefilled = base.map((f: any) => {
      const shared = (groupedPages.single_page || []).find((sf: any) => sameField(sf, f));
      return { ...f, ...pickAns(shared || {}) };
    });

    // 1) tandai self_only + seed page PV di baris itu SEKARANG,
    //    supaya switch langsung On dan payload punya self_only: true
    setDataVisitor((prev) => {
      const next = [...prev];
      const row = next[rowIdx];
      const existing = row?.question_page?.[pvIndex];

      row.question_page[pvIndex] = {
        sort: tpl?.sort ?? pvIndex,
        name: tpl?.name ?? 'Purpose Visit',
        is_document: !!tpl?.is_document,
        can_multiple_used: !!tpl?.can_multiple_used,
        self_only: true,
        foreign_id: tpl?.foreign_id ?? '',
        form: existing?.form?.length ? existing.form : prefilled,
      };
      return next;
    });

    // 2) buka dialog untuk edit PV per-baris
    setPvDlg({ open: true, rowIdx, forms: prefilled });
  };

  // simpan override PV ke baris

  const savePvDialog = () => {
    if (pvDlg.rowIdx == null || pvIndex < 0) return;
    setDataVisitor((prev) => {
      const next = [...prev];
      const row = next[pvDlg.rowIdx ?? 0];
      const pg = row.question_page[pvIndex] ?? {};
      row.question_page[pvIndex] = {
        ...pg,
        self_only: true, // pastikan true
        form: pvDlg.forms.slice(), // simpan jawaban PV baris
      };
      return next;
    });
    setPvDlg({ open: false, rowIdx: null, forms: [] });
  };

  // matikan override PV di baris (optional: hapus file CDN)
  const clearRowPv = async (rowIdx: number) => {
    if (pvIndex < 0) return;
    const pvForms = dataVisitor[rowIdx]?.question_page?.[pvIndex]?.form || [];

    // kalau mau hapus file CDN yang terlanjur di-upload pada override:
    await Promise.all(
      pvForms
        .map((f: any) => f?.answer_file)
        .filter((u: any) => typeof u === 'string' && u)
        .map((u) =>
          axiosInstance2.delete(`/cdn${u}`).catch(() => {
            /* swallow */
          }),
        ),
    );

    setDataVisitor((prev) => {
      const next = [...prev];
      const row = next[rowIdx];
      if (!row) return prev;

      // kosongkan jawaban PV & self_only=false (tetap simpan page agar index stabil)
      const sec = sectionsData[pvIndex];
      row.question_page[pvIndex] = {
        ...(row.question_page[pvIndex] || {
          sort: sec.sort ?? pvIndex,
          name: sec.name,
          status: 0,
          is_document: !!sec.is_document,
          can_multiple_used: !!sec.can_multiple_used,
          foreign_id: sec.foreign_id ?? '',
        }),
        self_only: false,
        form: cloneForms(formsOf(sec) || []), // kosong
      };
      return next;
    });
  };

  const buildGroupedPages = (sections: any[] = []): GroupedPages => {
    const single_page: any[] = [];
    const batch_page: Record<string, any> = {};

    sections.forEach((section) => {
      const forms = formsOf(section);

      // Purpose Visit → single_page
      if (isPurposeVisit(section)) {
        forms.forEach((f: any, idx: number) => {
          single_page.push(cloneFormWithEmptyAnswers(f, idx));
        });
        return;
      }

      // Non-document → batch_page (template kolom)
      if (!section?.is_document) {
        forms.forEach((f: any, idx: number) => {
          const secId = (section as any)?.id ?? (section as any)?.Id ?? null;
          const formId = (f as any)?.id ?? (f as any)?.Id ?? idx;
          const secForeign = (section as any)?.foreign_id ?? (section as any)?.foreignId ?? null;
          const formForeign = (f as any)?.foreign_id ?? (f as any)?.foreignId ?? null;
          const formCustom = (f as any)?.custom_field_id ?? (f as any)?.customFieldId ?? null;

          const resolvedForeign = formForeign ?? secForeign ?? formCustom ?? formId ?? null;
          const key = getBatchKey(secId, formId);

          batch_page[idx] = {
            ...cloneFormWithEmptyAnswers(f, idx),
            foreign_id: asStr(resolvedForeign),
          };
        });
      }
    });

    return {
      single_page,
      batch_page,
      // batch_rows: [{}], // ← siapkan 1 baris default
    };
  };
  const pickVisitorInfoSingle = (sections: any[] = []) =>
    sections.find((s) => !s?.is_document && !s?.can_multiple_used && hasVIFields(s));

  const pickPurposeVisit = (sections: any[] = []) =>
    sections.find(
      (s) =>
        !s?.is_document &&
        formsOf(s).some((f: any) =>
          ['host', 'agenda', 'site_place', 'visitor_period_start', 'visitor_period_end'].includes(
            sanitizeRemarks(f?.remarks),
          ),
        ),
    );

  // Ambil form dokumen dari sections mentah
  const collectDocForms = (sections: any[]) => {
    const docs = sections.filter((s) => s?.is_document && formsOf(s).length);
    const all = docs.flatMap((s) => formsOf(s) || []);
    // ambil hanya selfie/identity/nda
    return all
      .map((f, i) => ({ ...f, remarks: sanitizeRemarks(f.remarks), sort: f.sort ?? i }))
      .filter((f) => DOC_REMARKS.has(f.remarks));
  };

  // >>> GANTI fungsi buildGroupSections kamu dengan ini
  const buildGroupSections = (sections?: any[]) => {
    const list = Array.isArray(sections) ? sections : [];

    // sumber Visitor Info (single) untuk dijadikan Group
    const viSrc = pickVisitorInfoSingle(list);
    const pvSrc = pickPurposeVisit(list);

    // Kumpulkan form dokumen dan clone
    const docForms = cloneForms(collectDocForms(list));
    const otherSingles = list
      .filter(
        (s) =>
          !s?.is_document &&
          !s?.can_multiple_used &&
          s !== viSrc &&
          s !== pvSrc &&
          formsOf(s).length > 0,
      )
      .flatMap((s) => formsOf(s));

    // Siapkan Visitor Information (Group)
    const vi = viSrc
      ? {
          ...viSrc,
          name: 'Visitor Information (Group)',
          can_multiple_used: true,
          is_document: false,
          // gabung form VI + dokumen, pastikan sort berlanjut
          [FORM_KEY]: (() => {
            const base = cloneForms(formsOf(viSrc));
            const extra = cloneForms(otherSingles);
            const startExtra = base.length;
            const extraWithSort = extra.map((f, i) => ({ ...f, sort: f.sort ?? startExtra + i }));

            const startDocs = startExtra + extraWithSort.length;
            const docsWithSort = docForms.map((f, i) => ({ ...f, sort: f.sort ?? startDocs + i }));

            return [...base, ...extraWithSort, ...docsWithSort];
          })(),
        }
      : {
          // fallback kalau tidak ada VI di visitor_type
          Id: 'visitor_info_group',
          sort: 0,
          name: 'Visitor Information (Group)',
          is_document: false,
          can_multiple_used: true,
          [FORM_KEY]: cloneForms([
            {
              short_name: 'Full Name',
              long_display_text: 'Full Name',
              field_type: 0,
              remarks: 'name',
            },
            { short_name: 'Email', long_display_text: 'Email', field_type: 2, remarks: 'email' },
            {
              short_name: 'Organization',
              long_display_text: 'Organization',
              field_type: 0,
              remarks: 'organization',
            },
            // minimal kolom dokumen
            {
              short_name: 'Selfie Image',
              long_display_text: 'Selfie Image',
              field_type: 10,
              remarks: 'selfie_image',
            },
            {
              short_name: 'Upload Identity',
              long_display_text: 'Upload Identity',
              field_type: 12,
              remarks: 'identity_image',
            },
            {
              short_name: 'Sign NDA',
              long_display_text: 'Sign NDA',
              field_type: 11,
              remarks: 'nda',
            },
          ]),
        };

    // Purpose Visit tetap section tersendiri (umumnya can_multiple_used true)
    const pv = pvSrc
      ? {
          ...pvSrc,
          name: 'Purpose Visit',
          can_multiple_used: true,
          is_document: false,
          [FORM_KEY]: cloneForms(formsOf(pvSrc)),
        }
      : {
          Id: 'purpose_visit',
          sort: 1,
          name: 'Purpose Visit',
          is_document: false,
          can_multiple_used: true,
          [FORM_KEY]: cloneForms([
            {
              short_name: 'Host PIC Visit',
              long_display_text: 'Host PIC Visit',
              field_type: 3,
              remarks: 'host',
            },
            {
              short_name: 'Visit Start',
              long_display_text: 'Visit Start',
              field_type: 9,
              remarks: 'visitor_period_start',
            },
            {
              short_name: 'Visit End',
              long_display_text: 'Visit End',
              field_type: 9,
              remarks: 'visitor_period_end',
            },
          ]),
        };

    // Penting: JANGAN ikutkan lagi section dokumen terpisah agar tidak dobel
    // Kalau kamu masih butuh halaman dokumen terpisah, hapus blok ini dan return [vi, pv, ...docs]
    return [vi, pv];
  };

  const seedDataVisitorFromSections = (sections: any[]) => {
    const result = [
      {
        question_page: sections.map((s: any, i: number) => ({
          sort: i,
          name: s.name,
          status: 0,
          is_document: !!s.is_document,
          can_multiple_used: !!s.can_multiple_used,
          foreign_id: s.foreign_id ?? '',
          self_only: !!s.self_only,
          form: formsOf(s).map((f: any, idx: number) => ({
            ...f,
            sort: f.sort ?? idx,
            answer_text: '',
            answer_datetime: '',
            answer_file: '',
          })),
        })),
      },
    ];
    setDataVisitor((prev) => (prev?.length ? prev : result));
    return result;
  };

  useEffect(() => {
    const fetchVisitorTypeDetails = async () => {
      if (!formData.visitor_type || !token) return;
      setVtLoading(true);
      try {
        const res = await getVisitorTypeById(token, formData.visitor_type);
        const sections = res?.collection?.section_page_visitor_types ?? [];
        console.log('Sections:', sections);
        setRawSections(sections);

        if (isGroup) {
          const groupSections = buildGroupSections(sections);
          console.log('Group Sections:', groupSections);
          setSectionsData(groupSections);
          setDraggableSteps(groupSections.map((s) => s.name));
          seedDataVisitorFromSections(groupSections);

          const grouped = buildGroupedPages(groupSections);
          // ⬇️ build pola single_page/batch_page dari sections group
          setGroupedPages((prev) => ({
            ...grouped,
            // batch_rows: prev.batch_rows?.length ? prev.batch_rows : grouped.batch_rows,
          }));
        } else {
          setSectionsData(sections);
          setDraggableSteps(sections.map((s: any) => s.name));
          setDataVisitor([]);

          // ⬇️ build pola single_page/batch_page dari sections single
          // const grouped = buildGroupedPages(sections);
          // setGroupedPages(grouped);
        }
      } catch (e) {
        setSectionsData([]);
        setDraggableSteps([]);
        setRawSections([]);
        console.error(e);
      } finally {
        setVtLoading(false);
      }
    };
    fetchVisitorTypeDetails();
  }, [formData.visitor_type, token, isGroup]);

  useEffect(() => {
    if (!formData.visitor_type) return;
    if (isGroup) {
      const groupSections = buildGroupSections(rawSections);
      setSectionsData(groupSections);
      setDraggableSteps(groupSections.map((s) => s.name));
      seedDataVisitorFromSections(groupSections);
      const grouped = buildGroupedPages(groupSections);
      setGroupedPages((prev) => ({
        ...grouped,
        // batch_rows: prev.batch_rows?.length ? prev.batch_rows : grouped.batch_rows,
      }));
    } else {
      setSectionsData(rawSections);
      setDraggableSteps(rawSections.map((s: any) => s.name));
      setDataVisitor([]);

      // setGroupedPages(buildGroupedPages(rawSections));
    }
    setActiveStep(0);
  }, [isGroup]); // eslint-disable-line

  const sameField = (a: any, b: any) =>
    (a?.custom_field_id && b?.custom_field_id && a.custom_field_id === b.custom_field_id) ||
    (a?.remarks &&
      b?.remarks &&
      String(a.remarks).toLowerCase() === String(b.remarks).toLowerCase());

  const pickAns = (f: any) => {
    const o: any = {};
    if (f?.answer_text) o.answer_text = f.answer_text;
    if (f?.answer_datetime) o.answer_datetime = f.answer_datetime;
    if (f?.answer_file) o.answer_file = f.answer_file;
    return o;
  };

  const buildGroupedDataVisitor = (rows?: any, grouped?: any, sections?: any) =>
    (rows?.length ? rows : [{ question_page: [] }]).map(() => ({
      question_page: sections.map((section: any, sIdx: number) => {
        const base = {
          sort: section.sort ?? sIdx,
          name: section.name,
          is_document: !!section.is_document,
          can_multiple_used: !!section.can_multiple_used,
          self_only: !!section.self_only,
          foreign_id: asStr(section.foreign_id), // jangan null
        };

        const isPV = isPurposeVisit(section);
        const formSource = formsOf(section) ?? section.form ?? [];

        const form = formSource.map((f: any, i: number) => {
          // pilih overlay: single_page utk Purpose, batch_page utk VI/Vehicle & dokumen
          const overlay = isPV
            ? (grouped.single_page ?? []).find((sf: any) => sameField(sf, f))
            : Object.values(grouped.batch_page ?? {}).find((bf: any) => sameField(bf, f));

          // merge jawaban sebelum disusun
          const merged = overlay ? { ...f, ...pickAns(overlay) } : f;

          return {
            sort: merged.sort ?? i,
            short_name: merged.short_name ?? '',
            long_display_text: merged.long_display_text ?? '',
            field_type: merged.field_type ?? 0,
            is_primary: !!merged.is_primary,
            is_enable: !!merged.is_enable,
            mandatory: !!merged.mandatory,
            remarks: merged.remarks ?? '',
            custom_field_id: merged.custom_field_id ?? '',
            visitor_form_type: merged.visitor_form_type ?? DEFAULT_VFT,
            ...pickAns(merged), // answer_text / answer_datetime / answer_file
          };
        });

        return { ...base, form };
      }),
    }));
  return (
    <PageContainer>
      <form onSubmit={handleOnSubmit}>
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
                    padding: '0 0',
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
                      key="User Type"
                      completed={false}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        // mx: 1,
                        cursor: 'pointer',
                        marginLeft: 1,
                      }}
                    >
                      <StepLabel
                        onClick={() => setActiveStep(0)}
                        sx={{
                          fontWeight: activeStep === 0 ? 'bold' : 'normal',
                          color: activeStep === 0 ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        User Type
                      </StepLabel>
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
                            // key={section.id ?? index}
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

          <Box mt={3}>{handleSteps(activeStep)}</Box>

          <Box
            mt={3}
            display="flex"
            justifyContent="space-between"
            sx={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white', // kasih background supaya gak tembus konten
              padding: 2,
              zIndex: 10,
              // borderTop: '1px solid #ddd',
            }}
          >
            {/* Tombol Back */}
            <MuiButton
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              Back
            </MuiButton>

            {/* Tombol Next / Submit */}
            {isLastStep ? (
              <Button
                color="success"
                type="submit"
                variant="contained"
                // onClick={handleOnSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveStep((prev) => prev + 1);
                }}
                type="button"
              >
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
            bgcolor: '#fffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </PageContainer>
  );
};

export default FormWizardAddVisitor;

// const BASE_URL = 'http://192.168.1.116:8000';

const CameraUpload: React.FC<{
  value?: string; // full file URL dari CDN (contoh: http://host/pathcdn/visitor/xxx.png)
  onChange: (url: string) => void; // dipanggil '' saat sudah dihapus
}> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value || null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const clearLocal = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    onChange('');
  };

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();
    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');
    try {
      const { data } = await axios.post('http://192.168.1.116:8000/cdn/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = data?.collection?.file_url;
      console.log('CDN Response File URL:', fileUrl);
      return fileUrl ? (fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl) : null;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const blob = await fetch(imageSrc).then((r) => r.blob());
    const cdnUrl = await uploadFileToCDN(blob);
    if (!cdnUrl) return;
    setScreenshot(imageSrc);
    setPreviewUrl(imageSrc);
    onChange(cdnUrl);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const cdnUrl = await uploadFileToCDN(file);

    if (!cdnUrl) return;
    setPreviewUrl(URL.createObjectURL(file));
    onChange(cdnUrl);
  };

  // ⛔ Hapus file di CDN: DELETE ke URL file (http://host/pathcdn/visitor/xxx.png)
  const handleRemove = async () => {
    if (!value) {
      // cuma bersihkan local state kalau belum ada URL CDN
      clearLocal();
      return;
    }
    try {
      setRemoving(true);
      // await axios.delete(value); // <--- sesuai API kamu
      await axiosInstance2.delete(`/cdn${value}`);
      console.log('✅ Berhasil hapus file CDN:', value);
      clearLocal();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <MuiButton size="small" onClick={() => setOpen(true)} startIcon={<PhotoCameraIcon />}>
          Camera
        </MuiButton>
        {previewUrl && ( // <-- tombol Remove hanya muncul jika ada foto
          <MuiButton
            size="small"
            color="error"
            variant="outlined"
            onClick={handleRemove}
            startIcon={<IconTrash />}
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </MuiButton>
        )}
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFile} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Take Photo From Camera
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {screenshot ? (
                <img
                  src={screenshot}
                  alt="Captured"
                  style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '2px dashed #ccc',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 240,
                  }}
                >
                  <Typography color="text.secondary">No Photos Have Been Taken Yet</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box textAlign="right">
            <MuiButton color="warning" sx={{ mr: 1 }} onClick={clearLocal}>
              Clear
            </MuiButton>
            <MuiButton variant="contained" onClick={handleCapture}>
              Take Photo
            </MuiButton>
            <MuiButton sx={{ ml: 1 }} onClick={() => setOpen(false)}>
              Submit
            </MuiButton>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};
