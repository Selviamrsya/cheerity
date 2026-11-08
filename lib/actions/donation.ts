"use server";

import { eq, sql, desc, and, count } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import {
  donations,
  donateRecords,
  institutions,
  notifications,
  users,
} from "@/app/database/schema";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";
import { fetchOSRMDistances, OSDestination } from "@/lib/utils/osrm";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

// Get single donation campaign detail (for donation request form page)
export const getDonationCampaignById = async (id: string) => {
  try {
    const [campaign] = await db
      .select({
        id: donations.id,
        title: donations.title,
        description: donations.description,
        category: donations.category,
        cover: donations.cover,
        target: donations.target,
        collected: donations.collected,
        deliveryMethods: donations.deliveryMethods,
        hasPickupService: donations.hasPickupService,
        pickupMaxDistanceKm: donations.pickupMaxDistanceKm,
        status: donations.status,
        institutionId: donations.institutionId,
        institutionName: institutions.institutionName, // Dijamin string karena innerJoin
        institutionCity: institutions.city,
        institutionState: institutions.state,
      })
      .from(donations)
      .innerJoin(institutions, eq(donations.institutionId, institutions.id)) // <--- Ubah ke innerJoin
      .where(eq(donations.id, id))
      .limit(1);

    return campaign ?? null;
  } catch (error) {
    console.error("Error fetching donation campaign by ID:", error);
    return null;
  }
};

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
  const rl = await rateLimit("createDonation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

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
// Then enriches with OSRM driving distance for the top 20 results
export const getDonationsWithDistance = async (params: {
  userLat?: number | null;
  userLng?: number | null;
  category?: string;
  maxDistanceKm?: number;
  limit?: number;
}) => {
  const { userLat, userLng, category, maxDistanceKm, limit = 20 } = params;

  const hasLocation = userLat != null && userLng != null;

  // Haversine formula calculates straight-line distance in km
  const distanceExpr = hasLocation
    ? sql<number>`ROUND(CAST(
        6371 * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(${institutions.latitude} - ${userLat}) / 2), 2) +
          COS(RADIANS(${userLat})) * COS(RADIANS(${institutions.latitude})) *
          POWER(SIN(RADIANS(${institutions.longitude} - ${userLng}) / 2), 2)
        ))
      AS numeric), 1)`
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
    .orderBy(hasLocation ? distanceExpr : desc(donations.createdAt))
    .limit(limit);

  let enrichedResults = results.map((d) => ({
  ...d,
  drivingDistanceKm: d.distanceKm as number | null,
}));

  // Enrich with OSRM driving distance if user location is available
  if (hasLocation && results.length > 0) {
    const destinations: OSDestination[] = results
      .filter((d) => d.institutionLat != null && d.institutionLng != null)
      .slice(0, 20) // Cap OSRM enrichment to the top 20 nearest results
      .map((d) => ({
        id: d.id,
        lat: d.institutionLat!,
        lng: d.institutionLng!,
      }));

    if (destinations.length > 0) {
      const osrmResults = await fetchOSRMDistances(userLat!, userLng!, destinations);

      // Create a map for quick lookup
      const osrmMap = new Map(osrmResults.map((r) => [r.id, r.drivingDistanceKm]));

      // Enrich results with driving distance
      enrichedResults = results.map((d) => {
        const drivingDistanceKm = osrmMap.get(d.id);
        return {
          ...d,
          // Fallback to Haversine distance if OSRM fails
          drivingDistanceKm: drivingDistanceKm ?? d.distanceKm,
        };
      });
    }
  }

  if (maxDistanceKm && hasLocation) {
    return enrichedResults.filter(
      (d) => d.distanceKm === null || Number(d.distanceKm) <= maxDistanceKm
    );
  }

  return enrichedResults;
};

// Get single donation detail
export const getDonationById = async (id: string) => {
  const [record] = await db
    .select({
      id: donateRecords.id,
      status: donateRecords.status,
      quantity: donateRecords.quantity,
      deliveryMethod: donateRecords.deliveryMethod,
      notes: donateRecords.notes,
      donorPhoto: donateRecords.donorPhoto,
      estimatedPickupDate: donateRecords.estimatedPickupDate,
      estimatedPickupTime: donateRecords.estimatedPickupTime,
      requestDate: donateRecords.requestDate,
      updatedAt: donateRecords.updatedAt,
      documentationPhoto: donateRecords.documentationPhoto,
      rejectionReason: donateRecords.rejectionReason,
      cancelReason: donateRecords.cancelReason,
      // Data dari tabel donations
      title: donations.title,
      category: donations.category,
      cover: donations.cover,
      description: donations.description,
      // Data dari tabel institutions
      institutionName: institutions.institutionName,
      // Data dari tabel donate_records sendiri
      donorName: donateRecords.donorName,
      phoneNumber: donateRecords.phoneNumber,
      city: donateRecords.city,
      state: donateRecords.state,
      zipCode: donateRecords.zipCode,
      address: donateRecords.address,
      userId: donateRecords.userId,
    })
    .from(donateRecords)
    .innerJoin(donations, eq(donateRecords.donationId, donations.id))
    .innerJoin(institutions, eq(donations.institutionId, institutions.id))
    .where(eq(donateRecords.id, id))
    .limit(1);

  return record ?? null;
};

// Submit a donation request (user/donor)
export const submitDonationRequest = async (params: {
  userId: string;
  donationId: string;
  donorName?: string;
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
  // Rate limit: per IP + per userId
  const ipLimit = await rateLimit("donationSubmit");
  if (!ipLimit.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }
  const userLimit = await rateLimit("donationSubmit", `user:${params.userId}`);
  if (!userLimit.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

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
        donorName: params.donorName,
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

// Institution approves a donation request (PENDING -> ON_PROGRESS directly)
export const approveDonationRequest = async (recordId: string, _institutionId?: string) => {
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

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

    // Get user email and donation info
    const [userAndDonation] = await db
      .select({
        userEmail: users.email,
        donationTitle: donations.title,
        institutionName: institutions.institutionName,
      })
      .from(users)
      .innerJoin(donateRecords, eq(users.id, donateRecords.userId))
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .innerJoin(institutions, eq(donations.institutionId, institutions.id))
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    // Set directly to ON_PROGRESS (no APPROVED step)
    await db
      .update(donateRecords)
      .set({
        status: "ON_PROGRESS",
        updatedAt: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    // Update donation collected count when accepted
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
      title: "Donation Request Accepted",
      message: "Your donation request has been accepted! The item is now on progress.",
      type: "REQUEST_APPROVED",
      relatedId: recordId,
    });

    // Send email to donatur
    if (userAndDonation?.userEmail) {
      const template = emailTemplates.donationRequestAccepted(
        userAndDonation.donationTitle,
        userAndDonation.institutionName
      );
      after(() => sendEmail({ to: userAndDonation.userEmail, ...template }));
    }

    revalidatePath("/institution/history");
    revalidatePath("/donations/[id]");
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
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  try {
    const [record] = await db
      .select({ userId: donateRecords.userId, status: donateRecords.status })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record || record.status !== "PENDING") {
      return { success: false, error: "Request not found or already processed." };
    }

    // Get user email and donation info
    const [userAndDonation] = await db
      .select({
        userEmail: users.email,
        donationTitle: donations.title,
      })
      .from(users)
      .innerJoin(donateRecords, eq(users.id, donateRecords.userId))
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    await db
      .update(donateRecords)
      .set({
        status: "REJECTED",
        rejectionReason: reason ?? null,
        updatedAt: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    // No need to update collected count since PENDING requests don't affect it

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

    // Send email to donatur
    if (userAndDonation?.userEmail) {
      const template = emailTemplates.donationRequestRejected(
        userAndDonation.donationTitle,
        reason
      );
      after(() => sendEmail({ to: userAndDonation.userEmail, ...template }));
    }

    revalidatePath("/institution/history");
    revalidatePath("/donations/[id]");
    return { success: true };
  } catch (error) {
    console.error("Reject request error:", error);
    return { success: false, error: "Failed to reject request." };
  }
};

// Institution marks delivery in progress (now unused directly, but kept for compatibility)
// Accept moves directly to ON_PROGRESS via approveDonationRequest
export const markOnProgress = async (recordId: string) => {
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  try {
    await db
      .update(donateRecords)
      .set({ status: "ON_PROGRESS", updatedAt: new Date() })
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
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

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
        status: "WAITING_FOR_DOCUMENTATION",
        arrivalProofPhoto: proofPhoto,
        updatedAt: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

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

// Institution marks donation as complete (ON_PROGRESS -> WAITING_FOR_DOCUMENTATION)
// This is called when institution clicks "Mark Done" - moves to documentation stage
export const markDonationComplete = async (recordId: string) => {
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  try {
    const [record] = await db
      .select({ userId: donateRecords.userId, status: donateRecords.status })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record || record.status !== "ON_PROGRESS") {
      return { success: false, error: "Record not found or invalid status." };
    }

    await db
      .update(donateRecords)
      .set({
        status: "WAITING_FOR_DOCUMENTATION",
        updatedAt: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Donation Arrived",
      message: "Your donation has arrived at the institution and is waiting for documentation.",
      type: "ARRIVED",
      relatedId: recordId,
    });

    revalidatePath("/institution/history");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Mark donation complete error:", error);
    return { success: false, error: "Failed to update status." };
  }
};

// Institution uploads documentation and completes donation (WAITING_FOR_DOCUMENTATION -> COMPLETED)
export const uploadDocumentationAndComplete = async (recordId: string, documentationPhoto: string) => {
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  try {
    const [record] = await db
      .select({
        donationId: donateRecords.donationId,
        quantity: donateRecords.quantity,
        userId: donateRecords.userId,
        status: donateRecords.status,
      })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record || record.status !== "WAITING_FOR_DOCUMENTATION") {
      return { success: false, error: "Record not found or invalid status." };
    }

    // Get user email and donation info
    const [userAndDonation] = await db
      .select({
        userEmail: users.email,
        donationTitle: donations.title,
        institutionName: institutions.institutionName,
      })
      .from(users)
      .innerJoin(donateRecords, eq(users.id, donateRecords.userId))
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .innerJoin(institutions, eq(donations.institutionId, institutions.id))
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    await db
      .update(donateRecords)
      .set({
        status: "COMPLETED",
        documentationPhoto: documentationPhoto,
        updatedAt: new Date(),
      })
      .where(eq(donateRecords.id, recordId));

    // Collected count already updated when approved, no need to update here

    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Donation Completed!",
      message: "Your donation has been completed successfully. Thank you for your generosity!",
      type: "ARRIVED",
      relatedId: recordId,
    });

    // Send email to donatur
    if (userAndDonation?.userEmail) {
      const template = emailTemplates.donationCompleted(
        userAndDonation.donationTitle,
        userAndDonation.institutionName
      );
      after(() => sendEmail({ to: userAndDonation.userEmail, ...template }));
    }

    revalidatePath("/institution/history");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Upload documentation error:", error);
    return { success: false, error: "Failed to update status." };
  }
};

// Institution rejects donation from ON_PROGRESS status
export const rejectDonationFromProgress = async (
  recordId: string,
  institutionId?: string,
  reason?: string
) => {
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  try {
    const [record] = await db
      .select({
        userId: donateRecords.userId,
        status: donateRecords.status,
        donationId: donateRecords.donationId,
        quantity: donateRecords.quantity,
      })
      .from(donateRecords)
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    if (!record || record.status !== "ON_PROGRESS") {
      return { success: false, error: "Record not found or invalid status." };
    }

    // Get user email and donation info
    const [userAndDonation] = await db
      .select({
        userEmail: users.email,
        donationTitle: donations.title,
      })
      .from(users)
      .innerJoin(donateRecords, eq(users.id, donateRecords.userId))
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    await db
      .update(donateRecords)
      .set({
        status: "REJECTED",
        rejectionReason: reason ?? null,
      })
      .where(eq(donateRecords.id, recordId));

    // Decrease collected count since this was previously approved
    const [donationData] = await db
      .select({ collected: donations.collected })
      .from(donations)
      .where(eq(donations.id, record.donationId))
      .limit(1);

    const newCollected = Math.max(0, (donationData?.collected ?? 0) - record.quantity);

    await db
      .update(donations)
      .set({
        collected: newCollected,
        status: "ACTIVE", // Reopen donation if it was completed
      })
      .where(eq(donations.id, record.donationId));

    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Donation Rejected",
      message: reason
        ? `Your donation was rejected. Reason: ${reason}`
        : "Your donation was rejected.",
      type: "REQUEST_REJECTED",
      relatedId: recordId,
    });

    // Send email to donatur
    if (userAndDonation?.userEmail) {
      const template = emailTemplates.donationRequestRejected(
        userAndDonation.donationTitle,
        reason
      );
      after(() => sendEmail({ to: userAndDonation.userEmail, ...template }));
    }

    revalidatePath("/institution/history");
    revalidatePath("/history");
    revalidatePath("/donations/[id]");
    return { success: true };
  } catch (error) {
    console.error("Reject donation error:", error);
    return { success: false, error: "Failed to reject donation." };
  }
};

// Cancel donation from ON_PROGRESS status (for both donor and institution)
export const cancelDonation = async (
  recordId: string,
  reason?: string
) => {
  const rl = await rateLimit("donationMutation");
  if (!rl.allowed) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

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

    if (!record || record.status !== "ON_PROGRESS") {
      return { success: false, error: "Record not found or invalid status." };
    }

    // Get institution ID from donation
    const [donation] = await db
      .select({ institutionId: donations.institutionId })
      .from(donations)
      .where(eq(donations.id, record.donationId))
      .limit(1);

    if (!donation) return { success: false, error: "Donation not found." };

    // Get user email and donation info
    const [userAndDonation] = await db
      .select({
        userEmail: users.email,
        donationTitle: donations.title,
        institutionName: institutions.institutionName,
      })
      .from(users)
      .innerJoin(donateRecords, eq(users.id, donateRecords.userId))
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .innerJoin(institutions, eq(donations.institutionId, institutions.id))
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    await db
      .update(donateRecords)
      .set({
        status: "REJECTED",
        cancelReason: reason ?? null,
      })
      .where(eq(donateRecords.id, recordId));

    // Decrease collected count since this was previously accepted
    const [donationData] = await db
      .select({ collected: donations.collected })
      .from(donations)
      .where(eq(donations.id, record.donationId))
      .limit(1);

    const newCollected = Math.max(0, (donationData?.collected ?? 0) - record.quantity);

    await db
      .update(donations)
      .set({
        collected: newCollected,
        status: "ACTIVE", // Reopen donation if it was completed
      })
      .where(eq(donations.id, record.donationId));

    // Notify user
    await db.insert(notifications).values({
      recipientId: record.userId,
      recipientType: "USER",
      title: "Donation Cancelled",
      message: reason
        ? `Your donation was cancelled. Reason: ${reason}`
        : "Your donation was cancelled.",
      type: "REQUEST_REJECTED",
      relatedId: recordId,
    });

    // Notify institution
    await db.insert(notifications).values({
      recipientId: donation.institutionId,
      recipientType: "INSTITUTION",
      title: "Donation Cancelled",
      message: reason
        ? `A donation was cancelled. Reason: ${reason}`
        : "A donation was cancelled.",
      type: "REQUEST_REJECTED",
      relatedId: recordId,
    });

    // Send email to donatur
    if (userAndDonation?.userEmail) {
      const template = emailTemplates.donationRequestRejected(
        userAndDonation.donationTitle,
        reason
      );
      after(() => sendEmail({ to: userAndDonation.userEmail, ...template }));
    }

    revalidatePath("/institution/history");
    revalidatePath("/history");
    revalidatePath("/donations/[id]");
    return { success: true };
  } catch (error) {
    console.error("Cancel donation error:", error);
    return { success: false, error: "Failed to cancel donation." };
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
      updatedAt: donateRecords.updatedAt,
      documentationPhoto: donateRecords.documentationPhoto,
      rejectionReason: donateRecords.rejectionReason,
      cancelReason: donateRecords.cancelReason,
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
        phoneNumber: donateRecords.phoneNumber,
        city: donateRecords.city,
        quantity: donateRecords.quantity,
        deliveryMethod: donateRecords.deliveryMethod,
        notes: donateRecords.notes,
        donorPhoto: donateRecords.donorPhoto,
        estimatedPickupDate: donateRecords.estimatedPickupDate,
        estimatedPickupTime: donateRecords.estimatedPickupTime,
        requestDate: donateRecords.requestDate,
        updatedAt: donateRecords.updatedAt,
        documentationPhoto: donateRecords.documentationPhoto,
        rejectionReason: donateRecords.rejectionReason,
        cancelReason: donateRecords.cancelReason,
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

// Get a single donation record by ID (for detail page)
export const getDonationRecordById = async (recordId: string) => {
  try {
    const [record] = await db
      .select({
        id: donateRecords.id,
        status: donateRecords.status,
        quantity: donateRecords.quantity,
        deliveryMethod: donateRecords.deliveryMethod,
        notes: donateRecords.notes,
        donorPhoto: donateRecords.donorPhoto,
        estimatedPickupDate: donateRecords.estimatedPickupDate,
        estimatedPickupTime: donateRecords.estimatedPickupTime,
        requestDate: donateRecords.requestDate,
        updatedAt: donateRecords.updatedAt,
        documentationPhoto: donateRecords.documentationPhoto,
        rejectionReason: donateRecords.rejectionReason,
        cancelReason: donateRecords.cancelReason,
        title: donations.title,
        category: donations.category,
        cover: donations.cover,
        description: donations.description,
        institutionName: institutions.institutionName,
        donorName: donateRecords.donorName,
        phoneNumber: donateRecords.phoneNumber,
        city: donateRecords.city,
        state: donateRecords.state,
        zipCode: donateRecords.zipCode,
        address: donateRecords.address,
        userId: donateRecords.userId,
      })
      .from(donateRecords)
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .innerJoin(institutions, eq(donations.institutionId, institutions.id))
      .where(eq(donateRecords.id, recordId))
      .limit(1);

    return record ?? null;
  } catch (error) {
    console.error("Error fetching donation record:", error);
    return null;
  }
};

// Get donations uploaded by a specific institution
export const getInstitutionDonations = async (institutionId: string) => {
  try {
    if (!institutionId) return [];
    return await db
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
        institutionId: donations.institutionId,
      })
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

// Get donor location distribution with period filter (weekly, monthly, yearly)
export const getDonorLocationStatsWithPeriod = async (institutionId: string) => {
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
        city: donateRecords.city,
        requestDate: donateRecords.requestDate,
      })
      .from(donateRecords)
      .innerJoin(donations, eq(donateRecords.donationId, donations.id))
      .where(eq(donations.institutionId, institutionId));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Helper function to filter records by period
    const filterByPeriod = (period: "weekly" | "monthly" | "yearly") => {
      const filtered = records.filter((r) => {
        if (!r.requestDate) return false;
        const rDate = new Date(r.requestDate);

        switch (period) {
          case "weekly":
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return rDate >= weekAgo;
          case "monthly":
            return (
              rDate.getFullYear() === currentYear &&
              rDate.getMonth() === currentMonth
            );
          case "yearly":
            return rDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });

      // Group by city
      const cityMap = new Map<string, number>();
      filtered.forEach((r) => {
        const city = r.city || "Unknown";
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      });

      const total = filtered.length;
      return Array.from(cityMap.entries())
        .map(([city, count]) => ({
          city,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 cities
    };

    return {
      weekly: filterByPeriod("weekly"),
      monthly: filterByPeriod("monthly"),
      yearly: filterByPeriod("yearly"),
    };
  } catch (error) {
    console.error("Error in getDonorLocationStatsWithPeriod:", error);
    return {
      weekly: [],
      monthly: [],
      yearly: [],
    };
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