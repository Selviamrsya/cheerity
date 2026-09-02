import React from "react";
import { notFound } from "next/navigation";
import { getInstitutionById } from "@/lib/actions/admin";
import InstitutionDetailClient from "@/components/admin/InstitutionDetailClient";

const AdminInstitutionDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const institution = await getInstitutionById(id);

  if (!institution) {
    notFound();
  }

  return <InstitutionDetailClient institution={institution} />;
};

export default AdminInstitutionDetailPage;
