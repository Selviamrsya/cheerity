"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";
import {
  approveDonationRequest,
  rejectDonationRequest,
  rejectDonationFromProgress,
  markDonationComplete,
  uploadDocumentationAndComplete,
} from "@/lib/actions/donation";
import LocalImageUpload from "@/components/LocalImageUpload";
import RejectModal from "./RejectModal";

interface DonationRecord {
  id: string;
  status: "PENDING" | "REJECTED" | "ON_PROGRESS" | "WAITING_FOR_DOCUMENTATION" | "COMPLETED";
  quantity: number;
  deliveryMethod: string;
  notes: string | null;
  donorPhoto: string | null;
  estimatedPickupDate: string | null;
  estimatedPickupTime: string | null;
  requestDate: Date | null;
  updatedAt: Date | null;
  documentationPhoto: string | null;
  rejectionReason: string | null;
  cancelReason: string | null;
  title: string;
  category: string;
  cover: string | null;
  description: string | null;
  institutionName: string;
  donorName: string | null;
  phoneNumber: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  address: string | null;
  userId: string;
}

interface DonationDetailClientProps {
  record: DonationRecord;
  userType: "user" | "institution";
}

const DonationDetailClient: React.FC<DonationDetailClientProps> = ({ record, userType }) => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // State untuk foto dokumentasi langsung & pesan error validasinya
  const [documentationPhoto, setDocumentationPhoto] = useState("");
  const [documentationError, setDocumentationError] = useState("");

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingFromProgressId, setRejectingFromProgressId] = useState<string | null>(null);
  const [rejectionFromProgressReason, setRejectionFromProgressReason] = useState("");
  const [confirmingDoneId, setConfirmingDoneId] = useState<string | null>(null);

  const formatDate = (d: Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUploadDocumentationSubmit = async (id: string) => {
    if (!documentationPhoto.trim()) {
      setDocumentationError("Please upload the documentation photo first.");
      return;
    }
    
    setDocumentationError("");
    setLoadingId(id);
    const res = await uploadDocumentationAndComplete(id, documentationPhoto);
    setLoadingId(null);
    
    if (res.success) {
      setDocumentationPhoto("");
      router.refresh();
    } else {
      alert(res.error || "Failed to upload documentation.");
    }
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await approveDonationRequest(id);
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    }
  };

  const handleMarkDone = async (id: string) => {
    setLoadingId(id);
    const res = await markDonationComplete(id);
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    }
  };

  const handleRejectSubmit = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert("Please enter the rejection reason.");
      return;
    }
    setLoadingId(id);
    const res = await rejectDonationRequest(id, rejectionReason);
    setLoadingId(null);
    setRejectingId(null);
    setRejectionReason("");
    if (res.success) {
      router.refresh();
    }
  };

  const handleRejectFromProgressSubmit = async (id: string) => {
    setLoadingId(id);
    const res = await rejectDonationFromProgress(id, undefined, rejectionFromProgressReason);
    setLoadingId(null);
    setRejectingFromProgressId(null);
    setRejectionFromProgressReason("");
    if (res.success) {
      router.refresh();
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "ON_PROGRESS":
        return 1;
      case "WAITING_FOR_DOCUMENTATION":
        return 2;
      case "COMPLETED":
        return 3;
      case "REJECTED":
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(record.status);

  const steps = [
    { label: "Pending Request", date: record.requestDate, value: "PENDING" },
    { label: "On Progress", date: record.status !== "PENDING" ? record.updatedAt : null, value: "ON_PROGRESS" },
    { label: "Waiting Documentation", date: record.status === "WAITING_FOR_DOCUMENTATION" || record.status === "COMPLETED" ? record.updatedAt : null, value: "WAITING_FOR_DOCUMENTATION" },
    { label: "Completed", date: record.status === "COMPLETED" ? record.updatedAt : null, value: "COMPLETED" },
    { label: "Rejected", date: record.status === "REJECTED" ? record.updatedAt : null, value: "REJECTED" },
  ];

  return (
    <div className="w-full">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 -mt-4 hover:text-green-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </button>

      {/* Status Timeline */}
      <div className="py-2 px-4 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-4 mt-8">
        <h2 className="font-semibold font-poppins text-gray-800 text-center mb-4">Donation Status</h2>

        <div className="relative w-full px-4 md:px-8">
          <div className="absolute left-8 right-8 md:left-13 md:right-13 top-5 h-0.5 bg-gray-200 z-0" />

          <div className="relative z-10 flex items-center justify-between w-full overflow-x-auto">
            {steps.map((step, idx) => {
              const isRejectedRecord = record.status === "REJECTED";
              const isThisRejectedStep = step.value === "REJECTED";

              if (isThisRejectedStep && !isRejectedRecord) return null;
              if (isRejectedRecord && (step.value === "WAITING_FOR_DOCUMENTATION" || step.value === "COMPLETED")) return null;

              const isCompleted = !isRejectedRecord && idx < currentStep;
              const isCurrent = !isRejectedRecord && idx === currentStep;
              const isRejectedState = isRejectedRecord && isThisRejectedStep;
              const isCompletedDuringReject = isRejectedRecord && (step.value === "PENDING" || step.value === "ON_PROGRESS");

              return (
                <div key={idx} className="flex flex-col items-center px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isRejectedState
                        ? "bg-red-100 border-red-600 text-red-600"
                        : isCompleted || isCompletedDuringReject
                        ? "bg-green-100 border-green-600 text-green-600"
                        : isCurrent
                        ? "bg-yellow-100 border-yellow-500 text-yellow-600"
                        : "bg-gray-100 border-gray-400 text-gray-400"
                    }`}
                  >
                    {isRejectedState ? (
                      <CheckCircle2 className="w-5 h-5 rotate-45 text-red-600" />
                    ) : isCompleted || isCompletedDuringReject ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`mt-3 text-xs font-semibold ${isRejectedState ? "text-red-700" : "text-gray-900"}`}>
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(step.date)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Direct Upload Documentation Section (Tanpa Pop-up) */}
      {userType === "institution" && record.status === "WAITING_FOR_DOCUMENTATION" && (
        <div>
          <h2 className="font-semibold font-poppins text-gray-900 mb-1">Upload Documentation Photo</h2>
          <p className="text-xs text-gray-500 mb-2">
            Upload the required documentation for this donation.
          </p>
          
          <div className="space-y-4">
            <LocalImageUpload
              value={documentationPhoto}
              onChange={(url) => {
                setDocumentationPhoto(url);
                if (url) setDocumentationError("");
              }}
              folder="documentation"
              placeholder="Upload documentation photo *"
            />
            
            {documentationError && (
              <p className="text-xs text-red-600 font-medium">{documentationError}</p>
            )}

            <div className="w-full">
              <button
                onClick={() => handleUploadDocumentationSubmit(record.id)}
                disabled={loadingId === record.id}
                className="mb-2 w-full py-2 bg-primary hover:bg-green-900 text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingId === record.id ? "Submitting..." : "Submit Photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Information */}
      <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-2 mt-4">
        <div className="space-y-4 max-w-3xl">
          {userType === "user" ? (
              <>
                <div className="mb-4 mt-12">
                  <h3 className="font-semibold font-poppins text-gray-900 text-md">
                    Donation Detail Information
                  </h3>
                </div>

                {[
                  { label: "Donation Title", value: record.title },
                  { label: "Category", value: CATEGORY_LABELS[record.category] || record.category },
                  { label: "Institution", value: record.institutionName },
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[180px_20px_1fr] items-center text-sm">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="text-gray-400">:</span>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </>
            ) : (
            <>
              <div className="mb-4 mt-12">
                <h3 className="font-semibold font-poppins text-gray-900 text-md">
                  User Detail Information
                </h3>
              </div>

              {[
                { label: "Name", value: record.donorName },
                { label: "Phone Number", value: record.phoneNumber },
                { label: "City", value: record.city },
                { label: "State", value: record.state },
                { label: "ZIP Code", value: record.zipCode },
                { label: "Address", value: record.address },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-[180px_20px_1fr] items-center text-sm">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="text-gray-400">:</span>
                  <span className="font-semibold text-gray-900">{item.value || "-"}</span>
                </div>
              ))}
            </>
          )}

          <div className="grid grid-cols-[180px_20px_1fr] items-center text-sm">
            <span className="text-gray-600 font-medium">Quantity</span>
            <span className="text-gray-400">:</span>
            <span className="font-semibold text-gray-900">{record.quantity} items</span>
          </div>

          {record.notes && (
            <div className="grid grid-cols-[180px_20px_1fr] items-start text-sm">
              <span className="text-gray-600 font-medium pt-0.5">Note</span>
              <span className="text-gray-400 pt-0.5">:</span>
              <span className="font-semibold text-gray-900">{record.notes}</span>
            </div>
          )}

          {(record.donorPhoto || record.documentationPhoto) && (
            <div className="grid grid-cols-[180px_20px_1fr] items-start text-sm pt-2">
              <span className="text-gray-600 font-medium pt-1">Photos</span>
              <span className="text-gray-400 pt-1">:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {record.donorPhoto && (
                  <div>
                    <Image
                      src={record.donorPhoto}
                      alt="Donor item"
                      width={640}
                      height={160}
                      className="w-full h-40 object-cover rounded-sm border border-gray-200"
                    />
                  </div>
                )}
                {record.documentationPhoto && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Documentation Photo</p>
                    <Image
                      src={record.documentationPhoto}
                      alt="Documentation"
                      width={640}
                      height={160}
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-[180px_20px_1fr] items-center text-sm pt-2">
            <span className="text-gray-600 font-medium">Delivery Methods</span>
            <span className="text-gray-400">:</span>
            <span className="font-semibold text-gray-900">{DELIVERY_METHOD_LABELS[record.deliveryMethod] || record.deliveryMethod}</span>
          </div>

          {record.estimatedPickupDate && (
            <>
              <div className="grid grid-cols-[180px_20px_1fr] items-center text-sm">
                <span className="text-gray-600 font-medium">Estimate Date</span>
                <span className="text-gray-400">:</span>
                <span className="font-semibold text-gray-900">{record.estimatedPickupDate}</span>
              </div>
              {record.estimatedPickupTime && (
                <div className="grid grid-cols-[180px_20px_1fr] items-center text-sm">
                  <span className="text-gray-600 font-medium">Estimate Time</span>
                  <span className="text-gray-400">:</span>
                  <span className="font-semibold text-gray-900">{record.estimatedPickupTime}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons - Institution Only */}
      {userType === "institution" && (
        <div className="flex w-full gap-2 mt-8">
          {record.status === "PENDING" && (
            <>
              <button
                onClick={() => handleApprove(record.id)}
                disabled={loadingId === record.id}
                className="flex-1 px-9 py-2 bg-primary hover:bg-green-900 text-white font-semibold text-sm rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingId === record.id ? "Accepting..." : "Accept Request"}
              </button>

              <button
                onClick={() => setRejectingId(record.id)}
                disabled={loadingId === record.id}
                className="flex-1 px-9 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                Reject
              </button>
            </>
          )}

          {record.status === "ON_PROGRESS" && (
            <>
              <button
                onClick={() => setConfirmingDoneId(record.id)}
                disabled={loadingId === record.id}
                className="flex-1 px-5 py-2 bg-primary hover:bg-green-900 text-white font-semibold text-sm rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingId === record.id ? "Updating..." : "Mark as done"}
              </button>

              <button
                onClick={() => setRejectingFromProgressId(record.id)}
                disabled={loadingId === record.id}
                className="flex-1 px-5 py-2 rounded-sm bg-red-600 font-inter text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancel Donation
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal Reject Request */}
      <RejectModal
        isOpen={Boolean(rejectingId)}
        onClose={() => setRejectingId(null)}
        title="Reject Donation Request"
        description="Please state the reason for rejecting this donation request. An email notification will be sent to the donor."
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onSubmit={() => handleRejectSubmit(rejectingId!)}
        isLoading={loadingId === rejectingId}
        placeholder="e.g. Items requested do not match our current needs..."
      />

      {/* Modal Reject dari Progress */}
      <RejectModal
        isOpen={Boolean(rejectingFromProgressId)}
        onClose={() => setRejectingFromProgressId(null)}
        title="Reject Donation"
        description="Please state the reason for rejecting this donation. An email notification will be sent to the donor."
        reason={rejectionFromProgressReason}
        onReasonChange={setRejectionFromProgressReason}
        onSubmit={() => handleRejectFromProgressSubmit(rejectingFromProgressId!)}
        isLoading={loadingId === rejectingFromProgressId}
        placeholder="e.g. Items do not match requirements..."
      />

      {/* Modal Konfirmasi Mark as Done */}
      {confirmingDoneId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmingDoneId(null)}
        >
          <div
            className="w-full max-w-md rounded-sm border border-gray-100 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">Mark as Done?</h3>
            <p className="mb-4 mt-1 text-xs leading-relaxed text-gray-500">
              Are you sure the donation has arrived? This will move the request to the documentation stage.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleMarkDone(confirmingDoneId);
                  setConfirmingDoneId(null);
                }}
                disabled={loadingId === confirmingDoneId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-primary px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-900 disabled:opacity-50"
              >
                {loadingId === confirmingDoneId ? "Updating..." : "Yes, Mark as Done"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDoneId(null)}
                className="cursor-pointer rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetailClient;