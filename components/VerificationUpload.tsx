"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, FileText, Image as ImageIcon, X } from "lucide-react";

interface VerificationUploadProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

const VerificationUpload: React.FC<VerificationUploadProps> = ({
  value,
  onChange,
  error,
}) => {
  const [fileName, setFileName] = useState<string | null>(value ? "Uploaded_Verification_Doc.png" : null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const fakeUrl = URL.createObjectURL(file);
      setPreviewUrl(fakeUrl);
      onChange(file.name || "verification_evidence.png");
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setPreviewUrl(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {previewUrl || fileName ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              {fileName?.endsWith(".pdf") ? (
                <FileText className="h-5 w-5" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-950 truncate">
                {fileName}
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Ready for verification</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-emerald-700 hover:text-red-600 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            error
              ? "border-red-300 bg-red-50/30"
              : "border-gray-300 bg-gray-50/50 hover:border-emerald-500 hover:bg-emerald-50/30"
          }`}
        >
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-110">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Click to upload verification evidence
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Official certificate, NGO registration letter, or ID proof (PNG, JPG, PDF max 10MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationUpload;
