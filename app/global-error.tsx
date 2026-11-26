"use client";

import React, { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-md">
          A critical error occurred. Please try reloading the page.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-green-800 text-white font-semibold rounded-md shadow hover:bg-green-900 transition-colors"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
