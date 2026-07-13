import { Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormSite from '../../FormSite';

interface DialogSiteSpaceProps {
  open: boolean;
  editingId?: string | null;
  isBatchEdit: boolean;
  selectedRows: any[];
  enabledFields: any;
  employee: any;

  formData: any;
  setFormData: (data: any) => void;
  setEnabledFields: (data: any) => void;

  onSuccess: () => void;
  onClose: () => void;
  onConfirmClose: () => void;
  isDirty?: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

const DialogSiteSpace = ({
  open,
  editingId,
  isBatchEdit,
  selectedRows,
  enabledFields,
  employee,
  formData,
  setFormData,
  setEnabledFields,
  onSuccess,
  onClose,
  onConfirmClose,
  isDirty,
  setIsDirty,
}: DialogSiteSpaceProps) => {
const handleClose = (event: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
  if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
    if (isDirty) {
      onConfirmClose();
    } else {
      onClose();
    }
    return;
  }

  if (isDirty) {
    onConfirmClose();
  } else {
    onClose();
  }
};

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xl">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {editingId ? 'Edit' : 'Add'} Site Space
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ paddingTop: 0 }}>
        <br />

        <FormSite
          formData={formData}
          setFormData={setFormData}
          onSuccess={onSuccess}
          editingId={editingId || undefined}
          isBatchEdit={isBatchEdit}
          selectedRows={selectedRows}
          enabledFields={enabledFields}
          setEnabledFields={setEnabledFields}
          employee={employee}
          setIsDirty={setIsDirty}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogSiteSpace;
