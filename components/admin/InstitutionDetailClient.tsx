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
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileCheck,
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await approveInstitution(institution.id);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/admin/institutions");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Failed to approve institution.");
    }
  };

  const handleRejectSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await rejectInstitution(institution.id, rejectionReason);
    setIsSubmitting(false);
    setRejectModalOpen(false);

    if (res.success) {
      router.push("/admin/institutions");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Failed to reject institution.");
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "PENDING":
        return <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Pending Review</span>;
      case "APPROVED":
        return <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-green-100 text-green-800 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Approved</span>;
      case "REJECTED":
        return <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-red-100 text-red-800 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/institutions"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Verify Institutions</span>
      </Link>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Main Institution Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-2xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{institution.institutionName}</h1>
              <p className="text-xs text-gray-400">
                Applied on: {institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          <div>{getStatusBadge(institution.status)}</div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-green-700 flex-shrink-0" />
              <span className="font-medium">{institution.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-green-700 flex-shrink-0" />
              <span>{institution.phoneNumber || "-"}</span>
            </div>

            {institution.websiteOrSocial && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-green-700 flex-shrink-0" />
                <a
                  href={institution.websiteOrSocial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-800 underline truncate"
                >
                  {institution.websiteOrSocial}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{institution.address || "-"}</p>
                <p className="text-xs text-gray-400">
                  {[institution.city, institution.state, institution.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Institution Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {institution.description || "No description provided."}
          </p>
        </div>

        {/* Verification Evidence */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-green-800" />
            <span>Verification Evidence (Uploaded Document / Photo)</span>
          </h3>

          {institution.verificationEvidence ? (
            <div className="rounded-xl border border-gray-200 overflow-hidden max-w-md bg-gray-50">
              <img
                src={institution.verificationEvidence}
                alt="Verification Evidence"
                className="w-full max-h-80 object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No verification document attached.</p>
          )}
        </div>

        {/* Approve / Reject Buttons if PENDING */}
        {institution.status === "PENDING" && (
          <div className="pt-6 border-t border-gray-100 flex gap-4 justify-end">
            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              Reject Institution
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-800 hover:bg-green-900 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Approving..." : "Approve Institution"}
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setRejectModalOpen(false)} />
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h2 className="modal-title">Reject Institution Application</h2>
              <button onClick={() => setRejectModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Please enter the reason for rejecting this institution application. An email notification will be automatically sent to the institution.
              </p>

              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Verification document provided is blurry or invalid..."
                className="form-input form-textarea"
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstitutionDetailClient;
