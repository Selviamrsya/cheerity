import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import InstitutionNavbar from "@/components/institution/Navbar";

const InstitutionLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "INSTITUTION") {
    redirect("/");
  }

  return (
    <div className="institution-layout">
      <InstitutionNavbar session={session} />
      <main className="institution-page-container">
        {children}
      </main>
    </div>
  );
};

export default InstitutionLayout;
