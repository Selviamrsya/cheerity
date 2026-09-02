"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationUploadSchema, DonationUploadInput } from "@/lib/validations";
import { createDonation } from "@/lib/actions/donation";
import LocalImageUpload from "@/components/LocalImageUpload";
import { DONATION_CATEGORIES } from "@/constants";

interface DonationUploadFormProps {
  institutionId: string;
}

const DonationUploadForm: React.FC<DonationUploadFormProps> = ({ institutionId }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedMethods, setSelectedMethods] = useState<string[]>(["self_delivery"]);

  const form = useForm<DonationUploadInput>({
    resolver: zodResolver(donationUploadSchema),
    defaultValues: {
      title: "",
      category: "shirt",
      target: 1,
      deliveryMethods: ["self_delivery"],
      hasPickupService: false,
      pickupMaxDistanceKm: undefined,
      description: "",
      cover: "",
    },
  });

  const handleMethodToggle = (method: "self_delivery" | "third_party_courier" | "pickup_by_institution") => {
    let updated: ("self_delivery" | "third_party_courier" | "pickup_by_institution")[];
    if (selectedMethods.includes(method)) {
      if (selectedMethods.length === 1) return; // Must keep at least one
      updated = selectedMethods.filter((m) => m !== method) as (
        | "self_delivery"
        | "third_party_courier"
        | "pickup_by_institution"
      )[];
    } else {
      updated = [...selectedMethods, method] as (
        | "self_delivery"
        | "third_party_courier"
        | "pickup_by_institution"
      )[];
    }

    setSelectedMethods(updated);
    form.setValue("deliveryMethods", updated, { shouldValidate: true });

    const hasPickup = updated.includes("pickup_by_institution");
    form.setValue("hasPickupService", hasPickup, { shouldValidate: true });
    if (!hasPickup) {
      form.setValue("pickupMaxDistanceKm", undefined);
    }
  };

  const hasPickup = selectedMethods.includes("pickup_by_institution");

  const onSubmit = async (data: DonationUploadInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createDonation({
        institutionId,
        title: data.title,
        category: data.category,
        description: data.description,
        cover: data.cover,
        target: data.target,
        deliveryMethods: data.deliveryMethods,
        hasPickupService: hasPickup,
        pickupMaxDistanceKm: data.pickupMaxDistanceKm,
      });

      if (result.success) {
        router.push("/institution/donations");
        router.refresh();
      } else {
        setErrorMessage(result.error ?? "Failed to upload donation.");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Donation Title *</label>
        <input
          type="text"
          placeholder="e.g. Baju Anak SD Layak Pakai"
          {...form.register("title")}
          className="form-input"
        />
        {form.formState.errors.title && (
          <p className="form-error">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label">Category *</label>
        <select {...form.register("category")} className="form-input">
          {DONATION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {form.formState.errors.category && (
          <p className="form-error">{form.formState.errors.category.message}</p>
        )}
      </div>

      {/* Total Donation Required */}
      <div className="form-group">
        <label className="form-label">Total Donation Required (target quantity, max 10,000) *</label>
        <input
          type="number"
          min={1}
          max={10000}
          {...form.register("target")}
          className="form-input"
        />
        {form.formState.errors.target && (
          <p className="form-error">{form.formState.errors.target.message}</p>
        )}
      </div>

      {/* Delivery Methods Available */}
      <div className="form-group">
        <label className="form-label">Delivery Methods Available (Check at least 1) *</label>
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={selectedMethods.includes("self_delivery")}
              onChange={() => handleMethodToggle("self_delivery")}
              className="w-4 h-4 rounded border-gray-300 text-green-800 focus:ring-green-800"
            />
            <span>Self Delivery (Donor delivers to institution)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={selectedMethods.includes("third_party_courier")}
              onChange={() => handleMethodToggle("third_party_courier")}
              className="w-4 h-4 rounded border-gray-300 text-green-800 focus:ring-green-800"
            />
            <span>Third Party Courier Service</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={selectedMethods.includes("pickup_by_institution")}
              onChange={() => handleMethodToggle("pickup_by_institution")}
              className="w-4 h-4 rounded border-gray-300 text-green-800 focus:ring-green-800"
            />
            <span>Pickup Service by Institution</span>
          </label>
        </div>
        {form.formState.errors.deliveryMethods && (
          <p className="form-error">{form.formState.errors.deliveryMethods.message}</p>
        )}
      </div>

      {/* Pickup max distance input if pickup selected */}
      {hasPickup && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-2">
          <label className="form-label text-green-900">Max Pickup Distance (km) *</label>
          <input
            type="number"
            min={1}
            max={100}
            placeholder="e.g. 5 (Maximum distance in km your institution can pick up)"
            {...form.register("pickupMaxDistanceKm")}
            className="form-input bg-white"
          />
          {form.formState.errors.pickupMaxDistanceKm && (
            <p className="form-error">{form.formState.errors.pickupMaxDistanceKm.message}</p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description about your donation *</label>
        <textarea
          rows={6}
          placeholder="Describe your donation request details, condition requirements, etc..."
          {...form.register("description")}
          className="form-input form-textarea"
        />
        {form.formState.errors.description && (
          <p className="form-error">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Cover Photo */}
      <div className="form-group">
        <label className="form-label">Cover Photo *</label>
        <LocalImageUpload
          value={form.watch("cover") ?? ""}
          onChange={(url) => form.setValue("cover", url, { shouldValidate: true })}
          folder="donations"
          placeholder="Upload donation cover image"
          error={form.formState.errors.cover?.message}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-green-800 hover:bg-green-900 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Uploading Donation..." : "Submit Donation Campaign"}
      </button>
    </form>
  );
};

export default DonationUploadForm;