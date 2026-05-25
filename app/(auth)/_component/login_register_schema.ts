export const authFieldNames = ["email", "password"] as const;

export type AuthFieldName = (typeof authFieldNames)[number];

export interface AuthFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends AuthFormValues {
  confirmPassword: string;
}
