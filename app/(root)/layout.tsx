import React from "react";
import Header from "@/components/Header";
import { auth } from "@/app/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <>
      <Header session={session} />
      <main className="page-container">{children}</main>
      <footer className="footer">
        <p>© 2026 Cheerity. Give a Box, Light a Future.</p>
      </footer>
    </>
  );
};

export default Layout;