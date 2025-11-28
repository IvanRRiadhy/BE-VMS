import utc from 'dayjs/plugin/utc';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Calendar, Views, DateLocalizer, Event as RBCEvent } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Grid2 as Grid,
  Button,
  Tooltip,
  IconButton,
  Autocomplete,
  TableRow,
  TableCell,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Divider,
  Table,
  TableBody,
  DialogActions,
  Portal,
  Backdrop,
  CircularProgress,
  TableHead,
  MenuItem,
} from '@mui/material';
import { IconCamera, IconDeviceFloppy, IconTrash, IconX } from '@tabler/icons-react';
import { Box } from '@mui/system';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getDeliveryStaffRegisterById } from 'src/customs/api/Delivery/StaffRegister';
import dayjs, { Dayjs, tz } from 'dayjs';
import { useParams } from 'react-router';
import {
  createPrainvitationDelivery,
  createSchedulerDelivery,
  getCalendarSchedule,
  getDeliveryScheduleInvitationById,
  getSchedulerDeliveryById,
  updateReschduleInvitation,
} from 'src/customs/api/Delivery/Scheduler';
import { DateTimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
// dayjs.locale('id');

import Webcam from 'react-webcam';
import { axiosInstance2, BASE_URL } from 'src/customs/api/interceptor';
import { getAllDriver, getVisitorDriver } from 'src/customs/api/Delivery/Driver';
import { getAllSite, getVisitorEmployee } from 'src/customs/api/admin';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import InvitationScheduleDetailDialog from './Dialog/InvitationScheduleDetailDialog';
import { set } from 'lodash';

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
}

interface DnDOutsideCourierProps {
  // draggedCourierRef: any;
  draggedCourier: any;
  setDraggedCourier: React.Dispatch<React.SetStateAction<any>>;
  isDraggingOutside: boolean;
  setIsDraggingOutside: React.Dispatch<React.SetStateAction<boolean>>;
  localizer: any;
  couriers: any[];
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  timeAccess: any;
  onViewChange?: (view: any) => void | undefined;
  onRangeChange?: (range: any, view: any) => void | undefined;
  loadSchedule: (startDate: string, endDate: string) => void;
  lastRange: any;
}

const DnDCalendar = withDragAndDrop(Calendar as any);

export default function DnDOutsideCourier({
  // draggedCourierRef,
  draggedCourier,
  setDraggedCourier,
  localizer,
  couriers,
  timeAccess,
  events,
  setEvents,
  onViewChange,
  onRangeChange,
  loadSchedule,
  lastRange,
}: DnDOutsideCourierProps) {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  // const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [openDeliverySchedule, setOpenDeliverySchedule] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ [index: number]: string | null }>({});
  const [openCamera, setOpenCamera] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const webcamRef = useRef<Webcam>(null);
  const defaultDate = useMemo(() => new Date(), []);
  const [questionPages, setQuestionPages] = useState<any[]>([]);
  const [rawQuestionPages, setRawQuestionPages] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [openDialogReschedule, setOpenDialogReschedule] = useState(false);
  const [tempEvent, setTempEvent] = useState<any | null>(null);
  // const [calendarVersion, setCalendarVersion] = useState(0);

  const reloadCalendar = () => {
    if (!lastRange.start || !lastRange.end) return;

    const start = dayjs(lastRange.start).format('YYYY-MM-DD');
    const end = dayjs(lastRange.end).format('YYYY-MM-DD');

    loadSchedule(start, end);
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getAllDriver(token as string);
        setDrivers(res.collection ?? []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchDrivers();
  }, [token]);

  // const onDropFromOutside = useCallback(
  //   ({ start }: any) => {
  //     if (!draggedCourierRef.current) return;

  //     // setSelectedEvent(tempEvent);
  //     setSelectedEvent({
  //       id: draggedCourierRef.current.employee_id,
  //       title: draggedCourierRef.current.name,
  //       // start: dayjs(start).utc().toDate(),
  //       start: start,
  //       end: dayjs(start).add(1, 'hour').utc().toDate(),
  //       // start,
  //       // end: moment(start).add(1, 'hour').toDate(),
  //       allDay: false,
  //       color: draggedCourierRef.current.color,
  //       resource: { internal: true },
  //     });
  //     setIsDraggingOutside(false);
  //     draggedCourierRef.current = null;
  //     setOpenDeliverySchedule(true);
  //   },
  //   [draggedCourierRef],
  // );

  // const onDropFromOutside = useCallback(
  //   ({ start }: any) => {
  //     if (!draggedCourierRef.current) return;

  //     const courier = draggedCourierRef.current;
  //     const groupId = courier.group_delivery_staff_id;

  //     // Ambil semua member group
  //     const groupMembers = couriers.filter((c) => c.group_delivery_staff_id === groupId);
  //     console.log(groupMembers);

  //     setSelectedEvent({
  //       id: courier.employee_id,
  //       title: courier.name,
  //       isGroup: groupMembers.length > 1,
  //       members: groupMembers,
  //       start,
  //       end: dayjs(start).add(1, 'hour').utc().toDate(),
  //       color: courier.color,
  //       resource: { internal: true },
  //     });

  //     console.log(courier);

  //     setIsDraggingOutside(false);
  //     draggedCourierRef.current = null;
  //     setOpenDeliverySchedule(true);
  //   },
  //   [couriers, draggedCourierRef],
  // );
  const [dragKey, setDragKey] = useState(0);

  const onDropFromOutside = useCallback(
    ({ start }: any) => {
      if (!draggedCourier) return;

      const courier = draggedCourier;

      const employeeId = String(courier.employee_id ?? '').trim();
      const groupId = String(courier.group_delivery_staff_id ?? '').trim();

      let groupMembers: any[] = [];

      if (!groupId) {
        groupMembers = couriers.filter((c) => {
          const cGroup = String(c.group_delivery_staff_id ?? '').trim();
          return cGroup === employeeId;
        });

        groupMembers = [courier, ...groupMembers];
      } else {
        groupMembers = couriers.filter((c) => {
          const cGroup = String(c.group_delivery_staff_id ?? '').trim();
          return cGroup === groupId; // members
        });

        const leader = couriers.find((c) => String(c.employee_id ?? '').trim() === groupId);

        if (leader) {
          groupMembers = [leader, ...groupMembers];
        }
      }
      if (groupMembers.length === 0) groupMembers = [courier];

      console.log('Group members selected:', groupMembers);

      setSelectedEvent({
        id: courier.employee_id,
        title: courier.name,
        isGroup: groupMembers.length > 1,
        members: groupMembers,
        start,
        end: dayjs(start).add(1, 'hour').utc().toDate(),
        colour: courier.colour,
        resource: { internal: true },
      });

      const memberEmployeeIds = groupMembers.map((m) => m.employee_id);

      // auto inject employee ke form
      setQuestionPages((prev) =>
        prev.map((page) => ({
          ...page,
          form: page.form.map((f: any) => {
            if (f.remarks === 'employee') {
              // GROUP
              if (groupMembers.length > 1) {
                return {
                  ...f,
                  groupAnswers: memberEmployeeIds,
                };
              }
              // SINGLE
              return {
                ...f,
                answer_text: courier.employee_id,
              };
            }
            return f;
          }),
        })),
      );

      setDraggedCourier(null);
      setIsDraggingOutside(false);
      // draggedCourierRef.current = null;
      setOpenDeliverySchedule(true);
    },
    [couriers, draggedCourier],
  );

  const [rescheduleVisitorId, setRescheduleVisitorId] = useState<string | null>(null);
  const [initialTrxCodeData, setInitialTrxCodeData] = useState<string | null>(null);

  const moveEvent = useCallback(async ({ event, start, end }: any) => {
    // draggedCourierRef.current = null;

    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)));

    const confirmed = await showSwal('confirm', 'Are you sure to reschedule?');
    if (!confirmed) return;

    try {
      setRescheduleVisitorId(event.id);

      const res = await getDeliveryScheduleInvitationById(token as string, event.id);

      const oldStart = res.collection.visitor_period_start ?? null;
      const oldEnd = res.collection.visitor_period_end ?? null;

      // simpan ke state untuk dialog
      setRescheduleData({
        oldStart,
        oldEnd,
        newStart: start ? new Date(start) : null,
        newEnd: end ? new Date(end) : null,
      });

      // buka dialog
      setOpenDialogReschedule(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const resizeEvent = useCallback(async ({ event, start, end }: any) => {
    // draggedCourierRef.current = null;
    setDraggedCourier(null);
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)));
    // const confirmed = showConfirmDelete('Are you sure to reschedule?');
    const confirmed = await showSwal('confirm', 'Are you sure to reschedule?');
    if (!confirmed) return;

    try {
      setRescheduleVisitorId(event.id);

      // ambil data lama dari server
      const res = await getDeliveryScheduleInvitationById(token as string, event.id);

      const oldStart = res.collection.visitor_period_start;
      const oldEnd = res.collection.visitor_period_end;
      const initialTrxCode = res.collection.initial_trx_code;

      setInitialTrxCodeData(initialTrxCode);

      setRescheduleData({
        oldStart,
        oldEnd,
        newStart: start,
        newEnd: end,
      });

      setOpenDialogReschedule(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSubmitReschedule = async () => {
    setTimeout(() => setLoading(true), 300);

    try {
      if (!rescheduleVisitorId || !rescheduleData.newStart || !rescheduleData.newEnd) {
        showSwal('error', 'Start and end time are required.');
        return;
      }

      const payload = {
        // trx_visitor_id: rescheduleVisitorId,
        initial_trx_code: initialTrxCodeData,
        visitor_period_end: dayjs(rescheduleData.newEnd).utc().format(),
        visitor_period_start: dayjs(rescheduleData.newStart).utc().format(),
      };

      console.log('RESCHEDULE PAYLOAD =>', payload);

      await updateReschduleInvitation(token as string, payload);

      // Delay lagi sebelum reload biar smooth
      await new Promise((res) => setTimeout(res, 600));

      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.parentGroupId === initialTrxCodeData) {
            return {
              ...ev,
              start: new Date(rescheduleData.newStart as Date),
              end: new Date(rescheduleData.newEnd as Date),
            };
          }
          return ev;
        }),
      );

      reloadCalendar();

      showSwal('success', 'Reschedule successfully.');

      setOpenDialogReschedule(false);
    } catch (error) {
      console.log(error);
      showSwal('error', 'Failed to reschedule.');
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  const [isDraggingOutside, setIsDraggingOutside] = useState(false);

  const dragFromOutsideItem = useCallback(() => {
    if (!draggedCourier) return null;

    const now = new Date();

    return {
      id: draggedCourier.id + '_temp',
      title: draggedCourier.name,
      start: now,
      end: dayjs(now).add(1, 'hour').toDate(),
      colour: draggedCourier.colour,
      isTemp: true,
    };
  }, [isDraggingOutside, draggedCourier]);

  const handleSelectSlot = useCallback(
    ({ start, end }: any) => {
      let realStart = start;

      if (dayjs(start).hour() === 0 && dayjs(end).hour() !== 0) {
        const slotMinutes = 30;
        realStart = dayjs(end).subtract(slotMinutes, 'minute').toDate();
        console.log('🔥 FIXED START:', realStart);
      }

      if (isSlotDisabled(start) || isSlotDisabled(end)) return;

      updateVisitorPeriod(start, end);

      setSelectedEvent({
        id: crypto.randomUUID(),
        start: realStart,
        end: end,
        title: '',
        driver_id: null,
        color: '',
        fromSlot: true,
      });

      setOpenDeliverySchedule(true);
    },
    [drivers],
  );

  // const handleSelectSlot = useCallback(
  //   ({ start, end }: any) => {
  //     const currentView = viewRef.current;

  //     let realStart = start;
  //     let realEnd = end;

  //     // ================================
  //     // 📌 FIX 1 — MONTH view → ALWAYS 1 DAY
  //     // ================================
  //     if (currentView === 'month') {
  //       realStart = dayjs(start).startOf('day').toDate();
  //       realEnd = dayjs(start).endOf('day').toDate();
  //       console.log('📅 MONTH CLICK → 1 Hari:', realStart, realEnd);
  //     }

  //     // ================================
  //     // 📌 FIX 2 — RBC DAY/WEEK DRAG BUG
  //     // ================================
  //     if (currentView !== 'month') {
  //       if (dayjs(start).hour() === 0 && dayjs(end).hour() !== 0) {
  //         realStart = dayjs(end).subtract(30, 'minute').toDate();
  //         console.log('🔥 FIXED WEEK/DAY START:', realStart);
  //       }
  //     }

  //     // Disable slot logic
  //     if (isSlotDisabled(realStart) || isSlotDisabled(realEnd)) return;

  //     updateVisitorPeriod(realStart, realEnd);

  //     setSelectedEvent({
  //       id: crypto.randomUUID(),
  //       start: realStart,
  //       end: realEnd,
  //       title: '',
  //       driver_id: null,
  //       colour: '',
  //       fromSlot: true,
  //     });

  //     setOpenDeliverySchedule(true);
  //   },
  //   [drivers],
  // );

  const [openInvitationDetail, setOpenInvitationDetail] = useState(false);

  const handleOpenExistingEvent = async (event: any) => {
    try {
      setLoading(true);

      // ambil data detail by ID
      const res = await getDeliveryScheduleInvitationById(token as string, event.id);
      setDetailDataInvitation(res.collection);
    } catch (err) {
      console.log(err);
      setDetailDataInvitation(null);
    } finally {
      setLoading(false);
    }
    setOpenInvitationDetail(true);
  };

  const [questionPage, setQuestionPage] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [rescheduleData, setRescheduleData] = useState({
    oldStart: null as string | null,
    oldEnd: null as string | null,
    newStart: null as Date | null,
    newEnd: null as Date | null,
  });

  const [deliveryData, setDeliveryData] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSchedulerDeliveryById(token as string, id as string);
        const pages = res.collection.need_question_page ?? [];
        setDeliveryData(res.collection);
        // console.log('res', res);
        setRawQuestionPages(pages);
        setQuestionPages(JSON.parse(JSON.stringify(pages)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  const buildSubmitPayload = () => {
    if (!deliveryData) return null;

    const tz = moment.tz?.guess?.() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const isGroup = selectedEvent?.isGroup ?? false;

    // 🔥 Build question_page lengkap untuk 1 visitor
    const buildQuestionPagesForVisitor = (memberIndex: number | null) => {
      return questionPages.map((page) => ({
        id: page.id,
        sort: page.sort,
        name: page.name,
        is_document: page.is_document,
        can_multiple_used: page.can_multiple_used,
        foreign_id: page.foreign_id,
        self_only: page.self_only,
        status: page.status ?? 0,

        form: page.form.map((f: any) => {
          const base = {
            sort: f.sort,
            short_name: f.short_name,
            long_display_text: f.long_display_text,
            field_type: f.field_type,
            is_primary: f.is_primary,
            is_enable: f.is_enable,
            mandatory: f.mandatory,
            remarks: f.remarks,
            custom_field_id: f.custom_field_id,
            multiple_option_fields: f.multiple_option_fields ?? [],
            visitor_form_type: f.visitor_form_type,
          };

          let answer = null;

          // 🔥 Ambil jawaban per member (group)
          if (isGroup && memberIndex !== null) {
            answer =
              f.groupAnswers?.[memberIndex] ??
              f.answer_text ??
              f.answer_datetime ??
              f.answer_file ??
              null;
          } else {
            switch (f.field_type) {
              case 9: // datetime
                answer = f.answer_datetime ?? null;
                break;

              case 10:
              case 11:
              case 12: // file
                answer = f.answer_file ?? null;
                break;

              default: // text
                answer = f.answer_text ?? null;
            }
          }

          switch (f.field_type) {
            case 9:
              return { ...base, answer_datetime: answer || null };

            case 10:
            case 11:
            case 12:
              return { ...base, answer_file: answer || null };

            default:
              return { ...base, answer_text: answer || null };
          }
        }),
      }));
    };

    // 🔥 Build data_visitor
    let data_visitor = [];

    if (isGroup) {
      data_visitor = selectedEvent.members.map((_: any, idx: number) => ({
        question_page: buildQuestionPagesForVisitor(idx),
      }));
    } else {
      data_visitor = [
        {
          question_page: buildQuestionPagesForVisitor(null),
        },
      ];
    }

    return {
      visitor_type: deliveryData.visitor_type_id,
      group_name: selectedEvent?.title || deliveryData?.employee_name || 'Group Visitor',
      delivery_schedule_id: deliveryData.id,
      type_registered: 0,
      is_group: isGroup,
      tz,
      data_visitor,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllDriver(token as string);
        setAllVisitorEmployee(res?.collection ?? []);
        const resSite = await getAllSite(token as string);
        setSites(resSite.collection);
        const resEmployeee = await getVisitorEmployee(token as string);
        setEmployee(resEmployeee.collection);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  const getColour = (event: any) => {
    // warna sebenarnya ada di members
    if (event.members && event.members.length > 0) {
      return event.members[0].colour;
    }

    // fallback: cocokkan employee_id
    const employeeId =
      event.employee_id || event.driver_id || event.members?.[0]?.employee_id || event.id;

    const courier = couriers.find((c) => String(c.employee_id) === String(employeeId));

    return courier?.colour ?? '#5D87FF';
  };

  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
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

  const makeCdnUrl = (rel?: string | null) => {
    if (!rel) return null;
    if (/^(data:|blob:|https?:\/\/)/i.test(rel)) return rel;
    const r = rel.startsWith('/') ? rel : `/${rel}`;
    return r.startsWith('/cdn/') ? `${BASE_URL}${r}` : `${BASE_URL}/cdn${r}`;
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
      console.log('CDN Response File URL:', fileUrl);

      if (!fileUrl) return null;

      // Tambahkan protokol jika belum ada
      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
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

  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // tampilkan preview lokal dulu
    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

    // ❗ Ini yang benar untuk reset input
    e.target.value = '';
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

  const handlePDFUploadFor =
    (formIndex: number, onChange: (fieldKey: string, value: any, idx: number) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const path = await uploadFileToCDN(file);
      if (path) onChange('answer_file', path, formIndex);

      e.target.value = ''; // reset input
    };
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

  const handleFormChange = (pageIndex: number, formIndex: number, field: string, value: any) => {
    setQuestionPages((prev) => {
      const updated = [...prev];
      updated[pageIndex].form[formIndex] = {
        ...updated[pageIndex].form[formIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const getAccessForDate = (date: dayjs.Dayjs) => {
    const dayIndex = date.day();

    const map: Record<number, { start: string; end: string }> = {
      0: { start: timeAccess.sunday, end: timeAccess.sunday_end },
      1: { start: timeAccess.monday, end: timeAccess.monday_end },
      2: { start: timeAccess.tuesday, end: timeAccess.tuesday_end },
      3: { start: timeAccess.wednesday, end: timeAccess.wednesday_end },
      4: { start: timeAccess.thursday, end: timeAccess.thursday_end },
      5: { start: timeAccess.friday, end: timeAccess.friday_end },
      6: { start: timeAccess.saturday, end: timeAccess.saturday_end },
    };

    return map[dayIndex];
  };

  const handleFormChangeGroup = (
    pageIndex: number,
    formIndex: number,
    field: string,
    value: any,
    memberIndex: number,
  ) => {
    setQuestionPages((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));

      // siapkan storage jawaban tiap member
      updated[pageIndex].form[formIndex].groupAnswers ??= [];
      updated[pageIndex].form[formIndex].groupAnswers[memberIndex] = value;

      return updated;
    });
  };

  const renderDetailRows = (
    itemList: any[] | any,
    key: string,
    onChange: (field: string, value: any, idx: number) => void,
  ) => {
    if (!Array.isArray(itemList)) {
      console.error('Expected array for details, but got:', itemList);
      return (
        <TableRow>
          <TableCell colSpan={5}>Invalid data format</TableCell>
        </TableRow>
      );
    }
    const filteredDetails = itemList;

    return filteredDetails.map((item, index) => {
      const key = `${index}`;
      if (
        item.field_type === 9 &&
        item.remarks === 'visitor_period_start' &&
        filteredDetails[index + 1]?.remarks === 'visitor_period_end'
      ) {
        const startItem = item;
        const endItem = filteredDetails[index + 1];

        return (
          <TableRow key={`pair-${index}`}>
            <TableCell colSpan={2} sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {startItem.long_display_text}
                    {startItem.mandatory && (
                      <Typography component="span" color="error">
                        *
                      </Typography>
                    )}
                  </Typography>

                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                    <DateTimePicker
                      ampm={false}
                      value={
                        startItem.answer_datetime
                          ? dayjs.utc(startItem.answer_datetime).local()
                          : null
                      }
                      format="ddd, DD - MMM - YYYY, HH:mm"
                      shouldDisableTime={(value) => {
                        if (!value || !timeAccess) return false;

                        const access = getAccessForDate(value);
                        if (!access) return false;

                        const { start, end } = access;
                        if (!start || !end) return false;

                        const toMinutes = (t: string) => {
                          if (!t) return null;
                          const [h, m] = t.split(':').map(Number);
                          return h * 60 + m;
                        };

                        const minMin = toMinutes(start);
                        const maxMin = toMinutes(end);
                        if (minMin === null || maxMin === null) return false;

                        const current = value.hour() * 60 + value.minute();

                        return current < minMin || current > maxMin;
                      }}
                      onChange={(newValue) => {
                        if (!newValue) return;
                        const utc = newValue.utc().format();
                        onChange('answer_datetime', utc, filteredDetails.indexOf(startItem));
                      }}
                      slotProps={{
                        textField: { fullWidth: true },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {endItem.long_display_text}
                    {endItem.mandatory && (
                      <Typography component="span" color="error">
                        *
                      </Typography>
                    )}
                  </Typography>

                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                    <DateTimePicker
                      ampm={false}
                      value={
                        endItem.answer_datetime ? dayjs.utc(endItem.answer_datetime).local() : null
                      }
                      minDateTime={
                        startItem.answer_datetime
                          ? dayjs.utc(startItem.answer_datetime).local()
                          : undefined
                      }
                      format="ddd, DD - MMM - YYYY, HH:mm"
                      shouldDisableTime={(value) => {
                        if (!value || !timeAccess) return false;

                        const access = getAccessForDate(value);
                        if (!access) return false;

                        const { start, end } = access;
                        if (!start || !end) return false;

                        const toMinutes = (t: string) => {
                          if (!t) return null;
                          const [h, m] = t.split(':').map(Number);
                          return h * 60 + m;
                        };

                        const minMin = toMinutes(start);
                        const maxMin = toMinutes(end);
                        if (minMin === null || maxMin === null) return false;

                        const current = value.hour() * 60 + value.minute();

                        return current < minMin || current > maxMin;
                      }}
                      onChange={(newValue) => {
                        if (!newValue) return;
                        const utc = newValue.utc().format();
                        onChange('answer_datetime', utc, filteredDetails.indexOf(endItem));
                      }}
                      slotProps={{
                        textField: { fullWidth: true },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </TableCell>
          </TableRow>
        );
      }

      if (item.field_type === 9 && item.remarks === 'visitor_period_end') {
        return null;
      }

      const previewSrc = getPreviewSrc(key, item.answer_file);
      const shownName = uploadNames[key] || fileNameFromAnswer(item.answer_file);

      return (
        <TableRow>
          <TableCell sx={{ py: 1, borderBottom: 'none' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
              {item.long_display_text}
              {item.mandatory && (
                <Typography component="span" color="error" sx={{ ml: 0.5, lineHeight: 1 }}>
                  *
                </Typography>
              )}
            </Typography>
            {(() => {
              switch (item.field_type) {
                case 0: // Text
                  return (
                    <TextField
                      size="small"
                      value={item.answer_text || ''}
                      onChange={(e) => onChange('answer_text', e.target.value, index)}
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
                      onChange={(e) => onChange('answer_text', e.target.value, index)}
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
                      onChange={(e) => onChange('answer_text', e.target.value, index)}
                      placeholder={item.remarks === 'email' ? '' : ''}
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
                  } else if (item.remarks === 'employee') {
                    options = allVisitorEmployee.map((emp: any) => ({
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
                          ? 'Enter at least 3 characters to search'
                          : 'Not found'
                      }
                      value={options.find((opt) => opt.value === item.answer_text) || null}
                      onChange={(_, newValue) =>
                        onChange('answer_text', newValue ? newValue.value : '', index)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
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
                  if (item.remarks === 'is_employee') {
                    const yesNoOptions = [
                      { value: 'true', name: 'Yes' },
                      { value: 'false', name: 'No' },
                    ];

                    return (
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={String(item.answer_text)}
                          onChange={(e) => onChange('answer_text', e.target.value, index)}
                          sx={{ flexDirection: 'row', gap: 2 }}
                        >
                          {yesNoOptions.map((opt) => (
                            <FormControlLabel
                              key={opt.value}
                              value={opt.value}
                              control={<Radio />}
                              label={opt.name}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    );
                  }
                  return (
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={String(item.answer_text)} // ✅ pastikan string
                        onChange={(e) => onChange('answer_text', e.target.value, index)}
                        sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                      >
                        {(item.multiple_option_fields || [])
                          .sort((a: any, b: any) => Number(a.value) - Number(b.value))
                          .map((opt: any, idx: number) => (
                            <FormControlLabel
                              key={idx}
                              value={String(opt.value)} // ✅ samain jadi string
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
                                  onChange('answer_text', newValue, index);
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
                      onChange={(e) => onChange('answer_datetime', e.target.value, index)}
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
                            onChange('answer_datetime', utc, index);
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
                          // id={`file-${key}`}
                          type="file"
                          accept="*"
                          hidden
                          ref={fileInputRef}
                          onChange={(e) =>
                            handleFileChangeForField(
                              e as React.ChangeEvent<HTMLInputElement>,
                              (url) => onChange('answer_file', url, index),
                              key,
                            )
                          }
                        />
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
                                    width: 350,
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                  }}
                                />
                                {/* <Typography variant="caption" noWrap>
                                  {shownName}
                                </Typography> */}
                                <Button
                                  color="error"
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 2, minWidth: 120 }}
                                  onClick={() =>
                                    handleRemoveFileForField(
                                      (item as any).answer_file,
                                      (url) => onChange('answer_file', url, index),
                                      key, // reset <input id=key>
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
                            <Button
                              onClick={() =>
                                handleRemoveFileForField(
                                  (item as any).answer_file,
                                  (url) => onChange('answer_file', url, index),
                                  key,
                                )
                              }
                              color="error"
                              sx={{ mr: 1 }}
                              startIcon={<IconTrash />}
                            >
                              Clear Foto
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleCaptureForField(
                                  (url) => onChange('answer_file', url, index),
                                  key,
                                )
                              }
                              startIcon={<IconCamera />}
                            >
                              Take Foto
                            </Button>
                            <Button
                              onClick={() => setOpenCamera(false)}
                              sx={{ ml: 1 }}
                              startIcon={<IconDeviceFloppy />}
                            >
                              Submit
                            </Button>
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
                          Supports: PDF, DOCX, JPG, PNG, up to
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
                                    width: 350,
                                    height: 200,
                                    borderRadius: 12,
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
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
                                      (url) => onChange('answer_file', url, index),
                                      key,
                                    )
                                  }
                                  startIcon={<IconTrash />}
                                >
                                  Remove
                                </Button>
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
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Upload File
                        </Typography>

                        <Typography variant="caption" color="textSecondary">
                          Supports: PDF, DOCX, JPG, PNG, up to
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
                              (url) => onChange('answer_file', url, index),
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
                                    width: 350,
                                    height: 200,
                                    borderRadius: 12,
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
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
                                      (url) => onChange('answer_file', url, index),
                                      key,
                                    )
                                  }
                                  startIcon={<IconTrash />}
                                >
                                  Remove
                                </Button>
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
                            <Button
                              onClick={() =>
                                handleRemoveFileForField(
                                  (item as any).answer_file,
                                  (url) => onChange('answer_file', url, index),
                                  key,
                                )
                              }
                              color="error"
                              sx={{ mr: 1 }}
                              startIcon={<IconTrash />}
                            >
                              Clear Foto
                            </Button>
                            <Button
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCaptureForField((url) => onChange('answer_file', url, index));
                              }}
                              startIcon={<IconCamera />}
                            >
                              Take Foto
                            </Button>
                            <Button
                              onClick={() => setOpenCamera(false)}
                              sx={{ ml: 1 }}
                              startIcon={<IconDeviceFloppy />}
                            >
                              Submit
                            </Button>
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
                      onChange={(e) => onChange('long_display_text', e.target.value, index)}
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

  const extractStartEndFromPayload = () => {
    let startUtc = null;
    let endUtc = null;

    for (const page of questionPages) {
      for (const f of page.form) {
        if (f.remarks === 'visitor_period_start') startUtc = f.answer_datetime;
        if (f.remarks === 'visitor_period_end') endUtc = f.answer_datetime;
      }
    }

    return {
      startLocal: startUtc ? dayjs(startUtc).local().toDate() : null,
      endLocal: endUtc ? dayjs(endUtc).local().toDate() : null,
    };
  };

  const getMemberStartEnd = (visitor: any) => {
    let start = null;
    let end = null;

    visitor.question_page.forEach((page: any) => {
      page.form.forEach((field: any) => {
        if (field.remarks === 'visitor_period_start') {
          start = new Date(field.answer_datetime);
        }
        if (field.remarks === 'visitor_period_end') {
          end = new Date(field.answer_datetime);
        }
      });
    });

    return { start, end };
  };

  // const handleSubmit = async () => {
  //   if (!selectedEvent) return;

  //   setLoading(true);
  //   try {
  //     const payload = buildSubmitPayload();
  //     console.log('payload', JSON.stringify(payload, null, 2));

  //     // ambil dari payload (not from drag)
  //     const { startLocal, endLocal } = extractStartEndFromPayload();

  //     let finalEvent;

  //     if (payload?.is_group) {
  //       // =========================
  //       //   GROUP EVENT
  //       // =========================

  //       // Ambil semua start & end dari payload.data_visitor
  //       const allStart = payload.data_visitor.flatMap((v: any) =>
  //         v.question_page.flatMap((p: any) =>
  //           p.form
  //             .filter((f: any) => f.remarks === 'visitor_period_start')
  //             .map((f: any) => new Date(f.answer_datetime)),
  //         ),
  //       );

  //       const allEnd = payload.data_visitor.flatMap((v: any) =>
  //         v.question_page.flatMap((p: any) =>
  //           p.form
  //             .filter((f: any) => f.remarks === 'visitor_period_end')
  //             .map((f: any) => new Date (f.answer_datetime)),
  //         ),
  //       );

  //       // Start = paling kecil
  //       const groupStart = new Date(Math.min(...allStart.map((d: any) => d.getTime())));
  //       // End = paling besar
  //       const groupEnd = new Date(Math.max(...allEnd.map((d: any) => d.getTime())));

  //       finalEvent = {
  //         ...selectedEvent,
  //         isGroup: true,
  //         members: payload.data_visitor.length,
  //         start: groupStart,
  //         end: groupEnd,
  //         colour: selectedEvent.colour ?? '#673ab7', // warna group tetap
  //         title: payload.group_name, // judul event untuk group
  //       };
  //     } else {
  //       // =========================
  //       //   SINGLE EVENT
  //       // =========================
  //       finalEvent = {
  //         ...selectedEvent,
  //         isGroup: false,
  //         start: startLocal ?? selectedEvent.start,
  //         end: endLocal ?? selectedEvent.end,
  //         colour: getColour(selectedEvent),
  //       };
  //     }

  //     // await createPrainvitationDelivery(token as string, payload);
  //     setEvents((prev) => [...prev, finalEvent]);

  //     reloadCalendar();
  //     showSwal('success', 'Praregister Successfully');
  //     setOpenDeliverySchedule(false);
  //     setSelectedEvent(null);
  //   } catch (error) {
  //     console.log(error);
  //     showSwal('error', 'Failed to create schedule.');
  //   } finally {
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 600);
  //   }
  // };

  const handleSubmit = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const payload = buildSubmitPayload();
      console.log('payload', JSON.stringify(payload, null, 2));

      const { startLocal, endLocal } = extractStartEndFromPayload();
      if (payload?.is_group) {
        const groupEvents = payload.data_visitor.map((visitor: any, index: number) => {
          const startField = visitor.question_page
            .flatMap((p: any) => p.form)
            .find((f: any) => f.remarks === 'visitor_period_start');

          const endField = visitor.question_page
            .flatMap((p: any) => p.form)
            .find((f: any) => f.remarks === 'visitor_period_end');

          const start = new Date(startField?.answer_datetime);
          const end = new Date(endField?.answer_datetime);

          // Ambil ID employee
          const employeeField = visitor.question_page
            .flatMap((p: any) => p.form)
            .find((f: any) => f.remarks === 'employee');

          const employeeId = employeeField?.answer_text;

          // Cari nama driver
          const driver = drivers.find((d) => d.id === employeeId);

          const employeeName = driver?.name ?? `Member ${index + 1}`;

          const courier = couriers.find((c) => String(c.employee_id) === String(employeeId));
          const colour = courier?.colour ?? '#5D87FF';

          return {
            ...selectedEvent,
            id: `${selectedEvent.id}-${index}`,
            title: employeeName,
            start,
            end,
            isGroup: true,
            parentGroupId: selectedEvent.id,
            colour: colour,
          };
        });

        await createPrainvitationDelivery(token as string, payload);

        setEvents((prev) => [...prev, ...groupEvents]);
      } else {
        const finalEvent = {
          ...selectedEvent,
          isGroup: false,
          start: startLocal ?? selectedEvent.start,
          end: endLocal ?? selectedEvent.end,
          colour: getColour(selectedEvent),
        };
        await createPrainvitationDelivery(token as string, payload);
        setEvents((prev) => [...prev, finalEvent]);
      }

      reloadCalendar();
      showSwal('success', 'Praregister Successfully');

      setOpenDeliverySchedule(false);
      setSelectedEvent(null);
    } catch (error) {
      console.log(error);
      showSwal('error', 'Failed to create schedule.');
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const isSlotDisabled = (date: Date) => {
    if (!timeAccess) {
      return false;
    }

    const day = dayjs(date).day();

    const map: Record<number, { start: string; end: string }> = {
      0: { start: timeAccess.sunday, end: timeAccess.sunday_end },
      1: { start: timeAccess.monday, end: timeAccess.monday_end },
      2: { start: timeAccess.tuesday, end: timeAccess.tuesday_end },
      3: { start: timeAccess.wednesday, end: timeAccess.wednesday_end },
      4: { start: timeAccess.thursday, end: timeAccess.thursday_end },
      5: { start: timeAccess.friday, end: timeAccess.friday_end },
      6: { start: timeAccess.saturday, end: timeAccess.saturday_end },
    };

    const access = map[day];

    if (!access || !access.start || !access.end) {
      return false;
    }

    // parse jam
    const [startH, startM] = access.start.split(':').map(Number);
    const [endH, endM] = access.end.split(':').map(Number);

    if ([startH, startM, endH, endM].some(isNaN)) {
      return false;
    }

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const currentMinutes = dayjs(date).hour() * 60 + dayjs(date).minute();

    const disabled = !(currentMinutes >= startMinutes && currentMinutes <= endMinutes);

    return disabled;
  };

  const updateVisitorPeriod = (start: Date, end: Date) => {
    setQuestionPages((prev) => {
      const newPages = JSON.parse(JSON.stringify(prev));

      for (const page of newPages) {
        for (const f of page.form) {
          if (f.remarks === 'visitor_period_start') {
            f.answer_datetime = dayjs(start).utc().format();
          }
          if (f.remarks === 'visitor_period_end') {
            f.answer_datetime = dayjs(end).utc().format();
          }
        }
      }

      return newPages;
    });
  };
  const handleCloseScheduleDialog = () => {
    setOpenDeliverySchedule(false);

    setTimeout(() => {
      setDraggedCourier(null);
      setIsDraggingOutside(false);
      setSelectedEvent(null);
      setTempEvent(null);
      setQuestionPages((prev) =>
        prev.map((page) => ({
          ...page,
          form: page.form.map((item: any) => ({
            ...item,
            answer_text: Array.isArray(item.answer_text) ? [] : '',
            answer_file: '',
            answer_datetime: '',
          })),
        })),
      );
      setPreviews({});
      setUploadNames({});

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setDragKey((k) => k + 1);
    }, 10);
  };

  const viewRef = useRef(Views.MONTH);

  const [detailDataInvitation, setDetailDataInvitation] = useState<any>({});
  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
  };

  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});

  const renderFieldInput = (
    field: any,
    index: number,
    onChange: (index: number, fieldKey: keyof any, value: any) => void,
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

          // 🔹 Build option list berdasarkan remarks
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
          const uniqueKey = opts?.uniqueKey ?? `${index}`;
          const inputVal = inputValues[uniqueKey as any] || '';

          return (
            <Autocomplete
              size="small"
              freeSolo // ✅ Biar tetap bisa diketik dari awal
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

          if (field.remarks === 'is_driving' || field.remarks === 'is_employee') {
            const options = [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ];
            const currentValue = field.answer_text ?? '';

            return (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={currentValue}
                  row
                  sx={{ minWidth: 130 }}
                  onChange={(e) => {
                    onChange(index, 'answer_text', e.target.value);
                  }}
                >
                  {options.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={opt.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
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

        // fallback default checkbox single

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

        case 9: {
          const localValue = field.answer_datetime
            ? dayjs.utc(field.answer_datetime).local()
            : null;

          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                ampm={false}
                value={localValue}
                format="ddd, DD - MMM - YYYY, HH:mm"
                shouldDisableTime={(value) => {
                  if (!value || !timeAccess) return false;

                  const access = getAccessForDate(value);
                  if (!access) return false;

                  const { start, end } = access;
                  if (!start || !end) return false;

                  const toMinutes = (t: string) => {
                    const [h, m] = t.split(':').map(Number);
                    return h * 60 + m;
                  };

                  const minMin = toMinutes(start);
                  const maxMin = toMinutes(end);
                  const current = value.hour() * 60 + value.minute();

                  return current < minMin || current > maxMin;
                }}
                minDateTime={
                  field.remarks === 'visitor_period_end'
                    ? (() => {
                        const start = field.__pairStartDatetime;
                        return start ? dayjs.utc(start).local() : undefined;
                      })()
                    : undefined
                }
                onChange={(newValue) => {
                  if (!newValue) return;
                  const utc = newValue.utc().format();
                  onChange(index, 'answer_datetime', utc);
                }}
                slotProps={{
                  textField: { fullWidth: true },
                }}
                sx={{ width: '300px' }}
              />
            </LocalizationProvider>
          );
        }

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
                  <Typography variant="subtitle1">Upload your file</Typography>
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
                  value={field.answer_file}
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
  const eventsToRender = tempEvent ? [...events, tempEvent] : events;

  const CustomAgendaEvent = ({ event }: any) => {
    const [agendaName, setAgendaName] = useState<any>('');

    useEffect(() => {
      const loadAgenda = async () => {
        try {
          const data = await getDeliveryScheduleInvitationById(token as string, event.id);
          setAgendaName(data?.collection || 'No Agenda');
        } catch (err) {
          setAgendaName('No Agenda');
        }
      };

      loadAgenda();
    }, [event.id]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>Name: {event.title}</span>
        <span>Agenda : {agendaName?.agenda} </span>
        <span>Parking Area : {agendaName?.parking_area}</span>
        <span>Parking Slot : {agendaName?.parking_slot}</span>
        <span>
          Time: {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </span>
      </div>
    );
  };

  const CustomWeekEvent = ({ event }: any) => {

  };
  return (
    <div>
      <DnDCalendar
        // key={`cal-${dragKey}`}
        localizer={localizer}
        events={eventsToRender}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultDate={defaultDate}
        onView={(view: any) => {
          viewRef.current = view;
          onViewChange && onViewChange(view || 'month');
        }}
        onRangeChange={(range) => {
          const realView = viewRef.current;
          if (onRangeChange && typeof onRangeChange === 'function') {
            onRangeChange(range, realView);
          }
        }}
        resizable={true}
        selectable={true}
        draggableAccessor={() => true}
        resourceAccessor={(event) => event.resource}
        resizableAccessor={() => true}
        onSelectSlot={handleSelectSlot}
        onEventDrop={moveEvent as any}
        onEventResize={resizeEvent as any}
        dragFromOutsideItem={dragFromOutsideItem as any}
        onDropFromOutside={onDropFromOutside as any}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onSelectEvent={(event) => handleOpenExistingEvent(event as any)}
        formats={{
          timeGutterFormat: (date) => moment(date).format('HH:mm'),
          eventTimeRangeFormat: ({ start, end }) =>
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          agendaTimeRangeFormat: ({ start, end }) =>
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          agendaTimeFormat: (date) => moment(date).format('HH:mm'),
          selectRangeFormat: ({ start, end }) =>
            `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`,
        }}
        slotPropGetter={(date) => {
          if (isSlotDisabled(date)) {
            return {
              className: 'rbc-disabled-slot',
              style: {
                backgroundColor: '#000',
                opacity: 0.6,
                pointerEvents: 'none',
              },
            };
          }
          return {};
        }}
        popup
        // showMultiDayTimes
        style={{ height: '80vh' }}
        eventPropGetter={(event: any) => ({
          style: {
            backgroundColor: event.colour || '#000',
            color: '#fff',
            borderRadius: 4,
            padding: '2px 4px',
            border: 'none',
            fontSize: 12,
          },
        })}
        components={{
          agenda: {
            event: CustomAgendaEvent,
          },
        }}
      />
      <Dialog
        open={openDeliverySchedule}
        onClose={handleCloseScheduleDialog}
        fullWidth
        // maxWidth="xl"
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
      >
        <DialogTitle>Praregist Delivery Staff</DialogTitle>
        <IconButton
          onClick={handleCloseScheduleDialog}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 1,
          }}
        >
          <IconX />
        </IconButton>

        <DialogContent dividers>
          {selectedEvent && (
            <Box mt={0}>
              {selectedEvent?.fromSlot && (
                <Box mb={0} mx={2}>
                  <Typography fontWeight={600} mb={1}>
                    Delivery Staff
                  </Typography>

                  <Autocomplete
                    options={drivers}
                    getOptionLabel={(opt) => opt.name}
                    value={drivers.find((d) => d.id === selectedEvent.driver_id) || null}
                    onChange={(_, value) => {
                      const courier = couriers.find((c) => c.employee.id === value?.id);

                      setSelectedEvent((prev: any) => ({
                        ...prev,
                        driver_id: value?.id ?? null,
                        title: value?.name ?? '',
                        colour: courier?.colour ?? prev.colour,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select Delivery Staff" fullWidth />
                    )}
                  />
                </Box>
              )}

              {selectedEvent?.isGroup ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {questionPages.flatMap((page) =>
                        page.form.map((f: any, idx: number) => (
                          <TableCell key={page.id + '-' + idx}>
                            <Typography fontWeight={600}>{f.long_display_text}</Typography>
                          </TableCell>
                        )),
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedEvent.members.map((member: any, memberIndex: number) => (
                      <TableRow key={memberIndex}>
                        {questionPages.flatMap((page, pageIndex) =>
                          page.form.map((field: any, fieldIndex: number) => {
                            const clonedField = {
                              ...field,
                              answer_text: field.groupAnswers?.[memberIndex] ?? '',
                              answer_datetime: field.groupAnswers?.[memberIndex] ?? '',
                              answer_file: field.groupAnswers?.[memberIndex] ?? '',
                            };

                            return (
                              <TableCell key={`${memberIndex}-${pageIndex}-${fieldIndex}`}>
                                {renderFieldInput(
                                  clonedField,
                                  fieldIndex,
                                  (idx, fieldKey, value) =>
                                    handleFormChangeGroup(
                                      pageIndex,
                                      fieldIndex,
                                      fieldKey as string,
                                      value,
                                      memberIndex,
                                    ),
                                  undefined,
                                  {
                                    showLabel: false,
                                    uniqueKey: `${memberIndex}-${pageIndex}-${fieldIndex}`,
                                  },
                                )}
                              </TableCell>
                            );
                          }),
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                questionPages.map((page, pageIndex) => (
                  <Box key={page.id} sx={{ mb: 1 }}>
                    <Table>
                      <TableBody>
                        {renderDetailRows(
                          page.form,
                          `page-${pageIndex}`,
                          (field, value, formIndex) =>
                            handleFormChange(pageIndex, formIndex, field, value),
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                ))
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <InvitationScheduleDetailDialog
        open={openInvitationDetail}
        onClose={() => setOpenInvitationDetail(false)}
        data={detailDataInvitation}
      />
      <Dialog
        open={openDialogReschedule}
        onClose={() => setOpenDialogReschedule(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Reschedule Invitation</DialogTitle>
        <IconButton
          onClick={() => setOpenDialogReschedule(false)}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 1,
          }}
        >
          <IconX />
        </IconButton>

        <DialogContent dividers>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                New Visit Start
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                <DateTimePicker
                  ampm={false}
                  value={rescheduleData.newStart ? dayjs(rescheduleData.newStart) : null}
                  onChange={(v) => {
                    const d = v ? v.toDate() : null;
                    setRescheduleData((s) => ({
                      ...s,
                      newStart: d,
                      newEnd: s.newEnd && d && s.newEnd < d ? d : s.newEnd,
                    }));
                  }}
                  format="ddd, DD - MMM - YYYY, HH:mm"
                  shouldDisableTime={(value) => {
                    if (!value || !timeAccess) return false;

                    const access = getAccessForDate(value);
                    if (!access) return false;

                    const { start, end } = access;
                    if (!start || !end) return false;

                    const toMin = (t: any) => {
                      const [h, m] = t.split(':').map(Number);
                      return h * 60 + m;
                    };

                    const minMin = toMin(start);
                    const maxMin = toMin(end);
                    const current = value.hour() * 60 + value.minute();

                    return current < minMin || current > maxMin; // disable outside window
                  }}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                New Visit End
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                <DateTimePicker
                  ampm={false}
                  value={rescheduleData.newEnd ? dayjs(rescheduleData.newEnd) : null}
                  minDateTime={rescheduleData.newStart ? dayjs(rescheduleData.newStart) : undefined}
                  onChange={(v) => {
                    const d = v ? v.toDate() : null;
                    setRescheduleData((s) => ({ ...s, newEnd: d }));
                  }}
                  format="ddd, DD - MMM - YYYY, HH:mm"
                  shouldDisableTime={(value) => {
                    if (!value || !timeAccess) return false;

                    const access = getAccessForDate(value);
                    if (!access) return false;

                    const { start, end } = access;
                    if (!start || !end) return false;

                    const toMin = (t: any) => {
                      const [h, m] = t.split(':').map(Number);
                      return h * 60 + m;
                    };

                    const minMin = toMin(start);
                    const maxMin = toMin(end);
                    const current = value.hour() * 60 + value.minute();

                    return current < minMin || current > maxMin;
                  }}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleSubmitReschedule}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: 999999,
          }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Portal>
    </div>
  );
}
