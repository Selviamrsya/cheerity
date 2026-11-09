import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import InstitutionNavbar from "@/components/institution/Navbar";
import { db } from "@/app/database/drizzle";
import { institutions } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { Lock, Mail, AlertCircle } from "lucide-react";

import { headers } from "next/headers";

const InstitutionLayout = async ({ children }: { children: React.ReactNode }) => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "INSTITUTION") {
    redirect("/");
  }

  // Get institution status from database
  const [institution] = await db
    .select({ status: institutions.status })
    .from(institutions)
    .where(eq(institutions.id, session.user.id))
    .limit(1);

  const institutionStatus = institution?.status || "PENDING";

  // Debug logging
  console.log("=== Institution Layout Debug ===");
  console.log("Session User ID:", session.user.id);
  console.log("Session User Email:", session.user.email);
  console.log("Session User Role:", session.user.role);
  console.log("Institution Status from DB:", institutionStatus);
  console.log("Raw institution record:", institution);
  console.log("================================");

  // Show blocking page if account is inactive
  if (institutionStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Inactive
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Your institution account has been deactivated and is currently inaccessible.
            Please contact our administrator to reactivate your account.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Contact Administrator
                </p>
                <a
                  href="mailto:admin@cheerity.com"
                  className="text-blue-700 hover:text-blue-800 font-medium underline"
                >
                  admin@cheerity.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-left">
              If you believe this is an error, please reach out to our support team with your institution details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show pending page if account is still pending approval
  if (institutionStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-10" style={{ padding: "24px 18px" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Account Pending Approval
            </h1>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed" style={{ margin: "8px 0px" }}>
            Your institution account is currently under review by our administrator.
            You will be notified once your account has been approved.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 mb-6" style={{ padding: "8px 12px" }}>
            <div className="flex items-center gap-1">
              <Mail className="w-5 h-5 text-black-500 shrink-0" />
              <div className="text-left flex items-center gap-1 flex-wrap"> 
                Need Help? Contact us at
                <a
                  href="mailto:admin@cheerity.com"
                  className="text-blue-700 hover:text-blue-800 font-medium underline text-sm"
                >
                  admin@cheerity.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500" style={{ marginTop: "8px" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-left">
              Approval typically takes 1-2 business days. Thank you for your patience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <InstitutionNavbar session={session} />
      <main className="mx-auto w-full max-w-330 px-4 pb-16 pt-24 sm:px-8 md:px-16">
        {children}
      </main>
    </div>
  );
};

export default InstitutionLayout;
