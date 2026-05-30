"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from "recharts";
import { BarChart2, TrendingUp, Users, Eye, Heart, Calendar, Award } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

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
  const stats = useQuery(
    api.analytics.getOrganizerDashboardStats,
    user ? { userId: user._id } : "skip"
  );
  const trending = useQuery(api.analytics.getTrendingCategories);

  if (!user || stats === undefined || trending === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div className="skeleton" style={{ height: 40, width: "40%", marginBottom: "2rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  const trendingData = trending.slice(0, 8).map((c) => ({
    name: c.name,
    registrations: c.registrations,
    likes: c.likes,
    views: c.views,
  }));

  const eventPerformance = (stats.events ?? []).slice(0, 8).map((e) => ({
    name: e.title.slice(0, 20) + (e.title.length > 20 ? "…" : ""),
    registrations: e.registrationCount ?? 0,
    attendance: e.attendanceCount ?? 0,
    views: e.viewCount ?? 0,
    likes: e.likeCount ?? 0,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <BarChart2 size={28} color="#6366f1" />
            Analytics Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Performance overview for all your events
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents} color="#6366f1" />
          <StatCard icon={Calendar} label="Active Events" value={stats.activeEvents} color="#10b981" />
          <StatCard icon={Users} label="Total Registrations" value={stats.totalRegistrations} color="#8b5cf6" />
          <StatCard icon={Award} label="Total Attendance" value={stats.totalAttendance} color="#06b6d4" sub={`${stats.totalRegistrations > 0 ? Math.round((stats.totalAttendance / stats.totalRegistrations) * 100) : 0}% rate`} />
          <StatCard icon={Eye} label="Total Views" value={stats.totalViews} color="#f59e0b" />
          <StatCard icon={Heart} label="Total Likes" value={stats.totalLikes} color="#ef4444" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Trending Categories Bar Chart */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={16} color="#6366f1" />
              Trending Categories
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="registrations" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="likes" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart2 size={16} color="#8b5cf6" />
              Registration Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trendingData.filter((d) => d.registrations > 0)}
                  dataKey="registrations"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {trendingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Performance Table */}
        {eventPerformance.length > 0 && (
          <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem" }}>
              Event Performance Comparison
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                <Bar dataKey="registrations" name="Registrations" fill="#6366f1" radius={[0,4,4,0]} />
                <Bar dataKey="attendance" name="Attendance" fill="#10b981" radius={[0,4,4,0]} />
                <Bar dataKey="views" name="Views" fill="#f59e0b" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.events?.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>No events to analyze yet</p>
            <p>Create your first event to see analytics here</p>
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
