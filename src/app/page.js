"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Zap,
  Calendar,
  Users,
  Star,
  BarChart2,
  QrCode,
  ArrowRight,
  Shield,
  Brain,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description:
      "Personalized event suggestions using semantic embeddings, social signals, and trend analysis.",
    color: "#6366f1",
  },
  {
    icon: QrCode,
    title: "QR Attendance System",
    description:
      "Seamless check-in with auto-generated QR codes. Volunteers scan, attendance recorded instantly.",
    color: "#8b5cf6",
  },
  {
    icon: Users,
    title: "Team Formation",
    description:
      "Create and join teams for hackathons and competitions. Automatic friendship network built.",
    color: "#06b6d4",
  },
  {
    icon: BarChart2,
    title: "Organizer Analytics",
    description:
      "Track registrations, attendance rates, trending categories, and recommendation CTR.",
    color: "#10b981",
  },
  {
    icon: Star,
    title: "Multi-Role Management",
    description:
      "Owner, Organizer, and Volunteer roles with granular access control per event.",
    color: "#f59e0b",
  },
  {
    icon: Shield,
    title: "Real-Time Notifications",
    description:
      "Instant alerts for registrations, team invites, organizer roles, and event reminders.",
    color: "#ef4444",
  },
];

const stats = [
  { value: "10K+", label: "Students Connected" },
  { value: "500+", label: "Events Organized" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "AI-First", label: "Recommendation Engine" },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg-primary)" }}
      className="hero-mesh"
    >
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10,15,30,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
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
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CampusPulseAI
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.875rem" }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="btn-ghost" style={{ textDecoration: "none", fontSize: "0.875rem" }}>
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.875rem" }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "6rem 1.5rem 4rem",
          textAlign: "center",
          maxWidth: 900,
          margin: "0 auto",
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "9999px",
            padding: "0.35rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#a5b4fc",
            marginBottom: "1.5rem",
          }}
        >
          <Zap size={13} />
          AI-Powered Campus Event Platform
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
          }}
        >
          Your Campus Events,{" "}
          <span className="gradient-text">Intelligently Curated</span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: 640,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Discover events tailored to your interests, connect with friends, join
          teams, and never miss a registration deadline — powered by Gemini AI.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="btn-primary"
            style={{
              textDecoration: "none",
              fontSize: "1rem",
              padding: "0.75rem 2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isSignedIn ? "Go to Dashboard" : "Start Exploring"}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/events"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              fontSize: "1rem",
              padding: "0.75rem 2rem",
            }}
          >
            Browse Events
          </Link>
        </div>

        {/* Floating orbs decoration */}
        <div
          style={{
            position: "relative",
            marginTop: "4rem",
            height: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -80,
              left: "10%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.08)",
              filter: "blur(40px)",
              animation: "float 4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -60,
              right: "5%",
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(6,182,212,0.06)",
              filter: "blur(40px)",
              animation: "float 5s ease-in-out infinite 1s",
            }}
          />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "2rem 1.5rem 4rem" }}>
        <div
          className="page-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: "1.5rem", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section style={{ padding: "2rem 1.5rem 6rem" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              className="section-header"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "0.75rem" }}
            >
              Everything You Need for Campus Events
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 520, margin: "0 auto" }}>
              A complete ecosystem for students, organizers, and campus administrators.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: "1.75rem" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: `${feature.color}1a`,
                    border: `1px solid ${feature.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <feature.icon size={20} color={feature.color} />
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section style={{ padding: "2rem 1.5rem 6rem" }}>
        <div
          className="page-container"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "var(--radius-xl)",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <h2
            className="section-header"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", marginBottom: "1rem" }}
          >
            Ready to Transform Your Campus Experience?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              maxWidth: 480,
              margin: "0 auto 2rem",
            }}
          >
            Join thousands of students discovering events that match their passions.
          </p>
          <Link
            href="/sign-up"
            className="btn-primary"
            style={{
              textDecoration: "none",
              fontSize: "1rem",
              padding: "0.8rem 2.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Join CampusPulseAI Free
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        © 2026 CampusPulseAI. Built with ❤️ using Next.js, Convex, Clerk, and Gemini AI.
      </footer>
    </div>
  );
}
