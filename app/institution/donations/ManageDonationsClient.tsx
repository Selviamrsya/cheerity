"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Eye, MoreVertical, Check } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

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
    <div className="space-y-8">
      <div className="institution-header">
        <div>
          <h1 className="institution-title">Manage Donations</h1>
          <p className="institution-subtitle">
            Overview of all donation campaigns uploaded by your institution.
          </p>
        </div>

        <Link
          href="/institution/newDonations"
          className="inline-flex items-center gap-1 justify-center text-white bg-green-800 hover:bg-green-900 font-semibold text-sm rounded-sm shadow-sm transition-colors"
          style={{ padding: "9px 18px" }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Donation</span>
        </Link>
      </div>

      {safeDonations.length === 0 ? (
        <div className="institution-table-card">
          <div className="py-16 text-center text-gray-400 space-y-2">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-semibold text-sm text-gray-700">
              No donations uploaded yet
            </p>
            <p className="text-xs text-gray-400">
              Start by adding your first donation campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="institution-table-card">
          <div className="institution-table-wrapper">
            <table className="institution-table">
              <thead>
                <tr>
                  <th className="institution-table-th">No</th>
                  <th className="institution-table-th">Title</th>
                  <th className="institution-table-th">Category</th>
                  <th className="institution-table-th">Collected</th>
                  <th className="institution-table-th">Delivery Option</th>
                  <th className="institution-table-th">Status</th>
                  <th className="institution-table-th">Date Created</th>
                  <th className="institution-table-th">Cover</th>
                  <th className="institution-table-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {safeDonations.map((d, index) => (
                  <tr key={d.id} className="institution-table-tr">
                    <td className="institution-table-td font-medium">{index + 1}</td>
                    <td className="institution-table-td font-bold">{d.title}</td>
                    <td className="institution-table-td">
                      {CATEGORY_LABELS[d.category] || d.category}
                    </td>
                    <td className="institution-table-td font-bold text-green-900">
                      {d.collected} / {d.target}
                    </td>
                    <td className="institution-table-td">
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
                    <td className="institution-table-td">
                      <span
                        className={`institution-badge ${
                          d.status === "ACTIVE"
                            ? "institution-badge-approved"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="institution-table-td text-xs">
                      {mounted && d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US') : "-"}
                    </td>
                    <td className="institution-table-td">
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
                    <td className="institution-table-td">
                      {mounted && (
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuClick(e, d.id)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
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
            className="fixed bg-white border border-gray-200 shadow-lg rounded-lg min-w-40 p-1.5 z-50"
            style={{
              top: `${actionMenu.position.top}px`,
              left: `${actionMenu.position.left}px`,
            }}
          >
            <button
              onClick={() => handleMarkAsDone(actionMenu.donationId!)}
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
    </div>
  );
};

export default ManageDonationsClient;