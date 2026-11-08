"use server";

import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { users, institutions, donatur } from "@/app/database/schema";
import { signInWithCredentials as betterAuthSignIn, signUpUser as betterAuthSignUpUser, signUpInstitution as betterAuthSignUpInstitution } from "@/lib/auth";
import { headers } from "next/headers";
import { after } from "next/server";
import { geocodeAddress } from "@/lib/geocoding";
import { sendEmail, emailTemplates } from "@/lib/email";

// Postgres unique violation (e.g. users.email already registered)
const isUniqueViolation = (error: unknown) =>
  (error as { code?: string })?.code === "23505";

const EMAIL_TAKEN_ERROR = "An account with this email already exists.";

export const signInWithCredentials = async (params: {
  email: string;
  password: string;
}) => {
  const { email, password } = params;
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

  const institution = await db
    .select()
    .from(institutions)
    .where(eq(institutions.email, email))
    .limit(1);

  if (institution.length > 0) {
    return { role: "INSTITUTION", status: institution[0].status };
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
  zipCode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  password: string;
}) => {
  const { name, birthdate, phonenumber, email, city, state, zipCode, address, latitude, longitude, password } = params;

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
  if (latitude != null && longitude != null) {
    coords = { lat: latitude, lng: longitude };
    console.log("User signup using coordinates from address search:", { address, city, state, coords });
  } else {
    // Geocode address to coordinates for distance calculation
    coords = await geocodeAddress(address, city, state);
    console.log("User signup geocoding:", { address, city, state, coords });
  }

  try {
    const result = await betterAuthSignUpUser({
      name,
      email,
      password,
      birthdate,
      phoneNumber: phonenumber,
      city,
      state,
      zipCode,
      address,
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
    const template = emailTemplates.welcomeUser(name);
    after(() => sendEmail({ to: email, ...template }));

    // Auto sign in after registration with headers for session
    const reqHeaders = await headers();
    await betterAuthSignIn(email, password, reqHeaders);
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
  zipCode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  verificationEvidence: string;
  websiteOrSocial?: string;
  description: string;
  password: string;
}) => {
  const {
    institutionName,
    email,
    phoneNumber,
    city,
    state,
    zipCode,
    address,
    latitude,
    longitude,
    verificationEvidence,
    websiteOrSocial,
    description,
    password,
  } = params;

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

  const existingInstitution = await db
    .select()
    .from(institutions)
    .where(eq(institutions.email, email))
    .limit(1);

  if (existingInstitution.length > 0) {
    return {
      success: false,
      error: "An institution with this email already exists.",
    };
  }

  // Use coordinates from address search if provided, otherwise geocode
  let coords = null;
  if (latitude != null && longitude != null) {
    coords = { lat: latitude, lng: longitude };
    console.log("Institution signup using coordinates from address search:", { address, city, state, coords });
  } else {
    // Geocode institution address
    coords = await geocodeAddress(address, city, state);
    console.log("Institution signup geocoding:", { address, city, state, coords });
  }

  try {
    const result = await betterAuthSignUpInstitution({
      institutionName,
      email,
      password,
      phoneNumber,
      city,
      state,
      zipCode,
      address,
      verificationEvidence,
      websiteOrSocial,
      description,
    });

    if (!result.success) {
      return result;
    }

    // Update institution with geocoded coordinates
    await db
      .update(institutions)
      .set({
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      })
      .where(eq(institutions.email, email));

    // Notify admin about new institution registration via email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cheerity.com";
    const adminTemplate = emailTemplates.newInstitutionRegistration(institutionName, email);
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
