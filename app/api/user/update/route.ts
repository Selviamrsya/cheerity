import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { geocodeAddress } from "@/lib/geocoding";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phoneNumber, birthdate, address, city, state, zipCode } = body;

    // Validate required fields
    if (!fullName || fullName.trim() === "") {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    // Prepare update data
    const updateData: {
      fullName: string;
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
      phoneNumber: phoneNumber || null,
      birthdate: birthdate || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      latitude: null,
      longitude: null,
    };

    // If address is provided, geocode it to get coordinates
    if (address && city && state) {
      try {
        const coordinates = await geocodeAddress(address, city, state);
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