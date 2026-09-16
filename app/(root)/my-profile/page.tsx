import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import ProfileEditForm from "@/components/ProfileEditForm";

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      birthdate: users.birthdate,
      address: users.address,
      city: users.city,
      state: users.state,
      zipCode: users.zipCode,
      latitude: users.latitude,
      longitude: users.longitude,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full py-8">
      <div className="bg-white p-8 space-y-6" style={{marginTop:"72px"}}>
        <div className="flex items-center justify-between pb-6 border-b border-gray-100" style={{paddingBottom:"12px"}}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-2xl">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-sm text-gray-500 capitalize">{user.role?.toLowerCase()} Profile</p>
            </div>
          </div>
        </div>

        <ProfileEditForm user={user} />
      </div>
    </div>
  );
};

export default ProfilePage;