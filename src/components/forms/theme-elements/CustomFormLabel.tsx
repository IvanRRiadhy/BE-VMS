'use client';

import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

interface CustomFormLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}

const CustomFormLabel = styled(({ required, children, ...props }: CustomFormLabelProps) => (
  <Typography
    variant="subtitle1"
    fontWeight={600}
    {...props}
    component="label"
    htmlFor={props.htmlFor}
  >
    {children}
    {required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
  </Typography>
))(() => ({
  marginBottom: '5px',
  marginTop: '25px',
  display: 'block',
}));

export default CustomFormLabel;
