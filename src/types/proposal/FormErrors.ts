import type { FormValues } from './FormValues'

export type FormErrors = Partial<
  Record<keyof FormValues | 'facultyApproval' | 'privacy', string>
>
