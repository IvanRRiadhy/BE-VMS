import { Box, Checkbox, Divider, FormControlLabel, TextField, Typography } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface VisitorFilterSidebarProps {
  mdUp: boolean;
}

const VisitorFilterSidebar = ({ mdUp }: VisitorFilterSidebarProps) => {
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
          { label: 'Upcoming', count: 32 },
          { label: 'Checked In', count: 154 },
          { label: 'Pending Approval', count: 18 },
          { label: 'Denied / Blocked', count: 1 },
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
        <Typography fontSize={12} fontWeight={700} mb={1}>
          Employee
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          sx={{
            mb: 1,
            '& .MuiInputBase-root': {
              fontSize: 11,
              height: 30,
            },
          }}
        />

        {[
          { label: 'DPU', count: 61 },
          { label: 'DLDS', count: 0 },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
              control={<Checkbox size="small" sx={{ p: 0.4 }} />}
              label={item.label}
            />

            <Typography fontSize={13} color="text.secondary">
              {item.count}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Visitor Type */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={12} fontWeight={700} mb={1}>
          Visitor Type
        </Typography>

        {['Employee', 'Guest', 'Contractor'].map((item) => (
          <FormControlLabel
            key={item}
            sx={{
              m: 0,
              display: 'flex',
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
              },
            }}
            control={<Checkbox size="small" sx={{ p: 0.4 }} />}
            label={item}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Recurring */}
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={12} fontWeight={700} mb={1}>
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
              control={<Checkbox size="small" sx={{ p: 0.4 }} defaultChecked={index === 2} />}
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
