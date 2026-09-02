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
        className="upload-area"
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
          <div className="upload-preview">
            <img src={value} alt="Preview" className="upload-preview-img" />
            <button
              type="button"
              onClick={handleRemove}
              className="upload-remove-btn"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : isUploading ? (
          <div className="upload-placeholder">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-primary)" }} />
            <p className="upload-placeholder-text">Uploading...</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <ImagePlus className="h-8 w-8" style={{ color: "var(--color-on-surface-variant)" }} />
            <p className="upload-placeholder-text">{placeholder}</p>
            <p className="upload-placeholder-hint">JPEG, PNG, WebP up to 5MB</p>
          </div>
        )}
      </div>
      {(uploadError || error) && (
        <p className="form-error">{uploadError || error}</p>
      )}
    </div>
  );
};

export default LocalImageUpload;
