"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LayoutDashboard, FolderPlus, History, LogOut } from "lucide-react";

interface InstitutionSidebarProps {
  session: Session | null;
}

const InstitutionSidebar: React.FC<InstitutionSidebarProps> = ({ session }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/institution", icon: LayoutDashboard },
    { label: "Manage Donations", href: "/institution/donations", icon: FolderPlus },
    { label: "History", href: "/institution/history", icon: History },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-6 z-40">
      <div className="space-y-8">
        {/* Logo */}
        <Link href="/institution" className="block">
          <Image src="/assets/logo.png" alt="Cheerity" width={140} height={36} priority />
          <span className="text-xs text-green-800 font-semibold tracking-wide block mt-1">
            INSTITUTION DASHBOARD
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/institution"
                ? pathname === "/institution"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-green-800 text-white shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-base flex-shrink-0">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "I"}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {session?.user?.name || "Institution"}
            </p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 text-sm font-medium rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default InstitutionSidebar;