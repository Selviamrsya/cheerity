import { z } from "zod";

// Sign in - used by all roles (user, institution, admin)
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Phone number: 10-20 chars, digits with optional + ( ) - and spaces
// (matches varchar(20) DB column)
const phoneNumberSchema = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 digits")
  .max(20, "Phone number is too long")
  .regex(/^[0-9+()\- ]+$/, "Phone number contains invalid characters");

// Sign up - donor user
const signUpUserBaseSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  birthdate: z.string().min(1, "Date of birth is required"),
  phonenumber: phoneNumberSchema,
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .or(z.literal(""))
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpUserSchema = signUpUserBaseSchema
  .extend({
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Server-side schema (no confirmPassword — stripped before calling the action)
export const signUpUserServerSchema = signUpUserBaseSchema;

// Sign up - institution (hasPickupService removed - set per-donation instead)
const signUpInstitutionBaseSchema = z.object({
  institutionName: z
    .string()
    .min(2, "Institution name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: phoneNumberSchema,
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .or(z.literal(""))
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  verificationEvidence: z
    .string()
    .min(1, "Verification evidence is required"),
  websiteOrSocial: z.string().optional(),
  description: z
    .string()
    .min(10, "Please provide a short description (at least 10 characters)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpInstitutionSchema = signUpInstitutionBaseSchema
  .extend({
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Server-side schema (no confirmPassword — stripped before calling the action)
export const signUpInstitutionServerSchema = signUpInstitutionBaseSchema;

// Upload donation - used by institution
export const donationUploadSchema = z
  .object({
    title: z.string().trim().min(2).max(100),
    category: z.enum([
      "shirt",
      "school_supplies",
      "toys",
      "electronics",
      "home_supplies",
    ]),
    target: z.coerce.number().int().positive().min(1).max(10000),
    // At least one delivery method must be selected
    deliveryMethods: z
      .array(
        z.enum(["self_delivery", "third_party_courier", "pickup_by_institution"])
      )
      .min(1, "Please select at least one delivery method"),
    hasPickupService: z.boolean(),
    pickupMaxDistanceKm: z.coerce.number().int().positive().optional(),
    description: z
      .string()
      .min(10, "Please provide a description (at least 10 characters)")
      .max(10000),
    cover: z.string().min(1, "Cover photo is required"),
  })
  .refine(
    (data) => {
      // If pickup service is enabled, max distance must be provided
      if (data.hasPickupService && !data.pickupMaxDistanceKm) return false;
      return true;
    },
    {
      message: "Please specify max pickup distance",
      path: ["pickupMaxDistanceKm"],
    }
  );

// Donation request - submitted by user/donor
export const donationRequestSchema = z.object({
  // Personal info
  donorName: z.string().min(2, "Name is required").optional(),
  phoneNumber: phoneNumberSchema,
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  address: z.string().min(5, "Address is required"),
  // Donation info
  quantity: z.coerce.number().int().positive().min(1).max(10000),
  notes: z.string().optional(),
  donorPhoto: z.string().optional(),
  deliveryMethod: z.enum([
    "self_delivery",
    "third_party_courier",
    "pickup_by_institution",
  ]),
  estimatedPickupDate: z.string().optional(),
  estimatedPickupTime: z.string().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpUserInput = z.infer<typeof signUpUserSchema>;
export type SignUpInstitutionInput = z.infer<typeof signUpInstitutionSchema>;
export type DonationUploadInput = z.infer<typeof donationUploadSchema>;
export type DonationRequestInput = z.infer<typeof donationRequestSchema>;