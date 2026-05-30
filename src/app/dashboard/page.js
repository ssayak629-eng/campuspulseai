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
  Sparkles, ShieldAlert, Award
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
        className="pop-shadow-card"
        style={{
          padding: "1.15rem 1.35rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          cursor: "pointer",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03) rotate(-0.5deg)";
          e.currentTarget.style.boxShadow = `6px 6px 0px 0px ${color}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = "6px 6px 0px 0px var(--border)";
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          background: color,
          border: "2px solid var(--border)",
          borderRadius: "var(--radius-full)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "2px 2px 0px 0px var(--border)"
        }}>
          <Icon size={18} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1.1 }}>
            {value}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.02em", marginTop: "0.15rem" }}>
            {label}
          </div>
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
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
        <Navbar />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div className="skeleton" style={{ height: 44, width: "35%", marginBottom: "2rem" }} />
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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Playful greeting sticker header */}
        <div 
          className="pop-shadow-card"
          style={{ 
            marginBottom: "2.5rem",
            background: "var(--bg-card)",
            padding: "1.5rem",
            position: "relative",
            borderRadius: "var(--radius-md)",
          }}
        >
          {/* Memphis Decorative Accent shape */}
          <div style={{ position: "absolute", top: 12, right: 16, width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent)", border: "2px solid var(--border)", boxShadow: "2px 2px 0px 0px var(--border)" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            <Sparkles size={12} strokeWidth={2.5} />
            ONLINE // SYSTEM_OPERATOR_ACTIVE
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", color: "var(--text-primary)", letterSpacing: "-0.01em", textTransform: "uppercase" }}>
            Welcome back, {user?.name?.split(" ")[0] ?? "Explorer"}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 500, fontFamily: "var(--font-sans)", marginTop: "0.25rem" }}>
            There are <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{events?.length ?? 0} campus events</span> compiled on the ledger.
            {unreadCount > 0 && ` You have ${unreadCount} new alerts in your signal log.`}
          </p>
        </div>

        {/* Tactile pop stat indicators */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
          <StatCard icon={Calendar} label="SYS_EVENTS" value={events?.length ?? "0"} color="var(--color-primary)" href="/events" />
          <StatCard icon={Star} label="REG_NODES" value={userRegistrations?.length ?? "0"} color="var(--color-secondary)" href="/profile" />
          <StatCard icon={Zap} label="SIG_ATTENDED" value={userAttendance?.length ?? "0"} color="var(--color-success)" href="/profile" />
          <StatCard icon={Bell} label="ALERTS_LOGGED" value={unreadCount || "0"} color="var(--color-accent)" href="#" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
          {/* Left panel listings */}
          <div>
            {/* Upcoming speech-bubble schedule cards */}
            {upcomingRegistered.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    ★ UPCOMING SCHEDULE
                  </h2>
                  <Link href="/profile" style={{ color: "var(--color-primary)", fontSize: "0.72rem", fontWeight: 800, fontFamily: "var(--font-display)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    [ VIEW ALL ] <ArrowRight size={12} strokeWidth={2.5} />
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {upcomingRegistered.map((reg) => (
                    <Link key={reg._id} href={`/events/${reg.eventId}`} style={{ textDecoration: "none" }}>
                      <div 
                        className="speech-bubble pop-shadow" 
                        style={{ 
                          padding: "1rem 1.25rem", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          background: "var(--bg-card)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-secondary)";
                          e.currentTarget.style.boxShadow = "4px 4px 0px 0px var(--color-secondary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.boxShadow = "4px 4px 0px 0px var(--border)";
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "var(--font-display)" }}>{reg.event?.title}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                            <Calendar size={10} strokeWidth={2.5} />
                            {getRelativeTime(reg.event?.startDate)}
                          </div>
                        </div>
                        <span className="badge badge-success">✓ Logged</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending events listing sticker cards */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  ★ TRENDING EVENT SIGNALS
                </h2>
                <Link href="/events" style={{ color: "var(--color-primary)", fontSize: "0.72rem", fontWeight: 800, fontFamily: "var(--font-display)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  [ EXPLORE ALL ] <ArrowRight size={12} strokeWidth={2.5} />
                </Link>
              </div>

              {events === undefined ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ border: "2px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                      <div className="skeleton" style={{ height: 100 }} />
                      <div style={{ padding: "1rem" }}>
                        <div className="skeleton" style={{ height: 14, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 10, width: "60%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
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

          {/* Right side telemetry blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Quick Actions candy button lists */}
            <div 
              className="pop-shadow-card" 
              style={{ 
                padding: "1.25rem",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-md)"
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: "0.75rem", fontFamily: "var(--font-display)", letterSpacing: "0.05em", marginBottom: "0.85rem", color: "var(--text-secondary)" }}>
                ★ CMD_EXECUTION_GRID
              </h3>
              {[
                { href: "/events/create", icon: Plus, label: "CREATE EVENT", color: "var(--color-primary)" },
                { href: "/recommendations", icon: Star, label: "GEMINI AI FEED", color: "var(--color-secondary)" },
                { href: "/qr-checkin", icon: QrCode, label: "QR ATTENDANCE", color: "var(--color-accent)" },
                { href: "/analytics", icon: BarChart2, label: "SYS ANALYTICS", color: "var(--color-success)" },
                { href: "/teams", icon: Users, label: "SQUAD MANAGER", color: "var(--color-primary)" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.55rem 0.75rem", borderRadius: "var(--radius-full)",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)", cursor: "pointer", marginBottom: "0.35rem",
                    border: "2px solid transparent",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-elevated)";
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.transform = "scale(1.025)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: "var(--radius-full)", 
                      background: color, 
                      border: "2px solid var(--border)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      flexShrink: 0 
                    }}>
                      <Icon size={12} color="#FFFFFF" strokeWidth={2.5} />
                    </div>
                    <span>{label}</span>
                    <ArrowRight size={12} strokeWidth={2.5} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Trending categories telemetry */}
            {trendingCategories && trendingCategories.length > 0 && (
              <div 
                className="pop-shadow-card" 
                style={{ 
                  padding: "1.25rem",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <h3 style={{ fontWeight: 800, fontSize: "0.75rem", fontFamily: "var(--font-display)", letterSpacing: "0.05em", marginBottom: "0.85rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <TrendingUp size={14} strokeWidth={2.5} /> TOP CATEGORIES
                </h3>
                {trendingCategories.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < 4 ? "2px solid var(--bg-elevated)" : "none", fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 600 }}>
                    <span style={{ color: "var(--text-primary)" }}>● {cat.name.toUpperCase()}</span>
                    <span style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800 }}>
                      {cat.registrations} REG_SIG
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Diagnostic Alert Feed alerts */}
            {notifications.length > 0 && (
              <div 
                className="speech-bubble pop-shadow" 
                style={{ 
                  padding: "1.25rem",
                  background: "var(--bg-card)",
                }}
              >
                <h3 style={{ fontWeight: 800, fontSize: "0.75rem", fontFamily: "var(--font-display)", letterSpacing: "0.05em", marginBottom: "0.85rem", color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldAlert size={14} strokeWidth={2.5} /> SYSTEM ALERTS
                </h3>
                {notifications.slice(0, 4).map((notif) => (
                  <div key={notif._id} style={{ display: "flex", gap: "0.6rem", padding: "0.55rem 0", borderBottom: "2px solid var(--bg-elevated)" }}>
                    <span style={{ fontSize: "1rem" }}>{notifIcons[notif.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>{notif.title}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 500, marginTop: "0.15rem" }}>{getRelativeTime(notif.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Responsive grids */}
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
