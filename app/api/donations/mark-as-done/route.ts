import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { donations } from "@/app/database/schema";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

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

    const { donationId } = await request.json();

    if (!donationId) {
      return NextResponse.json({ error: "Donation ID is required" }, { status: 400 });
    }

    const [existingDonation] = await db
      .select({ institutionId: donations.institutionId, status: donations.status })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!existingDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (existingDonation.institutionId !== session.user.id) {
      return NextResponse.json({ error: "You can only update your own donations" }, { status: 403 });
    }

    if (existingDonation.status === "COMPLETED") {
      return NextResponse.json({ error: "Donation is already completed" }, { status: 400 });
    }

    // Update donation status to COMPLETED
    await db
      .update(donations)
      .set({ status: "COMPLETED" })
      .where(eq(donations.id, donationId));

    revalidatePath("/institution/donations");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark as done error:", error);
    return NextResponse.json({ error: "Failed to mark donation as done" }, { status: 500 });
  }
}
