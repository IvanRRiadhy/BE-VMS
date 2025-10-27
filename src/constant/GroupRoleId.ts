// src/constants/GroupRoleId.ts
export const GroupRoleId = {
  Visitor: 'C3F106B6-6B6E-4E36-953C-B82CD4D9A0C4',
  OperatorAdmin: 'C3F106B6-6B6E-4E36-953C-B82CD4D9A0C3',
  OperatorVMS: 'CBFF225D-7514-40AD-90B5-2A257E1F5056',
  Admin: 'D4A77461-6628-47C9-8A11-B54864012876',
  Employee: 'A1BEF663-84C4-47A3-92A7-4155B3F8342A',
  Manager: '58CB0F6C-AF28-4FC8-8D89-32DF0D6CB711',
} as const;

export type GroupRoleKey = keyof typeof GroupRoleId;
