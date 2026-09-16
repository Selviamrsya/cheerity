import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { institutions } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import InstitutionProfileForm from "@/components/institution/InstitutionProfileForm";

const InstitutionProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "INSTITUTION") {
    redirect("/sign-in");
  }

  const [institution] = await db
    .select({
      id: institutions.id,
      institutionName: institutions.institutionName,
      email: institutions.email,
      phoneNumber: institutions.phoneNumber,
      city: institutions.city,
      state: institutions.state,
      zipCode: institutions.zipCode,
      address: institutions.address,
      verificationEvidence: institutions.verificationEvidence,
      websiteOrSocial: institutions.websiteOrSocial,
      description: institutions.description,
      status: institutions.status,
    })
    .from(institutions)
    .where(eq(institutions.id, session.user.id))
    .limit(1);

  if (!institution) {
    redirect("/sign-in");
  }

  return (
    <div className="institution-page-container">
      <div className="bg-white p-8 space-y-6 shadow-xs border border-gray-100 rounded-sm">
        <div
          className="flex items-center justify-between pb-6 border-b border-gray-100"
          style={{ paddingBottom: "12px" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-2xl">
              {institution.institutionName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {institution.institutionName}
              </h1>
              <p className="text-sm text-gray-500 capitalize">
                Institution Profile
              </p>
            </div>
          </div>
        </div>

        <InstitutionProfileForm institution={institution} />
      </div>
    </div>
  );
};

export default InstitutionProfilePage;
