import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormVisitorType from '../FormVisitorType';

interface Props {
  open: boolean;
  onClose: any;
  loading?: any;
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
  loading,
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
        {loading ? (
          <Box
            sx={{
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={36} />
          </Box>
        ) : (
          <FormVisitorType
            formData={formDataAddVisitorType}
            setFormData={setFormDataAddVisitorType}
            onSuccess={onSuccess}
            edittingId={edittingId}
            initialDocuments={documentIdentities}
            initialAccess={duplicatedAccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
