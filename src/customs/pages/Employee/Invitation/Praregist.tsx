import React from 'react';
import { CreateVisitorRequest } from 'src/customs/api/models/Admin/Visitor';
import FormInvitation from './FormAddInvitation.tsx';
// import FormAddInvitation from './FormAddInvitation.tsx';

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
