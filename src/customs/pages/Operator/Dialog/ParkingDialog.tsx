import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import {
  IconBus,
  IconCar,
  IconCsv,
  IconFile,
  IconMotorbike,
  IconParkingCircle,
  IconPdf,
  IconTruck,
  IconX,
} from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { Box } from '@mui/material';
import InfoCard from '../Components/InfoCard';
import { TextField, Button, MenuItem, Stack } from '@mui/material';
import { useState, useEffect } from 'react';
import ParkingTemplateDialog from './Parking/ParkingTemplateDialog';
import { exportOperatorVehicleCount, getOperatorVehicleCount } from 'src/customs/api/operator';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('id');
interface ParkingDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  container?: HTMLElement | null;
  visitorType?: any;
}

const ParkingDialog: React.FC<ParkingDialogProps> = ({
  open,
  onClose,
  data,
  container = undefined,
  visitorType,
}) => {
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    vehicleType: '',
    visitorType: '',
  });

  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('parkingFilterTemplates');
    if (saved) setTemplates(JSON.parse(saved));
  }, []);

  const handleLoadTemplate = (template: any) => {
    setFilter(template.filter);
  };

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!open) return;

    const fetchToday = async () => {
      try {
        setLoading(true);

        const response = await getOperatorVehicleCount({
          today: true,
          // 'detail-by-visitor-type': true,
        });

        setReport(response?.collection ?? null);
      } catch (error) {
        console.error('Failed to fetch today vehicle count:', error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchToday();
  }, [open]);

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const params: any = {
        ...(filter.start_date && {
          'start-date': dayjs
            .tz(filter.start_date, 'Asia/Jakarta')
            .startOf('day')
            .utc()
            .toISOString(),
        }),
        ...(filter.end_date && {
          'end-date': dayjs.tz(filter.end_date, 'Asia/Jakarta').endOf('day').utc().toISOString(),
        }),
        ...(filter.vehicleType && { 'vehicle-type': filter.vehicleType }),
        ...(filter.visitorType && { 'visitor-type': filter.visitorType }),
        'detail-by-visitor-type': true,
      };

      if (!filter.start_date && !filter.end_date) {
        params.today = true;
      }

      const response = await getOperatorVehicleCount(params);
      setReport(response?.collection ?? null);
    } catch (error) {
      console.error(error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const vehicleCounts = report?.by_vehicle ?? [];

  const getVehicleCount = (vehicleType: string) =>
    vehicleCounts.find(
      (item: any) => item.vehicle_type?.toLowerCase() === vehicleType.toLowerCase(),
    )?.count ?? 0;

  const handleReset = async () => {
    setFilter({
      start_date: '',
      end_date: '',
      vehicleType: '',
      visitorType: '',
    });

    try {
      setLoading(true);

      const response = await getOperatorVehicleCount({
        today: true,
      });

      setReport(response?.collection ?? null);
    } catch (error) {
      console.error('Failed to reset vehicle count:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setLoading(true);

      const params: any = {
        ...(filter.start_date && {
          'start-date': dayjs
            .tz(filter.start_date, 'Asia/Jakarta')
            .startOf('day')
            .utc()
            .toISOString(),
        }),
        ...(filter.end_date && {
          'end-date': dayjs.tz(filter.end_date, 'Asia/Jakarta').endOf('day').utc().toISOString(),
        }),
        ...(filter.vehicleType && { 'vehicle-type': filter.vehicleType }),
        ...(filter.visitorType && { 'visitor-type': filter.visitorType }),
        'detail-by-visitor-type': true,
        ...(!filter.start_date && !filter.end_date && { today: true }),
        export_format: format,
      };

      const blob = await exportOperatorVehicleCount(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      const fileName =
        filter.start_date || filter.end_date
          ? `vehicle-count-report_${filter.start_date || 'all'}_to_${filter.end_date || 'all'}`
          : 'vehicle-count-report_today';

      link.download = `${fileName}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export vehicle count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      container={container ?? undefined}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ position: 'relative' }}>
        List Parking & Vehicle
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box flex={3} minWidth={300}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  Vehicle
                </Typography>

                {/* <TextField label="" select size="small" sx={{ width: '200px' }}>
                  {templates.map((t, i) => (
                    <MenuItem key={i} onClick={() => handleLoadTemplate(t)}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField> */}
              </Box>
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <InfoCard icon={<IconCar size={24} />} title="Car" value={getVehicleCount('Car')} />

                <InfoCard
                  icon={<IconMotorbike size={24} />}
                  title="Motorcycle"
                  value={getVehicleCount('Motorcycle')}
                />

                <InfoCard icon={<IconBus size={24} />} title="Bus" value={getVehicleCount('Bus')} />
                <InfoCard
                  icon={<IconBus size={24} />}
                  title="Mini Bus"
                  value={getVehicleCount('MiniBus')}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <InfoCard
                  icon={<IconTruck size={24} />}
                  title="Truck 16 Feet"
                  value={getVehicleCount('Truck16Feet')}
                />

                <InfoCard
                  icon={<IconTruck size={24} />}
                  title="Truck 20 Feet"
                  value={getVehicleCount('Truck20Feet')}
                />

                <InfoCard
                  icon={<IconTruck size={24} />}
                  title="Truck 40 Feet"
                  value={getVehicleCount('Truck40Feet')}
                />
              </Box>
              {/* <Typography variant="h5" sx={{ borderBottom: '1px solid #f0f0f0' }}>
                Parking
              </Typography>
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <InfoCard
                  icon={<IconParkingCircle size={24} />}
                  title="Used Slot"
                  value={datas?.parking?.used || 0}
                />

                <InfoCard
                  icon={<IconParkingCircle size={24} />}
                  title="Available Slot"
                  value={datas?.parking?.available || 0}
                />

                <InfoCard
                  icon={<IconParkingCircle size={24} />}
                  title="Total Slot"
                  value={(datas?.parking?.used || 0) + (datas?.parking?.available || 0)}
                />
              </Box> */}
            </Box>
          </Box>
          <Box
            flex={1}
            minWidth={250}
            sx={{
              borderLeft: '1px solid #eee',
              pl: 2,
            }}
          >
            <Typography variant="h6" mb={2}>
              Filter
            </Typography>

            <Stack spacing={2}>
              {/* Today */}
              <TextField
                label="Start Date"
                type="date"
                value={filter.start_date}
                onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="End Date"
                type="date"
                value={filter.end_date}
                onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Vehicle Type"
                select
                value={filter.vehicleType}
                onChange={(e) => setFilter({ ...filter, vehicleType: e.target.value })}
              >
                <MenuItem value="Car">Car</MenuItem>
                <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                <MenuItem value="Bus">Bus</MenuItem>
                <MenuItem value="MiniBus">MiniBus</MenuItem>
                <MenuItem value="Bicycle">Bicycle</MenuItem>
                <MenuItem value="Truck16Feet">Truck 16 Feet</MenuItem>
                <MenuItem value="Truck20Feet">Truck 20 Feet</MenuItem>
                <MenuItem value="Truck40Feet">Truck 40 Feet</MenuItem>
              </TextField>

              <TextField
                label="Visitor Type"
                select
                value={filter.visitorType}
                onChange={(e) => setFilter({ ...filter, visitorType: e.target.value })}
              >
                {visitorType?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              <Divider />

              <Button variant="contained" onClick={handleGenerate}>
                Generate
              </Button>
              <Button variant="outlined" color="error" onClick={handleReset}>
                Reset
              </Button>

              <Typography variant="subtitle2">Save as Template</Typography>

              {/* <TextField
                size="small"
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              /> */}

              {/*Button variant="contained" color="success" onClick={handleSaveTemplate}>
                Save Template
              </Button> */}
              <Divider />

              {/* <Typography variant="subtitle2">Export Report</Typography> */}

              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleExport('csv')}
                  disabled={loading}
                  fullWidth
                  startIcon={<IconCsv />}
                >
                  CSV
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleExport('excel')}
                  disabled={loading}
                  fullWidth
                  startIcon={<IconFile />}
                >
                  Excel
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleExport('pdf')}
                  disabled={loading}
                  startIcon={<IconPdf />}
                  fullWidth
                >
                  Export
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      {/* <ParkingTemplateDialog
        open={openTemplateDialog}
        onClose={() => setOpenTemplateDialog(false)}
        templateName={selectedTemplate}
      /> */}
    </Dialog>
  );
};

export default ParkingDialog;
