import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-2xl">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-sm text-gray-500 capitalize">{user.role?.toLowerCase()} Profile</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-green-700" />
            <span>{user.email}</span>
          </div>

          {user.phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-700" />
              <span>{user.phoneNumber}</span>
            </div>
          )}

          {user.birthdate && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-700" />
              <span>Date of Birth: {user.birthdate}</span>
            </div>
          )}

          {user.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
              <div>
                <p>{user.address}</p>
                <p className="text-xs text-gray-400">
                  {[user.city, user.state, user.zipCode].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;