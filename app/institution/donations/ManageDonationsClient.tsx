"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Eye, MoreVertical, Check, Edit2 } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";
import EditDonationModal from "@/components/EditDonationModal";

interface Donation {
  id: string;
  title: string;
  category: string;
  collected: number;
  target: number;
  deliveryMethods: string[];
  status: string;
  createdAt: string | null;
  cover: string | null;
  description: string | null;
}

interface ManageDonationsClientProps {
  donations: Donation[];
}

const ManageDonationsClient = ({ donations }: ManageDonationsClientProps) => {
  const [imagePopup, setImagePopup] = useState<{ isOpen: boolean; imageUrl: string | null }>({
    isOpen: false,
    imageUrl: null,
  });
  const [actionMenu, setActionMenu] = useState<{ isOpen: boolean; donationId: string | null; position: { top: number; left: number } | null }>({
    isOpen: false,
    donationId: null,
    position: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; donationId: string | null; target: number; description: string }>({
    isOpen: false,
    donationId: null,
    target: 0,
    description: "",
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; donationId: string | null }>({
    isOpen: false,
    donationId: null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle undefined or null donations
  const safeDonations = donations || [];

  const handleMarkAsDone = async (donationId: string) => {
    try {
      const response = await fetch("/api/donations/mark-as-done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to mark donation as done");
      }
    } catch (error) {
      console.error("Error marking donation as done:", error);
      alert("Failed to mark donation as done");
    }
    setConfirmModal({ isOpen: false, donationId: null });
  };

  const openConfirmModal = (donationId: string) => {
    setConfirmModal({ isOpen: true, donationId });
    setActionMenu({ isOpen: false, donationId: null, position: null });
  };

  const handleEdit = (donation: Donation) => {
    setEditModal({
      isOpen: true,
      donationId: donation.id,
      target: donation.target,
      description: donation.description || "",
    });
    setActionMenu({ isOpen: false, donationId: null, position: null });
  };

  const handleMenuClick = (e: React.MouseEvent, donationId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenu({
      isOpen: true,
      donationId,
      position: {
        top: rect.bottom + 4,
        left: rect.right - 160, // Adjust to align right
      },
    });
  };

  const getDeliveryOptionDetails = (method: string) => {
    const details: Record<string, string> = {
      self_delivery: "Donor delivers items directly to institution location",
      third_party_courier: "Items shipped via courier service (JNE, GoSend, etc.)",
      pickup_by_institution: "Institution picks up items from donor location",
    };
    return details[method] || method;
  };

  return (
    <div className="space-y-2">
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Manage Donations</h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Overview of all donation campaigns uploaded by your institution.
          </p>
        </div>

        <Link
          href="/institution/newDonations"
          className="inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          style={{ padding: "9px 18px" }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Donation</span>
        </Link>
      </div>

      {safeDonations.length === 0 ? (
        <div className="relative flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">
          <div className="py-24 text-center text-gray-400 space-y-2" style={{ paddingTop: "80px" }}>
            <p className="font-semibold text-sm text-gray-700">
              No donations uploaded yet
            </p>
            <p className="text-xs text-gray-400">
              Start by adding your first donation campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">No</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Title</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Category</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Collected</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Delivery Option</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Status</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Date Created</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Cover</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {safeDonations.map((d, index) => (
                  <tr key={d.id} className="transition-colors hover:bg-bg-light">
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-medium">{index + 1}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-medium">{d.title}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {CATEGORY_LABELS[d.category] || d.category}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold text-green-900">
                      {d.collected} / {d.target}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      <div className="flex flex-wrap gap-1">
                        {d.deliveryMethods.slice(0, 3).map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md font-medium cursor-help relative group"
                            title={getDeliveryOptionDetails(m)}
                          >
                            {DELIVERY_METHOD_LABELS[m] || m}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {getDeliveryOptionDetails(m)}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                            </div>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold ${d.status === "ACTIVE"
                          ? "border border-success-border bg-success-bg text-success"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs">
                      {mounted && d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US') : "-"}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {mounted && d.cover ? (
                        <button
                          onClick={() => setImagePopup({ isOpen: true, imageUrl: d.cover })}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {mounted && (
                        <div className="relative">
                          {d.status === "COMPLETED" ? (
                            <span className="text-xs text-gray-400 italic">Completed</span>
                          ) : (
                            <button
                              onClick={(e) => handleMenuClick(e, d.id)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {mounted && imagePopup.isOpen && imagePopup.imageUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setImagePopup({ isOpen: false, imageUrl: null })}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <img
              src={imagePopup.imageUrl}
              alt="Donation cover"
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setImagePopup({ isOpen: false, imageUrl: null })}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Action Menu Dropdown - Fixed Position */}
      {mounted && actionMenu.isOpen && actionMenu.position && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActionMenu({ isOpen: false, donationId: null, position: null })}
          />
          <div
            className="fixed bg-white border border-gray-200 shadow-lg rounded-sm min-w-40 p-1.5 z-50"
            style={{
              top: `${actionMenu.position.top}px`,
              left: `${actionMenu.position.left}px`,
            }}
          >
            <button
              onClick={() => {
                const donation = safeDonations.find(d => d.id === actionMenu.donationId);
                if (donation) handleEdit(donation);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700 rounded-sm transition-colors"
              style={{
                paddingTop: "12px",
                paddingBottom: "12px",
                paddingLeft: "16px",
                paddingRight: "16px",
                gap: "12px"
              }}
            >
              <Edit2 className="w-4 h-4" />
              Edit Information
            </button>
            <button
              onClick={() => openConfirmModal(actionMenu.donationId!)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700 rounded-sm transition-colors"
              style={{
                paddingTop: "12px",
                paddingBottom: "12px",
                paddingLeft: "16px",
                paddingRight: "16px",
                gap: "12px"
              }}
            >
              <Check className="w-4 h-4" />
              Mark as Done
            </button>
          </div>
        </>
      )}

      {/* Edit Donation Modal */}
      <EditDonationModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, donationId: null, target: 0, description: "" })}
        donationId={editModal.donationId}
        initialTarget={editModal.target}
        initialDescription={editModal.description}
        onSave={() => window.location.reload()}
      />

      {/* Confirm Mark as Done Modal */}
      {mounted && confirmModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          style={{ padding: '32px' }}
          onClick={() => setConfirmModal({ isOpen: false, donationId: null })}
        >
          <div
            className="bg-white shadow-lg max-w-md w-full"
            style={{
              padding: '24px',
              borderRadius: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="font-semibold text-gray-900"
              style={{ fontSize: '20px', marginBottom: '4px' }}
            >
              Confirm Mark as Done
            </h3>
            <p
              className="text-gray-600"
              style={{
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: '1.6'
              }}
            >
              Are you sure you want to close this donation? This action cannot be undone.
            </p>
            <div
              className="flex justify-end"
              style={{ gap: '8px' }}
            >
              <button
                onClick={() => handleMarkAsDone(confirmModal.donationId!)}
                className="font-medium text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                style={{ width: "auto", padding: "10px 24px" }}
              >
                Close Donation
              </button>
              <button
                onClick={() => setConfirmModal({ isOpen: false, donationId: null })}
                className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                style={{ padding: "10px 24px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDonationsClient;