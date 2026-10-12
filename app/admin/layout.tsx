import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNavbar from "@/components/admin/Navbar";

import { headers } from "next/headers";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar session={session} />
      <main className="mx-auto w-full max-w-330 px-8 pb-16 pt-28 md:px-24 md:pb-20">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;