import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/app/database/drizzle";
import { donations } from "@/app/database/schema";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { donationId } = await request.json();

    if (!donationId) {
      return NextResponse.json({ error: "Donation ID is required" }, { status: 400 });
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