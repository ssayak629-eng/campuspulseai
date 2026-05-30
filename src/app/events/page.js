"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import { EventCard } from "../../components/events/EventCard";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  "All", "Technology", "Sports", "Arts", "Academic",
  "Cultural", "Career", "Social", "Health", "Other",
];

function SkeletonCard() {
  return (
    <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="skeleton" style={{ height: 120 }} />
      <div style={{ padding: "1rem" }}>
        <div className="skeleton" style={{ height: 14, marginBottom: 8, width: "60%" }} />
        <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "80%" }} />
      </div>
    </div>
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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ padding: "2rem 1.5rem", maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem" }}>
            Browse Events
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {events ? `${events.length} events available` : "Loading events..."}
          </p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              id="event-search"
              type="text"
              placeholder="Search events, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              id="grid-view-btn"
              onClick={() => setView("grid")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none",
                cursor: "pointer",
                background: view === "grid" ? "rgba(99,102,241,0.3)" : "transparent",
                color: view === "grid" ? "#a5b4fc" : "var(--text-muted)",
                display: "flex", alignItems: "center",
              }}
            >
              <Grid size={16} />
            </button>
            <button
              id="list-view-btn"
              onClick={() => setView("list")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none",
                cursor: "pointer",
                background: view === "list" ? "rgba(99,102,241,0.3)" : "transparent",
                color: view === "list" ? "#a5b4fc" : "var(--text-muted)",
                display: "flex", alignItems: "center",
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`category-${cat.toLowerCase()}`}
              onClick={() => setCategory(cat)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                border: `1px solid ${category === cat ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                background: category === cat ? "rgba(99,102,241,0.15)" : "transparent",
                color: category === cat ? "#a5b4fc" : "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: category === cat ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {events === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              No events found
            </p>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: view === "grid"
              ? "repeat(auto-fill, minmax(300px, 1fr))"
              : "1fr",
            gap: "1.25rem",
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
