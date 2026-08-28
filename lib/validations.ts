import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpUserSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    birthdate: z.string().min(1, "Date of birth is required"),
    phonenumber: z.string().min(8, "Phone number must be at least 8 digits"),
    email: z.string().email("Invalid email address"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    zipCode: z.string().min(3, "Zip Code is required"),
    address: z.string().min(5, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signUpInstitutionSchema = z
  .object({
    institutionName: z.string().min(2, "Institution name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    zipCode: z.string().min(3, "Zip Code is required"),
    address: z.string().min(5, "Address is required"),
    verificationEvidence: z.string().min(1, "Verification evidence (photo/document) is required"),
    hasPickupService: z.enum(["yes", "no"], {
      required_error: "Please select if you provide pickup service",
    }),
    websiteOrSocial: z.string().optional(),
    description: z.string().min(10, "Please provide a short description (at least 10 characters)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpUserInput = z.infer<typeof signUpUserSchema>;
export type SignUpInstitutionInput = z.infer<typeof signUpInstitutionSchema>;