import { z } from 'zod';

export type Condition = {
  logic: 'AND' | 'OR' | null;
  approver_type: number;
  entity_id: string;
  parent_id?: string;
  step_order?: number;
  escalation_hours?: number;
  delegate_user_id?: string;
  children?: Condition[];
};

export type Item = {
  id?: string;
  name: string;
  description: string;
  root_logic: 'AND' | 'OR';
  type: string;
  conditions: Condition[];
};

export const ConditionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    logic: z.enum(['AND', 'OR']).nullable(),
    approver_type: z.number(),
    entity_id: z.string(),
    parent_id: z.string().optional(),
    step_order: z.number().optional(),
    escalation_hours: z.number().optional(),
    delegate_user_id: z.string().optional(),
    children: z.array(ConditionSchema).optional(),
  }),
);

export const CreateApprovalWorkflowSchema = z.object({
  name: z.string(),
  description: z.string(),
  root_logic: z.enum(['AND', 'OR']),
  type: z.string(),
  conditions: z.array(ConditionSchema),
});

export type CreateApprovalWorkflowRequest = z.infer<typeof CreateApprovalWorkflowSchema>;
