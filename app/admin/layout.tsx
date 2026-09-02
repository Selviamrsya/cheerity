import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import AdminSidebar from "@/components/admin/Navbar";
import AdminHeader from "@/components/admin/Header";
// import "@/styles/admin.css";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar session={session} />
      <div className="flex-1 ml-56">
        <div className="p-8">
          <AdminHeader session={session} />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;