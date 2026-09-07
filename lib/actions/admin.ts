"use server";

import { eq, count, desc, sql, ilike, and } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { users, institutions, donations, donateRecords } from "@/app/database/schema";
import { sendEmail, emailTemplates } from "@/lib/workflow";
import { revalidatePath } from "next/cache";

// Get stats for admin dashboard
export const getAdminDashboardStats = async () => {
  try {
    const [totalUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.role}::text = 'USER'`);

    const [totalInstitutions] = await db
      .select({ count: count() })
      .from(institutions)
      .where(sql`${institutions.status}::text = 'APPROVED'`);

    const [pendingInstitutions] = await db
      .select({ count: count() })
      .from(institutions)
      .where(sql`${institutions.status}::text = 'PENDING'`);

    const [totalDonations] = await db.select({ count: count() }).from(donations);

    const [totalRequests] = await db.select({ count: count() }).from(donateRecords);

    return {
      totalUsers: totalUsers?.count ?? 0,
      totalInstitutions: totalInstitutions?.count ?? 0,
      pendingInstitutions: pendingInstitutions?.count ?? 0,
      totalDonations: totalDonations?.count ?? 0,
      totalRequests: totalRequests?.count ?? 0,
    };
  } catch (error) {
    console.error("Error in getAdminDashboardStats:", error);
    return {
      totalUsers: 0,
      totalInstitutions: 0,
      pendingInstitutions: 0,
      totalDonations: 0,
      totalRequests: 0,
    };
  }
};

// Get donation activity for chart (weekly, monthly, yearly)
export const getDonationActivityStats = async () => {
  try {
    const records = await db
      .select({
        id: donateRecords.id,
        requestDate: donateRecords.requestDate,
        quantity: donateRecords.quantity,
      })
      .from(donateRecords);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 1. Weekly: Past 7 days (exact count per day)
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly: { label: string; fullDate: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const actualCount = records.filter((r) => {
        if (!r.requestDate) return false;
        const rDate = new Date(r.requestDate);
        return rDate >= d && rDate < nextD;
      }).length;

      weekly.push({
        label: daysOfWeek[d.getDay()],
        fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: actualCount,
      });
    }

    // 2. Monthly: Activity within this month (weeks of current month)
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentMonthName = now.toLocaleDateString("en-US", { month: "short" });

    const monthWeeks = [
      { label: "Week 1", start: 1, end: 7 },
      { label: "Week 2", start: 8, end: 14 },
      { label: "Week 3", start: 15, end: 21 },
      { label: "Week 4", start: 22, end: 28 },
    ];
    if (daysInCurrentMonth > 28) {
      monthWeeks.push({ label: "Week 5", start: 29, end: daysInCurrentMonth });
    }

    const monthly: { label: string; fullDate: string; count: number }[] = monthWeeks.map((w) => {
      const actualCount = records.filter((r) => {
        if (!r.requestDate) return false;
        const rDate = new Date(r.requestDate);
        return (
          rDate.getFullYear() === currentYear &&
          rDate.getMonth() === currentMonth &&
          rDate.getDate() >= w.start &&
          rDate.getDate() <= w.end
        );
      }).length;

      return {
        label: w.label,
        fullDate: `${currentMonthName} ${w.start}-${w.end}`,
        count: actualCount,
      };
    });

    // 3. Yearly: Activity throughout this year (12 months of current year)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const yearly: { label: string; fullDate: string; count: number }[] = [];

    for (let m = 0; m < 12; m++) {
      const actualCount = records.filter((r) => {
        if (!r.requestDate) return false;
        const rDate = new Date(r.requestDate);
        return rDate.getFullYear() === currentYear && rDate.getMonth() === m;
      }).length;

      yearly.push({
        label: monthNames[m],
        fullDate: `${monthNames[m]} ${currentYear}`,
        count: actualCount,
      });
    }

    return {
      weekly,
      monthly,
      yearly,
    };
  } catch (error) {
    console.error("Error in getDonationActivityStats:", error);
    return {
      weekly: [],
      monthly: [],
      yearly: [],
    };
  }
};

// Get all institutions with optional status and search filter
export const getInstitutions = async (
  status?: "PENDING" | "APPROVED" | "REJECTED",
  search?: string
) => {
  try {
    const statusCondition = status
      ? sql`${institutions.status}::text = ${status}`
      : undefined;
    const searchCondition = search
      ? ilike(institutions.institutionName, `%${search}%`)
      : undefined;
    const whereClause =
      statusCondition && searchCondition
        ? and(statusCondition, searchCondition)
        : statusCondition ?? searchCondition;

    return await db
      .select()
      .from(institutions)
      .where(whereClause)
      .orderBy(desc(institutions.createdAt));
  } catch (error) {
    console.error("Error in getInstitutions:", error);
    return [];
  }
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
