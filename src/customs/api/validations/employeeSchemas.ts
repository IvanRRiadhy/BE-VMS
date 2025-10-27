// src/customs/validations/employeeSchemas.ts
import { z } from 'zod';
import type { CreateEmployeeRequest } from 'src/customs/api/models/Employee';

// Step 0: Personal Info
export const Step0Schema = z.object({
  name: z.string().min(1, 'Employee name is required'),
  person_id: z.string().min(1, 'Person ID is required'),
  identity_id: z.string().min(1, 'Identity ID is required'),
  email: z.string().email('Email is invalid'),
  gender: z.coerce
    .number({ required_error: 'Gender is required' })
    .refine((v) => v === 0 || v === 1, 'Gender is required'),
});

// Step 1: Work Details
export const Step1Schema = z.object({
  district_id: z.string().min(1, 'District is required'),
  organization_id: z.string().min(1, 'Organization is required'),
  department_id: z.string().min(1, 'Department is required'),
});

// Step 3: Other Details
export const Step3Schema = z.object({
  birth_date: z.string().min(1, 'Birth date is required'),
  join_date: z.string().min(1, 'Join date is required'),
  exit_date: z.string().min(1, 'Exit date is required'),

  // ⇩ Buat exit_date opsional: kosong "" dianggap "tidak diisi"
  // exit_date: z
  //   .string()
  //   .optional()
  //   .transform((v) => (v === '' ? undefined : v)),
});
//   .refine(
//     (v) => {
//       if (!v.exit_date) return true;
//       return new Date(v.exit_date) >= new Date(v.join_date);
//     },
//     { message: 'Exit date cannot be earlier than join date', path: ['exit_date'] },
//   );

// Field yang divalidasi per step
export const stepFieldMap: Record<number, Array<keyof CreateEmployeeRequest>> = {
  0: ['name', 'person_id', 'identity_id', 'email', 'gender'],
  1: ['district_id', 'organization_id', 'department_id'],
  2: [],
  3: ['birth_date', 'join_date', 'exit_date'],
  4: [],
};

export const getStepSchema = (step: number) => {
  if (step === 0) return Step0Schema;
  if (step === 1) return Step1Schema;
  if (step === 3) return Step3Schema;
  return null;
};
