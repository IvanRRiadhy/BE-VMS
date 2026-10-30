import {
  Box,
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

interface VisitorFilterSidebarProps {
  mdUp: boolean;
  selectedHostId: string;
  onHostChange: (id: string) => void;
}

const VisitorFilterSidebar = ({ mdUp, selectedHostId, onHostChange }: VisitorFilterSidebarProps) => {
  const { visitorType = [] } = useInvitationVisitorType();
  const [searchEmployee, setSearchEmployee] = useState('');

  const debouncedSearch = useDebounce(searchEmployee, 500);

  const { data: visitorEmployee = [], isLoading } = useInvitationVisitorEmployee({
    search: debouncedSearch,
    start: 0,
    length: 10,
  });
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
        <DateCalendar
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
      </LocalizationProvider>

      <Divider sx={{ mt: 0, mb: 1 }} />

      {/* Quick Filters */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={14} fontWeight={700} mb={1}>
          Quick Filters
        </Typography>

        {[
          { label: 'All Transactions', count: 207 },
          { label: 'Today', count: 12 },
          { label: 'Check In', count: 154 },
          { label: 'Check Out', count: 32 },
          { label: 'Waiting', count: 18 },
          { label: 'Available', count: 1 },
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
                        onHostChange(e.target.checked ? item.id : '');
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
          { label: 'All', count: 207 },
          { label: 'One-time', count: 146 },
          { label: 'Recurring', count: 61 },
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
