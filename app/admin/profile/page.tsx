import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import AdminProfileForm from "@/components/admin/AdminProfileForm";

const AdminProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full">
      <div className="bg-white p-8 space-y-6 shadow-xs border border-gray-100 rounded-sm">
        <div
          className="flex items-center justify-between pb-6 border-b border-gray-100"
          style={{ paddingBottom: "12px" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-2xl">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.fullName}
              </h1>
              <p className="text-sm text-gray-500 capitalize">
                Administrator Profile
              </p>
            </div>
          </div>
        </div>

        <AdminProfileForm user={user} />
      </div>
    </div>
  );
};

export default AdminProfilePage;
