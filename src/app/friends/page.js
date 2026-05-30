"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import {
  Users, Search, UserPlus, UserMinus, Sparkles, MessageSquare,
  Bookmark, CheckCircle, ShieldAlert, Award, Compass, Loader2
} from "lucide-react";

export default function FriendsPage() {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-friends");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Queries
  const friends = useQuery(
    api.friendships.getFriends,
    user ? { userId: user._id } : "skip"
  );
  
  const searchResults = useQuery(
    api.users.searchUsers,
    searchQuery ? { query: searchQuery } : "skip"
  );

  // Mutations
  const addFriend = useMutation(api.friendships.createFriendship);
  const removeFriend = useMutation(api.friendships.removeFriendship);

  const handleAddFriend = async (peerId) => {
    if (!user) return;
    setActionLoadingId(peerId);
    try {
      await addFriend({ user1: user._id, user2: peerId });
    } catch (err) {
      console.error("Error adding friend:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = async (peerId) => {
    if (!user) return;
    if (!confirm("Are you sure you want to unfriend this user?")) return;
    setActionLoadingId(peerId);
    try {
      await removeFriend({ user1: user._id, user2: peerId });
    } catch (err) {
      console.error("Error removing friend:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper: Compute mutual interest & skills compatibility score (proper scoring)
  const calculateCompatibility = (peer) => {
    if (!user || !peer) return 0;
    
    const userInterests = user.interests ?? [];
    const peerInterests = peer.interests ?? [];
    
    const userSkills = user.skills ?? [];
    const peerSkills = peer.skills ?? [];

    if (userInterests.length === 0 && peerInterests.length === 0 && userSkills.length === 0 && peerSkills.length === 0) {
      // If department or year aligns, show a slight boost, else baseline 45
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
    
    // Perfect match
    if (interestScore === 1 && skillScore === 1 && sameDept && sameYear) return 100;
    
    // Clamp to [15, 98] for realistic variety
    return Math.max(15, Math.min(98, finalPercent));
  };

  const getMatchLabel = (score) => {
    if (score >= 85) return { text: "✨ Exceptional Match", color: "#10b981", bg: "rgba(16,185,129,0.12)" };
    if (score >= 65) return { text: "🔥 High Match", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" };
    if (score >= 40) return { text: "⚡ Good Match", color: "#6366f1", bg: "rgba(99,102,241,0.12)" };
    return { text: "💬 Compatible Match", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" };
  };

  const isFriend = (peerId) => {
    if (!friends) return false;
    return friends.some((f) => f && f._id === peerId);
  };

  // Filter out self from search results
  const filteredSearchResults = (searchResults ?? []).filter(
    (u) => u && user && u._id !== user._id
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.25rem",
            marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem",
            background: "linear-gradient(135deg, #a5b4fc, #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            <Users size={32} color="#818cf8" style={{ filter: "drop-shadow(0 2px 8px rgba(129,140,248,0.3))" }} />
            Campus Network
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Connect with peers, form hackathon teams, and discover shared campus interests.
          </p>
        </div>

        {/* Tab Controls and Search Input */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
          gap: "1rem", marginBottom: "1.5rem"
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.03)",
            padding: 4, borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.08)",
            width: "fit-content"
          }}>
            {[
              { key: "my-friends", label: `👥 My Friends (${friends?.length ?? 0})` },
              { key: "find-peers", label: "🔍 Find Peers" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "calc(var(--radius-md) - 2px)",
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === tab.key ? "rgba(99,102,241,0.2)" : "transparent",
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

          {/* Search bar inside peers tab */}
          {activeTab === "find-peers" && (
            <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, department..."
                className="input-field"
                style={{ paddingLeft: "2.5rem", fontSize: "0.85rem" }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          )}
        </div>

        {/* Tab Contents */}
        {activeTab === "my-friends" && (
          <div>
            {friends === undefined ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                <Loader2 size={36} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : friends.length === 0 ? (
              <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", borderStyle: "dashed" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "white", marginBottom: "0.5rem" }}>
                  Your friends list is currently empty
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
                  Connect with students sharing similar academic pathways, technical skills, or campus hobby interest groups!
                </p>
                <button
                  onClick={() => setActiveTab("find-peers")}
                  className="btn-primary"
                  style={{ fontSize: "0.85rem" }}
                >
                  Browse Campus Directory
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {friends.map((friend) => {
                  if (!friend) return null;
                  const match = calculateCompatibility(friend);
                  const label = getMatchLabel(match);

                  return (
                    <div key={friend._id} className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        {/* Basic Profile Details */}
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                          <img
                            src={friend.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=6366f1&color=fff`}
                            alt={friend.name}
                            style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", objectFit: "cover" }}
                          />
                          <div>
                            <h3 style={{ fontWeight: 600, color: "white", fontSize: "0.95rem" }}>{friend.name}</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                              {friend.department || "No Dept"} · {friend.year || "Unknown"}
                            </p>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.25rem",
                              fontSize: "0.68rem", fontWeight: 600, color: label.color,
                              background: label.bg, padding: "0.15rem 0.45rem", borderRadius: "9999px",
                              marginTop: "0.35rem"
                            }}>
                              <Sparkles size={10} />
                              {match}% AI Compatibility
                            </span>
                          </div>
                        </div>

                        {/* Common Interest Badges */}
                        {friend.interests && friend.interests.length > 0 && (
                          <div style={{ marginBottom: "1rem" }}>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.35rem" }}>
                              Interests
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {friend.interests.slice(0, 4).map((interest, i) => {
                                const isMutual = user?.interests?.includes(interest);
                                return (
                                  <span key={i} style={{
                                    fontSize: "0.68rem", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)",
                                    background: isMutual ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                                    color: isMutual ? "#a5b4fc" : "var(--text-secondary)",
                                    border: `1px solid ${isMutual ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}`,
                                    fontWeight: isMutual ? 600 : 400
                                  }}>
                                    {interest} {isMutual && "✨"}
                                  </span>
                                );
                              })}
                              {friend.interests.length > 4 && (
                                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                  +{friend.interests.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                        <button
                          onClick={() => handleRemoveFriend(friend._id)}
                          disabled={actionLoadingId === friend._id}
                          className="btn-ghost"
                          style={{
                            flex: 1, fontSize: "0.78rem", padding: "0.4rem",
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                            color: "var(--text-muted)"
                          }}
                        >
                          {actionLoadingId === friend._id ? (
                            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                          ) : (
                            <UserMinus size={13} />
                          )}
                          Unfriend
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "find-peers" && (
          <div>
            {!searchQuery ? (
              <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧭</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "white", marginBottom: "0.5rem" }}>
                  Search for Campus Peers
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "450px", margin: "0 auto" }}>
                  Find classmate profiles, filter by hobbies or technical stacks, and instantly view your mutual AI profile matching score!
                </p>
              </div>
            ) : filteredSearchResults.length === 0 ? (
              <div className="glass-card" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  No active students or organizers matched "{searchQuery}"
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {filteredSearchResults.map((peer) => {
                  const match = calculateCompatibility(peer);
                  const label = getMatchLabel(match);
                  const connected = isFriend(peer._id);

                  return (
                    <div key={peer._id} className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        {/* Profile Row */}
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                          <img
                            src={peer.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.name)}&background=6366f1&color=fff`}
                            alt={peer.name}
                            style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <h3 style={{ fontWeight: 600, color: "white", fontSize: "0.95rem" }}>{peer.name}</h3>
                              {peer.role === "organizer" && (
                                <span style={{ fontSize: "0.6rem", background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "0.05rem 0.35rem", borderRadius: "4px", border: "1px solid rgba(245,158,11,0.25)" }}>
                                  Org
                                </span>
                              )}
                            </div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                              {peer.department || "No Dept"} · {peer.year || "Unknown"}
                            </p>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.25rem",
                              fontSize: "0.68rem", fontWeight: 600, color: label.color,
                              background: label.bg, padding: "0.15rem 0.45rem", borderRadius: "9999px",
                              marginTop: "0.35rem"
                            }}>
                              <Sparkles size={10} />
                              {match}% AI Compatibility
                            </span>
                          </div>
                        </div>

                        {/* Interests */}
                        {peer.interests && peer.interests.length > 0 && (
                          <div style={{ marginBottom: "1rem" }}>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.35rem" }}>
                              Interests & Hobbies
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {peer.interests.slice(0, 4).map((interest, i) => {
                                const isMutual = user?.interests?.includes(interest);
                                return (
                                  <span key={i} style={{
                                    fontSize: "0.68rem", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)",
                                    background: isMutual ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                                    color: isMutual ? "#a5b4fc" : "var(--text-secondary)",
                                    border: `1px solid ${isMutual ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}`,
                                    fontWeight: isMutual ? 600 : 400
                                  }}>
                                    {interest} {isMutual && "✨"}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Connection Button */}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                        {connected ? (
                          <span style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                            fontSize: "0.8rem", color: "#10b981", width: "100%", padding: "0.45rem",
                            background: "rgba(16,185,129,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(16,185,129,0.15)"
                          }}>
                            <CheckCircle size={14} /> Connected Friends
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddFriend(peer._id)}
                            disabled={actionLoadingId === peer._id}
                            className="btn-primary"
                            style={{
                              width: "100%", fontSize: "0.8rem", padding: "0.45rem",
                              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem"
                            }}
                          >
                            {actionLoadingId === peer._id ? (
                              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                              <UserPlus size={14} />
                            )}
                            Add Friend
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

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
