import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import FormAddDocument from '../FormAddDocument';


interface FormAddDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  initialData: any;
  edittingId?: any;
  onSuccess: () => void;
  onDirty?: () => void;
}

const FormAddDocumentDialog = ({
  open,
  onClose,
  initialData,
  edittingId,
  onSuccess,
  onDirty,
}: FormAddDocumentDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', p: 3 }}>
        {edittingId ? 'Edit Document' : 'Add New Document'}

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 0 }}>
        <br />

        <FormAddDocument
          initialData={initialData}
          edittingId={edittingId}
          onSuccess={onSuccess}
          onDirty={onDirty}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormAddDocumentDialog;
