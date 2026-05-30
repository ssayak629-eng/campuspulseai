"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNotifications } from "../../hooks/useNotifications";
import Navbar from "../../components/layout/Navbar";
import { EventCard } from "../../components/events/EventCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, Bell, Star, Zap, BarChart2,
  QrCode, Users, TrendingUp, Plus, ArrowRight,
} from "lucide-react";
import { getRelativeTime } from "../../lib/utils/formatDate";
import { useEffect } from "react";

const notifIcons = {
  registration: "🎟️", organizer_invite: "👑", recommendation: "✨",
  event_reminder: "⏰", team_invite: "🤝", friend: "👥", general: "📢",
};

function StatCard({ icon: Icon, label, value, color, href }) {
  return (
    <Link href={href ?? "#"} style={{ textDecoration: "none" }}>
      <div
        className="glass-card"
        style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}
      >
        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: `${color}1a`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{label}</div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { notifications, unreadCount } = useNotifications(user?._id);

  const events = useQuery(api.events.listActiveEvents, { limit: 6 });
  const userRegistrations = useQuery(
    api.registrations.getUserRegistrations,
    user ? { userId: user._id } : "skip"
  );
  const userAttendance = useQuery(
    api.attendance.getUserAttendance,
    user ? { userId: user._id } : "skip"
  );
  const trendingCategories = useQuery(api.analytics.getTrendingCategories);

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (isLoaded && user && !user.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div className="skeleton" style={{ height: 40, width: "40%", marginBottom: "2rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
          </div>
        </div>
      </div>
    );
  }

  const registeredEventIds = new Set((userRegistrations ?? []).map((r) => r.eventId));
  const upcomingRegistered = (userRegistrations ?? [])
    .filter((r) => r.event && !r.event.isArchived && r.event.startDate > Date.now())
    .sort((a, b) => a.event.startDate - b.event.startDate)
    .slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Greeting */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.35rem" }}>
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {events ? `${events.length} active events on campus` : "Loading your dashboard..."}
            {unreadCount > 0 && ` · ${unreadCount} new notification${unreadCount > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          <StatCard icon={Calendar} label="Upcoming Events" value={events?.length ?? "—"} color="#6366f1" href="/events" />
          <StatCard icon={Star} label="Registered" value={userRegistrations?.length ?? "—"} color="#8b5cf6" href="/profile" />
          <StatCard icon={Zap} label="Attended" value={userAttendance?.length ?? "—"} color="#06b6d4" href="/profile" />
          <StatCard icon={Bell} label="Notifications" value={unreadCount || "0"} color="#f59e0b" href="#" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
          {/* Left: Events + Upcoming */}
          <div>
            {/* Upcoming Registered */}
            {upcomingRegistered.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
                    Your Upcoming Events
                  </h2>
                  <Link href="/profile" style={{ color: "#a5b4fc", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {upcomingRegistered.map((reg) => (
                    <Link key={reg._id} href={`/events/${reg.eventId}`} style={{ textDecoration: "none" }}>
                      <div className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: "0.2rem", fontSize: "0.9rem" }}>{reg.event?.title}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Calendar size={11} />
                            {getRelativeTime(reg.event?.startDate)}
                          </div>
                        </div>
                        <span className="badge badge-success">Registered ✓</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Events */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
                  Trending Events
                </h2>
                <Link href="/events" style={{ color: "#a5b4fc", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  Browse all <ArrowRight size={13} />
                </Link>
              </div>

              {events === undefined ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div className="skeleton" style={{ height: 100 }} />
                      <div style={{ padding: "1rem" }}>
                        <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: "70%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                  {(events ?? []).slice(0, 6).map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      userId={user?._id}
                      registered={registeredEventIds.has(event._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Quick actions */}
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.875rem", color: "var(--text-secondary)" }}>
                QUICK ACTIONS
              </h3>
              {[
                { href: "/events/create", icon: Plus, label: "Create Event", color: "#6366f1" },
                { href: "/recommendations", icon: Star, label: "AI For You", color: "#8b5cf6" },
                { href: "/qr-checkin", icon: QrCode, label: "QR Check-in", color: "#06b6d4" },
                { href: "/analytics", icon: BarChart2, label: "Analytics", color: "#10b981" },
                { href: "/teams", icon: Users, label: "Teams", color: "#f59e0b" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 0.75rem", borderRadius: "var(--radius-md)",
                    transition: "background 0.2s", cursor: "pointer", marginBottom: "0.25rem",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}1a`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={15} color={color} />
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{label}</span>
                    <ArrowRight size={13} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Trending categories */}
            {trendingCategories && trendingCategories.length > 0 && (
              <div className="glass-card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.875rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <TrendingUp size={14} /> TRENDING CATEGORIES
                </h3>
                {trendingCategories.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {cat.registrations} reg
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent notifications */}
            {notifications.length > 0 && (
              <div className="glass-card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.875rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Bell size={14} /> RECENT NOTIFICATIONS
                </h3>
                {notifications.slice(0, 4).map((notif) => (
                  <div key={notif._id} style={{ display: "flex", gap: "0.6rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "1rem" }}>{notifIcons[notif.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notif.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{getRelativeTime(notif.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Responsive override */}
      <style jsx>{`
        @media (max-width: 900px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
