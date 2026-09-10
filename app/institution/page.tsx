import React from "react";
import Link from "next/link";
import { auth } from "@/app/auth";
import {
  getInstitutionDonations,
  getInstitutionDonationHistory,
  getDonorLocationStats,
  getInstitutionDonationActivityStats,
} from "@/lib/actions/donation";
import { DELIVERY_METHOD_LABELS } from "@/constants";
import DonationsActivityChart from "@/components/admin/DonationsActivityChart";
import PieChart from "@/components/admin/PieChart";
import {
  Clock,
  Truck,
  XCircle,
  CheckCircle2,
  Eye,
  ArrowRight,
} from "lucide-react";

const InstitutionDashboardPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  const [uploadedDonations, donationHistory, locationStats, activityStats] = await Promise.all([
    getInstitutionDonations(institutionId),
    getInstitutionDonationHistory(institutionId),
    getDonorLocationStats(institutionId),
    getInstitutionDonationActivityStats(institutionId),
  ]);

  const totalUploaded = uploadedDonations.length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRequests = donationHistory.filter(
    (h) => h.requestDate && new Date(h.requestDate).toISOString().split("T")[0] === todayStr
  ).length;

  const totalDonationsCount = donationHistory.length;

  // Sum of all arrived or completed items
  const totalCollected = donationHistory
    .filter((h) => h.status === "ARRIVED" || h.status === "COMPLETED")
    .reduce((sum, h) => sum + (h.quantity || 0), 0);

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const latestFiveRequests = donationHistory.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="institution-badge institution-badge-pending">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="institution-badge institution-badge-approved">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "ON_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3" /> On Delivery
          </span>
        );
      case "ARRIVED":
      case "COMPLETED":
        return (
          <span className="institution-badge institution-badge-approved">
            <CheckCircle2 className="w-3 h-3" /> {status === "ARRIVED" ? "Arrived" : "Completed"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="institution-badge institution-badge-rejected">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header matching Admin Header */}
      <div className="institution-header">
        <div>
          <h1 className="institution-title">
            Welcome, {session?.user?.name || "Institution"}!
          </h1>
          <p className="institution-subtitle">
            Welcome back to the Cheerity Dashboard Social Institution.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="institution-stats-grid">
        {/* 1. Total Campaigns Uploaded */}
        <div className="institution-stat-card">
          <div className="institution-stat-header">
            <span className="institution-stat-label">Total Campaigns</span>
          </div>
          <div className="institution-stat-value">{totalUploaded}</div>
        </div>

        {/* 2. Today Requests */}
        <div className="institution-stat-card">
          <div className="institution-stat-header">
            <span className="institution-stat-label">Today Requests</span>
          </div>
          <div className="institution-stat-value">{todayRequests}</div>
        </div>

        {/* 3. Total Requests Received */}
        <div className="institution-stat-card">
          <div className="institution-stat-header">
            <span className="institution-stat-label">Total Requests</span>
          </div>
          <div className="institution-stat-value">{totalDonationsCount}</div>
        </div>

        {/* 4. Total Items Collected */}
        <div className="institution-stat-card">
          <div className="institution-stat-header">
            <span className="institution-stat-label">Items Collected</span>
          </div>
          <div className="institution-stat-value">{totalCollected}</div>
        </div>
      </div>

      {/* Charts Grid: Line Chart + Pie Chart */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Donations Activity Chart (Weekly | Monthly | Yearly) */}
        <div className="flex-1 min-w-0">
          <DonationsActivityChart data={activityStats} />
        </div>

        {/* Donor Location Pie Chart */}
        <div className="w-full lg:w-[40%]">
          {locationStats.length > 0 ? (
            <PieChart
              compact
              data={locationStats.map((loc) => ({
                label: loc.city,
                value: loc.count,
                percentage: loc.percentage,
              }))}
              title="Donor Locations"
              subtitle="Top donor cities"
            />
          ) : (
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h2 className="chart-title">Donor Locations</h2>
                  <p className="chart-subtitle">Top cities</p>
                </div>
              </div>
              <div className="flex items-center justify-center h-80 text-gray-400">
                <p className="text-sm">No donation request yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Donation Requests Table */}
      <div className="institution-table-card">
        <div className="institution-table-header">
          <h2 className="institution-table-title">
            Recent Donation Requests
          </h2>

          <Link
            href="/institution/history"
            className="text-xs font-bold --text-green-300 hover:text-green-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestFiveRequests.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center text-center gap-2 w-full"
          style={{ minHeight: "150px" }} 
        >
          <p className="font-semibold text-sm text-gray-700">
            All institutional applications have completed review.
          </p>
          <p className="text-xs text-gray-400">
            There are no donation request at this time.
          </p>
        </div>
        ) : (
          <div className="institution-table-wrapper">
            <table className="institution-table">
              <thead>
                <tr>
                  <th className="institution-table-th w-12 text-center">No</th>
                  <th className="institution-table-th">Donor Name</th>
                  <th className="institution-table-th">Campaign</th>
                  <th className="institution-table-th text-center">Qty</th>
                  <th className="institution-table-th">Delivery Method</th>
                  <th className="institution-table-th">Request Date</th>
                  <th className="institution-table-th">Status</th>
                  <th className="institution-table-th text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {latestFiveRequests.map((record, idx) => (
                  <tr key={record.id} className="institution-table-tr">
                    <td className="institution-table-td text-center text-xs text-gray-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="institution-table-td font-bold">
                      {record.isAnonymous ? "Anonymous Donor" : record.donorName || "Donor"}
                    </td>
                    <td className="institution-table-td font-medium text-gray-800">
                      {record.donationTitle || "Donation Item"}
                    </td>
                    <td className="institution-table-td text-center font-bold text-green-900">
                      {record.quantity}
                    </td>
                    <td className="institution-table-td text-xs text-gray-600">
                      {DELIVERY_METHOD_LABELS[record.deliveryMethod as keyof typeof DELIVERY_METHOD_LABELS] ||
                        record.deliveryMethod}
                    </td>
                    <td className="institution-table-td text-xs text-gray-600 font-medium">
                      {record.requestDate
                        ? new Date(record.requestDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="institution-table-td">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="institution-table-td text-center">
                      <Link
                        href="/institution/history"
                        className="institution-table-icon-btn"
                        title="Lihat di Riwayat"
                        aria-label="Lihat di Riwayat"
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

export default InstitutionDashboardPage;
