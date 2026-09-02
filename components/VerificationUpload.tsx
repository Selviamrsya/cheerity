"use client";

import React from "react";
import LocalImageUpload from "./LocalImageUpload";

interface VerificationUploadProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

// Upload component for institution verification evidence
// Wraps LocalImageUpload and saves to /uploads/verification/
const VerificationUpload: React.FC<VerificationUploadProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <LocalImageUpload
      value={value}
      onChange={onChange}
      folder="verification"
      placeholder="Upload verification document or institution photo"
      error={error}
    />
  );
};

export default VerificationUpload;
