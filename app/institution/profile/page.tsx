import React from "react";
import Link from "next/link"; // Ditambahkan untuk tombol Back
import { ArrowLeft } from "lucide-react"; // Ditambahkan untuk icon tombol Back
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { institutions } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import InstitutionProfileForm from "@/components/institution/InstitutionProfileForm";
import { headers } from "next/headers";

const InstitutionProfilePage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

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
    <div className="mx-auto w-full max-w-330 px-8 py-4 md:px-32">
      
      {/* ================= TOMBOL BACK ================= */}
      <div className="mb-2">
        <Link 
          href="/institution" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>
      {/* =============================================== */}

      <div className="bg-white p-4 md:p-6 space-y-6">
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

        {/* Pemanggilan komponen form profil */}
        <InstitutionProfileForm institution={institution} />
      </div>
    </div>
  );
};

export default InstitutionProfilePage;