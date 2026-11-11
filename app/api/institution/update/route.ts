import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { institutions, users } from "@/app/database/schema";
import { eq, and, ne } from "drizzle-orm";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit("profileUpdate", session.user.id);
    if (!rl.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }

    const body = await request.json();
    const { institutionName, email, phoneNumber, websiteOrSocial, description, address, city, state, zipCode } = body;

    // Validate required fields
    if (!institutionName || institutionName.trim() === "") {
      return NextResponse.json(
        { error: "Institution name is required" },
        { status: 400 }
      );
    }

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email is used by another account (users.email is globally
    // unique across all roles, including institutions)
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.email, trimmedEmail),
          ne(users.id, session.user.id)
        )
      )
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use by another account" },
        { status: 400 }
      );
    }

    // Update base user record (email + display name live here)
    await db
      .update(users)
      .set({
        email: trimmedEmail,
        name: institutionName.trim(),
        fullName: institutionName.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Update institution profile (address can be updated, but verificationEvidence cannot)
    const updateData: Record<string, string | null> = {
      institutionName: institutionName.trim(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : null,
      websiteOrSocial: websiteOrSocial ? websiteOrSocial.trim() : null,
      description: description ? description.trim() : null,
    };

    // Include address fields if provided
    if (address !== undefined) {
      updateData.address = address.trim() || null;
    }
    if (city !== undefined) {
      updateData.city = city.trim() || null;
    }
    if (state !== undefined) {
      updateData.state = state.trim() || null;
    }
    if (zipCode !== undefined) {
      updateData.zipCode = zipCode.trim() || null;
    }

    await db
      .update(institutions)
      .set(updateData)
      .where(eq(institutions.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Institution profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
