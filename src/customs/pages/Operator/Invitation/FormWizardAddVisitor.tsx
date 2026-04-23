import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { AlertColor } from '@mui/material/Alert';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TableHead,
  Grid2 as Grid,
  Dialog,
  Checkbox,
  LinearProgress,
  TableRow,
  TableCell,
  Button,
  FormGroup,
  TextField,
  Radio,
  Button as MuiButton,
  Autocomplete,
  DialogTitle,
  DialogContent,
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
  RadioGroup,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  Portal,
  useTheme,
  useMediaQuery,
  MobileStepper,
  MenuItem,
} from '@mui/material';
import 'select2';
import 'select2/dist/css/select2.min.css';
import {
  IconArrowLeft,
  IconCamera,
  IconDeviceFloppy,
  IconScan,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import Webcam from 'react-webcam';
import 'react-image-crop/dist/ReactCrop.css';
import { useSession } from 'src/customs/contexts/SessionContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  CreateGroupVisitorRequest,
  CreateGroupVisitorRequestSchema,
  CreateVisitorRequest,
  CreateVisitorRequestSchema,
} from 'src/customs/api/models/Admin/Visitor';

import { axiosInstance2 } from 'src/customs/api/interceptor';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
import { DateTimePicker, renderTimeViewClock, TimePicker } from '@mui/x-date-pickers';
import { IconX } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  createPraRegisterGroupOperator,
  createSingleInvitationOperator,
  createSinglePraRegisterOperator,
  createVisitorsGroupOperator,
} from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import VisitorTypeList from './components/VisitorTypeList';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import ScanDialog from '../Dialog/ScanDialog';
import GroupScanPreviewDialog from '../Dialog/GroupScanPreviewDialog';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
// dayjs.locale('id');

interface FormVisitorTypeProps {
  formData: CreateVisitorRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  formKey?: 'visit_form' | 'pra_form';
  containerRef?: any;
  fullscreenHandle?: any;
  resetStep?: any;
  // wsPayload? : any;
  ws?: any;
  setWsPayload?: any;
  registeredSite?: string;
  onInvitationCreated?: (invitationCode: string) => void;
  forceTick?: any;
  visitorType?: any;
  sites?: any;
  employee?: any;
  allVisitorEmployee?: any;
  vtLoading?: boolean;
}

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
  registered_site_id: string;
  data_visitor: any[];
}

interface GroupScanPreview {
  id: string;
  documentType: 'ktp' | 'passport';
  data: {
    name?: string;
    gender?: string;
    indentity_id?: string;
    document_image_url?: string;
  };
  image?: {
    base64?: string;
    cdn_url?: string;
  };
  selected: boolean;
}

const scanPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
`;

const ScanIcon = styled(IconScan)(() => ({
  animation: `${scanPulse} 1.2s infinite ease-in-out`,
}));

import { styled, keyframes } from '@mui/material/styles';
import RenderFieldGroup from '../Components/RenderFieldGroup';
import GlobalBackdropLoading from '../Components/GlobalBackdrop';
import VisitorSelectDialog from '../Components/VisitorSelectDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { IconUsers } from '@tabler/icons-react';
import { getVisitorTypeById } from 'src/customs/api/admin';

const FormWizardAddVisitor: React.FC<FormVisitorTypeProps> = ({
  formData,
  setFormData,
  onSuccess,
  formKey = 'visit_form',
  containerRef,
  fullscreenHandle,
  resetStep,
  ws,
  setWsPayload,
  registeredSite,
  onInvitationCreated,
  forceTick,
  visitorType,
  sites,
  employee,
  allVisitorEmployee,
  vtLoading,
}) => {
  const THEME = useTheme();
  const isMobile = useMediaQuery(THEME.breakpoints.down('md'));
  const FORM_KEY: 'visit_form' | 'pra_form' = formKey;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const { token } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [dynamicSteps, setDynamicSteps] = useState<string[]>([]);
  const [draggableSteps, setDraggableSteps] = useState<string[]>([]);
  const stepLabels = useMemo(() => ['User Type', ...draggableSteps], [draggableSteps]);
  const [sectionsData, setSectionsData] = useState<SectionPageVisitorType[]>([]);
  const [dataVisitor, setDataVisitor] = useState<{ question_page: any[] }[]>([]);
  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;
  const [isSingle, setIsSingle] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [groupForms, setGroupForms] = useState<Record<number, FormVisitor[][]>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [nextDialogOpen, setNextDialogOpen] = useState(false);
  const BASE_URL = axiosInstance2.defaults.baseURL;
  const [rawSections, setRawSections] = useState<any[]>([]);
  const formsOf = (section: any) => (Array.isArray(section?.[FORM_KEY]) ? section[FORM_KEY] : []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [openScan, setOpenScan] = useState(false);
  const [scanStep, setScanStep] = useState<'scanning' | 'done'>('scanning');
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const webcamRef = useRef<Webcam>(null);
  const [documentType, setDocumentType] = useState<'ktp' | 'passport' | null>(null);
  const [groupScanPreviews, setGroupScanPreviews] = useState<any[]>([]);
  const scanSessionRef = useRef(false);
  const [scanSessionActive, setScanSessionActive] = useState(false);
  const bufferedImagesRef = useRef<any[]>([]);
  const [isGroupScanning, setIsGroupScanning] = useState(false);
  const [openGroupPreview, setOpenGroupPreview] = useState(false);
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [isEmployeeMode, setIsEmployeeMode] = useState(false);

  const resetGroupScanState = () => {
    setOpenGroupPreview(false);
    setGroupScanPreviews([]);
    setWsPayload(null);

    setIsGroupScanning(false);
    setScanSessionActive(false);

    if (scanSessionRef?.current !== undefined) {
      scanSessionRef.current = false;
    }
  };

  const ScanContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    gap: 16,
  }));

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  useEffect(() => {
    setActiveStep(0);
  }, [resetStep]);

  const [groupedPages, setGroupedPages] = useState<GroupedPages>({
    single_page: [],
    batch_page: {},
  });
  const TYPE_REGISTERED: 0 | 1 = FORM_KEY === 'pra_form' ? 0 : 1;
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  const updateSectionForm = (sec: any, updater: (arr: any[]) => any[]) => {
    const forms = formsOf(sec);

    return {
      ...sec,
      [FORM_KEY]: updater(Array.isArray(forms) ? forms : []),
    };
  };

  const handleVisitorTypeChange = useCallback((e: any) => {
    const newType = e.target.value;

    setFormData((prev) => ({
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
  }, []);

  const [groupVisitors, setGroupVisitors] = useState<GroupVisitor[]>([]);
  const handleChangeDocumentType = (id: string, type: 'ktp' | 'passport') => {
    setGroupScanPreviews((prev) =>
      prev.map((p) => (p.id === id ? { ...p, documentType: type } : p)),
    );
  };

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

  const handleAddGroup = () => {
    const newGroupIndex = groupVisitors.length;

    setSelectedSiteParentIdsGroup((prev) => ({
      ...prev,
      [`group-${newGroupIndex}`]: [],
    }));

    setSiteTreeGroup((prev) => ({
      ...prev,
      [`group-${newGroupIndex}`]: [],
    }));

    setInputValues({});

    const randomCode = Array.from({ length: 6 }, () =>
      Math.random().toString(36).charAt(2).toUpperCase(),
    ).join('');

    const detectedTz =
      moment.tz?.guess?.() || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

    const newGroup: GroupVisitor = {
      id: generateUUIDv4(),
      group_name: '',
      group_code: randomCode,
      is_group: formData.is_group || false,
      visitor_type: formData.visitor_type || '',
      tz: detectedTz,
      registered_site_id: registeredSite || '',
      data_visitor: [],
    };

    setGroupVisitors((prev) => [...prev, newGroup]);
  };

  const handleDeleteGroup = (id: string) => {
    setGroupVisitors((prev) => prev.filter((g) => g.id !== id));
  };

  useEffect(() => {
    const queue = ws?.imageQueue?.current;
    // console.log('🟢 Queue:', queue);
    if (!queue || queue.length === 0) return;

    const images = [...queue];
    queue.length = 0;

    const mapped = images.map((payload) => {
      const [fileName, base64] = payload.split('|');
      return {
        id: generateUUIDv4(),
        documentType: 'ktp',
        selected: true,
        image: { fileName, base64 },
        data: {},
      };
    });

    if (!scanSessionActive) {
      bufferedImagesRef.current.push(...mapped);
    } else {
      setGroupScanPreviews((prev) => [...prev, ...mapped]);
      setOpenGroupPreview(true);
    }
  }, [scanSessionActive]);

  useEffect(() => {
    if (!scanSessionActive) return;
    if (bufferedImagesRef.current.length === 0) return;

    setGroupScanPreviews((prev) => [...prev, ...bufferedImagesRef.current]);
    bufferedImagesRef.current = [];
    setOpenGroupPreview(true);
  }, [scanSessionActive]);

  function mapOcrToData(collection: any, documentType: 'ktp' | 'passport', imageUrl?: string) {
    if (documentType === 'ktp') {
      return {
        name: collection?.nama?.trim() || '',
        gender: collection?.jenis_kelamin || '',
        indentity_id: collection?.nik?.replace(/\s+/g, '') || '',
        document_image_url: imageUrl || '',
      };
    }

    // passport
    return {
      name: collection?.given_name?.trim() || '',
      gender: collection?.sex || '',
      indentity_id: collection?.document_number?.replace(/\s+/g, '') || '',
      document_image_url: imageUrl || '',
    };
  }

  useEffect(() => {
    const queue = ws?.ocrQueue?.current;

    if (!queue || queue.length === 0) return;

    const payloads = [...queue];
    queue.length = 0;

    let hasAnyUpdate = false;

    payloads.forEach((raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      if (msg.event !== 'OCR_RESULT') return;

      const items = msg.data?.items;
      if (!items?.length) return;

      hasAnyUpdate = true;

      setGroupScanPreviews((prev) =>
        prev.map((scan) => {
          const item = items.find((i: any) => i.image_name === scan.image?.fileName);
          if (!item?.result?.collection) return scan;

          return {
            ...scan,
            data: mapOcrToData(item.result.collection, scan.documentType, scan.image?.cdn_url),
          };
        }),
      );
    });
    if (hasAnyUpdate) {
      setIsGroupScanning(false);

      setSnackbar({ open: true, message: 'Documents successfully scanned', severity: 'success' });
    }
  }, [ws?.ocrQueue?.current?.length]);

  useEffect(() => {
    const ready = groupScanPreviews.every(
      (s) => s.selected && s.data?.indentity_id && s.image?.cdn_url,
    );

    if (!ready) return;

    applyScanToVisitorForm(activeGroupIdx!, groupScanPreviews);
  }, [groupScanPreviews]);

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

  const syncPurposeVisitToAllVisitors = (visitors: any[]) => {
    if (!visitors.length) return visitors;

    const source = visitors[0];
    const pIdx = source.question_page.findIndex((p: any) =>
      p.name.toLowerCase().includes('purpose visit'),
    );
    if (pIdx < 0) return visitors;

    const pvForm = structuredClone(source.question_page[pIdx].form);

    return visitors.map((v) => {
      const page = v.question_page[pIdx];
      if (!page) return v;

      return {
        ...v,
        question_page: v.question_page.map((p: any, i: any) =>
          i === pIdx ? { ...p, form: pvForm } : p,
        ),
      };
    });
  };

  const handleSaveGroupVisitor = () => {
    if (activeGroupIdx === null) return;

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
        return prev;
      }

      let cleanDataVisitor = deepClone(dataVisitor).map((dv: any) => ({
        ...dv,
        question_page: (dv.question_page || []).map((qp: any) => ({
          id: qp.id || generateUUIDv4(),
          sort: qp.sort ?? 0,
          name: qp.name ?? '',
          is_document: qp.is_document ?? false,
          can_multiple_used: qp.can_multiple_used ?? false,
          foreign_id: qp.foreign_id ?? '',
          self_only: qp.self_only ?? false,
          form: (qp.form || []).map(({ id, Id, ...rest }: any) => deepClone(rest)),
        })),
      }));

      cleanDataVisitor = syncPurposeVisitToAllVisitors(cleanDataVisitor);

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

  const handleConfirmScan = (scanResult: any, documentType: 'ktp' | 'passport' | 'selfie') => {
    const payload = scanResult?.data ?? scanResult ?? {};

    const targetDocumentId = getDocumentIdByType(documentType);

    if (!targetDocumentId) {
      console.warn('❌ Document ID not found for', documentType);
      return;
    }

    setSectionsData((prev) =>
      prev.map((section) => {
        const sectionType = getSectionType(section);

        if (sectionType === 'visitor_information') {
          return updateSectionForm(section, (arr) =>
            arr.map((item) => {
              switch (item.remarks) {
                case 'name':
                  return { ...item, answer_text: payload.name ?? '' };

                case 'indentity_id':
                  return { ...item, answer_text: payload.indentity_id ?? '' };

                case 'gender': {
                  let gender = '2';
                  if (payload.gender === 'LAKI-LAKI') gender = '1';
                  if (payload.gender === 'PEREMPUAN') gender = '0';
                  return { ...item, answer_text: gender };
                }

                default:
                  return item;
              }
            }),
          );
        }

        if (section.is_document === true && section.foreign_id === targetDocumentId) {
          return updateSectionForm(section, (arr) =>
            arr.map((item) =>
              item.field_type === 12 ? { ...item, answer_file: payload.document_image_url } : item,
            ),
          );
        }

        return section;
      }),
    );
    setActiveStep((prev) => prev + 1);
  };

  function formatDateTime() {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      '_' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  function parseScannerBase64(input: string) {
    const [meta, base64] = input.split(',');

    const match = meta.match(/data:(image\/\w+);base64/i);
    if (!match) throw new Error('Invalid base64 header');

    const mime = match[1];
    const ext = mime.split('/')[1];

    return { base64, ext, mime };
  }

  function generateFilename(type: 'ktp' | 'passport', ext: string) {
    return `visitor_${type}_${formatDateTime()}.${ext}`;
  }

  async function uploadScannerImageBase64(
    rawBase64: string,
    documentType: 'ktp' | 'passport',
  ): Promise<string | null> {
    try {
      const parsed = parseScannerBase64(rawBase64);

      const formData = new FormData();
      formData.append('file_name', generateFilename(documentType, parsed.ext));
      formData.append('file', rawBase64);
      formData.append('path', documentType);

      const res = await axiosInstance2.post('/cdn/upload-base64', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = res.data?.collection?.file_url;
      if (!fileUrl) return null;

      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (err) {
      console.error('Upload base64 failed', err);
      return null;
    }
  }

  function applyScanToVisitorForm(groupIdx: number, scans: GroupScanPreview[]) {
    setGroupVisitors((prev) =>
      prev.map((group, gi) => {
        if (gi !== groupIdx) return group;

        const baseVisitors =
          group.data_visitor.length > 0
            ? group.data_visitor
            : scans.map(() => seedDataVisitorFromSections(sectionsData)[0]);

        const updatedVisitors = baseVisitors.map((visitor, vIdx) => {
          const scan = scans[vIdx];
          if (!scan) return visitor;

          const targetDocumentId = getDocumentIdByType(scan.documentType);

          return {
            ...visitor,
            question_page: visitor.question_page.map((page: any) => {
              const sectionType = getSectionType(page);

              if (sectionType === 'visitor_information_group') {
                return {
                  ...page,
                  form: page.form.map((field: any) => {
                    if (field.remarks === 'name') {
                      return { ...field, answer_text: scan.data.name ?? '' };
                    }

                    if (field.remarks === 'indentity_id') {
                      return { ...field, answer_text: scan.data.indentity_id ?? '' };
                    }

                    if (field.remarks === 'gender') {
                      let g = '2';
                      if (scan.data.gender === 'LAKI-LAKI') g = '1';
                      if (scan.data.gender === 'PEREMPUAN') g = '0';
                      return { ...field, answer_text: g };
                    }

                    if (
                      field.remarks === 'identity_image' &&
                      field.foreign_id === targetDocumentId
                    ) {
                      return {
                        ...field,
                        answer_file: scan.image?.cdn_url ?? '',
                      };
                    }

                    return field;
                  }),
                };
              }

              return page;
            }),
          };
        });

        return {
          ...group,
          data_visitor: updatedVisitors,
        };
      }),
    );
  }

  const handleSelectVisitor = (gIdx: number, v: any) => {
    if (!v) {
      const resetKeys = [
        'name',
        'email',
        'phone',
        'organization',
        'indentity_id',
        'gender',
        'employee',
      ];

      setDataVisitor((prev) => {
        const next = [...prev];
        const page = next[gIdx]?.question_page?.[activeStep - 1];

        if (!page?.form) return prev;

        next[gIdx].question_page[activeStep - 1].form = page.form.map((item: any) =>
          resetKeys.includes(item.remarks) ? { ...item, answer_text: '' } : item,
        );

        return next;
      });

      return;
    }

    let genderValue: string | undefined;

    if (v.gender === 'Male') genderValue = '1';
    else if (v.gender === 'Female') genderValue = '0';
    else if (v.gender === 'Prefer not to say') genderValue = '2';

    const mapping: Record<string, string | undefined> = {
      name: v.name,
      email: v.email,
      phone: v.phone,
      organization: typeof v.organization === 'object' ? v.organization.name : v.organization,
      indentity_id: v.identity_id,
      gender: genderValue,
      employee: v.id,
    };

    setDataVisitor((prev) => {
      const next = [...prev];
      const page = next[gIdx]?.question_page?.[activeStep - 1];

      if (!page?.form) return prev;

      next[gIdx].question_page[activeStep - 1].form = page.form.map((item: any) =>
        mapping[item.remarks] !== undefined
          ? { ...item, answer_text: mapping[item.remarks]! }
          : item,
      );

      return next;
    });
  };

  const isEmployeeSection = (section: any): boolean => {
    const fields = formsOf(section);
    if (!Array.isArray(fields)) return false;

    const flag = fields.find((f) => f.remarks === 'is_employee');
    if (!flag) return false;

    return (
      flag.answer_text === true ||
      flag.answer_text === 'true' ||
      flag.answer_text === '1' ||
      flag.answer_text === 1
    );
  };

  const isEmployeeSelected = (forms: any[]) => {
    const f = forms.find((x) => x.remarks === 'is_employee');
    return f?.answer_text === 'true';
  };

  const handleSteps = (step: number) => {
    const showVTListSkeleton = vtLoading;
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
                <VisitorTypeList
                  visitorType={visitorType}
                  formData={formData}
                  showVTListSkeleton={showVTListSkeleton}
                  onChange={(e: any) => handleVisitorTypeChange(e)}
                />
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
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconUser size={18} />
                      Single
                    </Box>
                  }
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
                          document_type: null,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconUsers size={18} />
                      Group
                      {/* <Tooltip title="When activated, you can add more than one visitor">
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <IconInfoCircle size={16} />
                          </IconButton>
                        </Tooltip> */}
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
                          <TableCell>Fill Form Scanner</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupVisitors.map((g, index) => (
                          <TableRow key={g.id}>
                            <TableCell>
                              <CustomTextField
                                size="small"
                                fullWidth
                                name="group_name"
                                value={g.group_name}
                                placeholder="Enter group name"
                                sx={{ minWidth: '100px' }}
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
                                sx={{ minWidth: '100px' }}
                                disabled
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

                                  const visitors = groupVisitors[index]?.data_visitor;
                                  if (visitors && visitors.length > 0) {
                                    setDataVisitor(structuredClone(visitors));
                                  } else {
                                    setDataVisitor(seedDataVisitorFromSections(sectionsData));
                                  }

                                  setActiveStep(1);
                                }}
                              >
                                Visitor Form
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<IconScan size={20} />}
                                onClick={() => {
                                  setActiveGroupIdx(index);

                                  setScanSessionActive(true);
                                }}
                              >
                                Scanner
                              </Button>
                              <ScanDialog
                                open={openScan}
                                scanStep={scanStep}
                                scanSessionRef={scanSessionRef}
                                ws={ws}
                                documentType={documentType as 'ktp' | 'passport'}
                                isSingle={false}
                                onClose={() => setOpenScan(false)}
                                onConfirm={(result) => {
                                  setGroupScanPreviews((prev) => {
                                    const next = [
                                      ...prev,
                                      {
                                        id: generateUUIDv4(),
                                        documentType: result.type,
                                        data: result.data,
                                        image: result.image,
                                        selected: true,
                                      },
                                    ];
                                    return next;
                                  });
                                  scanSessionRef.current = false;
                                  setOpenScan(false);
                                  setOpenGroupPreview(true);
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Delete Group" arrow>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteGroup(g.id || '')}
                                  size="small"
                                >
                                  <IconX />
                                </IconButton>
                              </Tooltip>
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
                    </Table>
                  </TableContainer>
                  {groupVisitors.length === 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddGroup}
                      sx={{ mb: 1, mt: 1 }}
                    >
                      + Add Group
                    </Button>
                  )}
                </Box>
              )}
              {isSingle && (
                <Box mt={2}>
                  <Box display="flex" alignItems="center">
                    <CustomFormLabel
                      htmlFor="document"
                      sx={{ borderLeft: '4px solid #673ab7', pl: 1, mb: 0, mt: 0 }}
                    >
                      Capture from document
                    </CustomFormLabel>

                    <Tooltip title="You can scan document automatically using Scanner" arrow>
                      <IconButton size="small" sx={{ ml: 0.5 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box mt={1} display={'flex'} gap={1} alignItems={'center'} mb={1}>
                    <FormControl>
                      <RadioGroup
                        sx={{ display: 'flex', flexDirection: 'row !important', mt: 1 }}
                        value={documentType}
                        onChange={(e) => {
                          // console.log(e.target.value);
                          setDocumentType(e.target.value as 'ktp' | 'passport');
                        }}
                      >
                        <FormControlLabel value="ktp" control={<Radio />} label="KTP" />
                        <FormControlLabel
                          value="passport"
                          control={<Radio />}
                          label="Passport"
                          labelPlacement="end"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!documentType}
                    onClick={() => {
                      setOpenScan(true);
                      setScanStep('scanning');
                    }}
                    startIcon={<IconScan />}
                  >
                    Scanning
                  </Button>
                  <ScanDialog
                    open={openScan}
                    scanStep={scanStep}
                    documentType={documentType as 'ktp' | 'passport'}
                    isSingle={isSingle}
                    ws={ws}
                    onClose={() => setOpenScan(false)}
                    onConfirm={(result) => {
                      handleConfirmScan(result, result.type);
                      setOpenScan(false);
                    }}
                    onScanSuccess={() => {
                      setScanStep('done');
                    }}
                    forceTick={forceTick}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      );
    }

    const currentSection = sectionsData[step - 1];
    if (!currentSection) return null;

    return (
      <>
        {isSingle && (
          <Grid>
            {(() => {
              const section = sectionsData[activeStep - 1];
              const isEmployee = isEmployeeSection(section);
              const sectionType = getSectionType(section);
              if (sectionType === 'visitor_information') {
                return (
                  <>
                    <VisitorSelect
                      token={token as string}
                      isEmployee={isEmployee}
                      onSelect={(v: any) => {
                        if (!v) {
                          const clearKeys = [
                            'name',
                            'email',
                            'phone',
                            'organization',
                            'indentity_id',
                            'gender',
                            'employee',
                          ];

                          setSectionsData((prev) =>
                            prev.map((s, sIdx) =>
                              sIdx !== activeStep - 1
                                ? s
                                : updateSectionForm(s, (arr) => {
                                    return arr.map((item) =>
                                      clearKeys.includes(item.remarks)
                                        ? { ...item, answer_text: '' }
                                        : item,
                                    );
                                  }),
                            ),
                          );

                          return;
                        }

                        let genderValue: string | undefined;

                        if (v.gender === 'Male') genderValue = '1';
                        else if (v.gender === 'Female') genderValue = '0';
                        else if (v.gender === 'Prefer not to say') genderValue = '2';

                        const mapping: Record<string, string | undefined> = {
                          name: v.name,
                          email: v.email,
                          phone: v.phone,
                          organization: isEmployee ? v?.organization?.name : v.organization,
                          indentity_id: v.identity_id,
                          gender: genderValue,
                          employee: v.id,
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
                              dataVisitor.map((group, gIdx) => {
                                const page = group.question_page?.[activeStep - 1];
                                if (!page) return null;

                                return (
                                  <Accordion key={gIdx} sx={{ mb: 1 }}>
                                    <Box sx={{ position: 'relative' }}>
                                      <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                          p: 1,
                                        }}
                                      >
                                        <Typography fontWeight="bold" mb={0} mt={0}>
                                          Visitor {gIdx + 1}
                                        </Typography>
                                      </AccordionSummary>
                                      {dataVisitor.length > 1 && (
                                        <IconButton
                                          size="small"
                                          color="error"
                                          sx={{
                                            position: 'absolute',
                                            right: 50,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'red',
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGroupRow(gIdx);
                                          }}
                                        >
                                          <IconTrash color="white" />
                                        </IconButton>
                                      )}
                                    </Box>

                                    <AccordionDetails>
                                      <Box sx={{ width: '100%', mb: 2 }}>
                                        <CustomFormLabel sx={{ mt: 0 }}>Search</CustomFormLabel>
                                        <VisitorSelect
                                          token={token as string}
                                          // isEmployee={isEmployee}
                                          onSelect={(v) => handleSelectVisitor(gIdx, v)}
                                        />
                                        <CustomFormLabel>Type (Opsional)</CustomFormLabel>

                                        <CustomTextField
                                          select
                                          size="small"
                                          fullWidth
                                          // value={group.type || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            // setDataVisitor((prev) => {
                                            //   const next = [...prev];
                                            //   next[gIdx] = {
                                            //     ...next[gIdx],
                                            //     type: value,
                                            //   };
                                            //   return next;
                                            // });
                                          }}
                                        >
                                          <MenuItem value="leader">Leader</MenuItem>
                                          <MenuItem value="driver">Driver</MenuItem>
                                          <MenuItem value="staff">Staff</MenuItem>
                                          <MenuItem value="visitor">Visitor</MenuItem>
                                        </CustomTextField>
                                      </Box>

                                      {page?.form
                                        ?.filter((field: any) => {
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
                                              <CustomFormLabel required={field.mandatory === true}>
                                                {field.long_display_text}
                                              </CustomFormLabel>
                                              <RenderFieldGroup
                                                field={proxyField}
                                                index={fIdx}
                                                groupIndex={gIdx}
                                                onChange={handleChangeGroup}
                                                opts={{
                                                  showLabel: false,
                                                  uniqueKey: `${activeStep - 1}:${gIdx}:${field.custom_field_id}`,
                                                  details: page.form,
                                                }}
                                                employee={employee}
                                                allVisitorEmployee={allVisitorEmployee}
                                                sites={sites}
                                                inputValues={inputValues}
                                                setInputValues={setInputValues}
                                                selectedSiteParentIds={selectedSiteParentIdsGroup}
                                                siteTree={siteTreeGroup}
                                                setSelectedSiteParentIds={setSelectedSiteParentIds}
                                                setSiteTree={setSiteTree}
                                                buildSiteTreeWithParent={buildSiteTreeWithParent}
                                                renderTree={renderTree}
                                                activeStep={activeStep}
                                                containerRef={containerRef}
                                                uploadMethods={uploadMethods}
                                                handleUploadMethodChange={handleUploadMethodChange}
                                                handleFileChangeForField={handleFileChangeForField}
                                                handleRemoveFileForField={handleRemoveFileForField}
                                                uploadNames={uploadNames}
                                                removing={removing}
                                                setIsEmployeeMode={setIsEmployeeMode}
                                                setOpenVisitorDialog={setOpenVisitorDialog}
                                                setActiveGroupIdx={setActiveGroupIdx}
                                                fieldErrors={fieldErrors}
                                                setFieldErrors={setFieldErrors}
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

                            <Button
                              size="small"
                              onClick={handleAddDetails}
                              sx={{ my: 2 }}
                              variant="contained"
                              fullWidth
                            >
                              Add New
                            </Button>
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
                                <TableCell>
                                  <CustomFormLabel>Search</CustomFormLabel>
                                </TableCell>
                                <TableCell>
                                  <CustomFormLabel>Type (Opsional)</CustomFormLabel>
                                </TableCell>
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
                                  // const page = group.question_page[activeStep - 1];
                                  // if (!page) return null;
                                  const s = activeStep - 1;
                                  const page = group.question_page?.[s];

                                  if (!page || !Array.isArray(page.form)) return null;

                                  const form = page.form;

                                  if (!form) return;

                                  const showEmployeeSearch = isEmployeeSelected(page.form as any);
                                  return (
                                    <React.Fragment key={gIdx}>
                                      <TableRow key={gIdx}>
                                        <TableCell sx={{ minWidth: 250 }}>
                                          <VisitorSelect
                                            token={token as string}
                                            // isEmployee={isEmployee}
                                            onSelect={(v) => handleSelectVisitor(gIdx, v)}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <CustomTextField
                                            select
                                            size="small"
                                            fullWidth
                                            // value={group.type || ''}
                                            sx={{ minWidth: 160 }}
                                            onChange={(e) => {
                                              const value = e.target.value;

                                              // setDataVisitor((prev) => {
                                              //   const next = [...prev];
                                              //   next[gIdx] = {
                                              //     ...next[gIdx],
                                              //     type: value,
                                              //   };
                                              //   return next;
                                              // });
                                            }}
                                          >
                                            <MenuItem value="leader">Leader</MenuItem>
                                            <MenuItem value="driver">Driver</MenuItem>
                                            <MenuItem value="staff">Staff</MenuItem>
                                            <MenuItem value="visitor">Visitor</MenuItem>
                                          </CustomTextField>
                                        </TableCell>
                                        {form
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
                                              <>
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
                                                      // uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                                      uniqueKey: `${activeStep - 1}:${gIdx}:${field.custom_field_id}`,
                                                    }}
                                                    employee={employee}
                                                    allVisitorEmployee={allVisitorEmployee}
                                                    sites={sites}
                                                    inputValues={inputValues}
                                                    setInputValues={setInputValues}
                                                    selectedSiteParentIds={
                                                      selectedSiteParentIdsGroup
                                                    }
                                                    siteTree={siteTreeGroup}
                                                    setSelectedSiteParentIds={
                                                      setSelectedSiteParentIds
                                                    }
                                                    setSiteTree={setSiteTree}
                                                    buildSiteTreeWithParent={
                                                      buildSiteTreeWithParent
                                                    }
                                                    renderTree={renderTree}
                                                    activeStep={activeStep}
                                                    containerRef={containerRef}
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
                                                    fieldErrors={fieldErrors}
                                                    setFieldErrors={setFieldErrors}
                                                  />
                                                </TableCell>
                                              </>
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
                const visitor = dataVisitor[0];
                if (!visitor) return null;

                const pIdx = visitor.question_page.findIndex((p) =>
                  p.name.toLowerCase().includes('purpose visit'),
                );
                if (pIdx < 0) return null;

                const page = visitor.question_page[pIdx];

                return (
                  <Box sx={{ mb: 3 }}>
                    <Table>
                      <TableBody>
                        {renderDetailRows(
                          page.form,
                          (idx: number, fieldKey: any, value: any) => {
                            setDataVisitor((prev) => {
                              const next = [...prev];

                              next.forEach((v) => {
                                const pvPage = v.question_page[pIdx];
                                if (!pvPage?.form) return;

                                pvPage.form[idx] = {
                                  ...pvPage.form[idx],
                                  [fieldKey]: value,
                                };
                              });

                              return next;
                            });
                          },
                          String(activeGroupIdx),
                        )}
                      </TableBody>
                    </Table>
                  </Box>
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

      await Promise.all(
        urls.map((u) =>
          axiosInstance2
            .delete(`/cdn${u}`)
            .then(() => {})
            .catch((err) => {}),
        ),
      );

      setDataVisitor((prev) => prev.filter((_, i) => i !== rowIdx));

      setActiveGroupIdx((prevIdx) => {
        if (rowIdx < prevIdx) return prevIdx - 1;
        if (rowIdx === prevIdx) return Math.max(0, prevIdx - 1);
        return prevIdx;
      });
    } catch (e) {}
  };

  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});

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

      if (!fileUrl) return null;

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

      const path = await uploadFileToCDN(file);
      if (path) onChange(idx, 'answer_file', path);

      e.target.value = '';
    };

  const makeCdnUrl = (rel?: string | null) => {
    if (!rel) return null;
    if (/^(data:|blob:|https?:\/\/)/i.test(rel)) return rel;
    const r = rel.startsWith('/') ? rel : `/${rel}`;
    return r.startsWith('/cdn/') ? `${BASE_URL}${r}` : `${BASE_URL}/cdn${r}`;
  };

  const getPreviewSrc = (key: string, answerFile?: string) => {
    if (answerFile) {
      const lower = answerFile.toLowerCase();
      const isImg =
        /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(lower) ||
        /^data:image\//.test(lower) ||
        /^blob:/.test(lower) ||
        /^https?:\/\//.test(lower) ||
        lower.startsWith('/');

      if (isImg) return makeCdnUrl(answerFile);
    }

    if (previews[key]) return previews[key];

    return null;
  };

  const fileNameFromAnswer = (answerFile?: string) => {
    if (!answerFile) return '';
    try {
      const url = new URL(makeCdnUrl(answerFile)!);
      // console.log('url', url);
      return url.pathname.split('/').pop() || '';
    } catch {
      return String(answerFile).split('/').pop() || '';
    }
  };

  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
    fullscreenHandle?: any,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

    e.target.value = '';
  };

  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string,
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        await axiosInstance2.delete(`/cdn${currentUrl}`);
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
  const [siteTreeGroup, setSiteTreeGroup] = useState<Record<string, any[]>>({});

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
  const [selectedSiteParentIdsGroup, setSelectedSiteParentIdsGroup] = useState<
    Record<string, string[]>
  >({});
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const toCsv = (ids: string[]) => ids.join(',');

  const collectAllChildIds = (node: any): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((child: any) => [child.id, ...collectAllChildIds(child)]);
  };

  const renderTree = (
    node: any,
    index: number,
    field: FormVisitor,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
  ) => {
    const currentIds =
      typeof field.answer_text === 'string' && field.answer_text.length
        ? field.answer_text.split(',')
        : [];

    const checked = currentIds.includes(node.id);

    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              size="small"
              checked={checked}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const isChecked = e.target.checked;
                let updated = [...currentIds];

                if (isChecked) {
                  if (!updated.includes(node.id)) updated.push(node.id);
                } else {
                  updated = updated.filter((id) => id !== node.id);
                }

                onChange(index, 'answer_text', updated.join(','));
              }}
            />
            <Typography variant="body2">{node.name}</Typography>
          </Box>
        }
      >
        {node.children?.map((child: any) => renderTree(child, index, field, onChange))}
      </TreeItem>
    );
  };

  const [inputValuesGroup, setInputValuesGroup] = useState<Record<string, string>>({});

  const getVisibilityMap = (details: any[]) => {
    const getFlag = (key: string) => {
      const field = details.find((f: any) => f.remarks?.toLowerCase() === key);

      if (!field) return false;

      const val = field.answer_text;

      if (Array.isArray(val)) {
        return val.some((v) => ['true', '1', 'yes'].includes(String(v).toLowerCase()));
      }

      return ['true', '1', 'yes', 'true'].includes(String(val).toLowerCase());
    };

    const isDriving = getFlag('is_driving');
    const isEmployee = getFlag('is_employee');

    return {
      vehicle_type: isDriving,
      vehicle_plate: isDriving,
      employee: isEmployee,
    };
  };

  const validateField = (item: any, key: string, errors: Record<string, string>) => {
    const label = item.long_display_text || item.remarks || 'This field';

    const isEmptyText =
      item.answer_text === null ||
      item.answer_text === undefined ||
      (typeof item.answer_text === 'string' && item.answer_text.trim() === '') ||
      (Array.isArray(item.answer_text) && item.answer_text.length === 0);

    const isEmptyFile = !item.answer_file;
    const isEmptyDate = !item.answer_datetime;

    switch (item.field_type) {
      case 10:
      case 11:
      case 12:
        if (isEmptyFile) errors[key] = `${label} is required`;
        break;

      case 8:
      case 9:
        if (isEmptyDate) errors[key] = `${label} is required`;
        break;

      default:
        if (isEmptyText) errors[key] = `${label} is required`;
        break;
    }
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = () => {
    if (activeStep === 0) return true;

    const errors: Record<string, string> = {};

    if (isGroup) {
      dataVisitor.forEach((visitor, gIdx) => {
        const page = visitor.question_page?.[activeStep - 1];
        if (!page?.form) return;

        const details = page.form;
        const visibilityMap: any = getVisibilityMap(details);

        details.forEach((item: any, fIdx: number) => {
          if (!item?.mandatory) return;

          const remark = (item.remarks || '').toLowerCase();
          // console.log('[validateCurrentStep] remark:', remark);
          const isVisible = visibilityMap.hasOwnProperty(remark) ? visibilityMap[remark] : true;
          // console.log('[validateCurrentStep] isVisible:', isVisible);
          if (!isVisible) return;

          const key = `${activeStep - 1}:${gIdx}:${item.custom_field_id}`;

          validateField(item, key, errors);
        });
      });
    } else {
      const section = sectionsData[activeStep - 1];
      const details = formsOf(section);

      const visibilityMap: any = getVisibilityMap(details);

      details.forEach((item: any, index: number) => {
        if (!item?.mandatory) return;

        const remark = (item.remarks || '').toLowerCase();
        const isVisible = visibilityMap.hasOwnProperty(remark) ? visibilityMap[remark] : true;

        if (!isVisible) return;

        // const key = `${activeStep - 1}:${index}`;
        const key = `${activeStep - 1}:${item.id}`;

        validateField(item, key, errors);
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const renderDetailRows = (
    details: FormVisitor[] | any,
    onChange: (index: number, field: keyof FormVisitor, value: any) => void,
    groupIdx?: string | undefined,
  ) => {
    if (!Array.isArray(details)) {
      console.error('Expected array for details, but got:', details);
      return (
        <TableRow>
          <TableCell colSpan={5}>Invalid data format</TableCell>
        </TableRow>
      );
    }

    const visibilityMap: any = getVisibilityMap(details);
    const filteredDetails = details.filter((item, i) => {
      const remark = (item.remarks || '').toLowerCase();
      const visible = visibilityMap.hasOwnProperty(remark) ? visibilityMap[remark] : true;

      if (!visible && item.answer_text) {
        onChange(i, 'answer_text', '');
      }

      return visible;
    });

    const handleSitePlaceChange = (idx: number, field: keyof FormVisitor, value: any) => {
      onChange(idx, field, value);
    };

    const startField = details.find(
      (f) => (f.remarks || '').toLowerCase() === 'visitor_period_start',
    );

    const startDate = startField?.answer_datetime ? dayjs(startField.answer_datetime) : null;

    return filteredDetails.map((item: any, index: any) => {
      // const key = `${activeStep - 1}:${index}`;
      const key = `${activeStep - 1}:${item.id}`;
      const previewSrc = getPreviewSrc(key, (item as any).answer_file);
      const shownName = uploadNames[key] || fileNameFromAnswer((item as any).answer_file);
      const siteKey = `${activeStep - 1}:${groupIdx}:${index}`;
      const errorMessage = fieldErrors[key];

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
                          if (newInputValue) clearFieldError(key);
                        }}
                        renderInput={(params) => (
                          <CustomTextField
                            {...params}
                            placeholder="Choose or write manually agenda"
                            fullWidth
                            error={!!errorMessage}
                            helperText={errorMessage}
                          />
                        )}
                      />
                    );
                  }
                  return (
                    <CustomTextField
                      size="small"
                      value={item.answer_text}
                      onChange={(e) => {
                        onChange(index, 'answer_text', e.target.value);
                        if (e.target.value) clearFieldError(key);
                      }}
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
                      error={!!errorMessage}
                      helperText={errorMessage}
                    />
                  );
                case 1: // Number
                  return (
                    <CustomTextField
                      type="number"
                      size="small"
                      value={item.answer_text}
                      onChange={(e) => {
                        onChange(index, 'answer_text', e.target.value);
                        if (e.target.value) clearFieldError(key);
                      }}
                      placeholder="Enter your number"
                      fullWidth
                      error={!!errors[item.remarks]}
                      helperText={errors[item.remarks]}
                    />
                  );
                case 2: // Email
                  return (
                    <CustomTextField
                      type="email"
                      size="small"
                      value={item.answer_text ?? ''}
                      onChange={(e) => {
                        onChange(index, 'answer_text', e.target.value);
                        if (e.target.value) clearFieldError(key);
                      }}
                      placeholder={item.remarks === 'email' ? '' : ''}
                      fullWidth
                      error={!!errorMessage}
                      helperText={errorMessage}
                    />
                  );

                case 3: {
                  let options: { value: string; name: string; disabled?: boolean }[] = [];

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
                          inputValue={inputValuesGroup[siteKey as any] || ''}
                          value={options.filter((opt) =>
                            (selectedSiteParentIdsGroup[siteKey] || []).includes(opt.value),
                          )}
                          onInputChange={(_, newInputValue, reason) => {
                            if (reason !== 'input') return;

                            setInputValuesGroup((prev) => ({
                              ...prev,
                              [siteKey]: newInputValue,
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
                          onChange={(_, newValues) => {
                            const parentIds = newValues.map((v) => v.value);

                            setSelectedSiteParentIdsGroup((prev) => ({
                              ...prev,
                              [siteKey]: parentIds,
                            }));

                            setInputValuesGroup((prev) => ({
                              ...prev,
                              [siteKey]: '',
                            }));

                            const trees = parentIds.flatMap((pid) =>
                              buildSiteTreeWithParent(sites, pid),
                            );

                            setSiteTreeGroup((prev) => ({
                              ...prev,
                              [siteKey]: trees,
                            }));
                            // onChange(index, 'answer_text', parentIds.join(','));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Enter at least 3 characters to search"
                              fullWidth
                              error={!!errorMessage}
                              helperText={errorMessage}
                            />
                          )}
                        />
                        {item.remarks === 'site_place' && siteTreeGroup[siteKey]?.length > 0 && (
                          <SimpleTreeView>
                            {siteTreeGroup[siteKey].map((node) =>
                              renderTree(node, index, item, handleSitePlaceChange),
                            )}
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
                        if (selectedValue) clearFieldError(key);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Enter at least 3 characters to search"
                          fullWidth
                          error={!!errorMessage}
                          helperText={errorMessage}
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
                        format="dddd, DD  MMMMM YYYY, HH:mm"
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
                    <>
                      <FormControl component="fieldset" error={!!errorMessage}>
                        <RadioGroup
                          value={String(item.answer_text)}
                          onChange={(e) => {
                            onChange(index, 'answer_text', e.target.value);
                            if (e.target.value) clearFieldError(key);
                          }}
                          sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                        >
                          {(item.multiple_option_fields || [])

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
                      <br />
                      {errorMessage && (
                        <Typography variant="caption" color="error">
                          {errorMessage}
                        </Typography>
                      )}
                    </>
                  );

                case 6: // Checkbox
                  return (
                    <>
                      <FormControl error={!!errorMessage}>
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
                                      // console.log(newValue);
                                      onChange(index, 'answer_text', newValue);
                                    }}
                                  />
                                }
                                label={label}
                              />
                            );
                          })}
                        </FormGroup>
                      </FormControl>
                      <br />
                      {errorMessage && (
                        <Typography variant="caption" color="error">
                          {errorMessage}
                        </Typography>
                      )}
                    </>
                  );
                case 8: // TimePicker
                  return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={item.answer_datetime ? dayjs(item.answer_datetime, 'HH:mm') : null}
                        onChange={(newValue) => {
                          const utcTime = newValue?.utc().format('HH:mm');
                          onChange(index, 'answer_datetime', utcTime);
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                          },
                          popper: {
                            container: containerRef.current,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  );
                case 9:
                  return (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                      <DateTimePicker
                        value={item.answer_datetime ? dayjs(item.answer_datetime) : null}
                        ampm={false}
                        minDateTime={
                          item.remarks === 'visitor_period_end' && startDate ? startDate : undefined
                        }
                        onChange={(newValue) => {
                          if (newValue) {
                            const utc = newValue.utc().format();
                            onChange(index, 'answer_datetime', utc);
                          }
                        }}
                        format="dddd, DD MMMM YYYY, HH:mm"
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errorMessage,
                            helperText: errorMessage,
                          },
                          popper: {
                            container: containerRef.current,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  );

                case 10:
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
                              // (url) => onChange(index, 'answer_file', url),
                              (url) => {
                                onChange(index, 'answer_file', url);
                                if (url) clearFieldError(key);
                              },
                              key,
                            )
                          }
                        />
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
                                    width: 350,
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                  }}
                                />
                                <Button
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
                                </Button>
                              </Box>
                            ) : (
                              <></>
                            )}
                          </Box>
                        )}
                      </Box>

                      {errorMessage && (
                        <Typography color="error" variant="caption" display="block" mt={1}>
                          {errorMessage}
                        </Typography>
                      )}

                      <Dialog
                        open={openCamera}
                        onClose={() => setOpenCamera(false)}
                        maxWidth="md"
                        fullWidth
                        disablePortal
                      >
                        <Box sx={{ p: 3 }}>
                          <Box>
                            <Typography variant="h6" mb={2}>
                              Take Photo From Camera
                            </Typography>
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
                              startIcon={<IconTrash />}
                              color="error"
                              sx={{ mr: 1 }}
                            >
                              Clear Foto
                            </MuiButton>
                            <MuiButton
                              variant="contained"
                              startIcon={<IconCamera />}
                              onClick={() =>
                                handleCaptureForField(
                                  (url) => onChange(index, 'answer_file', url),
                                  key,
                                )
                              }
                            >
                              Take Foto
                            </MuiButton>
                            <MuiButton
                              startIcon={<IconDeviceFloppy />}
                              onClick={() => setOpenCamera(false)}
                              sx={{ ml: 1 }}
                            >
                              Submit
                            </MuiButton>
                          </Box>
                        </Box>
                      </Dialog>
                    </Box>
                  );

                case 11: {
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
                        {(previewSrc || shownName) && (
                          <Box
                            mt={2}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            {previewSrc ? (
                              <>
                                <img
                                  src={previewSrc}
                                  alt="preview"
                                  style={{
                                    width: 350,
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
                                      key,
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
                          // onChange={(e) => {
                          //   handlePDFUploadFor(index, onChange)(e);
                          //   // reenterFullscreen();
                          // }}
                          onChange={(e) =>
                            handlePDFUploadFor(index, (idx, field, url) => {
                              onChange(idx, field, url);
                              if (url) clearFieldError(key);
                            })(e)
                          }
                        />
                      </Box>
                      {errorMessage && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          {errorMessage}
                        </Typography>
                      )}
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
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Upload File
                        </Typography>

                        <Typography variant="caption" color="textSecondary">
                          Supports: JPG, JPEG, PNG, Up to
                          <span style={{ fontWeight: '700' }}> 100KB</span>
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
                              (url) => {
                                onChange(index, 'answer_file', url);
                                if (url) clearFieldError(key);
                              },
                              key,
                              // fullscreenHandle,
                            )
                          }
                        />
                        {(previewSrc || shownName) && (
                          <Box
                            mt={2}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            {previewSrc ? (
                              <>
                                <img
                                  src={previewSrc}
                                  alt="preview"
                                  style={{
                                    width: 350,
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
                                      key,
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

                      {errorMessage && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          {errorMessage}
                        </Typography>
                      )}

                      <Dialog
                        open={openCamera}
                        onClose={() => setOpenCamera(false)}
                        maxWidth="md"
                        fullWidth
                        container={containerRef.current}
                      >
                        <Box sx={{ p: 3 }}>
                          <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            mb={1}
                          >
                            <Typography variant="h6" mb={0}>
                              Take Photo From Camera
                            </Typography>
                            <IconButton onClick={() => setOpenCamera(false)}>
                              <IconX />
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
                              color="error"
                              sx={{ mr: 1 }}
                              startIcon={<IconTrash />}
                            >
                              Clear Foto
                            </MuiButton>
                            <MuiButton
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCaptureForField((url) => onChange(index, 'answer_file', url));
                              }}
                              startIcon={<IconCamera />}
                            >
                              Take Foto
                            </MuiButton>
                            <MuiButton
                              startIcon={<IconDeviceFloppy />}
                              onClick={() => setOpenCamera(false)}
                              sx={{ ml: 1 }}
                            >
                              Submit
                            </MuiButton>
                          </Box>
                        </Box>
                      </Dialog>
                    </Box>
                  );
                }
                default:
                  return (
                    <CustomTextField
                      size="small"
                      value={item.long_display_text}
                      onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
                      placeholder="Enter value"
                      fullWidth
                      error={!!errorMessage}
                      helperText={errorMessage}
                    />
                  );
              }
            })()}
          </TableCell>
        </TableRow>
      );
    });
  };

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

    // ambil nilai jawaban (kalau ada)
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
      registered_site_id?: string;
      group_code?: string;
      group_name?: string;
    },
  ) {
    const sharedPVIdx = indexBy(groupedPages.single_page || []);
    const batchIdx = indexBy(Object.values(groupedPages.batch_page || {}));

    const materialRows = rows?.length ? rows : [fakeRowFromBatchPage(groupedPages.batch_page)];

    const outRows = materialRows.map((row, rowIdx) => {
      const rowForms = flattenRowForms(row);
      const rowIdxMap = indexBy(rowForms);

      const question_page = rawSections.map((section: any, sIdx: number) => {
        const formsTpl = formsOf(section);

        const form = formsTpl.map((tpl: any, fIdx: number) => {
          const r = sanitize(tpl?.remarks);
          const cf = tpl?.custom_field_id;

          let pick: any;

          if (isPurposeVisit(section)) {
            pick = (r && rowIdxMap.byRemarks.get(r)) || (cf && rowIdxMap.byCF.get(cf)) || undefined;
          } else {
            // normal section
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
          // self_only: !!rowSelfOnly,
          self_only: false,
          foreign_id: asStr(section.foreign_id),
          form,
        };
      });
      // console.log('question_page:', question_page);

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
      basePayload.registered_site_id = meta.registered_site_id || '';
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
          [10, 11, 12].includes(f.field_type) ? { ...f, answer_file: null } : f,
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

        const normalizeFileValue = (val: any): string | null => {
          if (val === undefined || val === null) return null;
          if (typeof val === 'string') {
            const trimmed = val.trim();
            return trimmed === '' ? null : trimmed;
          }
          return String(val);
        };

        switch (base.field_type) {
          case 9: // Date/Datetime
            if (typeof field.answer_datetime === 'string') {
              base.answer_datetime = dayjs(field.answer_datetime).utc().toISOString();
            }
            break;

          case 10:
          case 11:
          case 12:
            // base.answer_file = safeTrim(field.answer_file);
            base.answer_file = normalizeFileValue(field.answer_file);
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

      const baseMeta = {
        visitor_type: formData.visitor_type ?? '',
        type_registered: TYPE_REGISTERED,
        tz: tz,
        is_group: isGroup,
        flow: TYPE_REGISTERED === 0 ? 'Praregister' : 'Invitation',
        visitor_role: 'Visitor',
        // ...(TYPE_REGISTERED !== 0 && { registered_site_id: registeredSite ?? '' }),
        registered_site_id: registeredSite ?? '',
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
              registered_site_id: registeredSite ?? '',
            },
          );

          const syncedVisitors = syncPurposeVisitToAllVisitors(built.data_visitor ?? []);
          const cleanDataVisitor = (syncedVisitors ?? []).map((dv: any) => ({
            ...dv,
            question_page: (dv.question_page ?? []).map((qp: any, sIdx: number) => ({
              id: qp.id || qp.Id || rawSections?.[sIdx]?.Id || generateUUIDv4(),
              sort: qp.sort ?? sIdx,
              name: qp.name ?? `Section ${sIdx + 1}`,
              status: qp.status ?? 0,
              is_document: qp.is_document ?? false,
              can_multiple_used: qp.can_multiple_used ?? false,
              foreign_id: qp.foreign_id ?? '',
              self_only: qp.self_only ?? false,
              form: (qp.form ?? []).map(({ id, Id, ...rest }: any) => rest),
            })),
            //  special_visitor: '',
          }));

          return {
            group_name: g.group_name ?? '',
            group_code: g.group_code ?? '',
            is_group: true,
            visitor_type: formData.visitor_type ?? '',
            tz: tz,
            registered_site_id: registeredSite ?? '',
            type_registered: TYPE_REGISTERED,
            data_visitor: cleanDataVisitor,
          };
        });

        payload = { list_group };

        const parsed = CreateGroupVisitorRequestSchema.parse(payload);
        // console.log('🚀 Final Payload (Group):', JSON.stringify(parsed, null, 2));

        // // Submit ke endpoint group
        const submitFn =
          TYPE_REGISTERED === 0 ? createPraRegisterGroupOperator : createVisitorsGroupOperator;
        const backendResponse = await submitFn(token, parsed as any);
        // console.log('Payload', backendResponse);
        // toast('Group visitor created successfully.', 'success');
        showSwal('success', 'Group visitor created successfully.', 3000);
        resetMediaState();
        clearAnswerFiles();
      }

      //  SINGLE MODE
      else {
        if (!sectionsData.length) {
          toast('Minimal isi 1 data visitor.', 'warning');
          return;
        }

        const question_page = sectionsData.map((section, sIdx) => ({
          id: section.id?.toString() || section.Id?.toString() || sIdx.toString(),
          sort: section.sort ?? sIdx,
          name: section.name,
          status: section.status ?? 0,
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
        console.log('payload', payload);

        const parsed = CreateVisitorRequestSchema.parse(payload);
        console.log('Final Payload (Single):', JSON.stringify(parsed, null, 2));

        const submitFn =
          TYPE_REGISTERED === 0 ? createSinglePraRegisterOperator : createSingleInvitationOperator;
        const backendResponse = await submitFn(token, parsed);
        // console.log('Payload Single:', backendResponse);

        const successMessage =
          TYPE_REGISTERED === 0
            ? 'Pre-registration created successfully.'
            : 'Invitation Visitor created successfully.';

        showSwal('success', successMessage, 3000);
        const invitationCode =
          (backendResponse?.collection?.visitors?.[0] as { invitation_code?: string })
            ?.invitation_code ?? null;
        resetMediaState();
        clearAnswerFiles();

        console.log('invitationCode', invitationCode);

        if (invitationCode) {
          onInvitationCreated?.(invitationCode);
        }
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
      }, 500);
    } catch (err: any) {
      setTimeout(() => {
        setLoading(false);
        setNextDialogOpen(false);
      }, 700);

      toast('Failed to create visitor.', 'error');

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

  const handleAddDetails = () => {
    if (!isGroup) {
      handleAddDetail(FORM_KEY);
      return;
    }

    setDataVisitor((prev) => {
      if (!prev.length) return prev;

      const source = prev[prev.length - 1];

      const clone = {
        ...source,
        question_page: source.question_page
          .filter((p) => !p.name.toLowerCase().includes('purpose visit'))
          .map((page) => ({
            ...page,
            form: (page.form ?? []).map((f: any) => ({
              ...f,
              answer_text: '',
              answer_datetime: '',
              answer_file: '',
            })),
          })),
      };

      const next = [...prev, clone];
      setActiveGroupIdx(next.length - 1);
      return next;
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setActiveStep((prev) => prev + 1);
  };
  const handleSaveGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    handleSaveGroupVisitor();
    toast('Group form saved successfully.', 'success');
    setActiveStep(0);
  };

  const asStr = (v: any) => (v == null ? '' : String(v));

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

  const hasAns = (f: any) => !!(f?.answer_text || f?.answer_datetime || f?.answer_file);

  const buildGroupedPages = (sections: any[] = []): GroupedPages => {
    const single_page: any[] = [];
    const batch_page: Record<string, any> = {};

    sections.forEach((section) => {
      const forms = formsOf(section);
      if (isPurposeVisit(section)) {
        if (!section?.self_only) {
          forms.forEach((f: any, idx: number) => {
            const existing = (section.form_answers || []).find((ans: any) => sameField(ans, f));
            single_page.push(existing ? { ...f, ...existing } : cloneFormWithEmptyAnswers(f, idx));
          });
        }

        return;
      }

      if (!section?.is_document) {
        forms.forEach((f: any, idx: number) => {
          const formId = (f as any)?.id ?? (f as any)?.Id ?? idx;
          const secForeign = (section as any)?.foreign_id ?? (section as any)?.foreign_id ?? null;
          const formForeign = (f as any)?.foreign_id ?? (f as any)?.foreign_id ?? null;
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

    return docs.flatMap((section) =>
      (formsOf(section) || [])
        .map((f, i) => ({
          ...f,
          remarks: sanitizeRemarks(f.remarks),
          sort: f.sort ?? i,
          foreign_id: f.foreign_id ?? section.foreign_id ?? section.id ?? section.Id ?? null,
        }))
        .filter((f) => DOC_REMARKS.has(f.remarks)),
    );
  };

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

            return [...docsWithSort, ...base, ...extraWithSort];
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

  const activeVisitorType = visitorType?.find((vt: any) => vt.id === formData.visitor_type);

  const documentNameMap: Record<string, string> = {
    ktp: 'KTP',
    passport: 'Passport',
    selfie: 'Selfie Image',
  };

  const getDocumentIdByType = (documentType: string) => {
    const docName = documentNameMap[documentType];
    return activeVisitorType?.visitor_type_documents?.find((d: any) => d.document_name === docName)
      ?.document_id;
  };

  useEffect(() => {
    const fetchVisitorTypeDetails = async () => {
      const res = visitorType.find((vt: any) => vt.id === formData.visitor_type);
      const resVisitorType = await getVisitorTypeById(
        token as string,
        formData.visitor_type as string,
      );

      let sections = resVisitorType?.collection?.section_page_visitor_types ?? [];

      if (TYPE_REGISTERED === 0 || FORM_KEY === 'pra_form') {
        sections = sections.filter((s: any) => (s.pra_form || []).length > 0);
      }

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
    };

    fetchVisitorTypeDetails();
  }, [formData.visitor_type, visitorType]);

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

  const handleTogglePreview = (id: string) => {
    setGroupScanPreviews((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    );
  };

  const handleApplyGroupScan = async () => {
    const selected = groupScanPreviews.filter((p) => p.selected);
    if (!selected.length) return;

    setIsGroupScanning(true);
    setOpenGroupPreview(false);

    const uploadedMap = new Map<string, string>();

    for (const scan of selected) {
      const base64 = scan.image?.base64;
      if (!base64) continue;

      const cdnUrl = await uploadScannerImageBase64(base64, scan.documentType);

      if (cdnUrl) {
        uploadedMap.set(scan.image!.fileName, cdnUrl);
      }
    }

    setGroupScanPreviews((prev) =>
      prev.map((p) =>
        p.image && uploadedMap.has(p.image.fileName)
          ? {
              ...p,
              image: {
                ...p.image,
                cdn_url: uploadedMap.get(p.image.fileName),
              },
            }
          : p,
      ),
    );

    const grouped = selected.reduce<Record<'ktp' | 'passport', string[]>>(
      (acc, cur) => {
        const type = cur.documentType as 'ktp' | 'passport';
        if (cur.image?.fileName) {
          acc[type].push(cur.image.fileName);
        }
        return acc;
      },
      { ktp: [], passport: [] },
    );

    if (grouped.ktp.length) {
      ws.send({
        cmd: 'send',
        doc_type: 'ktp',
        action_type: 'group',
        images: grouped.ktp,
      });
    }

    if (grouped.passport.length) {
      ws.send({
        cmd: 'send',
        doc_type: 'passport',
        action_type: 'group',
        images: grouped.passport,
      });
    }
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep > activeStep) {
      if (!validateCurrentStep()) return;
    }

    setActiveStep(targetStep);
  };

  return (
    <PageContainer title="Operator View" description="this is operator view">
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
                        flexWrap: 'nowrap',
                        justifyContent: 'flex-start',
                        '& .MuiStep-root': {
                          flex: '1 1 0',
                        },
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textWrap: 'wrap',
                          textAlign: 'center',
                        },
                        '& .MuiStepIcon-root': {
                          width: 30,
                          height: 30,
                        },
                      }}
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
                          // onClick={() => setActiveStep(0)}
                          onClick={() => handleStepChange(0)}
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
              borderTop: '1px solid #ddd',
            }}
          >
            <MuiButton
              disabled={activeStep === 0}
              onClick={(e) => {
                e.stopPropagation();
                setActiveStep((prev) => prev - 1);
                setWsPayload(null);
                setOpenGroupPreview(false);
              }}
              startIcon={<IconArrowLeft width={18} />}
            >
              Back
            </MuiButton>

            {isGroup ? (
              isLastStep ? (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading || !formData.visitor_type}
                  onClick={handleSaveGroup}
                >
                  {loading ? 'Saving Group' : 'Save Group'}
                </Button>
              ) : activeStep === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOnSubmit}
                  disabled={
                    loading
                    // ||
                    // groupVisitors.length === 0 ||
                    // groupVisitors.every((g) => !g.data_visitor || g.data_visitor.length === 0)
                  }
                >
                  Submit All
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<IconArrowRight width={18} />}
                >
                  Next
                </Button>
              )
            ) : isLastStep ? (
              <Button
                variant="contained"
                color="primary"
                disabled={
                  loading ||
                  !formData.visitor_type ||
                  formData.is_group === null ||
                  formData.is_group === undefined
                }
                onClick={handleOnSubmit}
              >
                Submit
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<IconArrowRight width={18} />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>

      {/* Group Preview */}
      <GroupScanPreviewDialog
        open={openGroupPreview}
        data={groupScanPreviews}
        onClose={resetGroupScanState}
        onChangeType={handleChangeDocumentType}
        onToggle={handleTogglePreview}
        onApply={handleApplyGroupScan}
      />

      {/* Scanning Dialog */}
      <Dialog open={isGroupScanning} fullWidth maxWidth="sm">
        <DialogTitle>Scanning Document</DialogTitle>
        <DialogContent>
          <ScanContainer>
            <ScanIcon size={48} />
            <Typography variant="h6">Scanning document...</Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait a moment
            </Typography>
            <LinearProgress style={{ width: 220 }} />
          </ScanContainer>
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
          sx={{ zIndex: 999999 }}
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

export default FormWizardAddVisitor;
