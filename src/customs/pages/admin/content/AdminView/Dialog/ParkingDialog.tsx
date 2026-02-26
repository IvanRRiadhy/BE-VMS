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
import { IconCar, IconMotorbike, IconParkingCircle, IconTruck, IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { Box } from '@mui/material';
import InfoCard from '../Components/InfoCard';
import { TextField, Button, MenuItem, Stack } from '@mui/material';
import { useState, useEffect } from 'react';

interface ParkingDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  container?: HTMLElement | null;
}

const datas = {
  vehicle: {
    car: 12,
    motorcycle: 30,
    truck: 5,
  },
  parking: {
    used: 32,
    available: 15,
  },
};

const ParkingDialog: React.FC<ParkingDialogProps> = ({
  open,
  onClose,
  data,
  container = undefined,
}) => {
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    vehicleType: '',
    status: '',
  });

  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('parkingFilterTemplates');
    if (saved) setTemplates(JSON.parse(saved));
  }, []);

  const handleSaveTemplate = () => {
    if (!templateName) return;

    const newTemplates = [...templates, { name: templateName, filter }];
    setTemplates(newTemplates);

    sessionStorage.setItem('parkingFilterTemplates', JSON.stringify(newTemplates));
    setTemplateName('');
  };

  const handleLoadTemplate = (template: any) => {
    setFilter(template.filter);
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

                <TextField label="" select size="small" sx={{ width: '200px' }}>
                  {templates.map((t, i) => (
                    <MenuItem key={i} onClick={() => handleLoadTemplate(t)}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <InfoCard
                  icon={<IconCar size={24} />}
                  title="Car"
                  value={datas?.vehicle?.car || 0}
                />

                <InfoCard
                  icon={<IconMotorbike size={24} />}
                  title="Motorcycle"
                  value={datas?.vehicle?.motorcycle || 0}
                />

                <InfoCard
                  icon={<IconTruck size={24} />}
                  title="Truck"
                  value={datas?.vehicle?.truck || 0}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="h5" sx={{ borderBottom: '1px solid #f0f0f0' }}>
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
              </Box>
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
                <MenuItem value="car">Car</MenuItem>
                <MenuItem value="motorcycle">Motorcycle</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
              </TextField>

              <TextField
                label="Visitor Status"
                select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <MenuItem value="Preregis">Preregis</MenuItem>
                <MenuItem value="Checkin">Checkin</MenuItem>
                <MenuItem value="Checkout">Checkout</MenuItem>
                <MenuItem value="Block">Block</MenuItem>
                <MenuItem value="Denied">Denied</MenuItem>
              </TextField>

              <Divider />

              <Button variant="contained" onClick={handleSaveTemplate}>
                Generate
              </Button>

              <Typography variant="subtitle2">Save as Template</Typography>

              <TextField
                size="small"
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />

              <Button variant="contained" color="success" onClick={handleSaveTemplate}>
                Save Template
              </Button>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ParkingDialog;
