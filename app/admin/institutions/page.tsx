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
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-warning-border bg-warning-bg text-warning">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-success-border bg-success-bg text-success">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-danger-border bg-danger-bg text-danger">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header with search beside title */}
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-poppins text-[22px] font-medium tracking-tight text-text-main md:text-[26px]">Verify Institution</h1>
          <p className="font-inter text-[13.5px] leading-relaxed text-text-muted">
            Review registration requests, verification evidence, and eligibility of social institutions.
          </p>
        </div>
        <Suspense fallback={<div className="relative flex min-w-[250px] max-w-[420px] items-center" />}>
          <InstitutionSearchBar />
        </Suspense>
      </div>

      {/* Tabs */}
      <div className="mb-6 mt-4 flex flex-1 justify-start gap-4 overflow-x-auto border-b border-outline sm:gap-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`shrink-0 border-b-2 border-transparent pb-3 font-inter text-sm font-semibold text-text-muted no-underline whitespace-nowrap transition-colors hover:text-primary-800 data-[active=true]:border-primary-800 data-[active=true]:text-primary-800 ${currentTab === t.key ? "active" : ""}`}
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 w-12 text-center">No</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4">Name</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4">Request Date</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4">Location</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4">Status</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 text-center w-24">See More</th>
              </tr>
            </thead>
            <tbody>
              {institutionsList.map((inst, idx) => (
                <tr key={inst.id} className="transition-colors hover:bg-bg-light">
                  <td className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-center text-xs text-gray-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold">
                    {inst.institutionName}
                  </td>
                  <td className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs text-gray-600 font-medium">
                    {inst.createdAt
                      ? new Date(inst.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs text-gray-600">
                    {[inst.city, inst.state].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                    {getBadge(inst.status)}
                  </td>
                  <td className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-center">
                    <Link
                      href={`/admin/institutions/${inst.id}`}
                      className="inline-flex items-center justify-center bg-transparent p-1.5 text-text-muted shadow-none transition-colors hover:bg-transparent hover:text-primary-800"
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
