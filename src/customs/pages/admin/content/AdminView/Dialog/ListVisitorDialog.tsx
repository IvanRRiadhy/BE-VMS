import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

export default function ListVisitorDialog({ open, onClose }: any) {
  const visitorData = [
    {
      id: 1,
      name: 'John Doe',
      site: 'Alpha Tower',
      visitor_status: 'Checked In',
      check_in_at: '2025-01-10 09:15',
      check_out_at: '-',
      block_at: '-',
      blacklist_at: '2025-01-10 14:32',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      site: 'Mega Plaza',
      visitor_status: 'Checked Out',
      check_in_at: '2025-01-10 08:30',
      check_out_at: '2025-01-10 17:00',
      block_at: '-',
    },
    {
      id: 3,
      name: 'Michael Lee',
      site: 'Greenland Office',
      visitor_status: 'Blocked',
      check_in_at: '2025-01-08 11:00',
      check_out_at: '2025-01-08 15:00',
      block_at: '2025-01-09 10:30',
    },
    {
      id: 4,
      name: 'Anna Kim',
      site: 'Sky Tower',
      visitor_status: 'Checked In',
      check_in_at: '2025-01-12 10:45',
      check_out_at: '-',
      block_at: '-',
    },
    {
      id: 5,
      name: 'David Wong',
      site: 'Urban Hub',
      visitor_status: 'Blocked',
      check_in_at: '2025-01-07 14:10',
      check_out_at: '2025-01-07 16:30',
      block_at: '2025-01-08 09:20',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>List Visitor</DialogTitle>
      <IconButton
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
        onClick={onClose}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers >
        <DynamicTable data={visitorData} isHaveSearch isActionListVisitor={true} isHaveAction />
      </DialogContent>
    </Dialog>
  );
}
