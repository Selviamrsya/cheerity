"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, AlertCircle } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";
import LocalImageUpload from "@/components/LocalImageUpload"; // Menggunakan reusable component

interface DonationRequestFormProps {
  donation: {
    id: string;
    title: string;
    category: string;
    cover: string | null;
    description: string | null;
    target: number;
    collected: number;
    deliveryMethods: string[];
    hasPickupService: boolean | null;
    pickupMaxDistanceKm: number | null;
    institutionId: string;
    institutionName: string;
    institutionCity: string | null;
    institutionState: string | null;
    distanceKm?: number | null;
  };
  user: {
    id: string;
    name: string | null;
    phone: string;
    city: string;
    state: string;
    zipCode: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  institutionLocation: {
    latitude: number | null;
    longitude: number | null;
  };
}

const DonationRequestForm: React.FC<DonationRequestFormProps> = ({
  donation,
  user,
  institutionLocation,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name ?? "",
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    zipCode: user.zipCode,
    quantity: "",
    notes: "",
    deliveryMethod: "",
    estimatedPickupDate: "",
    estimatedPickupTime: "",
    photo: "", // Menggunakan string URL dari LocalImageUpload
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isPickupAvailable = (): boolean => {
    if (!donation.hasPickupService || !donation.pickupMaxDistanceKm) {
      return false;
    }

    if (!user.latitude || !user.longitude || !institutionLocation.latitude || !institutionLocation.longitude) {
      return false;
    }

    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      institutionLocation.latitude,
      institutionLocation.longitude
    );

    return distance <= donation.pickupMaxDistanceKm;
  };

  const getDistanceInfo = (): { distance: number | null; message: string } => {
    if (!user.latitude || !user.longitude || !institutionLocation.latitude || !institutionLocation.longitude) {
      return {
        distance: null,
        message: "Location coordinates not available. Please update your address in profile."
      };
    }

    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      institutionLocation.latitude,
      institutionLocation.longitude
    );

    return {
      distance: Math.round(distance * 100) / 100,
      message: `${Math.round(distance * 100) / 100} km away`
    };
  };

  const availableDeliveryMethods = donation.deliveryMethods.filter((method) => {
    if (method === "pickup_by_institution") {
      return isPickupAvailable();
    }
    return true;
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please update your name in profile first";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please update your phone in profile first";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please update your address in profile first";
    }

    const qtyText = formData.quantity.trim();
    const qtyNum = /^\d+$/.test(qtyText) ? parseInt(qtyText, 10) : NaN;
    const remaining = donation.target - donation.collected;

    if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    } else if (qtyNum > remaining) {
      newErrors.quantity = `Maximum quantity is ${remaining} items`;
    }

    if (!formData.photo.trim()) {
      newErrors.photo = "Photo is required as proof";
    }

    if (!formData.deliveryMethod) {
      newErrors.deliveryMethod = "Please select a delivery method";
    }

    if (formData.deliveryMethod === "pickup_by_institution") {
      if (!formData.estimatedPickupDate) {
        newErrors.estimatedPickupDate = "Pickup date is required";
      }
      if (!formData.estimatedPickupTime) {
        newErrors.estimatedPickupTime = "Pickup time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // LocalImageUpload sudah otomatis mengunggah file ke API/storage dan mengembalikan URL,
      // sehingga kita bisa langsung mengirim formData.photo ke backend.
      const response = await fetch("/api/donations/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation.id,
          donorName: formData.name,
          phoneNumber: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          quantity: parseInt(formData.quantity.trim(), 10),
          notes: formData.notes,
          donorPhoto: formData.photo, // URL string dari LocalImageUpload
          deliveryMethod: formData.deliveryMethod,
          estimatedPickupDate: formData.estimatedPickupDate || null,
          estimatedPickupTime: formData.estimatedPickupTime || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Failed to submit request");
      }

      router.push("/history");
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : "Failed to submit request",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickupDistanceWarning = !isPickupAvailable() && donation.hasPickupService && donation.pickupMaxDistanceKm;
  const distanceInfo = getDistanceInfo();

  return (
    <div className="max-w-350 mx-auto px-8 md:px-32 mb-16">
      {/* Back Button */}
      <Link
        href={`/donations/${donation.id}`}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 mt-12 md:mt-16 hover:text-green-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Donation Details
      </Link>

      <div className="mb-2 mt-4">
        <h1 className="text-3xl font-semibold text-gray-900">Request Donation</h1>
        <p className="text-gray-600">Fill in the details to request this donation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Donation Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white sticky top-24">
            {donation.cover ? (
              <Image
                src={donation.cover}
                alt={donation.title}
                width={640}
                height={256}
                className="w-full h-64 object-cover rounded-sm mb-4"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-sm mb-4 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-6" style={{ marginTop: "18px", marginBottom: "6px" }}>
              {donation.title}
            </h2>

            <div className="flex justify-between items-start mb-1" style={{ padding: "6px 0 6px 0" }}>
              <p className="text-sm font-medium text-gray-700">Institution</p>
              <span className="text-sm text-gray-600 text-right">
                {donation.institutionName}
              </span>
            </div>

            <div className="flex justify-between items-start mb-1" style={{ paddingBottom: "6px" }}>
              <p className="text-sm font-medium text-gray-700">Location</p>
              <span className="text-sm text-gray-600 text-right">
                {[donation.institutionCity, donation.institutionState]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            <div className="flex justify-between items-center mb-3" style={{ marginBottom: "6px" }}>
              <p className="text-sm font-medium text-gray-700">Distance</p>
              <span className="text-sm text-gray-600 text-right">
                {distanceInfo.message}
              </span>
            </div>

            <div className="flex justify-between items-center mb-3" style={{ marginBottom: "6px" }}>
              <p className="text-sm font-medium text-gray-700">Category</p>
              <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full text-sm font-medium leading-none"
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "16px",
                  paddingRight: "16px"
                }}>
                {CATEGORY_LABELS[donation.category] ?? donation.category}
              </span>
            </div>

            <div className="mt-2 mb-6">
              <div className="flex justify-between items-center mb-2" style={{ marginBottom: "6px" }}>
                <p className="text-sm font-medium text-gray-700">Progress</p>
                <p className="text-sm text-gray-600">
                  {donation.collected} / {donation.target}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2" style={{ marginBottom: "24px" }}>
                <div
                  className="bg-green-700 h-2 rounded-full"
                  style={{
                    width: `${Math.min((donation.collected / donation.target) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <hr className="border-t border-black mt-6" style={{ marginBottom: "18px" }} />
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="px-2 md:px-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-600 focus:outline-none"
                  style={{
                    padding: "6px 0 6px 6px",
                    marginBottom: "4px"
                  }}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-600 focus:outline-none"
                  style={{
                    padding: "6px 0 6px 6px",
                    marginBottom: "4px"
                  }}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-600 focus:outline-none"
                  style={{
                    padding: "6px 0 6px 6px",
                    marginBottom: "2px"
                  }}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-600 focus:outline-none"
                    style={{
                      padding: "6px 0 6px 6px",
                      marginBottom: "2px"
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-600 focus:outline-none"
                    style={{
                      padding: "6px 0 6px 6px",
                      marginBottom: "2px"
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-600 focus:outline-none"
                    style={{
                      padding: "6px 0 6px 6px",
                    }}
                  />
                </div>
              </div>

              <div className="mt-2">
                <Link
                  href="/my-profile"
                  className="text-sm text-gray-400 hover:text-green-700 underline"
                >
                  Want to change address or personal info? Edit in profile
                </Link>
              </div>
            </div>

            {/* Donation Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ marginBottom: "4px", marginTop: "12px" }}>Donation Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "4px" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  max={donation.target - donation.collected}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-700"
                  style={{
                    padding: "6px 0 6px 6px"
                  }}
                />
                <p className="text-xs text-gray-500 mt-1" style={{ marginBottom: "4px" }}>
                  Maximum available: {donation.target - donation.collected} items
                </p>
                {errors.quantity && <p className="text-red-500 text-sm mt-1" style={{ marginBottom: "8px" }}>{errors.quantity}</p>}
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information about your donation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-700"
                  style={{
                    padding: "6px 0 6px 6px",
                    marginBottom: "4px"
                  }}
                />
              </div>

              {/* Mengganti custom upload manual dengan reusable component LocalImageUpload */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                  Donation Photo *
                </label>
                <LocalImageUpload
                  value={formData.photo}
                  onChange={(url) => {
                    setFormData((prev) => ({ ...prev, photo: url }));
                    if (url && errors.photo) {
                      setErrors((prev) => ({ ...prev, photo: "" }));
                    }
                  }}
                  folder="donation-proofs"
                  placeholder="Upload documentation photo *"
                />
                {errors.photo && <p className="text-red-500 text-sm mt-1" style={{ marginBottom: "8px" }}>{errors.photo}</p>}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Delivery Method</h3>
              <p className="text-sm text-gray-600 mb-4" style={{ marginBottom: "4px" }}>Select one delivery method for your donation:</p>

              {pickupDistanceWarning && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2" style={{ marginBottom: "6px" }}>
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      {distanceInfo.distance !== null
                        ? `Pickup service is not available for your location. You are ${distanceInfo.distance}km away, which is outside the ${donation.pickupMaxDistanceKm}km radius.`
                        : "Pickup service is not available. Location coordinates not available. Please update your address in profile."
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {availableDeliveryMethods.map((method) => (
                  <label
                    key={method}
                    style={{ padding: "6px 0 6px 6px" }}
                    className={`flex items-center p-4 mt-1 border rounded-sm cursor-pointer transition-colors ${formData.deliveryMethod === method
                      ? "bg-green-800 text-white"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method}
                      checked={formData.deliveryMethod === method}
                      onChange={handleInputChange}
                      className="mr-5 accent-green-700"
                      style={{ marginRight: "5px" }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{DELIVERY_METHOD_LABELS[method] ?? method}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.deliveryMethod && <p className="text-red-500 text-sm mt-1">{errors.deliveryMethod}</p>}

              {formData.deliveryMethod === "pickup_by_institution" && (
                <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-sm" style={{ marginTop: "1px" }}>
                  <div style={{ display: "flex", gap: "16px", width: "100%" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        name="estimatedPickupDate"
                        value={formData.estimatedPickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px"
                        }}
                      />
                      {errors.estimatedPickupDate && (
                        <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "4px" }}>{errors.estimatedPickupDate}</p>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                        Pickup Time
                      </label>
                      <input
                        type="time"
                        name="estimatedPickupTime"
                        value={formData.estimatedPickupTime}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px"
                        }}
                      />
                      {errors.estimatedPickupTime && (
                        <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "4px" }}>{errors.estimatedPickupTime}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      The stated time is an estimate and is subject to slight changes. Please ensure you are at the location at the scheduled time. If no one is present at the time of pickup, the request may be cancelled
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-white bg-primary hover:brightness-90 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  boxSizing: "border-box"
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationRequestForm;