import { Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import FormWizardAddInvitation from '../FormWizardAddInvitation';

interface Props {
  open: boolean;
  handleDialogClose: () => void;
  handleCloseDialog: () => void;
  openDiscardForCloseAdd: () => void;
  isFormChanged: boolean;

  wizardKey: number;
  formDataAddVisitor: any;
  setFormDataAddVisitor: any;
  edittingId: string;
  handleSuccess: () => void;

  visitorType: any;
  sites: any;
  employee: any;
  allVisitorEmployee: any;
  vtLoading: boolean;
}

export default function PreRegistrationDialog({
  open,
  handleDialogClose,
  handleCloseDialog,
  openDiscardForCloseAdd,
  isFormChanged,
  wizardKey,
  formDataAddVisitor,
  setFormDataAddVisitor,
  edittingId,
  handleSuccess,
  visitorType,
  sites,
  employee,
  allVisitorEmployee,
  vtLoading,
}: Props) {
  const handleClose = () => {
    if (isFormChanged) {
      openDiscardForCloseAdd();
    } else {
      handleCloseDialog();
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleDialogClose}
      maxWidth={false}
      PaperProps={{ sx: { width: '100vw' } }}
    >
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Add Pre Registration
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ paddingTop: '0px' }}>
        <FormWizardAddInvitation
          key={wizardKey}
          formData={formDataAddVisitor}
          setFormData={setFormDataAddVisitor}
          edittingId={edittingId}
          onSuccess={handleSuccess}
          visitorType={visitorType}
          sites={sites}
          employee={employee}
          allVisitorEmployee={allVisitorEmployee}
          vtLoading={vtLoading}
          enableInvitationTypeStep={false}
        />
      </DialogContent>
    </Dialog>
  );
}
