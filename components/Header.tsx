"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { Bell, LogIn, Menu, X } from "lucide-react";
import React, { useState, useEffect } from "react";

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Navigation items (default: user)
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Find a Donation", href: "/donate" },
    { label: "History", href: "/history" },
  ];

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <nav className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <Image
            src="/assets/logo.png"
            alt="Cheerity"
            width={140}
            height={36}
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <ul className={`navbar-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`navbar-link ${isActive(item.href) ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Notification */}
          <button className="navbar-icon-btn" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="notification-dot" />
          </button>

          {/* Auth */}
          {session ? (
            <Link href="/my-profile">
              <div
                className="navbar-avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--color-primary-100)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </Link>
          ) : (
            <Link href="/sign-in" className="navbar-signin-btn">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;