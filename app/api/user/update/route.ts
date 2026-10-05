import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
import { eq, and, ne } from "drizzle-orm";
import { geocodeAddress } from "@/lib/geocoding";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, phoneNumber, birthdate, address, city, state, zipCode, street, detailedAddress, latitude, longitude } = body;

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

    // Prepare update data
    const updateData: {
      fullName: string;
      email: string;
      phoneNumber: string | null;
      birthdate: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      zipCode: string | null;
      latitude: number | null;
      longitude: number | null;
    } = {
      fullName: fullName.trim(),
      email: trimmedEmail,
      phoneNumber: phoneNumber || null,
      birthdate: birthdate || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      latitude: null,
      longitude: null,
    };

    // If latitude and longitude are provided from address search, use them directly
    // Otherwise, if city and state are provided, geocode to get coordinates
    if (latitude != null && longitude != null) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    } else if (city && state) {
      try {
        const coordinates = await geocodeAddress(address || "", city, state);
        if (coordinates) {
          updateData.latitude = coordinates.lat;
          updateData.longitude = coordinates.lng;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        // Continue without coordinates if geocoding fails
      }
    }

    // Update user profile
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}