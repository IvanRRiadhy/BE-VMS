import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Praregist from '../Praregist';

type PreRegistrationDialogProps = {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  edittingId: string;
  wizardKey: number;
  onSuccess: () => void;
  visitorType: any;
  sites: any[];
  employee: any[];
  allVisitorEmployee: any[];
  vtLoading: boolean;
  search: (value: string) => void;
  isLoadingEmployee: boolean;
};

const PreRegistrationDialog = ({
  open,
  onClose,
  formData,
  setFormData,
  edittingId,
  wizardKey,
  onSuccess,
  visitorType,
  sites,
  employee,
  allVisitorEmployee,
  vtLoading,
  search,
  isLoadingEmployee,
}: PreRegistrationDialogProps) => {
  return (
    <Dialog
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '100vw',
        },
      }}
      open={open}
      onClose={onClose}
    >
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Add Pra Registration
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: '10px' }} dividers>
        <Praregist
          key={wizardKey}
          formData={formData}
          setFormData={setFormData}
          edittingId={edittingId}
          onSuccess={onSuccess}
          visitorType={visitorType}
          sites={sites}
          employee={employee}
          allVisitorEmployee={allVisitorEmployee}
          vtLoading={vtLoading}
          search={search}
          isLoadingEmployee={isLoadingEmployee}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PreRegistrationDialog;
