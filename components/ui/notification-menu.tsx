"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/lib/actions/donation";
import {
  NavbarIconButton,
  NotificationDot,
} from "@/components/ui/navbar-shell";
import {
  NotifDropdown,
  NotifHeader,
  NotifItem,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | null;
}

export function NotificationMenu({
  userId,
  role,
  overlay,
}: {
  userId: string;
  role: "USER" | "ADMIN" | "INSTITUTION";
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      const data = await getNotifications(userId, role);
      setNotifications(data as Notification[]);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Handler untuk Mark All as Read
  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    await Promise.all(unreadItems.map((n) => markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={ref}>
      <NavbarIconButton
        overlay={overlay}
        aria-label="Notifications"
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <NotificationDot />}
      </NavbarIconButton>

      {open && (
        <NotifDropdown className="w-[min(20rem,calc(100vw-2rem))]">
          {/* Diubah jadi flex-col supaya tombol Mark all read bisa ditaruh di bawah judul */}
          <NotifHeader className="flex flex-col items-start gap-1 py-3 px-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {/* Tombol Mark All Read di bawah judul */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer bg-transparent border-none p-0 mt-0.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </NotifHeader>
          <div className="max-h-[280px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-[13px] text-gray-400">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  unread={!n.isRead}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className="text-[13px] font-semibold text-gray-900">
                    {n.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600">{n.message}</div>
                </NotifItem>
              ))
            )}
          </div>
        </NotifDropdown>
      )}
    </div>
  );
}