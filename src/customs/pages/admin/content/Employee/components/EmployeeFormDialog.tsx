import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddEmployee from '../FormWizardAddEmployee';

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onRequestClose: () => void;

  loadingEdit: boolean;
  isBatchEdit: boolean;
  edittingId: string | null;

  formData: any;
  setFormData: (data: any) => void;

  onSuccess: () => void;

  selectedRows: any[];
  enabledFields: any;
  setEnabledFields: (fields: any) => void;

  organizations: any[];
  department: any[];
  districts: any[];
}

const EmployeeFormDialog = ({
  open,
  onClose,
  onRequestClose,
  loadingEdit,
  isBatchEdit,
  edittingId,
  formData,
  setFormData,
  onSuccess,
  selectedRows,
  enabledFields,
  setEnabledFields,
  organizations,
  department,
  districts,
}: EmployeeFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onRequestClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        {isBatchEdit ? 'Batch Edit' : edittingId ? 'Edit' : 'Add'} Employee
        <IconButton
          aria-label="close"
          onClick={onRequestClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loadingEdit ? (
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
          <FormWizardAddEmployee
            formData={formData}
            setFormData={setFormData}
            edittingId={edittingId}
            onSuccess={onSuccess}
            isBatchEdit={isBatchEdit}
            selectedRows={selectedRows}
            enabledFields={enabledFields}
            setEnabledFields={setEnabledFields}
            organizations={organizations}
            department={department}
            districts={districts}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
