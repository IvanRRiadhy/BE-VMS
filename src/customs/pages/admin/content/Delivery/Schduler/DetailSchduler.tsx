import { FC, useState, useMemo, useRef, useEffect } from 'react';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  Autocomplete,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Portal,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { useMediaQuery } from '@mui/system';
import {
  IconArrowLeft,
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Calendar, Views } from 'react-big-calendar';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllDriver, getVisitorDriver } from 'src/customs/api/Delivery/Driver';
import {
  createDeliveryStaffRegister,
  deleteDeliveryStaffRegister,
  getDeliveryStaffRegister,
  updateDeliveryStaffRegister,
} from 'src/customs/api/Delivery/StaffRegister';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import dayjs from 'dayjs';
import DnDOutsideCourier from './SchedulerCalendar';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { momentLocalizer } from 'react-big-calendar';
import { dayjsLocalizer } from 'react-big-calendar';
import { getCalendarSchedule, getSchedulerDeliveryById } from 'src/customs/api/Delivery/Scheduler';
import { getTimezoneById } from 'src/customs/api/admin';
import { BASE_URL } from 'src/customs/api/interceptor';
import PageContainers from 'src/components/container/PageContainer';

export interface Employee {
  id: string;
  name: string;
  faceimage?: string;
  email?: string;
  phone?: string;
}

export interface Courier {
  id: string;
  employee_id: string;
  delivery_schedule_id: string;
  group_delivery_staff_id?: string | null;
  group_name?: string | null;
  colour?: string | null;

  employee: Employee;
}

export interface CourierGroup {
  id: string;
  colour?: string | null;
  groupName?: string | null;
  items: Courier[];
}

const ManageDetailScheduler: FC = () => {
  const { token } = useSession();
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  // const localizer = momentLocalizer(moment);
  const localizer = dayjsLocalizer(dayjs);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [openForm, setOpenForm] = useState(false);
  const [isDraggingOutside, setIsDraggingOutside] = useState(false);

  const [couriers, setCouriers] = useState<any[]>([]);
  const [deliveryStaff, setDeliveryStaff] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [selectedDeliveryData, setSelectedDeliveryData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // const draggedCourier = useRef<any | null>(null);
  const [draggedCourier, setDraggedCourier] = useState<any | null>(null);
  const secdrawerWidth = 260;
  const [selectedHead, setSelectedHead] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllDriver(token as string);
      setAllStaff(res.collection);
    };
    fetchData();
  }, [token]);

  const loadRegisteredCouriers = async () => {
    try {
      const res = await getDeliveryStaffRegister(token as string, id);
      const withColors = res.collection.map((c: any) => ({
        ...c,
        colour: c.colour || '#000',
      }));

      setCouriers(withColors);
    } catch (err) {
      console.error(err);
    }
  };

  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setOpenGroup((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const colorOptions = [
    '#FF6633',
    '#FF33FF',
    '#00B3E6',
    '#E6B333',
    '#3366E6',
    '#999966',
    '#99FF99',
    '#B34D4D',
    '#80B300',
    '#809900',
    '#E6B3B3',
    '#6680B3',
  ];

  const loadDeliveryStaff = async () => {
    try {
      const res = await getVisitorDriver(token as string, id as string);
      setDeliveryStaff(res.collection);
    } catch (err) {
      console.error(err);
    }
  };

  const [timeAccess, setTimeAccess] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const loadSchedule = async (startDate: any, endDate: any) => {
    // Ambil detail scheduler (bukan range-based)
    const res = await getSchedulerDeliveryById(token as string, id as string);
    const timeAccessId = res.collection.time_access_id;
    const resTA = await getTimezoneById(token as string, timeAccessId);
    setTimeAccess(resTA.collection);

    // Ambil data schedule sesuai range
    const scheduleRes = await getCalendarSchedule(
      token as string,
      id as string,
      startDate,
      endDate,
    );

    const colourMap: Record<string, string> = {};
    couriers.forEach((c) => {
      if (c.employee_id) colourMap[c.employee_id] = c.colour;
    });

    const mappedEvents = scheduleRes.collection.map((item: any) => {
      const employeeId = item.employee_id;

      return {
        id: item.id,
        title: item.visitor_name,
        start: dayjs(item.visitor_period_start + 'Z')
          .local()
          .toDate(),
        end: dayjs(item.visitor_period_end + 'Z')
          .local()
          .toDate(),
        // start: moment.utc(item.visitor_period_start).local().toDate(),
        // end: moment.utc(item.visitor_period_end).local().toDate(),
        // start: dayjs.utc(item.visitor_period_start).local().toDate(),
        // end: dayjs.utc(item.visitor_period_end).local().toDate(),
        colour: colourMap[employeeId] || '#000',
      };
    });
    // console.log('mappedEvents', mappedEvents);

    setEvents(mappedEvents);
  };

  const [currentView, setCurrentView] = useState(Views.MONTH);
  const viewRef = useRef(Views.MONTH);

  function normalizeRange(range: any, view: string) {
    // console.log('🟦 normalizeRange CALLED — view:', view);
    // console.log('📦 raw range:', range);
    // // WEEK — Range selalu array 7 hari
    if (view === Views.WEEK) {
      if (Array.isArray(range) && range.length === 7) {
        return {
          start: dayjs(range[0]).startOf('day').toDate(),
          end: dayjs(range[6]).endOf('day').toDate(),
        };
      }
    }

    // MONTH — 42 hari
    if (view === Views.MONTH) {
      let dates: Date[];

      // Jika array → RBC 42 hari
      if (Array.isArray(range)) {
        dates = range;
      } else {
        dates = Array.from({ length: 42 }, (_, i) => dayjs(range.start).add(i, 'day').toDate());
      }

      // Temukan tanggal yang benar-benar berada pada bulan ini
      const middle = dates[Math.floor(dates.length / 2)];
      const midMonth = dayjs(middle).month();

      return {
        start: dayjs(middle).startOf('month').toDate(),
        end: dayjs(middle).endOf('month').toDate(),
      };
    }

    // DAY
    if (view === Views.DAY) {
      if (range?.start) return range;
      return { start: range, end: range };
    }

    return { start: null, end: null };
  }

  const [lastRange, setLastRange] = useState({ start: null, end: null });
  const handleRangeChange = (range: any, view: any) => {
    const activeView = view || currentView;

    if (activeView === Views.WEEK) {
      console.log('📅 RAW WEEK RANGE:', range);

      if (Array.isArray(range) && range.length === 7) {
        const start = dayjs(range[0]).startOf('day').toDate();
        const end = dayjs(range[6]).endOf('day').toDate();

        setLastRange({ start, end } as any);

        loadSchedule(dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD'));

        return;
      }
    }

    const { start, end } = normalizeRange(range, activeView);

    setLastRange({ start, end });

    loadSchedule(dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD'));
  };

  useEffect(() => {
    loadDeliveryStaff();
    loadRegisteredCouriers();
  }, [token]);

  useEffect(() => {
    if (couriers.length > 0) {
      const start = dayjs().startOf('month').subtract(1, 'day').format('YYYY-MM-DD');
      const end = dayjs().endOf('month').format('YYYY-MM-DD');
      loadSchedule(start, end);
    }
  }, [couriers]);

  const handleDragStart = (courier: any) => {
    const res = setDraggedCourier({
      id: courier?.id as string,
      name: courier.employee.name,
      colour: courier.colour,
      employee_id: courier.employee_id,
      group_delivery_staff_id: courier.group_delivery_staff_id,
    });
    setIsDraggingOutside(true);
  };

  const [forceChild, setForceChild] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDeliveryData) {
      showSwal('error', 'Please select Delivery Staff');
      return;
    }

    try {
      setLoading(true);

      // const isHead = selectedHead == null;
      const isHead = !forceChild;

      const payload = {
        employee_id: selectedDeliveryData.id,
        delivery_schedule_id: id,
        colour: selectedColor || '#333',
        group_name: isHead ? selectedDeliveryData.name : selectedHead.name,
        group_delivery_staff_id: isHead ? null : selectedHead.id,
      };
      console.log('payload', payload);

      if (isEditMode && editingId) {
        await updateDeliveryStaffRegister(token as string, payload, editingId);
        showSwal('success', 'Delivery Staff updated successfully!');
      } else {
        await createDeliveryStaffRegister(token as string, payload);
        showSwal('success', 'Delivery Staff added successfully!');
      }

      await loadRegisteredCouriers();

      setSelectedDeliveryData(null);
      setSelectedHead(null);
      setSelectedColor('');
      setIsEditMode(false);
      setEditingId(null);
      setForceChild(false);
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      showSwal('error', isEditMode ? 'Failed to update staff.' : 'Failed to add staff.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    const confirmed = await showConfirmDelete('Are you sure to delete this Delivery Staff?');
    if (!confirmed) return;

    try {
      await deleteDeliveryStaffRegister(token as string, staffId);
      await loadRegisteredCouriers();
      showSwal('success', 'Delivery Staff deleted successfully!');
    } catch (error) {
      console.log(error);
      showSwal('error', 'Failed to delete Delivery Staff.');
    }
  };

  // const groupCouriers = (couriers: Courier[]): CourierGroup[] => {
  //   const groups: Record<string, CourierGroup> = {};

  //   couriers.forEach((c) => {
  //     const isHead = c.group_delivery_staff_id == null;
  //     console.log('isHead', isHead);

  //     const groupId = isHead ? c.id : c.group_delivery_staff_id!;
  //     console.log('groupId', groupId);

  //     if (!groups[groupId]) {
  //       groups[groupId] = {
  //         id: groupId,
  //         colour: c.colour ?? undefined,
  //         groupName: c.group_name ?? undefined,
  //         items: [],
  //       };
  //     }

  //     groups[groupId].items.push(c);
  //   });

  //   return Object.values(groups);
  // };

  const groupCouriers = (couriers: Courier[]): CourierGroup[] => {
    const groups: Record<string, CourierGroup> = {};

    // 1️⃣ Kelompokkan dulu TANPA mikirin warna/nama
    couriers.forEach((c) => {
      const groupId = c.group_delivery_staff_id == null ? c.id : c.group_delivery_staff_id;

      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          items: [],
        };
      }

      groups[groupId].items.push(c);
    });

    // 2️⃣ Tentukan HEAD secara eksplisit
    return Object.values(groups).map((group) => {
      const head = group.items.find((x) => x.group_delivery_staff_id == null) ?? group.items[0];

      return {
        id: group.id,
        colour: head.colour, 
        groupName: head.employee.name, 
        items: [head, ...group.items.filter((x) => x !== head)],
      };
    });
  };
  const filtered = couriers.filter((c) =>
    c.employee.name.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedCouriers = groupCouriers(filtered);

  const handleEdit = async (id: string) => {
    const staff = couriers.find((x) => x.id === id);
    console.log('staff', staff);
    if (!staff) return;

    setIsEditMode(true);
    setEditingId(id);

    const employee = allStaff.find((e) => e.id === staff.employee_id);
    // console.log('employee', employee);
    setSelectedDeliveryData(employee ?? null);

    if (staff.group_delivery_staff_id) {
      const headCourier = allStaff.find((x) => x.id === staff.group_delivery_staff_id);
      // console.log('headCourier', headCourier);

      // if (headCourier) {
      //   const headEmployee = allStaff.find((e) => e.id === headCourier.employee_id);
      //   console.log('headEmployee', headEmployee);
      setSelectedHead(headCourier ?? null);
      // } else {
      //   setSelectedHead(null);
      // }
    } else {
      setSelectedHead(null);
    }

    setSelectedColor(staff.colour || '#333');
    setOpenForm(true);
  };

  const resetForm = () => {
    setSelectedDeliveryData(null);
    setSelectedHead(null);
    setSelectedColor('');
  };

  const handleCloseForm = () => {
    resetForm();
    setIsEditMode(false);
    setOpenForm(false);
  };

  const headStaffOptions = useMemo(() => {
    if (!selectedDeliveryData) return allStaff;

    return allStaff.filter((staff) => staff.id !== selectedDeliveryData.id);
  }, [allStaff, selectedDeliveryData]);

  const handleAddUnderHead = (group: CourierGroup) => {
    const headCourier = group.items[0];

    setSelectedHead({
      id: headCourier.id,
      name: headCourier.employee.name,
    });

    setIsEditMode(false);
    setForceChild(true);
    setSelectedDeliveryData(null);
    setEditingId(null);
    setOpenForm(true);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <PageContainers title="Calendar">
        <Box
          sx={{ display: 'flex', flexDirection: mdUp ? 'row' : 'column', backgroundColor: '#fff' }}
        >
          <Box sx={{ width: mdUp ? secdrawerWidth : '100%', p: 2, borderRight: '1px solid #eee' }}>
            <Tooltip title="Go back to previous page" arrow>
              <Button
                size="small"
                variant="contained"
                startIcon={<IconArrowLeft size={18} />}
                onClick={() => navigate('/admin/manage/delivery/scheduler')}
                sx={{ mb: 2 }}
              >
                Back
              </Button>
            </Tooltip>

            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontSize="1rem">
                Corporate Service
              </Typography>

              <Button
                size="small"
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => setOpenForm(true)}
              >
                Add
              </Button>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="Search Delivery Staff"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            {groupedCouriers.map((group) => {
              const isSingle = group.items.length === 1;

              return (
                <Box key={group.id} sx={{ mb: 1 }}>
                  <Box
                    draggable
                    onDragStart={() => handleDragStart(group.items[0])}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      mb: isSingle ? 1 : 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: group.colour || '#000',
                      color: '#fff',
                    }}
                    onClick={() => !isSingle && toggleGroup(group.id)}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{ width: 30, height: 30 }}
                        src={`${BASE_URL}/cdn/${group.items[0].employee.faceimage}`}
                      />
                      <Typography>
                        {isSingle ? group.items[0].employee.name : `${group.groupName}`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {!isSingle && (
                        <IconChevronDown
                          style={{
                            transform: openGroup[group.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: '0.2s',
                          }}
                        />
                      )}

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddUnderHead(group);
                        }}
                        sx={{
                          backgroundColor: '#5c87ff',
                          borderRadius: '50%',
                          '&:hover': { backgroundColor: '#f0f0f0' },
                        }}
                      >
                        <IconPlus style={{ color: 'white', width: 16, height: 16 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleEdit(group.items[0].id)}
                        sx={{
                          backgroundColor: '#FA896B',
                          borderRadius: '50%',
                          '&:hover': { backgroundColor: '#f0f0f0' },
                        }}
                      >
                        <IconPencil style={{ color: 'white', width: 16, height: 16 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDelete(group.items[0].id)}
                        sx={{
                          backgroundColor: 'red',
                          borderRadius: '50%',
                          '&:hover': { backgroundColor: '#f0f0f0' },
                        }}
                      >
                        <IconTrash style={{ color: 'white', width: 16, height: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {!isSingle && (
                    <Collapse in={openGroup[group.id]}>
                      {group.items.slice(1).map((c) => (
                        <Box
                          key={c.id}
                          draggable
                          onDragStart={() => handleDragStart(c)}
                          sx={{
                            p: 1,
                            mt: 0.5,
                            backgroundColor: c.colour,
                            borderRadius: 1,
                            marginLeft: '20px',
                            border: '1px solid #eee',
                            display: 'flex',
                            cursor: 'pointer',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: '#fff',
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{ width: 30, height: 30 }}
                              src={`${BASE_URL}/cdn/${c.employee.faceimage}`}
                            />
                            <Typography>{c.employee.name}</Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: '5px' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(c.id)}
                              sx={{
                                backgroundColor: '#FA896B',
                                borderRadius: '50%',
                                '&:hover': { backgroundColor: '#f0f0f0' },
                              }}
                            >
                              <IconPencil style={{ color: 'white', width: 16, height: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(c.id)}
                              sx={{
                                backgroundColor: 'red',
                                borderRadius: '50%',
                                '&:hover': { backgroundColor: '#f0f0f0' },
                              }}
                            >
                              <IconTrash style={{ color: 'white', width: 16, height: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Calendar */}
          <Box flexGrow={1} p={2} height="100%">
            <DnDOutsideCourier
              draggedCourier={draggedCourier}
              setDraggedCourier={setDraggedCourier}
              isDraggingOutside={isDraggingOutside}
              setIsDraggingOutside={setIsDraggingOutside}
              localizer={localizer}
              couriers={couriers}
              events={events}
              setEvents={setEvents}
              timeAccess={timeAccess}
              currentView={currentView}
              setCurrentView={setCurrentView}
              onRangeChange={handleRangeChange}
              onViewChange={(view) => {
                viewRef.current = view;
                setCurrentView(view);
              }}
              loadSchedule={loadSchedule}
              lastRange={lastRange}
            />
          </Box>
        </Box>

        <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
          <DialogTitle>
            {isEditMode ? 'Edit Delivery Staff' : 'Add  Delivery Staff'}
            <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleCloseForm}>
              <IconX />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                  Delivery Staff
                </CustomFormLabel>
                <Autocomplete
                  options={deliveryStaff}
                  getOptionLabel={(option) => option.name}
                  value={selectedDeliveryData}
                  onChange={(event, newValue) => setSelectedDeliveryData(newValue)}
                  renderInput={(params) => <CustomTextField {...params} />}
                  disabled={isEditMode}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Head Delivery Staff</CustomFormLabel>
                <Autocomplete
                  // options={deliveryStaff.filter((x) => x.id !== selectedDeliveryData?.id)}
                  options={headStaffOptions}
                  getOptionLabel={(option) => option.name}
                  value={selectedHead}
                  onChange={(event, newValue) => setSelectedHead(newValue)}
                  renderInput={(params) => <CustomTextField {...params} />}
                  disabled={isEditMode}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Colour</CustomFormLabel>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {colorOptions.map((color) => (
                    <Box
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: selectedColor === color ? '3px solid #000' : '2px solid #ccc',
                        backgroundColor: color,
                        transition: '0.2s',
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Portal>
          <Backdrop open={loading} sx={{ zIndex: 999999, color: '#fff' }}>
            <CircularProgress color="primary" />
          </Backdrop>
        </Portal>
      </PageContainers>
    </PageContainer>
  );
};

export default ManageDetailScheduler;
