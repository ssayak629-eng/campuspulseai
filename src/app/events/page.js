"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import { EventCard } from "../../components/events/EventCard";
import { Search, Grid, List, Sparkles, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "All", "Technology", "Sports", "Arts", "Academic",
  "Cultural", "Career", "Social", "Health", "Other",
];

function SkeletonCard() {
  return (
    <div 
      className="skeleton"
      style={{ 
        height: 200,
        border: "2px dashed var(--border)", 
        borderRadius: "var(--radius-md)"
      }}
    />
  );
}

export default function EventsPage() {
  const { user } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("grid");

  const events = useQuery(api.events.listActiveEvents, {
    category: category !== "All" ? category : undefined,
  });

  const filtered = (events ?? []).filter((e) =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
      <Navbar />

      <main style={{ padding: "2.5rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {/* Playful Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            <Sparkles size={12} strokeWidth={2.5} />
            DATABASE // ACTIVE_SIGNAL_Feeds
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.75rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            ★ EXPLORE CAMPUS EVENTS ★
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "0.2rem", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            Found <span style={{ color: "var(--color-primary)" }}>{events ? `${filtered.length} active event stickers` : "loading catalogs..."}</span> matching your current query.
          </p>
        </div>

        {/* Search & View toggles */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "stretch" }}>
          {/* Playful focused input */}
          <div style={{ position: "relative", flex: 1, minWidth: 260, display: "flex" }}>
            <Search
              size={16}
              strokeWidth={2.5}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-primary)",
                zIndex: 10,
              }}
            />
            <input
              id="event-search"
              type="text"
              placeholder="SEARCH EVENTS, TAGS, SQUADS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ 
                paddingLeft: "2.75rem",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
                boxShadow: "3px 3px 0px 0px var(--shadow-color)",
                borderRadius: "var(--radius-sm)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "4px 4px 0px 0px var(--color-accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
              }}
            />
          </div>

          {/* View Toggle Buttons */}
          <div style={{ 
            display: "flex", 
            background: "var(--bg-card)", 
            padding: 3, 
            border: "2px solid var(--border)",
            borderRadius: "var(--radius-full)",
            boxShadow: "3px 3px 0px 0px var(--shadow-color)",
          }}>
            <button
              id="grid-view-btn"
              onClick={() => setView("grid")}
              style={{
                width: 36,
                height: 36,
                border: "none",
                cursor: "pointer",
                borderRadius: "var(--radius-full)",
                background: view === "grid" ? "var(--color-primary)" : "transparent",
                color: view === "grid" ? "#FFFFFF" : "var(--text-primary)",
                display: "flex", 
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                border: view === "grid" ? "2px solid var(--border)" : "2px solid transparent",
                boxShadow: view === "grid" ? "1.5px 1.5px 0px 0px var(--shadow-color)" : "none",
              }}
            >
              <Grid size={14} strokeWidth={2.5} />
            </button>
            <button
              id="list-view-btn"
              onClick={() => setView("list")}
              style={{
                width: 36,
                height: 36,
                border: "none",
                cursor: "pointer",
                borderRadius: "var(--radius-full)",
                background: view === "list" ? "var(--color-primary)" : "transparent",
                color: view === "list" ? "#FFFFFF" : "var(--text-primary)",
                display: "flex", 
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                border: view === "list" ? "2px solid var(--border)" : "2px solid transparent",
                boxShadow: view === "list" ? "1.5px 1.5px 0px 0px var(--shadow-color)" : "none",
              }}
            >
              <List size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Category Pills Tabs */}
        <div style={{ display: "flex", gap: "0.45rem", marginBottom: "2.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                id={`category-${cat.toLowerCase()}`}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "0.45rem 1.15rem",
                  background: isActive ? "var(--color-accent)" : "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: isActive ? "3px 3px 0px 0px var(--shadow-color)" : "1.5px 1.5px 0px 0px var(--shadow-color)",
                  transform: isActive ? "translate(-1.5px, -1.5px)" : "translate(0, 0)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bg-elevated)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "2.5px 2.5px 0px 0px var(--shadow-color)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "1.5px 1.5px 0px 0px var(--shadow-color)";
                  }
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Event List / Grid display */}
        {events === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div 
            className="speech-bubble pop-shadow"
            style={{ 
              textAlign: "center", 
              padding: "4rem 2rem", 
              background: "var(--bg-card)",
              maxWidth: 600,
              margin: "2rem auto"
            }}
          >
            <div style={{ 
              width: 50, 
              height: 50, 
              borderRadius: "var(--radius-full)", 
              border: "2px solid var(--border)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 1.5rem", 
              background: "var(--color-secondary)",
              boxShadow: "2px 2px 0px 0px var(--shadow-color)"
            }}>
              <AlertCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: "0.5rem" }}>
              NO EVENT STICKERS FOUND!
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
              Adjust your search keywords or tap on another category capsule to load campus events.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: view === "grid"
              ? "repeat(auto-fill, minmax(300px, 1fr))"
              : "1fr",
            gap: "1.5rem",
          }}>
            {filtered.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                userId={user?._id}
                compact={view === "list"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
