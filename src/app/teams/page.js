"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import Link from "next/link";
import {
  Users, Plus, Crown, UserPlus, LogOut, Calendar,
  ChevronRight, Search, Loader2, X
} from "lucide-react";
import { formatDate } from "../../lib/utils/formatDate";

function CreateTeamModal({ eventId, userId, onClose, onCreated }) {
  const createTeam = useMutation(api.teams.createTeam);
  const [form, setForm] = useState({ name: "", description: "", maxMembers: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const teamId = await createTeam({
        eventId,
        name: form.name,
        description: form.description || undefined,
        createdBy: userId,
        maxMembers: form.maxMembers ? parseInt(form.maxMembers) : undefined,
      });
      onCreated(teamId);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={onClose}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 440, padding: "1.75rem" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>Create New Team</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>Team Name *</label>
            <input
              id="team-name-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Neural Ninjas"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input-field"
              placeholder="What's your team about?"
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>Max Members</label>
            <input
              type="number"
              value={form.maxMembers}
              onChange={(e) => setForm((f) => ({ ...f, maxMembers: e.target.value }))}
              className="input-field"
              placeholder="Unlimited"
              min="2"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.25rem" }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: "0.875rem" }}>Cancel</button>
            <button id="create-team-submit-btn" type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.875rem" }}>
              {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamCard({ team, userId }) {
  const joinTeam = useMutation(api.teams.joinTeam);
  const leaveTeam = useMutation(api.teams.leaveTeam);
  const inviteMember = useMutation(api.teams.inviteMember);
  const [loading, setLoading] = useState(false);

  const isMember = (team.members ?? []).some((m) => m.userId === userId);
  const isCreator = team.createdBy === userId;
  const isFull = team.maxMembers && (team.members ?? []).length >= team.maxMembers;

  const handleJoin = async () => {
    setLoading(true);
    try {
      await joinTeam({ teamId: team._id, userId });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this team?")) return;
    setLoading(true);
    try {
      await leaveTeam({ teamId: team._id, userId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" }}>{team.name}</h3>
            {isCreator && <Crown size={13} color="#f59e0b" />}
            {isMember && !isCreator && <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>Joined</span>}
          </div>
          {team.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: 1.4 }}>
              {team.description}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className="badge badge-cyan">
            <Users size={10} />
            {team.members?.length ?? 0}{team.maxMembers ? `/${team.maxMembers}` : ""}
          </span>
        </div>
      </div>

      {/* Members avatars */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.875rem" }}>
        {(team.members ?? []).slice(0, 6).map((member) => member.user && (
          <img
            key={member._id}
            src={member.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=6366f1&color=fff`}
            alt={member.user.name}
            title={member.user.name}
            style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--bg-secondary)", marginLeft: -6 }}
          />
        ))}
        {(team.members?.length ?? 0) > 6 && (
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px solid var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: -6 }}>
            +{team.members.length - 6}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {isMember ? (
          <button
            onClick={handleLeave}
            className="btn-ghost"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem" }}
          >
            <LogOut size={13} />Leave
          </button>
        ) : (
          <button
            id={`join-team-${team._id}`}
            onClick={handleJoin}
            className="btn-primary"
            disabled={loading || isFull}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", opacity: isFull ? 0.5 : 1 }}
          >
            {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={13} />}
            {isFull ? "Team Full" : "Join Team"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const { user } = useCurrentUser();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const events = useQuery(api.events.listActiveEvents, {});
  const teams = useQuery(
    api.teams.getEventTeams,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  const filteredTeams = (teams ?? []).filter(
    (t) => !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={22} color="white" />
            </div>
            Teams
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Form or join teams for hackathons, competitions, and collaborative events</p>
        </div>

        {/* Event filter */}
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 500 }}>
            Select Event to Browse Teams
          </label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {events === undefined ? (
              <div className="skeleton" style={{ height: 38, width: 200, borderRadius: "var(--radius-md)" }} />
            ) : (events ?? []).filter((e) => !e.isArchived).map((event) => (
              <button
                key={event._id}
                id={`event-filter-${event._id}`}
                onClick={() => setSelectedEventId(event._id)}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "9999px",
                  border: `1px solid ${selectedEventId === event._id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                  background: selectedEventId === event._id ? "rgba(99,102,241,0.15)" : "transparent",
                  color: selectedEventId === event._id ? "#a5b4fc" : "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: selectedEventId === event._id ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {event.title.slice(0, 30)}{event.title.length > 30 ? "…" : ""}
              </button>
            ))}
          </div>
        </div>

        {selectedEventId && (
          <>
            {/* Search + Create */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field"
                  placeholder="Search teams..."
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              <button
                id="create-team-btn"
                onClick={() => setShowCreate(true)}
                className="btn-primary"
                disabled={!user}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}
              >
                <Plus size={15} />Create Team
              </button>
            </div>

            {/* Teams grid */}
            {teams === undefined ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
                ))}
              </div>
            ) : filteredTeams.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
                <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>No teams yet for this event</p>
                <p style={{ marginBottom: "1.5rem" }}>Be the first to create a team!</p>
                <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: "0.9rem" }}>
                  <Plus size={15} style={{ display: "inline", marginRight: 6 }} />Create First Team
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {filteredTeams.map((team) => (
                  <TeamCard key={team._id} team={team} userId={user?._id} />
                ))}
              </div>
            )}
          </>
        )}

        {!selectedEventId && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--text-muted)" }}>
            <Users size={56} style={{ margin: "0 auto 1.25rem", opacity: 0.2 }} />
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Select an event above to browse teams</p>
            <p>Teams are organized per event for hackathons and competitions</p>
          </div>
        )}
      </main>

      {showCreate && selectedEventId && user && (
        <CreateTeamModal
          eventId={selectedEventId}
          userId={user._id}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => console.log("Created team:", id)}
        />
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
