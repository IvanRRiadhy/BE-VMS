import React from 'react';
import { CreateVisitorRequest } from 'src/customs/api/models/Visitor';
import FormWizardAddVisitor from './FormWizardAddVisitor.tsx';

type Props = {
  formData: CreateVisitorRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
};

const FormWizardAddInvitation: React.FC<Props> = (props) => {
  return <FormWizardAddVisitor {...props} formKey="pra_form" />;
};

export default FormWizardAddInvitation;
