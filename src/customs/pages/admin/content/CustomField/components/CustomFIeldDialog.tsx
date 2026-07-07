import { Dialog, DialogContent, DialogTitle, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormCustomField from '../FormCustomField';


interface CustomFieldDialogProps {
  open: boolean;
  editingId: string;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isFormChanged: boolean;
  onClose: () => void;
  onConfirmClose: () => void;
  onDialogClose: (_event: object, reason: string) => void;
  onSuccess: () => void;
}

const CustomFieldDialog = ({
  open,
  editingId,
  formData,
  setFormData,
  isFormChanged,
  onClose,
  onConfirmClose,
  onDialogClose,
  onSuccess,
}: CustomFieldDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onDialogClose}
      fullWidth
      maxWidth={formData.field_type >= 3 ? 'lg' : 'md'}
    >
      <DialogTitle sx={{ position: 'relative', p: 3 }}>
        {editingId ? 'Edit' : 'Add'} Custom Field
        <IconButton
          onClick={() => {
            if (isFormChanged) {
              onConfirmClose();
            } else {
              onClose();
            }
          }}
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

      <Divider />

      <DialogContent>
        <FormCustomField
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomFieldDialog;
