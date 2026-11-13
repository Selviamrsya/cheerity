import React, { Suspense } from "react";
import Link from "next/link";
import { getInstitutions } from "@/lib/actions/admin";
import { Eye } from "lucide-react";
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

  // Badge tanpa border dan tanpa ikon
  const getBadge = (instStatus: string | null) => {
    switch (instStatus) {
      case "PENDING":
        return (
          <span className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-warning-bg text-warning">
            Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-success-bg text-success">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-danger-bg text-danger">
            Rejected
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
        <Suspense fallback={<div className="relative flex min-w-62.5 max-w-105 items-center" />}>
          <InstitutionSearchBar />
        </Suspense>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-1 justify-start gap-4 overflow-x-auto border-b border-outline sm:gap-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            data-active={currentTab === t.key}
            className={`shrink-0 border-b-2 border-transparent pb-3 font-inter text-sm font-semibold text-text-muted no-underline whitespace-nowrap transition-colors hover:text-primary-800 data-[active=true]:border-primary-800 data-[active=true]:text-primary-800 ${currentTab === t.key ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {institutionsList.length === 0 ? (
        <div className="w-full flex items-center justify-center min-h-75 text-center">
          <p className="text-xs text-gray-400">There is no data for this status category yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="responsive-table w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 w-8 text-center md:w-12">No</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4">Name</th>
                <th className="hidden border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 md:table-cell">Request Date</th>
                <th className="hidden border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 md:table-cell">Location</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 w-20 md:w-auto">Status</th>
                <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4 text-center w-10 md:w-24">See More</th>
              </tr>
            </thead>
            <tbody>
              {institutionsList.map((inst, idx) => (
                <tr key={inst.id} className="transition-colors hover:bg-bg-light">
                  <td data-label="No" className="border-b border-card-border px-3 py-3.5 font-inter text-[11px] sm:px-4 text-center text-xs text-gray-500 font-medium">
                    {idx + 1}
                  </td>
                  <td data-label="Name" className="border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 font-bold">
                    {inst.institutionName}
                  </td>
                  <td data-label="Request Date" className="hidden border-b border-card-border px-3 py-3.5 font-inter text-[11px] sm:px-4 text-xs text-gray-600 font-medium md:table-cell">
                    {inst.createdAt
                      ? new Date(inst.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td data-label="Location" className="hidden border-b border-card-border px-3 py-3.5 font-inter text-[11px]  sm:px-4 text-xs text-gray-600 md:table-cell">
                    {[inst.city, inst.state].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td data-label="Status" className="border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4">
                    {getBadge(inst.status)}
                  </td>
                  <td data-label="See More" className="border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 text-center">
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