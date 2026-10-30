import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useVisitorType } from 'src/hooks/VisitorType/useVisitorType';
import useInvitationVisitorType from 'src/hooks/Invitation/useInvitationVisitorType';
import { useInvitationVisitorEmployee } from 'src/hooks/Invitation/useInvitationVisitorEmployee';
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useDebounce } from 'src/hooks/useDebounce';
import dayjs, { Dayjs } from 'dayjs';
import { PickersDay } from '@mui/x-date-pickers';
import { Stack } from '@mui/system';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

interface VisitorFilterSidebarProps {
  mdUp: boolean;
  selectedHostId?: string;
  onHostChange?: (id: string) => void;
  filters?: any;
  setFilters?: React.Dispatch<React.SetStateAction<any>>;
  onDateRangeChange?: any;
}

const VisitorFilterSidebar = ({
  mdUp,
  selectedHostId,
  onHostChange,
  filters,
  setFilters,
  onDateRangeChange,
}: VisitorFilterSidebarProps) => {
  const { visitorType = [] } = useInvitationVisitorType();
  const [searchEmployee, setSearchEmployee] = useState('');

  const debouncedSearch = useDebounce(searchEmployee, 500);

  const { data: visitorEmployee = [], isLoading } = useInvitationVisitorEmployee({
    search: debouncedSearch,
    start: 0,
    length: 10,
  });
  const dateRange: [Dayjs | null, Dayjs | null] = [
    filters.start_date ? dayjs(filters.start_date) : null,
    filters.end_date ? dayjs(filters.end_date) : null,
  ];
  const handleDateChange = (date: Dayjs | null) => {
    if (!date) return;

    const [start, end] = dateRange;

    let newStart: Dayjs | null;
    let newEnd: Dayjs | null;

    if (!start || end) {
      newStart = date;
      newEnd = null;
    } else if (date.isBefore(start, 'day')) {
      newStart = date;
      newEnd = null;
    } else {
      newStart = start;
      newEnd = date;
    }

    const startDate = newStart?.format('YYYY-MM-DD') ?? '';
    const endDate = newEnd?.format('YYYY-MM-DD') ?? '';

    setFilters((prev: any) => ({
      ...prev,
      start_date: startDate,
      end_date: endDate,
    }));

    // Trigger filter API setelah start dan end date terpilih
    if (startDate && endDate) {
      onDateRangeChange?.(startDate, endDate);
    }
  };

  const CustomDay = (props: any) => {
    const { day, outsideCurrentMonth, ...other } = props;

    const [start, end] = dateRange;

    const isStart = start?.isSame(day, 'day') ?? false;
    const isEnd = end?.isSame(day, 'day') ?? false;

    const isBetween = start && end && day.isAfter(start, 'day') && day.isBefore(end, 'day');

    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          ...(isBetween && {
            backgroundColor: 'action.selected',
            borderRadius: 0,
          }),

          ...(isStart && {
            backgroundColor: (theme) => `${theme.palette.primary.main} !important`,
            color: '#fff !important',
            borderRadius: '50% 0 0 50%',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }),

          ...(isEnd && {
            backgroundColor: (theme) => `${theme.palette.primary.main} !important`,
            color: '#fff !important',
            borderRadius: '0 50% 50% 0',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }),
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        width: mdUp ? 330 : '100%',
        boxSizing: 'border-box',
        borderRight: '1px solid #eee',
        p: 2,
        pt: 2,
        overflowY: 'auto',
        height: { xs: '100%', md: '80vh' },
      }}
    >
      {/* Calendar */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box>
          <DateCalendar
            value={dateRange[1] ?? dateRange[0]}
            onChange={handleDateChange}
            slots={{
              day: CustomDay,
            }}
            sx={{
              width: 260,
              height: 280,
              mx: 'auto',
              '& .MuiPickersCalendarHeader-root': {
                px: 1,
                mt: 1,
                mb: 0,
              },
              '& .MuiPickersCalendarHeader-label': {
                fontSize: '0.85rem',
              },
              '& .MuiDayCalendar-weekDayLabel': {
                width: 30,
                height: 30,
                fontSize: '0.75rem',
                m: 0,
              },
              '& .MuiPickersDay-root': {
                width: 30,
                height: 30,
                fontSize: '0.75rem',
                m: 0,
              },
              '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
                justifyContent: 'space-around',
                m: 0,
              },
            }}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {dateRange[0]?.format('DD MMM YYYY') ?? '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {dateRange[1]?.format('DD MMM YYYY') ?? '-'}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => {
                setFilters((prev: any) => ({
                  ...prev,
                  start_date: '',
                  end_date: '',
                }));

                onDateRangeChange?.('', '');
              }}
            >
              Reset
            </Button>
          </Stack>
        </Box>
      </LocalizationProvider>

      <Divider sx={{ mt: 0, mb: 1 }} />

      {/* Quick Filters */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={14} fontWeight={700} mb={1}>
          Quick Filters
        </Typography>

        {[
          { label: 'All Transactions', count: 0 },
          { label: 'Today', count: 0 },
          { label: 'Check In', count: 0 },
          { label: 'Check Out', count: 0 },
          { label: 'Waiting', count: 0 },
          { label: 'Available', count: 0 },
        ].map((item, index) => (
          <Box
            key={item.label}
            onClick={() => console.log(item.label)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
              py: 0.65,
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: index === 0 ? 'primary.light' : 'transparent',
              color: index === 0 ? 'primary.main' : 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography fontSize={13}>{item.label}</Typography>
            <Typography fontSize={12} color="text.secondary">
              {item.count}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Employee */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={14} fontWeight={700} mb={1}>
          Satuan Kerja (Satker)
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search employee..."
          value={searchEmployee}
          sx={{ mb: 1 }}
          onChange={(e) => setSearchEmployee(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
        />
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 0.4,
                  gap: 1,
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width={18}
                  height={18}
                  sx={{ borderRadius: '3px' }}
                />
                <Skeleton variant="text" width={`${60 + (index % 3) * 15}%`} height={24} />
              </Box>
            ))
          : visitorEmployee.map((item: any) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 0.4,
                }}
              >
                <FormControlLabel
                  sx={{
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 14,
                    },
                  }}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ p: 0.4 }}
                      checked={selectedHostId === item.id}
                      onChange={(e) => {
                        if (onHostChange) {
                          onHostChange(e.target.checked ? item.id : '');
                        }
                      }}
                    />
                  }
                  label={item.name}
                />
              </Box>
            ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Visitor Type */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={14} fontWeight={700} mb={1}>
          Visitor Type
        </Typography>

        {visitorType.map((item: any) => (
          <FormControlLabel
            key={item.id}
            sx={{
              m: 0,
              display: 'flex',
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
              },
            }}
            control={<Checkbox size="small" sx={{ p: 0.4 }} />}
            label={item.name}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Recurring */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={14} fontWeight={700} mb={1}>
          Recurring
        </Typography>

        {[
          { label: 'All', count: 0 },
          { label: 'One-time', count: 0 },
          { label: 'Recurring', count: 0 },
        ].map((item, index) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <FormControlLabel
              sx={{
                m: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: 14,
                },
              }}
              control={<Checkbox size="small" sx={{ p: 0.4 }} />}
              label={item.label}
            />

            <Typography fontSize={12} color="text.secondary">
              {item.count}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VisitorFilterSidebar;
