import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { donateRecords, donations, notifications } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ipLimit = await rateLimit("donationSubmit");
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }
    const userLimit = await rateLimit("donationSubmit", `user:${session.user.id}`);
    if (!userLimit.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
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
    if (!donationId || !donorName || !phoneNumber || !address || !donorPhoto || !deliveryMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate quantity format (must be a positive whole number)
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive whole number" },
        { status: 400 }
      );
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
        title: donations.title,
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

    // Check if quantity exceeds remaining items
    const remainingItems = donation.target - donation.collected;
    if (quantity > remainingItems) {
      return NextResponse.json(
        { error: `Quantity exceeds available items. Maximum available: ${remainingItems}` },
        { status: 400 }
      );
    }

    // Create donation request (collected count will update when approved)
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

    // Notify the institution about the new request
    await db.insert(notifications).values({
      recipientId: donation.institutionId,
      recipientType: "INSTITUTION",
      title: "New Donation Request",
      message: `A new donation request has been submitted for "${donation.title}".`,
      type: "NEW_REQUEST",
      relatedId: newRequest.id,
    });

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