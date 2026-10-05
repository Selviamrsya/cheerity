"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, Eye, MoreVertical } from "lucide-react";
import { DONATION_CATEGORIES, CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";
import { cancelDonation } from "@/lib/actions/donation";

interface HistoryRecord {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ON_PROGRESS" | "WAITING_FOR_DOCUMENTATION" | "COMPLETED";
  quantity: number;
  deliveryMethod: string;
  requestDate: Date | null;
  approvalDate: Date | null;
  deliveryDate: Date | null;
  arrivedDate: Date | null;
  arrivalProofPhoto: string | null;
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
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [imagePopup, setImagePopup] = useState<{ isOpen: boolean; imageUrl: string | null }>({
    isOpen: false,
    imageUrl: null,
  });
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
    // Tab filter
    if (activeTab !== "ALL") {
      if (activeTab === "ON_PROGRESS" && r.status !== "ON_PROGRESS" && r.status !== "APPROVED") {
        return false;
      } else if (activeTab !== "ON_PROGRESS" && r.status !== activeTab) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter && r.donationCategory !== categoryFilter) {
      return false;
    }

    // Search filter
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-warning-border bg-warning-bg text-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case "APPROVED":
      case "ON_PROGRESS":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1"><Truck className="w-3 h-3" /> On Progress</span>;
      case "WAITING_FOR_DOCUMENTATION":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Waiting for Documentation</span>;
      case "COMPLETED":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-success-border bg-success-bg text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case "REJECTED":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-danger-border bg-danger-bg text-danger flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
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
    <div className="w-full">
      <div className="mt-2 mb-3 md:mt-4">
          <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Donation History</h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Track and manage your submitted donations.
          </p>
      </div>

      {/* Search & Category Filter */}
      <div className="mt-2 mb-4 flex flex-wrap gap-2" style={{ marginBottom: "0px" }}>
        {/* Search */}
        <div className="flex min-w-[240px] flex-1 items-center gap-1.5 rounded-sm border border-outline bg-white px-3.5 flex-1">
          <Search className="h-4 w-4" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search by title or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none py-2.5 text-sm outline-none"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`cursor-pointer appearance-none rounded-sm border border-outline bg-white bg-[length:14px_14px] bg-[position:right_10px_center] bg-no-repeat py-2.5 pr-8 pl-3.5 text-sm text-on-surface outline-none transition-colors hover:border-slate-300 focus:border-primary bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] w-auto`}
        >
          <option value="">All Categories</option>
          {DONATION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* tab */}
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
        <div className="relative flex flex-col bg-surface px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-9">
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
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Cover</th>
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
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold">{r.quantity}</td>
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
                      {r.donationCover ? (
                        <button
                          onClick={() => setImagePopup({ isOpen: true, imageUrl: r.donationCover })}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      <div className="flex gap-2">
                        {r.status === "APPROVED" && (
                          <button
                            onClick={() => setCancelId(r.id)}
                            disabled={loadingId === r.id}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
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

      {/* Modal Detail for Timeline and Record Info */}
      {selectedRecord && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]" onClick={() => setSelectedRecord(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 max-w-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
              <h2 className="text-lg font-bold sm:text-xl">Donation Record Detail</h2>
              <button onClick={() => setSelectedRecord(null)} className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-gray-900">{selectedRecord.donationTitle}</h3>
                <p className="text-sm text-gray-500">Institution: {selectedRecord.institutionName}</p>
              </div>

              {/* Status Timeline */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                <h4 className="font-semibold text-sm text-gray-900">Donation Track</h4>
                
                <div className="flex items-center justify-between relative mt-2 mb-2">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded"></div>
                  
                  {[
                    { label: "Requested", date: selectedRecord.requestDate },
                    { label: "Approved", date: selectedRecord.approvalDate },
                    { label: "Shipped", date: selectedRecord.deliveryDate },
                    { label: "Completed", date: selectedRecord.arrivedDate }
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex flex-col items-center z-10 w-1/4">
                      <div className={`w-4 h-4 rounded-full border-2 ${step.date ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}></div>
                      <span className={`text-xs mt-2 font-medium ${step.date ? 'text-green-800' : 'text-gray-400'}`}>{step.label}</span>
                      <span className="text-[10px] text-gray-500 text-center px-1">
                        {step.date ? formatDate(step.date) : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection Reason if any */}
              {selectedRecord.status === "REJECTED" && selectedRecord.rejectionReason && (
                <div className="p-4 bg-red-50 text-red-800 rounded-xl text-sm">
                  <span className="font-bold">Rejection Reason: </span>
                  {selectedRecord.rejectionReason}
                </div>
              )}

              {/* Cancel Reason if any */}
              {selectedRecord.status === "REJECTED" && selectedRecord.cancelReason && (
                <div className="p-4 bg-red-50 text-red-800 rounded-xl text-sm">
                  <span className="font-bold">Cancel Reason: </span>
                  {selectedRecord.cancelReason}
                </div>
              )}

              {/* Documentation Photo if available */}
              {selectedRecord.documentationPhoto && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Documentation Photo:</h4>
                  <img
                    src={selectedRecord.documentationPhoto}
                    alt="Documentation"
                    className="w-full max-h-64 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}

              {/* Arrival Proof Photo */}
              {selectedRecord.arrivalProofPhoto && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Arrival Proof Photo from Institution:</h4>
                  <img
                    src={selectedRecord.arrivalProofPhoto}
                    alt="Arrival Proof"
                    className="w-full max-h-64 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}

              {/* General Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-700">
                <p><strong>Quantity:</strong> {selectedRecord.quantity} items</p>
                <p><strong>Delivery Method:</strong> {DELIVERY_METHOD_LABELS[selectedRecord.deliveryMethod] || selectedRecord.deliveryMethod}</p>
                <p><strong>Category:</strong> {CATEGORY_LABELS[selectedRecord.donationCategory] || selectedRecord.donationCategory}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Popup Modal */}
      {imagePopup.isOpen && imagePopup.imageUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setImagePopup({ isOpen: false, imageUrl: null })}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <img
              src={imagePopup.imageUrl}
              alt="Donation cover"
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setImagePopup({ isOpen: false, imageUrl: null })}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Donation Modal */}
      {cancelId && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]" onClick={() => setCancelId(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 max-w-md">
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
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-[11px] font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-20 resize-none"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setCancelId(null)}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                  style={{ padding: "10px 24px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCancelSubmit(cancelId)}
                  disabled={loadingId === cancelId}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
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
