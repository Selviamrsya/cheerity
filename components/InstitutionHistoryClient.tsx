"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveDonationRequest,
  rejectDonationRequest,
  markOnProgress,
  markArrived,
} from "@/lib/actions/donation";
import LocalImageUpload from "@/components/LocalImageUpload";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Package,
  Calendar,
  Phone,
  MapPin,
  FileImage,
} from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

interface InstitutionHistoryRecord {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ON_PROGRESS" | "ARRIVED" | "COMPLETED";
  donorName: string | null;
  isAnonymous: boolean;
  phoneNumber: string | null;
  city: string | null;
  quantity: number;
  deliveryMethod: string;
  notes: string | null;
  donorPhoto: string | null;
  estimatedPickupDate: string | null;
  estimatedPickupTime: string | null;
  requestDate: Date | null;
  approvalDate: Date | null;
  arrivalProofPhoto: string | null;
  rejectionReason: string | null;
  donationTitle: string;
  donationCategory: string;
}

interface InstitutionHistoryClientProps {
  institutionId: string;
  records: InstitutionHistoryRecord[];
}

const InstitutionHistoryClient: React.FC<InstitutionHistoryClientProps> = ({
  institutionId,
  records,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [arrivingId, setArrivingId] = useState<string | null>(null);
  const [arrivalProofPhoto, setArrivalProofPhoto] = useState("");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending Approval" },
    { key: "APPROVED", label: "Approved" },
    { key: "ON_PROGRESS", label: "On Progress" },
    { key: "ARRIVED", label: "Arrived" },
    { key: "COMPLETED", label: "Completed" },
    { key: "REJECTED", label: "Rejected" },
  ];

  const filteredRecords = records.filter((r) => {
    if (activeTab === "ALL") return true;
    return r.status === activeTab;
  });

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await approveDonationRequest(id, institutionId);
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    }
  };

  const handleRejectSubmit = async (id: string) => {
    setLoadingId(id);
    const res = await rejectDonationRequest(id, institutionId, rejectionReason);
    setLoadingId(null);
    setRejectingId(null);
    setRejectionReason("");
    if (res.success) {
      router.refresh();
    }
  };

  const handleMarkOnProgress = async (id: string) => {
    setLoadingId(id);
    const res = await markOnProgress(id);
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    }
  };

  const handleMarkArrivedSubmit = async (id: string) => {
    if (!arrivalProofPhoto) return;
    setLoadingId(id);
    const res = await markArrived(id, arrivalProofPhoto);
    setLoadingId(null);
    setArrivingId(null);
    setArrivalProofPhoto("");
    if (res.success) {
      router.refresh();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Approval</span>;
      case "APPROVED":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
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
        <h1 className="text-3xl font-bold text-gray-900">Institution History</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review, approve, reject, and manage incoming user donation requests.
        </p>
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

      {/* Requests List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No donation requests in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-50 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{r.donationTitle}</h3>
                  <p className="text-xs text-gray-500">
                    Category: {CATEGORY_LABELS[r.donationCategory] || r.donationCategory} • Requested on{" "}
                    {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                {getStatusBadge(r.status)}
              </div>

              {/* Donor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">
                    Donor: {r.isAnonymous ? "Anonymous Donor" : r.donorName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {r.phoneNumber || "-"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {r.city || "-"}
                  </p>
                </div>

                <div>
                  <p><strong>Quantity:</strong> {r.quantity} items</p>
                  <p>
                    <strong>Delivery Method:</strong>{" "}
                    {DELIVERY_METHOD_LABELS[r.deliveryMethod] || r.deliveryMethod}
                  </p>
                  {r.estimatedPickupDate && (
                    <p className="text-xs text-green-800 font-medium mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Pickup: {r.estimatedPickupDate}{" "}
                      {r.estimatedPickupTime ? `at ${r.estimatedPickupTime}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes or Donor Photo if provided */}
              {(r.notes || r.donorPhoto) && (
                <div className="text-xs text-gray-600 space-y-2">
                  {r.notes && <p><strong>Notes:</strong> {r.notes}</p>}
                  {r.donorPhoto && (
                    <div>
                      <p className="font-semibold mb-1">Donor Item Photo:</p>
                      <img src={r.donorPhoto} alt="Item photo" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
              )}

              {/* Arrival Proof Photo if Arrived or Completed */}
              {r.arrivalProofPhoto && (
                <div className="p-4 bg-green-50 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4" /> Arrival Proof Photo Sent to User:
                  </p>
                  <img src={r.arrivalProofPhoto} alt="Arrival proof" className="max-h-48 rounded-lg object-cover border border-green-200" />
                </div>
              )}

              {/* Rejection reason if rejected */}
              {r.status === "REJECTED" && r.rejectionReason && (
                <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg">
                  <strong>Rejection Reason:</strong> {r.rejectionReason}
                </p>
              )}

              {/* Action Buttons depending on status */}
              <div className="pt-2 flex flex-wrap gap-3 justify-end">
                {/* Status: PENDING -> Approve or Reject */}
                {r.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={loadingId === r.id}
                      className="px-5 py-2 bg-green-800 hover:bg-green-900 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      {loadingId === r.id ? "Approving..." : "Approve Request"}
                    </button>
                    <button
                      onClick={() => setRejectingId(r.id)}
                      disabled={loadingId === r.id}
                      className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Status: APPROVED -> Mark On Progress */}
                {r.status === "APPROVED" && (
                  <button
                    onClick={() => handleMarkOnProgress(r.id)}
                    disabled={loadingId === r.id}
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loadingId === r.id ? "Updating..." : "Start Delivery (On Progress)"}
                  </button>
                )}

                {/* Status: ON_PROGRESS or APPROVED -> Upload Arrival Proof & Mark Arrived */}
                {(r.status === "ON_PROGRESS" || r.status === "APPROVED") && (
                  <button
                    onClick={() => setArrivingId(r.id)}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors"
                  >
                    Mark Goods Arrived (Upload Proof)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingId && (
        <>
          <div className="modal-backdrop" onClick={() => setRejectingId(null)} />
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h2 className="modal-title">Reject Donation Request</h2>
              <button onClick={() => setRejectingId(null)} className="modal-close-btn">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Please state the reason for rejecting this donation request. An email notification will be sent to the donor.
              </p>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Items requested do not match our current needs..."
                className="form-input form-textarea"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectSubmit(rejectingId)}
                  disabled={loadingId === rejectingId}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Arrived Proof Modal */}
      {arrivingId && (
        <>
          <div className="modal-backdrop" onClick={() => setArrivingId(null)} />
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Goods Arrived</h2>
              <button onClick={() => setArrivingId(null)} className="modal-close-btn">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Upload proof photo of the arrived donated items. The user will be notified and can view this proof in their history.
              </p>
              <LocalImageUpload
                value={arrivalProofPhoto}
                onChange={(url) => setArrivalProofPhoto(url)}
                folder="arrival-proof"
                placeholder="Upload proof photo of arrived items *"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setArrivingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkArrivedSubmit(arrivingId)}
                  disabled={!arrivalProofPhoto || loadingId === arrivingId}
                  className="px-5 py-2 bg-green-800 hover:bg-green-900 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Submit Proof & Mark Arrived
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstitutionHistoryClient;
