"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Navbar from "../../../components/layout/Navbar";
import Link from "next/link";
import { Archive, Calendar, MapPin, Users, Award, Image, Film } from "lucide-react";
import { formatDate } from "../../../lib/utils/formatDate";

function ArchiveCard({ item }) {
  const { event, archive } = item;
  if (!event || !archive) return null;

  return (
    <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Event banner */}
      <div style={{
        height: 120, borderRadius: "var(--radius-md)", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {event.posterUrl ? (
          <img src={event.posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ fontSize: "3rem", opacity: 0.4 }}>🗂️</div>
        )}
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.6)", borderRadius: "9999px",
          padding: "0.2rem 0.6rem", fontSize: "0.7rem", color: "#d1d5db",
          display: "flex", alignItems: "center", gap: "0.3rem",
        }}>
          <Archive size={10} />Archived
        </div>
      </div>

      <div>
        <span className="badge badge-primary" style={{ marginBottom: "0.5rem", display: "inline-block" }}>
          {event.category}
        </span>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", lineHeight: 1.3 }}>
          {event.title}
        </h3>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
            <Calendar size={11} />{formatDate(event.startDate)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
            <MapPin size={11} />{event.venue}
          </div>
        </div>

        {/* Archive stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981" }}>{archive.attendanceCount}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Attended</div>
          </div>
          {archive.feedbackScore != null && (
            <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b" }}>
                {archive.feedbackScore.toFixed(1)}/5
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Rating</div>
            </div>
          )}
        </div>

        {/* Photos & Recordings indicators */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          {archive.photos?.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#a5b4fc" }}>
              <Image size={11} />{archive.photos.length} photos
            </span>
          )}
          {archive.recordings?.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#67e8f9" }}>
              <Film size={11} />{archive.recordings.length} recordings
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const archives = useQuery(api.archives.listArchives);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem",
            marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Archive size={22} color="white" />
            </div>
            Event Archive
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {archives ? `${archives.length} completed events archived` : "Loading archives..."}
          </p>
        </div>

        {archives === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 120 }} />
                <div style={{ padding: "1rem" }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 8, width: "60%" }} />
                  <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 60 }} />
                </div>
              </div>
            ))}
          </div>
        ) : archives.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--text-muted)" }}>
            <Archive size={56} style={{ margin: "0 auto 1.25rem", opacity: 0.2 }} />
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>No archived events yet</p>
            <p>Events appear here after they conclude and are archived by organizers.</p>
            <Link href="/events" className="btn-primary" style={{ display: "inline-flex", marginTop: "1.5rem", textDecoration: "none", fontSize: "0.875rem" }}>
              Browse Active Events
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {archives.map((item) => (
              <ArchiveCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
