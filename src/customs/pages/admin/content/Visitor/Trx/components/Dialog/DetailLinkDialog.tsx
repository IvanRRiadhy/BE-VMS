import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface Props {
  open: boolean;
  onClose: () => void;
  dataVisitor: any[];
  loading?: any;
}

const DetailLinkDialog = ({ open, onClose, dataVisitor, loading }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Detail Visitor</DialogTitle>

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

      <DialogContent dividers>
        <DynamicTable
          loading={loading}
          data={dataVisitor}
          isHaveHeaderTitle={false}
          isNoActionTableHead
        />
      </DialogContent>
    </Dialog>
  );
};

export default DetailLinkDialog;
