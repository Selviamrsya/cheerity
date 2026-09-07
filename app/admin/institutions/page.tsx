import React, { Suspense } from "react";
import Link from "next/link";
import { getInstitutions } from "@/lib/actions/admin";
import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import InstitutionSearchBar from "@/components/admin/InstitutionSearchBar";

interface AdminInstitutionsPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

const AdminInstitutionsPage: React.FC<AdminInstitutionsPageProps> = async ({
  searchParams,
}) => {
  const { status, q } = await searchParams;

  const validStatus =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? status
      : undefined;

  const institutionsList = await getInstitutions(validStatus, q || undefined);

  const tabs = [
    { key: "ALL", label: "All", href: q ? `/admin/institutions?q=${q}` : "/admin/institutions" },
    { key: "PENDING", label: "Pending", href: q ? `/admin/institutions?status=PENDING&q=${q}` : "/admin/institutions?status=PENDING" },
    { key: "APPROVED", label: "Approved", href: q ? `/admin/institutions?status=APPROVED&q=${q}` : "/admin/institutions?status=APPROVED" },
    { key: "REJECTED", label: "Rejected", href: q ? `/admin/institutions?status=REJECTED&q=${q}` : "/admin/institutions?status=REJECTED" },
  ];

  const currentTab = status || "ALL";

  const getBadge = (instStatus: string | null) => {
    switch (instStatus) {
      case "PENDING":
        return (
          <span className="admin-badge admin-badge-pending">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="admin-badge admin-badge-approved">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="admin-badge admin-badge-rejected">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-verify-page">
      {/* Header with search beside title */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Verify Institution</h1>
          <p className="admin-subtitle">
            Review registration requests, verification evidence, and eligibility of social institutions.
          </p>
        </div>
        <Suspense fallback={<div className="admin-search-wrapper" />}>
          <InstitutionSearchBar />
        </Suspense>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`admin-tab ${currentTab === t.key ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {institutionsList.length === 0 ? (
        // <div className="py-20 text-center text-gray-400 space-y-2">
        <div className="w-full flex items-center justify-center min-h-75 text-center">
          <p className="text-xs text-gray-400">There is no data for this status category yet.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table-th w-12 text-center">No</th>
                <th className="admin-table-th">Name</th>
                <th className="admin-table-th">Request Date</th>
                <th className="admin-table-th">Location</th>
                <th className="admin-table-th">Status</th>
                <th className="admin-table-th text-center w-24">See More</th>
              </tr>
            </thead>
            <tbody>
              {institutionsList.map((inst, idx) => (
                <tr key={inst.id} className="admin-table-tr">
                  <td className="admin-table-td text-center text-xs text-gray-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="admin-table-td font-bold">
                    {inst.institutionName}
                  </td>
                  <td className="admin-table-td text-xs text-gray-600 font-medium">
                    {inst.createdAt
                      ? new Date(inst.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="admin-table-td text-xs text-gray-600">
                    {[inst.city, inst.state].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="admin-table-td">
                    {getBadge(inst.status)}
                  </td>
                  <td className="admin-table-td text-center">
                    <Link
                      href={`/admin/institutions/${inst.id}`}
                      className="admin-table-icon-btn"
                      title="See More"
                      aria-label="See More"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInstitutionsPage;
