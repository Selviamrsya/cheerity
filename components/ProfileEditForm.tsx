"use client";

import React, { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import LocationFields from "./LocationFields";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  birthdate: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ProfileEditFormProps {
  user: User;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    phoneNumber: user.phoneNumber || "",
    birthdate: user.birthdate || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    zipCode: user.zipCode || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);

      // Refresh the page to show updated data
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

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      birthdate: user.birthdate || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
    });
    setIsEditing(false);
    setMessage(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900" style={{marginTop:"18px",marginBottom:"8px"}}>Edit Profile</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500 focus:outline-none"
              style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{padding:"8px 8px 8px 8px", margin:"4px 0 8px 0"}}
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{padding:"6px 0 0 6px", margin:"4px 0 2px 0"}}
            />
          </div>

          <LocationFields
            stateValue={formData.state}
            cityValue={formData.city}
            zipCodeValue={formData.zipCode}
            onStateChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
            onCityChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
            onZipCodeChange={(val) => setFormData(prev => ({ ...prev, zipCode: val }))}
            onLocationChange={(loc) => setFormData(prev => ({
              ...prev,
              state: loc.state,
              city: loc.city,
              zipCode: loc.zipCode ?? prev.zipCode,
            }))}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-(--color-primary) text-white rounded-sm hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{padding:"6px 48px"}}
            >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            style={{padding:"6px 56px"}}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900" style={{marginTop:"18px", marginBottom:"8px"}}>Profile Information</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-500 hover:text-green-800 flex items-center gap-1 text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
            {user.email}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
            {user.fullName}
          </div>
        </div>

        {user.phoneNumber && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.phoneNumber}
            </div>
          </div>
        )}

        {user.birthdate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.birthdate}
            </div>
          </div>
        )}

        {user.address && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.address}
            </div>
          </div>
        )}

        {user.city && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.city}
            </div>
          </div>
        )}

        {user.state && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.state}
            </div>
          </div>
        )}

        {user.zipCode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.zipCode}
            </div>
          </div>
        )}

        {/* Display coordinates if available */}
        {user.latitude && user.longitude && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Coordinates</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" style={{padding:"8px 0 8px 8px", margin:"4px 0 8px 0"}}>
              {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditForm;