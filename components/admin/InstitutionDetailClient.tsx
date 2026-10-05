"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  approveInstitution,
  rejectInstitution,
  updateInstitutionAddress,
} from "@/lib/actions/admin";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Loader2,
  Edit2,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";
import LocationFields from "@/components/LocationFields";

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

  // Address edit mode state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    address: institution.address || "",
    city: institution.city || "",
    state: institution.state || "",
    zipCode: institution.zipCode || "",
  });

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  // Reject action (for pending review) - performs DELETE
  const handleRejectSubmit = async () => {
    setIsSubmitting(true);
    setActionType("reject");
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await rejectInstitution(institution.id, rejectionReason);
    setIsSubmitting(false);
    setRejectModalOpen(false);

    if (res.success) {
      setSuccessMsg("Institusi telah ditolak dan dihapus dari database. Email tersebut sekarang bebas untuk Sign Up baru.");
      setTimeout(() => {
        router.push("/admin/institutions");
      }, 1500);
    } else {
      setErrorMsg(res.error ?? "Failed to reject institution.");
    }
  };

  // Save updated address
  const handleSaveAddress = async () => {
    if (!addressData.address.trim() || !addressData.city.trim() || !addressData.state.trim()) {
      setErrorMsg("Please fill out full address, province, and city.");
      return;
    }

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
      setIsEditingAddress(false);
      setSuccessMsg("Alamat institusi berhasil diperbarui!");
      router.refresh();
    } else {
      setErrorMsg(res.error ?? "Gagal memperbarui alamat institusi.");
    }
  };

  // Cancel address editing
  const handleCancelAddressEdit = () => {
    setAddressData({
      address: currentAddress.address || "",
      city: currentAddress.city || "",
      state: currentAddress.state || "",
      zipCode: currentAddress.zipCode || "",
    });
    setIsEditingAddress(false);
    setErrorMsg(null);
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
      <div className="flex w-full flex-col gap-6 px-0 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-0">
        {/* Header with Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100"
        >
          <div>
            <h1 className="mb-1 font-poppins text-[22px] font-medium tracking-tight text-text-main md:text-[26px]">Institution Detail</h1>
            <p className="font-inter text-[13.5px] leading-relaxed text-text-muted">ID: {institution.id}</p>
          </div>
        </div>

        {/* Clean Key-Value Data Rows */}
        <div>
          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Registration Date</span>
            <span className="text-[13.5px] font-medium text-text-main">{registrationDate}</span>
          </div>

          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Institution Name</span>
            <span className="text-[13.5px] font-medium text-text-main font-bold">
              {institution.institutionName}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Email</span>
            <span className="text-[13.5px] font-medium text-text-main">{institution.email}</span>
          </div>

          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Phone Number</span>
            <span className="text-[13.5px] font-medium text-text-main">
              {institution.phoneNumber || "-"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Location</span>
            <span className="text-[13.5px] font-medium text-text-main">
              {[currentAddress.city, currentAddress.state, currentAddress.zipCode]
                .filter(Boolean)
                .join(", ") || "-"}
            </span>
          </div>

          {/* Address row with inline editing */}
          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3 items-start">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Address</span>
            <div className="flex-1 w-full">
              {!isEditingAddress ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[13.5px] font-medium text-text-main">
                    {currentAddress.address || "-"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="inline-flex items-center gap-1.5 px-6 py-3 text-xs font-semibold text-gray-500 hover:text-green-800 cursor-pointer"
                    style={{ padding: "8px 12px" }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Change address</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  {errorMsg && (
                    <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                      {errorMsg}
                    </div>
                  )}

                  <LocationFields
                    stateValue={addressData.state}
                    cityValue={addressData.city}
                    zipCodeValue={addressData.zipCode}
                    onStateChange={(val) => setAddressData(prev => ({ ...prev, state: val }))}
                    onCityChange={(val) => setAddressData(prev => ({ ...prev, city: val }))}
                    onZipCodeChange={(val) => setAddressData(prev => ({ ...prev, zipCode: val }))}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px", marginTop: "8px" }}>
                      Full address
                    </label>
                    <textarea
                      rows={4}
                      value={addressData.address}
                      onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street name, house number, RT/RW, or another detailed information"
                      className="w-full border border-gray-300 rounded-sm bg-white text-gray-900 text-sm font-sans placeholder:text-gray-400 placeholder:font-normal"
                      style={{ padding: "8px" }}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={isSubmitting}
                      className="font-medium text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                      style={{ width: "auto", padding: "10px 24px" }}
                    >
                      {isSubmitting && actionType === "updateAddress" ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Saving information...</span>
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddressEdit}
                      disabled={isSubmitting}
                      className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                      style={{ padding: "10px 24px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {institution.websiteOrSocial && (
            <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
              <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Website / Social</span>
              <a
                href={institution.websiteOrSocial}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13.5px] font-medium text-text-main text-green-800 underline inline-flex items-center gap-1.5"
              >
                <span>{institution.websiteOrSocial}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Description</span>
            <p className="text-[13.5px] font-medium text-text-main text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {institution.description ||
                "Tidak ada deskripsi yang dicantumkan."}
            </p>
          </div>

          {/* Verification Evidence */}
          <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3 items-start">
            <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Verification Evidence</span>
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
                    <span>Open full-size file</span>
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

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500 font-medium">
              Account Status:{" "}
              <strong className="text-gray-800">{currentStatus}</strong>
            </div>


          </div>

          <div className="flex items-center gap-3">
            {currentStatus === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-md border border-danger-border bg-danger-bg px-6 py-2.5 font-inter text-[12.5px] font-medium text-danger transition-all hover:bg-danger-border w-full sm:w-auto"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md border-none bg-primary-800 px-6 py-2.5 font-inter text-[12.5px] font-medium text-surface transition-colors hover:bg-primary-900 w-full sm:w-auto justify-center"
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
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-sm p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Tolak Pendaftaran Institusi
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Masukkan alasan penolakan berkas. Email pemberitahuan akan otomatis dikirimkan ke pihak institusi. <strong>Setelah ditolak, seluruh data institusi akan dihapus dan email tersebut dapat digunakan kembali untuk pendaftaran baru.</strong>
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


    </div>
  );
};

export default InstitutionDetailClient;
