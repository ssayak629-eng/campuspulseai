"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useEventOrganizer } from "../../../hooks/useEventOrganizer";
import Navbar from "../../../components/layout/Navbar";
import { QRCodeDisplay } from "../../../components/qr/QRCodeDisplay";
import {
  Calendar, MapPin, Users, Heart, Clock, Tag, ArrowLeft,
  Edit, Trash2, QrCode, UserPlus, Shield, Eye
} from "lucide-react";
import { formatDate, formatDateTime, getDaysUntilDeadline, isDeadlinePassed } from "../../../lib/utils/formatDate";
import { useState } from "react";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("details");
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const event = useQuery(api.events.getEventById, { eventId });
  const registration = useQuery(
    api.registrations.isRegistered,
    user && eventId ? { eventId, userId: user._id } : "skip"
  );
  const liked = useQuery(
    api.events.isLiked,
    user && eventId ? { eventId, userId: user._id } : "skip"
  );
  const organizers = useQuery(api.organizers.getEventOrganizers, { eventId });
  const registrations = useQuery(api.registrations.getEventRegistrations, { eventId });
  const { canEdit, canDelete, isOwner, canCheckIn, role: userRole } = useEventOrganizer(eventId, user?._id);

  const registerMutation = useMutation(api.registrations.registerForEvent);
  const unregisterMutation = useMutation(api.registrations.unregisterFromEvent);
  const toggleLike = useMutation(api.events.toggleLike);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const incrementView = useMutation(api.events.incrementEventView);

  // Track view on mount
  useState(() => {
    if (eventId) incrementView({ eventId }).catch(() => {});
  });

  const handleRegister = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await registerMutation({ eventId, userId: user._id });
      setShowQR(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await unregisterMutation({ eventId, userId: user._id });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    await deleteEvent({ eventId });
    router.push("/events");
  };

  if (event === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
          <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-lg)", marginBottom: "2rem" }} />
          <div className="skeleton" style={{ height: 40, width: "60%", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ height: 20, marginBottom: "0.5rem" }} />
          <div className="skeleton" style={{ height: 20, width: "80%" }} />
        </div>
      </div>
    );
  }

  if (!event) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "6rem 2rem", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
        <p>Event not found</p>
      </div>
    </div>
  );

  const deadlinePassed = isDeadlinePassed(event.registrationDeadline);
  const daysLeft = getDaysUntilDeadline(event.registrationDeadline);
  const isFull = event.maxParticipants && (registrations?.length ?? 0) >= event.maxParticipants;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Back */}
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          <ArrowLeft size={16} /> Back to Events
        </button>

        {/* Event Header */}
        <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          {/* Category + Status */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <span className="badge badge-primary">{event.category}</span>
            {userRole && (
              <span className="badge badge-warning">
                <Shield size={10} /> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
            {deadlinePassed ? (
              <span className="badge badge-danger">Registration Closed</span>
            ) : daysLeft <= 3 ? (
              <span className="badge badge-danger">🔥 {daysLeft}d left</span>
            ) : (
              <span className="badge badge-success">Open</span>
            )}
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", marginBottom: "1rem", lineHeight: 1.2 }}>
            {event.title}
          </h1>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { icon: Calendar, label: "Date", value: formatDate(event.startDate) },
              { icon: Clock, label: "Time", value: formatDateTime(event.startDate).split(",")[1]?.trim() ?? "TBD" },
              { icon: MapPin, label: "Venue", value: event.venue },
              { icon: Users, label: "Registrations", value: `${registrations?.length ?? event.registrationCount ?? 0}${event.maxParticipants ? ` / ${event.maxParticipants}` : ""}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} color="#a5b4fc" />
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.1rem" }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
              {event.tags.map((tag) => (
                <span key={tag} className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Tag size={10} />#{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Register / Unregister */}
            {!userRole && (
              registration ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    id="show-qr-btn"
                    onClick={() => setShowQR(true)}
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}
                  >
                    <QrCode size={16} /> View QR
                  </button>
                  <button
                    id="unregister-btn"
                    onClick={handleUnregister}
                    className="btn-ghost"
                    disabled={loading}
                    style={{ fontSize: "0.875rem" }}
                  >
                    Unregister
                  </button>
                </div>
              ) : (
                <button
                  id="register-btn"
                  onClick={handleRegister}
                  className="btn-primary"
                  disabled={loading || deadlinePassed || isFull}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    fontSize: "0.875rem",
                    opacity: (deadlinePassed || isFull) ? 0.5 : 1
                  }}
                >
                  {loading ? "Registering..." : deadlinePassed ? "Deadline Passed" : isFull ? "Event Full" : "Register Now"}
                </button>
              )
            )}

            {/* Like */}
            <button
              id="like-btn"
              onClick={() => user && toggleLike({ eventId, userId: user._id })}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: liked ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${liked ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "var(--radius-md)", padding: "0.5rem 1rem",
                cursor: "pointer", color: liked ? "#fca5a5" : "var(--text-secondary)", fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              {event.likeCount ?? 0} {liked ? "Liked" : "Like"}
            </button>

            {/* Organizer Actions */}
            {canEdit && (
              <a href={`/events/${eventId}/edit`} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", fontSize: "0.875rem" }}>
                <Edit size={15} /> Edit
              </a>
            )}
            {canDelete && (
              <button onClick={handleDelete} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "0.5rem 1rem", cursor: "pointer", color: "#fca5a5", fontSize: "0.875rem" }}>
                <Trash2 size={15} /> Delete
              </button>
            )}
            {canCheckIn && (
              <a href="/qr-checkin" className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", fontSize: "0.875rem" }}>
                <QrCode size={15} /> Manage Check-in
              </a>
            )}
          </div>
        </div>

        {/* QR Modal */}
        {showQR && registration?.qrToken && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={() => setShowQR(false)}>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center", maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "0.5rem" }}>Your Event QR Code</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Show this at the venue for check-in</p>
              <QRCodeDisplay value={registration.qrToken} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "1rem" }}>{event.title}</p>
              <button onClick={() => setShowQR(false)} className="btn-ghost" style={{ marginTop: "1.25rem", fontSize: "0.875rem" }}>Close</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.08)", width: "fit-content" }}>
          {[
            { key: "details", label: "Details" },
            { key: "registrations", label: `Registrations (${registrations?.length ?? 0})` },
            ...(canEdit ? [{ key: "organizers", label: "Organizers" }] : []),
          ].map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none",
                cursor: "pointer",
                background: activeTab === tab.key ? "rgba(99,102,241,0.25)" : "transparent",
                color: activeTab === tab.key ? "#a5b4fc" : "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "details" && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem" }}>About This Event</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {event.description}
            </p>
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Registration Deadline</span>
                <span style={{ fontWeight: 500, color: deadlinePassed ? "#fca5a5" : "#6ee7b7" }}>
                  {formatDate(event.registrationDeadline)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Event Ends</span>
                <span style={{ fontWeight: 500 }}>{formatDate(event.endDate)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Registered Participants ({registrations?.length ?? 0})
            </h2>
            {!registrations ? (
              <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            ) : registrations.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No registrations yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {registrations.map((reg) => (
                  <div key={reg._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }}>
                    <img
                      src={reg.user?.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.user?.name ?? "U")}&background=6366f1&color=fff`}
                      alt={reg.user?.name}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{reg.user?.name ?? "Unknown"}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{reg.user?.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "organizers" && canEdit && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1.25rem" }}>Event Team</h2>
            {organizers?.map((org) => (
              <div key={org._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", marginBottom: "0.5rem" }}>
                <img
                  src={org.user?.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(org.user?.name ?? "U")}&background=6366f1&color=fff`}
                  alt={org.user?.name}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{org.user?.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{org.user?.email}</div>
                </div>
                <span className={`badge badge-${org.role === "owner" ? "warning" : org.role === "organizer" ? "primary" : "cyan"}`}>
                  {org.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
