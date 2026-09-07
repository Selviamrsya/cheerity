"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  Bell,
  LogIn,
  Check,
  MapPin,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Clock,
  User,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead } from "@/lib/actions/donation";
import EditAddressModal from "@/components/EditAddressModal";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | null;
}

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications when user opens the dropdown
  const handleNotifToggle = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && session?.user?.id) {
      const role = session.user.role;
      const type = role === "INSTITUTION" ? "INSTITUTION" : "USER";
      const data = await getNotifications(session.user.id, type as "USER" | "INSTITUTION");
      setNotifications(data as Notification[]);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !isMobile;

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Find a Donation", href: "/donate" },
    ...(session?.user?.role === "ADMIN"
      ? [{ label: "Admin Panel", href: "/admin" }]
      : session?.user?.role === "INSTITUTION"
      ? [{ label: "Institution Panel", href: "/institution" }]
      : [{ label: "History", href: session ? "/history" : "/sign-in" }]),
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const userInitial = session?.user?.name ? session.user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <>
      <header className={`navbar ${isTransparent ? "transparent" : "scrolled"}`}>
        <nav className="navbar-inner flex items-center justify-between">
          {/* Logo left */}
          <Link href="/" className="navbar-logo">
            <Image
              src={isTransparent ? "/assets/logo-white.png" : "/assets/logo.png"}
              alt="Cheerity"
              width={140}
              height={36}
              priority
            />
          </Link>

          {/* Right section: Navbar links placed left of notification & profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Navbar Links */}
            <ul className="flex items-center gap-1 sm:gap-3 list-none">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`navbar-link ${isActive(item.href) ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="navbar-icon-btn"
                aria-label="Notifications"
                onClick={handleNotifToggle}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.isRead ? "unread" : ""}`}
                          onClick={() => handleMarkRead(n.id)}
                        >
                          <div className="notif-item-title">{n.title}</div>
                          <div className="notif-item-message">{n.message}</div>
                          {n.isRead && <Check className="notif-read-icon h-3 w-3" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / Profile section with interactive Popup Dropdown */}
            {session ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="navbar-avatar flex items-center justify-center font-bold text-sm bg-green-100 text-green-800 border-2 border-green-200 hover:border-green-600 transition-all cursor-pointer"
                  aria-label="Profile Menu"
                >
                  {userInitial}
                </button>

                {/* Profile Popup Dropdown */}
                {profileOpen && (
                  <div className="profile-dropdown">
                    {/* User info header */}
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        {userInitial}
                      </div>
                      <div className="profile-dropdown-info">
                        <p className="profile-dropdown-name">
                          {session.user?.name}
                        </p>
                        <p className="profile-dropdown-email">{session.user?.email}</p>
                        <span className="profile-dropdown-badge">
                          {session.user?.role || "USER"}
                        </span>
                      </div>
                    </div>

                    {/* Role-specific Actions */}
                    <div className="profile-dropdown-menu">
                      {session.user?.role === "ADMIN" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="profile-dropdown-item"
                          >
                            <LayoutDashboard className="w-4 h-4 text-green-700" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            href="/admin/institutions"
                            onClick={() => setProfileOpen(false)}
                            className="profile-dropdown-item"
                          >
                            <ShieldCheck className="w-4 h-4 text-green-700" />
                            <span>Verify Institutions</span>
                          </Link>
                        </>
                      )}

                      {session.user?.role === "INSTITUTION" && (
                        <Link
                          href="/institution"
                          onClick={() => setProfileOpen(false)}
                          className="profile-dropdown-item"
                        >
                          <Building2 className="w-4 h-4 text-green-700" />
                          <span>Institution Dashboard</span>
                        </Link>
                      )}

                      {session.user?.role === "USER" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              setAddressModalOpen(true);
                            }}
                            className="profile-dropdown-item"
                          >
                            <MapPin className="w-4 h-4 text-green-700" />
                            <span>Ubah Alamat</span>
                          </button>
                          <Link
                            href="/history"
                            onClick={() => setProfileOpen(false)}
                            className="profile-dropdown-item"
                          >
                            <Clock className="w-4 h-4 text-green-700" />
                            <span>Riwayat Donasi</span>
                          </Link>
                          <Link
                            href="/my-profile"
                            onClick={() => setProfileOpen(false)}
                            className="profile-dropdown-item"
                          >
                            <User className="w-4 h-4 text-green-700" />
                            <span>Profil Lengkap</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Direct Sign Out button */}
                    <div className="profile-dropdown-footer">
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="profile-dropdown-signout"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/sign-in" className="navbar-signin-btn">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Edit Address Modal for User */}
      <EditAddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />
    </>
  );
};

export default Header;