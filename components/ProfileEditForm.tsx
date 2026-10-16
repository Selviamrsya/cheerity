"use client";

import React, { useState } from "react";
import { Edit2, Loader2, Eye, EyeOff } from "lucide-react";
import LocationFields from "@/components/LocationFields";
import AddressSearch from "@/components/AddressSearch";
import MapPicker from "@/components/MapPicker";
import { ReverseGeocodeResult } from "@/lib/reverseGeocoding";

interface User {
  id: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  birthdate: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

interface ProfileEditFormProps {
  user: User;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    birthdate: user.birthdate || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    zipCode: user.zipCode || "",
    street: "",
    detailedAddress: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addressValid, setAddressValid] = useState(false);

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

    // Validate that a valid address is selected
    if (!addressValid) {
      setMessage({
        type: "error",
        text: "Please search and select a valid address from the suggestions for location services.",
      });
      setIsSaving(false);
      return;
    }

    if (!formData.city && !formData.state) {
      setMessage({
        type: "error",
        text: "Please provide at least city or state for location services.",
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressSelect = (data: {
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    setFormData(prev => ({
      ...prev,
      address: data.fullAddress,
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
    }));
    setAddressValid(true);
  };

  const handleMapAddressChange = (addressData: ReverseGeocodeResult) => {
    if (addressData.success) {
      setFormData(prev => ({
        ...prev,
        state: addressData.state,
        city: addressData.city,
        zipCode: addressData.zipCode,
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      birthdate: user.birthdate || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      street: "",
      detailedAddress: "",
      latitude: null,
      longitude: null,
    });
    setAddressValid(false);
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
      {/* Data Rows Container */}
      <div>
        {/* Email */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Email</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main">{user.email}</span>
            ) : (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                style={{ padding: "8px" }}
                required
              />
            )}
          </div>
        </div>

        {/* Full Name */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Full Name</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main font-bold">{user.fullName}</span>
            ) : (
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
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

        {/* Phone Number */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Phone Number</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main">{user.phoneNumber || "-"}</span>
            ) : (
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g. +628123456789"
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                style={{ padding: "8px" }}
              />
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">Date of Birth</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <span className="text-[13.5px] font-medium text-text-main">{user.birthdate || "-"}</span>
            ) : (
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                style={{ padding: "8px" }}
              />
            )}
          </div>
        </div>

        {/* Address section */}
        <div className="grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3" style={{ alignItems: "flex-start" }}>
          <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase" style={{ paddingTop: "8px" }}>Address</span>
          <div className="flex items-center justify-between gap-4 w-full">
            {!isEditing ? (
              <div className="space-y-2">
                <div className="w-full rounded-sm text-gray-700 text-sm font-sans" style={{ padding: "8px" }}>
                  {formData.address || "-"}
                </div>
                {(formData.city || formData.state || formData.zipCode) && (
                  <div className="w-full rounded-sm text-gray-700 text-sm font-sans" style={{ padding: "8px" }}>
                    {[formData.city, formData.state, formData.zipCode].filter(Boolean).join(", ") || "-"}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                    Search Address <span className="text-red-500">*</span>
                  </label>
                  <div className="rounded-sm border border-gray-300 bg-white focus-within:border-green-800 focus-within:ring-1 focus-within:ring-green-800">
                    <AddressSearch
                      onAddressSelect={handleAddressSelect}
                      onClear={() => setAddressValid(false)}
                      initialValue={formData.address}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Search and select your address from the suggestions. This is required for distance calculation and pickup services.
                  </p>
                </div>

                {formData.latitude && formData.longitude && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fine-tune Location
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Drag the red marker to adjust the exact location for precise pickup/delivery. Address fields will auto-update based on the pin location.
                    </p>
                    <MapPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={(lat, lng) => {
                        setFormData(prev => ({
                          ...prev,
                          latitude: lat,
                          longitude: lng,
                        }));
                      }}
                      onAddressChange={handleMapAddressChange}
                      height="300px"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detailed Address (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.detailedAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, detailedAddress: e.target.value }))}
                    placeholder="Additional details like landmark, gate color, building name, floor, etc."
                    className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                    style={{ padding: "8px" }}
                  />
                </div>

                <div className="bg-gray-100 p-3 rounded-sm">
                  <p className="text-xs text-gray-600 mb-2">Location details (auto-filled from address search, you can edit):</p>
                  <LocationFields
                    stateValue={formData.state}
                    cityValue={formData.city}
                    zipCodeValue={formData.zipCode}
                    onStateChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
                    onCityChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                    onZipCodeChange={(val) => setFormData(prev => ({ ...prev, zipCode: val }))}
                    onLocationChange={(location) => setFormData(prev => ({
                      ...prev,
                      state: location.state,
                      city: location.city,
                      zipCode: location.zipCode || "",
                    }))}
                    readOnly={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Mode Actions */}
      {isEditing && (
        <div className="pt-4 border-t border-gray-100">
          {message && (
            <div
              className={`rounded-sm ${message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
                }`}
              style={{ padding: "12px 16px", marginBottom: "16px" }}
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
            className="text-md font-semibold text-gray-500 hover:text-green-800 transition-colors cursor-pointer"
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
    </div>
  );
};

export default ProfileEditForm;