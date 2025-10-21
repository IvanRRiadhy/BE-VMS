import React from 'react';
import { CreateVisitorRequest } from 'src/customs/api/models/Admin/Visitor';
import FormWizardAddVisitor from './FormInvitation.tsx';
import FormInvitation from './FormInvitation.tsx';

type Props = {
  formData: CreateVisitorRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
};

const Praregist: React.FC<Props> = (props) => {
  return <FormInvitation {...props} formKey="pra_form" />;
};

export default Praregist;
