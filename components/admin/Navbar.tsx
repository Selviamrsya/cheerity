"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut } from "lucide-react";

interface AdminNavbarProps {
  session: Session | null;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ session }) => {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminInitial = session?.user?.name
    ? session.user.name.trim().charAt(0).toUpperCase()
    : "A";

  const isHomeActive = pathname === "/admin";
  const isVerifyActive = pathname.startsWith("/admin/institutions");

  return (
    <header className="navbar scrolled">
      <nav className="navbar-inner flex items-center justify-between">
        {/* Left: Logo with subtle Admin indicator */}
        <Link href="/admin" className="navbar-logo flex items-center gap-2.5">
          <Image src="/assets/logo.png" alt="Cheerity" width={140} height={36} priority />
        </Link>

        {/* Right: Text-only links (Home & Verify Institution) + Profile avatar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <ul className="flex items-center gap-1 sm:gap-3 list-none">
            <li>
              <Link
                href="/admin"
                className={`navbar-link ${isHomeActive ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/admin/institutions"
                className={`navbar-link ${isVerifyActive ? "active" : ""}`}
              >
                Verify Institution
              </Link>
            </li>
          </ul>

          {/* Profile Dropdown Popup */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="navbar-avatar flex items-center justify-center font-bold text-sm bg-green-800 text-white cursor-pointer"
              aria-label="Admin Profile Menu"
            >
              {adminInitial}
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {/* User info header */}
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-info">
                    <p className="profile-dropdown-name">
                      {session?.user?.name || "Admin Cheerity"}
                    </p>
                    <p className="profile-dropdown-email">{session?.user?.email}</p>
                  </div>
                </div>

                {/* Quick link to public site */}
                <div className="profile-dropdown-menu">
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="profile-dropdown-item"
                  >
                    <span>Go to the public web</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="profile-dropdown-footer">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="profile-dropdown-signout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default AdminNavbar;