"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";

interface AdminSidebarProps {
  session: Session | null;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ session }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/admin", icon: LayoutDashboard },
    { label: "Verify Institution", href: "/admin/institutions", icon: ShieldCheck },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col justify-between p-6 z-40">
      <div className="space-y-8">
        {/* Logo */}
        <Link href="/admin" className="block">
          <Image src="/assets/logo.png" alt="Cheerity" width={130} height={32} priority />
          <span className="text-xs text-green-800 font-bold tracking-wider block mt-1">
            ADMIN PANEL
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
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
          <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
            A
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-xs text-gray-900 truncate">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 text-xs font-medium rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;