"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, ChevronDown, ChevronUp,
  Brain, Users, TrendingUp, Clock, Zap, Calendar, MapPin, ArrowRight
} from "lucide-react";
import { formatDate } from "../../lib/utils/formatDate";
import { toPercent, getMatchLabel } from "../../lib/utils/scoreUtils";

function ScoreBreakdown({ scores }) {
  const items = [
    { key: "semantic", label: "Semantic Match", icon: Brain, color: "#6366f1" },
    { key: "social", label: "Social Signal", icon: Users, color: "#8b5cf6" },
    { key: "trend", label: "Trending", icon: TrendingUp, color: "#06b6d4" },
    { key: "deadline", label: "Urgency", icon: Clock, color: "#f59e0b" },
    { key: "freshness", label: "Freshness", icon: Zap, color: "#10b981" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", marginTop: "0.75rem" }}>
      {items.map(({ key, label, icon: Icon, color }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Icon size={13} color={color} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", width: 110 }}>{label}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${toPercent(scores[key])}%`, background: color, borderRadius: 3, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", width: 30, textAlign: "right" }}>
            {toPercent(scores[key])}%
          </span>
        </div>
      ))}
    </div>
  );
}

function RecommendationCard({ recommendation, index }) {
  const { event, scores, finalScore, explanation } = recommendation;
  const [expanded, setExpanded] = useState(false);
  const matchLabel = getMatchLabel(finalScore);

  const matchColor = finalScore >= 0.75 ? "#10b981" : finalScore >= 0.55 ? "#a5b4fc" : finalScore >= 0.35 ? "#fcd34d" : "#9ca3af";

  return (
    <div
      className="glass-card animate-fade-in"
      style={{ padding: "1.5rem", animationDelay: `${index * 0.08}s` }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: matchColor }}>
              #{index + 1}
            </span>
            <span className="badge badge-primary">{event.category}</span>
            <span style={{
              padding: "0.2rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: `${matchColor}1a`,
              color: matchColor,
              border: `1px solid ${matchColor}33`,
            }}>
              {matchLabel}
            </span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>
            {event.title}
          </h3>

          {/* Meta */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
              <Calendar size={12} />{formatDate(event.startDate)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
              <MapPin size={12} />{event.venue}
            </span>
          </div>

          {/* AI Advisor Message */}
          {recommendation.aiMessage && (
            <div style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              fontSize: "0.82rem",
              lineHeight: 1.45,
              color: "#a5b4fc",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
            }}>
              <Sparkles size={16} color="#c084fc" style={{ flexShrink: 0, marginTop: 2, filter: "drop-shadow(0 0 6px rgba(192,132,252,0.6))" }} />
              <div>
                <strong style={{ color: "white", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                  ✨ AI Advisor recommendation
                </strong>
                {recommendation.aiMessage}
              </div>
            </div>
          )}

          {/* Explanations */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {explanation.slice(0, 3).map((reason, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <Sparkles size={11} color="#a5b4fc" />
                {reason}
              </div>
            ))}
          </div>
        </div>

        {/* Score circle */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `conic-gradient(${matchColor} ${toPercent(finalScore) * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: matchColor, lineHeight: 1 }}>
                {toPercent(finalScore)}
              </div>
              <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", lineHeight: 1 }}>score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expand button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "none", border: "none", cursor: "pointer", color: "#a5b4fc", fontSize: "0.78rem", fontWeight: 500 }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Hide" : "View"} score breakdown
        </button>

        <Link
          href={`/events/${event._id}`}
          className="btn-primary"
          style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 0.875rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
        >
          View Event <ArrowRight size={13} />
        </Link>
      </div>

      {expanded && <ScoreBreakdown scores={scores} />}
    </div>
  );
}

export default function RecommendationsPage() {
  const { user } = useCurrentUser();
  const getRecommendations = useAction(api.recommendations.getRecommendations);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const results = await getRecommendations({ userId: user._id, limit: 15 });
      setRecommendations(results);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={18} color="white" />
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem" }}>
                AI Recommendations
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Personalized events ranked by semantic match, social signals, trends, urgency, and freshness
            </p>
          </div>

          <button
            id="get-recommendations-btn"
            onClick={fetchRecommendations}
            disabled={!mounted || loading || !user}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}
          >
            <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "Computing..." : recommendations ? "Refresh" : "Get Recommendations"}
          </button>
        </div>

        {/* Score formula explainer */}
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "2rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
            HOW SCORES ARE COMPUTED
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {[
              { label: "Semantic", weight: "50%", color: "#6366f1", icon: "🧠" },
              { label: "Social", weight: "20%", color: "#8b5cf6", icon: "👥" },
              { label: "Trending", weight: "10%", color: "#06b6d4", icon: "📈" },
              { label: "Deadline", weight: "10%", color: "#f59e0b", icon: "⏰" },
              { label: "Freshness", weight: "10%", color: "#10b981", icon: "✨" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.875rem", background: `${item.color}0d`, border: `1px solid ${item.color}22`, borderRadius: "9999px" }}>
                <span style={{ fontSize: "0.8rem" }}>{item.icon}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: item.color }}>{item.weight}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {!recommendations && !loading && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              Ready to Find Your Events
            </h2>
            <p style={{ maxWidth: 400, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
              Click "Get Recommendations" to compute personalized event rankings using AI.
            </p>
            <button
              onClick={fetchRecommendations}
              disabled={!mounted || !user}
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
            >
              ✨ Get My Recommendations
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem" }}>
                <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: "0.75rem" }} />
                <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: "0.5rem" }} />
                <div className="skeleton" style={{ height: 14 }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: "1.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-lg)", color: "#fca5a5", marginBottom: "1.5rem" }}>
            <strong>Error:</strong> {error}
            <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              Make sure your GEMINI_API_KEY is configured in .env.local
            </p>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.event._id} recommendation={rec} index={i} />
            ))}
          </div>
        )}

        {recommendations && recommendations.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
            <p>No active events found to recommend. Check back later!</p>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
