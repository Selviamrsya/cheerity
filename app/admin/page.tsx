import React from "react";
import Link from "next/link";
import { auth } from "@/app/auth";
import {
  getAdminDashboardStats,
  getInstitutions,
  getDonationActivityStats,
} from "@/lib/actions/admin";
import DonationsActivityChart from "@/components/admin/DonationsActivityChart";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

const AdminDashboardPage = async () => {
  const session = await auth();

  const [stats, institutionsList, activityStats] = await Promise.all([
    getAdminDashboardStats(),
    getInstitutions(),
    getDonationActivityStats(),
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

      {/* Donations Activity Chart (Weekly | Monthly | Yearly) */}
      <DonationsActivityChart data={activityStats} />

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
          <div className="py-16 text-center text-gray-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
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
