import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-dim px-4 py-6">
      {children}
    </main>
  );
};

export default Layout;
