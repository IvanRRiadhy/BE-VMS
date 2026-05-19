import { Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormVisitorType from '../FormVisitorType';

interface Props {
  open: boolean;
  onClose: any;

  edittingId: string;
  isFormChanged: boolean;

  setConfirmDialogOpen: (val: boolean) => void;
  handleCloseDialog: () => void;

  formDataAddVisitorType: any;
  setFormDataAddVisitorType: any;

  documentIdentities: any[];
  duplicatedAccess: any[];

  onSuccess: () => void;
}

export default function VisitorTypeDialog({
  open,
  onClose,
  edittingId,
  isFormChanged,
  setConfirmDialogOpen,
  handleCloseDialog,
  formDataAddVisitorType,
  setFormDataAddVisitorType,
  documentIdentities,
  duplicatedAccess,
  onSuccess,
}: Props) {
  const handleClose = () => {
    if (isFormChanged) {
      setConfirmDialogOpen(true);
    } else {
      handleCloseDialog();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {edittingId ? 'Edit' : 'Add'} Visitor Type
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
        <FormVisitorType
          formData={formDataAddVisitorType}
          setFormData={setFormDataAddVisitorType}
          onSuccess={onSuccess}
          edittingId={edittingId}
          initialDocuments={documentIdentities}
          initialAccess={duplicatedAccess}
        />
      </DialogContent>
    </Dialog>
  );
}
