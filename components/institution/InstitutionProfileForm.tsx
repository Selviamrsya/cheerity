"use client";

import React, { useState } from "react";
import { Edit2, Save, X, Lock, FileText, ExternalLink, Info } from "lucide-react";

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

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/institution/update", {
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

  return (
    <div className="space-y-6 w-full">
      {/* Header controls */}
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
              Institution Name
            </label>
            <input
              type="text"
              value={formData.institutionName}
              onChange={(e) =>
                setFormData({ ...formData, institutionName: e.target.value })
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="e.g. +628123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Official Website / Social Media
            </label>
            <input
              type="url"
              value={formData.websiteOrSocial}
              onChange={(e) =>
                setFormData({ ...formData, websiteOrSocial: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description about your institution..."
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ padding: "8px", margin: "4px 0 2px 0" }}
            />
          </div>

          {/* Locked / Read-Only Fields */}
          <div className="pt-2 border-t border-gray-100 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <span>Address</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> (Cannot be changed)
                </span>
              </div>
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500"
                style={{ padding: "8px", margin: "4px 0 8px 0" }}
              >
                {institution.address || "-"}
                {institution.city || institution.state || institution.zipCode ? (
                  <p className="text-xs text-gray-400 mt-1">
                    {[institution.city, institution.state, institution.zipCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <span>Verification Evidence</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> (Cannot be changed)
                </span>
              </div>
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500 flex items-center justify-between"
                style={{ padding: "8px", margin: "4px 0 8px 0" }}
              >
                {institution.verificationEvidence ? (
                  <a
                    href={institution.verificationEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Verified Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No document attached</span>
                )}
              </div>
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
              Institution Name
            </label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700 font-medium"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {institution.institutionName}
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
              {institution.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {institution.phoneNumber || "-"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Official Website / Social Media
            </label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
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
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700 whitespace-pre-line"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {institution.description || "No description provided."}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <span>Address</span>
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> (Read-only)
              </span>
            </div>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {institution.address || "-"}
              {institution.city || institution.state || institution.zipCode ? (
                <p className="text-xs text-gray-500 mt-1">
                  {[institution.city, institution.state, institution.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <span>Verification Evidence</span>
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> (Read-only)
              </span>
            </div>
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-700"
              style={{ padding: "8px", margin: "4px 0 8px 0" }}
            >
              {institution.verificationEvidence ? (
                <div className="space-y-2">
                  <a
                    href={institution.verificationEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Verified Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <span className="text-xs text-gray-400">No document attached</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional note as requested */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3 p-4 bg-gray-50 rounded-sm text-sm text-gray-600">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-gray-800">
            For account status or verified information changes, please contact the administrator.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Send an email to{" "}
            <a
              href="mailto:admin@cheerity.com"
              className="text-green-800 font-bold underline hover:text-green-900"
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
