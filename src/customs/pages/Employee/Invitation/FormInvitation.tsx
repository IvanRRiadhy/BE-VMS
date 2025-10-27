import React from 'react';
import { CreateVisitorRequest } from 'src/customs/api/models/Admin/Visitor';
import FormWizardAddVisitor from './FormAddInvitation.tsx';

type Props = {
  formData: CreateVisitorRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
};

const FormInvitation: React.FC<Props> = (props) => {
  // ⬇️ Gunakan visit_form
  return <FormWizardAddVisitor {...props} formKey="visit_form" />;
};

export default FormInvitation;
