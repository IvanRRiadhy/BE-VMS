import React from 'react';
import { CreateVisitorRequest } from 'src/customs/api/models/Admin/Visitor';
import FormWizardAddVisitor from './FormWizardAddVisitor.tsx';

type Props = {
  formData: CreateVisitorRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  containerRef?: any | null;
};

const FormWizardAddInvitation: React.FC<Props> = (props) => {
  return <FormWizardAddVisitor {...props} formKey="pra_form"   />;
};

export default FormWizardAddInvitation;
