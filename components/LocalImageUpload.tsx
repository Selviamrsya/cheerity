"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface LocalImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  error?: string;
}

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
        className="rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-primary hover:bg-primary-50 sm:p-16"
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
          <div className="relative max-h-60 w-full overflow-hidden rounded-md">
            <img src={value} alt="Preview" className="h-60 w-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 cursor-pointer rounded-full border-none bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600/80"
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
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8" style={{ color: "var(--color-on-surface-variant)" }} />
            <p className="text-sm font-medium text-on-surface">{placeholder}</p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP up to 5MB</p>
          </div>
        )}
      </div>
      {(uploadError || error) && (
        <p className="mt-0.5 text-xs text-red-600">{uploadError || error}</p>
      )}
    </div>
  );
};

export default LocalImageUpload;
