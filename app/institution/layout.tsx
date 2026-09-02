import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import InstitutionSidebar from "@/components/institution/layout";

const InstitutionLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "INSTITUTION") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <InstitutionSidebar session={session} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
};

export default InstitutionLayout;
