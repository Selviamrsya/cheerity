"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  approveInstitution,
  rejectInstitution,
  updateInstitutionAddress,
  toggleInstitutionAccountStatus,
} from "@/lib/actions/admin";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
  Edit2,
  MapPin,
  Power,
  PowerOff,
  AlertTriangle,
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
    latitude?: number | null;
    longitude?: number | null;
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
  const [actionType, setActionType] = useState<string | null>(null);

  // Address edit modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressData, setAddressData] = useState({
    address: institution.address || "",
    city: institution.city || "",
    state: institution.state || "",
    zipCode: institution.zipCode || "",
  });

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Toggle status confirmation modal
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"APPROVED" | "REJECTED" | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Current display data for address (updated upon save)
  const [currentAddress, setCurrentAddress] = useState({
    address: institution.address,
    city: institution.city,
    state: institution.state,
    zipCode: institution.zipCode,
  });

  const [currentStatus, setCurrentStatus] = useState(institution.status);

  // Approve action (for pending review)
  const handleApprove = async () => {
    setIsSubmitting(true);
    setActionType("approve");
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await approveInstitution(institution.id);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentStatus("APPROVED");
      setSuccessMsg("Institusi berhasil disetujui dan diaktifkan.");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Failed to approve institution.");
    }
  };

  // Reject action (for pending review)
  const handleRejectSubmit = async () => {
    setIsSubmitting(true);
    setActionType("reject");
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await rejectInstitution(institution.id, rejectionReason);
    setIsSubmitting(false);
    setRejectModalOpen(false);

    if (res.success) {
      setCurrentStatus("REJECTED");
      setSuccessMsg("Institusi telah ditolak.");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Failed to reject institution.");
    }
  };

  // Save updated address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionType("updateAddress");
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateInstitutionAddress(institution.id, addressData);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentAddress({
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
      });
      setSuccessMsg("Alamat institusi berhasil diperbarui!");
      setAddressModalOpen(false);
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Gagal memperbarui alamat institusi.");
    }
  };

  // Toggle active/inactive account status
  const handleToggleStatusConfirm = async () => {
    if (!targetStatus) return;
    setIsSubmitting(true);
    setActionType("toggleStatus");
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await toggleInstitutionAccountStatus(institution.id, targetStatus);
    setIsSubmitting(false);
    setToggleModalOpen(false);

    if (res.success) {
      setCurrentStatus(targetStatus);
      setSuccessMsg(
        targetStatus === "APPROVED"
          ? "Akun institusi berhasil diaktifkan."
          : "Akun institusi berhasil dinonaktifkan."
      );
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Gagal mengubah status akun institusi.");
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
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        );
      case "REJECTED":
        return (
          <span className="admin-badge admin-badge-rejected">
            <XCircle className="w-3.5 h-3.5" /> Inactive
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
        href="/admin/institutions"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Institutions</span>
      </Link>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-sm text-xs border border-red-200 font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-sm text-xs border border-green-200 font-medium">
          {successMsg}
        </div>
      )}

      {/* Main Details Card */}
      <div className="admin-detail-card">
        {/* Header with Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="admin-title">Detail Institusi</h1>
            <p className="admin-subtitle">ID: {institution.id}</p>
          </div>

          <div>{getStatusBadge(currentStatus)}</div>
        </div>

        {/* Clean Key-Value Data Rows */}
        <div>
          <div className="admin-detail-row">
            <span className="admin-detail-label">Registration Date</span>
            <span className="admin-detail-value">{registrationDate}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Institution Name</span>
            <span className="admin-detail-value font-bold">
              {institution.institutionName}
            </span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Email</span>
            <span className="admin-detail-value">{institution.email}</span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Phone Number</span>
            <span className="admin-detail-value">
              {institution.phoneNumber || "-"}
            </span>
          </div>

          <div className="admin-detail-row">
            <span className="admin-detail-label">Location</span>
            <span className="admin-detail-value">
              {[currentAddress.city, currentAddress.state, currentAddress.zipCode]
                .filter(Boolean)
                .join(", ") || "-"}
            </span>
          </div>

          {/* Address row with Edit Address button */}
          <div className="admin-detail-row">
            <span className="admin-detail-label">Address</span>
            <div className="flex items-center justify-between gap-4 w-full">
              <span className="admin-detail-value">
                {currentAddress.address || "-"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAddressData({
                    address: currentAddress.address || "",
                    city: currentAddress.city || "",
                    state: currentAddress.state || "",
                    zipCode: currentAddress.zipCode || "",
                  });
                  setAddressModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50 rounded-sm border border-green-700 transition-colors cursor-pointer shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Alamat</span>
              </button>
            </div>
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
              {institution.description ||
                "Tidak ada deskripsi yang dicantumkan."}
            </p>
          </div>

          {/* Verification Evidence */}
          <div className="admin-detail-row items-start">
            <span className="admin-detail-label">Verification Evidence</span>
            <div className="space-y-3">
              {institution.verificationEvidence ? (
                <div className="space-y-2">
                  <div className="rounded-sm border border-gray-200 overflow-hidden max-w-sm bg-gray-50 shadow-2xs">
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
                <span className="text-gray-400 text-xs">
                  There are no documents attached.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Pending Review OR Activate / Deactivate Toggle */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-medium">
            Account Status:{" "}
            <strong className="text-gray-800">{currentStatus}</strong>
          </div>

          <div className="flex items-center gap-3">
            {currentStatus === "PENDING" && (
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
            )}

            {currentStatus === "APPROVED" && (
              <button
                type="button"
                onClick={() => {
                  setTargetStatus("REJECTED");
                  setToggleModalOpen(true);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Nonaktifkan Akun</span>
              </button>
            )}

            {currentStatus === "REJECTED" && (
              <button
                type="button"
                onClick={() => {
                  setTargetStatus("APPROVED");
                  setToggleModalOpen(true);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-700 text-white hover:bg-green-800 text-xs font-semibold rounded-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Aktifkan Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-sm p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-800" />
                <h3 className="text-base font-bold text-gray-900">
                  Ubah Alamat Institusi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alamat Lengkap (Jalan, Nomor, RT/RW, Kelurahan, Kecamatan)
                </label>
                <textarea
                  rows={3}
                  required
                  value={addressData.address}
                  onChange={(e) =>
                    setAddressData({ ...addressData, address: e.target.value })
                  }
                  placeholder="Contoh: Jl. Merdeka No. 45"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-green-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                    placeholder="Contoh: Jakarta Pusat"
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-green-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.state}
                    onChange={(e) =>
                      setAddressData({ ...addressData, state: e.target.value })
                    }
                    placeholder="Contoh: DKI Jakarta"
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-green-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={addressData.zipCode}
                  onChange={(e) =>
                    setAddressData({ ...addressData, zipCode: e.target.value })
                  }
                  placeholder="Contoh: 10110"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-green-800"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                Catatan: Koordinat peta (latitude & longitude) akan otomatis dihitung ulang menggunakan geocoding berdasarkan alamat yang Anda masukkan.
              </p>

              <div className="flex gap-2.5 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-green-800 hover:bg-green-900 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && actionType === "updateAddress" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan Alamat"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-sm p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Tolak Pendaftaran Institusi
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Masukkan alasan penolakan berkas. Email pemberitahuan akan otomatis dikirimkan ke pihak institusi.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Dokumen operasional telah kedaluwarsa...."
              className="w-full p-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-green-800 resize-none"
            />

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting && actionType === "reject" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menolak...</span>
                  </>
                ) : (
                  "Konfirmasi Penolakan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      {toggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-sm p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  targetStatus === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {targetStatus === "APPROVED"
                  ? "Aktifkan Akun Institusi?"
                  : "Nonaktifkan Akun Institusi?"}
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {targetStatus === "APPROVED"
                ? `Apakah Anda yakin ingin mengaktifkan akun institusi "${institution.institutionName}"? Institusi akan dapat masuk ke sistem dan mengelola donasi.`
                : `Apakah Anda yakin ingin menonaktifkan akun institusi "${institution.institutionName}"? Institusi tidak akan dapat login dan kampanye donasinya tidak akan ditampilkan ke publik.`}
            </p>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => setToggleModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleToggleStatusConfirm}
                disabled={isSubmitting}
                className={`px-5 py-2 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 ${
                  targetStatus === "APPROVED"
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting && actionType === "toggleStatus" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : targetStatus === "APPROVED" ? (
                  "Aktifkan"
                ) : (
                  "Nonaktifkan"
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
