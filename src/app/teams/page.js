"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import {
  Users, Plus, Crown, UserPlus, LogOut, Calendar,
  ChevronRight, Search, Loader2, X, AlertCircle, Check, HelpCircle, Mail, Settings, UserMinus, Sparkles
} from "lucide-react";
import { formatDate } from "../../lib/utils/formatDate";

// Custom Tag/Chip Input for Teammate Invites (matching Event Creation style)
function TeammateTagInput({ invites, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addInvite = (item) => {
    const trimmed = item.trim();
    if (trimmed && !invites.includes(trimmed)) {
      onChange([...invites, trimmed]);
    }
    setInput("");
  };

  const removeInvite = (item) => onChange(invites.filter((t) => t !== item));

  return (
    <div className="tag-input-container" style={{ minHeight: "2.75rem" }}>
      {invites.map((invite) => (
        <span key={invite} className="tag-chip" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
          <Mail size={11} />
          {invite}
          <button type="button" onClick={() => removeInvite(invite)} style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: "0.85rem", lineHeight: 1 }}>
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addInvite(input);
          }
          if (e.key === "Backspace" && !input && invites.length > 0) {
            removeInvite(invites[invites.length - 1]);
          }
        }}
        onBlur={() => input && addInvite(input)}
        placeholder={invites.length === 0 ? placeholder : ""}
        style={{
          border: "none",
          background: "transparent",
          color: "white",
          outline: "none",
          fontSize: "0.8rem",
          flex: 1,
          minWidth: 120,
          padding: "0.25rem",
        }}
      />
    </div>
  );
}

// ─── Manage Teammates Modal ───────────────────────────────────────────────────
function ManageTeammatesModal({ team, userId, onClose }) {
  const inviteTeammate = useMutation(api.teams.inviteTeammateByEmailOrName);
  const removeTeammate = useMutation(api.teams.leaveTeam);
  
  const [modalTab, setModalTab] = useState("invite"); // "invite" or "roster"
  const [invites, setInvites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Search classmates on campus
  const searchResults = useQuery(
    api.users.searchUsers,
    searchQuery ? { query: searchQuery } : "skip"
  );

  const acceptedMembers = (team.members ?? []).filter((m) => !m.status || m.status === "accepted");
  const pendingMembers = (team.members ?? []).filter((m) => m.status === "pending");

  const handleSendInvites = async () => {
    if (invites.length === 0) return;
    setLoading(true);
    let successCount = 0;
    let errors = [];
    
    for (const inviteInput of invites) {
      try {
        await inviteTeammate({
          teamId: team._id,
          invitingUserId: userId,
          inviteInput,
        });
        successCount++;
      } catch (err) {
        errors.push(`${inviteInput}: ${err.message}`);
      }
    }
    
    setLoading(false);
    setInvites([]);
    
    if (errors.length > 0) {
      alert(`Sent ${successCount} invites. Note the following:\n${errors.join("\n")}`);
    } else {
      alert("All teammate invitations sent successfully!");
    }
  };

  const handleInviteSingle = async (peerInput) => {
    setLoading(true);
    try {
      await inviteTeammate({
        teamId: team._id,
        invitingUserId: userId,
        inviteInput: peerInput,
      });
      alert(`Invitation successfully sent to ${peerInput}!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberUserId, name, isPending) => {
    const actionLabel = isPending ? "revoke the invitation for" : "remove";
    if (!confirm(`Are you sure you want to ${actionLabel} ${name}?`)) return;
    
    setLoading(true);
    try {
      await removeTeammate({ teamId: team._id, userId: memberUserId });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={onClose}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: "1.75rem", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Settings size={18} color="#6366f1" />
              Manage Team: {team.name}
            </h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
              Invite teammates, approve requests, and manage active classmates
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>

        {/* Tab Selection inside Modal */}
        <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.03)", padding: 3, borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.25rem" }}>
          {[
            { key: "invite", label: "➕ Invite Classmates" },
            { key: "roster", label: `👥 Active Roster (${acceptedMembers.length + pendingMembers.length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setModalTab(tab.key)}
              style={{
                flex: 1, padding: "0.45rem", borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none", cursor: "pointer",
                background: modalTab === tab.key ? "rgba(99,102,241,0.15)" : "transparent",
                color: modalTab === tab.key ? "#a5b4fc" : "var(--text-secondary)",
                fontSize: "0.8rem", fontWeight: modalTab === tab.key ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Invite classmates */}
        {modalTab === "invite" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Tag/Chips inviting menu */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 600 }}>
                Bulk Teammate Invites (by Email or Username)
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <TeammateTagInput
                    invites={invites}
                    onChange={setInvites}
                    placeholder="Type name/email and press Enter..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendInvites}
                  disabled={loading || invites.length === 0}
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", padding: "0.5rem 1rem", flexShrink: 0 }}
                >
                  {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={13} />}
                  Send Invites
                </button>
              </div>
            </div>

            {/* Directory search peer to add */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 600 }}>
                Search & Invite Campus Directory
              </label>
              <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search classmate name or department..."
                  className="input-field"
                  style={{ paddingLeft: "2.25rem", fontSize: "0.8rem" }}
                />
              </div>

              {searchQuery && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "180px", overflowY: "auto" }}>
                  {searchResults === undefined ? (
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                      <Loader2 size={16} className="animate-spin" color="#6366f1" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", padding: "0.5rem" }}>
                      No classmates found matching "{searchQuery}"
                    </p>
                  ) : (
                    searchResults.filter(u => u._id !== userId).map((peer) => {
                      const isAlreadyPending = pendingMembers.some((m) => m.userId === peer._id);
                      const isAlreadyAccepted = acceptedMembers.some((m) => m.userId === peer._id);

                      return (
                        <div key={peer._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <img
                              src={peer.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.name)}&background=6366f1&color=fff`}
                              alt={peer.name}
                              style={{ width: 28, height: 28, borderRadius: "50%" }}
                            />
                            <div>
                              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "white" }}>{peer.name}</div>
                              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{peer.department} · {peer.year}</div>
                            </div>
                          </div>

                          <div>
                            {isAlreadyAccepted ? (
                              <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 500 }}>Active Member</span>
                            ) : isAlreadyPending ? (
                              <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 500 }}>Invite Sent</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleInviteSingle(peer.email)}
                                disabled={loading}
                                className="btn-primary"
                                style={{ fontSize: "0.7rem", padding: "0.25rem 0.6rem" }}
                              >
                                Invite Teammate
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Roster list & revoke invites */}
        {modalTab === "roster" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Accepted Roster */}
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>
                Active Members ({acceptedMembers.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {acceptedMembers.map((member) => member.user && (
                  <div key={member._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <img
                        src={member.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=6366f1&color=fff`}
                        alt={member.user.name}
                        style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          {member.user.name}
                          {team.createdBy === member.userId && <Crown size={12} color="#f59e0b" title="Creator" />}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{member.user.department || "Student"} · {member.user.year || ""}</div>
                      </div>
                    </div>

                    {team.createdBy !== member.userId && (
                      <button
                        onClick={() => handleRemove(member.userId, member.user.name, false)}
                        disabled={loading}
                        className="btn-ghost"
                        style={{ padding: "0.25rem", color: "#ef4444", borderColor: "transparent", cursor: "pointer" }}
                        title="Remove Teammate"
                      >
                        <UserMinus size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites */}
            {pendingMembers.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>
                  Pending Invitations ({pendingMembers.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {pendingMembers.map((member) => member.user && (
                    <div key={member._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <img
                          src={member.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=6366f1&color=fff`}
                          alt={member.user.name}
                          style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "white" }}>{member.user.name}</div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{member.user.department}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(member.userId, member.user.name, true)}
                        disabled={loading}
                        className="btn-ghost"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", color: "#f87171", borderColor: "rgba(239,68,68,0.2)" }}
                      >
                        Revoke Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

function CreateTeamModal({ eventId, userId, onClose, onCreated }) {
  const createTeam = useMutation(api.teams.createTeam);
  const [form, setForm] = useState({ name: "", description: "", maxMembers: "" });
  const [invites, setInvites] = useState([]);
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
        invites: invites.length > 0 ? invites : undefined,
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={onClose}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 460, padding: "1.75rem" }} onClick={(e) => e.stopPropagation()}>
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
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>Max Members Limit</label>
            <input
              type="number"
              value={form.maxMembers}
              onChange={(e) => setForm((f) => ({ ...f, maxMembers: e.target.value }))}
              className="input-field"
              placeholder="e.g. 4 (Unlimited if blank)"
              min="2"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
              Invite Teammates (They must accept)
            </label>
            <TeammateTagInput
              invites={invites}
              onChange={setInvites}
              placeholder="Add emails or usernames, press Enter..."
            />
            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              Classmates will receive a pending team invitation and must accept it to join.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
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

function TeamCard({ team, userId, onManageTeam }) {
  const joinTeam = useMutation(api.teams.joinTeam);
  const leaveTeam = useMutation(api.teams.leaveTeam);
  const [loading, setLoading] = useState(false);

  // Count only accepted members
  const acceptedMembers = (team.members ?? []).filter((m) => !m.status || m.status === "accepted");
  const pendingMembers = (team.members ?? []).filter((m) => m.status === "pending");
  const requestedMembers = (team.members ?? []).filter((m) => m.status === "requested");

  const isMember = acceptedMembers.some((m) => m.userId === userId);
  const isPending = pendingMembers.some((m) => m.userId === userId);
  const isRequested = requestedMembers.some((m) => m.userId === userId);
  const isCreator = team.createdBy === userId;
  const isFull = team.maxMembers && acceptedMembers.length >= team.maxMembers;

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
    <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" }}>{team.name}</h3>
              {isCreator && <Crown size={13} color="#f59e0b" />}
              {isMember && !isCreator && <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>Joined</span>}
              {isPending && <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>Pending Invite</span>}
              {isRequested && <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>Requested</span>}
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
              {acceptedMembers.length}{team.maxMembers ? `/${team.maxMembers}` : ""}
            </span>
          </div>
        </div>

        {/* Accepted Members */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.35rem" }}>
            Teammates ({acceptedMembers.length})
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
            {acceptedMembers.map((member) => member.user && (
              <img
                key={member._id}
                src={member.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=6366f1&color=fff`}
                alt={member.user.name}
                title={member.user.name}
                style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--bg-secondary)", objectFit: "cover" }}
              />
            ))}
          </div>
        </div>

        {/* Pending Invites */}
        {pendingMembers.length > 0 && (
          <div style={{ marginBottom: "0.875rem" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.35rem" }}>
              Pending Invites ({pendingMembers.length})
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap", opacity: 0.6 }}>
              {pendingMembers.map((member) => member.user && (
                <span key={member._id} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", color: "var(--text-muted)" }}>
                  {member.user.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
        {isCreator && (
          <button
            onClick={() => onManageTeam(team)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", flex: 1, justifyContent: "center", background: "linear-gradient(135deg, #06b6d4, #6366f1)" }}
          >
            <Users size={12} /> Manage Team
          </button>
        )}
        {isMember ? (
          <button
            onClick={handleLeave}
            className="btn-ghost"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", flex: 1, justifyContent: "center" }}
          >
            <LogOut size={12} />Leave
          </button>
        ) : (
          <button
            id={`join-team-${team._id}`}
            onClick={handleJoin}
            className="btn-primary"
            disabled={loading || isFull || isPending || isRequested}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", flex: 1, justifyContent: "center", opacity: (isFull || isPending || isRequested) ? 0.5 : 1 }}
          >
            {loading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={12} />}
            {isFull ? "Team Full" : isPending ? "Invite Pending" : isRequested ? "Request Dispatched" : "Join Team"}
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
  const [activeManageTeam, setActiveManageTeam] = useState(null);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // New States for Tab Layout & Directory Search
  const [activeTab, setActiveTab] = useState("find-teams"); // "find-teams", "my-teams", "directory"
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [selectedInviteTeamId, setSelectedInviteTeamId] = useState("");

  // Queries
  const events = useQuery(api.events.listActiveEvents, {});
  const teams = useQuery(
    api.teams.getEventTeams,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  // Pending invites & join requests banner queries
  const pendingInvitesAndRequests = useQuery(
    api.teams.getPendingInvitations,
    user ? { userId: user._id } : "skip"
  );

  // Friends incomplete teams queries
  const friendsTeams = useQuery(
    api.teams.getFriendsIncompleteTeams,
    selectedEventId && user ? { eventId: selectedEventId, userId: user._id } : "skip"
  );

  // New Queries for My Teams & Directory Search
  const myAllTeams = useQuery(
    api.teams.getUserAllTeams,
    user ? { userId: user._id } : "skip"
  );

  const directoryResults = useQuery(
    api.users.searchUsers,
    directoryQuery ? { query: directoryQuery } : "skip"
  );

  // Mutations
  const acceptMembership = useMutation(api.teams.acceptTeamMembership);
  const declineMembership = useMutation(api.teams.declineTeamMembership);
  const requestToJoin = useMutation(api.teams.requestToJoinTeam);
  const inviteTeammate = useMutation(api.teams.inviteTeammateByEmailOrName);

  const selectedEvent = events?.find((e) => e._id === selectedEventId);

  const filteredTeams = (teams ?? []).filter(
    (t) => !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter owned teams where current user is the owner/creator
  const ownedTeams = (myAllTeams ?? []).filter(
    (t) => t.createdBy === user?._id && t.userStatus === "accepted"
  );

  // Set default selected team for directory tab when ownedTeams loaded
  if (ownedTeams.length > 0 && !selectedInviteTeamId) {
    setSelectedInviteTeamId(ownedTeams[0]._id);
  }

  // Refresh activeManageTeam if it updates in the background
  const freshManagedTeam = activeManageTeam 
    ? (teams ?? []).find(t => t._id === activeManageTeam._id) || (myAllTeams ?? []).find(t => t._id === activeManageTeam._id)
    : null;

  const handleAccept = async (teamId, targetUserId) => {
    setActionLoadingId(`${teamId}-${targetUserId}`);
    try {
      await acceptMembership({ teamId, userId: targetUserId });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (teamId, targetUserId) => {
    setActionLoadingId(`${teamId}-${targetUserId}`);
    try {
      await declineMembership({ teamId, userId: targetUserId });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRequestToJoin = async (teamId) => {
    if (!user) return;
    setActionLoadingId(teamId);
    try {
      await requestToJoin({ teamId, userId: user._id });
      alert("Your request to join has been successfully sent to the team creator!");
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInviteFromDirectory = async (peerEmail, teamId) => {
    if (!user || !teamId) return;
    setActionLoadingId(`${peerEmail}-${teamId}`);
    try {
      await inviteTeammate({
        teamId,
        invitingUserId: user._id,
        inviteInput: peerEmail,
      });
      alert(`Invitation successfully dispatched to ${peerEmail}!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper: Advanced Multi-Criteria Compatibility Score matching
  const calculateCompatibility = (peer) => {
    if (!user || !peer) return 0;
    
    const userInterests = user.interests ?? [];
    const peerInterests = peer.interests ?? [];
    
    const userSkills = user.skills ?? [];
    const peerSkills = peer.skills ?? [];

    if (userInterests.length === 0 && peerInterests.length === 0 && userSkills.length === 0 && peerSkills.length === 0) {
      const sameDept = user.department && peer.department && user.department.toLowerCase() === peer.department.toLowerCase();
      const sameYear = user.year && peer.year && user.year.toLowerCase() === peer.year.toLowerCase();
      return 35 + (sameDept ? 10 : 0) + (sameYear ? 10 : 0);
    }

    // 1. Interests Jaccard Similarity (40% weight)
    let interestScore = 0.5;
    if (userInterests.length > 0 || peerInterests.length > 0) {
      const intersection = userInterests.filter((x) => peerInterests.includes(x));
      const union = Array.from(new Set([...userInterests, ...peerInterests]));
      interestScore = union.length > 0 ? (intersection.length / union.length) : 0;
    }

    // 2. Skills Jaccard Similarity (40% weight)
    let skillScore = 0.5;
    if (userSkills.length > 0 || peerSkills.length > 0) {
      const intersection = userSkills.filter((x) => peerSkills.includes(x));
      const union = Array.from(new Set([...userSkills, ...peerSkills]));
      skillScore = union.length > 0 ? (intersection.length / union.length) : 0;
    }

    // 3. Department alignment (10% weight)
    const sameDept = user.department && peer.department && user.department.toLowerCase() === peer.department.toLowerCase();
    const deptScore = sameDept ? 1.0 : 0.0;

    // 4. Academic year alignment (10% weight)
    const sameYear = user.year && peer.year && user.year.toLowerCase() === peer.year.toLowerCase();
    const yearScore = sameYear ? 1.0 : 0.0;

    // Weighted Formula
    const finalScore = (interestScore * 0.40) + (skillScore * 0.40) + (deptScore * 0.10) + (yearScore * 0.10);
    
    let finalPercent = Math.round(finalScore * 100);
    
    if (interestScore === 1 && skillScore === 1 && sameDept && sameYear) return 100;
    
    return Math.max(15, Math.min(98, finalPercent));
  };

  const getMatchLabel = (score) => {
    if (score >= 85) return { text: "✨ Exceptional Match", color: "#10b981", bg: "rgba(16,185,129,0.12)" };
    if (score >= 65) return { text: "🔥 High Match", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" };
    if (score >= 40) return { text: "⚡ Good Match", color: "#6366f1", bg: "rgba(99,102,241,0.12)" };
    return { text: "💬 Compatible Match", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.25rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={22} color="white" />
            </div>
            Team Assembly
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Form teams, search peer directories, and manage your collaborative event rosters</p>
        </div>

        {/* Global Segmented Tab Selector */}
        <div style={{ 
          display: "flex", 
          gap: "0.3rem", 
          background: "rgba(255,255,255,0.03)", 
          padding: 4, 
          borderRadius: "var(--radius-lg)", 
          border: "1px solid rgba(255,255,255,0.06)", 
          marginBottom: "2rem",
          maxWidth: "550px"
        }}>
          {[
            { key: "find-teams", label: "🌐 Find & Join Teams" },
            { key: "my-teams", label: `👥 My Teams Dashboard ${myAllTeams && myAllTeams.length > 0 ? `(${myAllTeams.length})` : ""}` },
            { key: "directory", label: "🔍 Campus Classmates & Invite" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "0.55rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                background: activeTab === tab.key ? "rgba(99,102,241,0.18)" : "transparent",
                color: activeTab === tab.key ? "#a5b4fc" : "var(--text-secondary)",
                fontSize: "0.82rem",
                fontWeight: activeTab === tab.key ? 700 : 400,
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: FIND & JOIN TEAMS (Standard Event Browser) */}
        {activeTab === "find-teams" && (
          <div>
            {/* Event Filter Selector */}
            <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 500 }}>
                Select Active Event to Browse Teams
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

            {selectedEventId ? (
              <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "1.5rem", alignItems: "start" }} className="teams-split-layout">
                {/* Main Event Teams */}
                <div>
                  {/* Search and Create Buttons */}
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

                  {/* Requirements warning banner */}
                  {selectedEvent?.minMembers && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius-md)", color: "#f59e0b", fontSize: "0.78rem", marginBottom: "1.25rem" }}>
                      <AlertCircle size={15} />
                      <span>
                        ⚠️ Event Requirement: Teams must have a minimum of <strong>{selectedEvent.minMembers} members</strong> to be eligible.
                      </span>
                    </div>
                  )}

                  {/* Grid of Teams */}
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
                        <TeamCard key={team._id} team={team} userId={user?._id} onManageTeam={setActiveManageTeam} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar: Friends' incomplete teams */}
                <div>
                  <div className="glass-card" style={{ padding: "1.25rem", border: "1px solid rgba(6,182,212,0.15)" }}>
                    <h3 style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.92rem",
                      color: "#67e8f9", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem"
                    }}>
                      <Users size={15} color="#06b6d4" />
                      Friends' Teams
                    </h3>

                    {friendsTeams === undefined ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                        <Loader2 size={20} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
                      </div>
                    ) : friendsTeams.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "1.5rem 0.5rem", color: "var(--text-muted)" }}>
                        <p style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                          None of your friends have joined incomplete teams for this event yet.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                        {friendsTeams.map((team) => {
                          const isLoader = actionLoadingId === team._id;
                          const hasPending = team.requestedStatus === "pending";
                          const hasRequested = team.requestedStatus === "requested";

                          return (
                            <div key={team._id} style={{
                              padding: "0.875rem", background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, color: "white", marginBottom: "0.35rem" }}>
                                <span>{team.name}</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                                  {team.membersCount}{team.maxMembers ? `/${team.maxMembers}` : ""}
                                </span>
                              </div>
                              
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <span>Friend: </span>
                                <strong style={{ color: "#a5b4fc" }}>
                                  {team.friends.map((f) => f.name).join(", ")}
                                </strong>
                              </div>

                              <button
                                onClick={() => handleRequestToJoin(team._id)}
                                disabled={isLoader || hasPending || hasRequested}
                                className="btn-primary"
                                style={{
                                  width: "100%", fontSize: "0.75rem", padding: "0.35rem",
                                  background: "rgba(6,182,212,0.12)", color: "#67e8f9",
                                  border: "1px solid rgba(6,182,212,0.25)", display: "flex",
                                  alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                  opacity: (hasPending || hasRequested) ? 0.6 : 1
                                }}
                              >
                                {isLoader ? (
                                  <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <UserPlus size={12} />
                                )}
                                {hasPending ? "Invited" : hasRequested ? "Requested" : "Request to Join"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
                <Users size={56} style={{ margin: "0 auto 1.25rem", opacity: 0.2 }} />
                <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Select an active event above to browse campus teams</p>
                <p>Teams are organized per hackathon or collaborative event</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY TEAMS DASHBOARD (The Central Teammate Hub) */}
        {activeTab === "my-teams" && (
          <div>
            {/* Top Notifications & Inbox Banner Panel */}
            {pendingInvitesAndRequests && pendingInvitesAndRequests.length > 0 && (
              <div className="glass-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "2rem", border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.05)" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a5b4fc", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.875rem" }}>
                  <AlertCircle size={16} /> Team Invitations & Action Items
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {pendingInvitesAndRequests.map((item) => {
                    const isLoading = actionLoadingId === `${item.teamId}-${item.userId}`;
                    return (
                      <div key={`${item.teamId}-${item.userId}`} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.875rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {item.type === "invite" ? (
                            <span>
                              👑 <strong>{item.inviter?.name || "Organizer"}</strong> invited you to join team <strong>"{item.team?.name}"</strong> for <em>{item.event?.title}</em>.
                            </span>
                          ) : (
                            <span>
                              👋 <strong>{item.requester?.name || "Student"}</strong> requested to join your team <strong>"{item.team?.name}"</strong> for <em>{item.event?.title}</em>.
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            onClick={() => handleAccept(item.teamId, item.userId)}
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: "#10b981", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                          >
                            {isLoading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={12} />}
                            {item.type === "invite" ? "Accept Invite" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleDecline(item.teamId, item.userId)}
                            disabled={isLoading}
                            className="btn-ghost"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", color: "#fca5a5", borderColor: "rgba(239,68,68,0.2)" }}
                          >
                            {item.type === "invite" ? "Decline" : "Reject"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Teams List */}
            {myAllTeams === undefined ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 220, borderRadius: "var(--radius-lg)" }} />
                ))}
              </div>
            ) : myAllTeams.length === 0 ? (
              <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", borderStyle: "dashed" }}>
                <Users size={48} color="var(--text-muted)" style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>You are not in any teams yet</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
                  To start forming a team, select an event in "Find & Join Teams" and click **Create Team**, or request to join a friend's roster.
                </p>
                <button onClick={() => setActiveTab("find-teams")} className="btn-primary" style={{ fontSize: "0.85rem" }}>
                  Browse Campus Events
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem", color: "white" }}>
                  Your Active & Pending Rosters ({myAllTeams.length})
                </h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                  {myAllTeams.map((team) => {
                    const isPendingInvite = team.userStatus === "pending";
                    const isJoinRequested = team.userStatus === "requested";
                    const isOwner = team.createdBy === user?._id;
                    
                    const acceptedMembers = team.members.filter(m => !m.status || m.status === "accepted");
                    const pendingMembers = team.members.filter(m => m.status === "pending");
                    const loadingAction = actionLoadingId === `${team._id}-${user?._id}`;

                    return (
                      <div 
                        key={team._id} 
                        className={`glass-card ${isPendingInvite ? "glowing-purple-card" : ""}`}
                        style={{ 
                          padding: "1.5rem", 
                          display: "flex", 
                          flexDirection: "column", 
                          justifyContent: "space-between",
                          border: isPendingInvite ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                          background: isPendingInvite ? "rgba(139, 92, 246, 0.04)" : "rgba(255, 255, 255, 0.02)",
                          position: "relative"
                        }}
                      >
                        <div>
                          {/* Event & Status header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#6366f1", background: "rgba(99,102,241,0.1)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                              {team.event?.title || "Event"}
                            </span>
                            
                            {isPendingInvite && <span className="badge badge-warning" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem", animation: "pulse 2s infinite" }}>Invitation Pending</span>}
                            {isJoinRequested && <span className="badge badge-cyan" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>Request Sent</span>}
                            {!isPendingInvite && !isJoinRequested && isOwner && <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem", background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>👑 Roster Owner</span>}
                            {!isPendingInvite && !isJoinRequested && !isOwner && <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>Joined Member</span>}
                          </div>

                          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "white", marginBottom: "0.35rem" }}>
                            {team.name}
                          </h3>
                          
                          {team.description && (
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: 1.4, marginBottom: "1rem" }}>
                              {team.description}
                            </p>
                          )}

                          {/* Member avatars */}
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
                              Active Teammates ({acceptedMembers.length}{team.maxMembers ? `/${team.maxMembers}` : ""})
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                              {acceptedMembers.map(m => m.user && (
                                <img
                                  key={m._id}
                                  src={m.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name)}&background=6366f1&color=fff`}
                                  alt={m.user.name}
                                  title={m.user.name}
                                  style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.06)", objectFit: "cover" }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Pending roster invites (For members already invited but haven't accepted yet) */}
                          {pendingMembers.length > 0 && (
                            <div style={{ marginBottom: "1.25rem" }}>
                              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
                                Awaiting Acceptance ({pendingMembers.length})
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                                {pendingMembers.map(m => m.user && (
                                  <span key={m._id} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.7rem", padding: "0.15rem 0.45rem", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "4px", color: "#f59e0b" }}>
                                    ⏳ {m.user.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Team Actions on the card itself */}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                          {isPendingInvite ? (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => handleAccept(team._id, user?._id)}
                                disabled={loadingAction}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: "0.78rem", padding: "0.45rem", background: "#10b981", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                              >
                                {loadingAction ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                Accept Team Invite
                              </button>
                              <button
                                onClick={() => handleDecline(team._id, user?._id)}
                                disabled={loadingAction}
                                className="btn-ghost"
                                style={{ flex: 0.5, fontSize: "0.78rem", padding: "0.45rem", color: "#fca5a5", borderColor: "rgba(239,68,68,0.2)" }}
                              >
                                Decline
                              </button>
                            </div>
                          ) : isJoinRequested ? (
                            <button
                              disabled
                              className="btn-ghost"
                              style={{ width: "100%", fontSize: "0.78rem", padding: "0.45rem", opacity: 0.6 }}
                            >
                              ⏳ Requested to join, waiting for owner approval
                            </button>
                          ) : (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              {isOwner ? (
                                <button
                                  onClick={() => setActiveManageTeam(team)}
                                  className="btn-primary"
                                  style={{ flex: 1, fontSize: "0.78rem", padding: "0.45rem", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                                >
                                  <Settings size={13} />
                                  Manage Roster & Invites
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to leave this team?")) {
                                      declineMembership({ teamId: team._id, userId: user?._id });
                                    }
                                  }}
                                  className="btn-ghost"
                                  style={{ flex: 1, fontSize: "0.78rem", padding: "0.45rem", color: "#ef4444", borderColor: "rgba(239,68,68,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                                >
                                  <LogOut size={13} />
                                  Leave Team
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CAMPUS DIRECTORY & DIRECT QUICK-INVITE HUB */}
        {activeTab === "directory" && (
          <div>
            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(6,182,212,0.15)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#67e8f9", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={16} color="#06b6d4" />
                    Campus Directory & Direct Teammate Invite Hub
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Search classmate profiles, inspect interest/skill alignment scores, and dispatch team requests in one click.
                  </p>
                </div>
                
                {/* Team selection dropdown container */}
                {ownedTeams.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Invite Target Team:</span>
                    <select
                      value={selectedInviteTeamId}
                      onChange={(e) => setSelectedInviteTeamId(e.target.value)}
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.78rem",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      {ownedTeams.map(t => (
                        <option key={t._id} value={t._id} style={{ background: "#0a0f1e" }}>
                          {t.name} ({t.event?.title})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "#f59e0b", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", padding: "0.35rem 0.75rem", borderRadius: "var(--radius-md)" }}>
                    ⚠️ You must own a team first to invite classmates. Create one in the first tab!
                  </div>
                )}
              </div>

              {/* Directory search input */}
              <div style={{ position: "relative", width: "100%" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={directoryQuery}
                  onChange={(e) => setDirectoryQuery(e.target.value)}
                  placeholder="Search classmate names, departments, emails, skills..."
                  className="input-field"
                  style={{ paddingLeft: "2.5rem", fontSize: "0.82rem" }}
                />
              </div>
            </div>

            {/* Directory Query Results */}
            {!directoryQuery ? (
              <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧭</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
                  Search for Campus Peers to Assemble Teams
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "450px", margin: "0 auto" }}>
                  Type a name or skill above. You will see their exact properly-weighted compatibilities, matching skills, and interest badges instantly!
                </p>
              </div>
            ) : directoryResults === undefined ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                <Loader2 size={32} color="#6366f1" className="animate-spin" />
              </div>
            ) : directoryResults.length === 0 || (directoryResults.length === 1 && directoryResults[0]._id === user?._id) ? (
              <div className="glass-card" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  No classmates found matching "{directoryQuery}"
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "1rem" }}>
                {directoryResults.filter(p => p._id !== user?._id).map((peer) => {
                  const score = calculateCompatibility(peer);
                  const label = getMatchLabel(score);
                  
                  // Check if classmate is already in selected team
                  const activeTeam = myAllTeams?.find(t => t._id === selectedInviteTeamId);
                  const isCreatorOfTeam = activeTeam?.createdBy === peer._id;
                  
                  const activeMembership = activeTeam?.members?.find(m => m.userId === peer._id);
                  const isAccepted = activeMembership && (!activeMembership.status || activeMembership.status === "accepted");
                  const isPending = activeMembership && activeMembership.status === "pending";
                  const isRequested = activeMembership && activeMembership.status === "requested";

                  const loadingAction = actionLoadingId === `${peer.email}-${selectedInviteTeamId}`;

                  return (
                    <div 
                      key={peer._id} 
                      className="glass-card" 
                      style={{ 
                        padding: "1.25rem", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      <div>
                        {/* Profile layout */}
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.85rem" }}>
                          <img
                            src={peer.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.name)}&background=6366f1&color=fff`}
                            alt={peer.name}
                            style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.06)", objectFit: "cover" }}
                          />
                          <div>
                            <h4 style={{ fontWeight: 700, color: "white", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {peer.name}
                            </h4>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                              {peer.department || "No Dept"} · {peer.year || "Unknown"}
                            </p>
                            
                            {/* Score Tag */}
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.2rem",
                              fontSize: "0.65rem", fontWeight: 700, color: label.color,
                              background: label.bg, padding: "0.15rem 0.45rem", borderRadius: "9999px",
                              marginTop: "0.3rem"
                            }}>
                              <Sparkles size={9} />
                              {score}% {label.text}
                            </span>
                          </div>
                        </div>

                        {/* Skills display */}
                        {peer.skills && peer.skills.length > 0 && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                              Skills
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {peer.skills.map((skill, i) => {
                                const isMutual = user?.skills?.includes(skill);
                                return (
                                  <span key={i} style={{
                                    fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)",
                                    background: isMutual ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                                    color: isMutual ? "#a5b4fc" : "var(--text-secondary)",
                                    border: `1px solid ${isMutual ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.05)"}`,
                                    fontWeight: isMutual ? 600 : 400
                                  }}>
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interests display */}
                        {peer.interests && peer.interests.length > 0 && (
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                              Interests
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {peer.interests.map((interest, i) => {
                                const isMutual = user?.interests?.includes(interest);
                                return (
                                  <span key={i} style={{
                                    fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)",
                                    background: isMutual ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.02)",
                                    color: isMutual ? "#67e8f9" : "var(--text-secondary)",
                                    border: `1px solid ${isMutual ? "rgba(6,182,212,0.22)" : "rgba(255,255,255,0.05)"}`,
                                    fontWeight: isMutual ? 600 : 400
                                  }}>
                                    {interest}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Connection connection status & buttons */}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                        {ownedTeams.length === 0 ? (
                          <button disabled className="btn-ghost" style={{ width: "100%", fontSize: "0.72rem", padding: "0.4rem", opacity: 0.5 }}>
                            No team to invite to
                          </button>
                        ) : isCreatorOfTeam || isAccepted ? (
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#10b981", padding: "0.4rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "var(--radius-md)" }}>
                            <Check size={13} /> Active Member
                          </span>
                        ) : isPending ? (
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#f59e0b", padding: "0.4rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius-md)" }}>
                            ⏳ Invite Pending
                          </span>
                        ) : isRequested ? (
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button
                              onClick={() => handleAccept(selectedInviteTeamId, peer._id)}
                              disabled={loadingAction}
                              className="btn-primary"
                              style={{ flex: 1, fontSize: "0.7rem", padding: "0.35rem", background: "#10b981" }}
                            >
                              Approve Request
                            </button>
                            <button
                              onClick={() => handleDecline(selectedInviteTeamId, peer._id)}
                              disabled={loadingAction}
                              className="btn-ghost"
                              style={{ fontSize: "0.7rem", padding: "0.35rem", color: "#fca5a5" }}
                            >
                              Deny
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInviteFromDirectory(peer.email, selectedInviteTeamId)}
                            disabled={loadingAction}
                            className="btn-primary"
                            style={{ width: "100%", fontSize: "0.75rem", padding: "0.4rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}
                          >
                            {loadingAction ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                            Invite to Team
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showCreate && selectedEventId && user && (
        <CreateTeamModal
          eventId={selectedEventId}
          userId={user._id}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            console.log("Created team:", id);
            // Refresh to Dashboard tab to see the created team immediately
            setActiveTab("my-teams");
          }}
        />
      )}

      {freshManagedTeam && user && (
        <ManageTeammatesModal
          team={freshManagedTeam}
          userId={user._id}
          onClose={() => setActiveManageTeam(null)}
        />
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .glowing-purple-card {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.1);
          animation: pulseBorder 3s infinite alternate;
        }
        @keyframes pulseBorder {
          from { border-color: rgba(139, 92, 246, 0.2); }
          to { border-color: rgba(139, 92, 246, 0.55); }
        }
        @media (max-width: 840px) {
          .teams-split-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

