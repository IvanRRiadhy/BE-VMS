import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { AlertColor } from '@mui/material/Alert';
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
  DialogTitle,
  DialogContent,
  Stack,
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
  Backdrop,
  InputAdornment,
  Snackbar,
  Alert,
  Chip,
  Portal,
  useTheme,
  useMediaQuery,
  MobileStepper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import 'select2'; // Select2 secara otomatis akan attach ke jQuery global
import 'select2/dist/css/select2.min.css';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import Webcam from 'react-webcam';
import 'react-image-crop/dist/ReactCrop.css';
import { useSession } from 'src/customs/contexts/SessionContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconSearch } from '@tabler/icons-react';
import {
  CreateGroupVisitorRequest,
  CreateGroupVisitorRequestSchema,
  CreateVisitorRequest,
  CreateVisitorRequestSchema,
  DataVisitor,
  Item,
  SectionPageVisitor,
} from 'src/customs/api/models/Admin/Visitor';

import {
  createCheckGiveAccess,
  createPraRegister,
  createPraRegisterGroup,
  createVisitor,
  createVisitors,
  getAllCustomField,
  getAllCustomFieldPagination,
  getAllEmployee,
  getAllSite,
  getAllVisitor,
  getAllVisitorCard,
  getAllVisitorType,
  getAvailableCard,
  getFormEmployee,
  getGrantAccess,
  getVisitorEmployee,
  getVisitorTypeById,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { SectionPageVisitorType } from 'src/customs/api/models/Admin/VisitorType';
import { FormVisitor } from 'src/customs/api/models/Admin/Visitor';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisitorSelect from 'src/customs/components/select2/VisitorSelect';
import moment from 'moment-timezone';
import dayjs, { Dayjs, tz } from 'dayjs';
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
import { IconArrowRight } from '@tabler/icons-react';
// import CameraUpload from 'src/customs/components/camera/CameraUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import RenderFieldGroup from '../../Operator/Components/RenderFieldGroup';
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';
import VisitorSelectDialog from '../../Operator/Components/VisitorSelectDialog';
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
// dayjs.locale('id');

type GroupedPages = {
  single_page: any[];
  batch_page: Record<string, any>;
};

interface GroupVisitor {
  id?: string;
  visitor_type?: string;
  group_name: string;
  group_code: string;
  is_group?: boolean;
  tz?: string;
  registered_site?: string;
  data_visitor: any[];
}

const FormAddInvitation: React.FC<FormVisitorTypeProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  formKey = 'visit_form',
}) => {
  const THEME = useTheme();
  const isMobile = useMediaQuery(THEME.breakpoints.down('sm'));
  const FORM_KEY: 'visit_form' | 'pra_form' = formKey;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [customField, setCustomField] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const { token } = useSession();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const [tableKey, setTableKey] = useState(0);
  const [vtLoading, setVtLoading] = useState(true);
  // const [visitorType, setVisitorType] = useState<any[]>([]);
  const [selfOnlyOverrides, setSelfOnlyOverrides] = useState<Record<string, any[]>>({});
  // const visitor type by id
  const [submitted, setSubmitted] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
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
  const [nextDialogOpen, setNextDialogOpen] = useState(false);
  const BASE_URL = axiosInstance2.defaults.baseURL;
  const [rawSections, setRawSections] = useState<any[]>([]);
  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);
  const formsOf = (section: any) => (Array.isArray(section?.[FORM_KEY]) ? section[FORM_KEY] : []);
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [isEmployeeMode, setIsEmployeeMode] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor; // 'success' | 'info' | 'warning' | 'error'
  }>({ open: false, message: '', severity: 'info' });

  // 3) helper supaya snackbar pasti muncul walau pesannya sama
  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const [groupedPages, setGroupedPages] = useState<GroupedPages>({
    single_page: [],
    batch_page: {},
  });
  const TYPE_REGISTERED: 0 | 1 = FORM_KEY === 'pra_form' ? 0 : 1;

  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  const updateSectionForm = (sec: any, updater: (arr: any[]) => any[]) => ({
    ...sec,
    [FORM_KEY]: updater(formsOf(sec)),
  });

  const [pvDlg, setPvDlg] = useState<{ open: boolean; rowIdx: number | null; forms: any[] }>({
    open: false,
    rowIdx: null,
    forms: [],
  });

  const [accessData, setAccessData] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [availableCards, setAvailableCards] = useState<any[]>([]);

  const handleToggle = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const dummyData = [
    { id: 1, visitor: 'Budi', card: null },
    { id: 2, visitor: 'Siti', card: null },
    { id: 3, visitor: 'Andi', card: null },
  ];

  const [groupVisitors, setGroupVisitors] = useState<GroupVisitor[]>([]);

  const handleAddGroup = () => {
    const randomCode = Array.from({ length: 6 }, () =>
      Math.random().toString(36).charAt(2).toUpperCase(),
    ).join('');

    const detectedTz =
      moment.tz?.guess?.() || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

    const newGroup: GroupVisitor = {
      id: crypto.randomUUID(),
      group_name: '',
      group_code: randomCode,
      is_group: formData.is_group || false,
      visitor_type: formData.visitor_type || '',
      tz: detectedTz,
      registered_site: formData.registered_site || '',
      data_visitor: [],
    };

    setGroupVisitors((prev) => [...prev, newGroup]);
  };

  const handleDeleteGroup = (id: string) => {
    setGroupVisitors((prev) => prev.filter((g) => g.id !== id));
  };

  const [grantAccessMap, setGrantAccessMap] = useState<Record<string, any[]>>({});

  const allSite = dataVisitor
    .map(
      (v) =>
        v.question_page
          ?.flatMap((p: any) => p.form ?? [])
          ?.find((f: any) => f.remarks === 'site_place')?.answer_text,
    )
    .filter(Boolean);

  const [groupAccessData, setGroupAccessData] = useState<any[]>([]);

  const selfOnlyVisitors = useMemo(() => {
    return (dataVisitor || [])
      .map((dv, idx) => {
        const hasSelf = dv?.question_page?.some((p: any) => p?.self_only === true);
        if (!hasSelf) return null;

        // ambil field name
        const nameField = dv?.question_page
          ?.flatMap((p: any) => p.form || [])
          ?.find((f: any) => f.remarks === 'name');

        const siteField = dv?.question_page
          ?.flatMap((p: any) => p.form || [])
          ?.find((f: any) => f.remarks === 'site_place');

        return {
          key: `row${idx + 1}`,
          idx,
          dv,
          name: nameField?.answer_text || `Visitor ${idx + 1}`,
          sitePlace: siteField?.answer_text || null,
        };
      })
      .filter(Boolean);
  }, [dataVisitor]);

  function getSitePlaceFromOverrides(overrides: any, idx: number) {
    if (!overrides) return null;

    const forms = overrides[`row${idx + 1}`];
    if (!Array.isArray(forms)) return null;

    const siteField = forms.find((f: any) => f.remarks === 'site_place');
    return siteField?.answer_text || null;
  }

  useEffect(() => {
    const fetchGrantAccess = async () => {
      if (!dataVisitor?.length) return;

      try {
        // 1️⃣ Group access
        const siteAnswer = getSiteFromForm(isGroup, sectionsData, dataVisitor);
        console.log('🔎 siteAnswer dari getSiteFromForm:', siteAnswer);

        if (siteAnswer) {
          const res = await getGrantAccess(token as string, siteAnswer);
          console.log('✅ Response getGrantAccess (group):', res);

          setAccessData(res.collection ?? []);
          setGroupAccessData(res.collection ?? []);
        }

        // 2️⃣ Self only access dari localStorage.selfOnlyOverrides
        const overrides = JSON.parse(localStorage.getItem('selfOnlyOverrides') || '{}');
        const map: Record<string, any[]> = {};

        for (const v of selfOnlyVisitors) {
          const sitePlaceId = getSitePlaceFromOverrides(overrides, v?.idx || 0);
          if (sitePlaceId) {
            const resSelf = await getGrantAccess(token as string, sitePlaceId);
            console.log(`✅ Response getGrantAccess (self only ${v?.name}):`, resSelf);
            if (v?.key !== undefined) {
              map[v.key] = resSelf.collection ?? [];
            }
          } else {
            if (v?.key !== undefined) {
              map[v.key] = [];
            }
          }
        }

        setGrantAccessMap(map);
      } catch (err) {
        console.error('❌ Failed to fetch grant access:', err);
      }
    };

    if (token && submitted) fetchGrantAccess();
  }, [token, submitted, isGroup, dataVisitor, sectionsData, selfOnlyVisitors]);

  function getSiteFromForm(
    isGroup: boolean,
    sectionsData: any[],
    dataVisitor: any[],
  ): string | null {
    if (isGroup) {
      // ✅ Group → ambil dari dataVisitor
      for (const visitor of dataVisitor) {
        for (const page of visitor.question_page ?? []) {
          const found = page.form?.find((f: any) => f.remarks === 'site_place');
          if (found?.answer_text) {
            return found.answer_text;
          }
        }
      }
      return null;
    } else {
      const purposeVisitPage = sectionsData.find((p: any) => p.name === 'Purpose Visit');
      const siteFieldUI =
        purposeVisitPage?.visit_form?.find((f: any) => f.remarks === 'site_place') ??
        purposeVisitPage?.form?.find((f: any) => f.remarks === 'site_place');

      if (siteFieldUI?.answer_text) {
        return siteFieldUI.answer_text;
      }

      // ✅ Kalau tidak ada di sectionsData, fallback ke dataVisitor
      for (const page of dataVisitor[0]?.question_page ?? []) {
        const found = page.form?.find((f: any) => f.remarks === 'site_place');
        if (found?.answer_text) {
          return found.answer_text;
        }
      }
      return null;
    }
  }

  const filteredCards = availableCards.filter((card) =>
    [card.remarks, card.card_number, card.card_mac]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // utils
  const flatDeep = (x: any): any[] => (Array.isArray(x) ? x.flat(Infinity) : [x]);

  const normalizeIdsDeep = (payload: any): number[] => {
    const flat = flatDeep(payload);
    const ids = flat
      .map((v) => (typeof v === 'object' && v !== null ? Number(v.id) : Number(v)))
      .filter((n) => Number.isFinite(n) && n > 0);
    return Array.from(new Set(ids));
  };

  const handleSelectInvitation = (payload: Row[]) => {
    console.group('onCheckedChange');
    console.log('raw payload (rows):', payload);
    console.groupEnd();

    setSelectedInvitations(payload);
  };

  // kalau klik choose card (dari DynamicTable)
  const handleOpenChooseCard = () => {
    if (!selectedInvitations?.length) {
      toast('Please select at least one invitation first.');
      return;
    }
    setSelectedCards([]);
    setOpenChooseCardDialog(true);
  };

  const handleCloseGrantDialog = () => {
    setNextDialogOpen(false);
    setSelectedInvitations([]);
    setSelectedCards([]);
  };

  useEffect(() => {
    if (!nextDialogOpen) {
      setSelectedInvitations([]);
      setSelectedCards([]);
    }
  }, [nextDialogOpen]);

  function buildDataAccess(rows: Row[], selectedInvitations: Row[], checkedItems: string[]) {
    const data_access: any[] = [];

    for (const visitorRow of selectedInvitations) {
      const trxVisitorId = visitorRow.trx_visitor_id;
      const cardNumber = visitorRow.card;

      if (!trxVisitorId || !cardNumber) continue;

      for (const accessControlId of checkedItems) {
        data_access.push({
          access_control_id: accessControlId,
          action: 1, // 1 = Grant
          card_number: cardNumber,
          trx_visitor_id: trxVisitorId,
        });
      }
    }

    return { data_access };
  }

  const handleAccessSubmit = async () => {
    if (!selectedInvitations?.length) {
      console.warn('No visitor selected');
      return;
    }

    // payload akhir
    const data_access: any[] = [];

    // 1️⃣ Group Access → apply ke semua selected visitors
    for (const visitorRow of selectedInvitations) {
      const trxVisitorId = visitorRow.trx_visitor_id;
      const cardNumber = visitorRow.assigned_card_number;
      if (!trxVisitorId || !cardNumber) continue;

      for (const acId of checkedGroupItems) {
        data_access.push({
          access_control_id: acId,
          action: 1,
          card_number: cardNumber,
          trx_visitor_id: trxVisitorId,
        });
      }
    }

    for (const visitorRow of selectedInvitations) {
      if (!hasSelfOnly([visitorRow])) continue;

      const trxVisitorId = visitorRow.trx_visitor_id;
      const cardNumber = visitorRow.assigned_card_number;
      if (!trxVisitorId || !cardNumber) continue;

      for (const fullId of checkedSelfItems) {
        // ✅ parse "visitorKey:acId" → ambil hanya acId
        const parts = fullId.split(':');
        const acId = parts.length > 1 ? parts[1] : parts[0];

        data_access.push({
          access_control_id: acId,
          action: 1,
          card_number: cardNumber,
          trx_visitor_id: trxVisitorId,
        });
      }
    }

    const payload = { data_access };
    console.log('📤 Payload yang dikirim ke APIs:', JSON.stringify(payload, null, 2));

    try {
      const res = await createCheckGiveAccess(token as string, payload);
      console.log('📤 Response dari API:', JSON.stringify(res, null, 2));
      toast('Grant access successful', 'success');
      console.log('✅ Grant access success:', res);
    } catch (err) {
      console.error('❌ Failed grant access:', err);
    } finally {
      // reset
      setSelectedInvitations([]);
      setSelectedCards([]);
      setCheckedGroupItems([]);
      setCheckedSelfItems([]);
      // setNextDialogOpen(false);
      // setAccessDialogOpen(false);
      // setTimeout(() => {
      //   onSuccess && onSuccess();
      // }, 500);
    }
  };

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
        sort: index,
      };
    });

    setSectionsData(reorderedSections);
  };

  const handleSaveGroupVisitor = () => {
    if (activeGroupIdx === null) return;
    console.log('💾 Saving existing group:', activeGroupIdx);

    const deepClone = (obj: any) => {
      try {
        return structuredClone(obj);
      } catch {
        return JSON.parse(JSON.stringify(obj));
      }
    };

    setGroupVisitors((prev) => {
      const next = [...prev];
      if (!next[activeGroupIdx]) {
        console.warn('⚠️ activeGroupIdx invalid, skip save');
        return prev;
      }

      const cleanDataVisitor = deepClone(dataVisitor).map((dv: any) => ({
        ...dv,
        question_page: (dv.question_page || []).map((qp: any) => ({
          id: qp.id || crypto.randomUUID(),
          sort: qp.sort ?? 0,
          name: qp.name ?? '',
          is_document: qp.is_document ?? false,
          can_multiple_used: qp.can_multiple_used ?? false,
          foreign_id: qp.foreign_id ?? '',
          self_only: qp.self_only ?? false,
          form: (qp.form || []).map(({ id, Id, ...rest }: any) => deepClone(rest)),
        })),
      }));

      next[activeGroupIdx] = {
        ...next[activeGroupIdx],
        data_visitor: cleanDataVisitor,
      };

      return next;
    });
  };

  const getSectionType = (section: any) => {
    const f = formsOf(section);
    if (
      f.some((x: any) => x.remarks === 'vehicle_plate') &&
      !section.is_document &&
      !section.can_multiple_used
    )
      return 'parking';
    if (
      f.some((x: any) => x.remarks === 'host' || x.remarks === 'agenda') &&
      !section.is_document &&
      section.can_multiple_used
    )
      return 'purpose_visit';
    if (
      f.some((x: any) => x.remarks === 'host' || x.remarks === 'agenda') &&
      !section.is_document &&
      !section.can_multiple_used
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

  const isEmployeeSelected = (forms: any[]) => {
    const f = forms.find((x) => x.remarks === 'is_employee');
    return f?.answer_text === 'true';
  };

  const handleSteps = (step: number) => {
    const hasVisitorTypes = (visitorType?.length ?? 0) > 0;
    const showVTListSkeleton = vtLoading || !hasVisitorTypes;
    if (step == 0) {
      return (
        <Box>
          <Grid container spacing={2}>
            <Grid sx={{ mt: 0 }} size={{ xs: 12, sm: 12 }}>
              <Divider />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel
                htmlFor="visitor-type"
                sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}
              >
                Visitor Type
              </CustomFormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={formData.visitor_type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData((prev: any) => ({
                      ...prev,
                      visitor_type: newType,
                    }));

                    localStorage.removeItem('unsavedVisitorData');
                    setSectionsData([]);
                    setDataVisitor([]);
                    setGroupedPages({} as any);
                    setDraggableSteps([]);
                    setRawSections([]);
                    setActiveStep(0);
                  }}
                >
                  {/* <Fade in={!showVTListSkeleton} timeout={100}> */}
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
                          <Grid size={{ xs: 12, md: 6 }} key={type.id}>
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
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel
                htmlFor="visitor-type"
                sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}
              >
                Select Status Visitor
              </CustomFormLabel>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Radio
                      checked={formData.is_group === false}
                      value={formData.is_group}
                      onChange={() => {
                        setIsSingle(true);
                        setIsGroup(false);
                        setFormData((prev: any) => ({
                          ...prev,
                          is_group: false,
                        }));
                      }}
                    />
                  }
                  label="Single"
                />

                <FormControlLabel
                  control={
                    <Radio
                      checked={formData.is_group === true}
                      value={formData.is_group}
                      onChange={() => {
                        setIsSingle(false);
                        setIsGroup(true);
                        setFormData((prev: any) => ({
                          ...prev,
                          is_group: true,
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
              {isGroup && (
                <Box>
                  <CustomFormLabel sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}>
                    Group List
                  </CustomFormLabel>

                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Group Name</TableCell>
                          <TableCell>Code</TableCell>
                          <TableCell>Visitor Form</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupVisitors.map((g, index) => (
                          <TableRow key={g.id}>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                name="group_name"
                                value={g.group_name}
                                placeholder="Enter group name"
                                onChange={(e) =>
                                  setGroupVisitors((prev) =>
                                    prev.map((item) =>
                                      item.id === g.id
                                        ? { ...item, group_name: e.target.value }
                                        : item,
                                    ),
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                name="group_code"
                                value={g.group_code}
                                InputProps={{ readOnly: true }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                endIcon={<IconArrowRight size={20} />}
                                onClick={() => {
                                  setActiveGroupIdx(index);
                                  const deepClone = (obj: any) => {
                                    try {
                                      return structuredClone(obj);
                                    } catch {
                                      return JSON.parse(JSON.stringify(obj));
                                    }
                                  };
                                  if (g.data_visitor && g.data_visitor.length > 0) {
                                    const cloned = deepClone(g.data_visitor);
                                    setDataVisitor(cloned);
                                  } else {
                                    const fresh = deepClone(
                                      seedDataVisitorFromSections(sectionsData),
                                    );
                                    setDataVisitor(fresh);
                                    console.log(
                                      `🆕 New visitor form for group ${
                                        g.group_name || '(no name)'
                                      }`,
                                      fresh,
                                    );
                                  }
                                  setActiveStep(1);
                                }}
                              >
                                Visitor Form
                              </Button>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteGroup(g.id || '')}
                                size="small"
                              >
                                <IconX />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}

                        {groupVisitors.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No group added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                      {groupVisitors.length === 0 && (
                        <MuiButton
                          variant="contained"
                          size="small"
                          onClick={handleAddGroup}
                          sx={{ mb: 1, ml: 2, mt: 1 }}
                        >
                          + Add Group
                        </MuiButton>
                      )}
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      );
    }
    const currentSection = sectionsData[step - 1];
    if (!currentSection) return null;

    const handleDetailChange = (
      sectionKey: SectionKey,
      index: number,
      field: keyof FormVisitor,
      value: any,
    ) => {
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
                      onSelect={(v) => {
                        let genderValue: string | undefined;

                        if (v.gender === 'Male') genderValue = '1';
                        else if (v.gender === 'Female') genderValue = '0';
                        else if (v.gender === 'Prefer not to say') genderValue = '2';

                        const mapping: Record<string, string | undefined> = {
                          name: v.name,
                          email: v.email,
                          phone: v.phone,
                          organization: v.organization,
                          indentity_id: v.identity_id,
                          gender: genderValue,
                        };

                        setSectionsData((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== activeStep - 1
                              ? s
                              : updateSectionForm(s, (arr) =>
                                  arr.map((item) =>
                                    mapping[item.remarks] !== undefined
                                      ? { ...item, answer_text: mapping[item.remarks]! }
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
              console.log('section Group', section);
              const sectionType = getSectionType(section);
              const firstPage = dataVisitor[0]?.question_page?.[activeStep - 1];
              const showEmployeeSearchHeader = isEmployeeSelected(firstPage?.form || []);

              if (sectionType === 'visitor_information_group') {
                return (
                  <Grid>
                    <Box>
                      <TableContainer component={Paper} sx={{ mb: 1 }}>
                        {isMobile ? (
                          <>
                            {dataVisitor.length > 0 ? (
                              groupVisitors[activeGroupIdx]?.data_visitor?.map((group, gIdx) => {
                                const page = group.question_page[activeStep - 1];
                                if (!page) return null;

                                return (
                                  <Accordion key={gIdx} sx={{ mb: 1 }}>
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1,
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography fontWeight="bold" mb={0}>
                                          Visitor {gIdx + 1}
                                        </Typography>
                                      </Box>

                                      {dataVisitor.length > 1 && (
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGroupRow(gIdx);
                                          }}
                                        >
                                          <IconTrash color="error" />
                                        </IconButton>
                                      )}
                                    </AccordionSummary>

                                    <AccordionDetails>
                                      {page.form
                                        .filter((field: any) => {
                                          if (
                                            field.remarks === 'employee' &&
                                            !showEmployeeSearchHeader
                                          )
                                            return false;

                                          return true;
                                        })
                                        .map((field: any, fIdx: any) => {
                                          const matchedKey = Object.keys(
                                            groupedPages.batch_page || {},
                                          ).find((k) =>
                                            sameField(groupedPages.batch_page[k], field),
                                          );
                                          const shared = matchedKey
                                            ? groupedPages.batch_page[matchedKey]
                                            : undefined;
                                          const proxyField = hasAns(field)
                                            ? field
                                            : shared
                                              ? { ...field, ...pickAns(shared) }
                                              : field;
                                          const handleChangeGroup = (
                                            idx: number,
                                            fieldKey: keyof FormVisitor,
                                            value: any,
                                          ) => {
                                            setDataVisitor((prev) => {
                                              const next = [...prev];
                                              const s = activeStep - 1;

                                              if (!next[gIdx]?.question_page?.[s]?.form?.[idx]) {
                                                return prev;
                                              }

                                              next[gIdx].question_page[s].form[idx] = {
                                                ...next[gIdx].question_page[s].form[idx],
                                                [fieldKey]: value,
                                              };

                                              return next;
                                            });
                                          };

                                          return (
                                            <Box key={fIdx} sx={{ mb: 2 }}>
                                              <RenderFieldGroup
                                                field={proxyField}
                                                index={fIdx}
                                                groupIndex={gIdx}
                                                onChange={handleChangeGroup}
                                                opts={{
                                                  showLabel: false,
                                                  uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                                }}
                                                employee={employee}
                                                allVisitorEmployee={allVisitorEmployee}
                                                sites={sites}
                                                inputValues={inputValues}
                                                setInputValues={setInputValues}
                                                selectedSiteParentIds={selectedSiteParentIds as any}
                                                siteTree={siteTree as any}
                                                setSelectedSiteParentIds={setSelectedSiteParentIds}
                                                setSiteTree={setSiteTree}
                                                buildSiteTreeWithParent={buildSiteTreeWithParent}
                                                renderTree={renderTree}
                                                activeStep={activeStep}
                                                containerRef={null as any}
                                                uploadMethods={uploadMethods}
                                                handleUploadMethodChange={handleUploadMethodChange}
                                                handleFileChangeForField={handleFileChangeForField}
                                                handleRemoveFileForField={handleRemoveFileForField}
                                                uploadNames={uploadNames}
                                                removing={removing}
                                                setIsEmployeeMode={setIsEmployeeMode}
                                                setOpenVisitorDialog={setOpenVisitorDialog}
                                                setActiveGroupIdx={setActiveGroupIdx}
                                              />
                                            </Box>
                                          );
                                        })}
                                    </AccordionDetails>
                                  </Accordion>
                                );
                              })
                            ) : (
                              <Typography align="center" sx={{ py: 2 }}>
                                No visitor data. Click "Add New" to start.
                              </Typography>
                            )}

                            <MuiButton
                              size="small"
                              onClick={handleAddDetails}
                              sx={{ my: 2 }}
                              variant="contained"
                              fullWidth
                            >
                              Add New
                            </MuiButton>
                          </>
                        ) : (
                          <Table
                            size="small"
                            sx={{
                              minWidth: 1000,
                              tableLayout: 'auto',
                              '& th, & td': { whiteSpace: 'nowrap' },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                {(firstPage?.form || [])
                                  .filter((field: any) => {
                                    // employee hanya muncul kalau is_employee = true
                                    if (field.remarks === 'employee' && !showEmployeeSearchHeader)
                                      return false;

                                    return true;
                                  })
                                  .map((f: any, i: any) => (
                                    <TableCell key={f.custom_field_id || i}>
                                      <CustomFormLabel required={f.mandatory == true}>
                                        {f.long_display_text}
                                      </CustomFormLabel>
                                    </TableCell>
                                  ))}
                                <TableCell align="right">
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    Action
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody sx={{ overflow: 'auto' }}>
                              {dataVisitor.length > 0 ? (
                                dataVisitor.map((group, gIdx) => {
                                  const page = group.question_page[activeStep - 1];
                                  console.log('page', page);
                                  if (!page) return null;

                                  const showEmployeeSearch = isEmployeeSelected(page.form as any);

                                  return (
                                    <React.Fragment key={gIdx}>
                                      <TableRow key={gIdx}>
                                        {page.form
                                          ?.filter((field: any) => {
                                            if (field.remarks === 'employee' && !showEmployeeSearch)
                                              return false;

                                            return true;
                                          })
                                          .map((field: any, fIdx: any) => {
                                            const matchedKey = Object.keys(
                                              groupedPages.batch_page || {},
                                            ).find((k) =>
                                              sameField(groupedPages.batch_page[k], field),
                                            );
                                            const shared = matchedKey
                                              ? groupedPages.batch_page[matchedKey]
                                              : undefined;
                                            const proxyField = hasAns(field)
                                              ? field
                                              : shared
                                                ? { ...field, ...pickAns(shared) }
                                                : field;
                                            const handleChangeGroup = (
                                              idx: number,
                                              fieldKey: keyof FormVisitor,
                                              value: any,
                                            ) => {
                                              setDataVisitor((prev) => {
                                                const next = [...prev];
                                                const s = activeStep - 1;

                                                if (!next[gIdx]?.question_page?.[s]?.form?.[idx]) {
                                                  return prev;
                                                }

                                                next[gIdx].question_page[s].form[idx] = {
                                                  ...next[gIdx].question_page[s].form[idx],
                                                  [fieldKey]: value,
                                                };

                                                return next;
                                              });
                                            };

                                            return (
                                              <TableCell
                                                key={field.custom_field_id || `${gIdx}-${fIdx}`}
                                              >
                                                <RenderFieldGroup
                                                  field={proxyField}
                                                  index={fIdx}
                                                  groupIndex={gIdx}
                                                  onChange={handleChangeGroup}
                                                  opts={{
                                                    showLabel: false,
                                                    uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                                  }}
                                                  employee={employee}
                                                  allVisitorEmployee={allVisitorEmployee}
                                                  sites={sites}
                                                  inputValues={inputValues}
                                                  setInputValues={setInputValues}
                                                  selectedSiteParentIds={
                                                    selectedSiteParentIds as any
                                                  }
                                                  siteTree={siteTree as any}
                                                  setSelectedSiteParentIds={
                                                    setSelectedSiteParentIds
                                                  }
                                                  setSiteTree={setSiteTree}
                                                  buildSiteTreeWithParent={buildSiteTreeWithParent}
                                                  renderTree={renderTree}
                                                  activeStep={activeStep}
                                                  containerRef={null as any}
                                                  uploadMethods={uploadMethods}
                                                  handleUploadMethodChange={
                                                    handleUploadMethodChange
                                                  }
                                                  handleFileChangeForField={
                                                    handleFileChangeForField
                                                  }
                                                  handleRemoveFileForField={
                                                    handleRemoveFileForField
                                                  }
                                                  uploadNames={uploadNames}
                                                  removing={removing}
                                                  setIsEmployeeMode={setIsEmployeeMode}
                                                  setOpenVisitorDialog={setOpenVisitorDialog}
                                                  setActiveGroupIdx={setActiveGroupIdx}
                                                />
                                              </TableCell>
                                            );
                                          })}

                                        <TableCell align="right">
                                          {dataVisitor.length > 1 && (
                                            <IconButton
                                              aria-label="delete-row"
                                              onClick={() => handleDeleteGroupRow(gIdx)}
                                              size="small"
                                              color="error"
                                            >
                                              <IconTrash />
                                            </IconButton>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    </React.Fragment>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={12} align="center">
                                    No visitor data. Click "Add New" to start.
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow>
                                <TableCell colSpan={12} align="left">
                                  <MuiButton
                                    size="small"
                                    onClick={handleAddDetails}
                                    sx={{ mx: 1, my: 1 }}
                                    variant="contained"
                                  >
                                    Add New
                                  </MuiButton>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        )}
                      </TableContainer>
                    </Box>
                  </Grid>
                );
              } else if (sectionType === 'purpose_visit') {
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

                          const base = formsOf(section)[idx];
                          const found = next.single_page.findIndex((sf) => sameField(sf, base));

                          const resolvedForeign =
                            base?.foreign_id ??
                            section?.foreign_id ??
                            base?.custom_field_id ??
                            null;

                          const payload = {
                            ...(found >= 0 ? next.single_page[found] : base),
                            foreign_id:
                              found >= 0
                                ? (next.single_page[found].foreign_id ?? resolvedForeign)
                                : resolvedForeign,
                            [fieldKey]: value,
                          };

                          if (found >= 0) next.single_page[found] = payload;
                          else next.single_page.push(payload);

                          return next;
                        });
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
            remarks: '',
            custom_field_id: '',
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

      setDataVisitor((prev) => prev.filter((_, i) => i !== rowIdx));

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
      const key = opts?.uniqueKey ?? String(index);
      switch (field.field_type) {
        case 0: // Text
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
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
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
            />
          );

        case 3: {
          let options: { value: string; name: string }[] = [];
          switch (field.remarks) {
            case 'host':
              options = employee.map((emp: any) => ({
                value: emp.id,
                name: emp.name,
              }));
              break;

            case 'employee':
              options = allVisitorEmployee.map((emp: any) => ({
                value: emp.id,
                name: emp.name,
              }));
              break;

            case 'site_place':
              options = sites
                .filter((site: any) => site.can_visited)
                .map((site: any) => ({
                  value: site.id,
                  name: site.name,
                }));
              break;

            default:
              options = (field.multiple_option_fields || []).map((opt: any) =>
                typeof opt === 'object' ? opt : { value: opt, name: opt },
              );
              break;
          }

          // 🔹 Gunakan uniqueKey biar gak tabrakan antar visitor group
          const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
          const inputVal = inputValues[uniqueKey as any] || '';

          return (
            <Autocomplete
              size="small"
              freeSolo
              options={options}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
              inputValue={inputVal}
              onInputChange={(_, newInputValue) =>
                setInputValues((prev) => ({ ...prev, [uniqueKey]: newInputValue }))
              }
              // ✅ Filter: hanya aktif kalau >= 3 huruf
              filterOptions={(opts, state) => {
                const term = (state.inputValue || '').toLowerCase();
                if (term.length < 3) return [];
                return opts.filter((opt) => (opt.name || '').toLowerCase().includes(term));
              }}
              noOptionsText={
                inputVal.length < 3 ? 'Enter at least 3 characters to search.' : 'Not found'
              }
              value={
                options.find(
                  (opt: { value: string; name: string }) => opt.value === field.answer_text,
                ) || null
              }
              onChange={(_, newValue) =>
                onChange(index, 'answer_text', newValue instanceof Object ? newValue.value : '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Ketik minimal 3 karakter"
                  fullWidth
                  sx={{ minWidth: 160 }}
                />
              )}
            />
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
                {field.multiple_option_fields?.map((opt: any) => (
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
                {field.multiple_option_fields?.map((opt: any) => (
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
        case 6:
          if (field.remarks === 'is_employee') {
            const options = field.multiple_option_fields || [];
            const value = field.answer_text ?? '';

            return (
              <FormGroup row>
                {options.map((opt: any, idx: number) => (
                  <FormControlLabel
                    key={idx}
                    control={
                      <Checkbox
                        checked={value === opt.value}
                        onChange={(e) => {
                          // hanya satu yang aktif dalam waktu bersamaan
                          const newVal = e.target.checked ? opt.value : '';
                          onChange(index, 'answer_text', newVal);
                        }}
                      />
                    }
                    label={opt.name}
                  />
                ))}
              </FormGroup>
            );
          }

          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.answer_text)}
                  onChange={(e) => onChange(index, 'answer_text', e.target.checked)}
                />
              }
              label=""
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

        case 9:
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                value={field.answer_datetime ? dayjs(field.answer_datetime) : null}
                ampm={false}
                onChange={(newValue) => {
                  if (newValue) {
                    const utc = newValue.utc().format();
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
              value={field.answer_file as string | undefined}
              onChange={(url) => onChange(index, 'answer_file', url)}
            />
          );

        case 11: {
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
                    {uploadNames[key] ?? ''}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleRemoveFileForField(
                        (field as any).answer_file,
                        (url) => onChange(index, 'answer_file', url),
                        key,
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
              display="flex"
              flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              width="100%"
              sx={{ maxWidth: 400 }}
            >
              <TextField
                select
                size="small"
                value={uploadMethods[key] || 'file'}
                onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                fullWidth
                sx={{
                  width: { xs: '100%', md: '200px' }, // full on mobile
                }}
              >
                <MenuItem value="file">Choose File</MenuItem>
                <MenuItem value="camera">Take Photo</MenuItem>
              </TextField>

              {(uploadMethods[key] || 'file') === 'camera' ? (
                <CameraUpload
                  value={field.answer_file as string | undefined}
                  onChange={(url) => onChange(index, 'answer_file', url)}
                />
              ) : (
                <Box sx={{ width: { xs: '100%', md: '200px' } }}>
                  <label htmlFor={key}>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        borderRadius: 2,
                        p: 0.5,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                        transition: '0.2s',
                        '&:hover': { backgroundColor: '#e3f2fd' },
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                      <Typography variant="subtitle1" sx={{ fontSize: { xs: 13, md: 14 } }}>
                        Upload File
                      </Typography>
                    </Box>
                  </label>

                  <input
                    id={key}
                    type="file"
                    accept="*"
                    hidden
                    onChange={(e) =>
                      handleFileChangeForField(
                        e as React.ChangeEvent<HTMLInputElement>,
                        (url) => onChange(index, 'answer_file', url),
                        key,
                      )
                    }
                  />

                  {!!(field as any).answer_file && (
                    <Box
                      mt={0.5}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ overflow: 'hidden' }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        {uploadNames[key] ?? ''}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={!!removing[key]}
                        onClick={() =>
                          handleRemoveFileForField(
                            (field as any).answer_file,
                            (url) => onChange(index, 'answer_file', url),
                            key,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ [index: number]: string | null }>({});
  const [openCamera, setOpenCamera] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const webcamRef = useRef<Webcam>(null);

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');

    try {
      const response = await axiosInstance2.post('/cdn/upload', formData, {
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

  const handlePDFUploadFor =
    (idx: number, onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // ⬇️ Kalau mau batasi PDF saja, uncomment ini
      // if (file.type !== 'application/pdf') {
      //   console.warn('Hanya file PDF yang diperbolehkan.');
      //   e.target.value = '';
      //   return;
      // }

      const path = await uploadFileToCDN(file);
      if (path) onChange(idx, 'answer_file', path); // ⬅️ update baris yang benar

      // reset supaya memilih file yang sama tetap memicu onChange
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

  const makeCdnUrl = (rel?: string | null) => {
    if (!rel) return null;
    if (/^(data:|blob:|https?:\/\/)/i.test(rel)) return rel;
    const r = rel.startsWith('/') ? rel : `/${rel}`;
    return r.startsWith('/cdn/') ? `${BASE_URL}${r}` : `${BASE_URL}/cdn${r}`;
  };

  const getPreviewSrc = (key: string, answerFile?: string) => {
    if (previews[key]) return previews[key];
    if (!answerFile) return null;

    const lower = answerFile.toLowerCase();
    const isImg =
      /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(lower) ||
      /^data:image\//.test(lower) ||
      /^blob:/.test(lower);

    return isImg ? makeCdnUrl(answerFile) : null;
  };

  const fileNameFromAnswer = (answerFile?: string) => {
    if (!answerFile) return '';
    try {
      const url = new URL(makeCdnUrl(answerFile)!);
      return url.pathname.split('/').pop() || '';
    } catch {
      return String(answerFile).split('/').pop() || '';
    }
  };
  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // tampilkan preview lokal dulu (supaya user melihat langsung)
    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);
    // reset input agar bisa pilih file yg sama lagi
    e.target.value = '';
  };

  // === GANTI: bersihkan juga previews & nama file ===
  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string, // <- pakai key yg sama dengan id input
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        await axiosInstance2.delete(`/cdn${currentUrl}`);
        console.log('✅ Berhasil hapus file CDN:', currentUrl);
      }

      setAnswerFile('');
      setPreviews((p) => ({ ...p, [inputId]: null }));
      setUploadNames((n) => {
        const { [inputId]: _, ...rest } = n;
        return rest;
      });
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      if (el) el.value = '';
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving((s) => ({ ...s, [inputId]: false }));
    }
  };

  const handleCaptureForField = async (setAnswerFile: (url: string) => void, trackKey?: string) => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const path = await uploadFileToCDN(blob);
    if (!path) return;

    if (trackKey) {
      setPreviews((prev) => ({ ...prev, [trackKey]: imageSrc }));
      setUploadNames((prev) => ({ ...prev, [trackKey]: 'camera.jpg' }));
    }
    setAnswerFile(path);
  };

  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());

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

  const buildSiteTreeWithParent = (sites: any[], parentId: string) => {
    const parent = sites.find((s) => s.id === parentId);
    if (!parent) return [];

    return [
      {
        id: parent.id,
        name: parent.name,
        children: buildSiteTree(sites, parentId),
      },
    ];
  };

  const [selectedSiteParentIds, setSelectedSiteParentIds] = useState<string[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const toCsv = (ids: string[]) => ids.join(',');

  const collectAllChildIds = (node: any): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((child: any) => [child.id, ...collectAllChildIds(child)]);
  };

  const renderTree = (
    node: any,
    index: number,
    onChange: (index: number, field: keyof FormVisitor, value: any) => void,
  ) => {
    const checked = selectedSiteIds.includes(node.id);

    return (
      <TreeItem
        key={`${node.parentId ?? 'root'}-${node.id}`}
        itemId={`${node.parentId ?? 'root'}-${node.id}`}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              size="small"
              checked={checked}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const isParentNode = !!node.children?.length;
                setSelectedSiteIds((prev) => {
                  let updated = [...prev];

                  if (isChecked) {
                    if (!updated.includes(node.id)) {
                      updated.push(node.id);
                    }
                    // if (isParentNode) {
                    //   const childIds = collectAllChildIds(node);
                    //   childIds.forEach((cid) => {
                    //     if (!updated.includes(cid)) {
                    //       updated.push(cid);
                    //     }
                    //   });
                    // }
                    if (!isParentNode && node.parentId && !updated.includes(node.parentId)) {
                      updated.push(node.parentId);
                    }
                  } else {
                    updated = updated.filter((id) => id !== node.id);
                    if (isParentNode) {
                      const childIds = collectAllChildIds(node);
                      updated = updated.filter((id) => !childIds.includes(id));
                    }
                  }

                  onChange(index, 'answer_text', toCsv(updated));
                  return updated;
                });
              }}
            />
            <Typography variant="body2">{node.name}</Typography>
          </Box>
        }
      >
        {node.children?.map((child: any) => renderTree(child, index, onChange))}
      </TreeItem>
    );
  };

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

    const getFlag = (key: string) =>
      details.some((f: any) => {
        if (f.remarks?.toLowerCase() !== key) return false;

        const val = f.answer_text;

        if (Array.isArray(val)) {
          return val.some((v) => ['true', '1', 'yes', true].includes(String(v).toLowerCase()));
        }
        return ['true', '1', 'yes', true].includes(String(val).toLowerCase());
      });

    const isDriving = getFlag('is_driving');
    const isEmployee = getFlag('is_employee');

    const visibilityMap: Record<string, boolean> = {
      employee: isEmployee,
      vehicle_type: isDriving,
      vehicle_plate: isDriving,
    };

    const filteredDetails = details.filter((item, i) => {
      const remarks = (item.remarks || '').toLowerCase();
      const visible = visibilityMap.hasOwnProperty(remarks) ? visibilityMap[remarks] : true;

      if (!visible && item.answer_text) onChange(i, 'answer_text', '');
      return visible;
    });

    const handleSitePlaceChange = (idx: number, field: keyof FormVisitor, value: any) => {
      console.log('[SITE PLACE FORM CHANGE]', {
        index: idx,
        field,
        answer_text: value,
      });
      onChange(idx, field, value);
    };

    return filteredDetails.map((item: any, index: any) => {
      const key = `${activeStep - 1}:${index}`;
      const previewSrc = getPreviewSrc(key, (item as any).answer_file);
      const shownName = uploadNames[key] || fileNameFromAnswer((item as any).answer_file);
      return (
        <TableRow key={key}>
          <TableCell>
            <CustomFormLabel sx={{ mb: 1, mt: 0 }} required={item.mandatory === true}>
              {item.long_display_text}
            </CustomFormLabel>
            {(() => {
              switch (item.field_type) {
                case 0: // Text
                  if (item.remarks === 'agenda') {
                    return (
                      <Autocomplete
                        size="small"
                        freeSolo
                        options={[
                          'Meeting',
                          'Presentation',
                          'Visit',
                          'Training',
                          'Report',
                          // 'Others',
                        ]}
                        value={item.answer_text || ''}
                        onChange={(e, newValue) => {
                          if (newValue === 'Others') {
                            onChange(index, 'answer_text', '');
                          } else {
                            onChange(index, 'answer_text', newValue || '');
                          }
                        }}
                        onInputChange={(e, newInputValue) => {
                          onChange(index, 'answer_text', newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Choose or write manually agenda"
                            fullWidth
                          />
                        )}
                      />
                    );
                  }
                  return (
                    <TextField
                      size="small"
                      value={item.answer_text || ''}
                      onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                      placeholder={
                        item.remarks === 'name'
                          ? ''
                          : item.remarks === 'phone'
                            ? ''
                            : item.remarks === 'organization'
                              ? ''
                              : item.remarks === 'indentity_id'
                                ? ''
                                : ''
                      }
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
                      placeholder={item.remarks === 'email' ? '' : ''}
                      fullWidth
                    />
                  );
                case 3: {
                  let options: { value: string; name: string; disabled?: boolean | undefined }[] =
                    [];

                  if (item.remarks === 'host') {
                    options = employee.map((emp: any) => ({
                      value: emp.id,
                      name: emp.name,
                    }));
                  } else if (item.remarks === 'employee') {
                    options = allVisitorEmployee.map((emp: any) => ({
                      value: emp.id,
                      name: emp.name,
                    }));
                  } else if (item.remarks === 'site_place') {
                    options = sites.map((site: any) => ({
                      value: site.id,
                      name: site.name,
                      disabled: site.can_visited === false,
                    }));
                  } else {
                    options = (item.multiple_option_fields || []).map((opt: any) =>
                      typeof opt === 'object' ? opt : { value: opt, name: opt },
                    );
                  }
                  if (item.remarks === 'site_place') {
                    return (
                      <>
                        <Autocomplete
                          multiple
                          size="small"
                          options={options}
                          getOptionLabel={(option) => option.name}
                          inputValue={inputValues[index] || ''}
                          onInputChange={(_, newInputValue, reason) => {
                            if (reason !== 'input') return;

                            setInputValues((prev) => ({
                              ...prev,
                              [index]: newInputValue,
                            }));
                          }}
                          /* 🔥 min 3 char rule */
                          filterOptions={(opts, state) => {
                            if (state.inputValue.length < 3) return [];
                            return opts.filter((opt) =>
                              opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                            );
                          }}
                          noOptionsText={
                            (inputValues[index] || '').length < 3
                              ? 'Enter at least 3 characters to search'
                              : 'Not found'
                          }
                          value={options.filter((opt) => selectedSiteParentIds.includes(opt.value))}
                          onChange={(_, newValues) => {
                            const parentIds = newValues.map((v) => v.value);

                            setSelectedSiteParentIds(parentIds);

                            setInputValues((prev) => ({
                              ...prev,
                              [index]: '',
                            }));
                            const trees = parentIds.flatMap((pid) =>
                              buildSiteTreeWithParent(sites, pid),
                            );

                            setSiteTree(trees);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Enter at least 3 characters to search"
                              fullWidth
                            />
                          )}
                        />
                        {item.remarks === 'site_place' && siteTree.length > 0 && (
                          <SimpleTreeView>
                            {siteTree.map((node) => renderTree(node, index, handleSitePlaceChange))}
                          </SimpleTreeView>
                        )}
                      </>
                    );
                  }
                  return (
                    <Autocomplete
                      size="small"
                      options={options}
                      getOptionLabel={(option) => option.name}
                      inputValue={inputValues[index] || ''}
                      getOptionDisabled={(option) => option.disabled || false}
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
                          ? 'Enter at least 3 characters to search'
                          : 'Not found'
                      }
                      value={options.find((opt) => opt.value === item.answer_text) || null}
                      onChange={(_, newValue) => {
                        const selectedValue = newValue ? newValue.value : '';
                        onChange(index, 'answer_text', selectedValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Enter at least 3 characters to search"
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
                        format="dddd, DD  MMMMM  YYYY, HH:mm"
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
                        value={String(item.answer_text)}
                        onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                        sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                      >
                        {(item.multiple_option_fields || [])
                          // .sort((a: any, b: any) => Number(a.value) - Number(b.value))
                          .sort((a: any, b: any) => {
                            if (item.remarks === 'is_driving') {
                              const order: Record<string, number> = { true: 0, false: 1 };
                              return order[a.value] - order[b.value];
                            }
                            return 0;
                          })
                          .map((opt: any, idx: number) => (
                            <FormControlLabel
                              key={idx}
                              value={String(opt.value)}
                              control={<Radio />}
                              label={opt.name}
                            />
                          ))}
                      </RadioGroup>
                    </FormControl>
                  );
                case 6: // Checkbox
                  return (
                    <FormGroup>
                      {(item.multiple_option_fields || []).map((opt: any, idx: number) => {
                        const val = typeof opt === 'object' ? opt.value : opt;
                        const label = typeof opt === 'object' ? opt.name : opt;
                        const answerArray = Array.isArray(item.answer_text)
                          ? item.answer_text
                          : item.answer_text
                            ? [String(item.answer_text)]
                            : [];

                        return (
                          <FormControlLabel
                            key={idx}
                            control={
                              <Checkbox
                                checked={answerArray.includes(val)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...answerArray, val]
                                    : answerArray.filter((v: string) => v !== val);
                                  onChange(index, 'answer_text', newValue);
                                }}
                              />
                            }
                            label={label}
                          />
                        );
                      })}
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
                            const utc = newValue.utc().format();
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

                case 10: // TakePicture
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
                          onClick={() => setOpenCamera(true)}
                        >
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
                          id={`file-${key}`}
                          type="file"
                          accept="*"
                          hidden
                          ref={fileInputRef}
                          onChange={(e) =>
                            handleFileChangeForField(
                              e as React.ChangeEvent<HTMLInputElement>,
                              (url) => onChange(index, 'answer_file', url),
                              key,
                            )
                          }
                        />
                      </Box>

                      {/* PREVIEW / INFO */}
                      {(previewSrc || shownName) && (
                        <Box
                          mt={1}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          justifyContent={'center'}
                        >
                          {previewSrc ? (
                            <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                              <img
                                src={previewSrc}
                                alt="preview"
                                style={{
                                  width: 200,
                                  height: 200,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                }}
                              />
                              {/* <Typography variant="caption" noWrap>
                                {shownName}
                              </Typography> */}
                              <MuiButton
                                color="error"
                                size="small"
                                variant="outlined"
                                sx={{ mt: 2, minWidth: 120 }}
                                onClick={() =>
                                  handleRemoveFileForField(
                                    (item as any).answer_file,
                                    (url) => onChange(index, 'answer_file', url),
                                    key,
                                  )
                                }
                                startIcon={<IconTrash />}
                              >
                                Remove
                              </MuiButton>
                            </Box>
                          ) : (
                            <></>
                          )}
                        </Box>
                      )}

                      <Dialog
                        open={openCamera}
                        onClose={() => setOpenCamera(false)}
                        maxWidth="md"
                        fullWidth
                      >
                        <Box sx={{ p: 3 }}>
                          <Box>
                            <Typography variant="h6" mb={2}>
                              Take Photo From Camera
                            </Typography>
                            {/* close button */}
                            <IconButton
                              onClick={() => setOpenCamera(false)}
                              sx={{ position: 'absolute', top: 10, right: 10 }}
                            >
                              <IconX size={22} />
                            </IconButton>
                          </Box>
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
                              {previews[key] ? (
                                <img
                                  src={previews[key] as string}
                                  alt="Captured"
                                  style={{
                                    width: '100%',
                                    borderRadius: 8,
                                    border: '2px solid #ccc',
                                  }}
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
                                handleRemoveFileForField(
                                  (item as any).answer_file,
                                  (url) => onChange(index, 'answer_file', url),
                                  key,
                                )
                              }
                              color="warning"
                              sx={{ mr: 2 }}
                            >
                              Clear Foto
                            </MuiButton>
                            <MuiButton
                              variant="contained"
                              onClick={() =>
                                handleCaptureForField(
                                  (url) => onChange(index, 'answer_file', url),
                                  key,
                                )
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

                case 11: {
                  // FileUpload
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

                        <Typography variant="body2" color="textSecondary" mt={1}>
                          Supports: JPG, JPEG, PNG, up to
                          <span style={{ fontWeight: 'semibold' }}> 100KB</span>
                        </Typography>
                        {/*preview  */}
                        {(previewSrc || shownName) && (
                          <Box
                            mt={2}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                          >
                            {previewSrc ? (
                              <>
                                <img
                                  src={previewSrc}
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
                                  onClick={() =>
                                    handleRemoveFileForField(
                                      (item as any).answer_file,
                                      (url) => onChange(index, 'answer_file', url), // kosongkan state
                                      key, // reset <input id=key>
                                    )
                                  }
                                  startIcon={<IconTrash />}
                                >
                                  Remove
                                </MuiButton>
                              </>
                            ) : (
                              <Typography variant="caption" noWrap>
                                {shownName}
                              </Typography>
                            )}
                          </Box>
                        )}

                        <input
                          id={`file-${key}`}
                          type="file"
                          accept="*"
                          hidden
                          ref={fileInputRef}
                          onChange={handlePDFUploadFor(index, onChange)}
                        />
                      </Box>
                    </Box>
                  );
                }

                case 12: {
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
                          Supports: PDF, DOCX, JPG, PNG, up to{' '}
                          <span style={{ fontWeight: 'semibold' }}> 100KB</span>
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
                          id={`file-${key}`}
                          type="file"
                          accept="*"
                          hidden
                          ref={fileInputRef}
                          onChange={(e) =>
                            handleFileChangeForField(
                              e as React.ChangeEvent<HTMLInputElement>,
                              (url) => onChange(index, 'answer_file', url),
                              key,
                            )
                          }
                        />
                        {/*preview  */}
                        {(previewSrc || shownName) && (
                          <Box
                            mt={2}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                          >
                            {previewSrc ? (
                              <>
                                <img
                                  src={previewSrc}
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
                                  onClick={() =>
                                    handleRemoveFileForField(
                                      (item as any).answer_file,
                                      (url) => onChange(index, 'answer_file', url),
                                      key, // reset <input id=key>
                                    )
                                  }
                                  startIcon={<IconTrash />}
                                >
                                  Remove
                                </MuiButton>
                              </>
                            ) : (
                              <Typography variant="caption" noWrap>
                                {shownName}
                              </Typography>
                            )}
                          </Box>
                        )}
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
                                  style={{
                                    width: '100%',
                                    borderRadius: 8,
                                    border: '2px solid #ccc',
                                  }}
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
                                handleRemoveFileForField(
                                  (item as any).answer_file,
                                  (url) => onChange(index, 'answer_file', url),
                                  key,
                                )
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
                }
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
      );
    });
  };

  // helpers
  const sanitize = (v?: string | null) => (v ?? '').trim().toLowerCase();

  const DEFAULT_VFT = FORM_KEY === 'pra_form' ? 0 : 1;

  const mapFieldOut = (tpl: any, sortIdx: number, src?: any) => {
    const out: any = {
      remarks: tpl.remarks ?? '',
      visitor_form_type: tpl.visitor_form_type ?? DEFAULT_VFT,
      field_type: tpl.field_type ?? 0,
      sort: tpl.sort ?? sortIdx,
      short_name: tpl.short_name ?? '',
      long_display_text: tpl.long_display_text ?? '',
      custom_field_id: tpl.custom_field_id ?? null,
      form_visitor_type_id: '',
    };

    const ans = pickAns(src ?? {});

    if (tpl.field_type === 9 && ans?.answer_datetime) {
      const parsed = dayjs(ans.answer_datetime);
      out.answer_datetime = parsed.isValid()
        ? parsed.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
        : ans.answer_datetime;
    } else if ([10, 11, 12].includes(tpl.field_type) && ans?.answer_file) {
      out.answer_file = ans.answer_file;
    } else if (ans?.answer_text) {
      out.answer_text = ans.answer_text;
    }

    return out;
  };

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

  const flattenRowForms = (row: any) =>
    (row?.question_page ?? []).flatMap((p: any) => (Array.isArray(p.form) ? p.form : []));

  const fakeRowFromBatchPage = (batch_page: Record<string, any>) => ({
    question_page: [{ form: Object.values(batch_page || {}) }],
  });

  function buildFinalPayload(
    rawSections: any[],
    groupedPages: { single_page: any[]; batch_page: Record<string, any> },
    rows: Array<{ question_page: any[] }>,
    meta: {
      visitor_type: string;
      is_group: boolean;
      type_registered: number;
      tz: string;
      registered_site?: string;
      group_code?: string;
      group_name?: string;
    },
    selfOnlyOverrides: Record<string, any[]> = {}, // 👈 inject dari state
  ) {
    const sharedPVIdx = indexBy(groupedPages.single_page || []);
    const batchIdx = indexBy(Object.values(groupedPages.batch_page || {}));

    const materialRows = rows?.length ? rows : [fakeRowFromBatchPage(groupedPages.batch_page)];

    const outRows = materialRows.map((row, rowIdx) => {
      const rowForms = flattenRowForms(row);
      const rowIdxMap = indexBy(rowForms);

      const question_page = rawSections.map((section: any, sIdx: number) => {
        const formsTpl = formsOf(section);

        // ambil flag self_only dari row (kalau ada), atau fallback dari overrides
        const rowSelfOnly =
          row?.question_page?.[sIdx]?.self_only === true ||
          !!selfOnlyOverrides[`row${rowIdx}`]?.length;

        const form = formsTpl.map((tpl: any, fIdx: number) => {
          const r = sanitize(tpl?.remarks);
          const cf = tpl?.custom_field_id;

          let pick: any;

          if (isPurposeVisit(section)) {
            if (rowSelfOnly) {
              pick = (selfOnlyOverrides[`row${rowIdx}`] || []).find((f) => sameField(f, tpl));
            } else {
              pick =
                (r && sharedPVIdx.byRemarks.get(r)) ||
                (cf && sharedPVIdx.byCF.get(cf)) ||
                undefined;
            }
          } else {
            pick =
              (r && rowIdxMap.byRemarks.get(r)) ||
              (cf && rowIdxMap.byCF.get(cf)) ||
              (r && batchIdx.byRemarks.get(r)) ||
              (cf && batchIdx.byCF.get(cf)) ||
              undefined;
          }

          return mapFieldOut(tpl, fIdx, pick);
        });

        return {
          id: section.id ?? section.Id ?? null,
          sort: section.sort ?? sIdx,
          name: section.name ?? `Page ${sIdx + 1}`,
          is_document: !!section.is_document,
          can_multiple_used: !!section.can_multiple_used,

          self_only: !!rowSelfOnly,
          foreign_id: asStr(section.foreign_id),
          form,
        };
      });
      console.log('question_page:', question_page);

      return { question_page };
    });

    const basePayload: any = {
      visitor_type: meta.visitor_type,
      is_group: !!meta.is_group,
      type_registered: meta.type_registered ?? 0,
      tz: meta.tz?.trim() ? meta.tz : 'Asia/Jakarta',
      data_visitor: outRows,
    };

    if (meta.type_registered !== 0) {
      basePayload.registered_site = meta.registered_site || '';
    }

    if (meta.group_code) basePayload.group_code = meta.group_code;
    if (meta.group_name) basePayload.group_name = meta.group_name;

    return basePayload;
  }

  const removeIdsDeep = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(removeIdsDeep);
    if (obj && typeof obj === 'object') {
      const { id, Id, ...rest } = obj;
      const cleaned = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, removeIdsDeep(v)]),
      );
      return cleaned;
    }
    return obj;
  };

  const resetMediaState = () => {
    setPreviews({});
    setUploadNames({});
    setScreenshot(null);
    setOpenCamera(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAnswerFiles = () => {
    setSectionsData((prev) =>
      prev.map((section) => ({
        ...section,
        form: section?.form?.map((f: any) =>
          [10, 11, 12].includes(f.field_type) ? { ...f, answer_file: '' } : f,
        ),
      })),
    );
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!token) return;

    try {
      setLoading(true);

      const tz =
        moment.tz?.guess?.() || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

      console.log('🕒 Final detected timezone:', tz);

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

        const safeTrim = (val: any): string => {
          if (val === undefined || val === null) return '';
          if (typeof val === 'string') return val.trim();
          if (Array.isArray(val)) return val.map(String).join(',');
          return String(val).trim();
        };

        // 🧠 Field type-specific handler
        switch (base.field_type) {
          case 9: // Date/Datetime
            if (typeof field.answer_datetime === 'string') {
              base.answer_datetime = dayjs(field.answer_datetime).utc().toISOString();
            }
            break;

          case 10:
          case 11:
          case 12: // File upload
            base.answer_file = safeTrim(field.answer_file);
            break;

          case 5:
          case 6:
          case 7: // Radio, Checkbox, Dropdown
            if (Array.isArray(field.answer_text)) {
              base.answer_text = field.answer_text.map(String).join(',');
            } else if (typeof field.answer_text === 'boolean') {
              base.answer_text = field.answer_text ? 'true' : 'false';
            } else {
              base.answer_text = safeTrim(field.answer_text);
            }
            break;

          default:
            base.answer_text = safeTrim(field.answer_text);
            break;
        }

        return base;
      };

      // 🧱 Common Meta
      const baseMeta = {
        visitor_type: formData.visitor_type ?? '',
        type_registered: TYPE_REGISTERED,
        tz: tz,
        is_group: isGroup,
        ...(TYPE_REGISTERED !== 0 && { registered_site: formData.registered_site ?? '' }),
      };

      let payload: CreateVisitorRequest | CreateGroupVisitorRequest;

      if (isGroup) {
        const list_group = groupVisitors.map((g) => {
          const built = buildFinalPayload(
            rawSections,
            groupedPages,
            g.data_visitor.length ? g.data_visitor : dataVisitor,
            {
              visitor_type: formData.visitor_type ?? '',
              is_group: true,
              type_registered: TYPE_REGISTERED,
              tz: tz,
            },
            selfOnlyOverrides,
          );

          // 🔹 Clean up data_visitor structure
          const cleanDataVisitor = (built.data_visitor ?? []).map((dv: any) => ({
            ...dv,
            question_page: (dv.question_page ?? []).map((qp: any, sIdx: number) => ({
              id: qp.id || qp.Id || rawSections?.[sIdx]?.Id || crypto.randomUUID(),
              sort: qp.sort ?? sIdx,
              name: qp.name ?? `Section ${sIdx + 1}`,
              status: qp.status ?? 0,
              is_document: qp.is_document ?? false,
              can_multiple_used: qp.can_multiple_used ?? false,
              foreign_id: qp.foreign_id ?? '',
              self_only: qp.self_only ?? false,
              form: (qp.form ?? []).map(({ id, Id, ...rest }: any) => rest),
            })),
          }));

          return {
            group_name: g.group_name ?? '',
            group_code: g.group_code ?? '',
            is_group: true,
            visitor_type: formData.visitor_type ?? '',
            tz: tz,
            // registered_site: formData.registered_site ?? '',
            type_registered: TYPE_REGISTERED,
            data_visitor: cleanDataVisitor,
          };
        });

        payload = { list_group };

        const parsed = CreateGroupVisitorRequestSchema.parse(payload);
        console.log('🚀 Final Payload (Group):', JSON.stringify(parsed, null, 2));

        // Submit ke endpoint group
        const submitFn = TYPE_REGISTERED === 0 ? createPraRegisterGroup : createVisitors;
        const backendResponse = await submitFn(token, parsed as any);
        toast('Group visitor created successfully.', 'success');
        resetMediaState();
        clearAnswerFiles();
      }

      // 🟦 SINGLE MODE
      else {
        if (!sectionsData.length) {
          toast('Minimal isi 1 data visitor.', 'warning');
          return;
        }

        const question_page = sectionsData.map((section, sIdx) => ({
          id: section.id?.toString() || section.Id?.toString() || sIdx.toString(),
          sort: section.sort ?? sIdx,
          name: section.name,
          status: 0,
          is_document: section.is_document ?? false,
          can_multiple_used: section.can_multiple_used ?? false,
          foreign_id: section.foreign_id ?? '',
          self_only: section.self_only ?? false,
          form: formsOf(section).map((f, fIdx) => mapField(f as FormVisitor, fIdx)),
        }));

        payload = {
          ...baseMeta,
          data_visitor: [{ question_page }],
        };

        const parsed = CreateVisitorRequestSchema.parse(payload);
        console.log('✅ Final Payload (Single):', JSON.stringify(parsed, null, 2));

        // Submit ke endpoint single
        const submitFn = TYPE_REGISTERED === 0 ? createPraRegister : createVisitor;
        const backendResponse = await submitFn(token, parsed);
        console.log('✅ Visitor created:', backendResponse);
        toast('Visitor created successfully.', 'success');

        resetMediaState();
        clearAnswerFiles();

        // Mapping hasil visitor
        const visitors = backendResponse.collection?.visitors || [];
        const availableCards = backendResponse.collection?.available_cards || [];
        setAvailableCards(availableCards);

        setRows(
          visitors.map((v: any, i: number) => ({
            id: i + 1,
            visitor: v.visitor?.name,
            trx_visitor_id: v.visitor_id ?? null,
            card: null,
          })),
        );

        // Cek akses site
        const siteAnswer = getSiteFromForm(false, sectionsData, dataVisitor);
        if (siteAnswer) {
          try {
            const res = await getGrantAccess(token, siteAnswer);
            setAccessData(res.collection ?? []);
            // console.log('✅ Grant access by site_place:', siteAnswer, res.collection);
          } catch (err) {
            console.error('❌ Failed to fetch grant access:', err);
          }
        }
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        // setNextDialogOpen(true);
      }, 600);

      // localStorage.removeItem('selfOnlyOverrides');
      // setSelfOnlyOverrides({});
    } catch (err: any) {
      setTimeout(() => {
        setLoading(false);
        setNextDialogOpen(false);
      }, 1500);

      toast('Failed to create visitor.', 'error');
      console.error(err);

      if (err?.name === 'ZodError') {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((z: any) => (fieldErrors[z.path.join('.')] = z.message));
        setErrors(fieldErrors);
      } else if (err?.errors) {
        setErrors(err.errors);
      }
    }
  };

  useEffect(() => {
    setDraggableSteps([...dynamicSteps]);
  }, [dynamicSteps]);

  useEffect(() => {
    if (!formData.visitor_type) return;

    const draft = isGroup
      ? {
          visitor_type: formData.visitor_type,
          is_group: true,
          type_registered: 1,
          grouped_pages: groupedPages,
          data_visitor: dataVisitor,
          sections: sectionsData,
        }
      : {
          visitor_type: formData.visitor_type,
          is_group: false,
          type_registered: 1,
          data_visitor: [{ question_page: sectionsData }],
          sections: sectionsData,
        };

    localStorage.setItem('unsavedVisitorData', JSON.stringify(draft));
  }, [formData.visitor_type, isGroup, dataVisitor, sectionsData, groupedPages]);

  const handleAddDetails = () => {
    if (!isGroup) {
      handleAddDetail(FORM_KEY);
      return;
    }

    setDataVisitor((prev) => {
      if (prev.length === 0) return prev;

      // Clone dari group pertama sebagai template
      const clone = JSON.parse(JSON.stringify(prev[0])) as {
        question_page: SectionPageVisitor[];
      };

      // Kosongkan semua jawaban di clone
      clone.question_page.forEach((page) => {
        (page.form ?? []).forEach((f) => {
          f.answer_text = '';
          f.answer_datetime = '';
          f.answer_file = '';
        });
      });

      const next = [...prev, clone];
      setActiveGroupIdx(next.length - 1);
      return next;
    });
  };

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

  const pvIndex = React.useMemo(() => sectionsData.findIndex(isPurposeVisit), [sectionsData]);
  const hasAns = (f: any) => !!(f?.answer_text || f?.answer_datetime || f?.answer_file);

  const buildGroupedPages = (sections: any[] = []): GroupedPages => {
    const single_page: any[] = [];
    const batch_page: Record<string, any> = {};

    sections.forEach((section) => {
      const forms = formsOf(section);

      // Purpose Visit → single_page
      if (isPurposeVisit(section)) {
        if (!section?.self_only) {
          // hanya Purpose Visit global (shared)
          forms.forEach((f: any, idx: number) => {
            const existing = (section.form_answers || []).find((ans: any) => sameField(ans, f));
            single_page.push(existing ? { ...f, ...existing } : cloneFormWithEmptyAnswers(f, idx));
          });
        }

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

    const viSrc = pickVisitorInfoSingle(list);
    const pvSrc = pickPurposeVisit(list);

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

    const pv = pvSrc
      ? {
          ...pvSrc,
          name: 'Purpose Visit',
          can_multiple_used: false,
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
              short_name: 'Agenda',
              long_display_text: 'Agenda',
              field_type: 0,
              remarks: 'agenda',
            },
            {
              short_name: 'Site Place',
              long_display_text: 'Site Place',
              field_type: 0,
              remarks: 'site_place',
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
    setDataVisitor(result);
    return result;
  };

  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);

  const {
    data: visitorType = [],
    isLoading: vtFetching,
    isError: vtError,
  } = useQuery({
    queryKey: ['visitorType', token],
    queryFn: async () => {
      if (!token) return [];
      const res = await getAllVisitorType(token);
      return res?.collection ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const min = 500;

    const fetchMainData = async () => {
      const t0 = Date.now();
      setVtLoading(true);

      try {
        const siteSpaceRes = await getAllSite(token);
        if (cancelled) return;

        setSites(siteSpaceRes?.collection ?? []);
        fetchSecondaryData();
      } catch (error) {
        console.error('❌ Error fetching main data:', error);
      } finally {
        const elapsed = Date.now() - t0;
        const wait = Math.max(0, min - elapsed);
        setTimeout(() => {
          if (!cancelled) setVtLoading(false);
        }, wait);
      }
    };

    const fetchSecondaryData = async () => {
      try {
        const [customFieldRes, employeeRes, allEmployeeRes, visitorRes] = await Promise.all([
          // getAllCustomFieldPagination(token, 0, 99, 'id'),
          getAllCustomField(token),
          getFormEmployee(token),
          getVisitorEmployee(token),
          getAllVisitor(token),
        ]);

        if (cancelled) return;

        setCustomField(customFieldRes?.collection ?? []);
        setEmployee(employeeRes?.collection ?? []);
        setAllVisitorEmployee(allEmployeeRes?.collection ?? []);
        setVisitorDatas(visitorRes?.collection ?? []);
      } catch (error) {
        console.error('⚠️ Error fetching secondary data:', error);
      }
    };

    fetchMainData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!formData.visitor_type || !token) return;

    const raw = localStorage.getItem('unsavedVisitorData');
    const saved = raw ? JSON.parse(raw) : null;
    const sameType = saved?.visitor_type === formData.visitor_type;
    const sameMode = saved?.is_group === isGroup;

    // ✅ Restore jika cocok
    if (sameType && sameMode && saved.sections?.length) {
      setSectionsData(saved.sections);
      setDataVisitor(saved.data_visitor ?? []);
      setGroupedPages(saved.grouped_pages ?? {});
      setDraggableSteps(saved.sections.map((s: any) => s.name));
      setRawSections(saved.sections);
      return;
    }

    // 🌐 Kalau tidak cocok → fetch baru
    const fetchVisitorTypeDetails = async () => {
      setVtLoading(true);
      try {
        // const res = await getVisitorTypeById(token, formData.visitor_type as string);
        const res = visitorType.find((vt: any) => vt.id === formData.visitor_type);
        let sections = res?.section_page_visitor_types ?? [];
        // let sections = res?.collection?.section_page_visitor_types ?? [];

        if (TYPE_REGISTERED === 0 || FORM_KEY == 'pra_form')
          sections = sections.filter((s: any) => (s.pra_form || []).length > 0);

        setRawSections(sections);

        if (isGroup) {
          const groupSections = buildGroupSections(sections);
          setSectionsData(groupSections);
          setDraggableSteps(groupSections.map((s) => s.name));
          seedDataVisitorFromSections(groupSections);
          setGroupedPages(buildGroupedPages(groupSections));
        } else {
          setSectionsData(sections);
          setDraggableSteps(sections.map((s: any) => s.name));
          setDataVisitor([]);
          setGroupedPages({} as any);
        }
      } catch (err) {
        console.error('Failed to fetch visitor type details', err);
        setSectionsData([]);
        setDraggableSteps([]);
      } finally {
        setVtLoading(false);
      }
    };

    fetchVisitorTypeDetails();
  }, [formData.visitor_type, token]);

  useEffect(() => {
    if (!isGroup) return;

    setDataVisitor((prev) => {
      if (!prev[0]) return prev;
      const next = [...prev];
      const qps = next[0].question_page;

      const purpose = qps.find((s) => s.name.toLowerCase().includes('purpose visit'));
      if (purpose) {
        purpose.form = purpose?.form?.map((f: any) => {
          const match = groupedPages.single_page.find(
            (sf) =>
              (sf.custom_field_id && sf.custom_field_id === f.custom_field_id) ||
              (sf.remarks && sf.remarks === f.remarks),
          );
          return match ? { ...f, ...match } : f;
        });
      }
      return next;
    });
  }, [isGroup, groupedPages.single_page]);

  useEffect(() => {
    if (!formData.visitor_type || !rawSections.length) return;

    if (isGroup) {
      const groupSections = buildGroupSections(rawSections);
      setSectionsData(groupSections);
      setDraggableSteps(groupSections.map((s) => s.name));
      seedDataVisitorFromSections(groupSections);
      setGroupedPages(buildGroupedPages(groupSections));
    } else {
      setSectionsData(rawSections);
      setDraggableSteps(rawSections.map((s: any) => s.name));
      setDataVisitor([]);
      setGroupedPages({} as any);
    }

    setActiveStep(0);
  }, [isGroup]);

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

  const [openChooseCardDialog, setOpenChooseCardDialog] = useState(false);
  useEffect(() => {
    if (!openChooseCardDialog) setSelectedCards([]);
  }, [openChooseCardDialog]);

  const resetSelections = () => {
    setSelectedInvitations([]);
    setSelectedCards([]);
    setTableKey((k) => k + 1);
  };

  const handleCloseChooseCard = () => {
    setOpenChooseCardDialog(false);
    resetSelections();
  };

  type Row = {
    id: number;
    visitor?: string;
    card: string | React.ReactNode | null;
    trx_visitor_id?: string | null;
    assigned_card_number?: string | null;
    assigned_card_remarks?: string | null;
  };
  const [rows, setRows] = useState<Row[]>([]);

  const cardIndex = useMemo(() => {
    const m = new Map<string, (typeof availableCards)[number]>();
    availableCards.forEach((c) => m.set(c.card_number, c));
    return m;
  }, [availableCards]);

  const handleConfirmChooseCards = () => {
    const ids = normalizeIdsDeep(selectedInvitations);

    if (!ids.length || !selectedCards.length) {
      handleCloseChooseCard();
      return;
    }

    const N = Math.min(ids.length, selectedCards.length);

    // pair: id ↔ (remarks, card_number)
    const pairs = ids.slice(0, N).map((id, i) => {
      const num = selectedCards[i];
      const meta = cardIndex.get(num);
      return { id, card_number: num, remarks: meta?.remarks ?? '-' };
    });

    setRows((prevRows) =>
      prevRows.map((row) => {
        const p = pairs.find((x) => x.id === row.id);
        if (!p) return row;

        return {
          ...row,
          card: (
            <Box display="flex" flexDirection="column">
              <Typography variant="body2" fontWeight={600}>
                {p.remarks}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.card_number}
              </Typography>
            </Box>
          ),
          assigned_card_number: p.card_number,
          assigned_card_remarks: p.remarks,
        };
      }),
    );

    toast(`Assigned ${N} card(s) to ${N} invitation(s).`, 'success');

    // kosongkan selection
    setSelectedInvitations([]);
    handleCloseChooseCard();
  };

  const filteredRows = useMemo(() => {
    if (!searchKeyword) return rows;
    return rows.filter((r) => r.visitor?.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [rows, searchKeyword]);

  const assignedByCard = useMemo(() => {
    const m = new Map<string, string | number>();
    rows.forEach((r: any) => {
      if (r.assigned_card_number) {
        m.set(String(r.assigned_card_number), r.id);
      }
    });
    return m;
  }, [rows]);

  // id invitation yang sedang dipilih (a,b,c)
  const selectedIdSet = useMemo(() => {
    return new Set(normalizeIdsDeep(selectedInvitations).map(String));
  }, [selectedInvitations]);

  const handleToggleCard = (cardNumber: string) => {
    const holderRowId = assignedByCard.get(String(cardNumber));
    const isUsedByOther = !!holderRowId && !selectedIdSet.has(String(holderRowId));

    if (isUsedByOther) return;

    setSelectedCards((prev) => {
      if (prev.includes(cardNumber)) {
        // sudah ada → remove
        return prev.filter((c) => c !== cardNumber);
      }
      if (prev.length >= selectedInvitations.length) {
        toast('You have reached the maximum number of invitations.', 'warning');
        return prev;
      }
      return [...prev, cardNumber];
    });
  };

  const availableVisibleCards = useMemo(() => {
    return filteredCards.filter((c) => {
      const holder = assignedByCard.get(String(c.card_number));
      // singkirkan hanya jika dipegang orang lain
      return !(holder && !selectedIdSet.has(String(holder)));
    });
  }, [filteredCards, assignedByCard, selectedIdSet]);

  const availableCount = availableVisibleCards.length;

  const handleSelectAll = () => {
    const visible = availableVisibleCards.map((c) => c.card_number);
    const capacity = selectedInvitations.length;
    const cappedVisibleCount = Math.min(visible.length, capacity);
    const visibleSelectedCount = visible.filter((n) => selectedCards.includes(n)).length;

    const fullySelected = cappedVisibleCount > 0 && visibleSelectedCount === cappedVisibleCount;

    if (fullySelected) {
      // klik kedua: hapus semua yg terlihat
      setSelectedCards((prev) => prev.filter((n) => !visible.includes(n)));
      toast('Visible cards cleared.', 'info');
    } else {
      if (capacity <= 0) return toast('Please select invitations first.', 'warning');
      // klik pertama: pilih sebanyak kuota dari yg terlihat
      const toAdd = visible.slice(0, capacity);
      setSelectedCards(toAdd); // RESET & isi ulang (bukan append)
      toast(`Selected ${toAdd.length} available card(s).`, 'success');
    }
  };

  const hasSelfOnly = (dataVisitor: any[]) =>
    dataVisitor?.some((dv) => dv.question_page?.some((page: any) => page.self_only === true));

  const sameSite = allSite.length > 0 && allSite.every((s) => s === allSite[0]);

  const hasSelf = selfOnlyVisitors.length > 0;

  const [checkedGroupItems, setCheckedGroupItems] = useState<string[]>([]);
  const [checkedSelfItems, setCheckedSelfItems] = useState<string[]>([]);

  const handleToggleGroup = (id: string) => {
    setCheckedGroupItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getCheckedCount = () => {
    if (!isGroup) {
      return checkedItems.length;
    }

    if (isGroup && !hasSelfOnly(dataVisitor)) {
      return checkedGroupItems.length;
    }

    if (isGroup && hasSelfOnly(dataVisitor)) {
      return checkedSelfItems.length + checkedItems.length;
    }

    return 0;
  };

  useEffect(() => {
    if (openChooseCardDialog) {
      const preselected: string[] = [];
      for (const [cardNumber, holderRowId] of assignedByCard.entries()) {
        if (selectedIdSet.has(String(holderRowId))) {
          preselected.push(cardNumber);
        }
      }
      setSelectedCards(preselected);
    }
  }, [openChooseCardDialog, assignedByCard, selectedIdSet]);

  const stepLabels = useMemo(() => ['User Type', ...draggableSteps], [draggableSteps]);

  return (
    <PageContainer title="Invitation" description="this is Add Visitor page">
      <form onSubmit={handleOnSubmit}>
        <Box width="100%">
          {!isMobile ? (
            <DragDropContext onDragEnd={() => {}}>
              <Droppable
                droppableId="stepper"
                direction="horizontal"
                isDropDisabled={true}
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
                        // overflowX: 'auto',
                        // px: 2,
                        flexWrap: 'nowrap',
                        justifyContent: 'flex-start',
                        // columnGap: 6,
                        '& .MuiStep-root': {
                          flex: '1 1 0',
                          // px: 1.5,
                        },
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textWrap: 'wrap',
                          // textOverflow: 'ellipsis',
                          textAlign: 'center',
                        },
                        '& .MuiStepIcon-root': {
                          width: 30,
                          height: 30,
                        },
                      }}
                      // connector={null}
                    >
                      <Step
                        key="User Type"
                        completed={false}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          m: 0,
                        }}
                      >
                        <StepLabel
                          onClick={() => setActiveStep(0)}
                          StepIconProps={{ sx: { width: 30, height: 30 } }}
                          sx={{
                            '& .MuiStepLabel-label': {
                              fontWeight: activeStep === 0 ? 600 : 400,
                              color: activeStep === 0 ? 'primary.main' : 'text.secondary',
                            },
                          }}
                        >
                          User Type
                        </StepLabel>
                      </Step>

                      {/* Dynamic Draggable Steps */}
                      {draggableSteps.map((label, index) => (
                        <Draggable key={label} draggableId={label} index={index} isDragDisabled>
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
                                    snapshot.isDragging || activeStep === index + 1
                                      ? '#fff'
                                      : '#fff',
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 0.5,
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s ease',
                                  marginRight: -2,
                                }}
                              >
                                {index + 2}
                              </Box>
                              <StepLabel
                                sx={{
                                  '& .MuiStepLabel-label': {
                                    fontWeight: activeStep === index + 1 ? 600 : 400,
                                    color:
                                      activeStep === index + 1 ? 'primary.main' : 'text.secondary',
                                  },
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
          ) : (
            <>
              <Typography fontWeight={600} color="black" textAlign="center" variant="h5">
                {stepLabels[activeStep]}
              </Typography>
              <MobileStepper
                variant="dots"
                steps={draggableSteps.length + 1}
                position="static"
                activeStep={activeStep}
                sx={{
                  background: 'transparent',
                  justifyContent: 'center',
                  mb: 0,
                }}
                nextButton={null}
                backButton={null}
              />
            </>
          )}

          <Box mt={3}>{handleSteps(activeStep)}</Box>

          <Box
            mt={3}
            display="flex"
            justifyContent="space-between"
            sx={{
              position: 'sticky',
              bottom: -20,
              backgroundColor: 'white',
              padding: 2,
              zIndex: 10,
            }}
          >
            {/* Tombol Back */}
            <MuiButton
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
              startIcon={<IconArrowLeft width={18} />}
            >
              Back
            </MuiButton>
            {isGroup ? (
              isLastStep ? (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveGroupVisitor();
                    toast('Group form saved successfully.', 'success');
                    setActiveStep(0);
                  }}
                >
                  {loading ? 'Saving...' : 'Save Group'}
                </Button>
              ) : activeStep === 0 ? (
                <Button variant="contained" color="primary" onClick={handleOnSubmit}>
                  Submit All
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveStep((prev) => prev + 1);
                  }}
                  endIcon={<IconArrowRight width={18} />}
                >
                  Next
                </Button>
              )
            ) : isLastStep ? (
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={handleOnSubmit}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<IconArrowRight width={18} />}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveStep((prev) => prev + 1);
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>

      {/* Visitor Card */}
      <Dialog
        open={nextDialogOpen}
        onClose={handleCloseGrantDialog}
        fullWidth
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3, // sudut lebih rounded
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 3,
            py: 2,
            background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          }}
        >
          <DialogTitle sx={{ m: 0, p: 0, fontWeight: 600, fontSize: '1.25rem' }}>
            Grant Visitor
          </DialogTitle>
          <Box display="flex" gap={1}>
            <MuiButton
              color="secondary"
              variant="outlined"
              onClick={handleCloseGrantDialog}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              color="primary"
              variant="contained"
              onClick={() => setAccessDialogOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(99,102,241,0.3)',
              }}
            >
              Grant
            </MuiButton>
          </Box>
        </Box>

        {/* Content */}
        <DialogContent
          dividers
          sx={{
            p: 1,
            backgroundColor: 'background.default',
          }}
        >
          <Box
            sx={{
              mt: 0,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <DynamicTable
              key={tableKey}
              data={filteredRows.map(
                ({ trx_visitor_id, assigned_card_number, assigned_card_remarks, ...rest }) => rest,
              )}
              isHaveChecked={true}
              isHaveSearch={true}
              isHaveHeaderTitle={false}
              // titleHeader="Invitation"
              isHaveCard={true}
              selectedRows={selectedInvitations}
              onCheckedChange={handleSelectInvitation}
              onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
              onChooseCard={handleOpenChooseCard}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Choose Card  */}
      <Dialog open={openChooseCardDialog} onClose={handleCloseChooseCard} fullWidth maxWidth="lg">
        <DialogTitle>Choose Card</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseChooseCard}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers>
          {/* Search */}
          <Box mb={2}>
            <TextField
              fullWidth
              size="small"
              label=""
              placeholder="Search card"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Select All */}
          <Box mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    availableVisibleCards.length > 0 &&
                    availableVisibleCards.every((c) => selectedCards.includes(c.card_number))
                  }
                  indeterminate={
                    availableVisibleCards.some((c) => selectedCards.includes(c.card_number)) &&
                    !availableVisibleCards.every((c) => selectedCards.includes(c.card_number))
                  }
                  onChange={handleSelectAll}
                />
              }
              label="Select All"
            />
          </Box>

          <Grid container spacing={2}>
            {filteredCards.map((card) => {
              const holderRowId = assignedByCard.get(String(card.card_number));
              const isUsedByOther = !!holderRowId && !selectedIdSet.has(String(holderRowId));
              const isAssignedInThisSelection =
                !!holderRowId && selectedIdSet.has(String(holderRowId));
              const isChosen = selectedCards.includes(card.card_number);
              const isLocked = isUsedByOther;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                  <Paper
                    role="button"
                    tabIndex={isLocked ? -1 : 0}
                    aria-disabled={isLocked}
                    aria-pressed={isChosen ? 'true' : 'false'}
                    onClick={() => !isLocked && handleToggleCard(card.card_number)}
                    onKeyDown={(e) => {
                      if (isLocked) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleCard(card.card_number);
                      }
                    }}
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 2,
                      position: 'relative',
                      height: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: isChosen ? 'primary.main' : 'divider',
                      boxShadow: isChosen ? theme.shadows[10] : theme.shadows[4],
                      backgroundColor: isChosen ? 'primary.50' : 'background.paper',

                      // visual disabled utk Used saja
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      pointerEvents: isLocked ? 'none' : 'auto',
                      opacity: isUsedByOther ? 0.4 : 1,
                      filter: isUsedByOther ? 'grayscale(0.8) brightness(0.7)' : 'none',
                      '::after': isUsedByOther
                        ? {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 'inherit',
                            pointerEvents: 'none',
                            backgroundImage:
                              'repeating-linear-gradient(45deg, rgba(255,0,0,0.2), rgba(255,0,0,0.2) 2px, transparent 2px, transparent 4px)',
                          }
                        : {},

                      // hover/active/focus hanya jika tidak locked
                      transformOrigin: 'center',
                      transition: theme.transitions.create(
                        ['transform', 'box-shadow', 'border-color', 'background-color', 'filter'],
                        {
                          duration: theme.transitions.duration.shorter,
                          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                        },
                      ),
                      '::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 40%)',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity 200ms ease',
                      },
                      ...(!isLocked && {
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.shadows[8],
                          borderColor: 'primary.main',
                          '::before': { opacity: 1 },
                        },
                        '&:active': {
                          transform: 'translateY(-1px) scale(0.995)',
                          boxShadow: theme.shadows[4],
                        },
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: theme.palette.primary.main,
                          outlineOffset: 2,
                        },
                      }),
                    })}
                  >
                    {/* konten */}
                    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                      <Typography variant="body1" mt={1}>
                        {card.card_number}
                      </Typography>
                      <Typography variant="h1">{card.remarks}</Typography>
                      <Typography variant="body1" mt={1}>
                        {card.card_mac}
                      </Typography>
                    </Box>

                    <Typography variant="body1" mt={1}>
                      {card.name}
                    </Typography>

                    <FormControlLabel
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      control={
                        <Checkbox
                          disabled={isUsedByOther}
                          checked={isChosen}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={() => handleToggleCard(card.card_number)}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />

                    {/* chip status */}
                    {isUsedByOther && (
                      <Chip
                        size="small"
                        icon={<LockOutlinedIcon fontSize="small" />}
                        label="Used"
                        sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.9 }}
                      />
                    )}
                    {isAssignedInThisSelection && (
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label="Assigned (this)"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box display={'flex'} gap={2}>
              <Typography variant="body2">
                Cards chosen: {selectedCards.length} / {availableCount}
              </Typography>
              <Typography variant="body2">|</Typography>
              <Typography variant="body2">
                Invitations available: {selectedInvitations.length} (max cards you can choose)
              </Typography>
            </Box>

            <Box display="flex" gap={1}>
              <Button onClick={handleCloseChooseCard} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={selectedCards.length === 0}
                onClick={handleConfirmChooseCards}
              >
                Choose
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Access Dialog */}
      <Dialog
        open={accessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Give Access Visitor</DialogTitle>
        {/* close icon */}
        <IconButton
          aria-label="close"
          onClick={() => setAccessDialogOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        {/* close icon */}

        <DialogContent dividers>
          <Stack spacing={3} flexDirection="column">
            {/* 1. Single */}
            {!isGroup && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Single Access
                </Typography>
                <Box display="flex" flexDirection="column">
                  {accessData.map((a) => (
                    <FormControlLabel
                      key={`single-${a.access_control_id}`}
                      control={
                        <Checkbox
                          checked={checkedItems.includes(a.access_control_id)}
                          onChange={() => handleToggle(a.access_control_id)}
                        />
                      }
                      label={a.name}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 2. Group only */}
            {isGroup && !hasSelfOnly(dataVisitor) && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Group Access
                </Typography>
                <Box display="flex" flexDirection="column">
                  {accessData.map((a) => (
                    <FormControlLabel
                      key={`group-${a.access_control_id}`}
                      control={
                        <Checkbox
                          checked={checkedGroupItems.includes(a.access_control_id)}
                          onChange={() => handleToggleGroup(a.access_control_id)}
                        />
                      }
                      label={a.name}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Grant {getCheckedCount()} Access
            </Typography>
            <Button
              variant="contained"
              color="success"
              disabled={checkedItems.length === 0 || loading}
              onClick={handleAccessSubmit}
              size="medium"
            >
              {loading ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <VisitorSelectDialog
        open={openVisitorDialog}
        isEmployeeMode={isEmployeeMode}
        token={token as string}
        activeGroupIdx={activeGroupIdx}
        activeStep={activeStep}
        setOpen={setOpenVisitorDialog}
        setActiveGroupIdx={setActiveGroupIdx as any}
        setDataVisitor={setDataVisitor}
      />

      <GlobalBackdropLoading open={loading} />
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ zIndex: 2000 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </PageContainer>
  );
};

export default FormAddInvitation;
