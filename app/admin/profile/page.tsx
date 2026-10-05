import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import AdminProfileForm from "@/components/admin/AdminProfileForm";
import { headers } from "next/headers";

const AdminProfilePage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

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
    <div className="w-full space-y-6">
      {/* Back button */}
      <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-800 transition-colors">
        ← Back to Dashboard
      </div>

      {/* Main Details Card */}
      <div className="flex w-full flex-col gap-6 px-0 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-0">
        <AdminProfileForm user={user} />
      </div>
    </div>
  );
};

export default AdminProfilePage;
