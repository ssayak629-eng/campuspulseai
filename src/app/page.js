"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Zap,
  Users,
  Star,
  BarChart2,
  QrCode,
  ArrowRight,
  Shield,
  Brain,
  ChevronRight,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Gemini AI vectors evaluate your registrations, friendship networks, and interests for deep matching.",
    color: "var(--color-primary)", // Violet
    tag: "SMART CORE"
  },
  {
    icon: QrCode,
    title: "Sticker QR Attendance",
    description: "Volunteers scan dynamic attendance credentials instantly logged to your operator ledger.",
    color: "var(--color-secondary)", // Pink
    tag: "TAP & GO"
  },
  {
    icon: Users,
    title: "Dynamic Peer Teams",
    description: "Form squads, send credentials, and build peer networks for upcoming hackathons.",
    color: "var(--color-accent)", // Yellow
    tag: "SQUAD UP"
  },
  {
    icon: BarChart2,
    title: "Live Telemetry Charts",
    description: "Operator dashboards monitoring registration volumes, category indexing, and system click-throughs.",
    color: "var(--color-success)", // Mint
    tag: "DATA LOGS"
  },
  {
    icon: Star,
    title: "Multi-Role Privileges",
    description: "Custom dashboards for students, campus organizers, and event volunteers.",
    color: "var(--color-primary)",
    tag: "SYS ROLES"
  },
  {
    icon: Shield,
    title: "Real-time Reminders",
    description: "Speech-bubble alerts warning you about registration limits, invitations, and scheduling.",
    color: "var(--color-secondary)",
    tag: "ALERT SYSTEM"
  },
];

const stats = [
  { value: "10K+", label: "STUDENTS CONNECTED", color: "var(--color-primary)" },
  { value: "500+", label: "EVENTS COMPILED", color: "var(--color-secondary)" },
  { value: "95%", label: "SATISFACTION RATE", color: "var(--color-accent)" },
  { value: "AI-COGN", label: "RECOMCORE INDEX", color: "var(--color-success)" },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg-primary)", overflowX: "hidden" }}
      className="dot-grid"
    >
      {/* ── Navbar Header ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--bg-card)",
          borderBottom: "3px solid var(--border)",
        }}
      >
        <div
          className="page-container"
          style={{
            display: "flex",
            alignItems: "center",
            height: 64,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "var(--color-accent)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px 0px var(--border)",
              }}
            >
              <Zap size={14} color="var(--border)" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.15rem",
                color: "var(--border)",
                letterSpacing: "-0.02em",
              }}
            >
              Campus<span style={{ color: "var(--color-primary)" }}>Pulse</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            {isSignedIn ? (
              <Link 
                href="/dashboard" 
                className="btn-primary" 
                style={{ 
                  textDecoration: "none", 
                  fontSize: "0.75rem",
                  padding: "0.45rem 1.25rem"
                }}
              >
                [ Go to Dashboard ]
              </Link>
            ) : (
              <>
                <Link 
                  href="/sign-in" 
                  className="btn-ghost" 
                  style={{ 
                    textDecoration: "none", 
                    fontSize: "0.75rem",
                    padding: "0.45rem 1.25rem"
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="btn-primary" 
                  style={{ 
                    textDecoration: "none", 
                    fontSize: "0.75rem",
                    padding: "0.45rem 1.25rem"
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "6rem 1.5rem 4rem",
          textAlign: "center",
          maxWidth: 900,
          margin: "0 auto",
          position: "relative",
        }}
        className="animate-fade-in"
      >
        {/* Large Decorative Yellow Backdrop Blob */}
        <div style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "var(--radius-full)",
          background: "var(--color-accent)",
          zIndex: -1,
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.8,
          border: "3px solid var(--border)",
          boxShadow: "6px 6px 0px 0px var(--border)",
        }} />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "var(--bg-card)",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius-full)",
            padding: "0.4rem 1.25rem",
            fontSize: "0.75rem",
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            color: "var(--border)",
            marginBottom: "1.5rem",
            boxShadow: "3px 3px 0px 0px var(--border)",
          }}
        >
          <Sparkles size={12} color="var(--color-primary)" strokeWidth={2.5} />
          STABLE GRID // OPTIMISTIC COGNITIVE PLATFORM
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            color: "var(--border)",
          }}
        >
          Your Campus Events, <br />
          <span style={{ background: "var(--bg-card)", padding: "0.1rem 0.85rem", border: "3px solid var(--border)", display: "inline-block", transform: "rotate(-1.5deg)", boxShadow: "4px 4px 0px var(--color-secondary)" }}>Intelligently Curated</span>
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-primary)",
            fontWeight: 500,
            maxWidth: 580,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
            fontFamily: "var(--font-sans)",
          }}
        >
          Discover events tailored to your social node, invite squads, and auto-verify your attendance ledger — powered by Google Gemini.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="btn-primary pop-shadow animate-wiggle"
            style={{
              textDecoration: "none",
              fontSize: "0.85rem",
              padding: "0.85rem 2.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isSignedIn ? "Go to Dashboard" : "Start Exploring"}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link
            href="/events"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              fontSize: "0.85rem",
              padding: "0.85rem 2.2rem",
            }}
          >
            Browse Events
          </Link>
        </div>
      </section>

      {/* ── Bouncy Scrolling Marquee ───────────────────────────────────────── */}
      <section style={{ 
        background: "var(--color-primary)", 
        borderTop: "3px solid var(--border)", 
        borderBottom: "3px solid var(--border)", 
        padding: "0.75rem 0",
        overflow: "hidden",
        whiteSpace: "nowrap"
      }}>
        <div 
          className="animate-marquee"
          style={{
            display: "inline-block",
            fontSize: "1.1rem",
            fontWeight: 900,
            fontFamily: "var(--font-display)",
            color: "#FFFFFF",
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          ★ HACKATHONS ★ DANCE CLUBS ★ ROBOTICS SEMINARS ★ PEER MATCHING ★ GEMINI RECOMMENDATIONS ★ STUDENT LEDGER ★ HACKATHONS ★ DANCE CLUBS ★ ROBOTICS SEMINARS ★ PEER MATCHING ★ GEMINI RECOMMENDATIONS ★ STUDENT LEDGER ★
        </div>
      </section>

      {/* ── Stats Sticker Grid ─────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 1.5rem 2rem" }}>
        <div
          className="page-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="pop-shadow-card"
              style={{ 
                padding: "1.5rem", 
                textAlign: "center",
                background: "var(--bg-card)",
              }}
            >
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-display)",
                  color: stat.color,
                  marginBottom: "0.25rem",
                  textShadow: `1.5px 1.5px 0px var(--border)`,
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Sticker Matrix ────────────────────────────────────────── */}
      <section style={{ padding: "4rem 1.5rem 6rem" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              className="section-header"
              style={{ color: "var(--border)", marginBottom: "0.75rem" }}
            >
              EVERYTHING FOR YOUR CAMPUS MATRIX
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, fontFamily: "var(--font-sans)", maxWidth: 520, margin: "0 auto" }}>
              Clean stables, friendly visual readouts, and highly tactile tools designed to spark interactive fun.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="pop-shadow-card"
                  style={{ 
                    padding: "2rem",
                    background: "var(--bg-card)",
                    position: "relative"
                  }}
                >
                  {/* Floating Circle Icon sits half-in/half-out of top border */}
                  <div
                    style={{
                      position: "absolute",
                      width: 44,
                      height: 44,
                      background: feature.color,
                      border: "2px solid var(--border)",
                      borderRadius: "var(--radius-full)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      top: -22,
                      left: 24,
                      boxShadow: "2px 2px 0px 0px var(--border)",
                    }}
                  >
                    <Icon size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </div>

                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "var(--text-muted)",
                    textAlign: "right",
                    marginBottom: "0.5rem"
                  }}>
                    // {feature.tag}
                  </div>

                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      marginBottom: "0.5rem",
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      lineHeight: 1.6,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Playful CTA Speech-Bubble ──────────────────────────────────────── */}
      <section style={{ padding: "2rem 1.5rem 6rem" }}>
        <div
          className="page-container"
          style={{
            background: "var(--bg-card)",
            border: "3px solid var(--border)",
            boxShadow: "8px 8px 0px 0px var(--color-accent)",
            padding: "4rem 2rem",
            textAlign: "center",
            position: "relative",
            borderRadius: "var(--radius-lg)"
          }}
        >
          {/* Confetti Triangles and Circles absolutely positioned */}
          <div style={{ position: "absolute", top: 12, left: 16, width: 14, height: 14, borderRadius: "50%", background: "var(--color-primary)", border: "2px solid var(--border)" }} />
          <div style={{ position: "absolute", bottom: 16, right: 20, width: 12, height: 12, background: "var(--color-secondary)", border: "2px solid var(--border)" }} />

          <h2
            className="section-header"
            style={{ marginBottom: "1rem", color: "var(--border)" }}
          >
            Ready to Transform Your Grid?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              maxWidth: 480,
              margin: "0 auto 2rem",
            }}
          >
            Join thousands of active student nodes compiling and organizing premium campus events!
          </p>
          <Link
            href="/sign-up"
            className="btn-primary pop-shadow animate-wiggle"
            style={{
              textDecoration: "none",
              fontSize: "0.85rem",
              padding: "0.85rem 2.5rem",
            }}
          >
            Join CampusPulse Free
            <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ── Slate Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "3px solid var(--border)",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.72rem",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          letterSpacing: "0.05em",
        }}
      >
        © 2026 CAMPUSPULSE // STABLE GRID, WILD DECORATION. POWERED BY COGNITIVE GEMINI AI CORE.
      </footer>
    </div>
  );
}
