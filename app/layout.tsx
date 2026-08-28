import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Cheerity — Give a Box, Light a Future",
  description:
    "Cheerity is a donation platform designed to make giving feel simple, secure, and meaningful.",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
