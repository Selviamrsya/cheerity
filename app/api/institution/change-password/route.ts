import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { institutions } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request.headers);

    if (!session?.user?.id || session.user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit("passwordChange", session.user.id);
    if (!rl.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }

    // Fetch current password hash
    const [institution] = await db
      .select({ password: institutions.password })
      .from(institutions)
      .where(eq(institutions.id, session.user.id))
      .limit(1);

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // Verify current password using better-auth
    const isCurrentPasswordValid = await verifyPassword({
        password: currentPassword,
        hash: institution.password,
    });

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password using better-auth
    const hashedNewPassword = await hashPassword(newPassword);

    await db
      .update(institutions)
      .set({ password: hashedNewPassword })
      .where(eq(institutions.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
