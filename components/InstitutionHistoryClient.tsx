"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveDonationRequest,
  rejectDonationRequest,
  markOnProgress,
  markArrived,
  markDonationComplete,
  uploadDocumentationAndComplete,
  rejectDonationFromProgress,
  cancelDonation,
} from "@/lib/actions/donation";
import LocalImageUpload from "@/components/LocalImageUpload";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Calendar,
  Phone,
  MapPin,
  FileImage,
} from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

interface InstitutionHistoryRecord {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ON_PROGRESS" | "WAITING_FOR_DOCUMENTATION" | "COMPLETED";
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
  documentationPhoto: string | null;
  rejectionReason: string | null;
  cancelReason: string | null;
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

  const [rejectingFromProgressId, setRejectingFromProgressId] = useState<string | null>(null);
  const [rejectionFromProgressReason, setRejectionFromProgressReason] = useState("");

  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [arrivingId, setArrivingId] = useState<string | null>(null);
  const [arrivalProofPhoto, setArrivalProofPhoto] = useState("");

  const [documentationId, setDocumentationId] = useState<string | null>(null);
  const [documentationPhoto, setDocumentationPhoto] = useState("");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending Approval" },
    { key: "APPROVED", label: "Approved" },
    { key: "ON_PROGRESS", label: "On Progress" },
    { key: "WAITING_FOR_DOCUMENTATION", label: "Waiting for Documentation" },
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

  const handleMarkDonationComplete = async (id: string) => {
    setLoadingId(id);
    const res = await markDonationComplete(id);
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    }
  };

  const handleUploadDocumentationSubmit = async (id: string) => {
    if (!documentationPhoto) return;
    setLoadingId(id);
    const res = await uploadDocumentationAndComplete(id, documentationPhoto);
    setLoadingId(null);
    setDocumentationId(null);
    setDocumentationPhoto("");
    if (res.success) {
      router.refresh();
    }
  };

  const handleRejectFromProgressSubmit = async (id: string) => {
    setLoadingId(id);
    const res = await rejectDonationFromProgress(id, institutionId, rejectionFromProgressReason);
    setLoadingId(null);
    setRejectingFromProgressId(null);
    setRejectionFromProgressReason("");
    if (res.success) {
      router.refresh();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-warning-border bg-warning-bg text-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Approval</span>;
      case "APPROVED":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-success-border bg-success-bg text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "ON_PROGRESS":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center gap-1"><Truck className="w-3 h-3" /> On Progress</span>;
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

  return (
    <div className="space-y-8">
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Donation request</h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Review, approve, reject, and manage incoming requests.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 mt-4 flex flex-1 justify-start gap-4 overflow-x-auto border-b border-outline sm:gap-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`shrink-0 border-b-2 border-transparent pb-3 font-inter text-sm font-semibold text-text-muted no-underline whitespace-nowrap transition-colors hover:text-primary-800 data-[active=true]:border-primary-800 data-[active=true]:text-primary-800 ${activeTab === t.key ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRecords.length === 0 ? (
        <div className="relative flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">
          <div className="py-16 text-center text-gray-400 space-y-2">
            <p className="font-semibold text-sm text-gray-700">
              No donation requests in this category.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((r) => (
            <div
              key={r.id}
              className="relative flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4">
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

              {/* Cancel reason if cancelled */}
              {r.status === "REJECTED" && r.cancelReason && (
                <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg">
                  <strong>Cancel Reason:</strong> {r.cancelReason}
                </p>
              )}

              {/* Documentation Photo if Waiting for Documentation or Completed */}
              {r.documentationPhoto && (
                <div className="p-4 bg-blue-50 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4" /> Documentation Photo:
                  </p>
                  <img src={r.documentationPhoto} alt="Documentation" className="max-h-48 rounded-lg object-cover border border-blue-200" />
                </div>
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

                {/* Status: APPROVED -> Mark On Progress or Cancel */}
                {r.status === "APPROVED" && (
                  <>
                    <button
                      onClick={() => handleMarkOnProgress(r.id)}
                      disabled={loadingId === r.id}
                      className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      {loadingId === r.id ? "Updating..." : "Start Delivery (On Progress)"}
                    </button>
                    <button
                      onClick={() => setCancelId(r.id)}
                      disabled={loadingId === r.id}
                      className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel Donation
                    </button>
                  </>
                )}

                {/* Status: ON_PROGRESS -> Donation Complete or Reject */}
                {r.status === "ON_PROGRESS" && (
                  <>
                    <button
                      onClick={() => handleMarkDonationComplete(r.id)}
                      disabled={loadingId === r.id}
                      className="px-5 py-2 bg-green-800 hover:bg-green-900 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      {loadingId === r.id ? "Updating..." : "Donation Complete"}
                    </button>
                    <button
                      onClick={() => setRejectingFromProgressId(r.id)}
                      disabled={loadingId === r.id}
                      className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      Reject Donation
                    </button>
                  </>
                )}

                {/* Status: WAITING_FOR_DOCUMENTATION -> Upload Documentation */}
                {r.status === "WAITING_FOR_DOCUMENTATION" && (
                  <button
                    onClick={() => setDocumentationId(r.id)}
                    disabled={loadingId === r.id}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    Upload Documentation
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
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]" onClick={() => setRejectingId(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 max-w-md">
            <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
              <h2 className="text-lg font-bold sm:text-xl">Reject Donation Request</h2>
              <button onClick={() => setRejectingId(null)} className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant">✕</button>
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
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-[11px] font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-20 resize-none"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setRejectingId(null)}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                  style={{ padding: "10px 24px" }}
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
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]" onClick={() => setArrivingId(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 max-w-md">
            <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
              <h2 className="text-lg font-bold sm:text-xl">Confirm Goods Arrived</h2>
              <button onClick={() => setArrivingId(null)} className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant">✕</button>
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
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                  style={{ padding: "10px 24px" }}
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

      {/* Reject from Progress Modal */}
      {rejectingFromProgressId && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]" onClick={() => setRejectingFromProgressId(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 max-w-md">
            <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
              <h2 className="text-lg font-bold sm:text-xl">Reject Donation</h2>
              <button onClick={() => setRejectingFromProgressId(null)} className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Please state the reason for rejecting this donation. An email notification will be sent to the donor.
              </p>
              <textarea
                rows={4}
                value={rejectionFromProgressReason}
                onChange={(e) => setRejectionFromProgressReason(e.target.value)}
                placeholder="e.g. Items do not match requirements..."
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-[11px] font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-20 resize-none"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setRejectingFromProgressId(null)}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                  style={{ padding: "10px 24px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectFromProgressSubmit(rejectingFromProgressId)}
                  disabled={loadingId === rejectingFromProgressId}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </>
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
                Please state the reason for cancelling this donation. An email notification will be sent to the donor.
              </p>
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. No longer able to accept this donation..."
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

      {/* Upload Documentation Modal */}
      {documentationId && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]" onClick={() => setDocumentationId(null)} />
          <div className="fixed top-1/2 left-1/2 z-[1000] max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7 max-w-md">
            <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
              <h2 className="text-lg font-bold sm:text-xl">Upload Documentation</h2>
              <button onClick={() => setDocumentationId(null)} className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Upload the required documentation for this donation. The status will automatically change to Completed after submission.
              </p>
              <LocalImageUpload
                value={documentationPhoto}
                onChange={(url) => setDocumentationPhoto(url)}
                folder="documentation"
                placeholder="Upload documentation photo *"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setDocumentationId(null)}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                  style={{ padding: "10px 24px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUploadDocumentationSubmit(documentationId)}
                  disabled={!documentationPhoto || loadingId === documentationId}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Submit & Complete
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
