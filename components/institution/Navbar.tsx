"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut, PlusCircle, ExternalLink } from "lucide-react";

interface InstitutionNavbarProps {
  session: Session | null;
}

const InstitutionNavbar: React.FC<InstitutionNavbarProps> = ({ session }) => {
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

  const institutionInitial = session?.user?.name
    ? session.user.name.trim().charAt(0).toUpperCase()
    : "I";

  const isHomeActive = pathname === "/institution";
  const isDonationsActive = pathname.startsWith("/institution/donations") || pathname.startsWith("/institution/newDonations");
  const isHistoryActive = pathname.startsWith("/institution/history");

  return (
    <header className="navbar scrolled">
      <nav className="navbar-inner flex items-center justify-between">
        {/* Left: Logo with Institution indicator badge */}
        <Link href="/institution" className="navbar-logo flex items-center gap-2.5">
          <Image src="/assets/logo.png" alt="Cheerity" width={140} height={36} priority />
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
            Institution
          </span>
        </Link>

        {/* Right: Text-only links with underline hover + Profile avatar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <ul className="flex items-center gap-1 sm:gap-3 list-none">
            <li>
              <Link
                href="/institution"
                className={`navbar-link ${isHomeActive ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/institution/donations"
                className={`navbar-link ${isDonationsActive ? "active" : ""}`}
              >
                Manage Donations
              </Link>
            </li>
            <li>
              <Link
                href="/institution/history"
                className={`navbar-link ${isHistoryActive ? "active" : ""}`}
              >
                History
              </Link>
            </li>
          </ul>

          {/* Profile Dropdown Popup */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="navbar-avatar flex items-center justify-center font-bold text-sm bg-emerald-100 text-emerald-800 border-2 border-emerald-200 hover:border-emerald-600 transition-all cursor-pointer"
              aria-label="Institution Profile Menu"
            >
              {institutionInitial}
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {/* User info header */}
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    {institutionInitial}
                  </div>
                  <div className="profile-dropdown-info">
                    <p className="profile-dropdown-name">
                      {session?.user?.name || "Institution"}
                    </p>
                    <p className="profile-dropdown-email">{session?.user?.email}</p>
                    <span className="profile-dropdown-badge">
                      Social Institution
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="profile-dropdown-menu">
                  <Link
                    href="/institution/newDonations"
                    onClick={() => setProfileOpen(false)}
                    className="profile-dropdown-item"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tambah Kampanye Donasi</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="profile-dropdown-item"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    <span>Kunjungi Halaman Publik</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="profile-dropdown-footer">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="profile-dropdown-signout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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

export default InstitutionNavbar;
