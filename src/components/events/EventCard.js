"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Calendar,
  MapPin,
  Users,
  Heart,
} from "lucide-react";
import { formatDate, getDaysUntilDeadline, isDeadlinePassed } from "../../lib/utils/formatDate";

const categoryColors = {
  Technology: { bg: "var(--color-primary)", text: "#FFFFFF", name: "Tech node" },
  Sports: { bg: "var(--color-accent)", text: "var(--text-primary)", name: "Sports" },
  Arts: { bg: "var(--color-secondary)", text: "#FFFFFF", name: "Art deck" },
  Academic: { bg: "var(--color-success)", text: "var(--text-primary)", name: "Academic" },
  Cultural: { bg: "var(--color-secondary)", text: "#FFFFFF", name: "Cultural" },
  Career: { bg: "var(--color-primary)", text: "#FFFFFF", name: "Career" },
  Social: { bg: "var(--color-accent)", text: "var(--text-primary)", name: "Social" },
  Health: { bg: "var(--color-success)", text: "var(--text-primary)", name: "Health" },
  Other: { bg: "var(--bg-elevated)", text: "var(--text-primary)", name: "General" },
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
        background: "var(--bg-card)",
        border: "2px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        height: "100%",
        position: "relative",
        boxShadow: "4px 4px 0px 0px var(--shadow-color)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.025) rotate(-1deg)";
        e.currentTarget.style.boxShadow = "6px 6px 0px 0px var(--color-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) rotate(0deg)";
        e.currentTarget.style.boxShadow = "4px 4px 0px 0px var(--shadow-color)";
      }}
    >
      {/* Decorative colored header edge strip */}
      <div style={{ height: 6, width: "100%", background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))` }} />

      {/* Poster Image */}
      {event.posterUrl ? (
        <div style={{ height: compact ? 100 : 140, overflow: "hidden", borderBottom: "2px solid var(--border)" }}>
          <img
            src={event.posterUrl}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          style={{
            height: compact ? 70 : 100,
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderBottom: "2px solid var(--border)",
          }}
        >
          {/* Memphis Squiggle/Shape Background Accent */}
          <div style={{
            position: "absolute",
            width: 40,
            height: 40,
            borderRadius: "var(--radius-full)",
            background: "var(--color-accent)",
            opacity: 0.3,
            top: "20%",
            left: "40%",
          }} />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ★ CAMPUS_PULSE ★
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: compact ? "0.85rem" : "1.15rem" }}>
        {/* Category Badge & Status Codes */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.35rem" }}>
          <span style={{
            padding: "0.2rem 0.75rem",
            fontSize: "0.68rem",
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            background: catColor.bg,
            color: catColor.text,
            border: "2px solid var(--border)",
            borderRadius: "var(--radius-full)",
            boxShadow: "1.5px 1.5px 0px 0px var(--border)",
          }}>
            {event.category}
          </span>
          {!deadlinePassed && daysLeft <= 3 && (
            <span style={{
              padding: "0.2rem 0.75rem",
              fontSize: "0.68rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              background: "var(--color-accent)",
              color: "var(--text-primary)",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-full)",
              boxShadow: "1.5px 1.5px 0px 0px var(--border)",
            }}>
              ⏳ {daysLeft}d left!
            </span>
          )}
          {registered && (
            <span style={{
              padding: "0.2rem 0.75rem",
              fontSize: "0.68rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              background: "var(--color-success)",
              color: "var(--text-primary)",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-full)",
              boxShadow: "1.5px 1.5px 0px 0px var(--border)",
            }}>
              ✓ Joined
            </span>
          )}
        </div>

        <h3 style={{
          fontWeight: 800,
          fontSize: compact ? "0.88rem" : "0.98rem",
          lineHeight: 1.3,
          marginBottom: "0.5rem",
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
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
            fontSize: "0.75rem",
            lineHeight: 1.5,
            marginBottom: "0.85rem",
            fontFamily: "var(--font-sans)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {event.description}
          </p>
        )}

        {/* Playful Geometric Metadata Labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <Calendar size={10} strokeWidth={2.5} />
            </div>
            {formatDate(event.startDate)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <MapPin size={10} strokeWidth={2.5} />
            </div>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.venue}</span>
          </div>
        </div>

        {/* Tags capsules list */}
        {!compact && event.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.85rem" }}>
            {event.tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{
                padding: "0.15rem 0.55rem",
                fontSize: "0.68rem",
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-full)",
              }}>
                #{tag.toLowerCase()}
              </span>
            ))}
          </div>
        )}

        {/* Card bottom footer with wiggling Like pills */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", color: "var(--text-primary)", fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Users size={12} strokeWidth={2.5} color="var(--color-primary)" />
              {event.registrationCount ?? 0}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Heart size={12} strokeWidth={2.5} color={liked ? "var(--color-secondary)" : "var(--text-muted)"} fill={liked ? "var(--color-secondary)" : "none"} />
              {event.likeCount ?? 0}
            </span>
          </div>

          <button
            onClick={handleLike}
            style={{
              background: liked ? "var(--color-secondary)" : "var(--bg-card)",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-full)",
              padding: "0.3rem 0.75rem",
              cursor: userId ? "pointer" : "default",
              color: liked ? "#FFFFFF" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.7rem",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              letterSpacing: "0.02em",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: liked ? "2px 2px 0px 0px var(--shadow-color)" : "none",
            }}
            onMouseEnter={(e) => {
              if (userId && !liked) {
                e.currentTarget.style.background = "var(--color-secondary)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (userId && !liked) {
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <Heart size={11} fill={liked ? "currentColor" : "none"} strokeWidth={2.5} />
            {liked ? "Liked!" : "Like"}
          </button>
        </div>
      </div>
    </Link>
  );
}
