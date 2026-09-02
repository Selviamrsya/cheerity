import React from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { auth } from "@/app/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <>
      <Header session={session} />
      <main className="page-container">{children}</main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-logo">
            <Image src="/assets/logo.png" alt="Cheerity" width={120} height={30} />
            <p className="site-footer-tagline">Bring Cheer</p>
          </div>
          <p className="site-footer-copy">
            &copy; 2026 Cheerity &mdash; All rights reserved
          </p>
        </div>
      </footer>
    </>
  );
};

export default Layout;