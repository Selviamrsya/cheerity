"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationRequestSchema, DonationRequestInput } from "@/lib/validations";
import { submitDonationRequest } from "@/lib/actions/donation";
import LocalImageUpload from "./LocalImageUpload";
import { DELIVERY_METHOD_LABELS } from "@/constants";

interface DonateDonationProps {
  donationId: string;
  userId: string;
  defaultName: string;
  defaultPhone: string;
  defaultCity: string;
  defaultState: string;
  defaultZipCode: string;
  defaultAddress: string;
  availableDeliveryMethods: string[];
}

const DonateDonation: React.FC<DonateDonationProps> = ({
  donationId,
  userId,
  defaultName,
  defaultPhone,
  defaultCity,
  defaultState,
  defaultZipCode,
  defaultAddress,
  availableDeliveryMethods,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<DonationRequestInput>({
    resolver: zodResolver(donationRequestSchema),
    defaultValues: {
      donorName: defaultName,
      isAnonymous: false,
      phoneNumber: defaultPhone,
      city: defaultCity,
      state: defaultState,
      zipCode: defaultZipCode,
      address: defaultAddress,
      quantity: 1,
      notes: "",
      donorPhoto: "",
      deliveryMethod:
        (availableDeliveryMethods[0] as
          | "self_delivery"
          | "third_party_courier"
          | "pickup_by_institution") ?? "self_delivery",
      estimatedPickupDate: "",
      estimatedPickupTime: "",
    },
  });

  const isAnonymous = form.watch("isAnonymous");
  const selectedMethod = form.watch("deliveryMethod");
  const isPickup = selectedMethod === "pickup_by_institution";

  const onSubmit = async (data: DonationRequestInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitDonationRequest({ ...data, userId, donationId });
      if (result.success) {
        setSubmitted(true);
        router.refresh();
      } else {
        setSubmitError(result.error ?? "Failed to submit request.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (!isOpen) {
    return (
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ marginTop: 8 }}>
        Donate Now
      </button>
    );
  }

  return (
    <>
      <div className="modal-backdrop" onClick={() => setIsOpen(false)} />

      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Donation Request</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="modal-success">
            <div className="modal-success-icon">&#10003;</div>
            <h3>Request Submitted!</h3>
            <p>
              Your donation request has been submitted. The institution will
              review it within 24 hours. Check your{" "}
              <a href="/history" style={{ color: "var(--color-primary)" }}>
                history page
              </a>{" "}
              for updates.
            </p>
            <button className="btn-primary" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="modal-form">
            <div className="donation-request-info-box">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-primary-700)" }} />
                <ul className="text-sm" style={{ color: "var(--color-primary-700)" }}>
                  <li>Your registration will be reviewed within 24 hours</li>
                  <li>You will receive a confirmation once reviewed</li>
                  <li>Track your donation history on the History page</li>
                  <li>Make sure someone is home if you choose pickup service</li>
                </ul>
              </div>
            </div>

            {submitError && (
              <p className="form-error-box">{submitError}</p>
            )}

            <div className="modal-section-title">Personal Information</div>

            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="checkbox"
                  {...form.register("isAnonymous")}
                  className="h-4 w-4"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span>Donate as Anonymous</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  {...form.register("donorName")}
                  className="form-input"
                  placeholder="Full name"
                />
                {form.formState.errors.donorName && (
                  <p className="form-error">{form.formState.errors.donorName.message}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                {...form.register("phoneNumber")}
                className="form-input"
                placeholder="e.g. 081234567890"
              />
              {form.formState.errors.phoneNumber && (
                <p className="form-error">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" {...form.register("city")} className="form-input" />
                {form.formState.errors.city && <p className="form-error">{form.formState.errors.city.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" {...form.register("state")} className="form-input" />
                {form.formState.errors.state && <p className="form-error">{form.formState.errors.state.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input type="text" {...form.register("zipCode")} className="form-input" />
                {form.formState.errors.zipCode && <p className="form-error">{form.formState.errors.zipCode.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input type="text" {...form.register("address")} className="form-input" />
              {form.formState.errors.address && <p className="form-error">{form.formState.errors.address.message}</p>}
            </div>

            <div className="modal-section-title">Donation Information</div>

            <div className="form-group">
              <label className="form-label">Quantity (max 10,000)</label>
              <input
                type="number"
                min={1}
                max={10000}
                {...form.register("quantity")}
                className="form-input"
              />
              {form.formState.errors.quantity && (
                <p className="form-error">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                {...form.register("notes")}
                className="form-input form-textarea"
                rows={3}
                placeholder="Any additional information about the items..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Photo of Items (optional)</label>
              <LocalImageUpload
                value={form.watch("donorPhoto") ?? ""}
                onChange={(url) => form.setValue("donorPhoto", url)}
                folder="donor-photos"
                placeholder="Upload a photo of your donated items"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Method</label>
              <select {...form.register("deliveryMethod")} className="form-input">
                {availableDeliveryMethods.map((m) => (
                  <option key={m} value={m}>
                    {DELIVERY_METHOD_LABELS[m] ?? m}
                  </option>
                ))}
              </select>
              {form.formState.errors.deliveryMethod && (
                <p className="form-error">{form.formState.errors.deliveryMethod.message}</p>
              )}
            </div>

            {isPickup && (
              <div className="donation-request-info-box" style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-100)" }}>
                <div className="modal-section-title" style={{ marginTop: 0 }}>Estimated Pickup Schedule</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Estimated Pickup Date</label>
                    <input
                      type="date"
                      {...form.register("estimatedPickupDate")}
                      className="form-input"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Pickup Time</label>
                    <input
                      type="time"
                      {...form.register("estimatedPickupTime")}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default DonateDonation;