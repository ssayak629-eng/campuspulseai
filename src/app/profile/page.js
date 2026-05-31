"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import { QRCodeDisplay } from "../../components/qr/QRCodeDisplay";
import Link from "next/link";
import {
  User, Mail, BookOpen, Calendar, Edit3, Save, X, Heart,
  CheckCircle, Star, Award, Users, QrCode, Building
} from "lucide-react";
import { formatDate, getRelativeTime } from "../../lib/utils/formatDate";

const INTERESTS_POOL = [
  "Artificial Intelligence", "Machine Learning", "Web Development", "Mobile Apps",
  "Cybersecurity", "Data Science", "Cloud Computing", "Music", "Art & Design",
  "Photography", "Sports", "Fitness", "Business", "Entrepreneurship", "Gaming",
  "Robotics", "Writing", "Public Speaking", "Research",
];

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [editForm, setEditForm] = useState({});

  const updateUser = useMutation(api.users.updateUser);
  const registrations = useQuery(
    api.registrations.getUserRegistrations,
    user ? { userId: user._id } : "skip"
  );
  const attended = useQuery(
    api.attendance.getUserAttendance,
    user ? { userId: user._id } : "skip"
  );
  const friends = useQuery(
    api.friendships.getFriends,
    user ? { userId: user._id } : "skip"
  );

  const startEditing = () => {
    setEditForm({
      name: user?.name ?? "",
      department: user?.department ?? "",
      year: user?.year ?? "",
      interests: user?.interests ?? [],
      role: user?.role ?? "student",
    });
    setEditing(true);
  };

  const saveEdits = async () => {
    if (!user) return;
    await updateUser({
      userId: user._id,
      name: editForm.name,
      department: editForm.department,
      year: editForm.year,
      interests: editForm.interests,
      role: editForm.role,
    });
    setEditing(false);
  };

  const toggleInterest = (interest) => {
    setEditForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
          <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-xl)", marginBottom: "2rem" }} />
          <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-lg)" }} />
        </div>
      </div>
    );
  }

  const upcomingRegs = (registrations ?? []).filter(
    (r) => r.event && !r.event.isArchived && r.event.startDate > Date.now()
  );
  const pastRegs = (registrations ?? []).filter(
    (r) => !r.event || r.event.isArchived || r.event.startDate <= Date.now()
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Profile Header Card */}
        <div
          className="glass-card"
          style={{
            padding: "2rem",
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)",
          }}
        >
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <img
                src={user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=96`}
                alt={user.name}
                style={{
                  width: 96, height: 96, borderRadius: "50%",
                  border: "3px solid rgba(99,102,241,0.4)",
                  objectFit: "cover",
                }}
              />
              <div style={{
                position: "absolute", bottom: 4, right: 4,
                width: 20, height: 20, borderRadius: "50%",
                background: "#10b981", border: "2px solid var(--bg-secondary)",
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
               {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    style={{ fontSize: "1.25rem", fontWeight: 700, borderRadius: "0px" }}
                    placeholder="Your name"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                      className="input-field"
                      style={{ borderRadius: "0px" }}
                      placeholder="Department"
                    />
                    <input
                      type="text"
                      value={editForm.year}
                      onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
                      className="input-field"
                      style={{ borderRadius: "0px" }}
                      placeholder="Year"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      Profile Role
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      className="input-field"
                      style={{ borderRadius: "0px", width: "100%", background: "var(--bg-card)", color: "var(--text-primary)", border: "2px solid #CBD5E1", padding: "0.5rem 0.75rem" }}
                    >
                      <option value="student">Student</option>
                      <option value="organizer">Organizer</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="provider">Venue Provider</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", margin: 0 }}>
                      {user.name}
                    </h1>
                    <span className={`badge badge-${user.role === "organizer" ? "warning" : user.role === "admin" ? "danger" : "primary"}`}>
                      {user.role}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      <Mail size={13} />{user.email}
                    </div>
                    {user.department && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        <BookOpen size={13} />{user.department} · {user.year}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                      <Calendar size={12} />Member since {formatDate(user.createdAt)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Edit button */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {editing ? (
                <>
                  <button onClick={saveEdits} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
                    <Save size={14} />Save
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
                    <X size={14} />Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={startEditing} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
                    <Edit3 size={14} />Edit Profile
                  </button>
                  {user.role !== "provider" && (
                    <Link
                      href="/provider"
                      className="btn-primary animate-wiggle"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        borderRadius: "0px",
                        boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                      }}
                    >
                      <Building size={14} />Register as Venue Provider
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginTop: "1.5rem" }}>
            {[
              { icon: CheckCircle, label: "Registered", value: registrations?.length ?? 0, color: "#6366f1" },
              { icon: Award, label: "Attended", value: attended?.length ?? 0, color: "#10b981" },
              { icon: Users, label: "Friends", value: friends?.length ?? 0, color: "#06b6d4" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ textAlign: "center", padding: "1rem", background: `${color}0a`, border: `1px solid ${color}1a`, borderRadius: "var(--radius-md)" }}>
                <Icon size={18} color={color} style={{ margin: "0 auto 0.4rem" }} />
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>
            Interests & Skills
          </h2>
          {editing ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {INTERESTS_POOL.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: "0.35rem 0.875rem",
                    borderRadius: "9999px",
                    border: `1px solid ${editForm.interests?.includes(interest) ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                    background: editForm.interests?.includes(interest) ? "rgba(99,102,241,0.2)" : "transparent",
                    color: editForm.interests?.includes(interest) ? "#a5b4fc" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {(user.interests ?? []).length === 0 && (user.skills ?? []).length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  No interests set yet. Edit your profile to add some!
                </p>
              ) : (
                <>
                  {(user.interests ?? []).map((interest) => (
                    <span key={interest} className="badge badge-primary">
                      <Heart size={10} />{interest}
                    </span>
                  ))}
                  {(user.skills ?? []).map((skill) => (
                    <span key={skill} className="badge badge-cyan">
                      <Star size={10} />{skill}
                    </span>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Upcoming Registrations */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={16} color="#6366f1" />Upcoming Events ({upcomingRegs.length})
            </h2>
            {upcomingRegs.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No upcoming events registered</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {upcomingRegs.map((reg) => (
                  <div key={reg._id} style={{ padding: "0.875rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.3rem" }}>
                      {reg.event?.title}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {getRelativeTime(reg.event?.startDate)}
                      </span>
                      <button
                        id={`show-qr-${reg._id}`}
                        onClick={() => setShowQR(reg.qrToken)}
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-sm)", padding: "0.25rem 0.6rem", cursor: "pointer", color: "#a5b4fc", fontSize: "0.72rem" }}
                      >
                        <QrCode size={11} />QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users size={16} color="#06b6d4" />Friends ({friends?.length ?? 0})
            </h2>
            {!friends || friends.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                <Users size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                <p>Friends are automatically created when you complete events together in a team!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {friends.slice(0, 8).map((friend) => friend && (
                  <div key={friend._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img
                      src={friend.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=6366f1&color=fff`}
                      alt={friend.name}
                      style={{ width: 36, height: 36, borderRadius: "50%" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.85rem" }}>{friend.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{friend.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Attended Events */}
        {(attended ?? []).length > 0 && (
          <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={16} color="#10b981" />Attended Events ({attended.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {attended.map((att) => att.event && (
                <div key={att._id} style={{ padding: "0.875rem", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{att.event.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Checked in {formatDate(att.checkedInAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QR Modal */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={() => setShowQR(null)}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "1.25rem" }}>Your Event QR Code</h3>
            <QRCodeDisplay value={showQR} />
            <button onClick={() => setShowQR(null)} className="btn-ghost" style={{ marginTop: "1.25rem", fontSize: "0.875rem" }}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          main > div:last-of-type { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
