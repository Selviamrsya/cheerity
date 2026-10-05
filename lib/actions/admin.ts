"use server";

import { eq, count, desc, sql, ilike, and, inArray } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { users, institutions, donations, donateRecords, sessions, account, notifications } from "@/app/database/schema";
import { revalidatePath } from "next/cache";
import { getSession, auth } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocoding";
import { sendEmail, emailTemplates } from "@/lib/email";
import { headers } from "next/headers";

// Get stats for admin dashboard
export const getAdminDashboardStats = async () => {
  try {
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

// Get donation categories distribution for pie chart
export const getDonationCategoriesStats = async () => {
  try {
    const categoryStats = await db
      .select({
        category: donations.category,
        count: count(),
      })
      .from(donations)
      .groupBy(donations.category);

    // Group by category and calculate percentage
    const total = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
    
    return categoryStats.map((cat) => ({
      category: cat.category,
      count: cat.count,
      percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0,
    }));
  } catch (error) {
    console.error("Error in getDonationCategoriesStats:", error);
    return [];
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
      ? eq(institutions.status, status)
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

    await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, institutionId));

    // Send approval email to institution
    const template = emailTemplates.institutionApproved(institution.institutionName);
    await sendEmail({ to: institution.email, ...template });

    revalidatePath("/admin/institutions");
    return { success: true };
  } catch (error) {
    console.error("Approve institution error:", error);
    return { success: false, error: "Failed to approve institution." };
  }
};

// Admin rejects an institution - performs DELETE with cascade
export const rejectInstitution = async (
  institutionId: string,
  reason?: string
) => {
  try {
    const institution = await getInstitutionById(institutionId);
    if (!institution) return { success: false, error: "Institution not found." };

    // 1. Get all donations for this institution
    const institutionDonations = await db
      .select({ id: donations.id })
      .from(donations)
      .where(eq(donations.institutionId, institutionId));

    const donationIds = institutionDonations.map(d => d.id);

    // 2. Delete donate_records related to these donations
    if (donationIds.length > 0) {
      await db
        .delete(donateRecords)
        .where(inArray(donateRecords.donationId, donationIds));
    }

    // 3. Delete the donations
    await db
      .delete(donations)
      .where(eq(donations.institutionId, institutionId));

    // 4. Delete notifications for this institution
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.recipientId, institutionId),
          eq(notifications.recipientType, "INSTITUTION")
        )
      );

    // 5. Delete sessions for the user record
    await db
      .delete(sessions)
      .where(eq(sessions.userId, institutionId));

    // 6. Delete account records for the user
    await db
      .delete(account)
      .where(eq(account.userId, institutionId));

    // 7. Delete the user record (shares ID with institution)
    await db
      .delete(users)
      .where(eq(users.id, institutionId));

    // 8. Delete the institution record
    await db
      .delete(institutions)
      .where(eq(institutions.id, institutionId));

    revalidatePath("/admin/institutions");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Reject institution error:", error);
    return { success: false, error: "Failed to reject institution." };
  }
};

// Admin updates an institution's address and geocodes coordinates
export const updateInstitutionAddress = async (
  institutionId: string,
  data: {
    address: string;
    city: string;
    state: string;
    zipCode?: string;
  }
) => {
  try {
    const session = await getSession(await headers());
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const institution = await getInstitutionById(institutionId);
    if (!institution) return { success: false, error: "Institution not found." };

    const { address, city, state, zipCode } = data;

    if (!address?.trim() || !city?.trim() || !state?.trim()) {
      return { success: false, error: "Address, city, and state are required." };
    }

    // Geocode to calculate coordinates
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const coords = await geocodeAddress(address, city, state);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }

    await db
      .update(institutions)
      .set({
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode ? zipCode.trim() : null,
        latitude,
        longitude,
      })
      .where(eq(institutions.id, institutionId));

    revalidatePath(`/admin/institutions/${institutionId}`);
    revalidatePath("/admin/institutions");
    return { success: true };
  } catch (error) {
    console.error("Update institution address error:", error);
    return { success: false, error: "Failed to update institution address." };
  }
};

