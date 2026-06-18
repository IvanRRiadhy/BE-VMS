import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitor } from 'src/customs/api/Admin/InvitationData';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';

export default function ListVisitorDialog({ open, onClose, upcomingVisitors }: any) {
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
      <DialogTitle>List Upcoming Visitor</DialogTitle>
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
          // loading={isLoading}
          data={upcomingVisitors || []}
          isHaveAction={false}
          // isHaveSearch={true}
          // isActionListVisitor={true}
          // isHaveEmployee={true}
          // isHaveChecked={true}
          // isHaveAction
        />
      </DialogContent>
    </Dialog>
  );
}
