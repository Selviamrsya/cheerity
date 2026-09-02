import { z } from "zod";

// Sign in - used by all roles (user, institution, admin)
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Sign up - donor user
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

// Sign up - institution (hasPickupService removed - set per-donation instead)
export const signUpInstitutionSchema = z
  .object({
    institutionName: z
      .string()
      .min(2, "Institution name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    zipCode: z.string().min(3, "Zip Code is required"),
    address: z.string().min(5, "Address is required"),
    verificationEvidence: z
      .string()
      .min(1, "Verification evidence is required"),
    websiteOrSocial: z.string().optional(),
    description: z
      .string()
      .min(10, "Please provide a short description (at least 10 characters)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

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
  isAnonymous: z.boolean(),
  phoneNumber: z.string().min(8, "Phone number is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(3, "Zip code is required"),
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