import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users, donatur, institutions } from "@/app/database/schema";
import { eq, and, ne } from "drizzle-orm";
import { geocodeAddress } from "@/lib/geocoding";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit("profileUpdate", session.user.id);
    if (!rl.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }

    const body = await request.json();
    const { fullName, email, phoneNumber, birthdate, address, city, state, zipCode, latitude, longitude } = body;

    // Validate required fields
    if (!fullName || fullName.trim() === "") {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    if (!email || email.trim() === "") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email is taken by another user
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, trimmedEmail), ne(users.id, session.user.id)))
      .limit(1);

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use by another account" }, { status: 400 });
    }

    // Check if email is taken by an institution
    const [existingInst] = await db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.email, trimmedEmail))
      .limit(1);

    if (existingInst) {
      return NextResponse.json({ error: "Email is already in use by an institution account" }, { status: 400 });
    }

    // Resolve coordinates
    let resolvedLat: number | null = null;
    let resolvedLng: number | null = null;

    if (latitude != null && longitude != null) {
      resolvedLat = latitude;
      resolvedLng = longitude;
    } else if (city && state) {
      try {
        const coordinates = await geocodeAddress(address || "", city, state);
        if (coordinates) {
          resolvedLat = coordinates.lat;
          resolvedLng = coordinates.lng;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        // Continue without coordinates if geocoding fails
      }
    }

    // Update base user profile (shared fields)
    await db
      .update(users)
      .set({
        fullName: fullName.trim(),
        email: trimmedEmail,
        name: fullName.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Update donatur child record (USER-specific fields)
    await db
      .update(donatur)
      .set({
        phoneNumber: phoneNumber || null,
        birthdate: birthdate || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        latitude: resolvedLat,
        longitude: resolvedLng,
        updatedAt: new Date(),
      })
      .where(eq(donatur.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}