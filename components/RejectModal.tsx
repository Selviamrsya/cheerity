"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  reason: string;
  onReasonChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function RejectModal({
  isOpen,
  onClose,
  title,
  description,
  reason,
  onReasonChange,
  onSubmit,
  isLoading,
  placeholder = "Enter your reason here...",
}: RejectModalProps) {
  const [error, setError] = useState(false);

  // Reset error setiap modal dibuka/tutup
  useEffect(() => {
    if (!isOpen) {
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitClick = () => {
    if (!reason.trim()) {
      setError(true); 
      return;
    }
    setError(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="fixed inset-0 z-999 bg-black/50 backdrop-blur-xs md:hidden" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-sm p-5 shadow-2xl border border-gray-100 z-1000">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="cursor-pointer border-none bg-transparent text-gray-500 hover:text-gray-700 p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs mb-2 text-gray-500 leading-relaxed">{description}</p>

        <textarea
          rows={4}
          value={reason}
          onChange={(e) => {
            onReasonChange(e.target.value);
            if (e.target.value.trim()) setError(false);
          }}
          placeholder={placeholder}
          className={`w-full p-3 text-xs border rounded-sm focus:outline-none resize-none ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-800"
          }`}
        />
        {error && (
          <p className="text-xs text-red-600">Please enter a reason before rejecting.</p>
        )}

        <div className="flex gap-1 justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isLoading}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isLoading ? "Rejecting..." : "Confirm Reject"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}