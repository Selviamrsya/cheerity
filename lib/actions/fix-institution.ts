"use server";

import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
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

    console.log("Found institution:", institution.institutionName);

    // Institutions share the users.id UUID — the user row holds
    // email/password/role/status for login.
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, institutionId))
      .limit(1);

    if (!user) {
      console.error("No user record found for institution", institutionId);
      return {
        success: false,
        error:
          "No user record found. Credentials can't be recovered automatically — the institution must register again.",
      };
    }

    console.log("Syncing user record (role/status/name) from institution");
    await db
      .update(users)
      .set({
        role: "INSTITUTION",
        status: institution.status,
        name: institution.institutionName,
        fullName: institution.institutionName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, institutionId));

    console.log("Fix completed successfully");
    return { success: true, message: "User record synced successfully" };
  } catch (error) {
    console.error("Fix institution user record error:", error);
    return { success: false, error: `Failed to sync user record: ${error instanceof Error ? error.message : String(error)}` };
  }
}
