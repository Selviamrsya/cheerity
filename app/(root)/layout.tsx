import React from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { getSession } from "@/lib/auth";

import { headers } from "next/headers";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  return (
    <div className="flex min-h-screen flex-col">
      <Header session={session} />
      <main className="w-full flex-1 pt-14">{children}</main>

      <footer className="bg-primary px-4 py-9 text-white sm:px-8 md:pt-9 md:pb-11">
        <div className="mx-auto flex max-w-330 flex-col items-start gap-3 text-left">
          <div>
            <Image
              src="/assets/Whitelogo.png"
              alt="Cheerity"
              width={140}
              height={36}
            />

            <p className="mt-3 font-poppins text-sm font-light text-white">
              Cheerity bring Cheer
            </p>
          </div>

          <div className="w-full border-t-2 border-surface" />

          <p className="mt-2 text-[13px] text-white">
            &copy; 2026 Cheerity &mdash; All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
