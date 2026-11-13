"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationRequestSchema, DonationRequestInput } from "@/lib/validations";
import { submitDonationRequest } from "@/lib/actions/donation";
import LocalImageUpload from "./LocalImageUpload";
import LocationFields from "./LocationFields";
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
      <button className="relative flex w-full items-center justify-center overflow-hidden rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50" onClick={() => setIsOpen(true)} style={{ marginTop: 8 }}>
        Donate Now
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-999 bg-black/50 backdrop-blur-xs" onClick={() => setIsOpen(false)} />

      <div className="fixed top-1/2 left-1/2 z-1000 max-h-[90vh] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-outline pb-3">
          <h2 className="text-lg font-bold sm:text-xl">Donation Request</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer border-none bg-transparent text-lg text-on-surface-variant"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-5 text-center">
            <div className="mx-auto mb-4 flex h-15 w-15 items-center justify-center rounded-full bg-primary-100 text-[28px] text-primary">&#10003;</div>
            <h3>Request Submitted!</h3>
            <p>
              Your donation request has been submitted. The institution will
              review it within 24 hours. Check your{" "}
              <Link href="/history" style={{ color: "var(--color-primary)" }}>
                history page
              </Link>{" "}
              for updates.
            </p>
            <button className="relative flex w-full items-center justify-center overflow-hidden rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--color-primary-700)" }} />
                <ul className="text-sm" style={{ color: "var(--color-primary-700)" }}>
                  <li>Your registration will be reviewed within 24 hours</li>
                  <li>You will receive a confirmation once reviewed</li>
                  <li>Track your donation history on the History page</li>
                  <li>Make sure someone is home if you choose pickup service</li>
                </ul>
              </div>
            </div>

            {submitError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-800">{submitError}</p>
            )}

            <div className="mt-4 mb-2 text-sm font-bold tracking-wide text-primary-900 uppercase">Personal Information</div>
            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                {...form.register("phoneNumber")}
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                placeholder="e.g. 081234567890"
              />
              {form.formState.errors.phoneNumber && (
                <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <LocationFields
              stateValue={form.watch("state")}
              cityValue={form.watch("city")}
              zipCodeValue={form.watch("zipCode")}
              onStateChange={(val) => form.setValue("state", val, { shouldValidate: true })}
              onCityChange={(val) => form.setValue("city", val, { shouldValidate: true })}
              onZipCodeChange={(val) => form.setValue("zipCode", val, { shouldValidate: true })}
              errors={{
                state: form.formState.errors.state?.message,
                city: form.formState.errors.city?.message,
                zipCode: form.formState.errors.zipCode?.message,
              }}
            />

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Full Address</label>
              <input type="text" {...form.register("address")} className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400" />
              {form.formState.errors.address && <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.address.message}</p>}
            </div>

            <div className="mt-4 mb-2 text-sm font-bold tracking-wide text-primary-900 uppercase">Donation Information</div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Quantity (max 10,000)</label>
              <input
                type="number"
                min={1}
                max={10000}
                {...form.register("quantity")}
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
              />
              {form.formState.errors.quantity && (
                <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Notes (optional)</label>
              <textarea
                {...form.register("notes")}
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-20 resize-none"
                rows={3}
                placeholder="Any additional information about the items..."
              />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Photo of Items (optional)</label>
              <LocalImageUpload
                value={form.watch("donorPhoto") ?? ""}
                onChange={(url) => form.setValue("donorPhoto", url)}
                folder="donor-photos"
                placeholder="Upload a photo of your donated items"
              />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Delivery Method</label>
              <select {...form.register("deliveryMethod")} 
              className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400">
                {availableDeliveryMethods.map((m) => (
                  <option key={m} value={m}>
                    {DELIVERY_METHOD_LABELS[m] ?? m}
                  </option>
                ))}
              </select>
              {form.formState.errors.deliveryMethod && (
                <p className="mt-0.5 text-xs text-red-600">{form.formState.errors.deliveryMethod.message}</p>
              )}
            </div>

            {isPickup && (
              <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3.5" style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-100)" }}>
                <div className="mt-4 mb-2 text-sm font-bold tracking-wide text-primary-900 uppercase" style={{ marginTop: 0 }}>Estimated Pickup Schedule</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="mb-5 flex flex-col gap-1.5">
                    <label className="font-inter text-[13.5px] font-semibold text-gray-700">Estimated Pickup Date</label>
                    <input
                      type="date"
                      {...form.register("estimatedPickupDate")}
                      className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="mb-5 flex flex-col gap-1.5">
                    <label className="font-inter text-[13.5px] font-semibold text-gray-700">Estimated Pickup Time</label>
                    <input
                      type="time"
                      {...form.register("estimatedPickupTime")}
                      className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
             type="submit" 
             className="text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold transition-all hover:bg-primary-dark disabled:opacity-50"
             style={{width:"auto", padding:"10px 24px"}}
             disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default DonateDonation;