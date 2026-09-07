"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="btn-primary"
          style={{ width: "auto", padding: "10px 24px" }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 24px",
            background: "#f3f4f6",
            color: "#374151",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
