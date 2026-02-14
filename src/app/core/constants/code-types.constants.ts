export const CODE_TYPES = {
  USER_ROLE: 'USR_RL',
  USER_STATUS: 'USR_STS',
  COUNTRY: 'CTRY',
  STATE: 'STT',
  GENDER: 'GNDR',
  DEPARTMENT: 'DEPT',
} as const;

export type CodeTypeValue = (typeof CODE_TYPES)[keyof typeof CODE_TYPES];
