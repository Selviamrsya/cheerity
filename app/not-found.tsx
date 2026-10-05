import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ marginBottom: "8px" }}>404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4" style={{ marginBottom: "8px" }}>Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6" style={{ marginBottom: "8px" }}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="font-medium text-white inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
        style={{ width: "auto", padding: "10px 24px" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
