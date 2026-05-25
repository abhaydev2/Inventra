import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name required"),

    email: z
      .string()
      .email("Enter valid email"),

    password: z
      .string()
      .min(6, "Password minimum 6 characters"),

    confirmPassword: z
      .string(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterType = z.infer<typeof registerSchema>;