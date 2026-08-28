"use server";

import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
import { signIn } from "@/app/auth";
import { hash } from "bcryptjs";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const signInWithCredentials = async (params: {
  email: string;
  password: string;
}) => {
  const { email, password } = params;
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Invalid email or password." };
  }
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
  password: string;
}) => {
  const {
    name,
    birthdate,
    phonenumber,
    email,
    city,
    state,
    zipCode,
    address,
    password,
  } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "A user with this email already exists." };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName: name,
      email,
      password: hashedPassword,
      birthdate,
      phoneNumber: phonenumber,
      city,
      state,
      zipCode,
      address,
    });

    await signInWithCredentials({ email, password });
    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
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
  verificationEvidence: string;
  hasPickupService: string;
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
    verificationEvidence,
    hasPickupService,
    websiteOrSocial,
    description,
    password,
  } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

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

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(institutions).values({
      institutionName,
      email,
      password: hashedPassword,
      phoneNumber,
      city,
      state,
      zipCode,
      address,
      verificationEvidence,
      hasPickupService: hasPickupService === "yes",
      websiteOrSocial: websiteOrSocial || null,
      description,
    });

    // Don't auto-login institutions — they need admin approval first
    return { success: true };
  } catch (error) {
    console.log(error, "Institution signup error");
    return { success: false, error: "An error occurred during registration." };
  }
};
