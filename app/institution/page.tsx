import React from "react";
import { auth } from "@/app/auth";
import {
  getInstitutionDonations,
  getInstitutionDonationHistory,
} from "@/lib/actions/donation";
import { Package, Inbox, CheckCircle, TrendingUp } from "lucide-react";

const InstitutionDashboardPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  const uploadedDonations = await getInstitutionDonations(institutionId);
  const donationHistory = await getInstitutionDonationHistory(institutionId);

  const totalUploaded = uploadedDonations.length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRequests = donationHistory.filter(
    (h) => h.requestDate && new Date(h.requestDate).toISOString().split("T")[0] === todayStr
  ).length;

  const totalDonationsCount = donationHistory.length;

  // Monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyUploaded = uploadedDonations.filter(
    (d) =>
      d.createdAt &&
      new Date(d.createdAt).getMonth() === currentMonth &&
      new Date(d.createdAt).getFullYear() === currentYear
  ).length;

  const monthlyRequests = donationHistory.filter(
    (h) =>
      h.requestDate &&
      new Date(h.requestDate).getMonth() === currentMonth &&
      new Date(h.requestDate).getFullYear() === currentYear
  ).length;

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session?.user?.name || "Institution"}
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back to Cheerity Dashboard Social Institution
        </p>
      </div>

      {/* Info Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Box 1: Total Donations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                {totalDonationsCount}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{monthlyRequests} this month</span>
          </div>
        </div>

        {/* Stat Box 2: Today Donation Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Today Donation Requests</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                {todayRequests}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active requests today</span>
          </div>
        </div>

        {/* Stat Box 3: Total Donation Uploaded */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Donation Uploaded</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                {totalUploaded}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-purple-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{monthlyUploaded} this month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboardPage;
