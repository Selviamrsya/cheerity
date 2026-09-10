"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut, Bell, Check } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/lib/actions/donation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | null;
}

interface AdminNavbarProps {
  session: Session | null;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ session }) => {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications when user opens the dropdown
  const handleNotifToggle = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && session?.user?.id) {
      const data = await getNotifications(session.user.id, "ADMIN");
      setNotifications(data as Notification[]);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                Dashboard
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
                      {session?.user?.name || "Admin"}
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