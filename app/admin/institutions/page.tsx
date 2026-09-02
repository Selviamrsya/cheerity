import React from "react";
import Link from "next/link";
import { getInstitutions } from "@/lib/actions/admin";
import { Building2, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";

interface AdminInstitutionsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const AdminInstitutionsPage: React.FC<AdminInstitutionsPageProps> = async ({
  searchParams,
}) => {
  const { status } = await searchParams;

  const validStatus =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? status
      : undefined;

  const institutionsList = await getInstitutions(validStatus);

  const tabs = [
    { key: "ALL", label: "All Institutions", href: "/admin/institutions" },
    { key: "PENDING", label: "Pending", href: "/admin/institutions?status=PENDING" },
    { key: "APPROVED", label: "Approved", href: "/admin/institutions?status=APPROVED" },
    { key: "REJECTED", label: "Rejected", href: "/admin/institutions?status=REJECTED" },
  ];

  const currentTab = status || "ALL";

  const getBadge = (instStatus: string) => {
    switch (instStatus) {
      case "PENDING":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>;
      case "APPROVED":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "REJECTED":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verify Institutions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review registration requests and verification evidence submitted by institutions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              currentTab === t.key
                ? "text-green-800 border-green-800"
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* List */}
      {institutionsList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No institutions found for this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institutionsList.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-green-200 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg text-gray-900">{inst.institutionName}</h3>
                  {getBadge(inst.status ?? "PENDING")}
                </div>

                <p className="text-sm text-gray-600 font-medium">{inst.email}</p>
                <p className="text-xs text-gray-500">
                  Location: {[inst.city, inst.state].filter(Boolean).join(", ") || "-"}
                </p>
                {inst.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 pt-1">{inst.description}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  Applied: {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : "-"}
                </span>

                <Link
                  href={`/admin/institutions/${inst.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 hover:text-green-900"
                >
                  <span>View Details & Verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInstitutionsPage;
