import React from "react";
import Link from "next/link";
import { auth } from "@/app/auth";
import {
  getAdminDashboardStats,
  getInstitutions,
  getDonationActivityStats,
  getDonationCategoriesStats,
} from "@/lib/actions/admin";
import DonationsActivityChart from "@/components/admin/DonationsActivityChart";
import PieChart from "@/components/admin/PieChart";
import { CATEGORY_LABELS } from "@/constants";
import {
  ArrowRight,
  Clock,
  XCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";

const AdminDashboardPage = async () => {
  const session = await auth();

  const [stats, institutionsList, activityStats, categoryStats] = await Promise.all([
    getAdminDashboardStats(),
    getInstitutions(),
    getDonationActivityStats(),
    getDonationCategoriesStats(),
  ]);

  // Prioritize pending institutions
  const pendingInstitutions = institutionsList.filter((inst) => inst.status === "PENDING");
  const displayInstitutions = pendingInstitutions.length > 0 ? pendingInstitutions : institutionsList.slice(0, 5);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
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
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">
            Welcome, {session?.user?.name || "Admin"}!
          </h1>
          <p className="admin-subtitle">
            Welcome back to the Cheerity Dashboard Admin.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="admin-stats-grid">
        {/* 1. Total User */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            Total User
          </div>
          <div className="admin-stat-value">
            {stats.totalUsers}
          </div>
        </div>

        {/* 2. Verified Institution */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            Verified Institution
          </div>
          <div className="admin-stat-value">
            {stats.totalInstitutions}
          </div>
        </div>

        {/* 3. On Review Institution */}
        <div className={`admin-stat-card ${stats.pendingInstitutions > 0 ? "admin-stat-card-warning" : ""}`}>
          <div className="admin-stat-header">
              On Review Institution
          </div>
          <div className={`admin-stat-value ${stats.pendingInstitutions > 0 ? "admin-stat-value-warning" : ""}`}>
              {stats.pendingInstitutions}
          </div>
        </div>

        {/* 4. Total Donations */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            Total Donations
          </div>
          <div className="admin-stat-value">{stats.totalDonations}</div>
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
              data={categoryStats.map((cat) => ({
                label: CATEGORY_LABELS[cat.category] || cat.category,
                value: cat.count,
                percentage: cat.percentage,
              }))}
              title="Donation Categories"
              subtitle="By category percentage"
            />
          ) : (
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h2 className="chart-title">Donation Categories</h2>
                  <p className="chart-subtitle">By category percentage</p>
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
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="admin-table-title">
                Institution Verification Requests
              </h2>
              {stats.pendingInstitutions > 0 && (
                <span className="admin-badge admin-badge-pending">
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
                {displayInstitutions.map((inst, idx) => (
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
                      {getStatusBadge(inst.status)}
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
    </div>
  );
};

export default AdminDashboardPage;
