"use client";

import React from "react";
import Link from "next/link";
import { History, PackageCheck, ArrowRight, Clock, MapPin } from "lucide-react";

const mockHistory = [
  {
    id: "DON-8821",
    title: "Seragam Sekolah SD Bekas Layak Pakai",
    institution: "Kasih Ibu Foundation",
    date: "22 Aug 2026",
    status: "Completed",
    quantity: "3 Seragam",
    location: "Kebayoran Baru, Jakarta Selatan",
  },
  {
    id: "DON-7714",
    title: "Buku Tulis & Paket Stationer",
    institution: "Rumah Singgah Cibubur",
    date: "10 Aug 2026",
    status: "In Delivery",
    quantity: "1 Pack (10 Buku)",
    location: "Cibubur, Jakarta Timur",
  },
];

const HistoryPage = () => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <History className="h-8 w-8 text-emerald-700" />
          <span>Donation History</span>
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Track your past contributions and delivery status for ongoing donations.
        </p>
      </div>

      {/* History List */}
      <div className="flex flex-col gap-4">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-gray-200 shadow-2xs hover:border-emerald-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-sm">
                <PackageCheck className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.id}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.date}
                  </span>
                </div>

                <h3 className="mt-1 text-base font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  To: {item.institution} ({item.quantity})
                </p>

                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-emerald-600" /> {item.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  item.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-900 transition-all"
        >
          <span>Make Another Donation</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default HistoryPage;
