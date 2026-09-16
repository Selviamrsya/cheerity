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
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{marginBottom:"8px"}}>Something went wrong!</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-md" style={{marginBottom:"18px"}}>
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="btn-primary"
          style={{ width: "auto", padding: "8px 48px" }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 48px",
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
