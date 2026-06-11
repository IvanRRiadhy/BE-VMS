import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconX } from '@tabler/icons-react';

interface VisitorApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  groupName?: string;
  loading: boolean;
  visitorTableData: any[];
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
  triggerCheckAll?: any;
  selectedId?: number | string;

  onReject: (id: any) => void;
  onApprove: (id: any) => void;
}

const VisitorApprovalDialog: React.FC<VisitorApprovalDialogProps> = ({
  open,
  onClose,
  groupName,
  loading,
  visitorTableData,
  selectedRows,
  setSelectedRows,
  triggerCheckAll,
  selectedId,
  onReject,
  onApprove,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: { width: '100vw' },
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        {groupName ?? 'Visitor Group'}

        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          onClick={onClose}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ padding: '0px !important' }}>
        <DynamicTable
          loading={loading}
          data={visitorTableData}
          selectedRows={selectedRows}
          onCheckedChange={setSelectedRows}
          setSelectedRows={setSelectedRows as any}
          triggerCheckAll={triggerCheckAll}
          isHaveChecked={true}
          titleHeader="Select visitors for approval or rejection"
          isHaveHeaderTitle={true}
          isNoActionTableHead={true}
        />
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          color="error"
          variant="contained"
          onClick={() => selectedId && onReject(selectedId)}
        >
          Reject
        </Button>

        <Button fullWidth variant="contained" onClick={() => selectedId && onApprove(selectedId)}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorApprovalDialog;
