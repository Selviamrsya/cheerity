"use client";

import React, { useState } from "react";
import { Edit2, FileText, ExternalLink, Info, Loader2, Eye, EyeOff } from "lucide-react";

interface Institution {
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
  status: string | null;
}

interface InstitutionProfileFormProps {
  institution: Institution;
}

const InstitutionProfileForm: React.FC<InstitutionProfileFormProps> = ({
  institution,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    institutionName: institution.institutionName,
    email: institution.email,
    phoneNumber: institution.phoneNumber || "",
    websiteOrSocial: institution.websiteOrSocial || "",
    description: institution.description || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    // Validate required fields
    if (!formData.phoneNumber) {
      setMessage({
        type: "error",
        text: "Phone number is required.",
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/institution/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: "Institution profile updated successfully!",
      });
      setIsEditing(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      institutionName: institution.institutionName,
      email: institution.email,
      phoneNumber: institution.phoneNumber || "",
      websiteOrSocial: institution.websiteOrSocial || "",
      description: institution.description || "",
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/institution/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordSection(false);
        setPasswordMessage(null);
      }, 2000);
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage(null);
    setShowPasswordSection(false);
  };

  return (
    <div className="w-full space-y-2">
      {/* Data Rows Container */}
      <div>
        {/* Institution Name */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Institution Name</span>
          <div className="flex items-start sm:items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main font-bold pt-1 sm:pt-0">
                {institution.institutionName}
              </span>
            ) : (
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) =>
                  setFormData({ ...formData, institutionName: e.target.value })
                }
                className="flex-1 w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                style={{ padding: "8px" }}
                required
              />
            )}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 text-xs font-semibold text-gray-500 hover:text-green-800 cursor-pointer"
                style={{ padding: "8px 12px" }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Email</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main">{institution.email}</span>
            ) : (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="flex-1 w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                style={{ padding: "8px" }}
                required
              />
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Phone Number <span className="text-red-500">*</span></span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main">{institution.phoneNumber || "-"}</span>
            ) : (
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="e.g. +628123456789"
                className="flex-1 w-full border border-gray-300 rounded-sm bg-white text-sm font-sans focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 placeholder:text-gray-400 placeholder:font-normal"
                style={{ padding: "8px" }}
                required
              />
            )}
          </div>
        </div>

        {/* Website / Social */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Official Website / Social Media</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main">
                {institution.websiteOrSocial ? (
                  <a
                    href={institution.websiteOrSocial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-800 underline inline-flex items-center gap-1"
                  >
                    {institution.websiteOrSocial}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  "-"
                )}
              </span>
            ) : (
              <input
                type="url"
                value={formData.websiteOrSocial}
                onChange={(e) =>
                  setFormData({ ...formData, websiteOrSocial: e.target.value })
                }
                placeholder="https://..."
                className="flex-1 w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                style={{ padding: "8px" }}
              />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3" style={isEditing ? { alignItems: "flex-start" } : {}}>
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase" style={isEditing ? { paddingTop: "8px" } : {}}>
            Description
          </span>
          <div className="flex items-center justify-between gap-4 w-full" style={{ color: "var(--color-on-surface)" }}>
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main whitespace-pre-line">
                {institution.description || "No description provided."}
              </span>
            ) : (
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description about your institution..."
                className="flex-1 w-full border border-gray-300 rounded-sm bg-white text-sm font-sans focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 placeholder:text-gray-400 placeholder:font-normal resize-y"
                style={{ padding: "8px" }}
              />
            )}
          </div>
        </div>

        {/* Address (read-only) */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3" style={{ alignItems: "flex-start" }}>
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase" style={{ paddingTop: "8px" }}>Address</span>
          <div className="space-y-2 w-full">
            <div className="w-full rounded-sm text-sm font-sans" style={{ padding: "8px" }}>
              {institution.address || "-"}
            </div>
            {(institution.city || institution.state || institution.zipCode) && (
              <div className="w-full rounded-sm text-sm font-sans" style={{ padding: "8px" }}>
                {[institution.city, institution.state, institution.zipCode]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </div>
            )}
          </div>
        </div>

        {/* Verification Evidence (read-only) */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3" style={{ alignItems: "flex-start" }}>
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase" style={{ paddingTop: "8px" }}>Verification Evidence</span>
          <div className="space-y-2 w-full">
            <div className="w-full text-sm font-sans" style={{ padding: "8px" }}>
              {institution.verificationEvidence ? (
                <a
                  href={institution.verificationEvidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Verified Document</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-sm text-gray-400">No document attached</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Actions */}
      {isEditing && (
        <div className="pt-4 border-t border-gray-100">
          {message && (
            <div
              className={`p-3 rounded-sm ${message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
                }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2 justify-end" style={{ paddingTop: "18px" }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="font-medium text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
              style={{ width: "auto", padding: "10px 24px" }}
            >
            {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save changes"
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
              style={{ padding: "10px 24px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ====== CHANGE PASSWORD SECTION ====== */}
      <div>
        {!showPasswordSection ? (
          <button
            type="button"
            onClick={() => setShowPasswordSection(true)}
            className="text-sm font-semibold text-gray-500 hover:text-green-800 transition-colors cursor-pointer"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-700 mt-6">Change Password</h3>

            {/* Current Password */}
            <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
              <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Current Password</span>
              <div className="relative flex-1">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 pr-9"
                  style={{ padding: "8px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
              <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">New Password</span>
              <div className="relative flex-1">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 pr-9"
                  style={{ padding: "8px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
              <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Confirm Password</span>
              <div className="relative flex-1">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 pr-9"
                  style={{ padding: "8px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`rounded-sm text-xs ${passwordMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                style={{ padding: "12px 16px", marginBottom: "16px" }}
              >
                {passwordMessage.text}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-1.5 font-inter text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
              <button
                onClick={handleCancelPassword}
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-outline bg-white px-4 py-1.5 font-inter text-sm font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-sm text-sm text-gray-600 border border-yellow-200" style={{ padding: "18px 20px", marginTop: "18px" }}>
        <Info className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-gray-800">
            Address changes are not allowed. For verified information changes, please contact the administrator.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Send an email to{" "}
            <a
              href="mailto:admin@cheerity.com"
              className="text-yellow-800 font-bold underline hover:text-gray-900"
            >
              admin@cheerity.com
            </a>{" "}
            and our team will assist you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionProfileForm;