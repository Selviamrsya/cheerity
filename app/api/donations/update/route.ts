import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { donations } from "@/app/database/schema";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { donationId, target, description, deliveryMethods, hasPickupService, pickupMaxDistanceKm } = await request.json();

    if (!donationId) {
      return NextResponse.json({ error: "Donation ID is required" }, { status: 400 });
    }

    // Check if donation exists and is not completed
    const existingDonation = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (existingDonation.length === 0) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (existingDonation[0].status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot edit completed donation" }, { status: 400 });
    }

    // Update donation with new values
    await db
      .update(donations)
      .set({
        target: target !== undefined ? target : existingDonation[0].target,
        description: description !== undefined ? description : existingDonation[0].description,
        deliveryMethods: deliveryMethods !== undefined ? deliveryMethods : existingDonation[0].deliveryMethods,
        hasPickupService: hasPickupService !== undefined ? hasPickupService : existingDonation[0].hasPickupService,
        pickupMaxDistanceKm: pickupMaxDistanceKm !== undefined ? pickupMaxDistanceKm : existingDonation[0].pickupMaxDistanceKm,
      })
      .where(eq(donations.id, donationId));

    revalidatePath("/institution/donations");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update donation error:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
