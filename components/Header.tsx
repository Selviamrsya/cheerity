"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { Bell, LogIn, Check } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead } from "@/lib/actions/donation";

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Find a Donation", href: "/donate" },
    { label: "History", href: session ? "/history" : "/sign-in" },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <nav className="navbar-inner flex items-center justify-between">
        {/* Logo left */}
        <Link href="/" className="navbar-logo">
          <Image src="/assets/logo.png" alt="Cheerity" width={140} height={36} priority />
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

          {/* Auth / Profile section */}
          {session ? (
            <Link href="/my-profile">
              <div className="navbar-avatar flex items-center justify-center font-bold text-sm bg-green-100 text-green-800">
                {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </Link>
          ) : (
            <Link href="/sign-in" className="navbar-signin-btn">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;