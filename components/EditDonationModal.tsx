"use client";

import React, { useState, useEffect } from "react";
import { X, Edit2, Loader2, Check } from "lucide-react";

interface EditDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: string | null;
  initialTarget: number;
  initialDescription: string;
  initialDeliveryMethods: string[];
  initialHasPickupService: boolean;
  initialPickupMaxDistanceKm: number | null;
  onSave: () => void;
}

export default function EditDonationModal({
  isOpen,
  onClose,
  donationId,
  initialTarget,
  initialDescription,
  initialDeliveryMethods,
  initialHasPickupService,
  initialPickupMaxDistanceKm,
  onSave,
}: EditDonationModalProps) {
  const [target, setTarget] = useState(initialTarget.toString());
  const [description, setDescription] = useState(initialDescription);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(initialDeliveryMethods);
  const [pickupMaxDistanceKm, setPickupMaxDistanceKm] = useState(initialPickupMaxDistanceKm?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTarget(initialTarget.toString());
      setDescription(initialDescription);
      setSelectedMethods(initialDeliveryMethods);
      setPickupMaxDistanceKm(initialPickupMaxDistanceKm?.toString() || "");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialTarget, initialDescription, initialDeliveryMethods, initialPickupMaxDistanceKm]);

  if (!isOpen) return null;

  const handleMethodToggle = (method: "self_delivery" | "third_party_courier" | "pickup_by_institution") => {
    let updated: string[];
    if (selectedMethods.includes(method)) {
      if (selectedMethods.length === 1) return;
      updated = selectedMethods.filter((m) => m !== method);
    } else {
      updated = [...selectedMethods, method];
    }
    setSelectedMethods(updated);
  };

  const hasPickup = selectedMethods.includes("pickup_by_institution");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetNumber = parseInt(target);
    if (isNaN(targetNumber) || targetNumber <= 0) {
      setError("Quantity must be a valid positive number.");
      return;
    }

    if (hasPickup && (!pickupMaxDistanceKm || parseInt(pickupMaxDistanceKm) <= 0)) {
      setError("Please enter a valid pickup distance.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/donations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId,
          target: targetNumber,
          description: description.trim(),
          deliveryMethods: selectedMethods,
          hasPickupService: hasPickup,
          pickupMaxDistanceKm: hasPickup ? parseInt(pickupMaxDistanceKm) : null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSave();
        }, 1200);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update donation.");
      }
    } catch (error) {
      setError("Failed to update donation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div
        className="bg-white w-full max-w-lg rounded-sm p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in animate-fade-in zoom-in-95 duration-200"
        style={{ padding: "18px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              Edit Donation Information
            </h2>
            <p className="text-xs text-gray-500">
              Update quantity required and description for this donation.
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-gray-900">Donation Updated Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div
              className="mb-5 flex flex-col gap-1.5"
              style={{ marginBottom: "4px" }}
            >
              <label className="font-inter text-[13.5px] font-semibold text-gray-700" style={{ marginTop: "12px" }}>Quantity Required</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter quantity"
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 text-sm"
                min="1"
                required
              />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description or additional notes"
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-22.5 py-2.5 resize-none text-sm"
              />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Delivery Methods Available</label>
              <p className="text-xs text-gray-500">Check at least 1</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-normal text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes("self_delivery")}
                    onChange={() => handleMethodToggle("self_delivery")}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-green-900 text-green-800 focus:ring-green-800"
                  />
                  <span>Self Delivery (Donor delivers to institution)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-sm font-normal text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes("third_party_courier")}
                    onChange={() => handleMethodToggle("third_party_courier")}
                    className="w-4 h-4 rounded border-gray-300 accent-green-900 text-green-800 focus:ring-green-800"
                  />
                  <span>Third Party Courier Service</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-sm font-normal text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes("pickup_by_institution")}
                    onChange={() => handleMethodToggle("pickup_by_institution")}
                    className="w-4 h-4 rounded border-gray-300 accent-green-900 text-green-800 focus:ring-green-800"
                  />
                  <span>Pickup Service by Institution</span>
                </label>
              </div>
            </div>

            {hasPickup && (
              <div className="mb-5 bg-gray-50 rounded-sm border border-gray-200 p-3 flex flex-col gap-1.5">
                <label className="font-inter text-[13.5px] font-semibold text-gray-600">
                  Max Pickup Distance (km)
                </label>
                <input
                  type="number"
                  value={pickupMaxDistanceKm}
                  onChange={(e) => setPickupMaxDistanceKm(e.target.value)}
                  min={1}
                  max={100}
                  placeholder="e.g. 5"
                  className="w-full rounded-sm border-[1.5px] border-outline bg-white px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                />
              </div>
            )}

            <div className="pt-3 flex gap-2 justify-end border-t border-gray-100">
              <button
                type="submit"
                className="font-medium text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                style={{ width: "auto", padding: "10px 24px" }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50"
                style={{ padding: "10px 24px" }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
