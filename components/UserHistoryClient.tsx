"use client";

import React, { useState } from "react";
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, Eye, MoreVertical } from "lucide-react";
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
  const [imagePopup, setImagePopup] = useState<{ isOpen: boolean; imageUrl: string | null }>({
    isOpen: false,
    imageUrl: null,
  });

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
        return <span className="institution-badge institution-badge-pending flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case "APPROVED":
      case "ON_PROGRESS":
        return <span className="institution-badge bg-purple-100 text-purple-800 flex items-center gap-1"><Truck className="w-3 h-3" /> On Progress</span>;
      case "ARRIVED":
        return <span className="institution-badge institution-badge-approved flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Arrived</span>;
      case "COMPLETED":
        return <span className="institution-badge institution-badge-approved flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case "REJECTED":
        return <span className="institution-badge institution-badge-rejected flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="user-header">
          <h1 className="institution-title">Donation History</h1>
          <p className="institution-subtitle">
            Track and manage your submitted donations.
          </p>
      </div>

      {/* Search & Category Filter */}
      <div className="find-donation-filters" style={{ marginBottom: "0px" }}>
        {/* Search */}
        <div className="find-donation-search flex-1">
          <Search className="h-4 w-4" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search by title or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="find-donation-search-input"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="find-donation-select w-auto"
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
        <div className="user-table-card">
          <div className="py-16 text-center text-gray-400 space-y-2">
            <p className="font-semibold text-md text-gray-700">
              There are no donations available yet
            </p>
            <p className="text-sm text-gray-400">
              Start by donating to a campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="user-table-card">
          <div className="institution-table-wrapper">
            <table className="institution-table">
              <thead>
                <tr>
                  <th className="institution-table-th">No</th>
                  <th className="institution-table-th">Title</th>
                  <th className="institution-table-th">Institution</th>
                  <th className="institution-table-th">Category</th>
                  <th className="institution-table-th">Quantity</th>
                  <th className="institution-table-th">Delivery Method</th>
                  <th className="institution-table-th">Status</th>
                  <th className="institution-table-th">Request Date</th>
                  <th className="institution-table-th">Cover</th>
                  <th className="institution-table-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, index) => (
                  <tr key={r.id} className="institution-table-tr">
                    <td className="institution-table-td font-medium">{index + 1}</td>
                    <td className="institution-table-td font-bold">{r.donationTitle}</td>
                    <td className="institution-table-td">{r.institutionName}</td>
                    <td className="institution-table-td">
                      {CATEGORY_LABELS[r.donationCategory] || r.donationCategory}
                    </td>
                    <td className="institution-table-td font-bold">{r.quantity}</td>
                    <td className="institution-table-td">
                      {DELIVERY_METHOD_LABELS[r.deliveryMethod] || r.deliveryMethod}
                    </td>
                    <td className="institution-table-td">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="institution-table-td text-xs">
                      {formatDate(r.requestDate)}
                    </td>
                    <td className="institution-table-td">
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
                    <td className="institution-table-td">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
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
    </div>
  );
};

export default UserHistoryClient;
