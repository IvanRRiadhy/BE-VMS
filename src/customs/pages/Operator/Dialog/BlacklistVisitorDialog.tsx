import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { id } from 'date-fns/locale';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

export default function BlacklistVisitorDialog({ open, onClose }: any) {
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      site: 'PT Alpha Tower',
      is_blacklist: true,
      blacklist_at: '2025-01-10 14:32',
      blacklist_reason: 'Melanggar aturan keamanan',
      blacklist_by: 'Security Admin',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      site: 'Mega Plaza',
      is_blacklist: true,
      blacklist_at: '2025-01-08 10:15',
      blacklist_reason: 'Perilaku tidak kooperatif',
      blacklist_by: 'Building Manager',
    },
    {
      id: 3,
      name: 'Michael Lee',
      site: 'Greenland Office',
      is_blacklist: true,
      blacklist_at: '2025-01-05 18:20',
      blacklist_reason: 'Akses tanpa izin',
      blacklist_by: 'Security Officer',
    },
    {
      id: 4,
      name: 'Anna Kim',
      site: 'Sky Tower',
      is_blacklist: true,
      blacklist_at: '2025-01-12 09:40',
      blacklist_reason: 'Komplain dari tenant',
      blacklist_by: 'Reception Staff',
    },
    {
      id: 5,
      name: 'David Wong',
      site: 'Urban Hub',
      is_blacklist: true,
      blacklist_at: '2025-01-01 12:00',
      blacklist_reason: 'Pemalsuan identitas',
      blacklist_by: 'Admin System',
    },
  ];
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Blacklist Visitor</DialogTitle>
      <IconButton
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
        onClick={onClose}
      >
        <IconX />
      </IconButton>

      <Divider />
      <DialogContent>
        <DynamicTable data={dummyData} isHaveSearch={true} />
      </DialogContent>
    </Dialog>
  );
}
