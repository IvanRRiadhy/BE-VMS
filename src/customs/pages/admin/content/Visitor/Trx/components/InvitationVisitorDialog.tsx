import { Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import FormWizardAddVisitor from '../FormWizardAddVisitor';

interface Props {
  open: boolean;
  onClose?: () => void;
  handleDialogClose?: () => void;
  handleCloseDialog: () => void;
  openDiscardForCloseAdd: () => void;
  isFormChanged: boolean;

  wizardKey: number;
  formDataAddVisitor: any;
  setFormDataAddVisitor: any;
  edittingId: string;
  handleSuccess: () => void;
  search?: any;
  visitorType: any;
  sites: any;
  employee: any;
  allVisitorEmployee: any;
  vtLoading: boolean;
  isLoadingEmployee?: any;
}

export default function InvitationVisitorDialog({
  open,
  onClose,
  handleDialogClose,
  handleCloseDialog,
  openDiscardForCloseAdd,
  isFormChanged,
  wizardKey,
  formDataAddVisitor,
  search,
  setFormDataAddVisitor,
  edittingId,
  handleSuccess,
  visitorType,
  sites,
  employee,
  allVisitorEmployee,
  vtLoading,
  isLoadingEmployee,
}: Props) {

  const handleClose = (_event?: object, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (isFormChanged) {
      openDiscardForCloseAdd();
      return;
    }

    handleCloseDialog();
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      keepMounted
      maxWidth={false}
      PaperProps={{ sx: { width: '100vw' } }}
    >
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Add Invitation Visitor
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <FormWizardAddVisitor
          key={wizardKey}
          formData={formDataAddVisitor}
          setFormData={setFormDataAddVisitor}
          edittingId={edittingId}
          onSuccess={handleSuccess}
          visitorType={visitorType}
          sites={sites}
          employee={employee}
          search={search}
          allVisitorEmployee={allVisitorEmployee}
          vtLoading={vtLoading}
          enableInvitationTypeStep={true}
          isLoadingEmployee={isLoadingEmployee}
        />
      </DialogContent>
    </Dialog>
  );
}
