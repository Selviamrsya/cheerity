"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, AlertCircle, Truck, Upload, X } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

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
    photo: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
      distance: Math.round(distance * 10) / 10,
      message: `${Math.round(distance * 10) / 10} km away`
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: "Photo must be less than 5MB" }));
        return;
      }

      setFormData((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
      if (errors.photo) {
        setErrors((prev) => ({ ...prev, photo: "" }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name and phone are auto-filled from profile, so we just check if they exist
    if (!formData.name.trim()) {
      newErrors.name = "Please update your name in profile first";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please update your phone in profile first";
    }

    // Address is auto-filled from profile, so we just check if it exists
    if (!formData.address.trim()) {
      newErrors.address = "Please update your address in profile first";
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    } else if (parseInt(formData.quantity) > (donation.target - donation.collected)) {
      newErrors.quantity = `Maximum quantity is ${donation.target - donation.collected} items`;
    }

    if (!formData.photo) {
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
      const photoFormData = new FormData();
      photoFormData.append("file", formData.photo!);
      photoFormData.append("folder", "donation-proofs");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: photoFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload photo");
      }

      const { url: photoUrl } = await uploadResponse.json();

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
          quantity: parseInt(formData.quantity),
          notes: formData.notes,
          donorPhoto: photoUrl,
          deliveryMethod: formData.deliveryMethod,
          estimatedPickupDate: formData.estimatedPickupDate || null,
          estimatedPickupTime: formData.estimatedPickupTime || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit request");
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
    <div className="max-w-350 mx-auto px-8 md:px-32 mb-16" >
      <div className="mb-2" style={{ marginTop: "56px" }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Donation</h1>
        <p className="text-gray-600">Fill in the details to request this donation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" >
        {/* Donation Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-2 sticky top-24">
            {donation.cover ? (
              <img
                src={donation.cover}
                alt={donation.title}
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

            <div className="flex justify-between items-start mb-3" style={{ padding: "6px 0 6px 0" }}>
              <p className="text-sm font-medium text-gray-700">Institution</p>
              <span className="text-sm text-gray-600 text-right">
                {donation.institutionName}
              </span>
            </div>

            <div className="flex justify-between items-start mb-3" style={{ paddingBottom: "6px" }}>
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

            <div className="mt-6 mb-6">
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
          <form onSubmit={handleSubmit} className="px-2 md:px-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>

              <div className="mt-4">
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
                    marginBottom: "8px"
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
                    marginBottom: "8px"
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

              <div className="grid grid-cols-3 gap-4 mt-2">
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
              <div className="mt-1">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ marginBottom: "8px", marginTop: "16px" }}>Donation Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
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
                <p className="text-xs text-gray-500 mt-1" style={{ marginBottom: "8px" }}>
                  Maximum available: {donation.target - donation.collected} items
                </p>
                {errors.quantity && <p className="text-red-500 text-sm mt-1" style={{ marginBottom: "8px" }}>{errors.quantity}</p>}
              </div>

              <div className="mt-4">
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
                    marginBottom: "8px"
                  }}
                />
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ marginBottom: "4px" }}>
                  Donation Photo
                </label>
                <div
                  className={`rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-primary hover:bg-primary-50 sm:p-16 flex flex-col items-center justify-center rounded-md overflow-hidden ${photoPreview ? 'border-0' : 'border-2 border-dashed border-gray-300'}`}
                  style={{
                    padding: photoPreview ? "0" : "48px",
                    position: "relative",
                    marginBottom: "18px",
                    height: "300px",
                    width: "100%"
                  }}
                >
                  {!photoPreview && (
                    <input
                      id="photo-upload"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 10 }}
                    />
                  )}

                  {photoPreview ? (
                    <div className="absolute inset-0 w-full h-full group z-0">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, photo: null }));
                          setPhotoPreview(null);
                        }}
                        className="absolute top-2 right-2 cursor-pointer rounded-full border-none bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600/80 absolute top-3 right-3 bg-white bg-opacity-75 hover:bg-red-500 hover:text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                        aria-label="Remove photo"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 flex flex-col items-center justify-center text-center pointer-events-none">
                      <Upload className="h-8 w-8 mb-2" style={{ color: "var(--color-on-surface-variant)" }} />
                      <p className="text-sm font-medium text-on-surface text-sm text-gray-600">Click or drag and drop to upload</p>
                      <p className="text-xs text-gray-400 text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>

                {errors.photo && <p className="text-red-500 text-sm mt-1" style={{ marginBottom: "18px" }}>{errors.photo}</p>}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ marginBottom: "2px" }}>Delivery Method</h3>
              <p className="text-sm text-gray-600 mb-4" style={{ marginBottom: "4px" }}>Select one delivery method for your donation:</p>

              {pickupDistanceWarning && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3" style={{ marginBottom: "6px" }}>
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

              <div className="space-y-2" >
                {availableDeliveryMethods.map((method) => (
                  <label
                    key={method}
                    style={{ padding: "6px 0 6px 6px" }}
                    className={`flex items-center p-4 mt-2 border rounded-sm cursor-pointer transition-colors ${formData.deliveryMethod === method
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`
                    }
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
                      Please ensure someone is available at the specified time. If no one is available for pickup, the request may be cancelled.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: "18px" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-white bg-[var(--color-primary)] hover:brightness-90 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  width: "100%", /* Membuat tombol memanjang penuh */
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