"use server";

import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
import { eq, ilike } from "drizzle-orm";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function debugInstitutionStatus(institutionName: string) {
  const rl = await rateLimit("debug");
  if (!rl.allowed) {
    return { error: RATE_LIMIT_ERROR };
  }

  console.log("\n=== Debugging Institution Status ===\n");

  const institutionResults = await db
    .select()
    .from(institutions)
    .where(ilike(institutions.institutionName, `%${institutionName}%`))
    .limit(5);

  const results = [];

  for (const inst of institutionResults) {
    // Try to find user by ID first
    const [userById] = await db
      .select()
      .from(users)
      .where(eq(users.id, inst.id))
      .limit(1);

    // Also try to find user by email
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, inst.email))
      .limit(1);

    const user = userById || userByEmail;

    results.push({
      institution: {
        id: inst.id,
        name: inst.institutionName,
        email: inst.email,
        status: inst.status,
      },
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      } : null,
      match: user ? {
        idsMatch: user.id === inst.id,
        statusesMatch: user.status === inst.status,
        foundBy: userById ? "ID" : "EMAIL",
      } : null,
    });
  }

  return results;
}
