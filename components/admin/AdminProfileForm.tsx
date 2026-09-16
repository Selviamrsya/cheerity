"use client";

import React, { useState } from "react";
import { Edit2, Save, X, Lock } from "lucide-react";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string | null;
}

interface AdminProfileFormProps {
  user: AdminUser;
}

const AdminProfileForm: React.FC<AdminProfileFormProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      fullName: user.fullName,
      email: user.email,
    });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-gray-900"
          style={{ marginTop: "18px", marginBottom: "8px" }}
        >
          {isEditing ? "Edit Profile" : "Profile Information"}
        </h2>
        {isEditing ? (
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-green-800 flex items-center gap-1 text-sm font-medium cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username / Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
              required
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <span>Role</span>
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> (Cannot be changed)
              </span>
            </div>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              Administrator
            </div>
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-(--color-primary) text-white rounded-sm hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              style={{ padding: "6px 48px" }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              style={{ padding: "6px 56px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username / Full Name
            </label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700 font-medium"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {user.fullName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {user.email}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <span>Role</span>
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> (Read-only)
              </span>
            </div>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              Administrator
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileForm;
