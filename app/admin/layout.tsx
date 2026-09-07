import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import AdminNavbar from "@/components/admin/Navbar";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="admin-layout">
      <AdminNavbar session={session} />
      <main className="admin-page-container">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;