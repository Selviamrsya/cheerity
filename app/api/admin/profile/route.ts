import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
import { eq, and, ne } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email } = body;

    // Validate required fields
    if (!fullName || fullName.trim() === "") {
      return NextResponse.json(
        { error: "Username is required" },
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

    // Check if email is used by another user
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
        { error: "Email is already in use by another user" },
        { status: 400 }
      );
    }

    // Check if email is used by an institution
    const [existingInst] = await db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.email, trimmedEmail))
      .limit(1);

    if (existingInst) {
      return NextResponse.json(
        { error: "Email is already in use by an institution account" },
        { status: 400 }
      );
    }

    // Update admin user profile (only fullName and email)
    await db
      .update(users)
      .set({
        fullName: fullName.trim(),
        email: trimmedEmail,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
