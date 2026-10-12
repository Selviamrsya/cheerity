"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

interface InstitutionHistoryRecord {
  id: string;
  status: "PENDING" | "REJECTED" | "ON_PROGRESS" | "WAITING_FOR_DOCUMENTATION" | "COMPLETED";
  donorName: string | null;
  phoneNumber: string | null;
  city: string | null;
  quantity: number;
  deliveryMethod: string;
  notes: string | null;
  donorPhoto: string | null;
  estimatedPickupDate: string | null;
  estimatedPickupTime: string | null;
  requestDate: Date | null;
  documentationPhoto: string | null;
  rejectionReason: string | null;
  cancelReason: string | null;
  donationTitle: string;
  donationCategory: string;
}

interface InstitutionHistoryClientProps {
  institutionId: string;
  records: InstitutionHistoryRecord[];
}

const InstitutionHistoryClient: React.FC<InstitutionHistoryClientProps> = ({
  institutionId,
  records,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending Approval" },
    { key: "ON_PROGRESS", label: "On Progress" },
    { key: "WAITING_FOR_DOCUMENTATION", label: "Waiting for Documentation" },
    { key: "COMPLETED", label: "Completed" },
    { key: "REJECTED", label: "Rejected" },
  ];

  const filteredRecords = records.filter((r) => {
    if (activeTab === "ALL") return true;
    return r.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-warning-border bg-warning-bg text-warning">Pending Approval</span>;
      case "ON_PROGRESS":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">On Progress</span>;
      case "WAITING_FOR_DOCUMENTATION":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Waiting for Documentation</span>;
      case "COMPLETED":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-success-border bg-success-bg text-success">Completed</span>;
      case "REJECTED":
        return <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold border border-danger-border bg-danger-bg text-danger">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Donation request</h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Review, approve, reject, and manage incoming requests.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 mt-4 flex flex-1 justify-start gap-4 overflow-x-auto border-b border-outline sm:gap-6">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;

          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 border-b-2 pb-3 font-inter text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "border-primary-800 text-primary-800"
                  : "border-transparent text-text-muted hover:text-primary-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Table View */}
      {filteredRecords.length === 0 ? (
        <div className="relative flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">
          <div className="py-24 text-center text-gray-400 space-y-2" style={{ paddingTop: "80px" }}>
            <p className="font-semibold text-sm text-gray-700">
              No donation requests in this category.
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
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Donation Title</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Donor</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Category</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Quantity</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Delivery Method</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Status</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Request Date</th>
                  <th className="border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, index) => (
                  <tr key={r.id} className="transition-colors hover:bg-bg-light">
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-medium">{index + 1}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-medium">{r.donationTitle}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">{ r.donorName}</td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {CATEGORY_LABELS[r.donationCategory] || r.donationCategory}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 font-bold">
                      {r.quantity} items
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {DELIVERY_METHOD_LABELS[r.deliveryMethod] || r.deliveryMethod}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4 text-xs">
                      {mounted && r.requestDate ? new Date(r.requestDate).toLocaleDateString('en-US') : "-"}
                    </td>
                    <td className="relative border-b border-card-border px-3 py-3.5 font-inter text-[13px] text-text-main sm:px-4">
                      {mounted && (
                        <button
                          onClick={() => router.push(`/institution/history/${r.id}`)}
                          className="p-2 hover:bg-gray-100 hover:rounded-full transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionHistoryClient;
