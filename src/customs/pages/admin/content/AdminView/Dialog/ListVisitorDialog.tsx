import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitor } from 'src/customs/api/Admin/InvitationData';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';

export default function ListVisitorDialog({ open, onClose }: any) {
  const { token } = useSession();
  // const visitorData = [
  //   {
  //     id: 1,
  //     name: 'John Doe',
  //     site: 'Alpha Tower',
  //     visitor_status: 'Checked In',
  //     check_in_at: '2025-01-10 09:15',
  //     check_out_at: '-',
  //     block_at: '-',
  //     blacklist_at: '2025-01-10 14:32',
  //   },
  //   {
  //     id: 2,
  //     name: 'Sarah Smith',
  //     site: 'Mega Plaza',
  //     visitor_status: 'Checked Out',
  //     check_in_at: '2025-01-10 08:30',
  //     check_out_at: '2025-01-10 17:00',
  //     block_at: '-',
  //   },
  //   {
  //     id: 3,
  //     name: 'Michael Lee',
  //     site: 'Greenland Office',
  //     visitor_status: 'Blocked',
  //     check_in_at: '2025-01-08 11:00',
  //     check_out_at: '2025-01-08 15:00',
  //     block_at: '2025-01-09 10:30',
  //   },
  //   {
  //     id: 4,
  //     name: 'Anna Kim',
  //     site: 'Sky Tower',
  //     visitor_status: 'Checked In',
  //     check_in_at: '2025-01-12 10:45',
  //     check_out_at: '-',
  //     block_at: '-',
  //   },
  //   {
  //     id: 5,
  //     name: 'David Wong',
  //     site: 'Urban Hub',
  //     visitor_status: 'Blocked',
  //     check_in_at: '2025-01-07 14:10',
  //     check_out_at: '2025-01-07 16:30',
  //     block_at: '2025-01-08 09:20',
  //   },
  // ];
  const { data: visitorData = [], isLoading } = useQuery({
    queryKey: ['invitation-visitors'],
    queryFn: async () => {
      const res = await getInvitationVisitor(token as string);

      return res?.collection?.map((item: any) => ({
        id: item.id,
        name: item.name || '-',
        email: item.email || '-',
        organization: item.organization || '-',
        phone: item.phone || '-',
        identity_id: item.identity_id || '-',
        is_blacklist: item.is_blacklist || false,
        is_employee: item.is_employee || false,
      }));
    },

    enabled: !!token && open,
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '100vw',
        },
      }}
    >
      <DialogTitle>List Visitor</DialogTitle>
      <IconButton
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
        onClick={onClose}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <DynamicTable
          overflowX="auto"
          loading={isLoading}
          data={visitorData}
          isHaveSearch={true}
          isActionListVisitor={true}
          // isHaveEmployee={true}
          isHaveChecked={true}
          isHaveAction
        />
      </DialogContent>
    </Dialog>
  );
}
