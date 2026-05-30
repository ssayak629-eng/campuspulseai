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
  Calendar,
  Home,
  Star,
  BarChart2,
  QrCode,
  Users,
  User,
  ChevronRight,
  Sun,
  Moon,
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
  const [theme, setTheme] = useState("light");

  // Load the initial theme state on client mount
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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
          background: "var(--bg-card)",
          borderBottom: "3px solid var(--border)",
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
            height: "68px",
            gap: "1rem",
          }}
        >
          {/* Logo brand using Outfit ExtraBold and brand violet */}
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
                width: 34,
                height: 34,
                borderRadius: "var(--radius-full)",
                background: "var(--color-accent)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              }}
            >
              <Zap size={16} color="var(--border)" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.25rem",
                color: "var(--border)",
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              Campus<span style={{ color: "var(--color-primary)" }}>Pulse</span>
            </span>
          </Link>

          {/* Right Section tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
            {/* Theme toggler pill button */}
            <button
              onClick={toggleTheme}
              className="animate-wiggle"
              aria-label="Toggle light and dark mode theme"
              style={{
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
                borderRadius: "var(--radius-full)",
                width: 72,
                height: 40,
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "0 4px",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
              }}
            >
              {/* Sliding switch bubble */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-full)",
                  background: theme === "light" ? "var(--color-accent)" : "var(--color-primary)",
                  border: "2px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: theme === "light" ? "translateX(0)" : "translateX(30px)",
                }}
              >
                {theme === "light" ? (
                  <Sun size={14} color="var(--border)" strokeWidth={2.5} />
                ) : (
                  <Moon size={14} color="#FFFDF5" strokeWidth={2.5} />
                )}
              </div>
            </button>

            {/* Notifications Alert pill */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                id="notifications-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: "relative",
                  background: "var(--bg-card)",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
                }}
              >
                <Bell size={16} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="notification-dot" style={{ background: "var(--color-secondary)" }} />
                )}
              </button>

              {/* Notification Speech Bubble Dropdown */}
              {notifOpen && (
                <div
                  className="speech-bubble pop-shadow"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: 350,
                    background: "var(--bg-card)",
                    zIndex: 100,
                  }}
                >
                  {/* Speech Bubble Arrow Indicator */}
                  <div style={{
                    position: "absolute",
                    top: -10,
                    right: 14,
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderBottom: "10px solid var(--border)",
                  }} />

                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.85rem 1.15rem",
                      background: "var(--bg-elevated)",
                      borderBottom: "2px solid var(--border)",
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: "0.78rem", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      🔔 SYSTEM_ALERTS
                      {unreadCount > 0 && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            background: "var(--color-secondary)",
                            color: "white",
                            borderRadius: "var(--radius-full)",
                            padding: "0.1rem 0.5rem",
                            fontSize: "0.68rem",
                          }}
                        >
                          {unreadCount} NEW
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
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "var(--color-primary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          textTransform: "uppercase",
                        }}
                      >
                        [ Clear All ]
                      </button>
                    )}
                  </div>

                  {/* Scrollable list */}
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "2.5rem 1.5rem",
                          textAlign: "center",
                          color: "var(--text-secondary)",
                          fontSize: "0.78rem",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        No active signals to display
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead({ notificationId: notif._id })}
                          style={{
                            padding: "0.85rem 1.15rem",
                            borderBottom: "2px solid var(--border)",
                            cursor: "pointer",
                            display: "flex",
                            gap: "0.75rem",
                            background: notif.isRead
                              ? "transparent"
                              : "rgba(139, 92, 246, 0.04)",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? "transparent" : "rgba(139, 92, 246, 0.04)"}
                        >
                          <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.15rem" }}>
                            {notificationIcons[notif.type] ?? "📢"}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: notif.isRead ? 600 : 800,
                                fontSize: "0.8rem",
                                color: "var(--text-primary)",
                                marginBottom: "0.15rem",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {notif.title}
                            </p>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.75rem",
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
                                fontSize: "0.68rem",
                                marginTop: "0.25rem",
                                fontFamily: "var(--font-sans)",
                                fontWeight: 500,
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
                                background: "var(--color-secondary)",
                                border: "1.5px solid var(--border)",
                                borderRadius: "var(--radius-full)",
                                flexShrink: 0,
                                marginTop: 6,
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

            {/* Create Event structured as pill candy primary button */}
            <Link 
              href="/events/create" 
              className="btn-primary" 
              style={{ 
                fontSize: "0.75rem", 
                padding: "0.5rem 1.35rem", 
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              + Create Event
            </Link>

            {/* User Avatar fitted in thick-bordered circle */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
              border: "2px solid var(--border)",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-full)",
              boxShadow: "2px 2px 0px 0px var(--shadow-color)"
            }}>
              <UserButton afterSignOutUrl="/" />
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "2px solid var(--border)",
                padding: "0.45rem",
                cursor: "pointer",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-full)",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)"
              }}
            >
              {mobileOpen ? <X size={16} strokeWidth={2.5} /> : <Menu size={16} strokeWidth={2.5} />}
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
            background: "rgba(30,41,59,0.3)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: 70,
              right: "max(1.5rem, calc((100% - 1200px)/2 + 1.5rem))",
              width: "280px",
              background: "var(--bg-card)",
              border: "3px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              boxShadow: "6px 6px 0px 0px var(--shadow-color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1.25rem",
                    textDecoration: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    color: isActive ? "#FFFFFF" : "var(--text-primary)",
                    background: isActive
                      ? "var(--color-primary)"
                      : "transparent",
                    border: isActive ? "2px solid var(--border)" : "2px solid transparent",
                    marginBottom: "0.35rem",
                    borderRadius: "var(--radius-full)",
                    boxShadow: isActive ? "2px 2px 0px 0px var(--shadow-color)" : "none",
                  }}
                >
                  <Icon size={15} strokeWidth={2.5} />
                  {label}
                  <ChevronRight size={14} style={{ marginLeft: "auto", opacity: isActive ? 1 : 0.3 }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
