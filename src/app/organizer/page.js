"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import Link from "next/link";
import { useState } from "react";
import {
  Settings, Plus, BarChart2, Users, Calendar, Edit3,
  Archive, Eye, ChevronRight, Shield, Trash2, UserPlus, Loader2
} from "lucide-react";
import { formatDate, isDeadlinePassed } from "../../lib/utils/formatDate";

function EventRow({ event, onArchive }) {
  const deadlinePassed = isDeadlinePassed(event.registrationDeadline);

  return (
    <div
      className="glass-card"
      style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}
    >
      {/* Category icon */}
      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.25rem" }}>
        {event.category === "Technology" ? "💻" : event.category === "Sports" ? "⚽" : event.category === "Arts" ? "🎨" : "📌"}
      </div>

      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{event.title}</h3>
          <span className={`badge badge-${event.organizerRole === "owner" ? "warning" : event.organizerRole === "organizer" ? "primary" : "cyan"}`}>
            <Shield size={10} />{event.organizerRole}
          </span>
          {deadlinePassed ? (
            <span className="badge badge-danger">Closed</span>
          ) : (
            <span className="badge badge-success">Open</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={11} />{formatDate(event.startDate)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Users size={11} />{event.registrationCount ?? 0} registered
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Eye size={11} />{event.viewCount ?? 0} views
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link
          href={`/events/${event._id}`}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", padding: "0.4rem 0.75rem", color: "var(--text-secondary)", fontSize: "0.78rem", transition: "all 0.2s" }}
        >
          <Eye size={13} />View
        </Link>
        {(event.organizerRole === "owner" || event.organizerRole === "organizer") && (
          <>
            <Link
              href={`/analytics?event=${event._id}`}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-md)", padding: "0.4rem 0.75rem", color: "#a5b4fc", fontSize: "0.78rem" }}
            >
              <BarChart2 size={13} />Analytics
            </Link>
            <Link
              href="/qr-checkin"
              style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "var(--radius-md)", padding: "0.4rem 0.75rem", color: "#67e8f9", fontSize: "0.78rem" }}
            >
              <Users size={13} />Check-in
            </Link>
          </>
        )}
        {event.organizerRole === "owner" && deadlinePassed && !event.isArchived && (
          <button
            onClick={() => onArchive(event._id)}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-md)", padding: "0.4rem 0.75rem", color: "#fcd34d", fontSize: "0.78rem", cursor: "pointer" }}
          >
            <Archive size={13} />Archive
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrganizerPage() {
  const { user } = useCurrentUser();
  const [archivingId, setArchivingId] = useState(null);

  const userEvents = useQuery(
    api.events.getUserEvents,
    user ? { userId: user._id } : "skip"
  );
  const archiveEvent = useMutation(api.events.archiveEvent);
  const dashboardStats = useQuery(
    api.analytics.getOrganizerDashboardStats,
    user ? { userId: user._id } : "skip"
  );

  const handleArchive = async (eventId) => {
    if (!confirm("Archive this event? This will mark it as complete and create friendships between team members.")) return;
    setArchivingId(eventId);
    try {
      await archiveEvent({ eventId });
    } finally {
      setArchivingId(null);
    }
  };

  const activeEvents = (userEvents ?? []).filter((e) => !e.isArchived);
  const archivedEvents = (userEvents ?? []).filter((e) => e.isArchived);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={22} color="white" />
              </div>
              Organizer Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>Manage your events, track registrations, and analyze performance</p>
          </div>
          <Link href="/events/create" className="btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}>
            <Plus size={15} />New Event
          </Link>
        </div>

        {/* Stats */}
        {dashboardStats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Events", value: dashboardStats.totalEvents, color: "#6366f1" },
              { label: "Active", value: dashboardStats.activeEvents, color: "#10b981" },
              { label: "Registrations", value: dashboardStats.totalRegistrations, color: "#8b5cf6" },
              { label: "Attendance", value: dashboardStats.totalAttendance, color: "#06b6d4" },
              { label: "Views", value: dashboardStats.totalViews, color: "#f59e0b" },
              { label: "Likes", value: dashboardStats.totalLikes, color: "#ef4444" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card" style={{ padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, fontFamily: "var(--font-display)" }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
          {[
            { href: "/analytics", icon: BarChart2, label: "View Full Analytics", color: "#6366f1" },
            { href: "/qr-checkin", icon: Users, label: "Manage Check-ins", color: "#06b6d4" },
            { href: "/events/archive", icon: Archive, label: "Event Archive", color: "#f59e0b" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <Icon size={18} color={color} />
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{label}</span>
                <ChevronRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
              </div>
            </Link>
          ))}
        </div>

        {/* Active Events */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
            Active Events ({activeEvents.length})
          </h2>
          {userEvents === undefined ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-lg)" }} />)}
            </div>
          ) : activeEvents.length === 0 ? (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>You haven't organized any events yet</p>
              <Link href="/events/create" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.875rem" }}>
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {activeEvents.map((event) => (
                <EventRow key={event._id} event={event} onArchive={handleArchive} />
              ))}
            </div>
          )}
        </div>

        {/* Archived Events */}
        {archivedEvents.length > 0 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
              Archived Events ({archivedEvents.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {archivedEvents.map((event) => (
                <div key={event._id} className="glass-card" style={{ padding: "1.25rem 1.5rem", opacity: 0.7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{event.title}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{formatDate(event.startDate)}</div>
                  </div>
                  <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Archive size={10} />Archived
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
