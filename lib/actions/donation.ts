"use server";

import { eq, sql, desc, and, count } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import {
  donations,
  donateRecords,
  institutions,
  notifications,
} from "@/app/database/schema";
import { revalidatePath } from "next/cache";

// Create a donation campaign (institution only)
export const createDonation = async (params: {
  institutionId: string;
  title: string;
  category: string;
  description: string;
  cover: string;
  target: number;
  deliveryMethods: string[];
  hasPickupService: boolean;
  pickupMaxDistanceKm?: number;
}) => {
  try {
    const [donation] = await db
      .insert(donations)
      .values({
        institutionId: params.institutionId,
        title: params.title,
        category: params.category,
        description: params.description,
        cover: params.cover || null,
        target: params.target,
        deliveryMethods: params.deliveryMethods,
        hasPickupService: params.hasPickupService,
        pickupMaxDistanceKm: params.pickupMaxDistanceKm ?? null,
      })
      .returning();

    revalidatePath("/institution/donations");
    return { success: true, data: donation };
  } catch (error) {
    console.error("Create donation error:", error);
    return { success: false, error: "Failed to create donation." };
  }
};

// Get all active donations with distance from user's location
// Uses Haversine formula in SQL to calculate straight-line distance
export const getDonationsWithDistance = async (params: {
  userLat?: number | null;
  userLng?: number | null;
  category?: string;
  maxDistanceKm?: number;
  limit?: number;
}) => {
  const { userLat, userLng, category, maxDistanceKm, limit = 50 } = params;

  const hasLocation = userLat != null && userLng != null;

  // Haversine formula calculates straight-line distance in km
  const distanceExpr = hasLocation
    ? sql<number>`ROUND(CAST(6371 * acos(
        LEAST(1.0, cos(radians(${userLat})) * cos(radians(${institutions.latitude})) *
        cos(radians(${institutions.longitude}) - radians(${userLng})) +
        sin(radians(${userLat})) * sin(radians(${institutions.latitude})))
      ) AS numeric), 1)`
    : sql<number>`NULL`;

  const results = await db
    .select({
      id: donations.id,
      title: donations.title,
      category: donations.category,
      description: donations.description,
      cover: donations.cover,
      target: donations.target,
      collected: donations.collected,
      deliveryMethods: donations.deliveryMethods,
      hasPickupService: donations.hasPickupService,
      pickupMaxDistanceKm: donations.pickupMaxDistanceKm,
      status: donations.status,
      createdAt: donations.createdAt,
      institutionId: institutions.id,
      institutionName: institutions.institutionName,
      institutionCity: institutions.city,
      institutionState: institutions.state,
      institutionLat: institutions.latitude,
      institutionLng: institutions.longitude,
      distanceKm: distanceExpr.as("distance_km"),
    })
    .from(donations)
    .innerJoin(institutions, eq(donations.institutionId, institutions.id))
    .where(
      and(
        eq(donations.status, "ACTIVE"),
        eq(institutions.status, "APPROVED"),
        category ? eq(donations.category, category) : undefined
      )
    )
    .orderBy(hasLocation ? sql`distance_km ASC NULLS LAST` : desc(donations.createdAt))
    .limit(limit);

  if (maxDistanceKm && hasLocation) {
    return results.filter(
      (d) => d.distanceKm === null || Number(d.distanceKm) <= maxDistanceKm
    );
  }

  return results;
};

// Get single donation detail
export const getDonationById = async (id: string) => {
  const [donation] = await db
    .select({
      id: donations.id,
      title: donations.title,
      category: donations.category,
      description: donations.description,
      cover: donations.cover,
      target: donations.target,
      collected: donations.collected,
      deliveryMethods: donations.deliveryMethods,
      hasPickupService: donations.hasPickupService,
      pickupMaxDistanceKm: donations.pickupMaxDistanceKm,
      status: donations.status,
      createdAt: donations.createdAt,
      institutionId: institutions.id,
      institutionName: institutions.institutionName,
      institutionCity: institutions.city,
      institutionState: institutions.state,
      institutionDescription: institutions.description,
      institutionWebsite: institutions.websiteOrSocial,
      institutionLat: institutions.latitude,
      institutionLng: institutions.longitude,
    })
    .from(donations)
    .innerJoin(institutions, eq(donations.institutionId, institutions.id))
    .where(eq(donations.id, id))
    .limit(1);

  return donation ?? null;
};

// Submit a donation request (user/donor)
export const submitDonationRequest = async (params: {
  userId: string;
  donationId: string;
  donorName?: string;
  isAnonymous: boolean;
  phoneNumber: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  quantity: number;
  notes?: string;
  donorPhoto?: string;
  deliveryMethod: string;
  estimatedPickupDate?: string;
  estimatedPickupTime?: string;
}) => {
  try {
    const [donation] = await db
      .select({ status: donations.status, institutionId: donations.institutionId, title: donations.title })
      .from(donations)
      .where(eq(donations.id, params.donationId))
      .limit(1);

    if (!donation || donation.status !== "ACTIVE") {
      return { success: false, error: "This donation campaign is no longer active." };
    }

    const [record] = await db
      .insert(donateRecords)
      .values({
        userId: params.userId,
        donationId: params.donationId,
        donorName: params.isAnonymous ? null : (params.donorName ?? null),
        isAnonymous: params.isAnonymous,
        phoneNumber: params.phoneNumber,
        city: params.city,
        state: params.state,
        zipCode: params.zipCode,
        address: params.address,
        quantity: params.quantity,
        notes: params.notes ?? null,
        donorPhoto: params.donorPhoto ?? null,
        deliveryMethod: params.deliveryMethod,
        estimatedPickupDate: params.estimatedPickupDate ?? null,
        estimatedPickupTime: params.estimatedPickupTime ?? null,
        status: "PENDING",
      })
      .returning();

    await db.insert(notifications).values({
      recipientId: donation.institutionId,
      recipientType: "INSTITUTION",
      title: "New Donation Request",
      message: `A new donation request has been submitted for "${donation.title}".`,
      type: "NEW_REQUEST",
      relatedId: record.id,
    });

    revalidatePath("/history");
    return { success: true, data: record };
  } catch (error) {
    console.error("Submit donation request error:", error);
    return { success: false, error: "Failed to submit donation request." };
  }
};

// Institution approves a donation request
export const approveDonationRequest = async (recordId: string, _institutionId?: string) => {
  try {
    const [record] = await db
      .select({
        userId: donateRecords.userId,
        donationId: donateRecords.donationId,
        status: donateRecords.status,
        quantity: donateRecords.quantity,
      })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record || record.status !== "PENDING") {
      return { success: false, error: "Request not found or already processed." };
    }

    await db
      .update(donateRecords)
      .set({
        status: "APPROVED",
        approvalDate: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Donation Request Approved",
      message: "Your donation request has been approved! Please prepare for delivery.",
      type: "REQUEST_APPROVED",
      relatedId: recordId,
    });

    revalidatePath("/institution/history");
    return { success: true };
  } catch (error) {
    console.error("Approve request error:", error);
    return { success: false, error: "Failed to approve request." };
  }
};

// Institution rejects a donation request
export const rejectDonationRequest = async (
  recordId: string,
  _institutionId?: string,
  reason?: string
) => {
  try {
    const [record] = await db
      .select({ userId: donateRecords.userId, status: donateRecords.status })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record || record.status !== "PENDING") {
      return { success: false, error: "Request not found or already processed." };
    }

    await db
      .update(donateRecords)
      .set({
        status: "REJECTED",
        rejectionReason: reason ?? null,
        approvalDate: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Donation Request Rejected",
      message: reason
        ? `Your donation request was rejected. Reason: ${reason}`
        : "Your donation request was not approved.",
      type: "REQUEST_REJECTED",
      relatedId: recordId,
    });

    revalidatePath("/institution/history");
    return { success: true };
  } catch (error) {
    console.error("Reject request error:", error);
    return { success: false, error: "Failed to reject request." };
  }
};

// Institution marks delivery in progress
export const markOnProgress = async (recordId: string) => {
  try {
    await db
      .update(donateRecords)
      .set({ status: "ON_PROGRESS", deliveryDate: new Date() })
      .where(eq(donateRecords.id, recordId));

    revalidatePath("/institution/history");
    return { success: true };
  } catch (error) {
    console.error("Mark on progress error:", error);
    return { success: false, error: "Failed to update status." };
  }
};

// Institution marks goods arrived and uploads proof photo
export const markArrived = async (recordId: string, proofPhoto: string) => {
  try {
    const [record] = await db
      .select({ donationId: donateRecords.donationId, quantity: donateRecords.quantity, userId: donateRecords.userId })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record) return { success: false, error: "Record not found." };

    await db
      .update(donateRecords)
      .set({
        status: "ARRIVED",
        arrivalProofPhoto: proofPhoto,
        arrivedDate: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    const [donationData] = await db
      .select({ target: donations.target, collected: donations.collected })
      .from(donations)
      .where(eq(donations.id, record.donationId))
      .limit(1);

    const newCollected = (donationData?.collected ?? 0) + record.quantity;
    const isComplete = newCollected >= (donationData?.target ?? 0);

    await db
      .update(donations)
      .set({
        collected: newCollected,
        status: isComplete ? "COMPLETED" : "ACTIVE",
      })
      .where(eq(donations.id, record.donationId));

    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Your Donation Has Arrived!",
      message: "The institution has confirmed that your donation arrived. Thank you!",
      type: "ARRIVED",
      relatedId: recordId,
    });

    revalidatePath("/institution/history");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Mark arrived error:", error);
    return { success: false, error: "Failed to update status." };
  }
};

// Get donation history for a user (donor)
export const getUserDonationHistory = async (userId: string) => {
  return db
    .select({
      id: donateRecords.id,
      status: donateRecords.status,
      quantity: donateRecords.quantity,
      deliveryMethod: donateRecords.deliveryMethod,
      requestDate: donateRecords.requestDate,
      approvalDate: donateRecords.approvalDate,
      deliveryDate: donateRecords.deliveryDate,
      arrivedDate: donateRecords.arrivedDate,
      arrivalProofPhoto: donateRecords.arrivalProofPhoto,
      rejectionReason: donateRecords.rejectionReason,
      donationTitle: donations.title,
      donationCategory: donations.category,
      donationCover: donations.cover,
      institutionName: institutions.institutionName,
    })
    .from(donateRecords)
    .innerJoin(donations, eq(donateRecords.donationId, donations.id))
    .innerJoin(institutions, eq(donations.institutionId, institutions.id))
    .where(eq(donateRecords.userId, userId))
    .orderBy(desc(donateRecords.requestDate));
};

// Get donation requests for an institution
export const getInstitutionDonationHistory = async (institutionId: string) => {
  try {
    if (!institutionId) return [];
    return await db
      .select({
        id: donateRecords.id,
        status: donateRecords.status,
        donorName: donateRecords.donorName,
        isAnonymous: donateRecords.isAnonymous,
        phoneNumber: donateRecords.phoneNumber,
        city: donateRecords.city,
        quantity: donateRecords.quantity,
        deliveryMethod: donateRecords.deliveryMethod,
        notes: donateRecords.notes,
        donorPhoto: donateRecords.donorPhoto,
        estimatedPickupDate: donateRecords.estimatedPickupDate,
        estimatedPickupTime: donateRecords.estimatedPickupTime,
        requestDate: donateRecords.requestDate,
        approvalDate: donateRecords.approvalDate,
        arrivalProofPhoto: donateRecords.arrivalProofPhoto,
        rejectionReason: donateRecords.rejectionReason,
        donationTitle: donations.title,
        donationCategory: donations.category,
      })
      .from(donateRecords)
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .where(eq(donations.institutionId, institutionId))
      .orderBy(desc(donateRecords.requestDate));
  } catch (error) {
    console.error("Error fetching institution donation history:", error);
    return [];
  }
};

// Get donations uploaded by a specific institution
export const getInstitutionDonations = async (institutionId: string) => {
  try {
    if (!institutionId) return [];
    return await db
      .select()
      .from(donations)
      .where(eq(donations.institutionId, institutionId))
      .orderBy(desc(donations.createdAt));
  } catch (error) {
    console.error("Error fetching institution donations:", error);
    return [];
  }
};

// Get donor location distribution for institution pie chart
export const getDonorLocationStats = async (institutionId: string) => {
  try {
    if (!institutionId) return [];
    
    const locationStats = await db
      .select({
        city: donateRecords.city,
        count: count(),
      })
      .from(donateRecords)
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .where(eq(donations.institutionId, institutionId))
      .groupBy(donateRecords.city);

    // Calculate percentage
    const total = locationStats.reduce((sum, loc) => sum + loc.count, 0);
    
    return locationStats
      .map((loc) => ({
        city: loc.city || "Unknown",
        count: loc.count,
        percentage: total > 0 ? Math.round((loc.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities
  } catch (error) {
    console.error("Error in getDonorLocationStats:", error);
    return [];
  }
};

// Get donation activity for institution chart (weekly, monthly, yearly)
export const getInstitutionDonationActivityStats = async (institutionId: string) => {
  try {
    if (!institutionId) {
      return {
        weekly: [],
        monthly: [],
        yearly: [],
      };
    }

    const records = await db
      .select({
        id: donateRecords.id,
        requestDate: donateRecords.requestDate,
        quantity: donateRecords.quantity,
      })
      .from(donateRecords)
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .where(eq(donations.institutionId, institutionId));

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
    console.error("Error in getInstitutionDonationActivityStats:", error);
    return {
      weekly: [],
      monthly: [],
      yearly: [],
    };
  }
};

// Get notifications for a user or institution
export const getNotifications = async (
  recipientId: string,
  recipientType: "USER" | "INSTITUTION" | "ADMIN"
) => {
  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, recipientId),
        eq(notifications.recipientType, recipientType)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(20);
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
};