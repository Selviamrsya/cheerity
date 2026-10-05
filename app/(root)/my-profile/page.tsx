import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import ProfileEditForm from "@/components/ProfileEditForm";
import { headers } from "next/headers";

const ProfilePage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

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
    <div className="mx-auto w-full max-w-330 px-8 py-4 md:px-16">
      {/* Back button */}
      <div className="mb-2" style={{marginTop:"24px"}}>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      <div className="bg-white p-2 md:p-4">
        <div
          className="flex items-center justify-between pb-6 border-b border-gray-100"
          style={{ paddingBottom: "12px" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-2xl">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName || "User"}</h1>
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