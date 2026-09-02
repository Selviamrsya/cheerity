import React from "react";
import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/actions/admin";
import { Users, Building2, ShieldAlert, Package, ArrowRight } from "lucide-react";

const AdminDashboardPage = async () => {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          System-wide performance indicators, visitor counts, and registration metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Registered Donors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-gray-500">Registered Donors</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</h2>
        </div>

        {/* Registered Institutions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-gray-500">Active Institutions</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{stats.totalInstitutions}</h2>
        </div>

        {/* Pending Verifications */}
        <div
          className={`rounded-2xl border p-6 shadow-sm space-y-3 ${
            stats.pendingInstitutions > 0
              ? "bg-amber-50 border-amber-200"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-amber-900">Pending Approvals</p>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-amber-900">
            {stats.pendingInstitutions}
          </h2>
        </div>

        {/* Total Campaigns */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-gray-500">Donation Campaigns</p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{stats.totalDonations}</h2>
        </div>
      </div>

      {/* Quick Action banner if pending institutions exist */}
      {stats.pendingInstitutions > 0 && (
        <div className="bg-gradient-to-r from-green-800 to-green-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
          <div>
            <h3 className="text-xl font-bold">
              {stats.pendingInstitutions} Institution Application(s) Awaiting Review
            </h3>
            <p className="text-xs text-green-100 mt-1">
              Review submission details and verification evidence to approve or reject accounts.
            </p>
          </div>
          <Link
            href="/admin/institutions?status=PENDING"
            className="px-5 py-2.5 bg-white text-green-900 font-bold text-sm rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <span>Review Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
