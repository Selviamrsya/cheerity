"use server";

import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/auth";
import { geocodeAddress } from "@/lib/geocoding";
import { revalidatePath } from "next/cache";

export async function getUserAddress() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({
      address: users.address,
      city: users.city,
      state: users.state,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user || null;
}

export async function updateUserAddress(params: {
  address: string;
  city: string;
  state: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const { address, city, state } = params;

  try {
    const coords = await geocodeAddress(address, city, state);

    await db
      .update(users)
      .set({
        address,
        city,
        state,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/");
    revalidatePath("/my-profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}
