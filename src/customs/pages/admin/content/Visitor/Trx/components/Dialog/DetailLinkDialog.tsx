import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface Props {
  open: boolean;
  onClose: () => void;
  dataVisitor: any[];
}

const DetailLinkDialog = ({ open, onClose, dataVisitor }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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
        <DynamicTable data={dataVisitor} titleHeader="Visitor" isHaveHeaderTitle isHaveChecked />
      </DialogContent>
    </Dialog>
  );
};

export default DetailLinkDialog;
