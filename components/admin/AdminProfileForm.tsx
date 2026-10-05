"use client";

import React, { useState } from "react";
import { Edit2, Loader2, Eye, EyeOff } from "lucide-react";

interface AdminUser {
  id: string;
  fullName: string | null;
  email: string;
  role: string | null;
}

interface AdminProfileFormProps {
  user: AdminUser;
}

const AdminProfileForm: React.FC<AdminProfileFormProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email,
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

    try {
      const response = await fetch("/api/admin/profile", {
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
        text: "Admin profile updated successfully!",
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
      fullName: user.fullName || "",
      email: user.email,
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/user/change-password", {
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
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100"
        style={{ paddingBottom: "8px" }}
      >
        <div>
          <h1 className="mb-1 font-poppins text-[22px] font-medium tracking-tight text-text-main md:text-[26px]">Admin Profile</h1>
        </div>
      </div>

      {/* Data Rows */}
      <div>
        {/* Full Name */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Full Name</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main font-bold">
                {user.fullName}
              </span>
            ) : (
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="flex-1 border border-gray-300 rounded-sm bg-white text-gray-900 text-sm font-sans placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800"
                style={{ padding: "8px" }}
                required
              />
            )}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-6 py-3 text-xs font-semibold text-gray-500 hover:text-green-800 cursor-pointer"
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
              <span className="text-[13.5px] font-medium text-text-main">
                {user.email}
              </span>
            ) : (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="flex-1 border border-gray-300 rounded-sm bg-white text-gray-900 text-sm font-sans placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800"
                style={{ padding: "8px" }}
                required
              />
            )}
          </div>
        </div>

        {/* Role */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Role</span>
          <span className="text-[13.5px] font-medium text-text-main">Administrator</span>
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
                  <span>Saving information...</span>
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
            className="text-xs font-semibold text-gray-500 hover:text-green-800 transition-colors cursor-pointer"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mt-6">Change Password</h3>

          {/* Current Password */}
            <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
              <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Current Password</span>
              <div className="relative flex-1">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full border border-gray-300 rounded-sm bg-white text-gray-900 text-sm font-sans focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 placeholder:text-gray-400 placeholder:font-normal pr-9"
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
                  className="w-full border border-gray-300 rounded-sm bg-white text-gray-900 text-sm font-sans focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 placeholder:text-gray-400 placeholder:font-normal pr-9"
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
                  className="w-full border border-gray-300 rounded-sm bg-white text-gray-900 text-sm font-sans focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 placeholder:text-gray-400 placeholder:font-normal pr-9"
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
                className="font-medium text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                style={{ width: "auto", padding: "10px 24px" }}
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
  );
};

export default AdminProfileForm;
