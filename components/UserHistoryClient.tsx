"use client";

import React, { useState } from "react";
import { Search, Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DONATION_CATEGORIES, CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

interface HistoryRecord {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ON_PROGRESS" | "ARRIVED" | "COMPLETED";
  quantity: number;
  deliveryMethod: string;
  requestDate: Date | null;
  approvalDate: Date | null;
  deliveryDate: Date | null;
  arrivedDate: Date | null;
  arrivalProofPhoto: string | null;
  rejectionReason: string | null;
  donationTitle: string;
  donationCategory: string;
  donationCover: string | null;
  institutionName: string;
}

interface UserHistoryClientProps {
  records: HistoryRecord[];
}

const UserHistoryClient: React.FC<UserHistoryClientProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "ON_PROGRESS", label: "On Progress" },
    { key: "ARRIVED", label: "Arrived" },
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
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case "APPROVED":
      case "ON_PROGRESS":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center gap-1"><Truck className="w-3 h-3" /> On Progress</span>;
      case "ARRIVED":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Arrived</span>;
      case "COMPLETED":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-900 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case "REJECTED":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your submitted donations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-4">
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

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-input sm:w-64"
        >
          <option value="">All Categories</option>
          {DONATION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* History List or Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">There are no donations available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRecord(r)}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                  {r.donationCover ? (
                    <img src={r.donationCover} alt={r.donationTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{r.donationTitle}</h3>
                  <p className="text-sm text-gray-500">{r.institutionName}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>Qty: {r.quantity}</span>
                    <span>•</span>
                    <span>Method: {DELIVERY_METHOD_LABELS[r.deliveryMethod] || r.deliveryMethod}</span>
                    <span>•</span>
                    <span>Category: {CATEGORY_LABELS[r.donationCategory] || r.donationCategory}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                {getStatusBadge(r.status)}
                <span className="text-xs text-gray-400">
                  Requested: {formatDate(r.requestDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail for Timeline and Record Info */}
      {selectedRecord && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedRecord(null)} />
          <div className="modal-container max-w-2xl">
            <div className="modal-header">
              <h2 className="modal-title">Donation Record Detail</h2>
              <button onClick={() => setSelectedRecord(null)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-gray-900">{selectedRecord.donationTitle}</h3>
                <p className="text-sm text-gray-500">Institution: {selectedRecord.institutionName}</p>
              </div>

              {/* Status Timeline */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">Timeline & Dates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Request Date:</span>
                    <span className="font-medium text-gray-800">{formatDate(selectedRecord.requestDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Approval Date:</span>
                    <span className="font-medium text-gray-800">{formatDate(selectedRecord.approvalDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Delivery Date:</span>
                    <span className="font-medium text-gray-800">{formatDate(selectedRecord.deliveryDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Arrived Date:</span>
                    <span className="font-medium text-gray-800">{formatDate(selectedRecord.arrivedDate)}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Reason if any */}
              {selectedRecord.status === "REJECTED" && selectedRecord.rejectionReason && (
                <div className="p-4 bg-red-50 text-red-800 rounded-xl text-sm">
                  <span className="font-bold">Rejection Reason: </span>
                  {selectedRecord.rejectionReason}
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
    </div>
  );
};

export default UserHistoryClient;
