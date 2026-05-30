"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import Navbar from "../../../components/layout/Navbar";
import {
  Upload, Sparkles, X, Plus, Calendar, MapPin, Users, Tag, ChevronRight, ArrowLeft, Loader2
} from "lucide-react";

const CATEGORIES = ["Technology", "Sports", "Arts", "Academic", "Cultural", "Career", "Social", "Health", "Other"];

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="tag-input-container">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" onClick={() => removeTag(tag)}>×</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
          }
          if (e.key === "Backspace" && !input && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
          }
        }}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{ border: "none", background: "transparent", color: "white", outline: "none", fontSize: "0.85rem", flex: 1, minWidth: 100, padding: "0.25rem" }}
      />
    </div>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const createEvent = useMutation(api.events.createEvent);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Technology",
    tags: [],
    venue: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxParticipants: "",
    posterUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const fileRef = useRef();

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Poster upload + Gemini AI extraction
  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      const previewUrl = reader.result;
      setPosterPreview(previewUrl);

      setExtracting(true);
      try {
        const resp = await fetch("/api/extract-poster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, mimeType: file.type }),
        });
        const data = await resp.json();

        setForm((f) => ({
          ...f,
          title: data.title || f.title,
          description: data.description || f.description,
          venue: data.venue || f.venue,
          category: data.category || f.category,
          tags: data.tags?.length ? data.tags : f.tags,
          startDate: data.date || f.startDate,
          registrationDeadline: data.registrationDeadline || f.registrationDeadline,
          maxParticipants: data.maxParticipants?.toString() || f.maxParticipants,
        }));
      } catch (err) {
        console.error("AI extraction failed:", err);
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const toTimestamp = (str) => str ? new Date(str).getTime() : Date.now() + 86400000;

      const eventId = await createEvent({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags,
        venue: form.venue,
        startDate: toTimestamp(form.startDate),
        endDate: toTimestamp(form.endDate || form.startDate),
        registrationDeadline: toTimestamp(form.registrationDeadline),
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
        posterUrl: form.posterUrl || undefined,
        createdBy: user._id,
      });

      router.push(`/events/${eventId}`);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  const inputStyle = { marginBottom: "1.25rem" };
  const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.4rem" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", marginBottom: "1rem", fontSize: "0.875rem" }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "0.35rem" }}>
            Create New Event
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Fill in the details or upload a poster to auto-fill with AI</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Poster Upload */}
          <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={16} color="#8b5cf6" />
              AI Poster Extraction
            </h2>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePosterUpload}
              style={{ display: "none" }}
              id="poster-upload"
            />

            {posterPreview ? (
              <div style={{ position: "relative" }}>
                <img src={posterPreview} alt="Poster" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                <button
                  type="button"
                  onClick={() => { setPosterPreview(null); update("posterUrl", ""); }}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
                >
                  <X size={14} />
                </button>
                {extracting && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", borderRadius: "var(--radius-md)", gap: "0.5rem", color: "#a5b4fc" }}>
                    <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                    Extracting with Gemini AI...
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="upload-poster-btn"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: "100%", padding: "2rem", border: "2px dashed rgba(139,92,246,0.3)", borderRadius: "var(--radius-md)",
                  background: "rgba(139,92,246,0.05)", cursor: "pointer", color: "var(--text-secondary)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)"; e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.background = "rgba(139,92,246,0.05)"; }}
              >
                <Upload size={28} color="#8b5cf6" />
                <div>
                  <div style={{ fontWeight: 600, color: "white", marginBottom: "0.25rem" }}>Upload Event Poster</div>
                  <div style={{ fontSize: "0.8rem" }}>Gemini AI will auto-fill the form from your poster image</div>
                </div>
              </button>
            )}
          </div>

          {/* Event Details */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem" }}>Event Details</h2>

            <div style={inputStyle}>
              <label style={labelStyle}>Event Title *</label>
              <input id="event-title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" placeholder="e.g. National Hackathon 2026" required />
            </div>

            <div style={inputStyle}>
              <label style={labelStyle}>Description *</label>
              <textarea
                id="event-description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="input-field"
                placeholder="Describe your event..."
                rows={4}
                required
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select id="event-category" value={form.category} onChange={(e) => update("category", e.target.value)} className="input-field" style={{ appearance: "none" }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Max Participants</label>
                <input id="max-participants" type="number" value={form.maxParticipants} onChange={(e) => update("maxParticipants", e.target.value)} className="input-field" placeholder="Unlimited" min="1" />
              </div>
            </div>

            <div style={inputStyle}>
              <label style={labelStyle}>Tags (press Enter to add)</label>
              <TagInput tags={form.tags} onChange={(tags) => update("tags", tags)} placeholder="Add tags..." />
            </div>

            <div style={inputStyle}>
              <label style={labelStyle}><MapPin size={12} style={{ display: "inline", marginRight: 4 }} />Venue *</label>
              <input id="event-venue" type="text" value={form.venue} onChange={(e) => update("venue", e.target.value)} className="input-field" placeholder="e.g. Main Auditorium, Block A" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={labelStyle}><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />Start Date & Time *</label>
                <input id="start-date" type="datetime-local" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className="input-field" required />
              </div>
              <div>
                <label style={labelStyle}>End Date & Time *</label>
                <input id="end-date" type="datetime-local" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className="input-field" required />
              </div>
            </div>

            <div style={inputStyle}>
              <label style={labelStyle}>Registration Deadline *</label>
              <input id="registration-deadline" type="datetime-local" value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} className="input-field" required />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
              <button
                id="create-event-btn"
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Creating...</> : <><Plus size={15} />Create Event</>}
              </button>
            </div>
          </div>
        </form>
      </main>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          form div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
