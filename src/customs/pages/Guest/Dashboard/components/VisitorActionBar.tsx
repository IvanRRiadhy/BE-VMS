import { Box, Button, Drawer, Typography } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { IconCalendar, IconDownload } from '@tabler/icons-react';

import Calendar from 'src/customs/components/calendar/Calendar';

type Props = {
  open: boolean;
  startDate: Date;
  endDate: Date;
  isExporting?: boolean;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  onDateChange: (selection: { startDate: Date; endDate: Date }) => void;
  onExport: () => void;
};

const VisitorActionBar = ({
  open,
  startDate,
  endDate,
  isExporting = false,
  onOpenCalendar,
  onCloseCalendar,
  onDateChange,
  onExport,
}: Props) => {
  return (
    <Grid
      size={{ xs: 12, lg: 12 }}
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={2}
      sx={{ mt: 0.5, mb: 2 }}
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
        onClick={onOpenCalendar}
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

      <Drawer open={open} anchor="right" onClose={onCloseCalendar}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Select Date Range
          </Typography>

          <Calendar
            value={{ startDate, endDate }}
            onChange={(selection: any) => {
              onDateChange(selection);
              onCloseCalendar();
            }}
          />
        </Box>
      </Drawer>
    </Grid>
  );
};

export default VisitorActionBar;
