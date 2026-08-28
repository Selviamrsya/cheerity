import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="auth-container">
      <div className="auth-card">
        {children}
      </div>
    </main>
  );
};

export default Layout;