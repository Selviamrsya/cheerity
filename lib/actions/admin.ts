"use server";

import { eq, count, desc } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { users, institutions, donations, donateRecords } from "@/app/database/schema";
import { sendEmail, emailTemplates } from "@/lib/workflow";
import { revalidatePath } from "next/cache";

// Get stats for admin dashboard
export const getAdminDashboardStats = async () => {
  const [totalUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "USER"));

  const [totalInstitutions] = await db
    .select({ count: count() })
    .from(institutions)
    .where(eq(institutions.status, "APPROVED"));

  const [pendingInstitutions] = await db
    .select({ count: count() })
    .from(institutions)
    .where(eq(institutions.status, "PENDING"));

  const [totalDonations] = await db.select({ count: count() }).from(donations);

  const [totalRequests] = await db.select({ count: count() }).from(donateRecords);

  return {
    totalUsers: totalUsers?.count ?? 0,
    totalInstitutions: totalInstitutions?.count ?? 0,
    pendingInstitutions: pendingInstitutions?.count ?? 0,
    totalDonations: totalDonations?.count ?? 0,
    totalRequests: totalRequests?.count ?? 0,
  };
};

// Get all institutions with optional status filter
export const getInstitutions = async (
  status?: "PENDING" | "APPROVED" | "REJECTED"
) => {
  return db
    .select()
    .from(institutions)
    .where(status ? eq(institutions.status, status) : undefined)
    .orderBy(desc(institutions.createdAt));
};

// Get a single institution by ID
export const getInstitutionById = async (id: string) => {
  const [institution] = await db
    .select()
    .from(institutions)
    .where(eq(institutions.id, id))
    .limit(1);
  return institution ?? null;
};

// Admin approves an institution
export const approveInstitution = async (institutionId: string) => {
  try {
    const institution = await getInstitutionById(institutionId);
    if (!institution) return { success: false, error: "Institution not found." };

    await db
      .update(institutions)
      .set({ status: "APPROVED" })
      .where(eq(institutions.id, institutionId));

    // Send approval email
    const template = emailTemplates.institutionApproved(institution.institutionName);
    await sendEmail({ email: institution.email, ...template });

    revalidatePath("/admin/institutions");
    return { success: true };
  } catch (error) {
    console.error("Approve institution error:", error);
    return { success: false, error: "Failed to approve institution." };
  }
};

// Admin rejects an institution
export const rejectInstitution = async (
  institutionId: string,
  reason?: string
) => {
  try {
    const institution = await getInstitutionById(institutionId);
    if (!institution) return { success: false, error: "Institution not found." };

    await db
      .update(institutions)
      .set({ status: "REJECTED" })
      .where(eq(institutions.id, institutionId));

    // Send rejection email
    const template = emailTemplates.institutionRejected(
      institution.institutionName,
      reason
    );
    await sendEmail({ email: institution.email, ...template });

    revalidatePath("/admin/institutions");
    return { success: true };
  } catch (error) {
    console.error("Reject institution error:", error);
    return { success: false, error: "Failed to reject institution." };
  }
};
