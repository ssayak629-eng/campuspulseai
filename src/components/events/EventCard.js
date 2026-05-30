"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";
import { formatDate, getRelativeTime, getDaysUntilDeadline, isDeadlinePassed } from "../../lib/utils/formatDate";

const categoryColors = {
  Technology: { bg: "rgba(99,102,241,0.15)", text: "#a5b4fc", border: "rgba(99,102,241,0.3)" },
  Sports: { bg: "rgba(16,185,129,0.15)", text: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
  Arts: { bg: "rgba(245,158,11,0.15)", text: "#fcd34d", border: "rgba(245,158,11,0.3)" },
  Academic: { bg: "rgba(6,182,212,0.15)", text: "#67e8f9", border: "rgba(6,182,212,0.3)" },
  Cultural: { bg: "rgba(251,113,133,0.15)", text: "#fda4af", border: "rgba(251,113,133,0.3)" },
  Career: { bg: "rgba(139,92,246,0.15)", text: "#c4b5fd", border: "rgba(139,92,246,0.3)" },
  Social: { bg: "rgba(251,146,60,0.15)", text: "#fdba74", border: "rgba(251,146,60,0.3)" },
  Health: { bg: "rgba(52,211,153,0.15)", text: "#6ee7b7", border: "rgba(52,211,153,0.3)" },
  Other: { bg: "rgba(156,163,175,0.12)", text: "#d1d5db", border: "rgba(156,163,175,0.2)" },
};

export function EventCard({ event, userId, liked = false, registered = false, compact = false }) {
  const toggleLike = useMutation(api.events.toggleLike);

  const catColor = categoryColors[event.category] ?? categoryColors.Other;
  const deadlinePassed = isDeadlinePassed(event.registrationDeadline);
  const daysLeft = getDaysUntilDeadline(event.registrationDeadline);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    await toggleLike({ eventId: event._id, userId });
  };

  return (
    <Link
      href={`/events/${event._id}`}
      id={`event-card-${event._id}`}
      style={{
        display: "block",
        textDecoration: "none",
        background: "rgba(17,24,39,0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "all 0.25s ease",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Poster / Category Banner */}
      {event.posterUrl ? (
        <div style={{ height: 160, overflow: "hidden" }}>
          <img
            src={event.posterUrl}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          style={{
            height: compact ? 80 : 120,
            background: `linear-gradient(135deg, ${catColor.bg.replace("0.15", "0.4")}, ${catColor.bg})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: compact ? "2rem" : "2.5rem",
              opacity: 0.6,
              filter: "blur(1px)",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            {event.category === "Technology" ? "💻" :
             event.category === "Sports" ? "⚽" :
             event.category === "Arts" ? "🎨" :
             event.category === "Academic" ? "📚" :
             event.category === "Cultural" ? "🎭" :
             event.category === "Career" ? "💼" :
             event.category === "Social" ? "🎉" :
             event.category === "Health" ? "🧘" : "📌"}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: compact ? "0.875rem" : "1.125rem" }}>
        {/* Category + Deadline badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.25rem" }}>
          <span style={{
            padding: "0.2rem 0.65rem",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: 600,
            background: catColor.bg,
            color: catColor.text,
            border: `1px solid ${catColor.border}`,
          }}>
            {event.category}
          </span>
          {!deadlinePassed && daysLeft <= 3 && (
            <span style={{
              padding: "0.2rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              background: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
            }}>
              🔥 {daysLeft}d left
            </span>
          )}
          {registered && (
            <span style={{
              padding: "0.2rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              background: "rgba(16,185,129,0.15)",
              color: "#6ee7b7",
              border: "1px solid rgba(16,185,129,0.3)",
            }}>
              ✓ Registered
            </span>
          )}
        </div>

        <h3 style={{
          fontWeight: 700,
          fontSize: compact ? "0.9rem" : "1rem",
          lineHeight: 1.3,
          marginBottom: "0.5rem",
          fontFamily: "var(--font-display)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {event.title}
        </h3>

        {!compact && (
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            lineHeight: 1.5,
            marginBottom: "0.75rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {event.description}
          </p>
        )}

        {/* Meta info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            <Calendar size={12} />
            {formatDate(event.startDate)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            <MapPin size={12} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* Tags */}
        {!compact && event.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.875rem" }}>
            {event.tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                fontSize: "0.7rem",
                background: "rgba(255,255,255,0.05)",
                color: "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Users size={12} />
              {event.registrationCount ?? 0}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Heart size={12} color={liked ? "#ef4444" : undefined} fill={liked ? "#ef4444" : "none"} />
              {event.likeCount ?? 0}
            </span>
          </div>

          <button
            onClick={handleLike}
            style={{
              background: liked ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${liked ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "0.3rem 0.6rem",
              cursor: userId ? "pointer" : "default",
              color: liked ? "#fca5a5" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              transition: "all 0.15s",
            }}
          >
            <Heart size={12} fill={liked ? "currentColor" : "none"} />
            {liked ? "Liked" : "Like"}
          </button>
        </div>
      </div>
    </Link>
  );
}
