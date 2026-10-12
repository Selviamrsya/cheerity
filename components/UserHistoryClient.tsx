"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Eye } from "lucide-react";
import { DONATION_CATEGORIES, CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";
import { cancelDonation } from "@/lib/actions/donation";

interface HistoryRecord {
  id: string;
  status: "PENDING" | "REJECTED" | "ON_PROGRESS" | "WAITING_FOR_DOCUMENTATION" | "COMPLETED";
  quantity: number;
  deliveryMethod: string;
  requestDate: Date | null;
  documentationPhoto: string | null;
  rejectionReason: string | null;
  cancelReason: string | null;
  donationTitle: string;
  donationCategory: string;
  donationCover: string | null;
  institutionName: string;
}

interface UserHistoryClientProps {
  records: HistoryRecord[];
}

const UserHistoryClient: React.FC<UserHistoryClientProps> = ({ records }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "ON_PROGRESS", label: "On Progress" },
    { key: "WAITING_FOR_DOCUMENTATION", label: "Waiting for Documentation" },
    { key: "COMPLETED", label: "Completed" },
    { key: "REJECTED", label: "Rejected" },
  ];

  const filteredRecords = records.filter((r) => {
    if (activeTab !== "ALL" && r.status !== activeTab) {
      return false;
    }

    if (categoryFilter && r.donationCategory !== categoryFilter) {
      return false;
    }

    if (
      search &&
      !r.donationTitle.toLowerCase().includes(search.toLowerCase()) &&
      !r.institutionName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const formatDate = (d: Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status Badge tanpa border dan dengan ukuran yang proporsional/seragam
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-warning-bg text-warning">Pending</span>;
      case "APPROVED":
      case "ON_PROGRESS":
        return <span className="inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-purple-100 text-purple-800">On Progress</span>;
      case "WAITING_FOR_DOCUMENTATION":
        return <span className="inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-orange-100 text-orange-800">Waiting for Documentation</span>;
      case "COMPLETED":
        return <span className="inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-success-bg text-success">Completed</span>;
      case "REJECTED":
        return <span className="inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-danger-bg text-danger">Rejected</span>;
      default:
        return null;
    }
  };

  const handleCancelSubmit = async (id: string) => {
    setLoadingId(id);
    const res = await cancelDonation(id, cancelReason);
    setLoadingId(null);
    setCancelId(null);
    setCancelReason("");
    if (res.success) {
      router.refresh();
    }
  };

  return (
    <div className="w-full min-h-[70vh]">
      <div className="mt-2 mb-3">
          <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Donation History</h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Track and manage your submitted donations.
          </p>
      </div>

      {/* Search & Category Filter */}
      <div className="mt-2 mb-4 flex flex-wrap gap-2" style={{ marginBottom: "0px" }}>
        <div className="flex min-w-[240px] flex-1 items-center gap-1.5 rounded-sm border border-outline bg-white px-3.5">
          <Search className="h-4 w-4" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search by title or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none py-2.5 text-sm outline-none"
          />
        </div>

        <div className="relative inline-block w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="cursor-pointer appearance-none rounded-sm border border-outline bg-white py-2.5 pr-10 pl-3.5 text-sm text-on-surface outline-none transition-colors hover:border-slate-300 focus:border-primary w-auto"
          >
            <option value="">All Categories</option>
            {DONATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-4" style={{marginTop:"16px",marginBottom:"12px"}}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.key
                ? "text-green-800 border-green-800"
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* History Table or Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="relative flex flex-col bg-surface px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-9">
          <div className="py-16 text-center text-gray-400 space-y-2" style={{paddingBottom:"40px"}}>
            <p className="font-semibold text-md text-gray-700">
              There are no donations available yet
            </p>
            <p className="text-sm text-gray-400">
              Start by donating to a campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">No</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Title</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Institution</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Category</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Quantity</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Delivery Method</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Status</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Request Date</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, index) => (
                  <tr key={r.id} className="transition-colors hover:bg-bg-light">
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-medium">{index + 1}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold">{r.donationTitle}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">{r.institutionName}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {CATEGORY_LABELS[r.donationCategory] || r.donationCategory}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold">
                      {r.quantity} items
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {DELIVERY_METHOD_LABELS[r.deliveryMethod] || r.deliveryMethod}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs">
                      {formatDate(r.requestDate)}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => router.push(`/history/${r.id}`)}
                          title="View Details"
                          className="inline-flex items-center justify-center bg-transparent p-1.5 text-text-muted shadow-none transition-colors hover:bg-transparent hover:text-primary-800 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Donation Modal */}
      {cancelId && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-xs" onClick={() => setCancelId(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
              <h2 className="text-lg font-bold sm:text-xl">Cancel Donation</h2>
              <button onClick={() => setCancelId(null)} className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Please state the reason for cancelling this donation. The institution will be notified.
              </p>
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. No longer able to donate..."
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-20 resize-none"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setCancelId(null)}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50 cursor-pointer"
                  style={{ padding: "10px 24px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCancelSubmit(cancelId)}
                  disabled={loadingId === cancelId}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserHistoryClient;