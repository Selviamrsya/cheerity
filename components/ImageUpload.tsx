"use client";

import { upload } from "@imagekit/next";
import Image from "next/image";
import config from "@/lib/config";
import { useState } from "react";

const {
  env: {
    imagekit: { publicKey },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(
      `${config.env.apiEndpoint}/api/auth/imagekit`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { token, expire, signature };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Authentication request failed: ${message}`);
  }
};

interface ImageUploadProps {
  onFileChange: (filePath: string) => void;
}

const ImageUpload = ({ onFileChange }: ImageUploadProps) => {
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      setUploading(true);
      const authParams = await authenticator();

      const result = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        publicKey,
        ...authParams,
      });

      if (!result.filePath) {
        throw new Error("Filepath not found");
      }

      setFile({ filePath: result.filePath });
      onFileChange(result.filePath);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="upload-btn cursor-pointer">
        <Image
          src="/icons/upload.svg"
          alt="upload icon"
          width={20}
          height={20}
          className="object-contain"
        />

        <p className="text-base text-gray-700 font-medium">
          {uploading ? "Uploading..." : "Upload a File"}
        </p>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {file && (
        <p className="text-xs text-emerald-700 font-semibold">
          {file.filePath}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;