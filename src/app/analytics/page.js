"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  BarChart2, TrendingUp, Users, Eye, Heart, Calendar, Award,
  ShieldAlert, LayoutDashboard, ChevronRight, MousePointer, Info, Loader2
} from "lucide-react";

const COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.4rem" }}>{label}</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.3rem" }}>{sub}</p>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: `${color}1a`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", fontSize: "0.8rem" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.3rem" }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontWeight: 600 }}>{entry.name}: {entry.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user } = useCurrentUser();
  
  // Get all events organized by this user
  const userEvents = useQuery(
    api.events.getUserEvents,
    user ? { userId: user._id } : "skip"
  );

  const organizerEvents = (userEvents ?? []).filter(
    (e) => e.organizerRole === "owner" || e.organizerRole === "organizer" || e.organizerRole === "volunteer"
  );

  const [selectedEventId, setSelectedEventId] = useState("");

  // Default to first organizer event once loaded
  useEffect(() => {
    if (organizerEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(organizerEvents[0]._id);
    }
  }, [organizerEvents, selectedEventId]);

  // Queries for the selected event
  const eventAnalytics = useQuery(
    api.analytics.getEventAnalytics,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  const ctrStats = useQuery(
    api.analytics.getRecommendationCTR,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  // loading state
  if (!user || userEvents === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 1.5rem", display: "flex", justifyContent: "center" }}>
          <Loader2 size={36} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  // RESTRICTION: Only organizers, admins, or volunteers can view analytics
  const isOrganizer = user.role === "organizer" || user.role === "admin" || user.role === "volunteer";

  if (!isOrganizer) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <main style={{ maxWidth: 600, margin: "6rem auto", padding: "0 1.5rem" }}>
          <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <ShieldAlert size={36} color="#ef4444" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.75rem", color: "#fca5a5" }}>
              Organizer Access Only
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Detailed event performance metrics, registration graphs, and AI recommendation click-through rates are strictly reserved for event organizers and staff roles.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <a href="/dashboard" className="btn-primary" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
                Return to Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If the organizer doesn't have any events
  if (organizerEvents.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <main style={{ maxWidth: 640, margin: "6rem auto", padding: "0 1.5rem" }}>
          <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", borderStyle: "dashed" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📊</div>
            <h2 style={{ fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "0.5rem" }}>
              No Events to Analyze Yet
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              You are registered as an Organizer, but you haven't created or been added to any active events. Create your first campus event to unlock real-time attendee insights!
            </p>
            <a href="/events/create" className="btn-primary" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
              + Create First Event
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Setup formatted chart data
  const timelineData = eventAnalytics?.registrationTimeline ?? [];
  
  const interactionData = eventAnalytics?.interactions
    ? Object.entries(eventAnalytics.interactions).map(([type, count]) => ({
        name: type.toUpperCase(),
        count: count,
      }))
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Top Control Header */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
          gap: "1.5rem", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <BarChart2 size={28} color="#6366f1" />
              Event Analytics
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Select an event to view real-time registrations, views, and attendee conversions.
            </p>
          </div>

          {/* Event Dropdown Selector */}
          <div style={{ width: "100%", maxWidth: "340px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Select Active Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input-field"
              style={{ paddingRight: "2rem" }}
            >
              {organizerEvents.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>

        {eventAnalytics === undefined ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
            <Loader2 size={36} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div>
            {/* Event Header Summary */}
            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(17,24,39,0.8) 100%)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#818cf8", background: "rgba(99,102,241,0.15)", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontWeight: 600, textTransform: "uppercase" }}>
                    {eventAnalytics.event?.category || "General"}
                  </span>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "white", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                    {eventAnalytics.event?.title}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    📍 {eventAnalytics.event?.venue} · 📅 Starts {new Date(eventAnalytics.event?.startDate ?? 0).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={`/events/${selectedEventId}`} className="btn-ghost" style={{ fontSize: "0.8rem", textDecoration: "none", padding: "0.5rem 1rem" }}>
                    View Event Details
                  </a>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <StatCard icon={Users} label="Registrations" value={eventAnalytics.registrationCount} color="#6366f1" />
              <StatCard icon={Award} label="Checked In" value={eventAnalytics.attendanceCount} color="#10b981" sub={`${eventAnalytics.attendanceRate}% Attendance Rate`} />
              <StatCard icon={MousePointer} label="AI Rec CTR" value={ctrStats ? `${ctrStats.ctr.toFixed(1)}%` : "0.0%"} color="#06b6d4" sub={ctrStats ? `${ctrStats.clicks} clicks / ${ctrStats.views} views` : ""} />
              <StatCard icon={Eye} label="Page Views" value={eventAnalytics.viewCount} color="#f59e0b" />
              <StatCard icon={Heart} label="Likes" value={eventAnalytics.likeCount} color="#ef4444" />
            </div>

            {/* Recharts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Registration Trend Area Chart */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TrendingUp size={16} color="#6366f1" />
                  Registration Trend (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="registrations" stroke="#6366f1" fillOpacity={1} fill="url(#regGrad)" strokeWidth={2} name="New Registrations" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Interactions Bar Chart */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BarChart2 size={16} color="#06b6d4" />
                  Attendee Interactions
                </h3>
                {interactionData.length === 0 ? (
                  <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    <Info size={24} style={{ marginBottom: "0.5rem" }} />
                    No interactions recorded for this event yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={interactionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#06b6d4" name="Interaction Count" radius={[4, 4, 0, 0]}>
                        {interactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Attendance Rate Progress Funnel */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>
                Attendance Funnel Conversion
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    <span>Registered Attendees</span>
                    <strong>{eventAnalytics.registrationCount}</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: "9999px" }}>
                    <div style={{ height: "100%", width: "100%", background: "#6366f1", borderRadius: "9999px" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    <span>Checked In (Attended)</span>
                    <strong>{eventAnalytics.attendanceCount} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({eventAnalytics.attendanceRate}%)</span></strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: "9999px" }}>
                    <div style={{ height: "100%", width: `${eventAnalytics.attendanceRate}%`, background: "#10b981", borderRadius: "9999px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          main div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
