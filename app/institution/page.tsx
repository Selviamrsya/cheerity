import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getInstitutionDonations,
  getInstitutionDonationHistory,
  getDonorLocationStats,
  getDonorLocationStatsWithPeriod,
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
import { headers } from "next/headers";

const InstitutionDashboardPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);
  const institutionId = session?.user?.id as string;

  const [uploadedDonations, donationHistory, locationStats, locationStatsWithPeriod, activityStats] = await Promise.all([
    getInstitutionDonations(institutionId),
    getInstitutionDonationHistory(institutionId),
    getDonorLocationStats(institutionId),
    getDonorLocationStatsWithPeriod(institutionId),
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
    .filter((h) => h.status === "WAITING_FOR_DOCUMENTATION" || h.status === "COMPLETED")
    .reduce((sum, h) => sum + (h.quantity || 0), 0);

  const latestFiveRequests = donationHistory.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-warning-bg text-warning">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case "ON_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-800">
            <Truck className="w-3 h-3" /> On Delivery
          </span>
        );
      case "WAITING_FOR_DOCUMENTATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-800">
            <Clock className="w-3 h-3" /> Waiting for Docs
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-success-bg text-success">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-danger-bg text-danger">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 md:px-8">
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-[22px] font-semibold tracking-tight text-on-surface md:text-[26px]">
            Welcome, {session?.user?.name || "Institution"}!
          </h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Welcome back to the Cheerity Dashboard Social Institution.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="my-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {/* 1. Total Campaigns Uploaded */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-text-muted">Total Campaigns</span>
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">{totalUploaded}</div>
        </div>

        {/* 2. Today Requests */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-text-muted">Today Requests</span>
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">{todayRequests}</div>
        </div>

        {/* 3. Total Requests Received */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-text-muted">Total Requests</span>
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">{totalDonationsCount}</div>
        </div>

        {/* 4. Total Items Collected */}
        <div className="flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-3 py-3 sm:px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-text-muted">Items Collected</span>
          </div>
          <div className="font-poppins text-xl font-extrabold leading-tight tracking-tight text-text-main sm:text-2xl">{totalCollected}</div>
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
              withPeriodFilter
              data={locationStats.map((loc) => ({
                label: loc.city,
                value: loc.count,
                percentage: loc.percentage,
              }))}
              periodData={{
                weekly: locationStatsWithPeriod.weekly.map((loc) => ({
                  label: loc.city,
                  value: loc.count,
                  percentage: loc.percentage,
                })),
                monthly: locationStatsWithPeriod.monthly.map((loc) => ({
                  label: loc.city,
                  value: loc.count,
                  percentage: loc.percentage,
                })),
                yearly: locationStatsWithPeriod.yearly.map((loc) => ({
                  label: loc.city,
                  value: loc.count,
                  percentage: loc.percentage,
                })),
              }}
              title="Donor Locations"
              subtitle="Top donor cities"
            />
          ) : (
            <div className="mb-4 flex min-h-100 w-full flex-col rounded-sm border border-card-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-2 border-b border-card-border pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-poppins text-lg font-semibold text-text-main">Donor Locations</h2>
                  <p className="mt-1 font-inter text-xs text-text-muted">Top cities</p>
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
      <div className="relative flex flex-col py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col border-b border-card-border sm:flex-row sm:items-center sm:justify-between">
          <h2 className="mb-4 font-poppins text-lg font-semibold text-text-main">
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
          <div className="overflow-x-auto">
            <table className="responsive-table w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4 w-8 text-center md:w-12">No</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Campaign</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4 text-center w-10 md:w-auto">Qty</th>
                  <th className="hidden border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4 md:table-cell">Delivery Method</th>
                  <th className="hidden border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4 md:table-cell">Request Date</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4 w-20 md:w-auto">Status</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4 text-center w-10 md:w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {latestFiveRequests.map((record, idx) => (
                  <tr key={record.id} className="transition-colors hover:bg-bg-light">
                    <td data-label="No" className="relative border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 text-center text-xs font-semibold">
                      {idx + 1}
                    </td>
                    <td data-label="Campaign" className="relative border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 font-semibold ">
                      {record.donationTitle || "Donation Item"}
                    </td>
                    <td data-label="Qty" className="relative border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 text-center font-bold ">
                      {record.quantity}
                    </td>
                    <td data-label="Delivery Method" className="relative hidden border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 text-xs  md:table-cell">
                      {DELIVERY_METHOD_LABELS[record.deliveryMethod as keyof typeof DELIVERY_METHOD_LABELS] ||
                        record.deliveryMethod}
                    </td>
                    <td data-label="Request Date" className="relative hidden border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 text-xs font-semibold md:table-cell">
                      {record.requestDate
                        ? new Date(record.requestDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </td>
                    <td data-label="Status" className="relative border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td data-label="Action" className="relative border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4 text-center">
                      <Link
                        href="/institution/history"
                        className="inline-flex items-center justify-center bg-transparent p-1.5 text-text-muted shadow-none transition-colors hover:bg-transparent hover:text-primary-800"
                        title="See history"
                        aria-label="See history"
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
