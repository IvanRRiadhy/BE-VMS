import React, {  useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  MobileStepper,
  Paper,
  Portal,
  Radio,
  RadioGroup,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import {
  IconArrowLeft,
  IconArrowRight,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import VisitorTypeList from '../../admin/content/AdminView/VisitorTypeList';
import { Box, useMediaQuery } from '@mui/system';
import {
  CreateGroupVisitorRequestSchema,
  CreateVisitorRequestSchema,
  FormVisitor,
  SectionPageVisitor,
} from 'src/customs/api/models/Admin/Visitor';
import { axiosInstance2, BASE_URL } from 'src/customs/api/interceptor';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import Webcam from 'react-webcam';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment-timezone';
import { useSession } from 'src/customs/contexts/SessionContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem } from '@mui/material';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import RenderDetailRows from './components/RenderDetailRows';
import { showSwal } from 'src/customs/components/alerts/alerts';
import {
  createSubmitGroupShareLink,
  createSubmitShareLink,
  getPublicVisitorType,
  getPublicVisitorTypeById,
} from 'src/customs/api/Public';
import PreviewDialog from './components/PreviewDialog';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const FormSelfPraregistration = ({
  invitation = {},
  code = '',
  timestamp,
  sites,
  employee,
  allVisitorEmployee,
}: {
  invitation?: any;
  code?: string;
  timestamp?: any;
  sites?: any;
  employee?: any;
  allVisitorEmployee?: any;
}) => {
  const THEME = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(THEME.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [draggableSteps, setDraggableSteps] = useState<string[]>([]);
  const stepLabels = useMemo(() => ['User Type', ...draggableSteps], [draggableSteps]);
  const [vtLoading, setVtLoading] = useState(false);
  const [isSingle, setIsSingle] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);
  const totalSteps = 1 + draggableSteps.length;
  const isLastStep = activeStep === totalSteps - 1;
  const { token } = useSession();
  const [formData, setFormData] = useState<any>({});
  const [dynamicSteps, setDynamicSteps] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawSections, setRawSections] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<any>(null);
  const [previewSections, setPreviewSections] = useState<any>(null);
  // const [siteTree, setSiteTree] = useState<any[]>([]);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [dataVisitor, setDataVisitor] = useState<{ question_page: SectionPageVisitor[] }[]>([]);
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const [groupedPages, setGroupedPages] = useState<any>({
    single_page: [],
    batch_page: {},
  });

  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [selectedSiteParentIds, setSelectedSiteParentIds] = useState<string[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor; // 'success' | 'info' | 'warning' | 'error'
  }>({ open: false, message: '', severity: 'info' });

  // const FORM_KEY: 'visit_form' | 'pra_form' = formKey;
  const FORM_KEY = 'visit_form';
  const TYPE_REGISTERED: 0 | 1 = FORM_KEY === 'visit_form' ? 1 : 0;

  const DEFAULT_VFT = FORM_KEY === 'visit_form' ? 1 : 0;

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
      // out.answer_datetime = dayjs(ans.answer_datetime).toISOString();
    } else if ([10, 11, 12].includes(tpl.field_type) && ans?.answer_file) {
      out.answer_file = ans.answer_file;
    } else if (ans?.answer_text) {
      out.answer_text = ans.answer_text;
    }

    return out;
  };

  // helpers
  const sanitize = (v?: string | null) => (v ?? '').trim().toLowerCase();

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
            pick =
              (r && sharedPVIdx.byRemarks.get(r)) || (cf && sharedPVIdx.byCF.get(cf)) || undefined;
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
          self_only: false,
          foreign_id: asStr(section.foreign_id),
          form,
        };
      });
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

  const resetMediaState = () => {
    setPreviews({});
    setUploadNames({});

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetSingleFormState = () => {
    resetMediaState();
    clearAnswerFiles();
    setFieldErrors({});
    setActiveStep(0);

    setPreviewPayload(null);
    setPreviewSections(null);
    setPreviewOpen(false);

    // reset state UI
    setInputValues({});
    setSelectedSiteParentIds([]);
    setSelectedSiteIds([]);
    // setSiteTree([]);
    setSectionsData(rawSections);
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

  const resetGroupFormState = () => {
    resetMediaState();
    clearAnswerFiles();
    setFieldErrors({});
    setActiveStep(0);
    setPreviewPayload(null);
    setPreviewSections(null);
    setPreviewOpen(false);
    setGroupVisitors([]);
    setDataVisitor([]);
    const groupSections = buildGroupSections(rawSections);

    setSectionsData(groupSections);
    setDraggableSteps(groupSections.map((s) => s.name));

    seedDataVisitorFromSections(groupSections);
    setGroupedPages(buildGroupedPages(groupSections));
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!token) return;
    try {
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

        switch (base.field_type) {
          case 9: // Date/Datetime
            if (field.answer_datetime) {
              base.answer_datetime = dayjs.utc(field.answer_datetime).toISOString();
            }
            break;

          case 10:
          case 11:
          case 12: // File upload
            const file = safeTrim(field.answer_file);
            base.answer_file = file ? file : null;
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
        flow: 'InvitationShareLink',
        // visitor_role: 'Visitor',
        // ...(TYPE_REGISTERED !== 0 && { registered_site: formData.registered_site ?? '' }),
      };

      // let payload: CreateVisitorRequest | CreateGroupVisitorRequest;
      let payload;

      if (isGroup) {
        const totalVisitors = groupVisitors.reduce((sum, g) => {
          const visitors = g.data_visitor?.length ? g.data_visitor : dataVisitor;
          return sum + (visitors?.length || 0);
        }, 0);
        const confirm = await Swal.fire({
          title: 'Confirm Submission',
          html: `You are about to submit <b>${totalVisitors}</b> visitor(s) in <b>${groupVisitors.length}</b> group(s).<br/>Continue?`,
          icon: 'question',
          showCancelButton: true,
          reverseButtons: true,
          showCloseButton: true,
          confirmButtonText: 'Yes, Submit',
          confirmButtonColor: '#16a34a',
          cancelButtonText: 'Cancel',
        });

        if (!confirm.isConfirmed) {
          setLoading(false);
          return;
        }

        setLoading(true);

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
              registered_site: formData.registered_site ?? '',
            },
          );

          const cleanDataVisitor = (built.data_visitor ?? []).map((dv: any) => ({
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
          }));

          return {
            group_name: g.group_name ?? '',
            group_code: g.group_code ?? '',
            is_group: true,
            visitor_type: formData.visitor_type ?? '',
            tz: tz,
            flow: 'InvitationShareLink',
            type_registered: TYPE_REGISTERED,
            data_visitor: cleanDataVisitor,
          };
        });

        payload = { list_group };

        const parsed = CreateGroupVisitorRequestSchema.parse(payload);
        // console.log('🚀 Final Payload (Group):', JSON.stringify(parsed, null, 2));

        // submit API
        await createSubmitGroupShareLink(token as string, code, timestamp, parsed);
        setLoading(false);
        showSwal('success', 'Group visitor created successfully.', 1000);
        resetGroupFormState();
        navigate('/invitation-share/success');
      } else {
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
        // console.log('🚀 Final Payload (Single):', JSON.stringify(payload, null, 2));

        const parsed = CreateVisitorRequestSchema.parse(payload);
        setLoading(false);
        setPreviewPayload(parsed);
        setPreviewSections(parsed?.data_visitor?.[0]);
        setPreviewOpen(true);
        return;

        // // // Submit ke endpoint single
        // const submitFn = await createSubmitShareLink(token, code, timestamp, parsed);
        // // const backendResponse = await submitFn(token, parsed);
        // console.log('Visitor created:', submitFn);
        // const successMessage =
        //   TYPE_REGISTERED === 0
        //     ? 'Pre-registration created successfully.'
        //     : 'Invitation Visitor created successfully.';

        // showSwal('success', successMessage);

        // resetMediaState();
        // clearAnswerFiles();
      }
    } catch (err: any) {
      showSwal('error', 'Failed to create visitor.');
      console.error(err);

      if (err?.name === 'ZodError') {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((z: any) => (fieldErrors[z.path.join('.')] = z.message));
        // setErrors(fieldErrors);
      } else if (err?.errors) {
        // setErrors(err.errors);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!invitation?.visitor_type?.id) return;

    const vt = invitation.visitor_type;
    const rawSections = vt.section_page_visitor_types ?? [];

    const injected = injectInvitationData(rawSections, invitation);

    setFormData((prev: any) => ({
      ...prev,
      visitor_type: vt.id,
    }));

    setRawSections(injected);

    setIsSingle(false);
    setIsGroup(false);
  }, [invitation]);

  const handleStepChange = (targetStep: number) => {
    if (targetStep > activeStep) {
      if (!validateCurrentStep()) return;
    }

    setActiveStep(targetStep);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setActiveStep((prev) => prev + 1);
  };

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
          const isVisible = visibilityMap.hasOwnProperty(remark) ? visibilityMap[remark] : true;
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

  const handleSaveGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    handleSaveGroupVisitor();
    toast('Group form saved successfully.', 'success');
    setActiveStep(0);
  };

  const handleVisitorTypeChange = useCallback((e: any) => {
    const newType = e.target.value;

    setFormData((prev: any) => ({
      ...prev,
      visitor_type: newType,
    }));

    setSectionsData([]);
    setDataVisitor([]);
    setGroupedPages({} as any);
    setDraggableSteps([]);
    setRawSections([]);
    setActiveStep(0);
  }, []);

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

  const formsOf = (section: any) =>
    Array.isArray(section?.['visit_form']) ? section['visit_form'] : [];

  const updateSectionForm = (sec: any, updater: (arr: any[]) => any[]) => ({
    ...sec,
    [FORM_KEY]: updater(formsOf(sec)),
  });

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

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };
  const toCsv = (ids: string[]) => ids.join(',');

  const collectAllChildIds = (node: any): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((child: any) => [child.id, ...collectAllChildIds(child)]);
  };

  const sameField = (a: any, b: any) =>
    (a?.custom_field_id && b?.custom_field_id && a.custom_field_id === b.custom_field_id) ||
    (a?.remarks &&
      b?.remarks &&
      String(a.remarks).toLowerCase() === String(b.remarks).toLowerCase());

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


  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const hasAns = (f: any) => !!(f?.answer_text || f?.answer_datetime || f?.answer_file);

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

  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
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


  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
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
            .then(() => {
              // console.log(`Berhasil hapus file CDN: ${u}`);
            })
            .catch((err) => {
              // console.warn(`Gagal hapus file CDN ${u}:`, err);
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
      console.error('Failed to delete row:', e);
    }
  };

  const pickAns = (f: any) => {
    const o: any = {};
    if (f?.answer_text) o.answer_text = f.answer_text;
    if (f?.answer_datetime) o.answer_datetime = f.answer_datetime;
    if (f?.answer_file) o.answer_file = f.answer_file;
    return o;
  };

  type SectionKey = 'visit_form' | 'pra_form' | 'checkout_form';

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
                  // console.log('[TREE CHECK]', {
                  //   clicked: node.id,
                  //   isChecked,
                  //   result: updated,
                  // });

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

  const handleAddDetails = () => {
    if (!isGroup) {
      handleAddDetail(FORM_KEY);
      return;
    }

    setDataVisitor((prev) => {
      if (prev.length === 0) return prev;

      const clone = JSON.parse(JSON.stringify(prev[0])) as {
        question_page: SectionPageVisitor[];
      };
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
    const randomCode = Array.from({ length: 6 }, () =>
      Math.random().toString(36).charAt(2).toUpperCase(),
    ).join('');

    const detectedTz =
      moment.tz?.guess?.() || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

    const newGroup: any = {
      id: generateUUIDv4(),
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

  useEffect(() => {
    if (invitation?.site_id) {
      setSelectedSiteParentIds([invitation.site_id]);
    }
  }, [invitation?.site_id]);

  const renderFieldInput = (
    field: FormVisitor,
    index: number,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
    onDelete?: (index: number) => void,
    opts?: { showLabel?: boolean; uniqueKey?: string; details?: any[] },
  ) => {
    const showLabel = opts?.showLabel ?? true;
    const errorKey = opts?.uniqueKey ? opts.uniqueKey : `${activeStep - 1}:${index}`;
    const errorMessage = fieldErrors[errorKey];

    let shouldDisable = false;
    const renderInput = () => {
      switch (field.field_type) {
        case 0: // Text
          if (field.remarks === 'agenda') {
            const isLockedAgenda = !!invitation?.agenda;

            if (isLockedAgenda) {
              return (
                <CustomTextField size="small" value={field.answer_text || ''} fullWidth disabled />
              );
            }

            return (
              <Autocomplete
                size="small"
                freeSolo
                options={['Meeting', 'Presentation', 'Visit', 'Training', 'Report']}
                value={field.answer_text || null}
                onChange={(event, newValue) => {
                  onChange(index, 'answer_text', newValue || '');
                  if (newValue) clearFieldError(errorKey);
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
              value={field.answer_text}
              onChange={(e) => {
                onChange(index, 'answer_text', e.target.value);
                if (e.target.value) clearFieldError(errorKey);
              }}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
              error={!!errorMessage}
              helperText={errorMessage}
              disabled={shouldDisable}
            />
          );

        case 1: // Number
          return (
            <CustomTextField
              type="number"
              size="small"
              value={field.answer_text}
              onChange={(e) => {
                onChange(index, 'answer_text', e.target.value);
                if (e.target.value) clearFieldError(errorKey);
              }}
              placeholder=""
              fullWidth
              error={!!errorMessage}
              helperText={errorMessage}
            />
          );

        case 2: // Email
          return (
            <CustomTextField
              type="email"
              size="small"
              value={field.answer_text}
              onChange={(e) => {
                onChange(index, 'answer_text', e.target.value);
                if (e.target.value) clearFieldError(errorKey);
              }}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
              error={!!errorMessage}
              helperText={errorMessage}
            />
          );

        case 3: {
          // let options: { value: string; name: string }[] = [];
          let options: { value: string; name: string; disabled?: boolean }[] = [];

          const isLockedByInvitation =
            (field.remarks === 'host' && !!invitation?.host) ||
            (field.remarks === 'employee' && !!invitation?.host) ||
            (field.remarks === 'site_place' && !!invitation?.site_id);

          switch (field.remarks) {
            // case 'host':
            //   options = employee.map((emp: any) => ({
            //     value: emp.id,
            //     name: emp.name,
            //   }));
            //   break;

            case 'host':
              if (invitation?.host) {
                const hostEmployee = employee.find((emp: any) => emp.id === invitation.host);

                options = hostEmployee ? [{ value: hostEmployee.id, name: hostEmployee.name }] : [];
              } else {
                options = employee.map((emp: any) => ({
                  value: emp.id,
                  name: emp.name,
                }));
              }
              break;

            case 'employee':
              options = invitation?.host
                ? [{ value: invitation.host.id, name: invitation.host.name }]
                : allVisitorEmployee.map((emp: any) => ({
                    value: emp.id,
                    name: emp.name,
                  }));
              break;

            case 'site_place':
              if (invitation?.site_id) {
                const site = sites.find((s: any) => s.id === invitation.site_id);

                options = site ? [{ value: site.id, name: site.name }] : [];
              } else {
                options = sites.map((site: any) => ({
                  value: site.id,
                  name: site.name,
                  disabled: site.can_visited === false,
                }));
              }
              break;
            default:
              options = (field.multiple_option_fields || []).map((opt: any) =>
                typeof opt === 'object' ? opt : { value: opt, name: opt },
              );
              break;
          }

          const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
          const inputVal = inputValues[uniqueKey as any] || '';

          return (
            <Autocomplete
              size="small"
              disabled={isLockedByInvitation}
              // freeSolo
              // disabled={shouldDisable}
              options={options}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
              inputValue={inputVal}
              onInputChange={(_, newInputValue) =>
                setInputValues((prev) => ({ ...prev, [uniqueKey]: newInputValue }))
              }
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
              getOptionDisabled={(option) => option.disabled || false}
              onChange={(_, newValue) => {
                const value = newValue instanceof Object ? newValue.value : '';
                onChange(index, 'answer_text', value);
                if (value) clearFieldError(errorKey);
              }}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  placeholder="Enter at least 3 characters to search"
                  fullWidth
                  // disabled={shouldDisable}
                  sx={{ minWidth: 160 }}
                  error={!!errorMessage}
                  helperText={errorMessage}
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
              onChange={(e) => {
                onChange(index, 'answer_datetime', e.target.value);
                if (e.target.value) clearFieldError(errorKey);
              }}
              fullWidth
              error={!!errorMessage}
              helperText={errorMessage}
            />
          );

        case 5: // Radio
          if (field.remarks === 'gender') {
            return (
              <CustomTextField
                select
                size="small"
                value={field.answer_text || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(index, 'answer_text', value);
                  if (value) clearFieldError(errorKey);
                }}
                fullWidth
                sx={{ width: 100 }}
                error={!!errorMessage}
                helperText={errorMessage}
              >
                {field.multiple_option_fields?.map((opt: any) => (
                  <MenuItem key={opt.id} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            );
          }

          if (field.remarks === 'vehicle_type') {
            return (
              <CustomTextField
                select
                size="small"
                value={field.answer_text || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(index, 'answer_text', value);
                  if (value) clearFieldError(errorKey);
                }}
                fullWidth
                error={!!errorMessage}
                helperText={errorMessage}
              >
                {field.multiple_option_fields?.map((opt: any) => (
                  <MenuItem key={opt.id} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            );
          }

          if (field.remarks === 'is_employee' || field.remarks === 'is_driving') {
            return (
              <Box key={`${field.custom_field_id}-${index}`}>
                <FormControl error={!!errorMessage}>
                  <RadioGroup
                    row
                    value={field.answer_text || ''}
                    onChange={(e) => {
                      onChange(index, 'answer_text', e.target.value);
                      if (e.target.value) clearFieldError(errorKey);
                    }}
                    sx={{
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    {field.multiple_option_fields?.map((opt: any) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={<Radio size="small" />}
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
              </Box>
            );
          }
          return (
            <>
              <FormControl error={!!errorMessage}>
                <RadioGroup
                  row
                  value={field.answer_text || ''}
                  onChange={(e) => {
                    onChange(index, 'answer_text', e.target.value);
                    if (e.target.value) clearFieldError(errorKey);
                  }}
                  sx={{
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}
                >
                  {field.multiple_option_fields?.map((opt: any) => (
                    <FormControlLabel
                      key={opt.id}
                      value={opt.value}
                      control={<Radio size="small" />}
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

        case 6: //Checkbox
          return (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(field.answer_text)}
                    onChange={(e) => {
                      onChange(index, 'answer_text', e.target.checked);
                      if (e.target.checked) clearFieldError(errorKey);
                    }}
                  />
                }
                label=""
              />
              {errorMessage && (
                <Typography variant="caption" color="error">
                  {errorMessage}
                </Typography>
              )}
            </>
          );

        case 8:
          return (
            <TextField
              type="time"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
              error={!!errorMessage}
              helperText={errorMessage}
            />
          );

        case 9:
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                value={field.answer_datetime ? dayjs.utc(field.answer_datetime).local() : null}
                ampm={false}
                onChange={(newValue) => {
                  if (newValue) {
                    const utc = newValue.utc().format();
                    onChange(index, 'answer_datetime', utc);
                    clearFieldError(errorKey);
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
                    sx: {
                      '& .MuiInputBase-root.Mui-disabled': {
                        backgroundColor: '#f3f4f6',
                      },
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#909294ff',
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          );

        case 10: // Camera
          return (
            <>
              <CameraUpload
                value={field.answer_file as string | undefined}
                onChange={(url) => {
                  onChange(index, 'answer_file', url);
                  if (url) clearFieldError(errorKey);
                }}
              />
              {errorMessage && (
                <Typography variant="caption" color="error">
                  {errorMessage}
                </Typography>
              )}
            </>
          );

        case 11: {
          const key = opts?.uniqueKey ?? String(index);
          const fileUrl = (field as any).answer_file as string | undefined;
          return (
            <>
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
                    <Typography variant="subtitle1">Upload your file</Typography>
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
                      (url) => {
                        onChange(index, 'answer_file', url);
                        if (url) clearFieldError(errorKey);
                      },
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
              {errorMessage && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errorMessage}
                </Typography>
              )}
            </>
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
                  width: { xs: '100%', md: '200px' },
                }}
              >
                <MenuItem value="file">Choose File</MenuItem>
                <MenuItem value="camera">Take Photo</MenuItem>
              </TextField>

              {(uploadMethods[key] || 'file') === 'camera' ? (
                <CameraUpload
                  value={field.answer_file as string | undefined}
                  onChange={(url) => {
                    onChange(index, 'answer_file', url);
                    if (url) clearFieldError(errorKey);
                  }}
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
                        (url) => {
                          onChange(index, 'answer_file', url);
                          if (url) clearFieldError(errorKey);
                        },
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
              {errorMessage && (
                <Typography variant="caption" color="error">
                  {errorMessage}
                </Typography>
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
              error={!!errorMessage}
              helperText={errorMessage}
            />
          );
      }
    };

    return (
      <Box sx={{ width: '100%' }}>
        {showLabel && (
          <CustomFormLabel required={field.mandatory === true}>
            {field.long_display_text}
          </CustomFormLabel>
        )}
        {renderInput()}
      </Box>
    );
  };

  const isLockedVisitorType = !!invitation?.visitor_type?.id || !!invitation?.visitor_type_id;
  const [visitorType, setVisitorType] = useState<any[]>([]);

  const injectInvitationData = (sections: any[], invitation: any) => {
    if (!invitation) return sections;

    const { host, site, visitor_period_start, visitor_period_end, agenda } = invitation;

    return sections.map((section: any) => ({
      ...section,
      visit_form: (section.visit_form || []).map((field: any) => {
        switch (field.remarks) {
          case 'agenda':
            return { ...field, answer_text: agenda ?? '' };
          case 'host':
            return { ...field, answer_text: host?.id ?? '' };
          case 'site_place':
            return { ...field, answer_text: site?.id ?? '' };
          case 'visitor_period_start':
            return {
              ...field,
              answer_datetime: visitor_period_start
                ? visitor_period_start.endsWith('Z')
                  ? visitor_period_start
                  : visitor_period_start + 'Z'
                : null,
            };
          case 'visitor_period_end':
            return {
              ...field,
              answer_datetime: visitor_period_end
                ? visitor_period_end.endsWith('Z')
                  ? visitor_period_end
                  : visitor_period_end + 'Z'
                : null,
            };
          default:
            return field;
        }
      }),
    }));
  };

  useEffect(() => {
    if (!formData.visitor_type) return;

    const fetchDetail = async () => {
      const res = await getPublicVisitorTypeById(
        token as string,
        code,
        'InvitationLink',
        formData.visitor_type,
      );
      const sections = res?.collection?.section_page_visitor_types ?? [];
      const injected = injectInvitationData(sections, invitation);
      setRawSections(injected);
    };
    fetchDetail();
  }, [formData.visitor_type]);

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
  }, [isGroup, rawSections]);

  // useEffect(() => {
  //   if (isLockedVisitorType) {
  //     setVisitorType([invitation.visitor_type]);
  //     return;
  //   }

  //   const fetchVisitorTypes = async () => {
  //     try {
  //       setVtLoading(true);
  //       const res = await getPublicVisitorType(token as string, code, 'InvitationLink');
  //       setVisitorType(res.collection || []);
  //     } finally {
  //       setVtLoading(false);
  //     }
  //   };

  //   fetchVisitorTypes();
  // }, [invitation]);

  useEffect(() => {
    if (isLockedVisitorType) {
      setVisitorType([invitation.visitor_type]);
      return;
    }

    const fetchVisitorTypes = async () => {
      try {
        setVtLoading(true);

        const res = await getPublicVisitorType(token as string, code, 'InvitationLink');
        setVisitorType(res?.data || []);
      } catch (err) {
        console.error('VT ERROR:', err);
      } finally {
        setVtLoading(false);
      }
    };

    fetchVisitorTypes();
  }, [isLockedVisitorType]);

  const handleDeleteGroup = (id: string) => {
    setGroupVisitors((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSteps = (step: number) => {
    const showVTListSkeleton = vtLoading;
    if (step == 0) {
      return (
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel
                htmlFor="visitor-type"
                sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}
              >
                Visitor Type
              </CustomFormLabel>
              <FormControl component="fieldset">
                {isLockedVisitorType ? (
                  <Paper
                    sx={{
                      px: 2,
                      py: 1,
                      textAlign: 'center',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    }}
                  >
                    {invitation.visitor_type.name}
                  </Paper>
                ) : (
                  <VisitorTypeList
                    visitorType={visitorType || []}
                    formData={formData}
                    showVTListSkeleton={showVTListSkeleton}
                    onChange={(e: any) => handleVisitorTypeChange(e)}
                  />
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel
                htmlFor="visitor-type"
                sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}
              >
                Select Status Visitor
              </CustomFormLabel>
              {/* {formData.visitor_type && ( */}
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  // labelPlacement="start"
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
                  // labelPlacement="start"
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
              // const section = sectionsData[activeStep - 1];
              const section = currentSection;
              const sectionType = getSectionType(section);
              //   const isEmployee = isEmployeeSection(section);
              const renderTable = () => (
                <Table>
                  <TableBody>
                    <RenderDetailRows
                      details={formsOf(section)}
                      activeStep={activeStep}
                      invitation={invitation}
                      fieldErrors={fieldErrors}
                      setFieldErrors={setFieldErrors}
                      uploadNames={uploadNames}
                      setUploadNames={setUploadNames}
                      sites={sites}
                      employee={employee}
                      allVisitorEmployee={allVisitorEmployee}
                      onChange={(index, field, value) => {
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
                      }}
                    />
                  </TableBody>
                </Table>
              );

              if (sectionType === 'visitor_information') {
                return (
                  <>
                    <Accordion key={activeStep} expanded sx={{ mt: 2 }}>
                      {/* <AccordionSummary onClick={(e) => e.stopPropagation()}>
                        <Typography fontWeight={600}>{section.name}</Typography>
                      </AccordionSummary> */}
                      <AccordionDetails sx={{ paddingTop: 0 }}>{renderTable()}</AccordionDetails>
                    </Accordion>
                  </>
                );
              }

              if (
                sectionType === 'parking' ||
                sectionType === 'purpose_visit' ||
                sectionType === 'nda' ||
                sectionType === 'identity_image' ||
                sectionType === 'selfie_image'
              ) {
                return renderTable();
              }

              return null;
            })()}
          </Grid>
        )}
        {isGroup && (
          <Grid>
            {(() => {
              // const section = sectionsData[activeStep - 1];
              const section = currentSection;
              const sectionType = getSectionType(section);
              if (sectionType === 'visitor_information_group') {
                return (
                  <Grid>
                    <Box>
                      <TableContainer component={Paper} sx={{ mb: 1 }}>
                        {isMobile ? (
                          <>
                            {dataVisitor.length > 0 ? (
                              dataVisitor.map((group, gIdx) => {
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
                                      {page.form?.map((field: any, fIdx: any) => {
                                        const matchedKey = Object.keys(
                                          groupedPages.batch_page || {},
                                        ).find((k) => sameField(groupedPages.batch_page[k], field));
                                        const shared = matchedKey
                                          ? groupedPages.batch_page[matchedKey]
                                          : undefined;
                                        const proxyField = hasAns(field)
                                          ? field
                                          : shared
                                            ? { ...field, ...pickAns(shared) }
                                            : field;

                                        return (
                                          <Box key={fIdx} sx={{ mb: 2 }}>
                                            {renderFieldInput(
                                              proxyField,
                                              fIdx,
                                              (idx: any, fieldKey: any, value: any) => {
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
                                                showLabel: true,
                                                // uniqueKey: `${activeStep - 1}:${gIdx}:${fIdx}`,
                                                uniqueKey: `${activeStep - 1}:${gIdx}:${field.custom_field_id}`,
                                              },
                                            )}
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
                                {(dataVisitor[0]?.question_page[activeStep - 1]?.form || []).map(
                                  (f: any, i: any) => (
                                    <TableCell key={f.custom_field_id || i}>
                                      <CustomFormLabel required={f.mandatory === true}>
                                        {f.long_display_text}
                                      </CustomFormLabel>
                                    </TableCell>
                                  ),
                                )}
                                <TableCell align="right">
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    Action
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {dataVisitor.length > 0 ? (
                                dataVisitor.map((group, gIdx) => {
                                  const page = group.question_page[activeStep - 1];
                                  if (!page?.form) return null;

                                  const fields = page.form;

                                  return (
                                    <TableRow key={gIdx}>
                                      {fields.map((field: any) => {
                                        const matchedKey = Object.keys(
                                          groupedPages.batch_page || {},
                                        ).find((k) => sameField(groupedPages.batch_page[k], field));

                                        const shared = matchedKey
                                          ? groupedPages.batch_page[matchedKey]
                                          : undefined;

                                        const proxyField = hasAns(field)
                                          ? field
                                          : shared
                                            ? { ...field, ...pickAns(shared) }
                                            : field;

                                        return (
                                          <TableCell key={field.custom_field_id}>
                                            {renderFieldInput(
                                              proxyField,
                                              field.custom_field_id,
                                              (idx: any, fieldKey: any, value: any) => {
                                                setDataVisitor((prev) => {
                                                  const next = [...prev];
                                                  const s = activeStep - 1;

                                                  if (!next[gIdx]?.question_page?.[s]?.form)
                                                    return prev;

                                                  next[gIdx].question_page[s].form = next[
                                                    gIdx
                                                  ].question_page[s].form.map((f: any) =>
                                                    f.custom_field_id === field.custom_field_id
                                                      ? { ...f, [fieldKey]: value }
                                                      : f,
                                                  );

                                                  return next;
                                                });
                                              },
                                              undefined,
                                              {
                                                showLabel: false,
                                                uniqueKey: `${activeStep - 1}:${gIdx}:${field.custom_field_id}`,
                                                details: page.form || [],
                                              },
                                            )}
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
                                <TableCell colSpan={99} align="left">
                                  <Button
                                    size="small"
                                    onClick={handleAddDetails}
                                    sx={{ mx: 1, my: 1 }}
                                    variant="contained"
                                  >
                                    Add New
                                  </Button>
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
                  const shared = groupedPages.single_page.find((sf: any) => sameField(sf, f));
                  // // return shared ? { ...f, ...pickAns(shared) } : f;
                  return shared
                    ? {
                        ...f,
                        ...Object.fromEntries(
                          Object.entries(pickAns(shared)).filter(
                            ([_, v]) => v !== '' && v !== null && v !== undefined,
                          ),
                        ),
                      }
                    : f;
                });
                return (
                  <Table>
                    <TableBody>
                      <RenderDetailRows
                        details={mergedVisitForm}
                        activeStep={activeStep}
                        invitation={invitation}
                        fieldErrors={fieldErrors}
                        setFieldErrors={setFieldErrors}
                        uploadNames={uploadNames}
                        setUploadNames={setUploadNames}
                        sites={sites}
                        employee={employee}
                        allVisitorEmployee={allVisitorEmployee}
                        onChange={(index, field, value) => {
                          setGroupedPages((prev: any) => {
                            const next = { ...prev, single_page: [...prev.single_page] };

                            const base = mergedVisitForm[index];

                            const found = next.single_page.findIndex((sf: any) =>
                              sameField(sf, base),
                            );

                            const payload = {
                              ...(found >= 0 ? next.single_page[found] : base),
                              [field]: value,
                            };

                            if (found >= 0) next.single_page[found] = payload;
                            else next.single_page.push(payload);

                            return next;
                          });
                        }}
                      />
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
  useEffect(() => {
    setDraggableSteps([...dynamicSteps]);
  }, [dynamicSteps]);

  useEffect(() => {
    if (!isGroup || !rawSections?.length) return;

    const purposeFields = rawSections
      .flatMap((s: any) => s.visit_form || [])
      .filter((f: any) =>
        ['host', 'agenda', 'site_place', 'visitor_period_start', 'visitor_period_end'].includes(
          f.remarks,
        ),
      );

    const injected = purposeFields
      .filter((f: any) => f.answer_text || f.answer_datetime)
      .map((f: any) => ({
        remarks: f.remarks,
        custom_field_id: f.custom_field_id,
        answer_text: f.answer_text ?? null,
        // answer_datetime: f.answer_datetime ? dayjs(f.answer_datetime).utc().format() : null,
        answer_datetime: f.answer_datetime ?? null,
        answer_file: f.answer_file ?? null,
      }));

    if (!injected.length) return;

    setGroupedPages((prev: any) => ({
      ...prev,
      single_page: injected,
    }));
  }, [rawSections, isGroup]);

  const sanitizeRemarks = (r?: string | null) => {
    const v = (r ?? '').trim().toLowerCase();
    return v === 'indentity_id' ? 'identity_id' : v;
  };

  const REQUIRED_VI = ['name', 'email', 'organization'] as const;

  const hasVIFields = (s?: any) => {
    const r = new Set(
      formsOf(s)
        .map((f: any) => sanitizeRemarks(f?.remarks))
        .filter(Boolean),
    );
    return REQUIRED_VI.every((x) => r.has(x));
  };

  const pickVisitorInfoSingle = (sections: any[] = []) =>
    sections.find((s) => !s?.is_document && !s?.can_multiple_used && hasVIFields(s));

  const DOC_REMARKS = new Set(['selfie_image', 'identity_image', 'nda']);

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

  const asStr = (v: any) => (v == null ? '' : String(v));

  const cloneForms = (forms?: any[]) =>
    Array.isArray(forms)
      ? forms.map((f, idx) => ({
          ...f,
          sort: f.sort ?? idx,
          foreign_id: asStr(f.foreign_id),
          answer_text: f.answer_text ?? '',
          answer_datetime: f.answer_datetime ?? '',
          answer_file: f.answer_file ?? '',
          multiple_option_fields: Array.isArray(f.multiple_option_fields)
            ? f.multiple_option_fields.map((opt: any) =>
                typeof opt === 'object' ? { ...opt } : opt,
              )
            : [],
        }))
      : [];

  const buildGroupSections = (sections?: any[]) => {
    const list = Array.isArray(sections) ? sections : [];

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

          [FORM_KEY]: (() => {
            const base = cloneForms(formsOf(viSrc));
            const extra = cloneForms(otherSingles);
            const startExtra = base.length;
            const extraWithSort = extra.map((f, i) => ({ ...f, sort: f.sort ?? startExtra + i }));

            const startDocs = startExtra + extraWithSort.length;
            const docsWithSort = docForms.map((f, i) => ({
              ...f,
              sort: f.sort ?? startDocs + i,
            }));

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

  const buildGroupedPages = (sections: any[] = []): any => {
    const single_page: any[] = [];
    const batch_page: Record<string, any> = {};

    sections.forEach((section) => {
      const forms = formsOf(section);

      // Purpose Visit → single_page
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

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleConfirmSubmit = async () => {
    if (!previewPayload) return;

    try {
      setLoading(true);
      await sleep(100);

      if (isGroup) {
        await createSubmitGroupShareLink(token as string, code, timestamp, previewPayload);
        toast('Group visitor created successfully.', 'success');
      } else {
        await createSubmitShareLink(token as string, code, timestamp, previewPayload);

        const successMessage =
          TYPE_REGISTERED === 0
            ? 'Pre-registration created successfully.'
            : 'Self pre-registration successfully.';

        setLoading(false);
        await showSwal('success', successMessage, 2000);
      }

      setPreviewOpen(false);
      resetSingleFormState();
      navigate('/invitation-share/success');
    } catch (err) {
      console.error(err);
      setLoading(false);
      await showSwal('error', 'Failed to create visitor.');
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          handleOnSubmit(e);
        }}
      >
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
                      //   marginTop: '10px',
                    }}
                  >
                    <Stepper
                      activeStep={activeStep}
                      // onClick={() => handleStepChange(0)}
                      // connector={<CustomConnector />}
                      alternativeLabel
                      sx={{
                        width: '100%',
                        mb: 1,
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
                    >
                      {/* Static Step Pertama */}
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
                              // onClick={() => setActiveStep(index + 1)}
                              onClick={() => handleStepChange(index + 1)}
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
            <Button
              disabled={activeStep === 0}
              onClick={() => {
                setActiveStep((prev) => prev - 1);
              }}
              startIcon={<IconArrowLeft width={18} />}
            >
              Back
            </Button>

            {isGroup ? (
              isLastStep ? (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={handleSaveGroup}
                >
                  {loading ? 'Saving...' : 'Save Group'}
                </Button>
              ) : activeStep === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOnSubmit}
                  disabled={loading || groupVisitors.length === 0}
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
                type="submit"
                disabled={
                  loading ||
                  !formData.visitor_type ||
                  formData.is_group === null ||
                  formData.is_group === undefined
                }
                // onClick={handleOnSubmit}
              >
                Submit
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<IconArrowRight width={18} />}
                disabled={!isSingle && !isGroup}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>
      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmSubmit}
        invitationData={previewSections}
        formValues={previewPayload}
        employee={employee}
        sites={sites}
        invitation={invitation}
      />
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: 999999,
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
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
    </>
  );
};

export default FormSelfPraregistration;
