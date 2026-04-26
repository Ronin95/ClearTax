import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role_id: z.number().int().min(1).max(2).default(1),
  company_name: z.string().optional().nullable(),
}).refine((data) => {
  if (data.role_id === 2 && (!data.company_name || data.company_name.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Company name is required for company accounts",
  path: ["company_name"],
});

export const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});