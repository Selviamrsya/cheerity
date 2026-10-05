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
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Title */}
      <div className="mb-5 flex flex-col gap-1.5">
        <label className="font-inter text-[13.5px] font-semibold text-gray-700">Title *</label>
        <input
          type="text"
          placeholder="e.g. Baju Anak SD Layak Pakai"
          {...form.register("title")}
          className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-8 py-[11px] md:px-10 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
        />
        {form.formState.errors.title && (
          <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="mb-5 flex flex-col gap-1.5">
        <label className="font-inter text-[13.5px] font-semibold text-gray-700">Category *</label>
        <select {...form.register("category")} className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-8 py-[11px] md:px-10 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400">
          {DONATION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {form.formState.errors.category && (
          <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.category.message}</p>
        )}
      </div>

      {/* Total Donation Required */}
      <div className="mb-5 flex flex-col gap-1.5">
        <label className="font-inter text-[13.5px] font-semibold text-gray-700">Total Donation Required 
        </label>
        <p className="text-xs text-gray-500 mt-1.5">Maximum 10,000</p>
        <input
          type="number"
          min={1}
          max={10000}
          {...form.register("target")}
          className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-8 py-[11px] md:px-10 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
        />
        {form.formState.errors.target && (
          <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.target.message}</p>
        )}
      </div>

      {/* Delivery Methods Available */}
      <div className="mb-5 flex flex-col gap-1.5">
        <label className="font-inter text-[13.5px] font-semibold text-gray-700">Delivery Methods Available</label>
        <p className="text-xs text-gray-500 mt-1.5">Check at least 1</p>
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-normal text-gray-700">
            <input
              type="checkbox"
              checked={selectedMethods.includes("self_delivery")}
              onChange={() => handleMethodToggle("self_delivery")}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-green-900 text-green-800 focus:ring-green-800"
            />
            <span> Self Delivery (Donor delivers to institution)</span>
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
        {form.formState.errors.deliveryMethods && (
          <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.deliveryMethods.message}</p>
        )}
      </div>

      {/* Pickup max distance input if pickup selected */}
      {hasPickup && (
        <div 
          className="bg-green-50 rounded-sm border border-green-200"
          style={{ 
            padding: "12px", // Memberi jarak lega 24px dari teks ke garis hijau
            marginTop: "-8px", // Jarak dari checkbox di atasnya
            display: "flex", 
            flexDirection: "column", 
            gap: "2px",
            marginBottom:"18px"
          }}
        >
          <label 
            className="font-inter text-[13.5px] font-semibold text-gray-700 text-green-900" 
            style={{ margin: 0 }} 
          >
            Max Pickup Distance (km) *
          </label>
          <input
            type="number"
            min={1}
            max={100}
            placeholder="e.g. 5 (Maximum distance in km)"
            {...form.register("pickupMaxDistanceKm")}
            className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-8 py-[11px] md:px-10 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 bg-white w-full"
          />
          {form.formState.errors.pickupMaxDistanceKm && (
            <p className="mt-0.5 text-xs text-red-600" style={{ marginTop: "4px" }}>
              {form.formState.errors.pickupMaxDistanceKm.message}
            </p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="mb-5 flex flex-col gap-1.5">
        <label className="font-inter text-[13.5px] font-semibold text-gray-700">Description about your donation *</label>
        <textarea
          rows={2}
          placeholder="Describe your donation request details, condition requirements, etc..."
          {...form.register("description")}
          className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-8 py-[11px] md:px-10 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-20 resize-none"
        />
        {form.formState.errors.description && (
          <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Cover Photo */}
      <div className="mb-5 flex flex-col gap-1.5">
        <label className="font-inter text-[13.5px] font-semibold text-gray-700">Cover Photo *</label>
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
        className="relative flex w-full items-center justify-center overflow-hidden rounded-sm bg-primary px-10 md:px-14 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting ? "Uploading Donation..." : "Submit Donation"}
      </button>
    </form>
  );
};

export default DonationUploadForm;