import { z } from "zod";

export const signUpSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.email("Enter a valid email").trim().min(1, "Email is required."),
    password: z.string().min(8,"Password must be at least 8 characters."),
});

/// This will help us get the type of the form data from the schema.
export type SignUpFormValues = z.infer<typeof signUpSchema>;
 
export const signInSchema = z.object({
    email: z.email("Enter a valid email").trim().min(1, "Email is required."),
    password: z.string().min(1,"Password is required."),
});

/// This will help us get the type of the form data from the schema.
export type SignInFormValues = z.infer<typeof signInSchema>;

export const codeSchema = z.object({
    code: z.string().trim().min(1, "Enter the verification code."),
});

/// This will help us get the type of the form data from the schema.
export type CodeFormValues = z.infer<typeof codeSchema>;