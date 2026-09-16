import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { institutions, users } from "@/app/database/schema";
import { eq, and, ne } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { institutionName, email, phoneNumber, websiteOrSocial, description } = body;

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

    // Check if email is used by another institution
    const [existingInst] = await db
      .select({ id: institutions.id })
      .from(institutions)
      .where(
        and(
          eq(institutions.email, trimmedEmail),
          ne(institutions.id, session.user.id)
        )
      )
      .limit(1);

    if (existingInst) {
      return NextResponse.json(
        { error: "Email is already in use by another institution" },
        { status: 400 }
      );
    }

    // Check if email is used by an existing user
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use by a user account" },
        { status: 400 }
      );
    }

    // Update institution profile (strictly NO address or verificationEvidence modification)
    await db
      .update(institutions)
      .set({
        institutionName: institutionName.trim(),
        email: trimmedEmail,
        phoneNumber: phoneNumber ? phoneNumber.trim() : null,
        websiteOrSocial: websiteOrSocial ? websiteOrSocial.trim() : null,
        description: description ? description.trim() : null,
      })
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
