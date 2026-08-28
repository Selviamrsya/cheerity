import React from "react";

const Page = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--color-surface-dim)" }}>
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-poppins)", color: "var(--color-on-surface)" }}>
        Slow down please!
      </h1>
      <p className="mt-3 max-w-xl text-center text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
        Looks like you&apos;ve been a little too eager. We&apos;ve put a temporary pause
        on your excitement. Chill for a bit, and try again shortly.
      </p>
    </main>
  );
};

export default Page;