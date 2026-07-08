import { useState } from 'react';
import { Box, Button, Drawer, Grid2 as Grid, Typography } from '@mui/material';
import { IconCalendar, IconDownload } from '@tabler/icons-react';
import Calendar from 'src/customs/components/calendar/Calendar';

type DashboardActionBarProps = {
  startDate: any;
  endDate: any;
  onDateChange: (startDate: Date, endDate: Date) => void;
  onExport: () => void;
  isExporting?: boolean;
};

const DashboardEmployeeActionBar = ({
  startDate,
  endDate,
  onDateChange,
  onExport,
  isExporting = false,
}: DashboardActionBarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={1}>
        <Grid
          size={{ xs: 12, lg: 12 }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          sx={{ mt: 0.5 }}
        >
          <Button
            size="small"
            sx={{
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #d1d1d1',
              ':hover': {
                backgroundColor: '#d1d1d1',
                color: 'black',
              },
            }}
            startIcon={<IconCalendar size={18} />}
            onClick={() => setOpen(true)}
          >
            {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<IconDownload />}
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </Grid>
      </Grid>

      <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Select Date Range
          </Typography>

          <Calendar
            value={{ startDate, endDate }}
            onChange={(selection: any) => {
              onDateChange(selection.startDate, selection.endDate);
              setOpen(false);
            }}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default DashboardEmployeeActionBar;
