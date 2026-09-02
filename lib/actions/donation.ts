"use server";

import { eq, sql, desc, and } from "drizzle-orm";
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
  return db
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
};

// Get donations uploaded by a specific institution
export const getInstitutionDonations = async (institutionId: string) => {
  return db
    .select()
    .from(donations)
    .where(eq(donations.institutionId, institutionId))
    .orderBy(desc(donations.createdAt));
};

// Get notifications for a user or institution
export const getNotifications = async (
  recipientId: string,
  recipientType: "USER" | "INSTITUTION"
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