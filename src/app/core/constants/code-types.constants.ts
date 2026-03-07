export const CODE_TYPES = {
  USER_ROLE: 'S001',
  USER_STATUS: 'S002',
  GENDER: 'S003',
  DEPARTMENT: 'S004',
  COUNTRY: 'S005',
  STATE: 'S006',
  RATE_TYPE: 'S007',
  FREQUENCY: 'S008',
  CUSTOMER_TYPE: 'S009',
} as const;

export type CodeTypeValue = (typeof CODE_TYPES)[keyof typeof CODE_TYPES];
