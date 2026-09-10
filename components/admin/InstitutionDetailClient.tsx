"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveInstitution, rejectInstitution } from "@/lib/actions/admin";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface InstitutionDetailClientProps {
  institution: {
    id: string;
    institutionName: string;
    email: string;
    phoneNumber: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    address: string | null;
    verificationEvidence: string | null;
    websiteOrSocial: string | null;
    description: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | null;
    createdAt: Date | null;
  };
}

const InstitutionDetailClient: React.FC<InstitutionDetailClientProps> = ({
  institution,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setActionType("approve");
    setErrorMsg(null);
    const res = await approveInstitution(institution.id);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Failed to approve institution.");
    }
  };

  const handleRejectSubmit = async () => {
    setIsSubmitting(true);
    setActionType("reject");
    setErrorMsg(null);
    const res = await rejectInstitution(institution.id, rejectionReason);
    setIsSubmitting(false);
    setRejectModalOpen(false);

    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Failed to reject institution.");
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="admin-badge admin-badge-pending">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="admin-badge admin-badge-approved">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="admin-badge admin-badge-rejected">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const registrationDate = institution.createdAt
    ? new Date(institution.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home</span>
      </Link>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs border border-red-200 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Details Card */}
      <div className="admin-detail-card">
        {/* Header with Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="admin-title">
              Detail Institusi
            </h1>
            <p className="admin-subtitle">
              ID: {institution.id}
            </p>
          </div>

          <div>{getStatusBadge(institution.status)}</div>
        </div>

        {/* Clean Key-Value Data Rows */}
        <div>
          <div className="admin-detail-row">
            <span className="admin-detail-label">Registration Date</span>
            <span className="admin-detail-value">{registrationDate}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Institution Name</span>
            <span className="admin-detail-value font-bold">{institution.institutionName}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Email</span>
            <span className="admin-detail-value">{institution.email}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Phone Number</span>
            <span className="admin-detail-value">{institution.phoneNumber || "-"}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Location</span>
            <span className="admin-detail-value">
              {[institution.city, institution.state, institution.zipCode].filter(Boolean).join(", ") || "-"}
            </span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Address</span>
            <span className="admin-detail-value">
              {institution.address || "-"}
            </span>
          </div>

          {institution.websiteOrSocial && (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Website / Social</span>
              <a
                href={institution.websiteOrSocial}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-detail-value text-green-800 underline inline-flex items-center gap-1.5"
              >
                <span>{institution.websiteOrSocial}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="admin-detail-row">
            <span className="admin-detail-label">Description</span>
            <p className="admin-detail-value text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {institution.description || "Tidak ada deskripsi yang dicantumkan."}
            </p>
          </div>

          {/* Verification Evidence */}
          <div className="admin-detail-row items-start">
            <span className="admin-detail-label">Verification Evidence</span>
            <div className="space-y-3">
              {institution.verificationEvidence ? (
                <div className="space-y-2">
                  <div className="rounded-2xl border border-gray-200 overflow-hidden max-w-sm bg-gray-50 shadow-2xs">
                    <img
                      src={institution.verificationEvidence}
                      alt="Verification Evidence"
                      className="w-full max-h-72 object-cover"
                    />
                  </div>
                  <a
                    href={institution.verificationEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-green-800 hover:text-green-950 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buka Berkas Ukuran Penuh</span>
                  </a>
                </div>
              ) : (
                <span className="text-gray-400 text-xs">There are no documents attached.</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Accept or Reject */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          {institution.status === "PENDING" ? (
            <>
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                disabled={isSubmitting}
                className="admin-btn-reject w-full sm:w-auto"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="admin-btn-accept w-full sm:w-auto justify-center"
              >
                {isSubmitting && actionType === "approve" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  "Accept"
                )}
              </button>
            </>
          ) : (
            <div className="text-xs text-gray-500 font-medium">
              This institution has {" "}
              <strong className="text-gray-800">{institution.status}</strong> status. 
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              Reject Institution Registration
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Input the reason for the application rejection. An email notification will be automatically sent to the institution.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Example: The operational document has expired...."
              className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-800 resize-none"
            />

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting && actionType === "reject" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  "Confirm rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionDetailClient;
