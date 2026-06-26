import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginType = z.infer<typeof loginSchema>;