"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface LocalImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  error?: string;
}

// Keep in sync with validation in app/api/upload/route.ts
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const LocalImageUpload: React.FC<LocalImageUploadProps> = ({
  value,
  onChange,
  folder = "uploads",
  placeholder = "Click to upload an image",
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Only JPEG, PNG images are allowed.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      onChange(data.url);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        className="group relative flex h-60 w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 text-center transition-all hover:border-gray-400 hover:bg-gray-200"
        onClick={() => !isUploading && inputRef.current?.click()}
        style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {value ? (
          <div className="absolute inset-0 h-full w-full">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 z-10 cursor-pointer rounded-full border-none bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600/80"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-primary)" }} />
            <p className="text-sm font-medium text-on-surface">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-on-surface">{placeholder}</p>
            <p className="text-xs text-gray-400">JPEG, PNG up to 5MB</p>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-400">
        Maksimal {MAX_SIZE_MB}MB • Format: JPEG, PNG
      </p>
      {(uploadError || error) && (
        <p className="mt-0.5 text-xs text-red-600">{uploadError || error}</p>
      )}
    </div>
  );
};

export default LocalImageUpload;