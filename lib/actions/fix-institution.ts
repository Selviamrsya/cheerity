"use server";

import { db } from "@/app/database/drizzle";
import { users, institutions, account, sessions } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function fixInstitutionUserRecord(institutionId: string) {
  const rl = await rateLimit("debug");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  try {
    console.log("=== Starting fix for institution:", institutionId);

    // Get institution data
    const [institution] = await db
      .select()
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1);

    if (!institution) {
      console.error("Institution not found");
      return { success: false, error: "Institution not found" };
    }

    console.log("Found institution:", institution.institutionName, institution.email);

    // Check if user already exists with same ID
    const [userById] = await db
      .select()
      .from(users)
      .where(eq(users.id, institutionId))
      .limit(1);

    console.log("User by ID:", userById ? "Found" : "Not found");

    // Check if user exists with same email (different ID)
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, institution.email))
      .limit(1);

    console.log("User by email:", userByEmail ? `Found (ID: ${userByEmail.id}, Role: ${userByEmail.role})` : "Not found");

    if (userById) {
      // User exists with correct ID - just update role and status
      console.log("Updating existing user role to INSTITUTION");
      await db
        .update(users)
        .set({
          role: "INSTITUTION",
          status: institution.status,
          name: institution.institutionName,
          fullName: institution.institutionName,
        })
        .where(eq(users.id, institutionId));

      return { success: true, message: "User record updated successfully" };
    }

    if (userByEmail) {
      // User exists with different ID - delete old user and create new one
      console.log("Deleting old user with ID:", userByEmail.id);

      // Delete sessions first (they reference users)
      console.log("Deleting old sessions");
      await db.delete(sessions).where(eq(sessions.userId, userByEmail.id));

      // Delete account records
      console.log("Deleting old account records");
      await db.delete(account).where(eq(account.userId, userByEmail.id));

      // Now delete the user
      console.log("Deleting old user");
      await db.delete(users).where(eq(users.id, userByEmail.id));
    }

    // Create user record
    console.log("Creating new user record");
    await db.insert(users).values({
      id: institution.id,
      email: institution.email,
      password: institution.password,
      name: institution.institutionName,
      fullName: institution.institutionName,
      role: "INSTITUTION",
      status: institution.status,
    });

    // Create account record for better-auth
    console.log("Creating account record");
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: institution.id,
      accountId: institution.id,
      providerId: "credential",
      password: institution.password,
    });

    console.log("Fix completed successfully");
    return { success: true, message: "User record created successfully" };
  } catch (error) {
    console.error("Fix institution user record error:", error);
    return { success: false, error: `Failed to create user record: ${error instanceof Error ? error.message : String(error)}` };
  }
}
