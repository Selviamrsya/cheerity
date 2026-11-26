"use server";

import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { users, institutions, donatur } from "@/app/database/schema";
import { signInWithCredentials as betterAuthSignIn, signUpUser as betterAuthSignUpUser, signUpInstitution as betterAuthSignUpInstitution } from "@/lib/auth";
import { headers } from "next/headers";
import { after } from "next/server";
import { geocodeAddress } from "@/lib/geocoding";
import { sendEmail, emailTemplates } from "@/lib/email";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";
import { ensureHttpUrl } from "@/lib/utils";
import { signUpUserServerSchema, signUpInstitutionServerSchema } from "@/lib/validations";

// Postgres unique violation (e.g. users.email already registered)
const isUniqueViolation = (error: unknown) =>
  (error as { code?: string })?.code === "23505";

const EMAIL_TAKEN_ERROR = "An account with this email already exists.";

export const signInWithCredentials = async (params: {
  email: string;
  password: string;
}) => {
  const { email, password } = params;

  // Rate limit: per IP + per email untuk cegah brute force
  const ipLimit = await rateLimit("signIn");
  if (!ipLimit.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }
  const emailLimit = await rateLimit("signInEmail", email.trim().toLowerCase());
  if (!emailLimit.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  const reqHeaders = await headers();
  return betterAuthSignIn(email, password, reqHeaders);
};

export const getUserRole = async (email: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length > 0) {
    return { role: user[0].role, status: user[0].status };
  }

  return { role: "USER" };
};

export const signUpUser = async (params: {
  name: string;
  birthdate: string;
  phonenumber: string;
  email: string;
  city: string;
  state: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  password: string;
}) => {
  const rl = await rateLimit("signUp");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  // Re-validate server-side — client-side zod can be bypassed
  const parsed = signUpUserServerSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: EMAIL_TAKEN_ERROR };
  }

  // Use coordinates from address search if provided, otherwise geocode
  let coords = null;
  if (data.latitude != null && data.longitude != null) {
    coords = { lat: data.latitude, lng: data.longitude };
    console.log("User signup using coordinates from address search:", { address: data.address, city: data.city, state: data.state, coords });
  } else {
    // Geocode address to coordinates for distance calculation
    coords = await geocodeAddress(data.address || "", data.city, data.state);
    console.log("User signup geocoding:", { address: data.address, city: data.city, state: data.state, coords });
  }

  try {
    const result = await betterAuthSignUpUser({
      name: data.name,
      email,
      password: data.password,
      birthdate: data.birthdate,
      phoneNumber: data.phonenumber,
      city: data.city,
      state: data.state,
      address: data.address?.trim() ? data.address : undefined,
    });

    if (!result.success) {
      return result;
    }

    // Update donatur child record with geocoded coordinates
    const [createdUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (createdUser) {
      await db
        .update(donatur)
        .set({
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        })
        .where(eq(donatur.userId, createdUser.id));
    }

    // Send welcome email (non-blocking)
    const template = emailTemplates.welcomeUser(data.name);
    after(() => sendEmail({ to: email, ...template }));

    // Auto sign in after registration with headers for session
    const reqHeaders = await headers();
    await betterAuthSignIn(email, data.password, reqHeaders);
    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    if (isUniqueViolation(error)) {
      return { success: false, error: EMAIL_TAKEN_ERROR };
    }
    return { success: false, error: "An error occurred during sign up." };
  }
};

export const signUpInstitution = async (params: {
  institutionName: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  verificationEvidence: string;
  websiteOrSocial?: string;
  description: string;
  password: string;
}) => {
  const rl = await rateLimit("signUp");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  // Re-validate server-side — client-side zod can be bypassed
  const parsed = signUpInstitutionServerSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  // users.email is globally unique across all roles — check it first so a
  // donor's email can't be reused for an institution registration.
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: EMAIL_TAKEN_ERROR };
  }

  // Use coordinates from address search if provided, otherwise geocode
  let coords = null;
  if (data.latitude != null && data.longitude != null) {
    coords = { lat: data.latitude, lng: data.longitude };
    console.log("Institution signup using coordinates from address search:", { address: data.address, city: data.city, state: data.state, coords });
  } else {
    // Geocode institution address
    coords = await geocodeAddress(data.address || "", data.city, data.state);
    console.log("Institution signup geocoding:", { address: data.address, city: data.city, state: data.state, coords });
  }

  try {
    const result = await betterAuthSignUpInstitution({
      institutionName: data.institutionName,
      email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      city: data.city,
      state: data.state,
      address: data.address?.trim() ? data.address : undefined,
      verificationEvidence: data.verificationEvidence,
      websiteOrSocial: data.websiteOrSocial ? ensureHttpUrl(data.websiteOrSocial.trim()) : data.websiteOrSocial,
      description: data.description,
    });

    if (!result.success) {
      return result;
    }

    // Update institution with geocoded coordinates (institutions share the
    // users.id UUID, so look the user up by email to get the institution id)
    const [createdUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (createdUser) {
      await db
        .update(institutions)
        .set({
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        })
        .where(eq(institutions.userId, createdUser.id));
    }

    // Notify admin about new institution registration via email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cheerity.com";
    const adminTemplate = emailTemplates.newInstitutionRegistration(data.institutionName, email);
    after(() => sendEmail({ to: adminEmail, ...adminTemplate }));

    // Institution must wait for admin approval before logging in
    return { success: true };
  } catch (error) {
    console.error("Institution signup error:", error);
    if (isUniqueViolation(error)) {
      return { success: false, error: EMAIL_TAKEN_ERROR };
    }
    return { success: false, error: "An error occurred during registration." };
  }
};
