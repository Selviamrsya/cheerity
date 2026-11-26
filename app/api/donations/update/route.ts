import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { donations } from "@/app/database/schema";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

const VALID_DELIVERY_METHODS = [
  "self_delivery",
  "third_party_courier",
  "pickup_by_institution",
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit("donationMutation");
    if (!rl.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }

    const { donationId, target, description, deliveryMethods, pickupMaxDistanceKm } = await request.json();

    if (!donationId) {
      return NextResponse.json({ error: "Donation ID is required" }, { status: 400 });
    }

    // Check if donation exists
    const [existingDonation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!existingDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Only the owning institution can edit the donation
    if (existingDonation.institutionId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own donations" }, { status: 403 });
    }

    if (existingDonation.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot edit completed donation" }, { status: 400 });
    }

    // Validate target if provided
    if (target !== undefined) {
      if (typeof target !== "number" || !Number.isInteger(target) || target <= 0) {
        return NextResponse.json({ error: "Target must be a positive whole number" }, { status: 400 });
      }
      if (target < (existingDonation.collected ?? 0)) {
        return NextResponse.json(
          { error: `Target cannot be less than already collected items (${existingDonation.collected})` },
          { status: 400 }
        );
      }
    }

    // Validate delivery methods if provided
    let newDeliveryMethods = existingDonation.deliveryMethods;
    if (deliveryMethods !== undefined) {
      if (
        !Array.isArray(deliveryMethods) ||
        deliveryMethods.length === 0 ||
        !deliveryMethods.every((m) => VALID_DELIVERY_METHODS.includes(m))
      ) {
        return NextResponse.json({ error: "Invalid delivery methods" }, { status: 400 });
      }
      newDeliveryMethods = deliveryMethods;
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }

    // Pickup settings are derived from the final delivery methods
    const pickupEnabled = newDeliveryMethods.includes("pickup_by_institution");
    let newPickupMaxDistanceKm: number | null = null;
    if (pickupEnabled) {
      const distance =
        pickupMaxDistanceKm !== undefined
          ? pickupMaxDistanceKm
          : existingDonation.pickupMaxDistanceKm;
      if (
        typeof distance !== "number" ||
        !Number.isInteger(distance) ||
        distance <= 0 ||
        distance > 100
      ) {
        return NextResponse.json(
          { error: "A valid pickup distance (1-100 km) is required when pickup service is enabled" },
          { status: 400 }
        );
      }
      newPickupMaxDistanceKm = distance;
    }

    // Update donation with new values
    await db
      .update(donations)
      .set({
        target: target !== undefined ? target : existingDonation.target,
        description: description !== undefined ? description : existingDonation.description,
        deliveryMethods: newDeliveryMethods,
        hasPickupService: pickupEnabled,
        pickupMaxDistanceKm: newPickupMaxDistanceKm,
        updatedAt: new Date(),
      })
      .where(eq(donations.id, donationId));

    revalidatePath("/institution/donations");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update donation error:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
