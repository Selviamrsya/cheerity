import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { donateRecords, donations } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      donationId,
      donorName,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      quantity,
      notes,
      donorPhoto,
      deliveryMethod,
      estimatedPickupDate,
      estimatedPickupTime,
    } = body;

    // Validate required fields
    if (!donationId || !donorName || !phoneNumber || !address || !quantity || !donorPhoto || !deliveryMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if donation exists and is active
    const [donation] = await db
      .select({
        id: donations.id,
        target: donations.target,
        collected: donations.collected,
        status: donations.status,
        deliveryMethods: donations.deliveryMethods,
        institutionId: donations.institutionId,
      })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (donation.status !== "ACTIVE") {
      return NextResponse.json({ error: "Donation is not active" }, { status: 400 });
    }

    // Check if donation is already completed
    if (donation.collected >= donation.target) {
      return NextResponse.json({ error: "Donation target has already been reached" }, { status: 400 });
    }

    // Validate delivery method
    if (!donation.deliveryMethods.includes(deliveryMethod)) {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }

    // Check if quantity is valid
    if (quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Check if quantity exceeds remaining items
    const remainingItems = donation.target - donation.collected;
    if (quantity > remainingItems) {
      return NextResponse.json(
        { error: `Quantity exceeds available items. Maximum available: ${remainingItems}` },
        { status: 400 }
      );
    }

    // Create donation request
    const [newRequest] = await db
      .insert(donateRecords)
      .values({
        userId: session.user.id,
        donationId,
        donorName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        quantity,
        notes,
        donorPhoto,
        deliveryMethod,
        estimatedPickupDate: estimatedPickupDate || null,
        estimatedPickupTime: estimatedPickupTime || null,
        status: "PENDING",
      })
      .returning();

    // Update donation collected count
    await db
      .update(donations)
      .set({
        collected: donation.collected + quantity,
      })
      .where(eq(donations.id, donationId));

    revalidatePath("/donations/[id]");
    revalidatePath("/history");
    revalidatePath("/donate");

    return NextResponse.json({ success: true, requestId: newRequest.id });
  } catch (error) {
    console.error("Donation request error:", error);
    return NextResponse.json(
      { error: "Failed to submit donation request" },
      { status: 500 }
    );
  }
}