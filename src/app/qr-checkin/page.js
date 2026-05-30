"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import dynamic from "next/dynamic";
import {
  QrCode, CheckCircle, XCircle, UserCheck, Search,
  Loader2, RefreshCw, AlertTriangle, Users
} from "lucide-react";
import { formatDateTime } from "../../lib/utils/formatDate";

// Dynamic import to prevent SSR issues with camera APIs
const QRScanner = dynamic(
  () => import("../../components/qr/QRScanner").then((m) => m.QRScanner),
  { ssr: false, loading: () => (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
      <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.75rem", display: "block" }} />
      Loading camera...
    </div>
  )}
);

function CheckInResult({ result, onClear }) {
  if (!result) return null;
  const success = result.success;

  return (
    <div style={{
      padding: "1.5rem",
      borderRadius: "var(--radius-lg)",
      border: `1px solid ${success ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
      background: success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.75rem",
      textAlign: "center",
    }}>
      {success ? (
        <CheckCircle size={48} color="#10b981" />
      ) : (
        <XCircle size={48} color="#ef4444" />
      )}
      <div>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", color: success ? "#6ee7b7" : "#fca5a5", marginBottom: "0.35rem" }}>
          {result.message}
        </p>
        {result.user && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <img
                src={result.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.name)}&background=6366f1&color=fff`}
                alt={result.user.name}
                style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)" }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600 }}>{result.user.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {result.user.department} · {result.user.year}
                </div>
              </div>
            </div>
            {result.event && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                ✓ Checked in to: <strong>{result.event.title}</strong>
              </div>
            )}
          </div>
        )}
      </div>
      <button
        onClick={onClear}
        className="btn-ghost"
        style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}
      >
        Scan Next
      </button>
    </div>
  );
}

export default function QRCheckinPage() {
  const { user } = useCurrentUser();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualToken, setManualToken] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");

  const checkIn = useMutation(api.attendance.checkInByQR);

  // Select event for attendance list
  const [selectedEventId, setSelectedEventId] = useState(null);
  const userEvents = useQuery(
    api.events.getUserEvents,
    user ? { userId: user._id } : "skip"
  );
  const attendance = useQuery(
    api.attendance.getEventAttendance,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  const registrations = useQuery(
    api.registrations.getEventRegistrations,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  const handleScan = useCallback(async (qrToken) => {
    if (processing || result) return;
    setProcessing(true);
    try {
      const checkResult = await checkIn({ qrToken });
      setResult(checkResult);
      setScanning(false);
    } catch (err) {
      setResult({ success: false, message: err.message ?? "Check-in failed" });
      setScanning(false);
    } finally {
      setProcessing(false);
    }
  }, [processing, result, checkIn]);

  const handleManualCheckIn = async () => {
    if (!manualToken.trim()) return;
    setManualLoading(true);
    try {
      const checkResult = await checkIn({ qrToken: manualToken.trim() });
      setResult(checkResult);
      setManualToken("");
    } catch (err) {
      setResult({ success: false, message: err.message ?? "Invalid token" });
    } finally {
      setManualLoading(false);
    }
  };

  // Filter organizer events
  const organizerEvents = (userEvents ?? []).filter(
    (e) => e.organizerRole === "owner" || e.organizerRole === "organizer" || e.organizerRole === "volunteer"
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem",
            marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem"
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#06b6d4,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode size={22} color="white" />
            </div>
            QR Check-in
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Scan attendee QR codes or manage attendance manually
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.08)", width: "fit-content" }}>
          {[
            { key: "scanner", label: "📷 QR Scanner" },
            { key: "manual", label: "⌨️ Manual Entry" },
            { key: "attendance", label: "📋 Attendance List" },
          ].map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => { setActiveTab(tab.key); setResult(null); }}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none",
                cursor: "pointer",
                background: activeTab === tab.key ? "rgba(6,182,212,0.2)" : "transparent",
                color: activeTab === tab.key ? "#67e8f9" : "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
          {/* Left panel */}
          <div>
            {activeTab === "scanner" && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>
                  Camera QR Scanner
                </h2>

                {!scanning && !result && (
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 1.25rem",
                    }}>
                      <QrCode size={36} color="#06b6d4" />
                    </div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                      Ready to scan attendee QR codes
                    </p>
                    <button
                      id="start-scanner-btn"
                      onClick={() => { setScanning(true); setResult(null); }}
                      className="btn-primary"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Start Camera Scanner
                    </button>
                  </div>
                )}

                {scanning && !result && (
                  <div>
                    <QRScanner onScan={handleScan} />
                    <button
                      onClick={() => setScanning(false)}
                      className="btn-ghost"
                      style={{ width: "100%", marginTop: "0.75rem", fontSize: "0.85rem" }}
                    >
                      Stop Scanner
                    </button>
                  </div>
                )}

                {processing && (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <Loader2 size={32} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem" }}>Processing check-in...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "manual" && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>
                  Manual Token Entry
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                  Enter the attendee's QR token if the camera is unavailable
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    id="manual-token-input"
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
                    className="input-field"
                    placeholder="Paste or type QR token..."
                    style={{ flex: 1, fontFamily: "monospace", fontSize: "0.8rem" }}
                  />
                  <button
                    id="manual-checkin-btn"
                    onClick={handleManualCheckIn}
                    className="btn-primary"
                    disabled={manualLoading || !manualToken.trim()}
                    style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    {manualLoading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <UserCheck size={15} />}
                    Check In
                  </button>
                </div>

                {/* Alert about fallback */}
                <div style={{ marginTop: "1.25rem", padding: "0.875rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-md)", display: "flex", gap: "0.5rem" }}>
                  <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    Manual entry should only be used when the camera scanner is unavailable. Always prefer QR scanning for security.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users size={16} color="#8b5cf6" />
                  Attendance List
                </h2>

                {/* Event selector */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    Select Event
                  </label>
                  <select
                    id="attendance-event-select"
                    value={selectedEventId ?? ""}
                    onChange={(e) => setSelectedEventId(e.target.value || null)}
                    className="input-field"
                    style={{ appearance: "none" }}
                  >
                    <option value="">Choose an event you organize...</option>
                    {organizerEvents.map((e) => (
                      <option key={e._id} value={e._id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                {selectedEventId && (
                  <>
                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                      {[
                        { label: "Registered", value: registrations?.length ?? 0, color: "#6366f1" },
                        { label: "Checked In", value: attendance?.length ?? 0, color: "#10b981" },
                      ].map((s) => (
                        <div key={s.label} style={{ padding: "0.875rem", background: `${s.color}0d`, border: `1px solid ${s.color}22`, borderRadius: "var(--radius-md)", textAlign: "center" }}>
                          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Attendance rate bar */}
                    {registrations?.length > 0 && (
                      <div style={{ marginBottom: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                          <span>Attendance Rate</span>
                          <span>{Math.round(((attendance?.length ?? 0) / registrations.length) * 100)}%</span>
                        </div>
                        <div className="score-bar">
                          <div
                            className="score-bar-fill"
                            style={{ width: `${Math.round(((attendance?.length ?? 0) / registrations.length) * 100)}%`, background: "#10b981" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Attendee list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 350, overflowY: "auto" }}>
                      {(registrations ?? []).map((reg) => {
                        const checkedIn = (attendance ?? []).some((a) => a.userId === reg.userId);
                        return (
                          <div key={reg._id} style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.6rem 0.875rem",
                            background: checkedIn ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                            borderRadius: "var(--radius-md)",
                            border: `1px solid ${checkedIn ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                            <img
                              src={reg.user?.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.user?.name ?? "U")}&background=6366f1&color=fff`}
                              alt={reg.user?.name}
                              style={{ width: 32, height: 32, borderRadius: "50%" }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{reg.user?.name}</div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{reg.user?.department}</div>
                            </div>
                            {checkedIn ? (
                              <span className="badge badge-success"><CheckCircle size={11} />In</span>
                            ) : (
                              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Pending</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right panel: check-in result */}
          {result && (
            <div>
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <CheckInResult result={result} onClear={() => { setResult(null); setScanning(true); }} />
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
