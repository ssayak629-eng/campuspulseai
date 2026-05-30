"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNotifications } from "../../hooks/useNotifications";
import {
  Bell,
  Zap,
  Menu,
  X,
  Search,
  Calendar,
  Home,
  Star,
  BarChart2,
  QrCode,
  Users,
  User,
  Settings,
  ChevronRight,
} from "lucide-react";
import { getRelativeTime } from "../../lib/utils/formatDate";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/recommendations", label: "For You", icon: Star },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/qr-checkin", label: "QR Check-in", icon: QrCode },
  { href: "/profile", label: "Profile", icon: User },
];

const notificationIcons = {
  registration: "🎟️",
  organizer_invite: "👑",
  recommendation: "✨",
  event_reminder: "⏰",
  team_invite: "🤝",
  friend: "👥",
  general: "📢",
};

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(user?._id);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        suppressHydrationWarning
        style={{
          background: "rgba(10, 15, 30, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="page-container"
          style={{
            display: "flex",
            alignItems: "center",
            height: "64px",
            gap: "1rem",
          }}
        >
          {/* Logo */}
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CampusPulseAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              flex: 1,
              marginLeft: "1rem",
            }}
            className="hidden-mobile"
          >
            {navLinks.slice(0, 6).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  color: pathname.startsWith(href)
                    ? "#a5b4fc"
                    : "var(--text-secondary)",
                  background: pathname.startsWith(href)
                    ? "rgba(99,102,241,0.12)"
                    : "transparent",
                  border: pathname.startsWith(href)
                    ? "1px solid rgba(99,102,241,0.25)"
                    : "1px solid transparent",
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginLeft: "auto",
            }}
          >
            {/* Notifications */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                id="notifications-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 360,
                    background: "rgba(17,24,39,0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.25rem",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Notifications
                      {unreadCount > 0 && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            background: "var(--color-primary)",
                            color: "white",
                            borderRadius: "9999px",
                            padding: "0.1rem 0.45rem",
                            fontSize: "0.7rem",
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead();
                          setNotifOpen(false);
                        }}
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-primary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          color: "var(--text-muted)",
                          fontSize: "0.875rem",
                        }}
                      >
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() =>
                            markAsRead({ notificationId: notif._id })
                          }
                          style={{
                            padding: "0.875rem 1.25rem",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            cursor: "pointer",
                            display: "flex",
                            gap: "0.75rem",
                            background: notif.isRead
                              ? "transparent"
                              : "rgba(99,102,241,0.05)",
                            transition: "background 0.2s",
                          }}
                        >
                          <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>
                            {notificationIcons[notif.type] ?? "📢"}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: notif.isRead ? 400 : 600,
                                fontSize: "0.85rem",
                                marginBottom: "0.2rem",
                              }}
                            >
                              {notif.title}
                            </p>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.78rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {notif.message}
                            </p>
                            <p
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "0.72rem",
                                marginTop: "0.25rem",
                              }}
                            >
                              {getRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "var(--color-primary)",
                                flexShrink: 0,
                                marginTop: 4,
                              }}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Create Event */}
            <Link
              href="/events/create"
              className="btn-primary"
              style={{
                fontSize: "0.85rem",
                padding: "0.45rem 1rem",
                textDecoration: "none",
              }}
            >
              + Create Event
            </Link>

            {/* User Avatar */}
            <UserButton afterSignOutUrl="/" />

            {/* Mobile menu */}
            <button
              className="mobile-only"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "white",
                display: "none",
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.6)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              right: 0,
              background: "rgba(17,24,39,0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: pathname.startsWith(href)
                    ? "#a5b4fc"
                    : "var(--text-secondary)",
                  background: pathname.startsWith(href)
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
                  marginBottom: "0.25rem",
                }}
              >
                <Icon size={18} />
                {label}
                <ChevronRight size={14} style={{ marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
