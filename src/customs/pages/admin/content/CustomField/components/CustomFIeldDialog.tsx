// import { Dialog, DialogContent, DialogTitle, Divider, IconButton } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import FormCustomField from '../FormCustomField';


// interface CustomFieldDialogProps {
//   open: boolean;
//   editingId: string;
//   formData: any;
//   setFormData: React.Dispatch<React.SetStateAction<any>>;
//   isFormChanged: boolean;
//   onClose: () => void;
//   onConfirmClose: () => void;
//   onDialogClose: (_event: object, reason: string) => void;
//   onSuccess: () => void;
// }

// const CustomFieldDialog = ({
//   open,
//   editingId,
//   formData,
//   setFormData,
//   isFormChanged,
//   onClose,
//   onConfirmClose,
//   onDialogClose,
//   onSuccess,
// }: CustomFieldDialogProps) => {
//   return (
//     <Dialog
//       open={open}
//       onClose={onDialogClose}
//       fullWidth
//       maxWidth={formData.field_type >= 3 ? 'lg' : 'md'}
//     >
//       <DialogTitle sx={{ position: 'relative', p: 3 }}>
//         {editingId ? 'Edit' : 'Add'} Custom Field
//         <IconButton
//           onClick={() => {
//             if (isFormChanged) {
//               onConfirmClose();
//             } else {
//               onClose();
//             }
//           }}
//           sx={{
//             position: 'absolute',
//             right: 10,
//             top: 10,
//             color: (theme) => theme.palette.grey[500],
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <Divider />

//       <DialogContent>
//         <FormCustomField
//           formData={formData}
//           setFormData={setFormData}
//           editingId={editingId}
//           onSuccess={onSuccess}
//         />
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CustomFieldDialog;


import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';

import { IconX } from '@tabler/icons-react';

import {
  CreateCustomFieldRequest,
} from 'src/customs/api/models/Admin/CustomField';
import FormCustomField from './FormCustomField';

interface CustomFieldDialogProps {
  open: boolean;
  editingId?: string;
  initialData: CreateCustomFieldRequest;
  onClose: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const CustomFieldDialog = ({
  open,
  editingId,
  initialData,
  onClose,
  onSuccess,
  onDirtyChange,
}: CustomFieldDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      keepMounted={false}
      transitionDuration={0}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {editingId ? 'Edit Custom Field' : 'Add Custom Field'}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {open && (
          <FormCustomField
            key={editingId || 'new-custom-field'}
            initialData={initialData}
            editingId={editingId}
            onSuccess={onSuccess}
            onDirtyChange={onDirtyChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomFieldDialog;

