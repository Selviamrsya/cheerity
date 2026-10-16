"use server";

import { db } from "@/app/database/drizzle";
import { donatur } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocoding";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getUserAddress() {
  const session = await getSession(await headers());
  if (!session?.user?.id) return null;

  const [result] = await db
    .select({
      address: donatur.address,
      city: donatur.city,
      state: donatur.state,
    })
    .from(donatur)
    .where(eq(donatur.userId, session.user.id))
    .limit(1);

  return result || null;
}

export async function updateUserAddress(params: {
  address: string;
  city: string;
  state: string;
}) {
  const session = await getSession(await headers());
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const { address, city, state } = params;

  try {
    const coords = await geocodeAddress(address || "", city, state);

    await db
      .update(donatur)
      .set({
        address: address || null,
        city,
        state,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        updatedAt: new Date(),
      })
      .where(eq(donatur.userId, session.user.id));

    revalidatePath("/");
    revalidatePath("/my-profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}
