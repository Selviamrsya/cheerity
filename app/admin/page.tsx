import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getAdminDashboardStats,
  getInstitutions,
  getDonationActivityStats,
  getDonationCategoriesStats,
  getDonationCategoriesStatsWithPeriod,
} from "@/lib/actions/admin";
import DonationsActivityChart from "@/components/admin/DonationsActivityChart";
import PieChart from "@/components/admin/PieChart";
import { CATEGORY_LABELS } from "@/constants";
import {
  ArrowRight,
  Eye,
} from "lucide-react";
import { headers } from "next/headers";

const AdminDashboardPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  const [stats, institutionsList, activityStats, categoryStats, categoryStatsWithPeriod] = await Promise.all([
    getAdminDashboardStats(),
    getInstitutions(),
    getDonationActivityStats(),
    getDonationCategoriesStats(),
    getDonationCategoriesStatsWithPeriod(),
  ]);

  // Prioritize pending institutions
  const pendingInstitutions = institutionsList.filter((inst) => inst.status === "PENDING");
  const displayInstitutions = pendingInstitutions.length > 0 ? pendingInstitutions : institutionsList.slice(0, 5);

  const getStatusBadge = (instStatus: string | null) => {
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
    <div className="space-y-2">
      {/* Admin Header */}
      <div className="flex flex-col gap-2 border-b border-outline pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-poppins text-[22px] font-medium tracking-tight text-text-main md:text-[26px]">
            Welcome, {session?.user?.name || "Admin"}!
          </h1>
          <p className="font-inter text-[13.5px] leading-relaxed text-text-muted">
            Welcome back to the Cheerity Dashboard Admin.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="my-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {/* 1. Total User */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            Total User
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">
            {stats.totalUsers}
          </div>
        </div>

        {/* 2. Verified Institution */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            Verified Institution
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">
            {stats.totalInstitutions}
          </div>
        </div>

        {/* 3. On Review Institution */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            On Review Institution
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">
            {stats.pendingInstitutions}
          </div>
        </div>

        {/* 4. Total Donations */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            Total Donations
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">{stats.totalDonations}</div>
        </div>
      </div>

      {/* Charts Grid: Line Chart + Pie Chart */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Donations Activity Chart (Weekly | Monthly | Yearly) */}
        <div className="flex-1 min-w-0">
          <DonationsActivityChart data={activityStats} />
        </div>

        {/* Donation Categories Pie Chart */}
        <div className="w-full lg:w-[40%]">
          {categoryStats.length > 0 ? (
            <PieChart
              compact
              withPeriodFilter
              data={categoryStats.map((cat) => ({
                label: CATEGORY_LABELS[cat.category] || cat.category,
                value: cat.count,
                percentage: cat.percentage,
              }))}
              periodData={{
                weekly: categoryStatsWithPeriod.weekly.map((cat) => ({
                  label: CATEGORY_LABELS[cat.category] || cat.category,
                  value: cat.count,
                  percentage: cat.percentage,
                })),
                monthly: categoryStatsWithPeriod.monthly.map((cat) => ({
                  label: CATEGORY_LABELS[cat.category] || cat.category,
                  value: cat.count,
                  percentage: cat.percentage,
                })),
                yearly: categoryStatsWithPeriod.yearly.map((cat) => ({
                  label: CATEGORY_LABELS[cat.category] || cat.category,
                  value: cat.count,
                  percentage: cat.percentage,
                })),
              }}
              title="Donation Categories"
              subtitle="By category percentage"
            />
          ) : (
            <div className="mb-4 flex min-h-[400px] w-full flex-col rounded-sm border border-card-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-2 border-b border-card-border pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-poppins text-lg font-medium text-text-main">Donation Categories</h2>
                  <p className="mt-1 font-inter text-xs text-text-muted">By category percentage</p>
                </div>
              </div>
              <div className="flex items-center justify-center h-80 text-gray-400">
                <p className="text-sm">No donation data yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Institution Verification Requests Table */}
      <div className="flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col border-b border-card-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="mt-2.5 mb-4 font-poppins text-lg font-medium text-text-main">
                Institution Verification Requests
              </h2>
              {stats.pendingInstitutions > 0 && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-warning-bg text-warning">
                  {stats.pendingInstitutions} pending
                </span>
              )}
            </div>
          </div>

          <Link
            href="/admin/institutions"
            className="text-xs font-bold --text-green-300 hover:text-green-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayInstitutions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center gap-2 w-full"
            style={{ minHeight: "150px" }}
          >
            <p className="font-semibold text-sm text-gray-700">
              All institutional applications have completed review.
            </p>
            <p className="text-xs text-gray-400">
              There are no institutions awaiting verification at this time.
            </p>
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
                {displayInstitutions.map((inst, idx) => (
                  <tr key={inst.id} className="transition-colors hover:bg-bg-light">
                    <td data-label="No" className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-center text-xs text-gray-500 font-medium">
                      {idx + 1}
                    </td>
                    <td data-label="Name" className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold">
                      {inst.institutionName}
                    </td>
                    <td data-label="Request Date" className="hidden border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs text-gray-600 font-medium md:table-cell">
                      {inst.createdAt
                        ? new Date(inst.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </td>
                    <td data-label="Location" className="hidden border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs text-gray-600 md:table-cell">
                      {[inst.city, inst.state].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td data-label="Status" className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {getStatusBadge(inst.status)}
                    </td>
                    <td data-label="See More" className="border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-center">
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
    </div>
  );
};

export default AdminDashboardPage;
